/**
 * Image Banner Section - Storefront Component
 *
 * Renders a full-width image banner with optional link.
 */

import React from 'react';
import Link from 'next/link';
import { ImageBannerSection as ImageBannerSectionType } from '@/types/cms';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ImageBannerSectionProps {
  section: ImageBannerSectionType;
  isPreview?: boolean;
}

export function ImageBannerSection({
  section,
  isPreview = false,
}: ImageBannerSectionProps) {
  const { config } = section;

  const heightClasses = {
    sm: 'h-64',
    md: 'h-96',
    lg: 'h-[32rem]',
    xl: 'h-[40rem]',
  };

  const content = (
    <div className={`relative w-full ${heightClasses[config.height || 'md']}`}>
      <OptimizedImage
        src={config.image}
        alt={config.alt}
        fill
        className={`object-${config.objectFit || 'cover'}`}
        sizes="100vw"
        priority={false}
      />

      {/* Mobile image if provided */}
      {config.mobileImage && (
        <OptimizedImage
          src={config.mobileImage}
          alt={config.alt}
          fill
          className={`object-${config.objectFit || 'cover'} md:hidden`}
          sizes="100vw"
          priority={false}
        />
      )}
    </div>
  );

  if (config.link) {
    return (
      <Link href={config.link} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
