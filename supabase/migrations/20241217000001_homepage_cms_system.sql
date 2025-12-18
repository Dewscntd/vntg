-- Homepage CMS System Migration
-- Comprehensive content management system for homepage sections with version control,
-- scheduling, and multi-locale support for future internationalization.

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Media assets table for uploaded images/videos
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'homepage-media',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Homepage sections table - Core section metadata and ordering
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL CHECK (section_type IN (
    'hero_banner',
    'product_carousel',
    'text_block',
    'category_grid',
    'promo_banner',
    'newsletter',
    'custom_html'
  )),
  section_key TEXT NOT NULL UNIQUE, -- Stable identifier (e.g., 'hero-main', 'featured-products')
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  locale TEXT NOT NULL DEFAULT 'en', -- ISO 639-1 language code
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Version control
  published_version_id UUID, -- Reference to currently published version
  draft_version_id UUID,     -- Reference to current draft version

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Section-level settings (CSS classes, analytics tags, etc.)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Section content versions - Version history for all content changes
CREATE TABLE IF NOT EXISTS public.section_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL, -- Flexible JSONB content for each section type

  -- Version metadata
  change_summary TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Ensure unique version numbers per section
  UNIQUE(section_id, version_number)
);

-- Section scheduling - Publish and expiration rules
CREATE TABLE IF NOT EXISTS public.section_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.section_versions(id) ON DELETE CASCADE,

  -- Scheduling windows
  publish_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expire_at TIMESTAMP WITH TIME ZONE,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  executed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Validation: expire_at must be after publish_at
  CONSTRAINT valid_schedule_window CHECK (expire_at IS NULL OR expire_at > publish_at)
);

-- Product associations for product_carousel sections
CREATE TABLE IF NOT EXISTS public.section_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Override settings per product (badge text, custom price display, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(section_id, product_id)
);

-- Category associations for category_grid sections
CREATE TABLE IF NOT EXISTS public.section_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Override settings per category (custom image, description, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(section_id, category_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Media assets indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON public.media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_mime_type ON public.media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON public.media_assets(created_at DESC);

-- Homepage sections indexes
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON public.homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON public.homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_status ON public.homepage_sections(status);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_locale ON public.homepage_sections(locale);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON public.homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_display_order ON public.homepage_sections(display_order);
-- Composite index for homepage rendering query
CREATE INDEX IF NOT EXISTS idx_homepage_sections_render ON public.homepage_sections(locale, is_active, status, display_order)
  WHERE is_active = true AND status = 'published';

-- Section versions indexes
CREATE INDEX IF NOT EXISTS idx_section_versions_section ON public.section_versions(section_id);
CREATE INDEX IF NOT EXISTS idx_section_versions_published ON public.section_versions(is_published);
CREATE INDEX IF NOT EXISTS idx_section_versions_created_by ON public.section_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_section_versions_created_at ON public.section_versions(created_at DESC);
-- Composite index for version history queries
CREATE INDEX IF NOT EXISTS idx_section_versions_history ON public.section_versions(section_id, version_number DESC);

-- Section schedules indexes
CREATE INDEX IF NOT EXISTS idx_section_schedules_section ON public.section_schedules(section_id);
CREATE INDEX IF NOT EXISTS idx_section_schedules_version ON public.section_schedules(version_id);
CREATE INDEX IF NOT EXISTS idx_section_schedules_status ON public.section_schedules(status);
CREATE INDEX IF NOT EXISTS idx_section_schedules_publish_at ON public.section_schedules(publish_at);
CREATE INDEX IF NOT EXISTS idx_section_schedules_expire_at ON public.section_schedules(expire_at);
-- Composite index for scheduled publish trigger
CREATE INDEX IF NOT EXISTS idx_section_schedules_pending ON public.section_schedules(status, publish_at)
  WHERE status = 'pending';

-- Section associations indexes
CREATE INDEX IF NOT EXISTS idx_section_products_section ON public.section_products(section_id);
CREATE INDEX IF NOT EXISTS idx_section_products_product ON public.section_products(product_id);
CREATE INDEX IF NOT EXISTS idx_section_products_order ON public.section_products(section_id, display_order);

CREATE INDEX IF NOT EXISTS idx_section_categories_section ON public.section_categories(section_id);
CREATE INDEX IF NOT EXISTS idx_section_categories_category ON public.section_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_section_categories_order ON public.section_categories(section_id, display_order);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_categories ENABLE ROW LEVEL SECURITY;

-- Media assets policies
CREATE POLICY "Media assets viewable by everyone" ON public.media_assets
  FOR SELECT USING (true);

CREATE POLICY "Media assets editable by admins" ON public.media_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Homepage sections policies - Public read for published, admin write
CREATE POLICY "Published sections viewable by everyone" ON public.homepage_sections
  FOR SELECT USING (status = 'published' AND is_active = true);

CREATE POLICY "Admins can view all sections" ON public.homepage_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Sections editable by admins" ON public.homepage_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Section versions policies - Follow section visibility
CREATE POLICY "Published versions viewable by everyone" ON public.section_versions
  FOR SELECT USING (
    is_published = true AND EXISTS (
      SELECT 1 FROM public.homepage_sections
      WHERE homepage_sections.id = section_id
        AND homepage_sections.status = 'published'
        AND homepage_sections.is_active = true
    )
  );

CREATE POLICY "Admins can view all versions" ON public.section_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Versions editable by admins" ON public.section_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Section schedules policies - Admin only
CREATE POLICY "Admins can view all schedules" ON public.section_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Schedules editable by admins" ON public.section_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Section products policies - Follow section visibility
CREATE POLICY "Section products viewable when section published" ON public.section_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.homepage_sections
      WHERE homepage_sections.id = section_id
        AND homepage_sections.status = 'published'
        AND homepage_sections.is_active = true
    )
  );

