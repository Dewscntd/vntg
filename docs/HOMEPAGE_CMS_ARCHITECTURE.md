# Homepage CMS Architecture

## Executive Summary

This document outlines a production-ready, scalable homepage content management system designed to handle millions of users with sub-100ms page loads. The architecture leverages PostgreSQL (Supabase), Next.js 15 App Router, and multi-tier caching strategies.

**Performance Targets:**
- Homepage load: <100ms (cached), <500ms (cold)
- Admin CMS operations: <200ms
- Cache invalidation propagation: <5s globally
- Support: 10M+ daily users, 100K+ concurrent requests

---

## 1. Database Schema Design

### 1.1 Core Tables

```sql
-- ============================================================================
-- HOMEPAGE SECTIONS
-- Manages the homepage layout and section ordering
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ordering and visibility
  position INTEGER NOT NULL, -- 0-indexed, determines display order
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Section identification
  section_type TEXT NOT NULL CHECK (section_type IN (
    'hero_banner',
    'product_carousel',
    'category_grid',
    'text_block',
    'promotional_banner',
    'custom_html',
    'announcement_bar',
    'video_section',
    'testimonials',
    'newsletter_signup'
  )),

  -- Metadata
  internal_name TEXT NOT NULL, -- Admin-friendly name: "Holiday 2025 Hero"
  section_key TEXT UNIQUE, -- Optional stable key for programmatic access

  -- Localization
  locale TEXT DEFAULT 'he' CHECK (locale IN ('en', 'he')),

  -- Scheduling
  publish_at TIMESTAMP WITH TIME ZONE,
  expire_at TIMESTAMP WITH TIME ZONE,

  -- Draft/version control
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  version INTEGER DEFAULT 1 NOT NULL,
  parent_version_id UUID REFERENCES public.homepage_sections(id) ON DELETE SET NULL,

  -- Configuration (section-specific settings stored as JSONB for flexibility)
  config JSONB DEFAULT '{}'::jsonb NOT NULL,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,

  -- Audit fields
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_schedule CHECK (
    expire_at IS NULL OR
    publish_at IS NULL OR
    expire_at > publish_at
  ),
  CONSTRAINT unique_position_per_locale UNIQUE (position, locale, status)
    WHERE status = 'published'
);

-- ============================================================================
-- SECTION CONTENT
-- Stores the actual content for each section with versioning
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.section_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,

  -- Content fields
  title TEXT,
  subtitle TEXT,
  body_text TEXT,
  cta_text TEXT,
  cta_url TEXT,

  -- Media references
  primary_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  secondary_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,

  -- Product associations (for carousels)
  product_ids UUID[] DEFAULT '{}', -- Array of product UUIDs

  -- Category associations (for category grids)
  category_ids UUID[] DEFAULT '{}',

  -- Custom HTML (sanitized, XSS-protected)
  custom_html TEXT,

  -- Flexible metadata for different section types
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,

  -- Localization
  locale TEXT DEFAULT 'he' NOT NULL CHECK (locale IN ('en', 'he')),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Ensure one content per section per locale
  CONSTRAINT unique_section_locale UNIQUE (section_id, locale)
);

-- ============================================================================
-- MEDIA ASSETS
-- Centralized media management with CDN integration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File information
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'gif')),
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,

  -- Storage paths
  storage_path TEXT NOT NULL, -- Supabase storage path
  cdn_url TEXT, -- CDN URL after processing

  -- Image-specific fields
  width INTEGER,
  height INTEGER,
  blurhash TEXT, -- For lazy loading placeholders

  -- Video-specific fields
  duration_seconds INTEGER,
  thumbnail_url TEXT,

  -- Optimization metadata
  is_optimized BOOLEAN DEFAULT false,
  optimization_config JSONB DEFAULT '{}'::jsonb,

  -- Responsive variants (generated automatically)
  variants JSONB DEFAULT '{}'::jsonb, -- { "thumbnail": "url", "medium": "url", "large": "url" }

  -- Usage tracking
  used_in_sections UUID[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,

  -- SEO
  alt_text TEXT,
  caption TEXT,

  -- Audit
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PRODUCT CAROUSEL RULES
-- Dynamic product selection based on rules instead of manual curation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.carousel_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,

  -- Rule configuration
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'manual_selection',     -- Manually curated product_ids
    'category_based',       -- Products from specific categories
    'featured_products',    -- is_featured = true
    'new_arrivals',         -- Recent created_at
    'best_sellers',         -- Highest order count
    'discounted',           -- Has active discount
    'low_stock',            -- inventory_count below threshold
    'custom_query'          -- Custom SQL WHERE clause
  )),

  -- Rule parameters (JSONB for flexibility)
  parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
  -- Examples:
  -- { "category_ids": ["uuid1", "uuid2"], "limit": 10 }
  -- { "min_discount": 20, "sort_by": "discount_percent" }
  -- { "custom_where": "price > 100 AND inventory_count > 0" }

  -- Caching
  cache_duration_minutes INTEGER DEFAULT 15,
  last_cached_at TIMESTAMP WITH TIME ZONE,
  cached_product_ids UUID[], -- Cache results for performance

  -- Fallback
  fallback_product_ids UUID[] DEFAULT '{}', -- Used if rule returns empty

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_rule_per_section UNIQUE (section_id)
);

-- ============================================================================
-- SECTION ANALYTICS
-- Time-series analytics for A/B testing and performance tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.section_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,

  -- Event tracking
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'conversion')),
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Session information
  session_id TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Context
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  user_agent TEXT,
  referrer TEXT,

  -- Performance metrics
  render_time_ms INTEGER,
  interaction_time_ms INTEGER,

  -- A/B testing
  variant_id TEXT, -- For testing different section configurations

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- SECTION CHANGE HISTORY
-- Audit trail for compliance and rollback capability
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.section_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,

  -- Change metadata
  change_type TEXT NOT NULL CHECK (change_type IN (
    'created', 'updated', 'published', 'unpublished', 'archived', 'deleted'
  )),

  -- Snapshot of section state before change
  previous_state JSONB,
  new_state JSONB,

  -- Change details
  changed_fields TEXT[], -- ["title", "publish_at"]
  change_reason TEXT,

  -- User tracking
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- IP and session for security audit
  ip_address INET,
  user_agent TEXT
);
```

