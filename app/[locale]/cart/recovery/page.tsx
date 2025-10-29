'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, Gift, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { useCart } from '@/lib/context/cart-context';
import { getLatestAbandonmentEvent, clearAbandonmentEvents } from '@/lib/utils/cart-abandonment';
import { cartAnalytics } from '@/lib/utils/cart-analytics';
import type { AbandonmentEvent } from '@/lib/utils/cart-abandonment';

function CartRecoveryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, addItem, openCart } = useCart();
  const [abandonmentEvent, setAbandonmentEvent] = useState<AbandonmentEvent | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  const recoveryId = searchParams.get('recovery');
  const discount = searchParams.get('discount');

  useEffect(() => {
    // Get abandonment event
    const event = getLatestAbandonmentEvent();
    if (event && event.id === recoveryId) {
      setAbandonmentEvent(event);

      // Track recovery page view
      cartAnalytics.recoverCart('email', event.items, event.total, event.userId);
    }

    // Set discount code if provided
    if (discount) {
      setDiscountCode(discount);
    }
  }, [recoveryId, discount]);

  const handleRecoverCart = async () => {
    if (!abandonmentEvent) return;

    setIsRecovering(true);

    try {
      // Add all items back to cart
      for (const item of abandonmentEvent.items) {
        await addItem(item.product_id, item.quantity);
      }

      // Clear abandonment events
      clearAbandonmentEvents();

      // Track successful recovery
      cartAnalytics.recoverCart(
        'recovery_page',
        abandonmentEvent.items,
        abandonmentEvent.total,
        abandonmentEvent.userId
      );

      // Open cart
      openCart();

      // Redirect to cart
      router.push('/cart');
    } catch (error) {
      console.error('Failed to recover cart:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  if (!abandonmentEvent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Recovery Link Invalid</h1>
          <p className="mb-6 text-muted-foreground">
            This recovery link is no longer valid or has already been used.
          </p>
          <Button onClick={handleContinueShopping}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const timeSinceAbandonment = Date.now() - abandonmentEvent.timestamp;
  const hoursAgo = Math.floor(timeSinceAbandonment / (1000 * 60 * 60));
  const minutesAgo = Math.floor((timeSinceAbandonment % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">Your items are still waiting for you</p>

          {/* Time indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Left {hoursAgo > 0 ? `${hoursAgo}h ` : ''}
              {minutesAgo}m ago
            </span>
          </div>
        </div>

        {/* Discount Banner */}
        {discountCode && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-800">Special Offer!</h3>
                  <p className="text-sm text-green-700">
                    Complete your purchase now and save 10% with code{' '}
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {discountCode}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Your Items ({abandonmentEvent.itemCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {abandonmentEvent.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recovery Actions */}
          <div className="space-y-6">
            {/* Cart Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({abandonmentEvent.itemCount} items)</span>
                    <span>${abandonmentEvent.total.toFixed(2)}</span>
                  </div>

                  {discountCode && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%)</span>
                      <span>-${(abandonmentEvent.total * 0.1).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>
                        $
                        {discountCode
                          ? (abandonmentEvent.total * 0.9).toFixed(2)
                          : abandonmentEvent.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRecoverCart}
                disabled={isRecovering}
                className="w-full"
                size="lg"
              >
                {isRecovering ? 'Recovering Cart...' : 'Recover My Cart'}
              </Button>

              <Button variant="outline" onClick={handleContinueShopping} className="w-full">
                Continue Shopping
              </Button>
            </div>

            {/* Trust Indicators */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Secure checkout with SSL encryption</p>
                  <p>✓ Free returns within 30 days</p>
                  <p>✓ 24/7 customer support</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartRecoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CartRecoveryContent />
    </Suspense>
  );
}
