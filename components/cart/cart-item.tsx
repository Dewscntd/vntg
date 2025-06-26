'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { ProductPrice } from '@/components/products/product-price';
import { useCart } from '@/lib/context/cart-context';
import { useToast } from '@/lib/hooks/use-toast';
import { useGSAP } from '@/lib/hooks/use-gsap';
import { useCartItemAnimation } from '@/lib/hooks/use-cart-animations';
import { cn } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/lib/context/cart-context';

export interface CartItemProps {
  item: CartItemType;
  className?: string;
  compact?: boolean;
}

export function CartItem({ item, className, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem, isLoading } = useCart();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { itemRef, slideOut, updateQuantity: animateQuantityUpdate } = useCartItemAnimation();

  // Enhanced GSAP animation for item removal
  useGSAP(
    ({ timeline }) => {
      if (isRemoving) {
        slideOut();
      }
    },
    [isRemoving, slideOut]
  );

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.inventory_count) return;
    if (newQuantity === item.quantity) return;

    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);

      // Animate quantity update
      animateQuantityUpdate();

      toast({
        title: 'Cart updated',
        description: `${item.product.name} quantity updated to ${newQuantity}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cart item',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeItem(item.id);
      toast({
        title: 'Item removed',
        description: `${item.product.name} removed from cart`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      });
      setIsRemoving(false);
    }
  };

  const itemPrice = item.product.discount_percent
    ? item.product.price * (1 - item.product.discount_percent / 100)
    : item.product.price;

  const totalPrice = itemPrice * item.quantity;

  if (compact) {
    return (
      <div
        ref={itemRef}
        data-cart-item
        className={cn(
          'flex items-center gap-3 py-2',
          isRemoving && 'pointer-events-none',
          className
        )}
      >
        {/* Product Image */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
          <LazyImage
            src={item.product.image_url}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${item.product.id}`}
            className="line-clamp-1 text-sm font-medium hover:text-primary"
          >
            {item.product.name}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground" data-quantity>
              Qty: {item.quantity}
            </span>
            <ProductPrice price={totalPrice} className="text-xs font-medium" />
          </div>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isLoading || isRemoving}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        >
          {isRemoving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={itemRef}
      data-cart-item
      className={cn('flex gap-4 py-4', isRemoving && 'pointer-events-none', className)}
    >
      {/* Product Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        <LazyImage
          src={item.product.image_url}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 space-y-2">
        {/* Product Name */}
        <Link
          href={`/products/${item.product.id}`}
          className="line-clamp-2 font-medium hover:text-primary"
        >
          {item.product.name}
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <ProductPrice
            price={item.product.price}
            discount_percent={item.product.discount_percent}
            className="text-sm"
          />
          {item.quantity > 1 && (
            <span className="text-xs text-muted-foreground">× {item.quantity}</span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating || isLoading}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>

            <span className="min-w-[2rem] px-3 py-1 text-center text-sm font-medium" data-quantity>
              {isUpdating ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : item.quantity}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.product.inventory_count || isUpdating || isLoading}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>

          {/* Stock Warning */}
          {item.quantity >= item.product.inventory_count && (
            <span className="text-xs text-orange-600">Max stock reached</span>
          )}
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between">
          <ProductPrice price={totalPrice} className="font-semibold" />

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading || isRemoving}
            className="text-muted-foreground hover:text-destructive"
          >
            {isRemoving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
