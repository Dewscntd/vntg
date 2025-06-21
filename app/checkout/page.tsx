'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/context/cart-context';
import { useCheckout } from '@/lib/context/checkout-context';
import { CheckoutLayout } from '@/components/checkout/checkout-layout';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentForm } from '@/components/checkout/payment-form';
import { OrderReview } from '@/components/checkout/order-review';
import { OrderConfirmation } from '@/components/checkout/order-confirmation';
import { StripeProvider } from '@/components/providers/stripe-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { items, itemCount, total } = useCart();
  const { 
    currentStep, 
    nextStep, 
    previousStep,
    clientSecret,
    error,
    isLoading 
  } = useCheckout();

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && itemCount === 0) {
      router.push('/cart');
    }
  }, [itemCount, authLoading, router]);

  // Redirect to login if not authenticated (optional - can allow guest checkout)
  useEffect(() => {
    if (!authLoading && !session) {
      // For now, redirect to login. Later we can implement guest checkout
      router.push('/auth/login?redirect=/checkout');
    }
  }, [session, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some items to your cart to proceed with checkout.</p>
          <Button onClick={() => router.push('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to proceed with checkout.</p>
          <Button onClick={() => router.push('/auth/login?redirect=/checkout')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: // Shipping
        return <ShippingForm onNext={nextStep} />;
      
      case 1: // Payment
        return (
          <StripeProvider clientSecret={clientSecret}>
            <PaymentForm onNext={nextStep} onPrevious={previousStep} />
          </StripeProvider>
        );
      
      case 2: // Review
        return <OrderReview onNext={nextStep} onPrevious={previousStep} />;
      
      case 3: // Confirmation
        return <OrderConfirmation />;
      
      default:
        return <ShippingForm onNext={nextStep} />;
    }
  };

  return (
    <CheckoutLayout>
      {/* Global Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Processing...</span>
          </div>
        </div>
      )}

      {/* Current Step Content */}
      <div className="relative">
        {renderCurrentStep()}
      </div>
    </CheckoutLayout>
  );
}
