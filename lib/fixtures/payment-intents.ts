/**
 * Payment Intent Fixtures
 * Test data for Stripe payment intents
 */

import { Database } from '@/types/supabase';
import { customerUser, testUser1 } from './users';

type PaymentIntent = Database['public']['Tables']['payment_intents']['Row'];

export const succeededPaymentIntent: PaymentIntent = {
  id: '60000000-0000-0000-0000-000000000001',
  stripe_payment_intent_id: 'pi_test_succeeded_001',
  user_id: customerUser.id,
  amount: 24997,
  currency: 'usd',
  status: 'succeeded',
  metadata: {
    order_id: '30000000-0000-0000-0000-000000000001',
    items_count: 2,
  },
  created_at: '2024-01-10T10:00:00.000Z',
  updated_at: '2024-01-10T10:05:00.000Z',
};

export const processingPaymentIntent: PaymentIntent = {
  id: '60000000-0000-0000-0000-000000000002',
  stripe_payment_intent_id: 'pi_test_processing_001',
  user_id: customerUser.id,
  amount: 15498,
  currency: 'usd',
  status: 'processing',
  metadata: {
    order_id: '30000000-0000-0000-0000-000000000002',
    items_count: 2,
  },
  created_at: '2024-01-15T14:30:00.000Z',
  updated_at: '2024-01-15T14:32:00.000Z',
};

export const requiresActionPaymentIntent: PaymentIntent = {
  id: '60000000-0000-0000-0000-000000000003',
  stripe_payment_intent_id: 'pi_test_requires_action_001',
  user_id: testUser1.id,
  amount: 7999,
  currency: 'usd',
  status: 'requires_action',
  metadata: {
    order_id: '30000000-0000-0000-0000-000000000003',
    items_count: 1,
  },
  created_at: '2024-01-20T09:15:00.000Z',
  updated_at: '2024-01-20T09:16:00.000Z',
};

export const failedPaymentIntent: PaymentIntent = {
  id: '60000000-0000-0000-0000-000000000004',
  stripe_payment_intent_id: 'pi_test_failed_001',
  user_id: testUser1.id,
  amount: 7999,
  currency: 'usd',
  status: 'canceled',
  metadata: {
    order_id: '30000000-0000-0000-0000-000000000004',
    items_count: 1,
    failure_reason: 'card_declined',
  },
  created_at: '2024-01-05T11:20:00.000Z',
  updated_at: '2024-01-05T11:22:00.000Z',
};

export const largePaymentIntent: PaymentIntent = {
  id: '60000000-0000-0000-0000-000000000005',
  stripe_payment_intent_id: 'pi_test_large_001',
  user_id: testUser1.id,
  amount: 52492,
  currency: 'usd',
  status: 'succeeded',
  metadata: {
    order_id: '30000000-0000-0000-0000-000000000005',
    items_count: 8,
  },
  created_at: '2024-01-08T16:45:00.000Z',
  updated_at: '2024-01-08T16:50:00.000Z',
};

export const paymentIntentFixtures: PaymentIntent[] = [
  succeededPaymentIntent,
  processingPaymentIntent,
  requiresActionPaymentIntent,
  failedPaymentIntent,
  largePaymentIntent,
];

// Helper to create a payment intent with custom properties
export const createPaymentIntentFixture = (
  overrides: Partial<PaymentIntent> = {}
): PaymentIntent => ({
  id: '60000000-0000-0000-0000-000000000099',
  stripe_payment_intent_id: 'pi_test_fixture_099',
  user_id: customerUser.id,
  amount: 9999,
  currency: 'usd',
  status: 'succeeded',
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
