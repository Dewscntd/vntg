/**
 * Product List Item Component
 *
 * Horizontal card layout for list view display.
 * Shows product image on the left with details on the right.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { ProductBadge } from '@/components/products/product-badge';
import { ProductPrice } from '@/components/products/product-price';
import { FavoriteButton } from '@/components/products/favorite-button';
import { useCartActions } from '@/lib/hooks/use-cart-actions';

export interface ProductListItemProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    image_url: string | null;
    inventory_count: number;
    is_featured?: boolean;
    is_new?: boolean;
    is_sale?: boolean;
    discount_percent?: number;
    material?: string | null;
    country_of_origin?: string | null;
    category?: {
      id: string;
      name: string;
    };
  };
  className?: string;
  priority?: boolean;
}

export function ProductListItem({
  product,
  className,
  priority = false,
}: ProductListItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCartWithToast } = useCartActions();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isLoading) return;

    setIsLoading(true);
    try {
      await addToCartWithToast(product.id, product.name, 1);
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = product.inventory_count <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        'group flex gap-4 rounded-lg border bg-background p-4 transition-all hover:shadow-md md:gap-6',
        className
      )}
    >
      {/* Product Image */}
      <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded-md md:h-48 md:w-40">
        <LazyImage
          src={product.image_url}
          alt={product.name}
          fill
          sizes="160px"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          placeholder="skeleton"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_featured && <ProductBadge type="featured" />}
          {product.is_new && <ProductBadge type="new" />}
          {product.is_sale && <ProductBadge type="sale" value={product.discount_percent} />}
          {isOutOfStock && <ProductBadge type="out-of-stock" />}
        </div>

        {/* Favorite Button */}
        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton
            productId={product.id}
            productName={product.name}
            variant="overlay"
            size="sm"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          {/* Category */}
          {product.category && (
            <p className="mb-1 text-xs text-muted-foreground">{product.category.name}</p>
          )}

          {/* Name */}
          <h3 className="line-clamp-2 text-base font-medium md:text-lg">{product.name}</h3>

          {/* Material */}
          {product.material && (
            <p className="mt-1 text-sm text-muted-foreground">{product.material}</p>
          )}

          {/* Description */}
          {product.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">
              {product.description}
            </p>
          )}

          {/* Origin */}
          {product.country_of_origin && (
            <p className="mt-1 text-xs text-muted-foreground/70">{product.country_of_origin}</p>
          )}
        </div>

        {/* Price and Actions */}
        <div className="mt-4 flex items-center justify-between">
          <ProductPrice
            price={product.price}
            discount_percent={product.discount_percent}
            className="text-base md:text-lg"
          />

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className="h-9 px-4"
          >
            <ShoppingCart className="me-2 h-4 w-4" />
            {isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  );
}
