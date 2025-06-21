'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/context/cart-context';
import { useCheckout } from '@/lib/context/checkout-context';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface OrderSummaryProps {
  showItems?: boolean;
  className?: string;
}

export function OrderSummary({ showItems = true, className }: OrderSummaryProps) {
  const { items, total } = useCart();
  const { orderSummary, selectedShippingMethod, calculateOrderSummary } = useCheckout();

  // Calculate order summary when component mounts or dependencies change
  useEffect(() => {
    calculateOrderSummary();
  }, [total, selectedShippingMethod, calculateOrderSummary]);

  if (!orderSummary) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      {/* Cart Items */}
      {showItems && items.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Items ({items.length})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                  {item.product.discount_percent && item.product.discount_percent > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.product.discount_percent}% off
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm font-medium text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${orderSummary.subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Shipping
            {selectedShippingMethod && (
              <span className="text-xs text-gray-500 block">
                {selectedShippingMethod.name}
              </span>
            )}
          </span>
          <span className="text-gray-900">
            {orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${orderSummary.tax.toFixed(2)}</span>
        </div>
        
        {orderSummary.discount && orderSummary.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-${orderSummary.discount.toFixed(2)}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between text-base font-medium">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${orderSummary.total.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="mt-6 space-y-2 text-xs text-gray-500">
        <p>• Shipping and taxes calculated based on delivery address</p>
        <p>• All prices shown in USD</p>
        {selectedShippingMethod && (
          <p>• Estimated delivery: {selectedShippingMethod.estimatedDays} business days</p>
        )}
      </div>
    </div>
  );
}

// Compact version for mobile or sidebar use
export function CompactOrderSummary({ className }: { className?: string }) {
  const { itemCount, total } = useCart();
  const { orderSummary } = useCheckout();

  return (
    <div className={cn('bg-gray-50 rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">
          Order ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </span>
        <span className="text-sm font-medium text-gray-900">
          ${orderSummary?.total.toFixed(2) || total.toFixed(2)}
        </span>
      </div>
      
      {orderSummary && (
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${orderSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${orderSummary.tax.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
