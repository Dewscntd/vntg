-- Homepage CMS Seed Data Migration
-- Sample data for testing and development of the homepage CMS system
-- This includes example sections, versions, and content for all section types

-- ============================================================================
-- SAMPLE MEDIA ASSETS
-- ============================================================================

INSERT INTO public.media_assets (id, file_path, file_name, file_size, mime_type, width, height, alt_text, storage_bucket)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'homepage/hero-vintage-1.jpg',
    'hero-vintage-1.jpg',
    1024000,
    'image/jpeg',
    1920,
    1080,
    'Vintage clothing collection hero banner',
    'homepage-media'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'homepage/hero-vintage-2.jpg',
    'hero-vintage-2.jpg',
    980000,
    'image/jpeg',
    1920,
    1080,
    'Retro electronics collection hero banner',
    'homepage-media'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'homepage/promo-banner-sale.jpg',
    'promo-banner-sale.jpg',
    512000,
    'image/jpeg',
    1200,
    400,
    'Summer sale promotional banner',
    'homepage-media'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'homepage/newsletter-bg.jpg',
    'newsletter-bg.jpg',
    768000,
    'image/jpeg',
    1600,
    600,
    'Newsletter signup background',
    'homepage-media'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE HOMEPAGE SECTIONS
-- ============================================================================

-- Hero Banner Section
INSERT INTO public.homepage_sections (id, section_type, section_key, display_order, status, locale, is_active, metadata)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'hero_banner',
    'hero-main',
    1,
    'published',
    'en',
    true,
    '{
      "cssClasses": "homepage-hero",
      "analyticsTag": "hero_main",
      "autoplayCarousel": true,
      "carouselInterval": 5000
    }'::JSONB
  )
ON CONFLICT (section_key) DO NOTHING;

-- Product Carousel Section (Featured Products)
INSERT INTO public.homepage_sections (id, section_type, section_key, display_order, status, locale, is_active, metadata)
VALUES
  (
    '20000000-0000-0000-0000-000000000002',
    'product_carousel',
    'featured-products',
    2,
    'published',
    'en',
    true,
    '{
      "cssClasses": "featured-products-carousel",
      "analyticsTag": "featured_products",
      "itemsPerView": 4,
      "autoplay": false
    }'::JSONB
  )
ON CONFLICT (section_key) DO NOTHING;

-- Category Grid Section
INSERT INTO public.homepage_sections (id, section_type, section_key, display_order, status, locale, is_active, metadata)
VALUES
  (
    '20000000-0000-0000-0000-000000000003',
    'category_grid',
    'shop-by-category',
    3,
    'published',
    'en',
    true,
    '{
      "cssClasses": "category-grid",
      "analyticsTag": "category_grid",
      "gridColumns": 3
    }'::JSONB
  )
ON CONFLICT (section_key) DO NOTHING;

-- Text Block Section (About/Story)
INSERT INTO public.homepage_sections (id, section_type, section_key, display_order, status, locale, is_active, metadata)
VALUES
  (
    '20000000-0000-0000-0000-000000000004',
    'text_block',
    'our-story',
    4,
    'published',
    'en',
    true,
    '{
      "cssClasses": "our-story-section",
      "analyticsTag": "our_story",
      "textAlign": "center"
    }'::JSONB
  )
ON CONFLICT (section_key) DO NOTHING;

-- Promo Banner Section (Sale/Promotion)
INSERT INTO public.homepage_sections (id, section_type, section_key, display_order, status, locale, is_active, metadata)
VALUES
  (
    '20000000-0000-0000-0000-000000000005',
    'promo_banner',
    'summer-sale-2025',
    5,
    'published',
    'en',
    true,
    '{
      "cssClasses": "promo-banner summer-sale",
      "analyticsTag": "summer_sale_2025",
      "backgroundColor": "#FF6B6B"
    }'::JSONB
  )
ON CONFLICT (section_key) DO NOTHING;

-- Newsletter Section
INSERT INTO public.homepage_sections (id, section_type, section_key, display_order, status, locale, is_active, metadata)
VALUES
  (
    '20000000-0000-0000-0000-000000000006',
    'newsletter',
    'newsletter-signup',
    6,
    'published',
    'en',
    true,
    '{
      "cssClasses": "newsletter-section",
      "analyticsTag": "newsletter_signup",
      "provider": "mailchimp"
    }'::JSONB
  )
ON CONFLICT (section_key) DO NOTHING;

