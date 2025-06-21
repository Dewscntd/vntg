'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowRight, Heart, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGSAP } from '@/lib/hooks/use-gsap';
import { cn } from '@/lib/utils';

export interface EmptyCartProps {
  className?: string;
  compact?: boolean;
  showSuggestions?: boolean;
}

export function EmptyCart({
  className,
  compact = false,
  showSuggestions = true,
}: EmptyCartProps) {
  // GSAP animation for empty cart illustration
  useGSAP(
    ({ timeline }) => {
      timeline
        .fromTo(
          '[data-cart-icon]',
          { scale: 0, rotation: -180 },
          { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
        )
        .fromTo(
          '[data-empty-content]',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(
          '[data-suggestions]',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          '-=0.2'
        );
    },
    []
  );

  if (compact) {
    return (
      <div className={cn('text-center py-8', className)}>
        <ShoppingCart 
          className="mx-auto h-12 w-12 text-muted-foreground mb-4" 
          data-cart-icon 
        />
        <div data-empty-content>
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add some products to get started
          </p>
          <Button asChild>
            <Link href="/products">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('text-center py-12', className)}>
      {/* Empty Cart Icon */}
      <div className="mb-8">
        <ShoppingCart 
          className="mx-auto h-24 w-24 text-muted-foreground" 
          data-cart-icon 
        />
      </div>

      {/* Empty Cart Content */}
      <div data-empty-content className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. 
          Start shopping to fill it up!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/products">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button variant="outline" asChild size="lg">
            <Link href="/categories">
              Browse Categories
            </Link>
          </Button>
        </div>
      </div>

      {/* Shopping Suggestions */}
      {showSuggestions && (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">Why not try these?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Featured Products */}
            <Card data-suggestions>
              <CardContent className="p-6 text-center">
                <Star className="mx-auto h-8 w-8 text-yellow-500 mb-3" />
                <h4 className="font-medium mb-2">Featured Products</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Check out our most popular items
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link href="/products?featured=true">
                    View Featured
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* New Arrivals */}
            <Card data-suggestions>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="mx-auto h-8 w-8 text-blue-500 mb-3" />
                <h4 className="font-medium mb-2">New Arrivals</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover the latest additions
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link href="/products?new=true">
                    Shop New
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Sale Items */}
            <Card data-suggestions>
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto h-8 w-8 text-red-500 mb-3" />
                <h4 className="font-medium mb-2">Sale Items</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Great deals you don't want to miss
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link href="/products?sale=true">
                    Shop Sale
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