### 1.2 Indexes for Performance

```sql
-- ============================================================================
-- PERFORMANCE INDEXES
-- Optimized for common query patterns
-- ============================================================================

-- Homepage sections - Primary query: fetch published sections by position
CREATE INDEX idx_homepage_sections_active_position
  ON public.homepage_sections(position, locale)
  WHERE status = 'published' AND is_active = true;

-- Scheduled sections - For background job to publish/expire
CREATE INDEX idx_homepage_sections_scheduled
  ON public.homepage_sections(publish_at, expire_at)
  WHERE status = 'scheduled';

-- Section content - Lookup by section and locale
CREATE INDEX idx_section_content_section_locale
  ON public.section_content(section_id, locale);

-- Media assets - Used for admin search
CREATE INDEX idx_media_assets_type_created
  ON public.media_assets(file_type, created_at DESC);

-- Media assets - Full-text search on filenames
CREATE INDEX idx_media_assets_filename_search
  ON public.media_assets USING gin(to_tsvector('english', filename || ' ' || COALESCE(alt_text, '')));

-- Section analytics - Time-series queries
CREATE INDEX idx_section_analytics_section_time
  ON public.section_analytics(section_id, event_timestamp DESC);

CREATE INDEX idx_section_analytics_event_time
  ON public.section_analytics(event_type, event_timestamp DESC);

-- Change history - Audit queries
CREATE INDEX idx_section_history_section_time
  ON public.section_change_history(section_id, changed_at DESC);

-- Carousel rules - Cache invalidation checks
CREATE INDEX idx_carousel_rules_cache
  ON public.carousel_rules(last_cached_at)
  WHERE cache_duration_minutes IS NOT NULL;
```

### 1.3 Database Functions

