'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePerformanceMonitor } from '@/lib/performance/performance-monitor';
import { Skeleton } from '@/components/ui/skeleton';

export interface LazyImageProps {
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
  placeholder?: 'blur' | 'skeleton' | 'none';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  rootMargin?: string;
  threshold?: number;
  fallbackSrc?: string;
}

export function LazyImage({
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
  placeholder = 'skeleton',
  blurDataURL,
  onLoad,
  onError,
  rootMargin = '50px',
  threshold = 0.1,
  fallbackSrc = '/images/placeholder.jpg',
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);
  const { startMeasure, endMeasure, recordMetric } = usePerformanceMonitor();
  const loadStartTime = useRef<number>(0);

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

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad, rootMargin, threshold]);

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);

    // Record image load performance
    if (loadStartTime.current > 0) {
      const loadTime = performance.now() - loadStartTime.current;
      recordMetric('ImageLoadTime', loadTime);

      // Log slow loading images
      if (loadTime > 2000) {
        console.warn(`Slow image load detected: ${src} took ${loadTime}ms`);
      }
    }

    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);

    // Record image error
    recordMetric('ImageLoadError', 1);
    console.warn(`Image failed to load: ${src}`);

    if (onError) onError();
  };

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  };

  const imageSrc = hasError ? fallbackSrc : src;
  const shouldShowImage = shouldLoad && imageSrc;

  // Start performance measurement when image starts loading
  useEffect(() => {
    if (shouldShowImage && !hasError) {
      loadStartTime.current = performance.now();
    }
  }, [shouldShowImage, hasError]);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Skeleton placeholder */}
      {placeholder === 'skeleton' && (isLoading || !shouldLoad) && (
        <Skeleton className="absolute inset-0" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <span className="text-xs text-muted-foreground">Image not available</span>
          </div>
        </div>
      )}

      {/* Image */}
      {shouldShowImage && (
        fill ? (
          <Image
            src={imageSrc}
            alt={alt}
            fill={true}
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder={placeholder === 'blur' ? 'blur' : undefined}
            blurDataURL={
              placeholder === 'blur' 
                ? blurDataURL || generateBlurDataURL(10, 10)
                : undefined
            }
            className={cn(
              'transition-all duration-500 ease-out',
              isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
              objectFitClasses[objectFit],
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <Image
            src={imageSrc}
            alt={alt}
            width={width || 500}
            height={height || 500}
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder={placeholder === 'blur' ? 'blur' : undefined}
            blurDataURL={
              placeholder === 'blur' 
                ? blurDataURL || generateBlurDataURL(width || 500, height || 500)
                : undefined
            }
            className={cn(
              'transition-all duration-500 ease-out',
              isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
              objectFitClasses[objectFit],
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        )
      )}

      {/* No image state */}
      {!src && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        </div>
      )}

      {/* Loading indicator for non-skeleton placeholder */}
      {placeholder !== 'skeleton' && isLoading && shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