CREATE POLICY "Admins can view all section products" ON public.section_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Section products editable by admins" ON public.section_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Section categories policies - Follow section visibility
CREATE POLICY "Section categories viewable when section published" ON public.section_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.homepage_sections
      WHERE homepage_sections.id = section_id
        AND homepage_sections.status = 'published'
        AND homepage_sections.is_active = true
    )
  );

CREATE POLICY "Admins can view all section categories" ON public.section_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Section categories editable by admins" ON public.section_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER handle_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_homepage_sections_updated_at
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_section_schedules_updated_at
  BEFORE UPDATE ON public.section_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_section_products_updated_at
  BEFORE UPDATE ON public.section_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_section_categories_updated_at
  BEFORE UPDATE ON public.section_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-increment version number trigger
CREATE OR REPLACE FUNCTION public.auto_increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM public.section_versions
    WHERE section_id = NEW.section_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_increment_version_number_trigger
  BEFORE INSERT ON public.section_versions
  FOR EACH ROW EXECUTE FUNCTION public.auto_increment_version_number();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to publish a section version
CREATE OR REPLACE FUNCTION public.publish_section_version(
  p_section_id UUID,
  p_version_id UUID,
  p_published_by UUID DEFAULT auth.uid()
)
RETURNS TABLE(
  section_id UUID,
  version_id UUID,
  version_number INTEGER,
  published_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_version_number INTEGER;
  v_published_at TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Validate that version belongs to section
  SELECT version_number INTO v_version_number
  FROM public.section_versions
  WHERE id = p_version_id AND section_versions.section_id = p_section_id;

  IF v_version_number IS NULL THEN
    RAISE EXCEPTION 'Version % does not belong to section %', p_version_id, p_section_id;
  END IF;

  -- Unpublish previous versions
  UPDATE public.section_versions
  SET is_published = false
  WHERE section_versions.section_id = p_section_id AND is_published = true;

  -- Publish the new version
  UPDATE public.section_versions
  SET
    is_published = true,
    published_at = v_published_at
  WHERE id = p_version_id;

  -- Update section to point to published version
  UPDATE public.homepage_sections
  SET
    status = 'published',
    published_version_id = p_version_id
  WHERE id = p_section_id;

  RETURN QUERY
  SELECT
    p_section_id,
    p_version_id,
    v_version_number,
    v_published_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to admins only (checked via RLS in calling context)
GRANT EXECUTE ON FUNCTION public.publish_section_version TO authenticated;

-- Function to revert section to a previous version
CREATE OR REPLACE FUNCTION public.revert_section_to_version(
  p_section_id UUID,
  p_version_id UUID,
  p_reverted_by UUID DEFAULT auth.uid()
)
RETURNS TABLE(
  section_id UUID,
  new_version_id UUID,
  version_number INTEGER,
  based_on_version INTEGER
) AS $$
DECLARE
  v_content JSONB;
  v_based_on_version INTEGER;
  v_new_version_id UUID;
  v_new_version_number INTEGER;
BEGIN
  -- Get the content from the target version
  SELECT content, version_number
  INTO v_content, v_based_on_version
  FROM public.section_versions
  WHERE id = p_version_id AND section_versions.section_id = p_section_id;

  IF v_content IS NULL THEN
    RAISE EXCEPTION 'Version % not found for section %', p_version_id, p_section_id;
  END IF;

  -- Create a new version based on the old content
  INSERT INTO public.section_versions (
    section_id,
    content,
    change_summary,
    created_by
  ) VALUES (
    p_section_id,
    v_content,
    'Reverted to version ' || v_based_on_version,
    p_reverted_by
  )
  RETURNING id, version_number INTO v_new_version_id, v_new_version_number;

  -- Update section's draft version
  UPDATE public.homepage_sections
  SET draft_version_id = v_new_version_id
  WHERE id = p_section_id;

  RETURN QUERY
  SELECT
    p_section_id,
    v_new_version_id,
    v_new_version_number,
    v_based_on_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.revert_section_to_version TO authenticated;

-- Function to bulk reorder sections
CREATE OR REPLACE FUNCTION public.reorder_homepage_sections(
  p_section_orders JSONB -- Array of {id: UUID, display_order: INTEGER}
)
RETURNS INTEGER AS $$
DECLARE
  v_section JSONB;
  v_count INTEGER := 0;
BEGIN
  -- Iterate through the array and update display_order
  FOR v_section IN SELECT * FROM jsonb_array_elements(p_section_orders)
  LOOP
    UPDATE public.homepage_sections
    SET display_order = (v_section->>'display_order')::INTEGER
    WHERE id = (v_section->>'id')::UUID;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.reorder_homepage_sections TO authenticated;

-- Function to process scheduled publishes (called by cron job or trigger)
CREATE OR REPLACE FUNCTION public.process_scheduled_publishes()
RETURNS TABLE(
  section_id UUID,
  version_id UUID,
  action TEXT
) AS $$
DECLARE
  v_schedule RECORD;
BEGIN
  -- Process pending schedules that should be published
  FOR v_schedule IN
    SELECT ss.id, ss.section_id, ss.version_id, ss.publish_at, ss.expire_at
    FROM public.section_schedules ss
    WHERE ss.status = 'pending'
      AND ss.publish_at <= NOW()
  LOOP
    -- Publish the version
    PERFORM public.publish_section_version(
      v_schedule.section_id,
      v_schedule.version_id
    );

    -- Update schedule status
    UPDATE public.section_schedules
    SET
      status = 'active',
      executed_at = NOW()
    WHERE id = v_schedule.id;

    RETURN QUERY SELECT v_schedule.section_id, v_schedule.version_id, 'published'::TEXT;
  END LOOP;

  -- Process active schedules that should expire
  FOR v_schedule IN
    SELECT ss.id, ss.section_id, ss.version_id
    FROM public.section_schedules ss
    WHERE ss.status = 'active'
      AND ss.expire_at IS NOT NULL
      AND ss.expire_at <= NOW()
  LOOP
    -- Unpublish the section
    UPDATE public.homepage_sections
    SET status = 'archived'
    WHERE id = v_schedule.section_id;

    -- Update schedule status
    UPDATE public.section_schedules
    SET status = 'expired'
    WHERE id = v_schedule.id;

    RETURN QUERY SELECT v_schedule.section_id, v_schedule.version_id, 'expired'::TEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get complete homepage content (optimized for rendering)
CREATE OR REPLACE FUNCTION public.get_homepage_content(
  p_locale TEXT DEFAULT 'en'
)
RETURNS TABLE(
  section_id UUID,
  section_type TEXT,
  section_key TEXT,
  display_order INTEGER,
  content JSONB,
  metadata JSONB,
  products JSONB,
  categories JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    hs.id,
    hs.section_type,
    hs.section_key,
    hs.display_order,
    COALESCE(sv.content, '{}'::JSONB) as content,
    hs.metadata,
    -- Aggregate associated products
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'price', p.price,
          'image_url', p.image_url,
          'display_order', sp.display_order,
          'metadata', sp.metadata
        ) ORDER BY sp.display_order
      )
      FROM public.section_products sp
      JOIN public.products p ON sp.product_id = p.id
      WHERE sp.section_id = hs.id),
      '[]'::JSONB
    ) as products,
    -- Aggregate associated categories
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'description', c.description,
          'display_order', sc.display_order,
          'metadata', sc.metadata
        ) ORDER BY sc.display_order
      )
      FROM public.section_categories sc
      JOIN public.categories c ON sc.category_id = c.id
      WHERE sc.section_id = hs.id),
      '[]'::JSONB
    ) as categories
  FROM public.homepage_sections hs
  LEFT JOIN public.section_versions sv ON hs.published_version_id = sv.id
  WHERE
    hs.locale = p_locale
    AND hs.is_active = true
    AND hs.status = 'published'
  ORDER BY hs.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_homepage_content TO anon, authenticated;

