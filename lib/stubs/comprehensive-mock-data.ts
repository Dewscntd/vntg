// Comprehensive mock data for all entities in the system
import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];

// ====================
// CATEGORIES (Hierarchical)
// ====================
export const MOCK_CATEGORIES: Tables['categories']['Row'][] = [
  // Main Categories
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Vintage Clothing',
    slug: 'vintage-clothing',
    description: 'Authentic vintage fashion from different eras',
    image_url: 'https://picsum.photos/seed/vintage-clothing/800/600',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Retro Electronics',
    slug: 'retro-electronics',
    description: 'Classic electronics and gadgets from the past',
    image_url: 'https://picsum.photos/seed/retro-electronics/800/600',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Collectibles',
    slug: 'collectibles',
    description: 'Rare and unique collectible items',
    image_url: 'https://picsum.photos/seed/collectibles/800/600',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Vintage Accessories',
    slug: 'vintage-accessories',
    description: 'Classic accessories and jewelry',
    image_url: 'https://picsum.photos/seed/accessories/800/600',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Home & Decor',
    slug: 'home-decor',
    description: 'Vintage home furnishings and decorations',
    image_url: 'https://picsum.photos/seed/home-decor/800/600',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'Art & Prints',
    slug: 'art-prints',
    description: 'Vintage art, posters, and prints',
    image_url: 'https://picsum.photos/seed/art/800/600',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // Subcategories for Vintage Clothing
  {
    id: '10000000-0000-0000-0000-000000000011',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Vintage dresses from various decades',
    image_url: 'https://picsum.photos/seed/dresses/800/600',
    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000012',
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Vintage jackets, coats, and vests',
    image_url: 'https://picsum.photos/seed/outerwear/800/600',
    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000013',
    name: 'Denim',
    slug: 'denim',
    description: 'Classic vintage jeans and denim pieces',
    image_url: 'https://picsum.photos/seed/denim/800/600',
    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000014',
    name: 'Band T-Shirts',
    slug: 'band-tshirts',
    description: 'Authentic vintage band merchandise',
    image_url: 'https://picsum.photos/seed/band-tshirts/800/600',
    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ====================
// PRODUCTS (50+ items)
// ====================
export const MOCK_PRODUCTS: Tables['products']['Row'][] = [
  // Vintage Clothing
  {
    id: '20000000-0000-0000-0000-000000000001',
    name: '1970s Boho Maxi Dress',
    description:
      'Beautiful flowing maxi dress with floral print. Features bell sleeves and empire waist. Perfect condition.',
    price: 12500, // ₪125.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/dress1/800/600',
    category_id: '10000000-0000-0000-0000-000000000011',
    inventory_count: 1,
    is_featured: true,
    specifications: {
      size: 'M',
      condition: 'Excellent',
      brand: 'Unknown',
      era: '1970s',
      materials: 'Cotton, Polyester',
    },
    stripe_product_id: null,
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    name: 'Vintage Levi\'s 501 Jeans',
    description:
      'Classic Levi\'s 501 button-fly jeans from the 1980s. Authentic vintage wash with natural distressing.',
    price: 18000, // ₪180.00
    discount_percent: 10,
    image_url: 'https://picsum.photos/seed/levis/800/600',
    category_id: '10000000-0000-0000-0000-000000000013',
    inventory_count: 3,
    is_featured: true,
    specifications: {
      size: '32x32',
      condition: 'Very Good',
      brand: "Levi's",
      era: '1980s',
      materials: 'Denim',
    },
    stripe_product_id: null,
    created_at: '2024-10-14T09:00:00Z',
    updated_at: '2024-10-14T09:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    name: 'Pink Floyd 1977 Tour Shirt',
    description:
      'Authentic Pink Floyd Animals Tour 1977 vintage t-shirt. Rare find in excellent condition.',
    price: 45000, // ₪450.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/pinkfloyd/800/600',
    category_id: '10000000-0000-0000-0000-000000000014',
    inventory_count: 1,
    is_featured: true,
    specifications: {
      size: 'L',
      condition: 'Excellent',
      brand: 'Original Tour Merchandise',
      era: '1970s',
      materials: 'Cotton',
    },
    stripe_product_id: null,
    created_at: '2024-10-13T15:30:00Z',
    updated_at: '2024-10-13T15:30:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    name: 'Vintage Leather Bomber Jacket',
    description:
      'Classic brown leather bomber jacket from the 1980s. Genuine leather with quilted lining.',
    price: 35000, // ₪350.00
    discount_percent: 15,
    image_url: 'https://picsum.photos/seed/bomber/800/600',
    category_id: '10000000-0000-0000-0000-000000000012',
    inventory_count: 2,
    is_featured: false,
    specifications: {
      size: 'L',
      condition: 'Very Good',
      brand: 'Unknown',
      era: '1980s',
      materials: 'Leather',
    },
    stripe_product_id: null,
    created_at: '2024-10-12T11:00:00Z',
    updated_at: '2024-10-12T11:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    name: '1960s Mod Mini Dress',
    description:
      'Swinging 60s mini dress in geometric print. A-line cut with short sleeves. True vintage piece.',
    price: 14500, // ₪145.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/moddress/800/600',
    category_id: '10000000-0000-0000-0000-000000000011',
    inventory_count: 1,
    is_featured: false,
    specifications: {
      size: 'S',
      condition: 'Excellent',
      brand: 'Unknown',
      era: '1960s',
      materials: 'Polyester',
    },
    stripe_product_id: null,
    created_at: '2024-10-11T14:20:00Z',
    updated_at: '2024-10-11T14:20:00Z',
  },

  // Retro Electronics
  {
    id: '20000000-0000-0000-0000-000000000006',
    name: 'Sony Walkman WM-10',
    description:
      'Ultra-compact Sony Walkman from 1983. The thinnest Walkman ever made. Fully functional.',
    price: 28000, // ₪280.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/walkman/800/600',
    category_id: '10000000-0000-0000-0000-000000000002',
    inventory_count: 1,
    is_featured: true,
    specifications: {
      condition: 'Very Good',
      brand: 'Sony',
      year: '1983',
      working: 'Yes',
    },
    stripe_product_id: null,
    created_at: '2024-10-10T10:00:00Z',
    updated_at: '2024-10-10T10:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    name: 'Polaroid SX-70 Camera',
    description:
      'Iconic Polaroid SX-70 instant camera. Fully functional with leather case. True photography legend.',
    price: 42000, // ₪420.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/polaroid/800/600',
    category_id: '10000000-0000-0000-0000-000000000002',
    inventory_count: 2,
    is_featured: true,
    specifications: {
      condition: 'Excellent',
      brand: 'Polaroid',
      year: '1970s',
      working: 'Yes',
    },
    stripe_product_id: null,
    created_at: '2024-10-09T16:45:00Z',
    updated_at: '2024-10-09T16:45:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    name: 'Nintendo Game Boy Original',
    description:
      'Original gray Nintendo Game Boy from 1989. Works perfectly with Tetris included.',
    price: 15000, // ₪150.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/gameboy/800/600',
    category_id: '10000000-0000-0000-0000-000000000002',
    inventory_count: 3,
    is_featured: false,
    specifications: {
      condition: 'Good',
      brand: 'Nintendo',
      year: '1989',
      working: 'Yes',
    },
    stripe_product_id: null,
    created_at: '2024-10-08T12:30:00Z',
    updated_at: '2024-10-08T12:30:00Z',
  },

  // Collectibles
  {
    id: '20000000-0000-0000-0000-000000000009',
    name: 'Original Star Wars Action Figures Set',
    description:
      'Complete set of 12 original Kenner Star Wars action figures from 1977-1980. Mint in box.',
    price: 125000, // ₪1,250.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/starwars/800/600',
    category_id: '10000000-0000-0000-0000-000000000003',
    inventory_count: 1,
    is_featured: true,
    specifications: {
      condition: 'Mint',
      brand: 'Kenner',
      year: '1977-1980',
      complete: 'Yes',
    },
    stripe_product_id: null,
    created_at: '2024-10-07T09:15:00Z',
    updated_at: '2024-10-07T09:15:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000010',
    name: '1st Edition Pokémon Cards Booster Box',
    description:
      'Sealed 1st Edition Base Set Pokémon booster box from 1999. Extremely rare collector\'s item.',
    price: 450000, // ₪4,500.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/pokemon/800/600',
    category_id: '10000000-0000-0000-0000-000000000003',
    inventory_count: 1,
    is_featured: true,
    specifications: {
      condition: 'Mint',
      brand: 'Wizards of the Coast',
      year: '1999',
      sealed: 'Yes',
    },
    stripe_product_id: null,
    created_at: '2024-10-06T14:00:00Z',
    updated_at: '2024-10-06T14:00:00Z',
  },

  // Vintage Accessories
  {
    id: '20000000-0000-0000-0000-000000000011',
    name: 'Vintage Aviator Sunglasses',
    description:
      'Classic aviator sunglasses from the 1970s. Gold-tone metal frame with original case.',
    price: 8500, // ₪85.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/aviators/800/600',
    category_id: '10000000-0000-0000-0000-000000000004',
    inventory_count: 5,
    is_featured: false,
    specifications: {
      condition: 'Very Good',
      brand: 'Ray-Ban',
      era: '1970s',
      materials: 'Metal, Glass',
    },
    stripe_product_id: null,
    created_at: '2024-10-05T11:20:00Z',
    updated_at: '2024-10-05T11:20:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000012',
    name: 'Art Deco Brooch',
    description:
      'Stunning Art Deco brooch from the 1920s. Sterling silver with marcasite stones.',
    price: 22000, // ₪220.00
    discount_percent: 0,
    image_url: 'https://picsum.photos/seed/brooch/800/600',
    category_id: '10000000-0000-0000-0000-000000000004',
    inventory_count: 1,
    is_featured: false,
    specifications: {
      condition: 'Excellent',
      era: '1920s',
      materials: 'Sterling Silver, Marcasite',
    },
    stripe_product_id: null,
    created_at: '2024-10-04T15:40:00Z',
    updated_at: '2024-10-04T15:40:00Z',
  },

  // Add more products to reach 50+ items
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `20000000-0000-0000-0000-0000000000${(i + 13).toString().padStart(2, '0')}`,
    name: `Vintage Item ${i + 13}`,
    description: `Authentic vintage item #${i + 13}. Excellent condition and great value.`,
    price: Math.floor(Math.random() * 50000) + 5000, // Random price between ₪50-₪550
    discount_percent: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0,
    image_url: `https://picsum.photos/seed/item${i + 13}/800/600`,
    category_id: MOCK_CATEGORIES[Math.floor(Math.random() * 6)].id,
    inventory_count: Math.floor(Math.random() * 5) + 1,
    is_featured: Math.random() > 0.8,
    specifications: {
      condition: ['Mint', 'Excellent', 'Very Good', 'Good'][Math.floor(Math.random() * 4)],
    },
    stripe_product_id: null,
    created_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
  })),
];

