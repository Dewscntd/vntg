/**
 * Centralized Fixtures for Development and Testing
 *
 * This module provides comprehensive test data for all entities in the system.
 * Use these fixtures for:
 * - Local database seeding
 * - Unit and integration tests
 * - Stub/mock data in development
 * - E2E test scenarios
 */

export * from './users';
export * from './categories';
export * from './products';
export * from './orders';
export * from './cart-items';
export * from './addresses';
export * from './payment-intents';

// Re-export all fixtures as a single object for convenience
import { userFixtures, adminUser, customerUser } from './users';
import { categoryFixtures } from './categories';
import { productFixtures } from './products';
import { orderFixtures } from './orders';
import { cartItemFixtures } from './cart-items';
import { addressFixtures } from './addresses';
import { paymentIntentFixtures } from './payment-intents';

export const fixtures = {
  users: userFixtures,
  categories: categoryFixtures,
  products: productFixtures,
  orders: orderFixtures,
  cartItems: cartItemFixtures,
  addresses: addressFixtures,
  paymentIntents: paymentIntentFixtures,

  // Quick access to common test users
  adminUser,
  customerUser,
};

export default fixtures;
