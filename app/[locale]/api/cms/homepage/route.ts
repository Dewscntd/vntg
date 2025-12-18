/**
 * CMS Homepage API Route
 *
 * Handles CRUD operations for homepage content management.
 * Uses stub data when NEXT_PUBLIC_USE_STUBS=true.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Homepage, Section, HeroSection, ProductCarouselSection, TextBlockSection, ImageBannerSection, CategoryGridSection } from '@/types/cms';

// Check if we're using stubs
const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === 'true';

// In-memory store for draft changes (in production, this would be in the database)
let draftHomepage: Homepage | null = null;

/**
 * Generate default homepage with sample sections
 */
function getDefaultHomepage(): Homepage {
  const now = new Date().toISOString();

  const sections: Section[] = [
    {
      id: 'hero-1',
      type: 'hero',
      status: 'published',
      order: 0,
      visible: true,
      created_at: now,
      updated_at: now,
      config: {
        headline: 'Discover Timeless Vintage',
        subheadline: 'Curated treasures from decades past',
        textAlignment: 'center',
        textColor: '#FFFFFF',
        backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
        overlayOpacity: 0.4,
        height: 'lg',
        contentPosition: 'center',
        primaryCta: {
          text: 'Shop Now',
          url: '/shop',
          variant: 'default',
        },
        secondaryCta: {
          text: 'Learn More',
          url: '/about',
          variant: 'outline',
        },
        animation: {
          enabled: true,
          type: 'fade',
          duration: 0.8,
        },
      },
    } as HeroSection,
    {
      id: 'products-1',
      type: 'product_carousel',
      status: 'published',
      order: 1,
      visible: true,
      title: 'Featured Products',
      subtitle: 'Handpicked vintage finds just for you',
      created_at: now,
      updated_at: now,
      config: {
        products: [],
        dynamicSelection: {
          enabled: true,
          source: 'featured',
          limit: 8,
          sortBy: 'created_at',
        },
        itemsPerView: {
          mobile: 1,
          tablet: 2,
          desktop: 4,
        },
        gap: 16,
        autoplay: {
          enabled: false,
          delay: 3000,
        },
        loop: true,
        showArrows: true,
        showDots: true,
        animation: {
          type: 'slide',
          duration: 0.3,
        },
        cardStyle: {
          hoverEffect: 'lift',
          showQuickView: true,
          showAddToCart: true,
          showWishlist: true,
        },
      },
    } as ProductCarouselSection,
    {
      id: 'categories-1',
      type: 'category_grid',
      status: 'published',
      order: 2,
      visible: true,
      created_at: now,
      updated_at: now,
      config: {
        title: 'Shop by Category',
        categories: [],
        columns: {
          mobile: 2,
          tablet: 3,
          desktop: 4,
        },
        cardStyle: 'overlay',
      },
    } as CategoryGridSection,
    {
      id: 'text-1',
      type: 'text_block',
      status: 'published',
      order: 3,
      visible: true,
      created_at: now,
      updated_at: now,
      config: {
        content: '<h2>Our Story</h2><p>We believe in the beauty of well-crafted vintage pieces. Each item in our collection has been carefully selected for its quality, history, and timeless appeal.</p>',
        alignment: 'center',
        maxWidth: 'lg',
        padding: {
          top: 64,
          bottom: 64,
          left: 16,
          right: 16,
        },
      },
    } as TextBlockSection,
    {
      id: 'banner-1',
      type: 'image_banner',
      status: 'published',
      order: 4,
      visible: true,
      created_at: now,
      updated_at: now,
      config: {
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
        alt: 'Summer collection promotional banner',
        height: 'md',
        objectFit: 'cover',
        link: '/collections/summer',
      },
    } as ImageBannerSection,
  ];

  return {
    id: 'homepage-1',
    sections,
    status: 'published',
    published_at: now,
    created_at: now,
    updated_at: now,
    metadata: {
      seo: {
        title: 'VNTG - Curated Vintage Collection',
        description: 'Discover timeless vintage pieces, carefully curated for the modern collector.',
      },
    },
  };
}

/**
 * GET /api/cms/homepage
 * Returns the current homepage configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Return draft if exists, otherwise default
    const homepage = draftHomepage || getDefaultHomepage();

    return NextResponse.json({
      homepage,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage', success: false },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cms/homepage
 * Save homepage draft
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections, status, metadata } = body;

    const now = new Date().toISOString();
    const currentHomepage = draftHomepage || getDefaultHomepage();

    // Update homepage
    draftHomepage = {
      ...currentHomepage,
      sections: sections || currentHomepage.sections,
      status: status || currentHomepage.status,
      metadata: metadata || currentHomepage.metadata,
      updated_at: now,
    };

    return NextResponse.json({
      homepage: draftHomepage,
      success: true,
    });
  } catch (error) {
    console.error('Error saving homepage:', error);
    return NextResponse.json(
      { error: 'Failed to save homepage', success: false },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/homepage
 * Publish homepage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'publish') {
      const now = new Date().toISOString();
      const currentHomepage = draftHomepage || getDefaultHomepage();

      draftHomepage = {
        ...currentHomepage,
        status: 'published',
        published_at: now,
        updated_at: now,
      };

      return NextResponse.json({
        homepage: draftHomepage,
        success: true,
        message: 'Homepage published successfully',
      });
    }

    if (action === 'revert') {
      // Revert to default (in production, revert to last published version)
      draftHomepage = getDefaultHomepage();

      return NextResponse.json({
        homepage: draftHomepage,
        success: true,
        message: 'Homepage reverted to published version',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action', success: false },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error publishing homepage:', error);
    return NextResponse.json(
      { error: 'Failed to process request', success: false },
      { status: 500 }
    );
  }
}
