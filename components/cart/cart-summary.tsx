'use client';

import Link from 'next/link';
import { CreditCard, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/context/cart-context';
import { cn } from '@/lib/utils';

export interface CartSummaryProps {
  className?: string;
  showCheckoutButton?: boolean;
  showContinueShoppingButton?: boolean;
  compact?: boolean;
}

export function CartSummary({
  className,
  showCheckoutButton = true,
  showContinueShoppingButton = true,
  compact = false,
}: CartSummaryProps) {
  const { items, total, itemCount } = useCart();

  // Calculate summary details
  const subtotal = total;
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + shipping + tax;

  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (compact) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span>Subtotal ({itemCount} items)</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 && (
          <div className="text-xs text-muted-foreground">
            Add ${remainingForFreeShipping.toFixed(2)} more for free shipping
          </div>
        )}

        {/* Checkout Button */}
        {showCheckoutButton && (
          <Button asChild className="w-full" disabled={items.length === 0}>
            <Link href="/checkout">
              <CreditCard className="mr-2 h-4 w-4" />
              Checkout
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Order Summary Header */}
      <h3 className="text-lg font-semibold">Order Summary</h3>

      {/* Summary Details */}
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 && (
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <ShoppingBag className="h-4 w-4" />
              <span className="font-medium">
                Add ${remainingForFreeShipping.toFixed(2)} more for free shipping!
              </span>
            </div>
            <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Estimated tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {showCheckoutButton && (
          <Button asChild className="w-full" disabled={items.length === 0}>
            <Link href="/checkout">
              <CreditCard className="mr-2 h-4 w-4" />
              Proceed to Checkout
            </Link>
          </Button>
        )}

        {showContinueShoppingButton && (
          <Button variant="outline" asChild className="w-full">
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground text-center">
        <p>Secure checkout with SSL encryption</p>
        <p>Free returns within 30 days</p>
      </div>
    </div>
  );
}