```sql
-- ============================================================================
-- GET PUBLISHED HOMEPAGE SECTIONS
-- Optimized function to fetch all active homepage sections with content
-- ============================================================================
CREATE OR REPLACE FUNCTION get_published_homepage(p_locale TEXT DEFAULT 'he')
RETURNS TABLE (
  section_id UUID,
  position INTEGER,
  section_type TEXT,
  internal_name TEXT,
  config JSONB,
  title TEXT,
  subtitle TEXT,
  body_text TEXT,
  cta_text TEXT,
  cta_url TEXT,
  custom_html TEXT,
  metadata JSONB,
  primary_media_url TEXT,
  secondary_media_url TEXT,
  product_ids UUID[],
  category_ids UUID[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hs.id as section_id,
    hs.position,
    hs.section_type,
    hs.internal_name,
    hs.config,
    sc.title,
    sc.subtitle,
    sc.body_text,
    sc.cta_text,
    sc.cta_url,
    sc.custom_html,
    sc.metadata,
    ma1.cdn_url as primary_media_url,
    ma2.cdn_url as secondary_media_url,
    sc.product_ids,
    sc.category_ids
  FROM
    public.homepage_sections hs
  LEFT JOIN
    public.section_content sc ON hs.id = sc.section_id AND sc.locale = p_locale
  LEFT JOIN
    public.media_assets ma1 ON sc.primary_media_id = ma1.id
  LEFT JOIN
    public.media_assets ma2 ON sc.secondary_media_id = ma2.id
  WHERE
    hs.status = 'published'
    AND hs.is_active = true
    AND hs.locale = p_locale
    AND (hs.publish_at IS NULL OR hs.publish_at <= NOW())
    AND (hs.expire_at IS NULL OR hs.expire_at > NOW())
  ORDER BY
    hs.position ASC;
END;
$$;

-- ============================================================================
-- RESOLVE CAROUSEL PRODUCTS
-- Executes carousel rules and returns product IDs
-- ============================================================================
CREATE OR REPLACE FUNCTION resolve_carousel_products(p_section_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_rule RECORD;
  v_product_ids UUID[];
  v_cache_valid BOOLEAN;
BEGIN
  -- Get the carousel rule
  SELECT * INTO v_rule
  FROM public.carousel_rules
  WHERE section_id = p_section_id;

  -- Return empty if no rule exists
  IF NOT FOUND THEN
    RETURN '{}';
  END IF;

  -- Check if cache is valid
  v_cache_valid := (
    v_rule.last_cached_at IS NOT NULL
    AND v_rule.cached_product_ids IS NOT NULL
    AND v_rule.cache_duration_minutes IS NOT NULL
    AND (EXTRACT(EPOCH FROM (NOW() - v_rule.last_cached_at)) / 60) < v_rule.cache_duration_minutes
  );

  -- Return cached results if valid
  IF v_cache_valid THEN
    RETURN v_rule.cached_product_ids;
  END IF;

  -- Execute rule based on type
  CASE v_rule.rule_type
    WHEN 'manual_selection' THEN
      -- Get manually selected products from section_content
      SELECT product_ids INTO v_product_ids
      FROM section_content
      WHERE section_id = p_section_id
      LIMIT 1;

    WHEN 'featured_products' THEN
      SELECT ARRAY_AGG(id ORDER BY created_at DESC) INTO v_product_ids
      FROM products
      WHERE is_featured = true
        AND inventory_count > 0
      LIMIT COALESCE((v_rule.parameters->>'limit')::INTEGER, 10);

    WHEN 'new_arrivals' THEN
      SELECT ARRAY_AGG(id ORDER BY created_at DESC) INTO v_product_ids
      FROM products
      WHERE inventory_count > 0
      LIMIT COALESCE((v_rule.parameters->>'limit')::INTEGER, 10);

    WHEN 'category_based' THEN
      SELECT ARRAY_AGG(id ORDER BY created_at DESC) INTO v_product_ids
      FROM products
      WHERE category_id = ANY((v_rule.parameters->>'category_ids')::UUID[])
        AND inventory_count > 0
      LIMIT COALESCE((v_rule.parameters->>'limit')::INTEGER, 10);

    WHEN 'discounted' THEN
      SELECT ARRAY_AGG(id ORDER BY discount_percent DESC NULLS LAST) INTO v_product_ids
      FROM products
      WHERE discount_percent IS NOT NULL
        AND discount_percent >= COALESCE((v_rule.parameters->>'min_discount')::DECIMAL, 0)
        AND inventory_count > 0
      LIMIT COALESCE((v_rule.parameters->>'limit')::INTEGER, 10);

    ELSE
      -- Fallback to manual selection
      v_product_ids := v_rule.fallback_product_ids;
  END CASE;

  -- Use fallback if empty
  IF v_product_ids IS NULL OR ARRAY_LENGTH(v_product_ids, 1) IS NULL THEN
    v_product_ids := v_rule.fallback_product_ids;
  END IF;

  -- Update cache
  UPDATE public.carousel_rules
  SET
    cached_product_ids = v_product_ids,
    last_cached_at = NOW(),
    updated_at = NOW()
  WHERE id = v_rule.id;

  RETURN v_product_ids;
END;
$$;

-- ============================================================================
-- PUBLISH SCHEDULED SECTIONS
-- Background job function to auto-publish/expire sections
-- ============================================================================
CREATE OR REPLACE FUNCTION publish_scheduled_sections()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_published_count INTEGER := 0;
  v_expired_count INTEGER := 0;
BEGIN
  -- Publish scheduled sections
  UPDATE public.homepage_sections
  SET
    status = 'published',
    updated_at = NOW()
  WHERE
    status = 'scheduled'
    AND publish_at IS NOT NULL
    AND publish_at <= NOW();

  GET DIAGNOSTICS v_published_count = ROW_COUNT;

  -- Expire published sections
  UPDATE public.homepage_sections
  SET
    status = 'archived',
    is_active = false,
    updated_at = NOW()
  WHERE
    status = 'published'
    AND expire_at IS NOT NULL
    AND expire_at <= NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN v_published_count + v_expired_count;
END;
$$;

-- ============================================================================
-- LOG SECTION CHANGE
-- Automatically log changes to section_change_history
-- ============================================================================
CREATE OR REPLACE FUNCTION log_section_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_change_type TEXT;
  v_changed_fields TEXT[] := '{}';
  v_field TEXT;
BEGIN
  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    v_change_type := 'created';
  ELSIF TG_OP = 'DELETE' THEN
    v_change_type := 'deleted';
  ELSIF OLD.status != NEW.status THEN
    v_change_type := NEW.status;
  ELSE
    v_change_type := 'updated';
  END IF;

  -- Detect changed fields (for UPDATE)
  IF TG_OP = 'UPDATE' THEN
    FOR v_field IN
      SELECT column_name::TEXT
      FROM information_schema.columns
      WHERE table_name = 'homepage_sections'
        AND table_schema = 'public'
    LOOP
      EXECUTE format('SELECT ($1).%I != ($2).%I', v_field, v_field)
      INTO STRICT v_changed_fields[ARRAY_LENGTH(v_changed_fields, 1) + 1]
      USING OLD, NEW;
    END LOOP;
  END IF;

  -- Insert change log
  INSERT INTO public.section_change_history (
    section_id,
    change_type,
    previous_state,
    new_state,
    changed_fields,
    changed_by,
    changed_at
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    v_change_type,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
    v_changed_fields,
    COALESCE(NEW.updated_by, OLD.updated_by),
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_log_section_changes ON public.homepage_sections;
CREATE TRIGGER trg_log_section_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION log_section_change();
```

### 1.4 Row-Level Security (RLS)

```sql
-- ============================================================================
-- RLS POLICIES
-- Secure access control for CMS
-- ============================================================================

-- Enable RLS
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_change_history ENABLE ROW LEVEL SECURITY;

-- Homepage sections - Public read for published, admin full access
CREATE POLICY "Published sections viewable by everyone"
  ON public.homepage_sections
  FOR SELECT
  USING (
    status = 'published'
    AND is_active = true
    AND (publish_at IS NULL OR publish_at <= NOW())
    AND (expire_at IS NULL OR expire_at > NOW())
  );

CREATE POLICY "Admins have full access to sections"
  ON public.homepage_sections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Section content - Follows section visibility
CREATE POLICY "Section content viewable with section"
  ON public.section_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.homepage_sections hs
      WHERE hs.id = section_content.section_id
        AND hs.status = 'published'
        AND hs.is_active = true
    )
  );

CREATE POLICY "Admins have full access to content"
  ON public.section_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Media assets - Public read, admin write
CREATE POLICY "Media assets viewable by everyone"
  ON public.media_assets
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage media"
  ON public.media_assets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Analytics - Insert by anyone, read by admins
CREATE POLICY "Anyone can insert analytics"
  ON public.section_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON public.section_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Change history - Read-only for admins
CREATE POLICY "Admins can view change history"
  ON public.section_change_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

---

## 2. API Design

### 2.1 RESTful Endpoints

```typescript
// ============================================================================
// API ROUTES STRUCTURE
// /app/[locale]/api/cms/...
// ============================================================================

/**
 * GET /api/cms/homepage
 * Fetch published homepage sections (PUBLIC)
 *
 * Query Parameters:
 * - locale: string (default: 'he')
 * - preview: boolean (admin only, shows draft content)
 *
 * Response: 200 OK
 * {
 *   sections: HomepageSection[],
 *   metadata: {
 *     locale: string,
 *     cachedAt: string,
 *     ttl: number
 *   }
 * }
 */