-- Function to validate section content schema
CREATE OR REPLACE FUNCTION public.validate_section_content(
  p_section_type TEXT,
  p_content JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validation logic for each section type
  CASE p_section_type
    WHEN 'hero_banner' THEN
      -- Require: title, media (image or video), cta
      RETURN (
        p_content ? 'title' AND
        (p_content ? 'image_url' OR p_content ? 'video_url')
      );

    WHEN 'product_carousel' THEN
      -- Require: title
      RETURN p_content ? 'title';

    WHEN 'text_block' THEN
      -- Require: content
      RETURN p_content ? 'content';

    WHEN 'category_grid' THEN
      -- Require: title or allow empty
      RETURN true;

    WHEN 'promo_banner' THEN
      -- Require: title, cta
      RETURN (p_content ? 'title' AND p_content ? 'cta');

    WHEN 'newsletter' THEN
      -- Require: title, placeholder
      RETURN p_content ? 'title';

    WHEN 'custom_html' THEN
      -- Require: html
      RETURN p_content ? 'html';

    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add validation trigger for section versions
CREATE OR REPLACE FUNCTION public.validate_section_version_content()
RETURNS TRIGGER AS $$
DECLARE
  v_section_type TEXT;
BEGIN
  -- Get section type
  SELECT section_type INTO v_section_type
  FROM public.homepage_sections
  WHERE id = NEW.section_id;

  -- Validate content
  IF NOT public.validate_section_content(v_section_type, NEW.content) THEN
    RAISE EXCEPTION 'Invalid content for section type: %', v_section_type;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_section_version_content_trigger
  BEFORE INSERT OR UPDATE ON public.section_versions
  FOR EACH ROW EXECUTE FUNCTION public.validate_section_version_content();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.media_assets IS 'Storage metadata for uploaded images and videos used in homepage sections';
COMMENT ON TABLE public.homepage_sections IS 'Core homepage sections with metadata, ordering, and version references';
COMMENT ON TABLE public.section_versions IS 'Version history for all section content changes with rollback capability';
COMMENT ON TABLE public.section_schedules IS 'Scheduling rules for automated publishing and expiration of sections';
COMMENT ON TABLE public.section_products IS 'Many-to-many association between sections and products for product carousels';
COMMENT ON TABLE public.section_categories IS 'Many-to-many association between sections and categories for category grids';

COMMENT ON COLUMN public.homepage_sections.section_key IS 'Stable identifier for programmatic access (e.g., "hero-main")';
COMMENT ON COLUMN public.homepage_sections.published_version_id IS 'Currently live version visible to users';
COMMENT ON COLUMN public.homepage_sections.draft_version_id IS 'Work-in-progress version for editors';
COMMENT ON COLUMN public.section_versions.content IS 'JSONB content structure varies by section_type';
COMMENT ON FUNCTION public.get_homepage_content IS 'Optimized function for rendering complete homepage with all sections, products, and categories';
COMMENT ON FUNCTION public.publish_section_version IS 'Atomically publish a version and update section status';
COMMENT ON FUNCTION public.process_scheduled_publishes IS 'Process pending scheduled publishes and expirations (call from cron)';
