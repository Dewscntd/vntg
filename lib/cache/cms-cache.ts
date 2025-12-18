/**
 * Homepage CMS Caching Layer
 *
 * Implements application-level caching strategy for CMS content
 * with cache invalidation, TTL management, and cache key generation.
 *
 * Strategy:
 * - Public content: Long TTL (1 hour), invalidate on publish
 * - Admin content: Short TTL (5 minutes)
 * - Edge caching: Vercel Edge Cache + stale-while-revalidate
 */

import { unstable_cache } from 'next/cache';

// ============================================================================
// CACHE KEY PATTERNS
// ============================================================================

export const CACHE_KEYS = {
  // Homepage content by locale (most critical)
  HOMEPAGE_CONTENT: (locale: string) => `homepage:content:${locale}:v2`,

  // Section detail
  SECTION_DETAIL: (sectionId: string) => `section:${sectionId}:detail`,

  // Section with products/categories
  SECTION_FULL: (sectionId: string, version: number) =>
    `section:${sectionId}:v${version}:full`,

  // Admin section list
  ADMIN_SECTIONS: (locale: string, status?: string) =>
    `admin:sections:${locale}:${status || 'all'}`,

  // Version history (paginated)
  VERSION_HISTORY: (sectionId: string, page: number) =>
    `section:${sectionId}:versions:page${page}`,

  // Scheduled sections
  SCHEDULED_SECTIONS: () => `sections:scheduled:active`,

  // Media assets
  MEDIA_ASSET: (assetId: string) => `media:${assetId}`,
} as const;

// ============================================================================
// CACHE TTL CONFIGURATION
// ============================================================================

export const CACHE_TTL = {
  // Public content (long cache, invalidate on publish)
  HOMEPAGE_CONTENT: 3600, // 1 hour
  SECTION_DETAIL: 3600, // 1 hour
  SECTION_FULL: 3600, // 1 hour
  MEDIA_ASSET: 86400, // 24 hours

  // Admin content (short cache for fresh data)
  ADMIN_SECTIONS: 300, // 5 minutes
  VERSION_HISTORY: 300, // 5 minutes

  // Dynamic content
  SCHEDULED_SECTIONS: 60, // 1 minute
} as const;

// ============================================================================
// CACHE INVALIDATION PATTERNS
// ============================================================================

export const INVALIDATION_TRIGGERS = {
  // When section is published
  onSectionPublish: (sectionId: string, locale: string) => [
    CACHE_KEYS.HOMEPAGE_CONTENT(locale),
    CACHE_KEYS.SECTION_DETAIL(sectionId),
    CACHE_KEYS.ADMIN_SECTIONS(locale),
  ],

  // When section is updated (draft)
  onSectionUpdate: (sectionId: string, locale: string) => [
    CACHE_KEYS.ADMIN_SECTIONS(locale),
    CACHE_KEYS.ADMIN_SECTIONS(locale, 'draft'),
  ],

  // When section order changes
  onSectionReorder: (locale: string) => [
    CACHE_KEYS.HOMEPAGE_CONTENT(locale),
    CACHE_KEYS.ADMIN_SECTIONS(locale),
  ],

  // When products are updated
  onProductUpdate: (productId: string, locale: string) => [
    CACHE_KEYS.HOMEPAGE_CONTENT(locale), // May affect carousels
  ],

  // When schedule executes
  onScheduleExecute: (locale: string) => [
    CACHE_KEYS.HOMEPAGE_CONTENT(locale),
    CACHE_KEYS.SCHEDULED_SECTIONS(),
  ],
} as const;

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Generate cache tags for Next.js revalidation
 */
export function generateCacheTags(
  type: 'homepage' | 'section' | 'admin',
  locale?: string,
  sectionId?: string
): string[] {
  const tags: string[] = [type];

  if (locale) {
    tags.push(`${type}:${locale}`);
  }

  if (sectionId) {
    tags.push(`section:${sectionId}`);
  }

  return tags;
}

/**
 * Generate Cache-Control header for API responses
 */
export function getCacheControlHeader(
  ttl: number,
  staleWhileRevalidate: number = 86400
): string {
  return `public, s-maxage=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`;
}

// ============================================================================
// CACHED QUERY WRAPPERS
// ============================================================================

type CacheOptions = {
  revalidate?: number;
  tags?: string[];
};

/**
 * Create a cached version of a database query
 *
 * @example
 * const getHomepage = createCachedQuery(
 *   'homepage:en',
 *   async () => supabase.rpc('get_homepage_content_optimized'),
 *   { revalidate: 3600, tags: ['homepage', 'homepage:en'] }
 * );
 */
