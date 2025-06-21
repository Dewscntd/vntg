'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { OrderConfirmation } from '@/components/checkout/order-confirmation';
import { CheckoutProvider } from '@/lib/context/checkout-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CheckoutConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: authLoading } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Get parameters from URL
        const paymentIntentId = searchParams.get('payment_intent');
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
        const redirectStatus = searchParams.get('redirect_status');

        if (!paymentIntentId) {
          setError('Missing payment information');
          setLoading(false);
          return;
        }

        // Check payment status
        if (redirectStatus === 'succeeded') {
          setPaymentStatus('succeeded');
          
          // Get order ID from payment intent
          const response = await fetch(`/api/checkout/payment-intent/${paymentIntentId}`);
          
          if (response.ok) {
            const paymentData = await response.json();
            
            // Get order associated with this payment intent
            const orderResponse = await fetch(`/api/orders?payment_intent_id=${paymentIntentId}`);
            
            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              if (orderData.orders && orderData.orders.length > 0) {
                setOrderId(orderData.orders[0].id);
              }
            }
          }
        } else if (redirectStatus === 'processing') {
          setPaymentStatus('processing');
        } else {
          setPaymentStatus('failed');
          setError('Payment was not successful');
        }
      } catch (err) {
        console.error('Error handling confirmation:', err);
        setError('An error occurred while processing your order');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      handleConfirmation();
    }
  }, [searchParams, authLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/auth/login');
    }
  }, [session, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your order confirmation.</p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-3">
            <Button 
              onClick={() => router.push('/checkout')} 
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/cart')} 
              className="w-full"
            >
              Return to Cart
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/support')} 
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Processing</h2>
          <p className="text-gray-600 mb-4">
            Your payment is being processed. This may take a few moments.
          </p>
          <p className="text-sm text-gray-500">
            You will receive an email confirmation once the payment is complete.
          </p>
          
          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/account/orders')}
            >
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'succeeded') {
    return (
      <CheckoutProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <OrderConfirmation orderId={orderId || undefined} />
          </div>
        </div>
      </CheckoutProvider>
    );
  }

  // Fallback for unknown status
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unknown Status</h2>
        <p className="text-gray-600 mb-4">
          We're unable to determine the status of your order at this time.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/account/orders')} 
            className="w-full"
          >
            Check My Orders
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/support')} 
            className="w-full"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
