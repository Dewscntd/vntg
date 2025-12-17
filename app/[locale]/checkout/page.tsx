'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/context/cart-context';
import { useCheckout } from '@/lib/context/checkout-context';
import { CheckoutLayout } from '@/components/checkout/checkout-layout';
import { GuestCheckoutForm } from '@/components/checkout/guest-checkout-form';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentForm } from '@/components/checkout/payment-form';
import { OrderReview } from '@/components/checkout/order-review';
import { OrderConfirmation } from '@/components/checkout/order-confirmation';
import { StripeProvider } from '@/components/providers/stripe-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const { items, itemCount, total } = useCart();
  const { currentStep, nextStep, previousStep, clientSecret, error, isLoading, setGuestCheckout } =
    useCheckout();

  // If user is not authenticated, show guest checkout first
  const showGuestCheckout = !authLoading && !session;

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && itemCount === 0) {
      router.push('/cart');
    }
  }, [itemCount, authLoading, router]);

  // Guest checkout handlers
  const handleGuestCheckout = (guestData: any) => {
    setGuestCheckout(true);
    // Store guest info in checkout context if needed
    // Then proceed to shipping form
    nextStep();
  };

  const handleLoginRedirect = () => {
    router.push('/auth/login?redirect=/checkout');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">{t('emptyCart')}</h2>
          <p className="mb-4 text-gray-600">{t('emptyCartMessage')}</p>
          <Button onClick={() => router.push('/products')}>{t('continueShopping')}</Button>
        </div>
      </div>
    );
  }

  // Handle guest checkout - show guest form for step 0, regular flow after
  if (!session && currentStep === 0) {
    return (
      <CheckoutLayout>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <GuestCheckoutForm
          onGuestCheckout={handleGuestCheckout}
          onLoginRedirect={handleLoginRedirect}
        />
      </CheckoutLayout>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: // Shipping
        return <ShippingForm onNext={nextStep} />;

      case 1: // Payment
        return (
          <StripeProvider clientSecret={clientSecret || undefined}>
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
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-gray-600">{t('processing')}</span>
          </div>
        </div>
      )}

      {/* Current Step Content */}
      <div className="relative">{renderCurrentStep()}</div>
    </CheckoutLayout>
  );
}
