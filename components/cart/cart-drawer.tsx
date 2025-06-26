'use client';

import { X, ShoppingBag } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CartItem } from './cart-item';
import { CartSummary } from './cart-summary';
import { EmptyCart } from './empty-cart';
import { useCart } from '@/lib/context/cart-context';
import { useGSAP } from '@/lib/hooks/use-gsap';
import { useCartAccessibility } from '@/lib/hooks/use-cart-accessibility';
import { useCartDrawerAnimation } from '@/lib/hooks/use-cart-animations';
import { cn } from '@/lib/utils';

export interface CartDrawerProps {
  children?: React.ReactNode;
  className?: string;
}

export function CartDrawer({ children, className }: CartDrawerProps) {
  const { items, itemCount, isOpen, closeCart, isLoading } = useCart();
  const { cartDrawerRef, getCartDrawerProps } = useCartAccessibility();
  const { animateContent } = useCartDrawerAnimation();

  // Enhanced GSAP animation for cart content
  useGSAP(
    ({ timeline }) => {
      if (isOpen && items.length > 0) {
        // Use the enhanced content animation
        setTimeout(() => {
          animateContent();
        }, 100);
      }
    },
    [isOpen, items.length, animateContent]
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}

      <SheetContent
        ref={cartDrawerRef}
        className={cn('flex w-full flex-col sm:max-w-lg', className)}
        {...getCartDrawerProps()}
      >
        <SheetHeader className="space-y-2.5 pr-6" data-cart-header>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          {items.length === 0 ? (
            /* Empty Cart */
            <div className="flex flex-1 items-center justify-center">
              <EmptyCart compact showSuggestions={false} />
            </div>
          ) : (
            /* Cart Items */
            <>
              {/* Items List */}
              <ScrollArea className="flex-1 pr-6">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div key={item.id}>
                      <CartItem item={item} />
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Cart Summary */}
              <div className="mt-4 border-t pt-4" data-cart-summary>
                <CartSummary compact />
              </div>
            </>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm">Updating cart...</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Standalone cart drawer that can be used without trigger
export function CartDrawerStandalone({ className }: { className?: string }) {
  const { isOpen, closeCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeCart} />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full transform bg-background shadow-xl transition-transform duration-300 ease-in-out sm:max-w-lg',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
            </h2>
            <Button variant="ghost" size="sm" onClick={closeCart} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close cart</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col p-6">
            <CartDrawer />
          </div>
        </div>
      </div>
    </div>
  );
}
