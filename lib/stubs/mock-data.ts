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
    name: 'Man',
    description: 'Fashion and apparel for men - shirts, pants, jackets, shoes, and accessories',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    parent_id: null,
  },
  {
    id: 'cat-2',
    name: 'Woman',
    description: 'Fashion and apparel for women - dresses, tops, bottoms, shoes, and accessories',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    parent_id: null,
  },
  {
    id: 'cat-3',
    name: 'Teens',
    description: 'Trendy fashion for teenagers - casual wear, streetwear, and youth styles',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    parent_id: null,
  },
  {
    id: 'cat-4',
    name: 'Kids',
    description: 'Comfortable and fun clothing for children of all ages',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    parent_id: null,
  },
  {
    id: 'cat-5',
    name: 'Books & Media',
    description: 'Books, magazines, movies, music, and digital content',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    parent_id: null,
  },
  {
    id: 'cat-6',
    name: 'Toys & Games',
    description: 'Fun toys, board games, puzzles, and educational products for all ages',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    parent_id: null,
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Classic Denim Jacket',
    description: 'Vintage-style denim jacket perfect for casual outings and layering',
    price: 89.99,
    category_id: 'cat-1', // Man
    image_url: 'https://via.placeholder.com/400x400?text=Denim+Jacket',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 45,
    is_featured: true,
    stripe_product_id: null,
  },
  {
    id: 'prod-2',
    name: 'Floral Summer Dress',
    description: 'Elegant floral dress perfect for summer occasions and everyday wear',
    price: 79.99,
    category_id: 'cat-2', // Woman
    image_url: 'https://via.placeholder.com/400x400?text=Summer+Dress',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 60,
    is_featured: true,
    stripe_product_id: null,
  },
  {
    id: 'prod-3',
    name: 'Streetwear Hoodie',
    description: 'Trendy oversized hoodie with urban design, perfect for teens',
    price: 65.99,
    category_id: 'cat-3', // Teens
    image_url: 'https://via.placeholder.com/400x400?text=Teen+Hoodie',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 80,
    is_featured: false,
    stripe_product_id: null,
  },
  {
    id: 'prod-4',
    name: 'Kids Rainbow T-Shirt',
    description: 'Colorful and comfortable t-shirt with fun rainbow design for children',
    price: 24.99,
    category_id: 'cat-4', // Kids
    image_url: 'https://via.placeholder.com/400x400?text=Kids+Rainbow+Tee',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 120,
    is_featured: false,
    stripe_product_id: null,
  },
  {
    id: 'prod-5',
    name: 'Fashion Photography Book',
    description: 'Stunning collection of contemporary fashion photography',
    price: 39.99,
    category_id: 'cat-5', // Books & Media
    image_url: 'https://via.placeholder.com/400x400?text=Fashion+Book',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 30,
    is_featured: false,
    stripe_product_id: null,
  },
  {
    id: 'prod-6',
    name: 'Designer Puzzle Game',
    description: 'Creative puzzle game featuring fashion designs and patterns',
    price: 32.99,
    category_id: 'cat-6', // Toys & Games
    image_url: 'https://via.placeholder.com/400x400?text=Fashion+Puzzle',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 50,
    is_featured: false,
    stripe_product_id: null,
  },
  {
    id: 'prod-7',
    name: 'Casual Button-Up Shirt',
    description: 'Versatile button-up shirt for professional and casual wear',
    price: 54.99,
    category_id: 'cat-1', // Man
    image_url: 'https://via.placeholder.com/400x400?text=Button+Shirt',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 70,
    is_featured: false,
    stripe_product_id: null,
  },
  {
    id: 'prod-8',
    name: 'Elegant Evening Blouse',
    description: 'Sophisticated blouse perfect for evening events and dinner parties',
    price: 69.99,
    category_id: 'cat-2', // Woman
    image_url: 'https://via.placeholder.com/400x400?text=Evening+Blouse',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    inventory_count: 40,
    is_featured: true,
    stripe_product_id: null,
  },
];

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'John Doe',
  avatar_url: 'https://via.placeholder.com/150x150?text=JD',
  role: 'customer',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockAdminUser: User = {
  id: 'admin-1',
  email: 'admin@example.com',
  full_name: 'Admin User',
  avatar_url: 'https://via.placeholder.com/150x150?text=AU',
  role: 'admin',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockCartItems: CartItem[] = [
  {
    id: 'cart-1',
    user_id: 'user-1',
    product_id: 'prod-1',
    quantity: 2,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cart-2',
    user_id: 'user-1',
    product_id: 'prod-2',
    quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    user_id: 'user-1',
    status: 'pending',
    total: 429.97,
    payment_intent_id: 'pi_test_123',
    shipping_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
    },
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
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
