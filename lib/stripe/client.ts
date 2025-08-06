import { loadStripe, Stripe } from '@stripe/stripe-js';
import { USE_STUBS, mockStripe } from '@/lib/stubs';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (locale?: string) => {
  if (USE_STUBS) {
    return Promise.resolve(mockStripe as any);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
      locale: (locale as any) || 'auto', // Stripe will auto-detect or use provided locale
    });
  }
  return stripePromise;
};

// Specific function for Israeli customers
export const getStripeForIsrael = () => {
  if (USE_STUBS) {
    return Promise.resolve(mockStripe as any);
  }

  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    locale: 'en', // Hebrew not fully supported, use English for Israeli customers
  });
};
