'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
  options?: StripeElementsOptions;
}

export function StripeProvider({ children, clientSecret, options = {} }: StripeProviderProps) {
  const baseOptions = {
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
      rules: {
        '.Input': {
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '16px',
        },
        '.Input:focus': {
          borderColor: '#2563eb',
          boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px',
        },
        '.Error': {
          color: '#dc2626',
          fontSize: '14px',
        },
      },
    },
  };

  const elementsOptions: StripeElementsOptions = clientSecret
    ? {
        ...baseOptions,
        clientSecret,
        // Remove mode when clientSecret is present
        ...Object.fromEntries(Object.entries(options).filter(([key]) => key !== 'mode')),
      }
    : { ...baseOptions, ...options };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
}
