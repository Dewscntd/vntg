'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { EmptyCart } from '@/components/cart/empty-cart';
import { useCart } from '@/lib/context/cart-context';
import { cartAnalytics } from '@/lib/utils/cart-analytics';
import { useAuth } from '@/lib/auth/auth-context';

export default function CartPage() {
  const { items, itemCount, total, isLoading } = useCart();
  const { user } = useAuth();

  // Track cart page view
  useEffect(() => {
    if (items.length > 0) {
      cartAnalytics.viewCart(items, total, user?.id);
    }
  }, [items, total, user?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-48 rounded bg-muted"></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded bg-muted"></div>
                ))}
              </div>
              <div className="h-96 rounded bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Shopping Cart</span>
          </nav>

          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <ShoppingBag className="h-8 w-8" />
              Shopping Cart
            </h1>
            <p className="mt-1 text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items in Your Cart</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-6">
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Actions */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Button variant="outline" className="flex-1">
                Save for Later
              </Button>
              <Button variant="outline" className="flex-1">
                Share Cart
              </Button>
              <Button variant="outline" className="flex-1">
                Print Cart
              </Button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <CartSummary showCheckoutButton={true} showContinueShoppingButton={false} />
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Promo Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                  <Button size="sm">Apply</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a valid promo code to receive a discount
                </p>
              </CardContent>
            </Card>

            {/* Security & Trust */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="mb-3 font-medium">Secure Shopping</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Free shipping over $50</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recently Viewed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">You Might Also Like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">Based on items in your cart</div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <h2 className="mb-4 text-xl font-semibold">Need Help?</h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/help/shipping">Shipping Info</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help/returns">Return Policy</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
