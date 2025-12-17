'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/context/cart-context';
import { useGSAP } from '@/lib/hooks/use-gsap';
import { useCartAccessibility } from '@/lib/hooks/use-cart-accessibility';
import { useScreenReader } from '@/lib/accessibility/screen-reader';
import { cn } from '@/lib/utils';

export interface CartButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showBadge?: boolean;
}

export function CartButton({
  className,
  variant = 'ghost',
  size = 'md',
  showText = false,
  showBadge = true,
}: CartButtonProps) {
  const { itemCount, toggleCart, isLoading } = useCart();
  const { getCartButtonProps } = useCartAccessibility();
  const { announceStatus } = useScreenReader();

  // GSAP animation for cart icon when items are added
  useGSAP(
    ({ timeline }) => {
      if (itemCount > 0) {
        timeline
          .to('[data-cart-icon]', {
            scale: 1.2,
            duration: 0.2,
            ease: 'back.out(1.7)',
          })
          .to('[data-cart-icon]', {
            scale: 1,
            duration: 0.2,
          });

        // Announce cart update to screen readers
        announceStatus(`Cart updated. ${itemCount} item${itemCount === 1 ? '' : 's'} in cart.`);
      }
    },
    [itemCount, announceStatus]
  );

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Button
      variant={variant}
      size={showText ? 'default' : 'icon'}
      onClick={toggleCart}
      disabled={isLoading}
      className={cn('relative', !showText && sizeClasses[size], className)}
      {...getCartButtonProps()}
    >
      <ShoppingCart className={cn(iconSizes[size], showText && 'mr-2')} data-cart-icon />

      {showText && <span>Cart {itemCount > 0 && `(${itemCount})`}</span>}

      {/* Item Count Badge */}
      {showBadge && itemCount > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1',
            'bg-primary text-primary-foreground text-[10px] font-semibold leading-none',
            'ring-2 ring-background',
            'duration-200 animate-in zoom-in-50'
          )}
          aria-label={`${itemCount} item${itemCount === 1 ? '' : 's'} in cart`}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
