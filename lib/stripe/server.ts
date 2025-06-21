import Stripe from 'stripe';

let stripe: Stripe | null = null;

export const getServerStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripe;
};
