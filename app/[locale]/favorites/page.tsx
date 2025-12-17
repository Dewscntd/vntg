/**
 * Favorites/Wishlist Page
 *
 * Displays user's saved favorite products with full functionality.
 */

'use client';

import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { ProductPrice } from '@/components/products/product-price';
import { ProductBadge } from '@/components/products/product-badge';
import { useFavorites } from '@/lib/context/favorites-context';
import { useCartActions } from '@/lib/hooks/use-cart-actions';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function FavoritesPage() {
  const { items, isLoading, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCartWithToast } = useCartActions();
  const { toast } = useToast();
  const [movingToCart, setMovingToCart] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleMoveToCart = async (item: typeof items[0]) => {
    if (!item.product) return;

    setMovingToCart(item.product_id);
    try {
      await addToCartWithToast(item.product_id, item.product.name, 1);
      await removeFromFavorites(item.product_id);
      toast({
        title: 'Moved to cart',
        description: `${item.product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move item to cart',
        variant: 'destructive',
      });
    } finally {
      setMovingToCart(null);
    }
  };

  const handleRemove = async (productId: string, productName: string) => {
    setRemoving(productId);
    try {
      await removeFromFavorites(productId);
      toast({
        title: 'Removed from favorites',
        description: `${productName} has been removed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    } finally {
      setRemoving(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearFavorites();
      toast({
        title: 'Favorites cleared',
        description: 'All items have been removed from your favorites',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear favorites',
        variant: 'destructive',
      });
    }
  };

  // Calculate total value
  const totalValue = items.reduce((sum, item) => {
    if (!item.product) return sum;
    const price = item.product.discount_percent
      ? item.product.price * (1 - item.product.discount_percent / 100)
      : item.product.price;
    return sum + price;
  }, 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading favorites...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-semibold">Your Favorites</h1>

          <p className="mb-8 text-muted-foreground">
            Save your favorite items to find them easily later. Click the heart icon on any product
            to add it to your favorites.
          </p>

          <Button asChild>
            <Link href="/shop/women">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Favorites</h1>
          <p className="text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total value: <span className="font-semibold text-foreground">{totalValue.toFixed(2)} ₪</span>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          if (!item.product) return null;

          const isOutOfStock = item.product.inventory_count <= 0;
          const isMoving = movingToCart === item.product_id;
          const isRemoving = removing === item.product_id;

          return (
            <div
              key={item.id}
              className={cn(
                'group relative overflow-hidden rounded-lg border bg-background transition-all',
                (isRemoving || isMoving) && 'opacity-50 pointer-events-none'
              )}
            >
              <Link href={`/products/${item.product_id}`}>
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <LazyImage
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Badges */}
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {item.product.discount_percent && item.product.discount_percent > 0 && (
                      <ProductBadge type="sale" value={item.product.discount_percent} />
                    )}
                    {isOutOfStock && <ProductBadge type="out-of-stock" />}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item.product_id, item.product?.name || 'Product');
                    }}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-medium">{item.product.name}</h3>
                  <div className="mt-2">
                    <ProductPrice
                      price={item.product.price}
                      discount_percent={item.product.discount_percent}
                    />
                  </div>
                </div>
              </Link>

              {/* Move to Cart Button */}
              <div className="px-4 pb-4">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMoveToCart(item);
                  }}
                  disabled={isOutOfStock || isMoving}
                >
                  {isMoving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Moving...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Shopping */}
      <div className="mt-12 text-center">
        <p className="mb-4 text-muted-foreground">Looking for more?</p>
        <Button variant="outline" asChild>
          <Link href="/shop/women">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
