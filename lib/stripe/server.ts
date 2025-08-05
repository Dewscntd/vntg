import Stripe from 'stripe';
import { USE_STUBS, mockStripeServer } from '@/lib/stubs';

let stripe: Stripe | null = null;

export const getServerStripe = () => {
  if (USE_STUBS) {
    return mockStripeServer as any;
  }
  
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripe;
};
