/**
 * Address Fixtures
 * Test data for user addresses
 */

import { Database } from '@/types/supabase';
import { customerUser, testUser1, testUser2 } from './users';

type UserAddress = Database['public']['Tables']['user_addresses']['Row'];

export const customerAddress1: UserAddress = {
  id: '50000000-0000-0000-0000-000000000001',
  user_id: customerUser.id,
  name: 'John Doe',
  street: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'US',
  is_default: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const customerAddress2: UserAddress = {
  id: '50000000-0000-0000-0000-000000000002',
  user_id: customerUser.id,
  name: 'John Doe',
  street: '456 Work Plaza, Suite 200',
  city: 'New York',
  state: 'NY',
  zip: '10002',
  country: 'US',
  is_default: false,
  created_at: '2024-01-05T00:00:00.000Z',
  updated_at: '2024-01-05T00:00:00.000Z',
};

export const testUser1Address: UserAddress = {
  id: '50000000-0000-0000-0000-000000000003',
  user_id: testUser1.id,
  name: 'Jane Smith',
  street: '456 Oak Avenue',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90001',
  country: 'US',
  is_default: true,
  created_at: '2024-01-02T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

export const testUser2Address: UserAddress = {
  id: '50000000-0000-0000-0000-000000000004',
  user_id: testUser2.id,
  name: 'Bob Johnson',
  street: '789 Pine Road',
  city: 'Chicago',
  state: 'IL',
  zip: '60601',
  country: 'US',
  is_default: true,
  created_at: '2024-01-03T00:00:00.000Z',
  updated_at: '2024-01-03T00:00:00.000Z',
};

export const internationalAddress: UserAddress = {
  id: '50000000-0000-0000-0000-000000000005',
  user_id: customerUser.id,
  name: 'John Doe',
  street: '10 Downing Street',
  city: 'London',
  state: 'Greater London',
  zip: 'SW1A 2AA',
  country: 'GB',
  is_default: false,
  created_at: '2024-01-10T00:00:00.000Z',
  updated_at: '2024-01-10T00:00:00.000Z',
};

export const addressFixtures: UserAddress[] = [
  customerAddress1,
  customerAddress2,
  testUser1Address,
  testUser2Address,
  internationalAddress,
];

// Helper to create an address with custom properties
export const createAddressFixture = (overrides: Partial<UserAddress> = {}): UserAddress => ({
  id: '50000000-0000-0000-0000-000000000099',
  user_id: customerUser.id,
  name: 'Test User',
  street: '123 Test Street',
  city: 'Test City',
  state: 'TC',
  zip: '12345',
  country: 'US',
  is_default: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
