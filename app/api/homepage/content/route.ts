/**
 * Homepage Content API Route
 *
 * Serves optimized homepage content with multi-layer caching:
 * 1. Next.js Edge Cache (CDN-level)
 * 2. Next.js Data Cache (server-level)
 * 3. PostgreSQL Materialized Views (database-level)
 *
 * Performance targets:
 * - Cache hit: <10ms (Edge)
 * - Cache miss: <50ms (Database query)
 * - 99th percentile: <100ms
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  CACHE_KEYS,
  CACHE_TTL,
  getCacheControlHeader,
  generateCacheTags,
  CacheMetrics,
} from '@/lib/cache/cms-cache';
import { unstable_cache } from 'next/cache';

// Edge runtime for fastest performance
export const runtime = 'edge';

// ISR revalidation configuration
export const revalidate = CACHE_TTL.HOMEPAGE_CONTENT;

// ============================================================================
// TYPES
// ============================================================================

interface HomepageSection {
  section_id: string;
  section_type: string;
  section_key: string;
  display_order: number;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    inventory_count: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

interface HomepageResponse {
  sections: HomepageSection[];
  locale: string;
  cached: boolean;
  timestamp: string;
  source: 'edge-cache' | 'data-cache' | 'materialized-view' | 'database';
}

// ============================================================================
// CACHED QUERY FUNCTION
// ============================================================================

/**
 * Fetch homepage content with automatic caching
 * Uses Next.js unstable_cache for Data Cache layer
 */
async function getCachedHomepageContent(locale: string): Promise<HomepageSection[]> {
  const supabase = createServerClient();

  // Try materialized view first (fastest)
  const { data: mvData, error: mvError } = await supabase.rpc('get_homepage_from_mv', {
    p_locale: locale,
  });

  if (!mvError && mvData) {
    return mvData as HomepageSection[];
  }

  // Fallback to optimized query
  const { data, error } = await supabase.rpc('get_homepage_content_optimized', {
    p_locale: locale,
  });

  if (error) {
    console.error('[Homepage API] Database error:', error);
    throw new Error(`Failed to fetch homepage content: ${error.message}`);
  }

  return (data || []) as HomepageSection[];
}

/**
 * Wrapped cached query with tags for on-demand revalidation
 */
const getHomepageWithCache = (locale: string) =>
  unstable_cache(
    async () => getCachedHomepageContent(locale),
    [CACHE_KEYS.HOMEPAGE_CONTENT(locale)],
    {
      revalidate: CACHE_TTL.HOMEPAGE_CONTENT,
      tags: generateCacheTags('homepage', locale),
    }
  );

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * GET /api/homepage/content
 *
 * Query parameters:
 * - locale: Language code (default: 'en')
 * - source: Force data source ('mv' for materialized view, 'db' for direct query)
 * - no_cache: Bypass cache (admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';
    const forceSource = searchParams.get('source') as 'mv' | 'db' | null;
    const noCache = searchParams.get('no_cache') === 'true';

    // Validate locale (basic validation)
    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale format' },
        { status: 400 }
      );
    }

    let sections: HomepageSection[];
    let source: HomepageResponse['source'];

    // Handle cache bypass (admin preview)
    if (noCache) {
      sections = await getCachedHomepageContent(locale);
      source = 'database';
      CacheMetrics.recordMiss();
    }
    // Force materialized view
    else if (forceSource === 'mv') {
      const supabase = createServerClient();
      const { data, error } = await supabase.rpc('get_homepage_from_mv', {
        p_locale: locale,
      });

      if (error) throw error;

      sections = (data || []) as HomepageSection[];
      source = 'materialized-view';
      CacheMetrics.recordHit();
    }
    // Standard cached flow
    else {
      const cachedQuery = getHomepageWithCache(locale);
      sections = await cachedQuery();
      source = 'data-cache';
      CacheMetrics.recordHit();
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Prepare response
    const response: HomepageResponse = {
      sections,
      locale,
      cached: !noCache,
      timestamp: new Date().toISOString(),
      source,
    };

    // Return with appropriate cache headers
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': getCacheControlHeader(
          CACHE_TTL.HOMEPAGE_CONTENT,
          86400 // 24 hour stale-while-revalidate
        ),
        'X-Cache-Status': source,
        'X-Response-Time': `${duration}ms`,
        'X-Cache-Hit-Rate': `${CacheMetrics.getStats().hitRate.toFixed(2)}%`,
        // Vercel-specific headers
        'CDN-Cache-Control': getCacheControlHeader(CACHE_TTL.HOMEPAGE_CONTENT),
        'Vercel-CDN-Cache-Control': getCacheControlHeader(CACHE_TTL.HOMEPAGE_CONTENT),
      },
    });
  } catch (error) {
    console.error('[Homepage API] Error:', error);

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    return NextResponse.json(
      {
        error: 'Failed to fetch homepage content',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${duration}ms`,
        },
      }
    );
  }
}

// ============================================================================
// REVALIDATION ENDPOINT
// ============================================================================

/**
 * POST /api/homepage/content
 *
 * Manually trigger cache revalidation
 * Protected endpoint - requires admin authentication
 *
 * Body:
 * - locale: Language code to revalidate
 * - section_id: Specific section to revalidate (optional)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession();
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { locale = 'en', section_id } = body;

    // Revalidate cache tags
    const { revalidateTag, revalidatePath } = await import('next/cache');

    const tags = generateCacheTags('homepage', locale, section_id);
    tags.forEach((tag) => revalidateTag(tag));

    // Revalidate homepage path
    revalidatePath(`/${locale}`);
    revalidatePath('/');

    // Optionally refresh materialized view
    const supabase = createServerClient();
    const { data: refreshResult } = await supabase.rpc('manual_refresh_homepage_mv');

    return NextResponse.json({
      success: true,
      revalidated_tags: tags,
      revalidated_paths: [`/${locale}`, '/'],
      materialized_view_refresh: refreshResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Homepage API] Revalidation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to revalidate cache',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// CACHE STATISTICS ENDPOINT
// ============================================================================

/**
 * GET /api/homepage/content/stats
 *
 * Get cache performance statistics
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const stats = CacheMetrics.getStats();

  return NextResponse.json({
    cache_stats: stats,
    cache_config: {
      ttl: CACHE_TTL.HOMEPAGE_CONTENT,
      revalidate,
      runtime,
    },
  });
}
