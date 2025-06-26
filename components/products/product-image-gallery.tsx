'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Share2, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TouchIconButton } from '@/components/ui/touch-button';
import { ResponsiveImageGallery, GalleryImage } from '@/components/ui/responsive-image-gallery';
import { useSwipeableCarousel } from '@/lib/hooks/use-touch-gestures';
import { Badge } from '@/components/ui/badge';

export interface ProductImage extends GalleryImage {
  isMain?: boolean;
  color?: string;
  variant?: string;
}

export interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
  layout?: 'standard' | 'grid' | 'carousel' | 'masonry';
  showBadges?: boolean;
  showActions?: boolean;
  onImageSelect?: (image: ProductImage, index: number) => void;
  onWishlistToggle?: () => void;
  onShare?: () => void;
  isWishlisted?: boolean;
}

export function ProductImageGallery({
  images,
  productName,
  className,
  layout = 'standard',
  showBadges = true,
  showActions = true,
  onImageSelect,
  onWishlistToggle,
  onShare,
  isWishlisted = false,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // Filter images by variant if selected
  const filteredImages = selectedVariant
    ? images.filter((img) => img.variant === selectedVariant)
    : images;

  const currentImage = filteredImages[selectedIndex];

  // Get unique variants
  const variants = Array.from(new Set(images.map((img) => img.variant).filter(Boolean)));

  const handleImageChange = (index: number) => {
    setSelectedIndex(index);
    onImageSelect?.(filteredImages[index], index);
  };

  // Standard layout with main image and thumbnails
  if (layout === 'standard') {
    return (
      <div className={cn('w-full space-y-4', className)}>
        {/* Variant Selector */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedVariant === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedVariant(null)}
            >
              All
            </Button>
            {variants.map((variant) => (
              <Button
                key={variant}
                variant={selectedVariant === variant ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedVariant(variant || null)}
              >
                {variant}
              </Button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Thumbnail Column - Desktop */}
          <div className="hidden max-h-96 space-y-2 overflow-y-auto lg:col-span-1 lg:block">
            {filteredImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleImageChange(index)}
                className={cn(
                  'aspect-square w-full overflow-hidden rounded-lg border-2 transition-all',
                  selectedIndex === index
                    ? 'border-primary shadow-lg'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
              >
                <Image
                  src={image.thumbnail || image.src}
                  alt={`${productName} view ${index + 1}`}
                  width={100}
                  height={100}
                  className="h-full w-full object-cover"
                  sizes="100px"
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="lg:col-span-4">
            <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                placeholder={currentImage.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={currentImage.blurDataURL}
                priority={selectedIndex === 0}
                sizes="(max-width: 1024px) 100vw, 80vw"
              />

              {/* Image Badges */}
              {showBadges && (
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {currentImage.isMain && <Badge variant="secondary">Main</Badge>}
                  {currentImage.color && <Badge variant="outline">{currentImage.color}</Badge>}
                </div>
              )}

              {/* Action Buttons */}
              {showActions && (
                <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <TouchIconButton
                    icon={<ZoomIn />}
                    label="Zoom image"
                    size="md"
                    variant="secondary"
                    className="bg-white/90 shadow-lg hover:bg-white"
                  />

                  {onWishlistToggle && (
                    <TouchIconButton
                      icon={<Heart className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />}
                      label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      size="md"
                      variant="secondary"
                      onClick={onWishlistToggle}
                      className="bg-white/90 shadow-lg hover:bg-white"
                      haptic
                    />
                  )}

                  {onShare && (
                    <TouchIconButton
                      icon={<Share2 />}
                      label="Share image"
                      size="md"
                      variant="secondary"
                      onClick={onShare}
                      className="bg-white/90 shadow-lg hover:bg-white"
                    />
                  )}
                </div>
              )}

              {/* Navigation Arrows - Mobile */}
              {filteredImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4 lg:hidden">
                  <TouchIconButton
                    icon={<ChevronLeft />}
                    label="Previous image"
                    size="lg"
                    variant="secondary"
                    onClick={() =>
                      handleImageChange(
                        selectedIndex > 0 ? selectedIndex - 1 : filteredImages.length - 1
                      )
                    }
                    className="border-0 bg-black/50 text-white hover:bg-black/70"
                    haptic
                  />

                  <TouchIconButton
                    icon={<ChevronRight />}
                    label="Next image"
                    size="lg"
                    variant="secondary"
                    onClick={() =>
                      handleImageChange(
                        selectedIndex < filteredImages.length - 1 ? selectedIndex + 1 : 0
                      )
                    }
                    className="border-0 bg-black/50 text-white hover:bg-black/70"
                    haptic
                  />
                </div>
              )}

              {/* Image Counter */}
              {filteredImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                  {selectedIndex + 1} / {filteredImages.length}
                </div>
              )}
            </div>

            {/* Mobile Thumbnail Strip */}
            {filteredImages.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto pb-2 lg:hidden">
                {filteredImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageChange(index)}
                    className={cn(
                      'h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                      selectedIndex === index ? 'scale-105 border-primary' : 'border-transparent'
                    )}
                  >
                    <Image
                      src={image.thumbnail || image.src}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid layout
  if (layout === 'grid') {
    return (
      <div className={cn('w-full', className)}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleImageChange(index)}
              className="group relative aspect-square overflow-hidden rounded-lg transition-all hover:shadow-lg"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {showBadges && image.isMain && (
                <Badge className="absolute left-2 top-2" variant="secondary">
                  Main
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Carousel layout
  if (layout === 'carousel') {
    return (
      <div className={className}>
        <ResponsiveImageGallery
          images={filteredImages}
          aspectRatio="square"
          showThumbnails={true}
          showControls={true}
          showFullscreen={true}
          enableZoom={true}
          onImageChange={handleImageChange}
          onImageClick={onImageSelect}
        />
      </div>
    );
  }

  // Masonry layout
  if (layout === 'masonry') {
    return (
      <div className={cn('columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4', className)}>
        {filteredImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => handleImageChange(index)}
            className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-lg transition-all hover:shadow-lg"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width || 400}
              height={image.height || 600}
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {showBadges && image.isMain && (
              <Badge className="absolute left-2 top-2" variant="secondary">
                Main
              </Badge>
            )}
          </button>
        ))}
      </div>
    );
  }

  return null;
}
