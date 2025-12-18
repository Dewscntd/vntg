/**
 * Homepage CMS Mock Data for Stub System
 *
 * Provides comprehensive mock data for the homepage CMS system when running
 * in stub mode (NEXT_PUBLIC_USE_STUBS=true). This enables full offline
 * development without Supabase connection.
 *
 * @see /docs/HOMEPAGE_CMS_SCHEMA.md for schema documentation
 * @see /docs/STUB_SYSTEM.md for stub system overview
 */

// Local type definitions for CMS tables (pending database migration)
// These will be replaced with Database['public']['Tables'] types after migration
interface HomepageSection {
  id: string;
  section_type: string;
  section_key: string;
  display_order: number;
  status: string;
  locale: string;
  is_active: boolean;
  published_version_id: string | null;
  draft_version_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface SectionVersion {
  id: string;
  section_id: string;
  version_number: number;
  content: Record<string, unknown>;
  status?: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  created_by: string | null;
  change_summary: string | null;
}

interface SectionSchedule {
  id: string;
  section_id: string;
  version_id: string | null;
  action?: string;
  scheduled_for?: string;
  publish_at: string | null;
  expire_at: string | null;
  executed_at: string | null;
  status: string;
  created_at: string;
  created_by: string | null;
  notes?: string | null;
  updated_at?: string;
}

interface SectionProduct {
  id: string;
  section_id: string;
  product_id: string;
  display_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

interface SectionCategory {
  id: string;
  section_id: string;
  category_id: string;
  display_order: number;
  custom_title?: string | null;
  custom_image?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

interface MediaAsset {
  id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string | null;
  storage_bucket: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MEDIA ASSETS
// ============================================================================

export const MOCK_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    file_path: 'homepage/hero-vintage-1.jpg',
    file_name: 'hero-vintage-1.jpg',
    file_size: 1024000,
    mime_type: 'image/jpeg',
    width: 1920,
    height: 1080,
    alt_text: 'Vintage clothing collection hero banner',
    caption: null,
    uploaded_by: '00000000-0000-0000-0000-000000000001', // admin user
    storage_bucket: 'homepage-media',
    metadata: {},
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    file_path: 'homepage/hero-vintage-2.jpg',
    file_name: 'hero-vintage-2.jpg',
    file_size: 980000,
    mime_type: 'image/jpeg',
    width: 1920,
    height: 1080,
    alt_text: 'Retro electronics collection hero banner',
    caption: null,
    uploaded_by: '00000000-0000-0000-0000-000000000001',
    storage_bucket: 'homepage-media',
    metadata: {},
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    file_path: 'homepage/promo-banner-sale.jpg',
    file_name: 'promo-banner-sale.jpg',
    file_size: 512000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 400,
    alt_text: 'Summer sale promotional banner',
    caption: null,
    uploaded_by: '00000000-0000-0000-0000-000000000001',
    storage_bucket: 'homepage-media',
    metadata: {},
    created_at: new Date('2024-06-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-06-01T00:00:00Z').toISOString(),
  },
];

// ============================================================================
// HOMEPAGE SECTIONS
// ============================================================================

export const MOCK_HOMEPAGE_SECTIONS: HomepageSection[] = [
  // Hero Banner
  {
    id: '20000000-0000-0000-0000-000000000001',
    section_type: 'hero_banner',
    section_key: 'hero-main',
    display_order: 1,
    status: 'published',
    locale: 'en',
    is_active: true,
    published_version_id: '30000000-0000-0000-0000-000000000001',
    draft_version_id: '30000000-0000-0000-0000-000000000001',
    metadata: {
      cssClasses: 'homepage-hero',
      analyticsTag: 'hero_main',
      autoplayCarousel: true,
      carouselInterval: 5000,
    },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Featured Products Carousel
  {
    id: '20000000-0000-0000-0000-000000000002',
    section_type: 'product_carousel',
    section_key: 'featured-products',
    display_order: 2,
    status: 'published',
    locale: 'en',
    is_active: true,
    published_version_id: '30000000-0000-0000-0000-000000000002',
    draft_version_id: '30000000-0000-0000-0000-000000000002',
    metadata: {
      cssClasses: 'featured-products-carousel',
      analyticsTag: 'featured_products',
      itemsPerView: 4,
      autoplay: false,
    },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Category Grid
  {
    id: '20000000-0000-0000-0000-000000000003',
    section_type: 'category_grid',
    section_key: 'shop-by-category',
    display_order: 3,
    status: 'published',
    locale: 'en',
    is_active: true,
    published_version_id: '30000000-0000-0000-0000-000000000003',
    draft_version_id: '30000000-0000-0000-0000-000000000003',
    metadata: {
      cssClasses: 'category-grid',
      analyticsTag: 'category_grid',
      gridColumns: 3,
    },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Text Block (Our Story)
  {
    id: '20000000-0000-0000-0000-000000000004',
    section_type: 'text_block',
    section_key: 'our-story',
    display_order: 4,
    status: 'published',
    locale: 'en',
    is_active: true,
    published_version_id: '30000000-0000-0000-0000-000000000004',
    draft_version_id: '30000000-0000-0000-0000-000000000004',
    metadata: {
      cssClasses: 'our-story-section',
      analyticsTag: 'our_story',
      textAlign: 'center',
    },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Promo Banner (Summer Sale)
  {
    id: '20000000-0000-0000-0000-000000000005',
    section_type: 'promo_banner',
    section_key: 'summer-sale-2025',
    display_order: 5,
    status: 'published',
    locale: 'en',
    is_active: true,
    published_version_id: '30000000-0000-0000-0000-000000000005',
    draft_version_id: '30000000-0000-0000-0000-000000000005',
    metadata: {
      cssClasses: 'promo-banner summer-sale',
      analyticsTag: 'summer_sale_2025',
      backgroundColor: '#FF6B6B',
    },
    created_at: new Date('2024-06-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-06-01T00:00:00Z').toISOString(),
  },

  // Newsletter Signup
  {
    id: '20000000-0000-0000-0000-000000000006',
    section_type: 'newsletter',
    section_key: 'newsletter-signup',
    display_order: 6,
    status: 'published',
    locale: 'en',
    is_active: true,
    published_version_id: '30000000-0000-0000-0000-000000000006',
    draft_version_id: '30000000-0000-0000-0000-000000000006',
    metadata: {
      cssClasses: 'newsletter-section',
      analyticsTag: 'newsletter_signup',
      provider: 'mailchimp',
    },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
];

// ============================================================================
// SECTION VERSIONS
// ============================================================================

export const MOCK_SECTION_VERSIONS: SectionVersion[] = [
  // Hero Banner Version 1
  {
    id: '30000000-0000-0000-0000-000000000001',
    section_id: '20000000-0000-0000-0000-000000000001',
    version_number: 1,
    content: {
      slides: [
        {
          id: 'slide-1',
          title: 'Discover Timeless Vintage',
          subtitle: 'Curated treasures from decades past',
          image_url: '/images/hero-vintage-1.jpg',
          video_url: null,
          overlay_opacity: 0.3,
          text_color: '#FFFFFF',
          text_position: 'center',
          cta: {
            text: 'Shop Collection',
            url: '/shop',
            style: 'primary',
          },
        },
        {
          id: 'slide-2',
          title: 'Retro Electronics Revival',
          subtitle: 'Bring back the golden age of tech',
          image_url: '/images/hero-vintage-2.jpg',
          video_url: null,
          overlay_opacity: 0.4,
          text_color: '#FFFFFF',
          text_position: 'left',
          cta: {
            text: 'Explore Electronics',
            url: '/shop?category=electronics',
            style: 'secondary',
          },
        },
      ],
      animation: 'fade',
      duration: 5000,
    },
    change_summary: 'Initial hero carousel with 2 slides',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_published: true,
    published_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Product Carousel Version 1
  {
    id: '30000000-0000-0000-0000-000000000002',
    section_id: '20000000-0000-0000-0000-000000000002',
    version_number: 1,
    content: {
      title: 'Featured Vintage Finds',
      subtitle: 'Hand-picked treasures just for you',
      viewAllLink: '/shop?featured=true',
      displayMode: 'carousel',
      showPrice: true,
      showAddToCart: true,
      badgeText: 'Featured',
    },
    change_summary: 'Initial featured products carousel',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_published: true,
    published_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Category Grid Version 1
  {
    id: '30000000-0000-0000-0000-000000000003',
    section_id: '20000000-0000-0000-0000-000000000003',
    version_number: 1,
    content: {
      title: 'Shop by Category',
      subtitle: 'Find exactly what you are looking for',
      layout: 'grid',
      columns: 3,
      showProductCount: true,
      imageStyle: 'cover',
    },
    change_summary: 'Initial category grid layout',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_published: true,
    published_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Text Block Version 1
  {
    id: '30000000-0000-0000-0000-000000000004',
    section_id: '20000000-0000-0000-0000-000000000004',
    version_number: 1,
    content: {
      title: 'Our Story',
      content:
        '<p>Welcome to VNTG, where every item tells a story. We curate authentic vintage pieces from the 1960s through the 1990s, bringing you the best of retro fashion, electronics, and collectibles.</p><p>Each piece in our collection is carefully selected for its quality, authenticity, and unique character. We believe in sustainable shopping and preserving the craftsmanship of previous eras.</p>',
      alignment: 'center',
      maxWidth: '800px',
      backgroundColor: '#F9F9F9',
    },
    change_summary: 'Initial our story content',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_published: true,
    published_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },

  // Promo Banner Version 1
  {
    id: '30000000-0000-0000-0000-000000000005',
    section_id: '20000000-0000-0000-0000-000000000005',
    version_number: 1,
    content: {
      title: 'Summer Sale 2025',
      subtitle: 'Up to 40% off vintage clothing',
      image_url: '/images/promo-banner-sale.jpg',
      backgroundColor: '#FF6B6B',
      textColor: '#FFFFFF',
      cta: {
        text: 'Shop Sale',
        url: '/shop?sale=true',
        style: 'light',
      },
      badge: {
        text: 'Limited Time',
        color: '#FFD93D',
      },
    },
    change_summary: 'Summer sale 2025 promotional banner',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_published: true,
    published_at: new Date('2024-06-01T00:00:00Z').toISOString(),
    created_at: new Date('2024-06-01T00:00:00Z').toISOString(),
  },

  // Newsletter Version 1
  {
    id: '30000000-0000-0000-0000-000000000006',
    section_id: '20000000-0000-0000-0000-000000000006',
    version_number: 1,
    content: {
      title: 'Stay in the Loop',
      subtitle: 'Get exclusive deals and new arrivals delivered to your inbox',
      placeholder: 'Enter your email address',
      buttonText: 'Subscribe',
      image_url: '/images/newsletter-bg.jpg',
      privacyText: 'We respect your privacy. Unsubscribe anytime.',
      successMessage: 'Thanks for subscribing!',
      layout: 'split',
    },
    change_summary: 'Initial newsletter signup form',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_published: true,
    published_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
];

// ============================================================================
// SECTION PRODUCTS (for product_carousel sections)
// ============================================================================

export const MOCK_SECTION_PRODUCTS: SectionProduct[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    section_id: '20000000-0000-0000-0000-000000000002', // featured-products
    product_id: '20000000-0000-0000-0000-000000000001', // From comprehensive-mock-data.ts
    display_order: 1,
    metadata: { badge: 'Featured' },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    section_id: '20000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000002',
    display_order: 2,
    metadata: { badge: 'Featured' },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    section_id: '20000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000003',
    display_order: 3,
    metadata: { badge: 'Featured' },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    section_id: '20000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000004',
    display_order: 4,
    metadata: { badge: 'Featured' },
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
];

// ============================================================================
// SECTION CATEGORIES (for category_grid sections)
// ============================================================================

export const MOCK_SECTION_CATEGORIES: SectionCategory[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    section_id: '20000000-0000-0000-0000-000000000003', // shop-by-category
    category_id: '30000000-0000-0000-0000-000000000001', // From initial schema
    display_order: 1,
    metadata: {},
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    section_id: '20000000-0000-0000-0000-000000000003',
    category_id: '30000000-0000-0000-0000-000000000002',
    display_order: 2,
    metadata: {},
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    section_id: '20000000-0000-0000-0000-000000000003',
    category_id: '30000000-0000-0000-0000-000000000003',
    display_order: 3,
    metadata: {},
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
];

// ============================================================================
// SECTION SCHEDULES
// ============================================================================

export const MOCK_SECTION_SCHEDULES: SectionSchedule[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    section_id: '20000000-0000-0000-0000-000000000005', // summer-sale
    version_id: '30000000-0000-0000-0000-000000000005',
    publish_at: new Date('2025-06-01T00:00:00Z').toISOString(),
    expire_at: new Date('2025-08-31T23:59:59Z').toISOString(),
    status: 'pending',
    executed_at: null,
    created_by: '00000000-0000-0000-0000-000000000001',
    notes: 'Summer sale 2025 - auto-publish June 1st, expire August 31st',
    created_at: new Date('2024-05-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-05-01T00:00:00Z').toISOString(),
  },
];

// ============================================================================
// HELPER FUNCTIONS FOR STUB INTEGRATION
// ============================================================================

/**
 * Get complete homepage content (simulates get_homepage_content RPC function)
 */
export function getHomepageContentStub(locale: string = 'en') {
  return MOCK_HOMEPAGE_SECTIONS.filter(
    (section) =>
      section.locale === locale && section.is_active && section.status === 'published'
  )
    .sort((a, b) => a.display_order - b.display_order)
    .map((section) => {
      const version = MOCK_SECTION_VERSIONS.find((v) => v.id === section.published_version_id);

      // Get associated products
      const products = MOCK_SECTION_PRODUCTS.filter((sp) => sp.section_id === section.id).map(
        (sp) => ({
          ...sp,
          // Product details would be joined from MOCK_PRODUCTS in comprehensive-mock-data.ts
        })
      );

      // Get associated categories
      const categories = MOCK_SECTION_CATEGORIES.filter((sc) => sc.section_id === section.id).map(
        (sc) => ({
          ...sc,
          // Category details would be joined from MOCK_CATEGORIES
        })
      );

      return {
        section_id: section.id,
        section_type: section.section_type,
        section_key: section.section_key,
        display_order: section.display_order,
        content: version?.content || {},
        metadata: section.metadata,
        products,
        categories,
      };
    });
}

/**
 * Simulate publish_section_version RPC function
 */
export function publishSectionVersionStub(
  sectionId: string,
  versionId: string
): {
  section_id: string;
  version_id: string;
  version_number: number;
  published_at: string;
} {
  const version = MOCK_SECTION_VERSIONS.find((v) => v.id === versionId);

  if (!version || version.section_id !== sectionId) {
    throw new Error(`Version ${versionId} does not belong to section ${sectionId}`);
  }

  // Simulate publish logic
  const publishedAt = new Date().toISOString();

  // Update mock data (in real implementation, this would update the database)
  const sectionIndex = MOCK_HOMEPAGE_SECTIONS.findIndex((s) => s.id === sectionId);
  if (sectionIndex !== -1) {
    MOCK_HOMEPAGE_SECTIONS[sectionIndex].published_version_id = versionId;
    MOCK_HOMEPAGE_SECTIONS[sectionIndex].status = 'published';
    MOCK_HOMEPAGE_SECTIONS[sectionIndex].updated_at = publishedAt;
  }

  const versionIndex = MOCK_SECTION_VERSIONS.findIndex((v) => v.id === versionId);
  if (versionIndex !== -1) {
    MOCK_SECTION_VERSIONS[versionIndex].is_published = true;
    MOCK_SECTION_VERSIONS[versionIndex].published_at = publishedAt;
  }

  return {
    section_id: sectionId,
    version_id: versionId,
    version_number: version.version_number,
    published_at: publishedAt,
  };
}

/**
 * Simulate revert_section_to_version RPC function
 */
export function revertSectionToVersionStub(
  sectionId: string,
  versionId: string
): {
  section_id: string;
  new_version_id: string;
  version_number: number;
  based_on_version: number;
} {
  const targetVersion = MOCK_SECTION_VERSIONS.find((v) => v.id === versionId);

  if (!targetVersion || targetVersion.section_id !== sectionId) {
    throw new Error(`Version ${versionId} not found for section ${sectionId}`);
  }

  // Get current max version number for this section
  const maxVersion = Math.max(
    ...MOCK_SECTION_VERSIONS.filter((v) => v.section_id === sectionId).map(
      (v) => v.version_number
    )
  );

  // Create new version based on target version
  const newVersion: SectionVersion = {
    id: `30000000-0000-0000-0000-${String(Date.now()).padStart(12, '0')}`,
    section_id: sectionId,
    version_number: maxVersion + 1,
    content: targetVersion.content,
    change_summary: `Reverted to version ${targetVersion.version_number}`,
    created_by: '00000000-0000-0000-0000-000000000001',
    is_published: false,
    published_at: null,
    created_at: new Date().toISOString(),
  };

  MOCK_SECTION_VERSIONS.push(newVersion);

  // Update section's draft version
  const sectionIndex = MOCK_HOMEPAGE_SECTIONS.findIndex((s) => s.id === sectionId);
  if (sectionIndex !== -1) {
    MOCK_HOMEPAGE_SECTIONS[sectionIndex].draft_version_id = newVersion.id;
    MOCK_HOMEPAGE_SECTIONS[sectionIndex].updated_at = new Date().toISOString();
  }

  return {
    section_id: sectionId,
    new_version_id: newVersion.id,
    version_number: newVersion.version_number,
    based_on_version: targetVersion.version_number,
  };
}

/**
 * Simulate process_scheduled_publishes RPC function
 */
export function processScheduledPublishesStub(): Array<{
  section_id: string;
  version_id: string;
  action: 'published' | 'expired';
}> {
  const results: Array<{ section_id: string; version_id: string; action: 'published' | 'expired' }> =
    [];
  const now = new Date();

  // Process pending schedules that should be published
  MOCK_SECTION_SCHEDULES.filter(
    (schedule) =>
      schedule.status === 'pending' &&
      schedule.publish_at &&
      schedule.version_id &&
      new Date(schedule.publish_at) <= now
  ).forEach((schedule) => {
    // Publish the version
    try {
      publishSectionVersionStub(schedule.section_id, schedule.version_id!);

      // Update schedule status
      const scheduleIndex = MOCK_SECTION_SCHEDULES.findIndex((s) => s.id === schedule.id);
      if (scheduleIndex !== -1) {
        MOCK_SECTION_SCHEDULES[scheduleIndex].status = 'active';
        MOCK_SECTION_SCHEDULES[scheduleIndex].executed_at = now.toISOString();
      }

      results.push({
        section_id: schedule.section_id,
        version_id: schedule.version_id!,
        action: 'published',
      });
    } catch (error) {
      console.error('Error publishing scheduled section:', error);
    }
  });

  // Process active schedules that should expire
  MOCK_SECTION_SCHEDULES.filter(
    (schedule) =>
      schedule.status === 'active' &&
      schedule.expire_at &&
      schedule.version_id &&
      new Date(schedule.expire_at) <= now
  ).forEach((schedule) => {
    // Archive the section
    const sectionIndex = MOCK_HOMEPAGE_SECTIONS.findIndex((s) => s.id === schedule.section_id);
    if (sectionIndex !== -1) {
      MOCK_HOMEPAGE_SECTIONS[sectionIndex].status = 'archived';
      MOCK_HOMEPAGE_SECTIONS[sectionIndex].updated_at = now.toISOString();
    }

    // Update schedule status
    const scheduleIndex = MOCK_SECTION_SCHEDULES.findIndex((s) => s.id === schedule.id);
    if (scheduleIndex !== -1) {
      MOCK_SECTION_SCHEDULES[scheduleIndex].status = 'expired';
    }

    results.push({
      section_id: schedule.section_id,
      version_id: schedule.version_id!,
      action: 'expired',
    });
  });

  return results;
}

// ============================================================================
// EXPORT ALL MOCK DATA
// ============================================================================

export const HOMEPAGE_CMS_MOCK_DATA = {
  media_assets: MOCK_MEDIA_ASSETS,
  homepage_sections: MOCK_HOMEPAGE_SECTIONS,
  section_versions: MOCK_SECTION_VERSIONS,
  section_schedules: MOCK_SECTION_SCHEDULES,
  section_products: MOCK_SECTION_PRODUCTS,
  section_categories: MOCK_SECTION_CATEGORIES,
};

// Export helper functions for RPC simulation
export const HOMEPAGE_CMS_RPC_STUBS = {
  get_homepage_content: getHomepageContentStub,
  publish_section_version: publishSectionVersionStub,
  revert_section_to_version: revertSectionToVersionStub,
  process_scheduled_publishes: processScheduledPublishesStub,
};