export function createCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
): () => Promise<T> {
  return unstable_cache(queryFn, [key], {
    revalidate: options.revalidate,
    tags: options.tags,
  });
}

// ============================================================================
// CACHE INVALIDATION FUNCTIONS
// ============================================================================

/**
 * Invalidate cache by tag
 * Uses Next.js revalidateTag() for on-demand ISR
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(tag);
}

/**
 * Invalidate multiple cache tags
 */
export async function invalidateCacheTags(tags: string[]): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  tags.forEach((tag) => revalidateTag(tag));
}

/**
 * Invalidate cache by path
 * Uses Next.js revalidatePath() for route-based invalidation
 */
export async function invalidateCacheByPath(path: string): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  revalidatePath(path);
}

/**
 * Handle section publish event - invalidate all related caches
 */
export async function handleSectionPublishCache(
  sectionId: string,
  locale: string
): Promise<void> {
  const tags = [
    `homepage:${locale}`,
    `section:${sectionId}`,
    `admin:${locale}`,
  ];

  await invalidateCacheTags(tags);

  // Also invalidate homepage path
  await invalidateCacheByPath(`/${locale}`);
  await invalidateCacheByPath(`/`);
}

/**
 * Handle section update event (draft) - invalidate admin caches only
 */
export async function handleSectionUpdateCache(
  sectionId: string,
  locale: string
): Promise<void> {
  const tags = [`admin:${locale}`, `section:${sectionId}`];
  await invalidateCacheTags(tags);
}

/**
 * Handle section reorder - invalidate homepage and admin
 */
export async function handleSectionReorderCache(locale: string): Promise<void> {
  const tags = [`homepage:${locale}`, `admin:${locale}`];
  await invalidateCacheTags(tags);
  await invalidateCacheByPath(`/${locale}`);
}

// ============================================================================
// SUPABASE REALTIME INTEGRATION
// ============================================================================

/**
 * Subscribe to database cache invalidation events
 * Listens to PostgreSQL NOTIFY events from cache invalidation triggers
 *
 * @example
 * // In a server component or API route
 * subscribeToInvalidationEvents((event) => {
 *   console.log('Cache invalidation event:', event);
 * });
 */
export function subscribeToInvalidationEvents(
  callback: (event: {
    table: string;
    operation: string;
    section_id: string;
    locale: string;
    timestamp: string;
  }) => void
): void {
  // This would be implemented in a long-running process or Edge function
  // Using Supabase Realtime or pg_notify subscription

  // Example implementation:
  // const supabase = createClient(...);
  // supabase
  //   .channel('cache_invalidate')
  //   .on('postgres_changes', { event: '*', schema: 'public' }, callback)
  //   .subscribe();
}

// ============================================================================
// CACHE MONITORING
// ============================================================================

/**
 * Cache hit/miss tracking for monitoring
 */
export class CacheMetrics {
  private static hits = 0;
  private static misses = 0;

  static recordHit(): void {
    this.hits++;
  }

  static recordMiss(): void {
    this.misses++;
  }

  static getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
    };
  }

  static reset(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

// ============================================================================
// CACHE WARMING
// ============================================================================

/**
 * Pre-warm cache for critical pages
 * Should be called after deployments or cache purges
 */
export async function warmCriticalCaches(locales: string[] = ['en']): Promise<void> {
  const { createServerClient } = await import('@/lib/supabase/server');

  for (const locale of locales) {
    try {
      const supabase = createServerClient();

      // Warm homepage cache
      await supabase.rpc('get_homepage_content_optimized', {
        p_locale: locale,
      });

      console.log(`[Cache Warm] Homepage cache warmed for locale: ${locale}`);
    } catch (error) {
      console.error(
        `[Cache Warm] Failed to warm cache for locale ${locale}:`,
        error
      );
    }
  }
}

// ============================================================================
// EDGE CACHE CONFIGURATION
// ============================================================================

/**
 * Next.js Segment Config for optimal caching
 */
export const homepageSegmentConfig = {
  revalidate: CACHE_TTL.HOMEPAGE_CONTENT, // ISR revalidation
  runtime: 'edge', // Edge runtime for faster response
  // unstable_cache tags for on-demand revalidation
} as const;

export const adminSegmentConfig = {
  revalidate: CACHE_TTL.ADMIN_SECTIONS,
  runtime: 'nodejs', // Node runtime for admin (needs full features)
} as const;
