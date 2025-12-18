/**
 * CMS Type System
 *
 * Domain-driven design for homepage content management.
 * All section types extend from a base Section interface.
 */

// Base types
export type SectionType =
  | 'hero'
  | 'product_carousel'
  | 'text_block'
  | 'image_banner'
  | 'category_grid'
  | 'testimonials'
  | 'newsletter';

export type SectionStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export type AlignmentType = 'left' | 'center' | 'right';
export type SizeType = 'sm' | 'md' | 'lg' | 'xl';

// Base Section Interface (All sections extend this)
export interface BaseSection {
  id: string;
  type: SectionType;
  status: SectionStatus;
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
}

// Hero Section Configuration
export interface HeroConfig {
  // Visual Elements
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundGradient?: {
    from: string;
    to: string;
    direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br';
  };
  overlayOpacity?: number;

  // Content
  headline: string;
  subheadline?: string;
  description?: string;
  textAlignment: AlignmentType;
  textColor?: string;

  // Call-to-Actions
  primaryCta?: {
    text: string;
    url: string;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryCta?: {
    text: string;
    url: string;
    variant?: 'default' | 'outline' | 'ghost';
  };

  // Carousel Configuration
  carousel?: ProductCarouselConfig;

  // Layout
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  contentPosition?: 'top' | 'center' | 'bottom';

  // Animation
  animation?: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'zoom';
    duration?: number;
  };
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  config: HeroConfig;
}

// Product Carousel Configuration
export interface ProductCarouselConfig {
  // Product Selection
  products: Array<{
    product_id: string;
    order: number;
  }>;

  // Or Dynamic Selection
  dynamicSelection?: {
    enabled: boolean;
    source: 'featured' | 'new_arrivals' | 'best_sellers' | 'category';
    categoryId?: string;
    limit: number;
    sortBy?: 'created_at' | 'price' | 'popularity';
  };

  // Display Settings
  itemsPerView: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: number;

  // Carousel Behavior
  autoplay?: {
    enabled: boolean;
    delay: number;
  };
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;

  // Animation
  animation?: {
    type: 'slide' | 'fade' | 'scale';
    duration: number;
    easing?: string;
  };

  // Card Style
  cardStyle?: {
    showQuickView?: boolean;
    showAddToCart?: boolean;
    showWishlist?: boolean;
    hoverEffect?: 'lift' | 'zoom' | 'none';
  };
}

export interface ProductCarouselSection extends BaseSection {
  type: 'product_carousel';
  title?: string;
  subtitle?: string;
  config: ProductCarouselConfig;
}

// Text Block Configuration
export interface TextBlockConfig {
  content: string; // Rich text HTML
  alignment: AlignmentType;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  backgroundColor?: string;
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface TextBlockSection extends BaseSection {
  type: 'text_block';
  config: TextBlockConfig;
}

// Image Banner Configuration
export interface ImageBannerConfig {
  image: string;
  mobileImage?: string;
  alt: string;
  link?: string;
  height?: SizeType;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export interface ImageBannerSection extends BaseSection {
  type: 'image_banner';
  config: ImageBannerConfig;
}

// Category Grid Configuration
export interface CategoryGridConfig {
  title?: string;
  categories: Array<{
    category_id: string;
    order: number;
    customImage?: string;
    customTitle?: string;
  }>;
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  cardStyle?: 'overlay' | 'below' | 'minimal';
}

export interface CategoryGridSection extends BaseSection {
  type: 'category_grid';
  config: CategoryGridConfig;
}

// Union type of all section types
export type Section =
  | HeroSection
  | ProductCarouselSection
  | TextBlockSection
  | ImageBannerSection
  | CategoryGridSection;

// Homepage Configuration
export interface Homepage {
  id: string;
  sections: Section[];
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    seo?: {
      title?: string;
      description?: string;
      ogImage?: string;
    };
  };
}

// API Response Types
export interface HomepageResponse {
  homepage: Homepage;
  products?: Record<string, any>; // Populated products for carousels
  categories?: Record<string, any>; // Populated categories
}

// Editor State Types
export interface EditorState {
  homepage: Homepage;
  isDirty: boolean;
  isSaving: boolean;
  activeSection: string | null;
  draggedSection: string | null;
  previewMode: boolean;
}

// Form Types for Section Editors
export type SectionFormData<T extends Section = Section> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// Validation Schemas will be defined in lib/validations/cms.ts
