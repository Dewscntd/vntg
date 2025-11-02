/**
 * User Fixtures
 * Test data for users with various roles and states
 */

import { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];

export const adminUser: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@vntg.local',
  full_name: 'Admin User',
  avatar_url: 'https://i.pravatar.cc/150?u=admin@vntg.local',
  role: 'admin',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const customerUser: User = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'customer@vntg.local',
  full_name: 'John Doe',
  avatar_url: 'https://i.pravatar.cc/150?u=customer@vntg.local',
  role: 'customer',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const testUser1: User = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'jane.smith@vntg.local',
  full_name: 'Jane Smith',
  avatar_url: 'https://i.pravatar.cc/150?u=jane.smith@vntg.local',
  role: 'customer',
  created_at: '2024-01-02T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

export const testUser2: User = {
  id: '00000000-0000-0000-0000-000000000004',
  email: 'bob.johnson@vntg.local',
  full_name: 'Bob Johnson',
  avatar_url: 'https://i.pravatar.cc/150?u=bob.johnson@vntg.local',
  role: 'customer',
  created_at: '2024-01-03T00:00:00.000Z',
  updated_at: '2024-01-03T00:00:00.000Z',
};

export const testUser3: User = {
  id: '00000000-0000-0000-0000-000000000005',
  email: 'alice.williams@vntg.local',
  full_name: 'Alice Williams',
  avatar_url: 'https://i.pravatar.cc/150?u=alice.williams@vntg.local',
  role: 'customer',
  created_at: '2024-01-04T00:00:00.000Z',
  updated_at: '2024-01-04T00:00:00.000Z',
};

export const userFixtures: User[] = [
  adminUser,
  customerUser,
  testUser1,
  testUser2,
  testUser3,
];

// Default password for all test users (use in seed scripts)
export const TEST_USER_PASSWORD = 'TestPassword123!';

// Helper to create a user with custom properties
export const createUserFixture = (overrides: Partial<User> = {}): User => ({
  id: '00000000-0000-0000-0000-000000000099',
  email: 'test@vntg.local',
  full_name: 'Test User',
  avatar_url: null,
  role: 'customer',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
