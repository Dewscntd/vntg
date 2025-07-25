'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement, PaymentElement } from '@stripe/react-stripe-js';
import { useCheckout } from '@/lib/context/checkout-context';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCurrencyIL, detectUserCurrency, ISRAELI_CURRENCY } from '@/lib/utils/currency';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
}

export function PaymentForm({ onNext, onPrevious, className }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { session } = useAuth();
  const { clientSecret, createPaymentIntent, isLoading, error, orderSummary, shippingAddress } = useCheckout();

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  
  // Detect user's preferred currency based on shipping address or browser
  const userCurrency = shippingAddress?.country === 'IL' ? ISRAELI_CURRENCY : detectUserCurrency();
  const isIsraeliCustomer = shippingAddress?.country === 'IL' || userCurrency === ISRAELI_CURRENCY;

  // Create payment intent when component mounts
  useEffect(() => {
    if (orderSummary && !clientSecret) {
      createPaymentIntent();
    }
  }, [orderSummary, clientSecret, createPaymentIntent]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system not ready. Please try again.');
      return;
    }

    // Additional validation
    if (!orderSummary || orderSummary.total <= 0) {
      setPaymentError('Invalid order total. Please refresh and try again.');
      return;
    }

    // Prevent double submission
    if (processing) {
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation`,
          save_payment_method: savePaymentMethod,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setPaymentError(stripeError.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful, proceed to next step
        onNext();
      } else {
        setPaymentError('Payment was not completed. Please try again.');
      }
    } catch (err) {
      setPaymentError('An unexpected error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Payment Information</h2>
        <p className="text-sm text-gray-600">Your payment information is secure and encrypted.</p>
      </div>

      {/* Security Notice */}
      <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3">
        <Lock className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-800">
          Your payment is secured with 256-bit SSL encryption
        </span>
      </div>

      {/* Error Display */}
      {(error || paymentError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || paymentError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <Label className="mb-4 block text-base font-medium text-gray-900">Payment Method</Label>

          {clientSecret ? (
            <div className="space-y-4">
              {/* Payment Element (recommended by Stripe) */}
              <div className="rounded-lg border border-gray-300 p-4">
                <div className="mb-3 flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Credit or Debit Card</span>
                </div>
                <PaymentElement
                  options={{
                    layout: 'tabs',
                  }}
                />
              </div>

              {/* Alternative: Card Element (if you prefer the classic approach) */}
              {/* 
              <div className="p-4 border border-gray-300 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Credit or Debit Card
                  </span>
                </div>
                <CardElement options={cardElementOptions} />
              </div>
              */}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-300 p-4">
              <div className="animate-pulse">
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Save Payment Method */}
        {session && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="savePaymentMethod"
              checked={savePaymentMethod}
              onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
            />
            <Label htmlFor="savePaymentMethod" className="text-sm">
              Save this payment method for future purchases
            </Label>
          </div>
        )}

        {/* Order Total */}
        {orderSummary && (
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">Total to be charged:</span>
              <span className="text-lg font-bold text-gray-900">
                {isIsraeliCustomer 
                  ? formatCurrencyIL(orderSummary.total, userCurrency)
                  : formatCurrency(orderSummary.total, userCurrency)
                }
              </span>
            </div>
            {isIsraeliCustomer && (
              <div className="mt-2 text-sm text-gray-600">
                All Israeli credit and debit cards accepted • Secure payment via Stripe
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onPrevious} disabled={processing}>
            Back to Shipping
          </Button>

          <Button
            type="submit"
            disabled={!stripe || !clientSecret || processing || isLoading}
            className="min-w-[140px]"
          >
            {processing ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ${orderSummary ? (isIsraeliCustomer 
                ? formatCurrencyIL(orderSummary.total, userCurrency)
                : formatCurrency(orderSummary.total, userCurrency)
              ) : formatCurrency(0, userCurrency)}`
            )}
          </Button>
        </div>
      </form>

      {/* Payment Security Info */}
      <div className="space-y-1 text-xs text-gray-500">
        <p>• Your payment information is never stored on our servers</p>
        <p>• All transactions are processed securely through Stripe</p>
        <p>• You will receive an email confirmation after payment</p>
      </div>
    </div>
  );
}
