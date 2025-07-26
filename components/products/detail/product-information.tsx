'use client';

import { useState } from 'react';
import { Minus, Plus, Share2, Heart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductPrice } from '@/components/products/product-price';
import { ProductBadge } from '@/components/products/product-badge';
import { ProductSpecifications } from '@/components/products/detail/product-specifications';
import { useAddToCart } from '@/lib/hooks';
import { useTranslations } from '@/lib/hooks/use-translations';

export interface ProductInformationProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    inventory_count: number;
    is_featured?: boolean;
    is_new?: boolean;
    is_sale?: boolean;
    discount_percent?: number;
    category?: {
      id: string;
      name: string;
    };
    specifications?: {
      size?: string;
      condition?: string;
      brand?: string;
      materials?: string;
    };
  };
  className?: string;
}

export function ProductInformation({ product, className }: ProductInformationProps) {
  const [quantity, setQuantity] = useState(1);
  const { isHebrew } = useTranslations();
  const [addToCart, { isLoading }] = useAddToCart({
    onSuccess: () => {
      // Could add a toast notification here
    },
  });

  const isOutOfStock = product.inventory_count <= 0;
  const maxQuantity = isOutOfStock ? 0 : product.inventory_count;

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, Math.min(value, maxQuantity)));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || quantity < 1) return;

    await addToCart({
      product_id: product.id,
      quantity,
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Product badges */}
      <div className="flex flex-wrap gap-2">
        {product.is_new && <ProductBadge type="new" />}
        {product.is_sale && <ProductBadge type="sale" value={product.discount_percent} />}
        {isOutOfStock && <ProductBadge type="out-of-stock" />}
        {product.is_featured && <ProductBadge type="featured" />}
      </div>

      {/* Product name and category */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        {product.category && (
          <div className="mt-1 text-sm text-muted-foreground">
            {isHebrew ? 'קטגוריה' : 'Category'}: {product.category.name}
          </div>
        )}
      </div>

      {/* Product price */}
      <div>
        <ProductPrice price={product.price} discount_percent={product.discount_percent} size="lg" />

        {/* Inventory status */}
        <div className="mt-2 text-sm">
          {isOutOfStock ? (
            <span className="text-destructive">
              {isHebrew ? 'אזל מהמלאי' : 'Out of stock'}
            </span>
          ) : product.inventory_count === 1 ? (
            <span className="text-green-600 dark:text-green-500">
              {isHebrew ? 'פריט אחד אחרון במלאי' : 'Last item in stock'}
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-500">
              {isHebrew 
                ? `במלאי (${product.inventory_count} זמינות)` 
                : `In stock (${product.inventory_count} available)`
              }
            </span>
          )}
        </div>
      </div>

      {/* Product description */}
      {product.description && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{product.description}</p>
        </div>
      )}

      {/* Product Specifications */}
      {product.specifications && (
        <ProductSpecifications 
          specifications={product.specifications}
          compact={false}
        />
      )}

      {/* Quantity selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isOutOfStock}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <div className="flex h-8 w-12 items-center justify-center border-y border-input bg-transparent text-center text-sm">
            {quantity}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQuantity || isOutOfStock}
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {maxQuantity > 0 
            ? (isHebrew ? `מקסימום: ${maxQuantity}` : `Max: ${maxQuantity}`)
            : (isHebrew ? 'אזל מהמלאי' : 'Out of stock')
          }
        </div>
      </div>

      {/* Add to cart button */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
        >
          {isLoading 
            ? (isHebrew ? 'מוסיף...' : 'Adding...') 
            : isOutOfStock 
              ? (isHebrew ? 'אזל מהמלאי' : 'Out of Stock') 
              : (isHebrew ? 'הוסף לעגלה' : 'Add to Cart')
          }
        </Button>
        <div className="flex space-x-3">
          <Button variant="outline" size="icon" className="h-11 w-11">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
          <Button variant="outline" size="icon" className="h-11 w-11">
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share product</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
