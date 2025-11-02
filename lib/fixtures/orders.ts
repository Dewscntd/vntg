/**
 * Order Fixtures
 * Test data for orders in various states
 */

import { Database } from '@/types/supabase';
import { customerUser, testUser1 } from './users';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

// Completed order
export const completedOrder: Order = {
  id: '30000000-0000-0000-0000-000000000001',
  user_id: customerUser.id,
  status: 'completed',
  total: 249.97,
  payment_intent_id: 'pi_test_completed_001',
  shipping_address: {
    name: 'John Doe',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
  },
  created_at: '2024-01-10T10:00:00.000Z',
  updated_at: '2024-01-10T15:00:00.000Z',
};

// Processing order
export const processingOrder: Order = {
  id: '30000000-0000-0000-0000-000000000002',
  user_id: customerUser.id,
  status: 'processing',
  total: 154.98,
  payment_intent_id: 'pi_test_processing_001',
  shipping_address: {
    name: 'John Doe',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
  },
  created_at: '2024-01-15T14:30:00.000Z',
  updated_at: '2024-01-15T14:30:00.000Z',
};

// Pending order
export const pendingOrder: Order = {
  id: '30000000-0000-0000-0000-000000000003',
  user_id: customerUser.id,
  status: 'pending',
  total: 89.99,
  payment_intent_id: 'pi_test_pending_001',
  shipping_address: {
    name: 'John Doe',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
  },
  created_at: '2024-01-20T09:15:00.000Z',
  updated_at: '2024-01-20T09:15:00.000Z',
};

// Cancelled order
export const cancelledOrder: Order = {
  id: '30000000-0000-0000-0000-000000000004',
  user_id: testUser1.id,
  status: 'cancelled',
  total: 79.99,
  payment_intent_id: 'pi_test_cancelled_001',
  shipping_address: {
    name: 'Jane Smith',
    street: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    country: 'US',
  },
  created_at: '2024-01-05T11:20:00.000Z',
  updated_at: '2024-01-06T08:00:00.000Z',
};

// Large order (multiple items)
export const largeOrder: Order = {
  id: '30000000-0000-0000-0000-000000000005',
  user_id: testUser1.id,
  status: 'completed',
  total: 524.92,
  payment_intent_id: 'pi_test_large_001',
  shipping_address: {
    name: 'Jane Smith',
    street: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    country: 'US',
  },
  created_at: '2024-01-08T16:45:00.000Z',
  updated_at: '2024-01-09T10:00:00.000Z',
};

export const orderFixtures: Order[] = [
  completedOrder,
  processingOrder,
  pendingOrder,
  cancelledOrder,
  largeOrder,
];

// Order Items
export const completedOrderItems: OrderItem[] = [
  {
    id: '31000000-0000-0000-0000-000000000001',
    order_id: completedOrder.id,
    product_id: '20000000-0000-0000-0000-000000000001', // Denim Jacket
    quantity: 2,
    price: 89.99,
    created_at: '2024-01-10T10:00:00.000Z',
    updated_at: '2024-01-10T10:00:00.000Z',
  },
  {
    id: '31000000-0000-0000-0000-000000000002',
    order_id: completedOrder.id,
    product_id: '20000000-0000-0000-0000-000000000011', // Floral Dress
    quantity: 1,
    price: 79.99,
    created_at: '2024-01-10T10:00:00.000Z',
    updated_at: '2024-01-10T10:00:00.000Z',
  },
];

export const processingOrderItems: OrderItem[] = [
  {
    id: '31000000-0000-0000-0000-000000000003',
    order_id: processingOrder.id,
    product_id: '20000000-0000-0000-0000-000000000012', // Evening Blouse
    quantity: 1,
    price: 69.99,
    created_at: '2024-01-15T14:30:00.000Z',
    updated_at: '2024-01-15T14:30:00.000Z',
  },
  {
    id: '31000000-0000-0000-0000-000000000004',
    order_id: processingOrder.id,
    product_id: '20000000-0000-0000-0000-000000000013', // Skinny Jeans
    quantity: 1,
    price: 84.99,
    created_at: '2024-01-15T14:30:00.000Z',
    updated_at: '2024-01-15T14:30:00.000Z',
  },
];

export const pendingOrderItems: OrderItem[] = [
  {
    id: '31000000-0000-0000-0000-000000000005',
    order_id: pendingOrder.id,
    product_id: '20000000-0000-0000-0000-000000000001', // Denim Jacket
    quantity: 1,
    price: 89.99,
    created_at: '2024-01-20T09:15:00.000Z',
    updated_at: '2024-01-20T09:15:00.000Z',
  },
];

export const largeOrderItems: OrderItem[] = [
  {
    id: '31000000-0000-0000-0000-000000000006',
    order_id: largeOrder.id,
    product_id: '20000000-0000-0000-0000-000000000001', // Denim Jacket
    quantity: 2,
    price: 89.99,
    created_at: '2024-01-08T16:45:00.000Z',
    updated_at: '2024-01-08T16:45:00.000Z',
  },
  {
    id: '31000000-0000-0000-0000-000000000007',
    order_id: largeOrder.id,
    product_id: '20000000-0000-0000-0000-000000000011', // Floral Dress
    quantity: 1,
    price: 79.99,
    created_at: '2024-01-08T16:45:00.000Z',
    updated_at: '2024-01-08T16:45:00.000Z',
  },
  {
    id: '31000000-0000-0000-0000-000000000008',
    order_id: largeOrder.id,
    product_id: '20000000-0000-0000-0000-000000000012', // Evening Blouse
    quantity: 2,
    price: 69.99,
    created_at: '2024-01-08T16:45:00.000Z',
    updated_at: '2024-01-08T16:45:00.000Z',
  },
  {
    id: '31000000-0000-0000-0000-000000000009',
    order_id: largeOrder.id,
    product_id: '20000000-0000-0000-0000-000000000002', // Casual Shirt
    quantity: 3,
    price: 54.99,
    created_at: '2024-01-08T16:45:00.000Z',
    updated_at: '2024-01-08T16:45:00.000Z',
  },
];

export const orderItemFixtures: OrderItem[] = [
  ...completedOrderItems,
  ...processingOrderItems,
  ...pendingOrderItems,
  ...largeOrderItems,
];

// Helper to create an order with custom properties
export const createOrderFixture = (overrides: Partial<Order> = {}): Order => ({
  id: '30000000-0000-0000-0000-000000000099',
  user_id: customerUser.id,
  status: 'pending',
  total: 99.99,
  payment_intent_id: 'pi_test_order_099',
  shipping_address: {
    name: 'Test User',
    street: '123 Test Street',
    city: 'Test City',
    state: 'TC',
    zip: '12345',
    country: 'US',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Helper to create an order item with custom properties
export const createOrderItemFixture = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  id: '31000000-0000-0000-0000-000000000099',
  order_id: '30000000-0000-0000-0000-000000000099',
  product_id: '20000000-0000-0000-0000-000000000001',
  quantity: 1,
  price: 99.99,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