/**
 * GET /api/cms/sections
 * List all sections (ADMIN ONLY)
 *
 * Query Parameters:
 * - status: 'draft' | 'scheduled' | 'published' | 'archived'
 * - locale: string
 * - page: number
 * - limit: number
 *
 * Response: 200 OK
 * {
 *   sections: Section[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 */

/**
 * POST /api/cms/sections
 * Create new section (ADMIN ONLY)
 *
 * Body: SectionCreateInput
 * {
 *   section_type: SectionType,
 *   internal_name: string,
 *   locale: string,
 *   position: number,
 *   config: object,
 *   content: {
 *     title?: string,
 *     subtitle?: string,
 *     body_text?: string,
 *     cta_text?: string,
 *     cta_url?: string,
 *     product_ids?: string[],
 *     category_ids?: string[]
 *   }
 * }
 *
 * Response: 201 Created
 */

/**
 * GET /api/cms/sections/:id
 * Get section details (ADMIN ONLY)
 *
 * Response: 200 OK
 * {
 *   section: Section,
 *   content: SectionContent,
 *   analytics: {
 *     views: number,
 *     clicks: number,
 *     conversions: number,
 *     ctr: number
 *   }
 * }
 */

/**
 * PATCH /api/cms/sections/:id
 * Update section (ADMIN ONLY)
 *
 * Body: Partial<SectionUpdateInput>
 *
 * Response: 200 OK
 */

/**
 * DELETE /api/cms/sections/:id
 * Delete section (ADMIN ONLY)
 *
 * Response: 204 No Content
 */

/**
 * POST /api/cms/sections/:id/publish
 * Publish a draft section (ADMIN ONLY)
 *
 * Body: { publish_at?: string, expire_at?: string }
 *
 * Response: 200 OK
 */

/**
 * POST /api/cms/sections/:id/unpublish
 * Unpublish a section (ADMIN ONLY)
 *
 * Response: 200 OK
 */

/**
 * POST /api/cms/sections/:id/duplicate
 * Duplicate a section (ADMIN ONLY)
 *
 * Body: { internal_name: string, locale?: string }
 *
 * Response: 201 Created
 */

/**
 * POST /api/cms/sections/reorder
 * Reorder sections (ADMIN ONLY)
 *
 * Body: {
 *   sections: Array<{ id: string, position: number }>
 * }
 *
 * Response: 200 OK
 */

/**
 * POST /api/cms/sections/bulk-publish
 * Publish multiple sections (ADMIN ONLY)
 *
 * Body: {
 *   section_ids: string[],
 *   publish_at?: string
 * }
 *
 * Response: 200 OK
 */

/**
 * POST /api/cms/media/upload
 * Upload media asset (ADMIN ONLY)
 *
 * Body: FormData with file
 *
 * Response: 201 Created
 * {
 *   asset: MediaAsset,
 *   variants: {
 *     thumbnail: string,
 *     medium: string,
 *     large: string,
 *     original: string
 *   }
 * }
 */

/**
 * GET /api/cms/media
 * List media assets (ADMIN ONLY)
 *
 * Query Parameters:
 * - file_type: 'image' | 'video' | 'gif'
 * - search: string
 * - page: number
 * - limit: number
 *
 * Response: 200 OK
 */

/**
 * DELETE /api/cms/media/:id
 * Delete media asset (ADMIN ONLY)
 *
 * Response: 204 No Content
 */

/**
 * POST /api/cms/analytics/track
 * Track section interaction (PUBLIC)
 *
 * Body: {
 *   section_id: string,
 *   event_type: 'view' | 'click' | 'conversion',
 *   session_id: string,
 *   metadata?: object
 * }
 *
 * Response: 202 Accepted
 */

/**
 * GET /api/cms/analytics/sections/:id
 * Get section analytics (ADMIN ONLY)
 *
 * Query Parameters:
 * - start_date: string (ISO 8601)
 * - end_date: string (ISO 8601)
 * - granularity: 'hour' | 'day' | 'week' | 'month'
 *
 * Response: 200 OK
 * {
 *   metrics: {
 *     views: number,
 *     clicks: number,
 *     conversions: number,
 *     ctr: number,
 *     conversion_rate: number
 *   },
 *   timeseries: Array<{
 *     timestamp: string,
 *     views: number,
 *     clicks: number,
 *     conversions: number
 *   }>
 * }
 */

/**
 * POST /api/cms/cache/invalidate
 * Invalidate homepage cache (ADMIN ONLY)
 *
 * Body: {
 *   locale?: string, // If not provided, invalidates all locales
 *   purge_cdn?: boolean // Also purge CDN cache
 * }
 *
 * Response: 200 OK
 */
