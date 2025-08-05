// Mock data for development stubs
import { Database } from '@/types/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type CartItem = Database['public']['Tables']['cart_items']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Electronic devices and gadgets including smartphones, laptops, headphones',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
  {
    id: 'cat-2',
    name: 'Clothing',
    description: 'Fashion and apparel for men, women, and children',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
  {
    id: 'cat-3',
    name: 'Home & Garden',
    description: 'Home improvement, furniture, and gardening supplies',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
  {
    id: 'cat-4',
    name: 'Sports & Fitness',
    description: 'Exercise equipment, sportswear, and outdoor gear',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
  {
    id: 'cat-5',
    name: 'Books & Media',
    description: 'Books, movies, music, and digital content',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
  {
    id: 'cat-6',
    name: 'Health & Beauty',
    description: 'Skincare, cosmetics, vitamins, and personal care',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
  {
    id: 'cat-7',
    name: 'Toys & Games',
    description: 'Children toys, board games, and educational products',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
  {
    id: 'cat-8',
    name: 'Automotive',
    description: 'Car parts, accessories, and maintenance supplies',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: null,
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    category_id: 'cat-1',
    image_url: 'https://via.placeholder.com/400x400?text=Wireless+Headphones',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_count: 50,
    is_featured: true,
    stripe_product_id: null,
  },
  {
    id: 'prod-2',
    name: 'Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt in various colors',
    price: 29.99,
    category_id: 'cat-2',
    image_url: 'https://via.placeholder.com/400x400?text=Cotton+T-Shirt',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_count: 100,
    is_featured: false,
    stripe_product_id: null,
  },
  {
    id: 'prod-3',
    name: 'Garden Rake',
    description: 'Heavy-duty garden rake for yard maintenance',
    price: 45.99,
    category_id: 'cat-3',
    image_url: 'https://via.placeholder.com/400x400?text=Garden+Rake',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_count: 25,
    is_featured: true,
    stripe_product_id: null,
  },
  {
    id: 'prod-4',
    name: 'Running Shoes',
    description: 'Comfortable running shoes for all terrains',
    price: 89.99,
    category_id: 'cat-4',
    image_url: 'https://via.placeholder.com/400x400?text=Running+Shoes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_count: 75,
    is_featured: false,
    stripe_product_id: null,
  },
  {
    id: 'prod-5',
    name: 'Mystery Novel',
    description: 'Bestselling mystery novel by acclaimed author',
    price: 14.99,
    category_id: 'cat-5',
    image_url: 'https://via.placeholder.com/400x400?text=Mystery+Novel',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_count: 200,
    is_featured: false,
    stripe_product_id: null,
  },
];

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  role: 'customer',
  is_verified: true,
  avatar_url: 'https://via.placeholder.com/150x150?text=JD',
  date_of_birth: '1990-01-01',
  preferences: {
    newsletter: true,
    marketing: false,
  },
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@example.com',
  role: 'admin',
  first_name: 'Admin',
  last_name: 'User',
};

export const mockCartItems: CartItem[] = [
  {
    id: 'cart-1',
    user_id: 'user-1',
    product_id: 'prod-1',
    quantity: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cart-2',
    user_id: 'user-1',
    product_id: 'prod-2',
    quantity: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    user_id: 'user-1',
    status: 'pending',
    total: 429.97,
    currency: 'USD',
    payment_intent_id: 'pi_test_123',
    shipping_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
    },
    billing_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_number: 'ORD-001',
    payment_status: 'pending',
    fulfillment_status: 'unfulfilled',
    notes: 'Test order',
    discount_amount: 0,
    tax_amount: 30.00,
    shipping_amount: 9.99,
    tracking_number: null,
    estimated_delivery: null,
  },
];

// Helper functions to create mock data with overrides
export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  ...mockProducts[0],
  ...overrides,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  ...overrides,
});

export const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  ...mockCategories[0],
  ...overrides,
});

export const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  ...mockCartItems[0],
  ...overrides,
});

export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  ...mockOrders[0],
  ...overrides,
});