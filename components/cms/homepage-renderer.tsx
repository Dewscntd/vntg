/**
 * Homepage Renderer - Storefront Component
 *
 * Server-side rendering of CMS-managed homepage sections.
 * Uses dynamic imports for code splitting.
 */

import React from 'react';
import { Section } from '@/types/cms';
import { HeroSection } from './sections/hero-section';
import { ProductCarouselSection } from './sections/product-carousel-section';
import { TextBlockSection } from './sections/text-block-section';
import { ImageBannerSection } from './sections/image-banner-section';
import { CategoryGridSection } from './sections/category-grid-section';

interface HomepageRendererProps {
  sections: Section[];
  isPreview?: boolean;
}

/**
 * Renders homepage sections in order.
 * Uses discriminated union for type-safe section rendering.
 */
export function HomepageRenderer({ sections, isPreview = false }: HomepageRendererProps) {
  // Filter out non-visible sections unless in preview mode
  const visibleSections = isPreview
    ? sections
    : sections.filter((section) => section.visible && section.status === 'published');

  // Sort by order
  const sortedSections = [...visibleSections].sort((a, b) => a.order - b.order);

  return (
    <div className="homepage-renderer">
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} isPreview={isPreview} />
      ))}
    </div>
  );
}

/**
 * Section Renderer - Routes to appropriate component based on type
 */
function SectionRenderer({ section, isPreview }: { section: Section; isPreview: boolean }) {
  // Wrap each section for consistent spacing and styling
  const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <section
      className="homepage-section"
      data-section-id={section.id}
      data-section-type={section.type}
    >
      {children}
    </section>
  );

  switch (section.type) {
    case 'hero':
      return (
        <WrapperComponent>
          <HeroSection section={section} isPreview={isPreview} />
        </WrapperComponent>
      );

    case 'product_carousel':
      return (
        <WrapperComponent>
          <ProductCarouselSection section={section} isPreview={isPreview} />
        </WrapperComponent>
      );

    case 'text_block':
      return (
        <WrapperComponent>
          <TextBlockSection section={section} isPreview={isPreview} />
        </WrapperComponent>
      );

    case 'image_banner':
      return (
        <WrapperComponent>
          <ImageBannerSection section={section} isPreview={isPreview} />
        </WrapperComponent>
      );

    case 'category_grid':
      return (
        <WrapperComponent>
          <CategoryGridSection section={section} isPreview={isPreview} />
        </WrapperComponent>
      );

    default:
      // Exhaustive check - TypeScript will error if we miss a case
      const _exhaustiveCheck: never = section;
      return null;
  }
}

// Export for use in pages
export default HomepageRenderer;