```

### 2.2 API Implementation Example

```typescript
// /app/[locale]/api/cms/homepage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cacheHomepage, getCachedHomepage } from '@/lib/cms/cache';
import { USE_STUBS } from '@/lib/stubs';
import { getHomepageStub } from '@/lib/stubs/cms-stubs';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // ISR: Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'he';
    const preview = searchParams.get('preview') === 'true';

    // Return stub data if enabled
    if (USE_STUBS) {
      return NextResponse.json(getHomepageStub(locale), {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      });
    }

    // Check cache first (unless preview mode)
    if (!preview) {
      const cached = await getCachedHomepage(locale);
      if (cached) {
        return NextResponse.json(cached, {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            'X-Cache': 'HIT'
          }
        });
      }
    }

    // Fetch from database
    const supabase = createClient();
    const { data: sections, error } = await supabase
      .rpc('get_published_homepage', { p_locale: locale });

    if (error) {
      console.error('Error fetching homepage:', error);
      return NextResponse.json(
        { error: 'Failed to load homepage content' },
        { status: 500 }
      );
    }

    // Resolve carousel products
    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        if (section.section_type === 'product_carousel') {
          const { data: productIds } = await supabase
            .rpc('resolve_carousel_products', { p_section_id: section.section_id });

          if (productIds && productIds.length > 0) {
            const { data: products } = await supabase
              .from('products')
              .select('id, name, price, image_url, inventory_count, discount_percent')
              .in('id', productIds)
              .order('created_at', { ascending: false });

            return { ...section, products };
          }
        }
        return section;
      })
    );

    const response = {
      sections: sectionsWithProducts,
      metadata: {
        locale,
        cachedAt: new Date().toISOString(),
        ttl: 60
      }
    };

    // Cache the response
    if (!preview) {
      await cacheHomepage(locale, response);
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Homepage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 3. Caching Strategy

### 3.1 Multi-Tier Caching Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  - Service Worker Cache (offline support)                    │
│  - Memory Cache (React Query/SWR)                           │
│  TTL: 5 minutes                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    CDN Layer (Cloudflare/Vercel)             │
│  - Edge caching (global POPs)                               │
│  - Stale-while-revalidate                                   │
│  TTL: 60 seconds, SWR: 120 seconds                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Cache (Redis)                 │
│  - Homepage sections by locale                              │
│  - Carousel product lists                                   │
│  - Media asset metadata                                     │
│  TTL: 5 minutes                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (Supabase/PostgreSQL)            │
│  - Source of truth                                          │
│  - Materialized views for analytics                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Cache Implementation

```typescript
// /lib/cms/cache.ts
import { Redis } from '@upstash/redis';
import { unstable_cache } from 'next/cache';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_KEYS = {
  homepage: (locale: string) => `homepage:${locale}`,
  section: (id: string) => `section:${id}`,
  carouselProducts: (sectionId: string) => `carousel:${sectionId}:products`,
  analytics: (sectionId: string, period: string) => `analytics:${sectionId}:${period}`,
} as const;

const CACHE_TTL = {
  homepage: 300, // 5 minutes
  section: 600, // 10 minutes
  carouselProducts: 900, // 15 minutes
  analytics: 3600, // 1 hour
} as const;

export async function getCachedHomepage(locale: string) {
  try {
    const key = CACHE_KEYS.homepage(locale);
    const cached = await redis.get(key);

    if (cached) {
      console.log(`[Cache] HIT: ${key}`);
      return cached;
    }

    console.log(`[Cache] MISS: ${key}`);
    return null;
  } catch (error) {
    console.error('[Cache] Error fetching from Redis:', error);
    return null;
  }
}

export async function cacheHomepage(locale: string, data: any) {
  try {
    const key = CACHE_KEYS.homepage(locale);
    await redis.setex(key, CACHE_TTL.homepage, JSON.stringify(data));
    console.log(`[Cache] SET: ${key} (TTL: ${CACHE_TTL.homepage}s)`);
  } catch (error) {
    console.error('[Cache] Error writing to Redis:', error);
  }
}

export async function invalidateHomepageCache(locale?: string) {
  try {
    if (locale) {
      // Invalidate specific locale
      const key = CACHE_KEYS.homepage(locale);
      await redis.del(key);
      console.log(`[Cache] INVALIDATE: ${key}`);
    } else {
      // Invalidate all locales
      const keys = await redis.keys('homepage:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[Cache] INVALIDATE: ${keys.length} homepage keys`);
      }
    }

    // Also trigger CDN purge
    await purgeCDNCache(locale);
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error);
  }
}

