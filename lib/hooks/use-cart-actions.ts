'use client';

import { useCallback } from 'react';
import { useCart } from '@/lib/context/cart-context';
import { useToast } from './use-toast';

export function useCartActions() {
  const { addItem, removeItem, updateQuantity, openCart } = useCart();
  const { toast } = useToast();

  const addToCartWithToast = useCallback(
    async (productId: string, productName: string, quantity: number = 1) => {
      try {
        await addItem(productId, quantity);
        
        toast({
          title: 'Added to cart',
          description: `${productName} has been added to your cart`,
          action: {
            label: 'View Cart',
            onClick: openCart,
          },
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add item to cart. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [addItem, toast, openCart]
  );

  const removeFromCartWithToast = useCallback(
    async (itemId: string, productName: string) => {
      try {
        await removeItem(itemId);
        
        toast({
          title: 'Item removed',
          description: `${productName} has been removed from your cart`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove item from cart. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [removeItem, toast]
  );

  const updateQuantityWithToast = useCallback(
    async (itemId: string, quantity: number, productName: string) => {
      try {
        await updateQuantity(itemId, quantity);
        
        toast({
          title: 'Cart updated',
          description: `${productName} quantity updated to ${quantity}`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update cart item. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [updateQuantity, toast]
  );

  return {
    addToCartWithToast,
    removeFromCartWithToast,
    updateQuantityWithToast,
  };
}
