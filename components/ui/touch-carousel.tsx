'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwipeableCarousel, useDismissible } from '@/lib/hooks/use-touch-gestures';
import { TouchIconButton } from './touch-button';

export interface TouchCarouselProps {
  children: ReactNode[];
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export function TouchCarousel({
  children,
  className,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = true,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: TouchCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = children.length;
  const maxIndex = totalItems - 1;

  // Gap classes
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  // Navigation functions
  const goToNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex >= maxIndex) {
      if (loop) {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex <= 0) {
      if (loop) {
        setCurrentIndex(maxIndex);
      }
    } else {
      setCurrentIndex(currentIndex - 1);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Touch gesture support
  const swipeRef = useSwipeableCarousel({
    onNext: goToNext,
    onPrevious: goToPrevious,
    threshold: 50
  });

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(goToNext, autoPlayInterval);
      
      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, currentIndex]);

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(goToNext, autoPlayInterval);
    }
  };

  return (
    <div 
      className={cn('relative w-full', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div 
        ref={swipeRef}
        className="relative overflow-hidden rounded-lg"
      >
        <div 
          className={cn(
            'flex transition-transform duration-300 ease-out',
            gapClasses[gap]
          )}
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView.mobile!)}%)`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className={cn(
                'flex-shrink-0',
                `w-full sm:w-1/${itemsPerView.tablet} lg:w-1/${itemsPerView.desktop}`
              )}
              style={{
                width: `${100 / itemsPerView.mobile!}%`
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <TouchIconButton
            icon={<ChevronLeft />}
            label="Previous slide"
            size="lg"
            variant="secondary"
            onClick={goToPrevious}
            disabled={!loop && currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
            haptic
          />
          <TouchIconButton
            icon={<ChevronRight />}
            label="Next slide"
            size="lg"
            variant="secondary"
            onClick={goToNext}
            disabled={!loop && currentIndex === maxIndex}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
            haptic
          />
        </>
      )}

      {/* Dots Indicator */}
      {showDots && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-200 touch-manipulation',
                currentIndex === index
                  ? 'bg-primary scale-110'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Touch-optimized image carousel
export interface TouchImageCarouselProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
  showThumbnails?: boolean;
  enableZoom?: boolean;
}

export function TouchImageCarousel({
  images,
  className,
  aspectRatio = 'video',
  showThumbnails = false,
  enableZoom = false
}: TouchImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    tall: 'aspect-[3/4]'
  };

  const imageSlides = images.map((image, index) => (
    <div key={index} className={cn('relative', aspectRatioClasses[aspectRatio])}>
      <img
        src={image.src}
        alt={image.alt}
        className={cn(
          'w-full h-full object-cover transition-transform duration-200',
          enableZoom && 'cursor-zoom-in'
        )}
        style={enableZoom ? { transform: `scale(${zoomScale})` } : undefined}
      />
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
          <p className="text-sm">{image.caption}</p>
        </div>
      )}
    </div>
  ));

  return (
    <div className={className}>
      <TouchCarousel
        showDots={!showThumbnails}
        showArrows={true}
        itemsPerView={{ mobile: 1, tablet: 1, desktop: 1 }}
      >
        {imageSlides}
      </TouchCarousel>

      {/* Thumbnail Navigation */}
      {showThumbnails && (
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all touch-manipulation',
                selectedIndex === index
                  ? 'border-primary scale-105'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <img
                src={image.src}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Dismissible card with swipe gestures
export interface DismissibleCardProps {
  children: ReactNode;
  className?: string;
  onDismiss?: (direction: 'left' | 'right') => void;
  dismissThreshold?: number;
  showDismissHint?: boolean;
}

export function DismissibleCard({
  children,
  className,
  onDismiss,
  dismissThreshold = 100,
  showDismissHint = false
}: DismissibleCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleDismiss = (direction: 'left' | 'right') => {
    setIsDismissed(true);
    onDismiss?.(direction);
  };

  const dismissRef = useDismissible({
    onDismiss: handleDismiss,
    threshold: dismissThreshold
  });

  if (isDismissed) {
    return null;
  }

  return (
    <div
      ref={dismissRef}
      className={cn(
        'relative transition-transform duration-200',
        className
      )}
      style={{ transform: `translateX(${swipeOffset}px)` }}
    >
      {children}

      {showDismissHint && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-muted/80 px-2 py-1 rounded">
          Swipe to dismiss
        </div>
      )}
    </div>
  );
}