async function purgeCDNCache(locale?: string) {
  // Vercel Edge Config API
  if (process.env.VERCEL_API_TOKEN) {
    const paths = locale ? [`/${locale}`] : ['/en', '/he'];

    await fetch(`https://api.vercel.com/v1/purge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths }),
    });

    console.log(`[CDN] Purged paths: ${paths.join(', ')}`);
  }
}

// Next.js unstable_cache wrapper for server-side caching
export const getCachedSections = unstable_cache(
  async (locale: string) => {
    const supabase = createClient();
    const { data } = await supabase.rpc('get_published_homepage', { p_locale: locale });
    return data;
  },
  ['homepage-sections'],
  {
    revalidate: 60, // 60 seconds
    tags: ['homepage'],
  }
);
```

### 3.3 Cache Invalidation Strategies

```typescript
// /lib/cms/cache-invalidation.ts

export type CacheInvalidationEvent =
  | 'section_published'
  | 'section_unpublished'
  | 'section_updated'
  | 'section_deleted'
  | 'media_updated'
  | 'product_updated'
  | 'manual_purge';

export async function handleCacheInvalidation(
  event: CacheInvalidationEvent,
  metadata: {
    sectionId?: string;
    locale?: string;
    affectedSections?: string[];
  }
) {
  console.log(`[Cache Invalidation] Event: ${event}`, metadata);

  switch (event) {
    case 'section_published':
    case 'section_unpublished':
    case 'section_updated':
      // Invalidate homepage cache for affected locale
      await invalidateHomepageCache(metadata.locale);

      // Invalidate specific section cache
      if (metadata.sectionId) {
        await redis.del(CACHE_KEYS.section(metadata.sectionId));
      }
      break;

    case 'section_deleted':
      // Invalidate all related caches
      await invalidateHomepageCache(metadata.locale);
      if (metadata.sectionId) {
        await redis.del(CACHE_KEYS.section(metadata.sectionId));
        await redis.del(CACHE_KEYS.carouselProducts(metadata.sectionId));
      }
      break;

    case 'media_updated':
      // Invalidate all sections using this media
      if (metadata.affectedSections) {
        for (const sectionId of metadata.affectedSections) {
          await redis.del(CACHE_KEYS.section(sectionId));
        }
        // Invalidate homepage for all locales
        await invalidateHomepageCache();
      }
      break;

    case 'product_updated':
      // Invalidate carousel caches that might include this product
      const carouselKeys = await redis.keys('carousel:*:products');
      if (carouselKeys.length > 0) {
        await redis.del(...carouselKeys);
      }
      // Invalidate homepage
      await invalidateHomepageCache();
      break;

    case 'manual_purge':
      // Nuclear option - purge everything
      await invalidateHomepageCache();
      const allKeys = await redis.keys('homepage:*');
      if (allKeys.length > 0) {
        await redis.del(...allKeys);
      }
      break;
  }

  // Revalidate Next.js cache
  revalidateTag('homepage');
}
```

---

## 4. Performance Optimizations

### 4.1 Database Query Optimization

```sql
-- ============================================================================
-- MATERIALIZED VIEW FOR HOMEPAGE ANALYTICS
-- Pre-aggregated analytics for fast dashboard queries
-- ============================================================================
CREATE MATERIALIZED VIEW public.mv_section_analytics_summary AS
SELECT
  section_id,
  event_type,
  DATE_TRUNC('day', event_timestamp) as date,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY render_time_ms) as median_render_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY render_time_ms) as p95_render_time
FROM
  public.section_analytics
GROUP BY
  section_id,
  event_type,
  DATE_TRUNC('day', event_timestamp);

-- Index for fast queries
CREATE UNIQUE INDEX idx_mv_section_analytics_summary
  ON public.mv_section_analytics_summary(section_id, event_type, date);

-- Auto-refresh materialized view (run via cron job)
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_section_analytics_summary;
END;
$$;
```

### 4.2 Image Optimization Pipeline

```typescript
// /lib/cms/media-optimization.ts
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';

const IMAGE_VARIANTS = {
  thumbnail: { width: 400, quality: 80 },
  medium: { width: 1024, quality: 85 },
  large: { width: 1920, quality: 90 },
  hero: { width: 2560, quality: 95 },
} as const;

export async function optimizeAndStoreImage(
  file: File,
  options: {
    generateVariants?: boolean;
    generateBlurhash?: boolean;
    convertToWebP?: boolean;
  } = {}
): Promise<{
  asset: MediaAsset;
  variants: Record<string, string>;
}> {
  const {
    generateVariants = true,
    generateBlurhash = true,
    convertToWebP = true,
  } = options;

  const supabase = createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const { width, height, format } = metadata;

  // Generate blurhash for placeholder
  let blurhash: string | undefined;
  if (generateBlurhash) {
    const { data: pixels } = await sharp(buffer)
      .resize(32, 32, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Use blurhash library
    const { encode } = await import('blurhash');
    blurhash = encode(
      new Uint8ClampedArray(pixels),
      32,
      32,
      4,
      4
    );
  }

  // Upload original
  const originalFilename = `${Date.now()}-${file.name}`;
  const storagePath = `media/originals/${originalFilename}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('cms-media')
    .upload(storagePath, buffer, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year
    });

  if (uploadError) throw uploadError;

  // Get CDN URL
  const { data: { publicUrl } } = supabase.storage
    .from('cms-media')
    .getPublicUrl(storagePath);

  // Generate variants
  const variants: Record<string, string> = { original: publicUrl };

  if (generateVariants) {
    for (const [variantName, config] of Object.entries(IMAGE_VARIANTS)) {
      const variantBuffer = await sharp(buffer)
        .resize(config.width, undefined, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: config.quality })
        .toBuffer();

      const variantPath = `media/${variantName}/${originalFilename}.webp`;

      await supabase.storage
        .from('cms-media')
        .upload(variantPath, variantBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000',
        });

      const { data: { publicUrl: variantUrl } } = supabase.storage
        .from('cms-media')
        .getPublicUrl(variantPath);

      variants[variantName] = variantUrl;
    }
  }

  // Create media asset record
  const { data: asset, error: assetError } = await supabase
    .from('media_assets')
    .insert({
      filename: originalFilename,
      original_filename: file.name,
      file_type: 'image',
      mime_type: file.type,
      file_size_bytes: file.size,
      storage_path: storagePath,
      cdn_url: publicUrl,
      width,
      height,
      blurhash,
      variants: variants,
      is_optimized: true,
    })
    .select()
    .single();

  if (assetError) throw assetError;

  return { asset, variants };
}
```

### 4.3 Lazy Loading Strategy

```typescript
// /components/cms/HomepageRenderer.tsx
'use client';

import { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

// Dynamically import section components
const HeroBanner = dynamic(() => import('./sections/HeroBanner'), {
  loading: () => <HeroBannerSkeleton />,
});

const ProductCarousel = dynamic(() => import('./sections/ProductCarousel'), {
  loading: () => <ProductCarouselSkeleton />,
  ssr: false, // Client-side only for heavy components
});

const CategoryGrid = dynamic(() => import('./sections/CategoryGrid'));

interface LazySection {
  section: HomepageSection;
  priority?: boolean;
}

function LazySection({ section, priority = false }: LazySection) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    skip: priority, // Skip intersection observer for above-the-fold
  });

  const shouldLoad = priority || inView;

  return (
    <div ref={ref} data-section-id={section.section_id}>
      {shouldLoad ? (
        <Suspense fallback={<SectionSkeleton type={section.section_type} />}>
          {renderSection(section)}
        </Suspense>
      ) : (
        <SectionSkeleton type={section.section_type} />
      )}
    </div>
  );
}

export function HomepageRenderer({ sections }: { sections: HomepageSection[] }) {
  return (
    <div className="homepage-sections">
      {sections.map((section, index) => (
        <LazySection
          key={section.section_id}
          section={section}
          priority={index < 2} // First 2 sections load immediately
        />
      ))}
    </div>
  );
}
```

---

## 5. Security Implementation

### 5.1 Input Validation & Sanitization

```typescript
// /lib/cms/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Section type enum
export const SectionType = z.enum([
  'hero_banner',
  'product_carousel',
  'category_grid',
  'text_block',
  'promotional_banner',
  'custom_html',
  'announcement_bar',
  'video_section',
  'testimonials',
  'newsletter_signup',
]);

