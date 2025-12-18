/**
 * Text Block Section - Storefront Component
 *
 * Renders rich text content with configurable styling.
 */

import React from 'react';
import { TextBlockSection as TextBlockSectionType } from '@/types/cms';
import { cn } from '@/lib/utils';

interface TextBlockSectionProps {
  section: TextBlockSectionType;
  isPreview?: boolean;
}

export function TextBlockSection({ section, isPreview = false }: TextBlockSectionProps) {
  const { config } = section;

  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none',
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  };

  const padding = config.padding || { top: 48, bottom: 48, left: 16, right: 16 };

  return (
    <div
      style={{
        backgroundColor: config.backgroundColor,
        paddingTop: `${padding.top}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        paddingRight: `${padding.right}px`,
      }}
    >
      <div
        className={cn(
          'prose prose-lg mx-auto',
          maxWidthClasses[config.maxWidth || 'lg'],
          alignmentClasses[config.alignment]
        )}
        dangerouslySetInnerHTML={{ __html: config.content }}
      />
    </div>
  );
}
