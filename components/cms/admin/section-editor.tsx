/**
 * Section Editor - Admin Component
 *
 * Dynamic form for editing sections based on type.
 * Routes to type-specific editors.
 */

'use client';

import React from 'react';
import { Section } from '@/types/cms';
import { useCMS } from '@/lib/context/cms-context';
import { HeroSectionEditor } from './editors/hero-section-editor';
import { ProductCarouselSectionEditor } from './editors/product-carousel-section-editor';
import { TextBlockSectionEditor } from './editors/text-block-section-editor';
import { ImageBannerSectionEditor } from './editors/image-banner-section-editor';
import { CategoryGridSectionEditor } from './editors/category-grid-section-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export function SectionEditor() {
  const { homepage, activeSection, setActiveSection } = useCMS();

  if (!activeSection || !homepage) {
    return null;
  }

  const section = homepage.sections.find((s) => s.id === activeSection);

  if (!section) {
    return null;
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="capitalize">
          Edit {section.type.replace('_', ' ')}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveSection(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <SectionEditorRouter section={section} />
      </CardContent>
    </Card>
  );
}

/**
 * Routes to appropriate editor based on section type
 */
function SectionEditorRouter({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <HeroSectionEditor section={section} />;

    case 'product_carousel':
      return <ProductCarouselSectionEditor section={section} />;

    case 'text_block':
      return <TextBlockSectionEditor section={section} />;

    case 'image_banner':
      return <ImageBannerSectionEditor section={section} />;

    case 'category_grid':
      return <CategoryGridSectionEditor section={section} />;

    default:
      const _exhaustiveCheck: never = section;
      return <div>Unknown section type</div>;
  }
}
