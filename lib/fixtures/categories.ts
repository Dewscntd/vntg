/**
 * Category Fixtures
 * Test data for product categories with hierarchical relationships
 */

import { Database } from '@/types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

export const menCategory: Category = {
  id: '10000000-0000-0000-0000-000000000001',
  name: 'Man',
  description: 'Fashion and apparel for men - shirts, pants, jackets, shoes, and accessories',
  parent_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const womenCategory: Category = {
  id: '10000000-0000-0000-0000-000000000002',
  name: 'Woman',
  description: 'Fashion and apparel for women - dresses, tops, bottoms, shoes, and accessories',
  parent_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const teensCategory: Category = {
  id: '10000000-0000-0000-0000-000000000003',
  name: 'Teens',
  description: 'Trendy fashion for teenagers - casual wear, streetwear, and youth styles',
  parent_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const kidsCategory: Category = {
  id: '10000000-0000-0000-0000-000000000004',
  name: 'Kids',
  description: 'Comfortable and fun clothing for children of all ages',
  parent_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const booksMediaCategory: Category = {
  id: '10000000-0000-0000-0000-000000000005',
  name: 'Books & Media',
  description: 'Books, magazines, movies, music, and digital content',
  parent_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const toysGamesCategory: Category = {
  id: '10000000-0000-0000-0000-000000000006',
  name: 'Toys & Games',
  description: 'Fun toys, board games, puzzles, and educational products for all ages',
  parent_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Subcategories
export const menShirtsCategory: Category = {
  id: '10000000-0000-0000-0000-000000000011',
  name: 'Shirts',
  description: 'Casual and formal shirts for men',
  parent_id: menCategory.id,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const menPantsCategory: Category = {
  id: '10000000-0000-0000-0000-000000000012',
  name: 'Pants',
  description: 'Jeans, chinos, and dress pants for men',
  parent_id: menCategory.id,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const womenDressesCategory: Category = {
  id: '10000000-0000-0000-0000-000000000021',
  name: 'Dresses',
  description: 'Elegant and casual dresses for women',
  parent_id: womenCategory.id,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const womenTopsCategory: Category = {
  id: '10000000-0000-0000-0000-000000000022',
  name: 'Tops',
  description: 'Blouses, t-shirts, and tank tops for women',
  parent_id: womenCategory.id,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const categoryFixtures: Category[] = [
  // Parent categories
  menCategory,
  womenCategory,
  teensCategory,
  kidsCategory,
  booksMediaCategory,
  toysGamesCategory,

  // Subcategories
  menShirtsCategory,
  menPantsCategory,
  womenDressesCategory,
  womenTopsCategory,
];

// Helper to create a category with custom properties
export const createCategoryFixture = (overrides: Partial<Category> = {}): Category => ({
  id: '10000000-0000-0000-0000-000000000099',
  name: 'Test Category',
  description: 'Test category description',
  parent_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
