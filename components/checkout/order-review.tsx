'use client';

import React, { useState } from 'react';
import { useCheckout } from '@/lib/context/checkout-context';
import { useCart } from '@/lib/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrderSummary } from '@/components/checkout/order-summary';
import { cn } from '@/lib/utils';
import { MapPin, CreditCard, Truck, AlertCircle, Edit, Check } from 'lucide-react';

interface OrderReviewProps {
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
}

export function OrderReview({ onNext, onPrevious, className }: OrderReviewProps) {
  const {
    shippingAddress,
    billingAddress,
    selectedShippingMethod,
    orderSummary,
    processOrder,
    isLoading,
    goToStep,
  } = useCheckout();
  const { items } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setProcessing(true);
    setError(null);

    try {
      const orderId = await processOrder();

      if (orderId) {
        // Order created successfully, proceed to confirmation
        onNext();
      } else {
        setError('Failed to create order. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Order processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!shippingAddress || !orderSummary) {
    return (
      <div className={cn('space-y-6', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Missing required information. Please complete the previous steps.
          </AlertDescription>
        </Alert>
        <Button onClick={onPrevious}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Review Your Order</h2>
        <p className="text-sm text-gray-600">
          Please review your order details before placing your order.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Items ({items.length})</span>
            <Button variant="ghost" size="sm" onClick={() => window.open('/cart', '_blank')}>
              <Edit className="mr-1 h-4 w-4" />
              Edit Cart
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderSummary showItems={true} />
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Shipping Address</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(0)}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p className="font-medium">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.address}</p>
            {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.country}</p>
            <p className="mt-2 text-gray-600">Email: {shippingAddress.email}</p>
            <p className="text-gray-600">Phone: {shippingAddress.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address (if different) */}
      {billingAddress && !billingAddress.sameAsShipping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing Address</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">
                {billingAddress.firstName} {billingAddress.lastName}
              </p>
              <p>{billingAddress.address}</p>
              {billingAddress.address2 && <p>{billingAddress.address2}</p>}
              <p>
                {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
              </p>
              <p>{billingAddress.country}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Method */}
      {selectedShippingMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Shipping Method</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => goToStep(0)}>
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedShippingMethod.name}</p>
                <p className="text-sm text-gray-600">{selectedShippingMethod.description}</p>
                <p className="text-sm text-gray-600">
                  Estimated delivery: {selectedShippingMethod.estimatedDays} business days
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {selectedShippingMethod.price === 0
                    ? 'Free'
                    : `$${selectedShippingMethod.price.toFixed(2)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Method</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-gray-600" />
            <span className="text-sm">Credit/Debit Card</span>
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-1 text-xs text-gray-500">Your payment method is secure and encrypted</p>
        </CardContent>
      </Card>

      {/* Order Total */}
      <Card>
        <CardHeader>
          <CardTitle>Order Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${orderSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${orderSummary.tax.toFixed(2)}</span>
            </div>
            {orderSummary.discount && orderSummary.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span className="text-green-600">-${orderSummary.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${orderSummary.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <div className="space-y-1 text-xs text-gray-500">
        <p>
          By placing this order, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </a>
          .
        </p>
        <p>You will receive an email confirmation once your order is placed.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} disabled={processing || isLoading}>
          Back to Payment
        </Button>

        <Button
          onClick={handlePlaceOrder}
          disabled={processing || isLoading}
          className="min-w-[160px]"
        >
          {processing ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              <span>Placing Order...</span>
            </div>
          ) : (
            `Place Order - $${orderSummary.total.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}