// ====================
// USERS
// ====================
export const MOCK_USERS: Tables['users']['Row'][] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@vntg.local',
    full_name: 'Admin User',
    avatar_url: 'https://i.pravatar.cc/150?u=admin',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'customer@vntg.local',
    full_name: 'John Customer',
    avatar_url: 'https://i.pravatar.cc/150?u=customer',
    role: 'customer',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'jane.doe@example.com',
    full_name: 'Jane Doe',
    avatar_url: 'https://i.pravatar.cc/150?u=jane',
    role: 'customer',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'michaelvx@gmail.com',
    full_name: 'Michael Admin',
    avatar_url: 'https://i.pravatar.cc/150?u=michael',
    role: 'admin',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
  },
];

// ====================
// ORDERS
// ====================
export const MOCK_ORDERS: Tables['orders']['Row'][] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    status: 'completed',
    total: 30500,
    payment_intent_id: 'pi_mock_001',
    shipping_address: JSON.stringify({
      name: 'John Customer',
      street: '123 Vintage St',
      city: 'Tel Aviv',
      state: 'Tel Aviv District',
      zip: '6789012',
      country: 'IL',
    }),
    created_at: '2024-10-20T10:30:00Z',
    updated_at: '2024-10-22T15:45:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000002',
    status: 'processing',
    total: 18000,
    payment_intent_id: 'pi_mock_002',
    shipping_address: JSON.stringify({
      name: 'John Customer',
      street: '123 Vintage St',
      city: 'Tel Aviv',
      state: 'Tel Aviv District',
      zip: '6789012',
      country: 'IL',
    }),
    created_at: '2024-10-25T14:20:00Z',
    updated_at: '2024-10-25T14:20:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    user_id: '00000000-0000-0000-0000-000000000003',
    status: 'pending',
    total: 42000,
    payment_intent_id: 'pi_mock_003',
    shipping_address: JSON.stringify({
      name: 'Jane Doe',
      street: '456 Collector Ave',
      city: 'Haifa',
      state: 'Haifa District',
      zip: '3100101',
      country: 'IL',
    }),
    created_at: '2024-10-28T09:15:00Z',
    updated_at: '2024-10-28T09:15:00Z',
  },
];

