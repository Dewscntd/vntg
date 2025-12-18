/**
 * CMS Validation Schemas
 *
 * Zod schemas for runtime validation and type inference.
 */

import { z } from 'zod';

// Base schemas
export const sectionTypeSchema = z.enum([
  'hero',
  'product_carousel',
  'text_block',
  'image_banner',
  'category_grid',
  'testimonials',
  'newsletter',
]);

export const sectionStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived']);

export const alignmentSchema = z.enum(['left', 'center', 'right']);

export const sizeSchema = z.enum(['sm', 'md', 'lg', 'xl']);

// Hero Section Schema
export const heroConfigSchema = z.object({
  backgroundImage: z.string().url().optional(),
  backgroundVideo: z.string().url().optional(),
  backgroundGradient: z
    .object({
      from: z.string(),
      to: z.string(),
      direction: z.enum(['to-r', 'to-l', 'to-t', 'to-b', 'to-br']),
    })
    .optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  headline: z.string().min(1, 'Headline is required').max(200),
  subheadline: z.string().max(300).optional(),
  description: z.string().max(500).optional(),
  textAlignment: alignmentSchema,
  textColor: z.string().optional(),
  primaryCta: z
    .object({
      text: z.string().min(1).max(50),
      url: z.string().min(1),
      variant: z.enum(['default', 'outline', 'ghost']).optional(),
    })
    .optional(),
  secondaryCta: z
    .object({
      text: z.string().min(1).max(50),
      url: z.string().min(1),
      variant: z.enum(['default', 'outline', 'ghost']).optional(),
    })
    .optional(),
  carousel: z.any().optional(), // Will be defined below
  height: z.enum(['sm', 'md', 'lg', 'xl', 'full']).optional(),
  contentPosition: z.enum(['top', 'center', 'bottom']).optional(),
  animation: z
    .object({
      enabled: z.boolean(),
      type: z.enum(['fade', 'slide', 'zoom']),
      duration: z.number().positive().optional(),
    })
    .optional(),
});

export const heroSectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('hero'),
  status: sectionStatusSchema,
  order: z.number().int().min(0),
  visible: z.boolean(),
  scheduled_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  config: heroConfigSchema,
  metadata: z.record(z.unknown()).optional(),
});

// Product Carousel Schema
export const productCarouselConfigSchema = z.object({
  products: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        order: z.number().int().min(0),
      })
    )
    .min(1, 'At least one product is required'),
  dynamicSelection: z
    .object({
      enabled: z.boolean(),
      source: z.enum(['featured', 'new_arrivals', 'best_sellers', 'category']),
      categoryId: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(50),
      sortBy: z.enum(['created_at', 'price', 'popularity']).optional(),
    })
    .optional(),
  itemsPerView: z.object({
    mobile: z.number().int().min(1).max(3),
    tablet: z.number().int().min(2).max(4),
    desktop: z.number().int().min(3).max(6),
  }),
  gap: z.number().int().min(0).max(100).optional(),
  autoplay: z
    .object({
      enabled: z.boolean(),
      delay: z.number().int().min(1000).max(10000),
    })
    .optional(),
  loop: z.boolean().optional(),
  showArrows: z.boolean().optional(),
  showDots: z.boolean().optional(),
  animation: z
    .object({
      type: z.enum(['slide', 'fade', 'scale']),
      duration: z.number().positive(),
      easing: z.string().optional(),
    })
    .optional(),
  cardStyle: z
    .object({
      showQuickView: z.boolean().optional(),
      showAddToCart: z.boolean().optional(),
      showWishlist: z.boolean().optional(),
      hoverEffect: z.enum(['lift', 'zoom', 'none']).optional(),
    })
    .optional(),
});

export const productCarouselSectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('product_carousel'),
  status: sectionStatusSchema,
  order: z.number().int().min(0),
  visible: z.boolean(),
  title: z.string().max(100).optional(),
  subtitle: z.string().max(200).optional(),
  scheduled_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  config: productCarouselConfigSchema,
  metadata: z.record(z.unknown()).optional(),
});

// Text Block Schema
export const textBlockConfigSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  alignment: alignmentSchema,
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', 'full']).optional(),
  backgroundColor: z.string().optional(),
  padding: z
    .object({
      top: z.number().int().min(0).max(200),
      bottom: z.number().int().min(0).max(200),
      left: z.number().int().min(0).max(200),
      right: z.number().int().min(0).max(200),
    })
    .optional(),
});

export const textBlockSectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('text_block'),
  status: sectionStatusSchema,
  order: z.number().int().min(0),
  visible: z.boolean(),
  scheduled_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  config: textBlockConfigSchema,
  metadata: z.record(z.unknown()).optional(),
});

// Image Banner Schema
export const imageBannerConfigSchema = z.object({
  image: z.string().url('Valid image URL is required'),
  mobileImage: z.string().url().optional(),
  alt: z.string().min(1, 'Alt text is required').max(200),
  link: z.string().optional(),
  height: sizeSchema.optional(),
  objectFit: z.enum(['cover', 'contain', 'fill']).optional(),
});

export const imageBannerSectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('image_banner'),
  status: sectionStatusSchema,
  order: z.number().int().min(0),
  visible: z.boolean(),
  scheduled_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  config: imageBannerConfigSchema,
  metadata: z.record(z.unknown()).optional(),
});

// Category Grid Schema
export const categoryGridConfigSchema = z.object({
  title: z.string().max(100).optional(),
  categories: z
    .array(
      z.object({
        category_id: z.string().uuid(),
        order: z.number().int().min(0),
        customImage: z.string().url().optional(),
        customTitle: z.string().max(100).optional(),
      })
    )
    .min(1, 'At least one category is required'),
  columns: z.object({
    mobile: z.number().int().min(1).max(3),
    tablet: z.number().int().min(2).max(4),
    desktop: z.number().int().min(3).max(6),
  }),
  cardStyle: z.enum(['overlay', 'below', 'minimal']).optional(),
});

export const categoryGridSectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('category_grid'),
  status: sectionStatusSchema,
  order: z.number().int().min(0),
  visible: z.boolean(),
  scheduled_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  config: categoryGridConfigSchema,
  metadata: z.record(z.unknown()).optional(),
});

// Union schema for any section
export const sectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  productCarouselSectionSchema,
  textBlockSectionSchema,
  imageBannerSectionSchema,
  categoryGridSectionSchema,
]);

// Homepage Schema
export const homepageSchema = z.object({
  id: z.string().uuid().optional(),
  sections: z.array(sectionSchema),
  status: z.enum(['draft', 'published']),
  published_at: z.string().datetime().optional(),
  metadata: z
    .object({
      seo: z
        .object({
          title: z.string().max(60).optional(),
          description: z.string().max(160).optional(),
          ogImage: z.string().url().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Export types inferred from schemas
export type HeroSectionInput = z.infer<typeof heroSectionSchema>;
export type ProductCarouselSectionInput = z.infer<typeof productCarouselSectionSchema>;
export type TextBlockSectionInput = z.infer<typeof textBlockSectionSchema>;
export type ImageBannerSectionInput = z.infer<typeof imageBannerSectionSchema>;
export type CategoryGridSectionInput = z.infer<typeof categoryGridSectionSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type HomepageInput = z.infer<typeof homepageSchema>;
