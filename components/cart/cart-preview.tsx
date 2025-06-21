'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CartItem } from './cart-item';
import { CartSummary } from './cart-summary';
import { EmptyCart } from './empty-cart';
import { useCart } from '@/lib/context/cart-context';
import { useGSAP } from '@/lib/hooks/use-gsap';
import { cn } from '@/lib/utils';

export interface CartPreviewProps {
  trigger: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  maxHeight?: number;
  showOnHover?: boolean;
  hideDelay?: number;
}

export function CartPreview({
  trigger,
  className,
  side = 'bottom',
  align = 'end',
  maxHeight = 400,
  showOnHover = true,
  hideDelay = 300,
}: CartPreviewProps) {
  const { items, itemCount, total, openCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previewRef = useRef<HTMLDivElement>(null);

  // GSAP animation for preview
  useGSAP(
    ({ timeline }) => {
      if (isVisible && previewRef.current) {
        timeline.fromTo(
          previewRef.current,
          { 
            opacity: 0, 
            scale: 0.95,
            y: side === 'top' ? 10 : side === 'bottom' ? -10 : 0,
            x: side === 'left' ? 10 : side === 'right' ? -10 : 0,
          },
          { 
            opacity: 1, 
            scale: 1,
            y: 0,
            x: 0,
            duration: 0.2, 
            ease: 'power2.out' 
          }
        );
      }
    },
    [isVisible, side]
  );

  const handleMouseEnter = () => {
    if (!showOnHover) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!showOnHover) return;
    
    setIsHovered(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
      }
    }, hideDelay);
  };

  const handlePreviewMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handlePreviewMouseLeave = () => {
    setIsHovered(false);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  const handleClick = () => {
    if (!showOnHover) {
      setIsVisible(!isVisible);
    }
  };

  // Close preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible && !showOnHover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, showOnHover]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignClasses = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center: side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Preview */}
      {isVisible && (
        <div
          ref={previewRef}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
          className={cn(
            'absolute z-50 w-80',
            positionClasses[side],
            alignClasses[align],
            className
          )}
        >
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Cart ({itemCount})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openCart}
                  className="text-xs h-auto p-1"
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="p-6">
                  <EmptyCart compact showSuggestions={false} />
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <ScrollArea 
                    className="px-6" 
                    style={{ maxHeight: `${maxHeight - 120}px` }}
                  >
                    <div className="space-y-3 py-3">
                      {items.slice(0, 3).map((item) => (
                        <CartItem key={item.id} item={item} compact />
                      ))}
                      
                      {items.length > 3 && (
                        <div className="text-center py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={openCart}
                            className="text-xs"
                          >
                            +{items.length - 3} more items
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <Separator />

                  {/* Quick Summary */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openCart}
                        className="flex-1"
                      >
                        View Cart
                      </Button>
                      <Button asChild size="sm" className="flex-1">
                        <Link href="/checkout">
                          Checkout
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