// ====================
// CART ITEMS
// ====================
export const MOCK_CART_ITEMS: Tables['cart_items']['Row'][] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000001',
    quantity: 1,
    created_at: '2024-10-29T10:00:00Z',
    updated_at: '2024-10-29T10:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000006',
    quantity: 1,
    created_at: '2024-10-29T11:30:00Z',
    updated_at: '2024-10-29T11:30:00Z',
  },
];

// ====================
// ADDRESSES
// ====================
export const MOCK_ADDRESSES: Tables['addresses']['Row'][] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    type: 'shipping',
    first_name: 'John',
    last_name: 'Customer',
    street_address: '123 Vintage St',
    apartment: 'Apt 4',
    city: 'Tel Aviv',
    state: 'Tel Aviv District',
    postal_code: '6789012',
    country: 'IL',
    phone: '+972-50-123-4567',
    is_default: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000003',
    type: 'shipping',
    first_name: 'Jane',
    last_name: 'Doe',
    street_address: '456 Collector Ave',
    apartment: null,
    city: 'Haifa',
    state: 'Haifa District',
    postal_code: '3100101',
    country: 'IL',
    phone: '+972-52-987-6543',
    is_default: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

// ====================
// ORDER ITEMS
// ====================
export const MOCK_ORDER_ITEMS: Tables['order_items']['Row'][] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    order_id: '30000000-0000-0000-0000-000000000001',
    product_id: '20000000-0000-0000-0000-000000000001',
    quantity: 1,
    price: 12500,
    created_at: '2024-10-20T10:30:00Z',
    updated_at: '2024-10-20T10:30:00Z',
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    order_id: '30000000-0000-0000-0000-000000000001',
    product_id: '20000000-0000-0000-0000-000000000002',
    quantity: 1,
    price: 18000,
    created_at: '2024-10-20T10:30:00Z',
    updated_at: '2024-10-20T10:30:00Z',
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    order_id: '30000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000002',
    quantity: 1,
    price: 18000,
    created_at: '2024-10-25T14:20:00Z',
    updated_at: '2024-10-25T14:20:00Z',
  },
  {
    id: '60000000-0000-0000-0000-000000000004',
    order_id: '30000000-0000-0000-0000-000000000003',
    product_id: '20000000-0000-0000-0000-000000000007',
    quantity: 1,
    price: 42000,
    created_at: '2024-10-28T09:15:00Z',
    updated_at: '2024-10-28T09:15:00Z',
  },
];

// ====================
// HELPER FUNCTIONS
// ====================

export function getAllMockData() {
  return {
    categories: MOCK_CATEGORIES,
    products: MOCK_PRODUCTS,
    users: MOCK_USERS,
    orders: MOCK_ORDERS,
    cartItems: MOCK_CART_ITEMS,
    addresses: MOCK_ADDRESSES,
    orderItems: MOCK_ORDER_ITEMS,
  };
}

export function resetMockData() {
  console.log('🔄 Mock data reset to initial state');
  return getAllMockData();
}

// Test credentials
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@vntg.local',
    password: 'TestPassword123!',
    user: MOCK_USERS[0],
  },
  customer: {
    email: 'customer@vntg.local',
    password: 'TestPassword123!',
    user: MOCK_USERS[1],
  },
  michaelAdmin: {
    email: 'michaelvx@gmail.com',
    password: 'admin123',
    user: MOCK_USERS[3],
  },
};
