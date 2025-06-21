'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { ProductBadge } from '@/components/products/product-badge';
import { ProductPrice } from '@/components/products/product-price';
import { useCartActions } from '@/lib/hooks/use-cart-actions';
import {
  useProductCardAnimation,
  useEnhancedAddToCartAnimation,
  useProductBadgeAnimation,
  useProductImageZoom
} from '@/lib/hooks/use-gsap';
import { useRippleEffect } from '@/lib/hooks/use-enhanced-interactions';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    inventory_count: number;
    is_featured?: boolean;
    is_new?: boolean;
    is_sale?: boolean;
    discount_percent?: number;
    category?: {
      id: string;
      name: string;
    };
  };
  className?: string;
  onQuickView?: (productId: string) => void;
  priority?: boolean;
  animationVariant?: 'default' | 'magnetic';
  enableImageZoom?: boolean;
}

export function ProductCard({
  product,
  className,
  onQuickView,
  priority = false,
  animationVariant = 'default',
  enableImageZoom = true
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCartWithToast } = useCartActions();

  // Enhanced GSAP animations
  const cardRef = useProductCardAnimation(animationVariant);
  const imageRef = useProductImageZoom();
  const { ref: badgeRef, animateEntrance: animateBadges } = useProductBadgeAnimation();
  const { ref: addToCartRef, animate: animateAddToCart } = useEnhancedAddToCartAnimation();
  const rippleRef = useRippleEffect('rgba(255, 255, 255, 0.4)');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation(); // Prevent event bubbling

    if (isOutOfStock || isLoading) return;

    setIsLoading(true);

    // Animate the button
    animateAddToCart('[data-cart-icon]');

    try {
      await addToCartWithToast(product.id, product.name, 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product.id);
    }
  };

  const isOutOfStock = product.inventory_count <= 0;

  // Animate badges on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      animateBadges();
    }, 100);

    return () => clearTimeout(timer);
  }, [animateBadges]);

  return (
    <div
      ref={cardRef}
      data-product-card
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-background transition-all',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div
          ref={enableImageZoom ? imageRef : undefined}
          className="relative aspect-square overflow-hidden"
        >
          <LazyImage
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="transition-transform duration-500"
            placeholder="skeleton"
          />

          {/* Product badges with animation */}
          <div
            ref={badgeRef}
            className="absolute left-2 top-2 flex flex-col gap-1"
          >
            {product.is_featured && <ProductBadge variant="featured" />}
            {product.is_new && <ProductBadge variant="new" />}
            {product.is_sale && <ProductBadge variant="sale" />}
            {isOutOfStock && <ProductBadge variant="out-of-stock" />}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" />

          {/* Hover Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <Button
              ref={(el) => {
                if (addToCartRef.current) addToCartRef.current = el;
                if (rippleRef.current) rippleRef.current = el;
              }}
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="flex-1 h-8 text-xs relative overflow-hidden"
            >
              <ShoppingCart className="h-3 w-3 mr-1" data-cart-icon />
              {isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {onQuickView && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleQuickView}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-3 w-3" />
                <span className="sr-only">Quick view</span>
              </Button>
            )}
          </div>
        </div>

        <div className="p-4" data-content>
          {product.category && (
            <div className="mb-1 text-xs text-muted-foreground">{product.category.name}</div>
          )}
          <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
          <div className="mt-1">
            <ProductPrice
              price={product.price}
              discount_percent={product.discount_percent}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