-- ============================================================================
-- SAMPLE SECTION VERSIONS WITH CONTENT
-- ============================================================================

-- Hero Banner Version (with carousel content)
INSERT INTO public.section_versions (id, section_id, version_number, content, change_summary, is_published, published_at)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    1,
    '{
      "slides": [
        {
          "id": "slide-1",
          "title": "Discover Timeless Vintage",
          "subtitle": "Curated treasures from decades past",
          "image_url": "/images/hero-vintage-1.jpg",
          "video_url": null,
          "overlay_opacity": 0.3,
          "text_color": "#FFFFFF",
          "text_position": "center",
          "cta": {
            "text": "Shop Collection",
            "url": "/shop",
            "style": "primary"
          }
        },
        {
          "id": "slide-2",
          "title": "Retro Electronics Revival",
          "subtitle": "Bring back the golden age of tech",
          "image_url": "/images/hero-vintage-2.jpg",
          "video_url": null,
          "overlay_opacity": 0.4,
          "text_color": "#FFFFFF",
          "text_position": "left",
          "cta": {
            "text": "Explore Electronics",
            "url": "/shop?category=electronics",
            "style": "secondary"
          }
        }
      ],
      "animation": "fade",
      "duration": 5000
    }'::JSONB,
    'Initial hero carousel with 2 slides',
    true,
    NOW()
  )
ON CONFLICT (section_id, version_number) DO NOTHING;

-- Product Carousel Version
INSERT INTO public.section_versions (id, section_id, version_number, content, change_summary, is_published, published_at)
VALUES
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    1,
    '{
      "title": "Featured Vintage Finds",
      "subtitle": "Hand-picked treasures just for you",
      "viewAllLink": "/shop?featured=true",
      "displayMode": "carousel",
      "showPrice": true,
      "showAddToCart": true,
      "badgeText": "Featured"
    }'::JSONB,
    'Initial featured products carousel',
    true,
    NOW()
  )
ON CONFLICT (section_id, version_number) DO NOTHING;

-- Category Grid Version
INSERT INTO public.section_versions (id, section_id, version_number, content, change_summary, is_published, published_at)
VALUES
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    1,
    '{
      "title": "Shop by Category",
      "subtitle": "Find exactly what you are looking for",
      "layout": "grid",
      "columns": 3,
      "showProductCount": true,
      "imageStyle": "cover"
    }'::JSONB,
    'Initial category grid layout',
    true,
    NOW()
  )
ON CONFLICT (section_id, version_number) DO NOTHING;

-- Text Block Version
INSERT INTO public.section_versions (id, section_id, version_number, content, change_summary, is_published, published_at)
VALUES
  (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000004',
    1,
    '{
      "title": "Our Story",
      "content": "<p>Welcome to VNTG, where every item tells a story. We curate authentic vintage pieces from the 1960s through the 1990s, bringing you the best of retro fashion, electronics, and collectibles.</p><p>Each piece in our collection is carefully selected for its quality, authenticity, and unique character. We believe in sustainable shopping and preserving the craftsmanship of previous eras.</p>",
      "alignment": "center",
      "maxWidth": "800px",
      "backgroundColor": "#F9F9F9"
    }'::JSONB,
    'Initial our story content',
    true,
    NOW()
  )
ON CONFLICT (section_id, version_number) DO NOTHING;

-- Promo Banner Version
INSERT INTO public.section_versions (id, section_id, version_number, content, change_summary, is_published, published_at)
VALUES
  (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000005',
    1,
    '{
      "title": "Summer Sale 2025",
      "subtitle": "Up to 40% off vintage clothing",
      "image_url": "/images/promo-banner-sale.jpg",
      "backgroundColor": "#FF6B6B",
      "textColor": "#FFFFFF",
      "cta": {
        "text": "Shop Sale",
        "url": "/shop?sale=true",
        "style": "light"
      },
      "badge": {
        "text": "Limited Time",
        "color": "#FFD93D"
      }
    }'::JSONB,
    'Summer sale 2025 promotional banner',
    true,
    NOW()
  )
ON CONFLICT (section_id, version_number) DO NOTHING;

-- Newsletter Version
INSERT INTO public.section_versions (id, section_id, version_number, content, change_summary, is_published, published_at)
VALUES
  (
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000006',
    1,
    '{
      "title": "Stay in the Loop",
      "subtitle": "Get exclusive deals and new arrivals delivered to your inbox",
      "placeholder": "Enter your email address",
      "buttonText": "Subscribe",
      "image_url": "/images/newsletter-bg.jpg",
      "privacyText": "We respect your privacy. Unsubscribe anytime.",
      "successMessage": "Thanks for subscribing!",
      "layout": "split"
    }'::JSONB,
    'Initial newsletter signup form',
    true,
    NOW()
  )
