'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ProductImageProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  containerClassName?: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | '9:16';
  objectFit?: 'contain' | 'cover' | 'fill';
  onLoad?: () => void;
  onError?: () => void;
}

export function ProductImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 80,
  className,
  containerClassName,
  aspectRatio = '1:1',
  objectFit = 'cover',
  onLoad,
  onError,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Define aspect ratio classes
  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-[16/9]',
    '3:4': 'aspect-[3/4]',
    '9:16': 'aspect-[9/16]',
  };

  // Define object fit classes
  const objectFitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  // Placeholder image for errors
  const placeholderImage = '/images/placeholder.jpg';

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Loading skeleton */}
      {isLoading && <div className="absolute inset-0 animate-pulse bg-muted" />}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Image not available</span>
        </div>
      )}

      {/* Image */}
      {src ? (
        fill ? (
          <Image
            src={hasError ? placeholderImage : src}
            alt={alt}
            fill={true}
            sizes={sizes}
            priority={priority}
            quality={quality}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
              objectFitClasses[objectFit],
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <Image
            src={hasError ? placeholderImage : src}
            alt={alt}
            width={width || 500}
            height={height || 500}
            sizes={sizes}
            priority={priority}
            quality={quality}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
              objectFitClasses[objectFit],
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm text-muted-foreground">No image</span>
        </div>
      )}
    </div>
  );
}