// Validation schemas
export const SectionCreateSchema = z.object({
  section_type: SectionType,
  internal_name: z.string().min(1).max(255),
  locale: z.enum(['en', 'he']),
  position: z.number().int().min(0),

  config: z.record(z.unknown()).default({}),

  publish_at: z.string().datetime().optional(),
  expire_at: z.string().datetime().optional(),

  content: z.object({
    title: z.string().max(255).optional(),
    subtitle: z.string().max(500).optional(),
    body_text: z.string().max(5000).optional(),
    cta_text: z.string().max(100).optional(),
    cta_url: z.string().url().max(2048).optional(),
    custom_html: z.string().max(50000).optional(), // Will be sanitized
    product_ids: z.array(z.string().uuid()).max(50).optional(),
    category_ids: z.array(z.string().uuid()).max(20).optional(),
    primary_media_id: z.string().uuid().optional(),
    secondary_media_id: z.string().uuid().optional(),
  }),
}).refine(
  (data) => {
    // Ensure expire_at is after publish_at
    if (data.publish_at && data.expire_at) {
      return new Date(data.expire_at) > new Date(data.publish_at);
    }
    return true;
  },
  { message: 'expire_at must be after publish_at' }
);

export const SectionUpdateSchema = SectionCreateSchema.partial();

// Sanitize custom HTML to prevent XSS
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'br', 'strong', 'em', 'u',
      'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'style',
      'target', 'rel', 'width', 'height'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
  });
}

// Validate and sanitize section data
export async function validateSectionData(
  data: unknown,
  schema: z.ZodSchema
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    const validated = schema.parse(data);

    // Sanitize custom HTML if present
    if (validated.content?.custom_html) {
      validated.content.custom_html = sanitizeHTML(validated.content.custom_html);
    }

    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}
```

### 5.2 Admin Authorization Middleware

```typescript
// /lib/cms/auth.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function requireAdmin(request: NextRequest) {
  const supabase = createClient();

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Unauthorized - No active session' },
      { status: 401 }
    );
  }

  // Check user role
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || user?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  return null; // No error, proceed
}

// Usage in API routes
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  // Continue with admin logic
  // ...
}
```

### 5.3 Rate Limiting

```typescript
// /lib/cms/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiters for different operations
export const rateLimiters = {
  // Public endpoints (homepage fetch)
  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),

  // Admin read operations
  adminRead: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, '1 m'), // 300 requests per minute
    analytics: true,
  }),

  // Admin write operations
  adminWrite: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    analytics: true,
  }),

  // Media upload
  mediaUpload: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(20, '1 h'), // 20 uploads per hour
    analytics: true,
  }),

  // Analytics tracking
  analytics: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 events per minute
    analytics: true,
  }),
};

export async function checkRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiters
) {
  const { success, limit, reset, remaining } = await rateLimiters[limiter].limit(identifier);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  return {
    success: true,
    limit,
    remaining,
    reset,
  };
}
```

---

## 6. Stub System Integration

### 6.1 CMS Stubs for Local Development

```typescript
// /lib/stubs/cms-stubs.ts
import { USE_STUBS } from './index';

export const mockHomepageSections = {
  en: [
    {
      section_id: 'stub-hero-1',
      position: 0,
      section_type: 'hero_banner',
      internal_name: 'Holiday Hero Banner',
      config: { animation: 'fade', duration: 5000 },
      title: 'Vintage Treasures Await',
      subtitle: 'Discover unique pieces from the past',
      cta_text: 'Shop Now',
      cta_url: '/shop',
      primary_media_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      metadata: {},
    },
    {
      section_id: 'stub-carousel-1',
      position: 1,
      section_type: 'product_carousel',
      internal_name: 'Featured Products',
      config: { autoplay: true, slidesPerView: 4 },
      title: 'Featured Items',
      subtitle: 'Hand-picked vintage selections',
      products: [
        // Mock product data
      ],
      metadata: {},
    },
    // ... more sections
  ],
  he: [
    // Hebrew sections
  ],
};

export function getHomepageStub(locale: string = 'he') {
  return {
    sections: mockHomepageSections[locale] || mockHomepageSections.he,
    metadata: {
      locale,
      cachedAt: new Date().toISOString(),
      ttl: 60,
      isStub: true,
    },
  };
}

export function createCMSStub() {
  return {
    getSections: async (locale: string) => mockHomepageSections[locale] || [],
    createSection: async (data: any) => ({ id: 'stub-new-section', ...data }),
    updateSection: async (id: string, data: any) => ({ id, ...data }),
    deleteSection: async (id: string) => ({ success: true }),
    publishSection: async (id: string) => ({ id, status: 'published' }),
  };
}
```

---

## 7. TypeScript Type Definitions

```typescript
// /types/cms.ts

export type SectionType =
  | 'hero_banner'
  | 'product_carousel'
  | 'category_grid'
  | 'text_block'
  | 'promotional_banner'
  | 'custom_html'
  | 'announcement_bar'
  | 'video_section'
  | 'testimonials'
  | 'newsletter_signup';

