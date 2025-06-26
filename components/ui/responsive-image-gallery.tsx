'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  Maximize2,
  Download,
  Share2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TouchIconButton } from './touch-button';
import { useSwipeableCarousel, useZoomable } from '@/lib/hooks/use-touch-gestures';
import { microInteractions } from '@/lib/animations/micro-interactions';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
}

export interface ResponsiveImageGalleryProps {
  images: GalleryImage[];
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait' | 'auto';
  showThumbnails?: boolean;
  showControls?: boolean;
  showFullscreen?: boolean;
  enableZoom?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  onImageChange?: (index: number) => void;
  onImageClick?: (image: GalleryImage, index: number) => void;
}

export function ResponsiveImageGallery({
  images,
  className,
  aspectRatio = 'auto',
  showThumbnails = true,
  showControls = true,
  showFullscreen = true,
  enableZoom = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = true,
  onImageChange,
  onImageClick,
}: ResponsiveImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const mainImageRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const currentImage = images[currentIndex];

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  // Navigation functions
  const goToNext = () => {
    const nextIndex =
      currentIndex >= images.length - 1 ? (loop ? 0 : currentIndex) : currentIndex + 1;

    setCurrentIndex(nextIndex);
    onImageChange?.(nextIndex);
    resetZoom();
  };

  const goToPrevious = () => {
    const prevIndex =
      currentIndex <= 0 ? (loop ? images.length - 1 : currentIndex) : currentIndex - 1;

    setCurrentIndex(prevIndex);
    onImageChange?.(prevIndex);
    resetZoom();
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    onImageChange?.(index);
    resetZoom();
  };

  // Zoom functions
  const resetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoom = (scale: number) => {
    const newZoom = Math.max(1, Math.min(3, scale));
    setZoomLevel(newZoom);
    setIsZoomed(newZoom > 1);
  };

  const toggleZoom = () => {
    if (isZoomed) {
      resetZoom();
    } else {
      handleZoom(2);
    }
  };

  // Touch gesture support
  const swipeRef = useSwipeableCarousel({
    onNext: goToNext,
    onPrevious: goToPrevious,
    threshold: 50,
  });

  const zoomRef = useZoomable({
    onZoom: handleZoom,
    minScale: 1,
    maxScale: 3,
  });

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isFullscreen) {
      autoPlayRef.current = setInterval(goToNext, autoPlayInterval);

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, currentIndex, isFullscreen]);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    resetZoom();
  };

  const handleImageClick = () => {
    if (enableZoom && !isFullscreen) {
      toggleZoom();
    }
    onImageClick?.(currentImage, currentIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        case '+':
        case '=':
          handleZoom(zoomLevel + 0.5);
          break;
        case '-':
          handleZoom(zoomLevel - 0.5);
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, zoomLevel]);

  const MainImageDisplay = ({ inFullscreen = false }) => (
    <div
      ref={inFullscreen ? fullscreenRef : mainImageRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted',
        !inFullscreen && aspectRatioClasses[aspectRatio],
        inFullscreen && 'flex h-full w-full items-center justify-center'
      )}
    >
      <div
        ref={enableZoom ? zoomRef : swipeRef}
        className="relative h-full w-full cursor-pointer"
        onClick={handleImageClick}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill={!inFullscreen}
          width={inFullscreen ? currentImage.width : undefined}
          height={inFullscreen ? currentImage.height : undefined}
          className={cn(
            'object-cover transition-transform duration-300',
            inFullscreen ? 'max-h-full max-w-full object-contain' : 'object-cover'
          )}
          style={
            enableZoom
              ? {
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                }
              : undefined
          }
          placeholder={currentImage.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={currentImage.blurDataURL}
          priority={currentIndex === 0}
          sizes={
            inFullscreen ? '100vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          }
        />
      </div>

      {/* Image Controls */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 transition-opacity hover:opacity-100">
          <TouchIconButton
            icon={<ChevronLeft />}
            label="Previous image"
            size="lg"
            variant="secondary"
            onClick={goToPrevious}
            disabled={!loop && currentIndex === 0}
            className="border-0 bg-black/50 text-white hover:bg-black/70"
            haptic
          />

          <TouchIconButton
            icon={<ChevronRight />}
            label="Next image"
            size="lg"
            variant="secondary"
            onClick={goToNext}
            disabled={!loop && currentIndex === images.length - 1}
            className="border-0 bg-black/50 text-white hover:bg-black/70"
            haptic
          />
        </div>
      )}

      {/* Zoom Controls */}
      {enableZoom && (
        <div className="absolute right-4 top-4 flex space-x-2 opacity-0 transition-opacity hover:opacity-100">
          {isZoomed && (
            <TouchIconButton
              icon={<ZoomOut />}
              label="Zoom out"
              size="md"
              variant="secondary"
              onClick={() => handleZoom(zoomLevel - 0.5)}
              className="border-0 bg-black/50 text-white hover:bg-black/70"
            />
          )}

          <TouchIconButton
            icon={isZoomed ? <ZoomOut /> : <ZoomIn />}
            label={isZoomed ? 'Reset zoom' : 'Zoom in'}
            size="md"
            variant="secondary"
            onClick={toggleZoom}
            className="border-0 bg-black/50 text-white hover:bg-black/70"
          />
        </div>
      )}

      {/* Fullscreen Toggle */}
      {showFullscreen && !inFullscreen && (
        <TouchIconButton
          icon={<Maximize2 />}
          label="View fullscreen"
          size="md"
          variant="secondary"
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 border-0 bg-black/50 text-white hover:bg-black/70"
        />
      )}

      {/* Image Caption */}
      {currentImage.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-sm text-white">{currentImage.caption}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={cn('w-full space-y-4', className)}>
        {/* Main Image */}
        <MainImageDisplay />

        {/* Thumbnail Navigation */}
        {showThumbnails && images.length > 1 && (
          <div className="scrollbar-hide flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={cn(
                  'h-16 w-16 flex-shrink-0 touch-manipulation overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20',
                  currentIndex === index
                    ? 'scale-105 border-primary shadow-lg'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
              >
                <Image
                  src={image.thumbnail || image.src}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="text-center text-sm text-muted-foreground">
            {currentIndex + 1} of {images.length}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full w-full">
            <MainImageDisplay inFullscreen />

            {/* Fullscreen Controls */}
            <div className="absolute right-4 top-4 flex space-x-2">
              <TouchIconButton
                icon={<X />}
                label="Close fullscreen"
                size="lg"
                variant="secondary"
                onClick={toggleFullscreen}
                className="border-0 bg-black/50 text-white hover:bg-black/70"
                haptic
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
