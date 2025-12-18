/**
 * Product Carousel - Reusable Carousel Component
 *
 * GSAP-powered product carousel with configurable behavior.
 * Used in hero sections and standalone product carousel sections.
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCarouselConfig } from '@/types/cms';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/context/cart-context';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  discount_percent?: number;
  inventory_count: number;
  category?: string;
}

interface ProductCarouselProps {
  config: ProductCarouselConfig;
  products?: Product[];
}

export function ProductCarousel({ config, products = [] }: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const autoplayIntervalRef = useRef<NodeJS.Timeout>();
  const { addItem } = useCart();

  // Calculate items per view based on screen size
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return config.itemsPerView.desktop;

    const width = window.innerWidth;
    if (width < 768) return config.itemsPerView.mobile;
    if (width < 1024) return config.itemsPerView.tablet;
    return config.itemsPerView.desktop;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  // Update items per view on resize
  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.itemsPerView]);

  // Calculate max index
  const maxIndex = Math.max(0, products.length - itemsPerView);

  // Navigation functions
  const goToSlide = (index: number) => {
    if (!trackRef.current) return;

    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);

    const itemWidth = trackRef.current.children[0]?.clientWidth || 0;
    const gap = config.gap || 16;
    const offset = -(clampedIndex * (itemWidth + gap));

    const animationType = config.animation?.type || 'slide';
    const duration = (config.animation?.duration || 0.5) / 1000;

    switch (animationType) {
      case 'fade':
        gsap.to(trackRef.current, {
          opacity: 0,
          duration: duration / 2,
          onComplete: () => {
            gsap.set(trackRef.current, { x: offset });
            gsap.to(trackRef.current, {
              opacity: 1,
              duration: duration / 2,
            });
          },
        });
        break;

      case 'scale':
        gsap.to(trackRef.current, {
          scale: 0.95,
          x: offset,
          duration: duration / 2,
          ease: 'power2.in',
          onComplete: () => {
            gsap.to(trackRef.current, {
              scale: 1,
              duration: duration / 2,
              ease: 'power2.out',
            });
          },
        });
        break;

      case 'slide':
      default:
        gsap.to(trackRef.current, {
          x: offset,
          duration,
          ease: config.animation?.easing || 'power2.out',
        });
        break;
    }
  };

  const nextSlide = () => {
    if (config.loop && currentIndex === maxIndex) {
      goToSlide(0);
    } else {
      goToSlide(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (config.loop && currentIndex === 0) {
      goToSlide(maxIndex);
    } else {
      goToSlide(currentIndex - 1);
    }
  };

  // Autoplay
  useEffect(() => {
    if (config.autoplay?.enabled && !isDragging) {
      autoplayIntervalRef.current = setInterval(() => {
        nextSlide();
      }, config.autoplay.delay);
    }

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [config.autoplay, currentIndex, isDragging]);

  // Setup draggable
  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const draggableInstance = Draggable.create(trackRef.current, {
      type: 'x',
      bounds: containerRef.current,
      inertia: true,
      onDragStart: () => setIsDragging(true),
      onDragEnd: function () {
        setIsDragging(false);
        const itemWidth = trackRef.current!.children[0]?.clientWidth || 0;
        const gap = config.gap || 16;
        const newIndex = Math.round(-this.x / (itemWidth + gap));
        goToSlide(newIndex);
      },
    });

    return () => {
      draggableInstance[0].kill();
    };
  }, [products.length, itemsPerView]);

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No products to display
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex"
          style={{ gap: `${config.gap || 16}px` }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              config={config}
              itemsPerView={itemsPerView}
              onAddToCart={() => addItem(product.id, 1)}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {config.showArrows && products.length > itemsPerView && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 shadow-lg transition-opacity hover:bg-white',
              currentIndex === 0 && !config.loop && 'opacity-50 cursor-not-allowed'
            )}
            onClick={prevSlide}
            disabled={currentIndex === 0 && !config.loop}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 shadow-lg transition-opacity hover:bg-white',
              currentIndex === maxIndex && !config.loop && 'opacity-50 cursor-not-allowed'
            )}
            onClick={nextSlide}
            disabled={currentIndex === maxIndex && !config.loop}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {config.showDots && products.length > itemsPerView && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Product Card Component
 */
interface ProductCardProps {
  product: Product;
  config: ProductCarouselConfig;
  itemsPerView: number;
  onAddToCart: () => void;
}

function ProductCard({ product, config, itemsPerView, onAddToCart }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const finalPrice = product.discount_percent
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  // Hover effect
  useEffect(() => {
    if (!cardRef.current || !config.cardStyle?.hoverEffect) return;

    const card = cardRef.current;
    const effect = config.cardStyle.hoverEffect;

    const handleMouseEnter = () => {
      switch (effect) {
        case 'lift':
          gsap.to(card, {
            y: -8,
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            duration: 0.3,
            ease: 'power2.out',
          });
          break;

        case 'zoom':
          gsap.to(card.querySelector('img'), {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out',
          });
          break;
      }
    };

    const handleMouseLeave = () => {
      switch (effect) {
        case 'lift':
          gsap.to(card, {
            y: 0,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            duration: 0.3,
            ease: 'power2.out',
          });
          break;

        case 'zoom':
          gsap.to(card.querySelector('img'), {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
          break;
      }
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [config.cardStyle?.hoverEffect]);

  return (
    <div
      ref={cardRef}
      className="group relative flex-shrink-0 overflow-hidden rounded-lg bg-white shadow transition-shadow"
      style={{ width: `calc((100% - ${((itemsPerView - 1) * (config.gap || 16))}px) / ${itemsPerView})` }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url && (
            <OptimizedImage
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes={`(max-width: 768px) ${100 / config.itemsPerView.mobile}vw, (max-width: 1024px) ${100 / config.itemsPerView.tablet}vw, ${100 / config.itemsPerView.desktop}vw`}
            />
          )}

          {/* Discount Badge */}
          {product.discount_percent && (
            <Badge className="absolute left-2 top-2" variant="destructive">
              -{product.discount_percent}%
            </Badge>
          )}

          {/* Wishlist Button */}
          {config.cardStyle?.showWishlist && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                setIsWishlisted(!isWishlisted);
              }}
            >
              <Heart
                className={cn(
                  'h-5 w-5',
                  isWishlisted && 'fill-red-500 text-red-500'
                )}
              />
            </Button>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>

          {product.category && (
            <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              ${finalPrice.toFixed(2)}
            </span>
            {product.discount_percent && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {config.cardStyle?.showAddToCart && product.inventory_count > 0 && (
            <Button
              className="mt-3 w-full"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}

          {product.inventory_count === 0 && (
            <Badge variant="secondary" className="mt-3 w-full justify-center">
              Out of Stock
            </Badge>
          )}
        </div>
      </Link>
    </div>
  );
}
