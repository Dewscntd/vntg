'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait' | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  progressive?: boolean;
  quality?: number;
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      fallbackSrc,
      showSkeleton = true,
      skeletonClassName,
      containerClassName,
      aspectRatio,
      objectFit = 'cover',
      className,
      onLoad,
      onError,
      lazy = true,
      progressive = true,
      quality = 75,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);
    const [isInView, setIsInView] = useState(!lazy);
    const containerRef = useRef<HTMLDivElement>(null);

    // Aspect ratio classes
    const aspectRatioClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      wide: 'aspect-[21/9]',
      portrait: 'aspect-[3/4]',
    };

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (!lazy || isInView) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [lazy, isInView]);

    // Handle image load
    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };

    // Handle image error
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);

      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(false);
        setIsLoading(true);
      } else {
        onError?.();
      }
    };

    // Progressive loading with low quality placeholder
    const getProgressiveSrc = () => {
      if (!progressive || !isInView) return currentSrc;

      // For progressive loading, we could implement different quality levels
      // This is a simplified version
      return currentSrc;
    };

    const containerClasses = cn(
      'relative overflow-hidden',
      typeof aspectRatio === 'string' && aspectRatioClasses[aspectRatio],
      typeof aspectRatio === 'number' && `aspect-[${aspectRatio}]`,
      containerClassName
    );

    const imageClasses = cn(
      'transition-opacity duration-300',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100',
      className
    );

    return (
      <div ref={containerRef} className={containerClasses}>
        {/* Skeleton Loader */}
        {showSkeleton && isLoading && (
          <div
            className={cn(
              'absolute inset-0 animate-pulse bg-muted',
              'flex items-center justify-center',
              skeletonClassName
            )}
          >
            <div className="h-8 w-8 rounded bg-muted-foreground/20" />
          </div>
        )}

        {/* Error State */}
        {hasError && !fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <div className="mx-auto mb-2 h-8 w-8 rounded bg-muted-foreground/20" />
              <p className="text-xs">Failed to load</p>
            </div>
          </div>
        )}

        {/* Main Image */}
        {isInView && (
          <Image
            ref={ref}
            src={getProgressiveSrc()}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={imageClasses}
            style={{ objectFit }}
            quality={quality}
            {...props}
          />
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

// Responsive image with multiple breakpoints
export interface ResponsiveImageProps extends OptimizedImageProps {
  srcSet?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveImage({
  src,
  srcSet,
  breakpoints = { mobile: 768, tablet: 1024, desktop: 1920 },
  sizes,
  ...props
}: ResponsiveImageProps) {
  // Generate sizes string if not provided
  const defaultSizes =
    sizes ||
    `
    (max-width: ${breakpoints.mobile}px) 100vw,
    (max-width: ${breakpoints.tablet}px) 50vw,
    33vw
  `
      .replace(/\s+/g, ' ')
      .trim();

  // Use srcSet if provided, otherwise use the main src
  const imageSrc = srcSet?.desktop || srcSet?.tablet || srcSet?.mobile || src;

  return <OptimizedImage src={imageSrc} sizes={defaultSizes} {...props} />;
}

// Image with zoom on hover
export interface ZoomImageProps extends OptimizedImageProps {
  zoomScale?: number;
  zoomDuration?: number;
}

export function ZoomImage({
  zoomScale = 1.1,
  zoomDuration = 300,
  className,
  ...props
}: ZoomImageProps) {
  return (
    <div className="overflow-hidden">
      <OptimizedImage
        className={cn('transition-transform duration-300 hover:scale-110', className)}
        style={
          {
            transitionDuration: `${zoomDuration}ms`,
            '--zoom-scale': zoomScale,
          } as React.CSSProperties
        }
        {...props}
      />
    </div>
  );
}

// Image with blur-to-clear effect
export interface BlurImageProps extends OptimizedImageProps {
  blurAmount?: number;
}

export function BlurImage({ blurAmount = 20, className, ...props }: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <OptimizedImage
      className={cn(
        'transition-all duration-700',
        !isLoaded && `blur-[${blurAmount}px] scale-105`,
        isLoaded && 'scale-100 blur-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}

// Image gallery with optimized loading
export interface ImageGridProps {
  images: Array<{
    src: string;
    alt: string;
    aspectRatio?: OptimizedImageProps['aspectRatio'];
  }>;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  onImageClick?: (index: number) => void;
}

export function ImageGrid({
  images,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className,
  onImageClick,
}: ImageGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const gridClasses = cn(
    'grid',
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onImageClick?.(index)}
          className="group relative overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            aspectRatio={image.aspectRatio || 'square'}
            className="transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </button>
      ))}
    </div>
  );
}