ON CONFLICT (section_id, version_number) DO NOTHING;

-- ============================================================================
-- LINK PUBLISHED VERSIONS TO SECTIONS
-- ============================================================================

UPDATE public.homepage_sections
SET
  published_version_id = '30000000-0000-0000-0000-000000000001',
  draft_version_id = '30000000-0000-0000-0000-000000000001'
WHERE id = '20000000-0000-0000-0000-000000000001';

UPDATE public.homepage_sections
SET
  published_version_id = '30000000-0000-0000-0000-000000000002',
  draft_version_id = '30000000-0000-0000-0000-000000000002'
WHERE id = '20000000-0000-0000-0000-000000000002';

UPDATE public.homepage_sections
SET
  published_version_id = '30000000-0000-0000-0000-000000000003',
  draft_version_id = '30000000-0000-0000-0000-000000000003'
WHERE id = '20000000-0000-0000-0000-000000000003';

UPDATE public.homepage_sections
SET
  published_version_id = '30000000-0000-0000-0000-000000000004',
  draft_version_id = '30000000-0000-0000-0000-000000000004'
WHERE id = '20000000-0000-0000-0000-000000000004';

UPDATE public.homepage_sections
SET
  published_version_id = '30000000-0000-0000-0000-000000000005',
  draft_version_id = '30000000-0000-0000-0000-000000000005'
WHERE id = '20000000-0000-0000-0000-000000000005';

UPDATE public.homepage_sections
SET
  published_version_id = '30000000-0000-0000-0000-000000000006',
  draft_version_id = '30000000-0000-0000-0000-000000000006'
WHERE id = '20000000-0000-0000-0000-000000000006';

-- ============================================================================
-- SAMPLE PRODUCT ASSOCIATIONS (requires existing products)
-- ============================================================================

-- Link featured products to the product carousel section
-- Note: These will only work if you have products with these IDs in your database
-- Uncomment and adjust IDs based on your actual product data

-- INSERT INTO public.section_products (section_id, product_id, display_order, metadata)
-- SELECT
--   '20000000-0000-0000-0000-000000000002',
--   id,
--   ROW_NUMBER() OVER (ORDER BY created_at DESC),
--   '{"badge": "Featured"}'::JSONB
-- FROM public.products
-- WHERE is_featured = true
-- LIMIT 8
-- ON CONFLICT (section_id, product_id) DO NOTHING;

-- ============================================================================
-- SAMPLE CATEGORY ASSOCIATIONS (requires existing categories)
-- ============================================================================

-- Link categories to the category grid section
-- Note: These will only work if you have categories in your database
-- Uncomment and adjust based on your actual category data

-- INSERT INTO public.section_categories (section_id, category_id, display_order, metadata)
-- SELECT
--   '20000000-0000-0000-0000-000000000003',
--   id,
--   ROW_NUMBER() OVER (ORDER BY name),
--   '{}'::JSONB
-- FROM public.categories
-- WHERE parent_id IS NULL
-- LIMIT 6
-- ON CONFLICT (section_id, category_id) DO NOTHING;

-- ============================================================================
-- SAMPLE SCHEDULE (Future Promo Banner)
-- ============================================================================

-- Schedule a winter sale banner to publish in the future
INSERT INTO public.section_schedules (section_id, version_id, publish_at, expire_at, status, notes)
VALUES
  (
    '20000000-0000-0000-0000-000000000005',
    '30000000-0000-0000-0000-000000000005',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    'pending',
    'Winter sale promotional banner - auto-publish in 30 days'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify sections were created
DO $$
DECLARE
  v_section_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_section_count FROM public.homepage_sections;
  RAISE NOTICE 'Created % homepage sections', v_section_count;
END $$;

-- Verify versions were created
DO $$
DECLARE
  v_version_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_version_count FROM public.section_versions;
  RAISE NOTICE 'Created % section versions', v_version_count;
END $$;

-- Test the get_homepage_content function
DO $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(row_to_json(r))
  INTO v_result
  FROM public.get_homepage_content('en') r;

  RAISE NOTICE 'Homepage content query returned % sections', jsonb_array_length(v_result);
END $$;