export type SectionStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface HomepageSection {
  id: string;
  position: number;
  is_active: boolean;
  section_type: SectionType;
  internal_name: string;
  section_key?: string;
  locale: 'en' | 'he';
  publish_at?: string;
  expire_at?: string;
  status: SectionStatus;
  version: number;
  parent_version_id?: string;
  config: Record<string, any>;
  view_count: number;
  click_count: number;
  conversion_count: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SectionContent {
  id: string;
  section_id: string;
  title?: string;
  subtitle?: string;
  body_text?: string;
  cta_text?: string;
  cta_url?: string;
  primary_media_id?: string;
  secondary_media_id?: string;
  product_ids?: string[];
  category_ids?: string[];
  custom_html?: string;
  metadata: Record<string, any>;
  locale: 'en' | 'he';
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  original_filename: string;
  file_type: 'image' | 'video' | 'gif';
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  cdn_url?: string;
  width?: number;
  height?: number;
  blurhash?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  is_optimized: boolean;
  optimization_config: Record<string, any>;
  variants: Record<string, string>;
  used_in_sections: string[];
  usage_count: number;
  alt_text?: string;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CarouselRule {
  id: string;
  section_id: string;
  rule_type:
    | 'manual_selection'
    | 'category_based'
    | 'featured_products'
    | 'new_arrivals'
    | 'best_sellers'
    | 'discounted'
    | 'low_stock'
    | 'custom_query';
  parameters: Record<string, any>;
  cache_duration_minutes: number;
  last_cached_at?: string;
  cached_product_ids?: string[];
  fallback_product_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface SectionAnalytics {
  id: string;
  section_id: string;
  event_type: 'view' | 'click' | 'conversion';
  event_timestamp: string;
  session_id?: string;
  user_id?: string;
  device_type?: string;
  user_agent?: string;
  referrer?: string;
  render_time_ms?: number;
  interaction_time_ms?: number;
  variant_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}
```

---

## 8. Deployment Checklist

### 8.1 Database Migration

```bash
# Apply migrations
npm run db:migrate

# Create initial admin user
npm run db:create-admin

# Seed sample homepage data (optional)
npm run db:seed-cms
```

### 8.2 Environment Variables

```env
# Existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis/Upstash for caching
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# CDN/Image optimization
NEXT_PUBLIC_CDN_URL=

# Optional: Vercel for CDN purge
VERCEL_API_TOKEN=

# Stub mode (local dev)
NEXT_PUBLIC_USE_STUBS=false
```

### 8.3 Performance Monitoring

```typescript
// /lib/cms/monitoring.ts
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('cms-homepage');

export async function monitoredFetch<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(operation);
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    span.setAttributes({
      'operation.duration': duration,
      'operation.success': true,
    });

    if (duration > 1000) {
      console.warn(`[Performance] Slow operation: ${operation} (${duration}ms)`);
    }

    return result;
  } catch (error) {
    span.setAttributes({
      'operation.success': false,
      'error.message': error.message,
    });
    throw error;
  } finally {
    span.end();
  }
}
```

---

## 9. Key Architectural Decisions

### 9.1 Why PostgreSQL JSONB for Config/Metadata?

**Trade-off Analysis:**
- **Pros:** Extreme flexibility for different section types, no schema migrations for new section configs, faster development
- **Cons:** Less type safety, harder to query, potential for inconsistent data

**Decision:** Use JSONB with TypeScript validation at application layer. The flexibility outweighs the drawbacks for a CMS where section types evolve frequently.

### 9.2 Why Separate section_content Table?

**Trade-off Analysis:**
- **Single table:** Simpler queries, fewer joins
- **Separate tables:** Better localization support, cleaner separation of concerns, easier content versioning

**Decision:** Separate tables. Localization is critical for this app (en/he), and separating content from structure enables future multi-locale workflows.

### 9.3 Why Function-Based Carousel Rules vs. Hardcoded Queries?

**Trade-off Analysis:**
- **Hardcoded queries:** Simpler, faster, more predictable
- **Rule engine:** Flexible, non-technical users can configure, scales to complex use cases

**Decision:** Rule engine with database function execution. Enables marketing teams to create dynamic carousels without developer intervention. Cache results to maintain performance.

### 9.4 Cache Strategy: Redis vs. Next.js Data Cache

**Trade-off Analysis:**
- **Next.js Data Cache:** Simpler setup, free on Vercel, good for static content
- **Redis:** More control, cache invalidation, shared across instances, analytics

**Decision:** Multi-tier approach using BOTH. Next.js ISR for base caching, Redis for dynamic invalidation and cross-instance consistency.

---

## 10. Scalability Projections

### 10.1 Performance Benchmarks

| Metric | Target | Expected at 10M Users/Day |
|--------|--------|---------------------------|
| Homepage Load (Cached) | <100ms | 50-80ms |
| Homepage Load (Cold) | <500ms | 300-400ms |
| Admin CMS Operation | <200ms | 150-180ms |
| Cache Hit Rate | >95% | 97-99% |
| Database Connections | <100 | 50-70 |
| Redis Memory | <1GB | 200-400MB |

### 10.2 Horizontal Scaling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Vercel)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌────────┐
   │ Edge 1 │    │ Edge 2 │    │ Edge N │  (Auto-scaling)
   └────┬───┘    └────┬───┘    └────┬───┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Redis Cluster  │  (Single source of cache)
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Supabase (RDS)  │  (Managed scaling)
              └─────────────────┘
```

### 10.3 Cost Optimization

At 10M daily users with 95% cache hit rate:
- **Database queries:** ~500K/day (0.05 queries per user)
- **Redis operations:** ~10M/day (1 read per user)
- **Estimated costs:**
  - Supabase: $25/month (Pro plan with connection pooling)
  - Upstash Redis: $20/month (Pay-as-you-go)
  - Vercel: $20/month (Pro plan with edge caching)
  - **Total: ~$65/month for CMS infrastructure**

---

## Summary

This architecture provides:

1. **Scalability:** Handles 10M+ daily users with sub-100ms response times via multi-tier caching
2. **Flexibility:** JSONB-based config allows rapid iteration on section types without schema changes
3. **Security:** RLS policies, input validation, XSS protection, and rate limiting
4. **Developer Experience:** Full stub system for offline development, TypeScript safety, comprehensive API
5. **Performance:** Optimized queries, materialized views, image optimization pipeline, lazy loading
6. **Maintainability:** Clean separation of concerns, audit trails, version history, analytics

The system is production-ready and designed to scale with your business while maintaining the fast iteration speed required for e-commerce.

**Next Steps:**
1. Review and approve architecture
2. Create database migration files
3. Implement core API endpoints
4. Build admin UI components
5. Set up caching infrastructure
6. Deploy and monitor
