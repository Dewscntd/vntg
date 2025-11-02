/**
 * Cart Item Fixtures
 * Test data for shopping cart items
 */

import { Database } from '@/types/supabase';
import { customerUser, testUser1 } from './users';
import { denimJacket, floralDress, casualShirt, eveningBlouse } from './products';

type CartItem = Database['public']['Tables']['cart_items']['Row'];

export const customerCartItem1: CartItem = {
  id: '40000000-0000-0000-0000-000000000001',
  user_id: customerUser.id,
  product_id: denimJacket.id,
  quantity: 2,
  created_at: '2024-01-20T10:00:00.000Z',
  updated_at: '2024-01-20T10:00:00.000Z',
};

export const customerCartItem2: CartItem = {
  id: '40000000-0000-0000-0000-000000000002',
  user_id: customerUser.id,
  product_id: floralDress.id,
  quantity: 1,
  created_at: '2024-01-20T10:05:00.000Z',
  updated_at: '2024-01-20T10:05:00.000Z',
};

export const testUser1CartItem1: CartItem = {
  id: '40000000-0000-0000-0000-000000000003',
  user_id: testUser1.id,
  product_id: casualShirt.id,
  quantity: 3,
  created_at: '2024-01-21T14:20:00.000Z',
  updated_at: '2024-01-21T14:20:00.000Z',
};

export const testUser1CartItem2: CartItem = {
  id: '40000000-0000-0000-0000-000000000004',
  user_id: testUser1.id,
  product_id: eveningBlouse.id,
  quantity: 1,
  created_at: '2024-01-21T14:25:00.000Z',
  updated_at: '2024-01-21T14:25:00.000Z',
};

export const cartItemFixtures: CartItem[] = [
  customerCartItem1,
  customerCartItem2,
  testUser1CartItem1,
  testUser1CartItem2,
];

// Helper to create a cart item with custom properties
export const createCartItemFixture = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: '40000000-0000-0000-0000-000000000099',
  user_id: customerUser.id,
  product_id: denimJacket.id,
  quantity: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
