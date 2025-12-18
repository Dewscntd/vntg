// Comprehensive mock data for all entities in the system
import { Database } from '@/types/supabase';
import { CollectionWithProducts } from '@/types/collections';

type Tables = Database['public']['Tables'];

// Default product fields for required properties
const defaultProductFields = {
  discount_percent: 0,
  specifications: null,
  material: null,
  country_of_origin: null,
  care_instructions: null,
  season: null as 'spring-summer' | 'fall-winter' | 'all-season' | null,
  collection_year: null,
};

// ====================
// CATEGORIES (Hierarchical)
// ====================
export const MOCK_CATEGORIES: Tables['categories']['Row'][] = [
  // Main Categories
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Vintage Clothing',
    description: 'Authentic vintage fashion from different eras',

    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Retro Electronics',
    description: 'Classic electronics and gadgets from the past',

    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Collectibles',
    description: 'Rare and unique collectible items',

    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Vintage Accessories',
    description: 'Classic accessories and jewelry',

    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Home & Decor',
    description: 'Vintage home furnishings and decorations',

    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'Art & Prints',
    description: 'Vintage art, posters, and prints',

    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // Subcategories for Vintage Clothing
  {
    id: '10000000-0000-0000-0000-000000000011',
    name: 'Dresses',
    description: 'Vintage dresses from various decades',

    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000012',
    name: 'Outerwear',
    description: 'Vintage jackets, coats, and vests',

    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000013',
    name: 'Denim',
    description: 'Classic vintage jeans and denim pieces',

    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000014',
    name: 'Band T-Shirts',
    description: 'Authentic vintage band merchandise',

    parent_id: '10000000-0000-0000-0000-000000000001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ====================
// PRODUCTS (50+ items)
// ====================
const MOCK_PRODUCTS_RAW = [
  // Vintage Clothing
  {
    id: '20000000-0000-0000-0000-000000000001',
    name: '1970s Boho Maxi Dress',
    description:
      'Beautiful flowing maxi dress with floral print. Features bell sleeves and empire waist. Perfect condition. Size: M, Condition: Excellent, Brand: Unknown, Era: 1970s, Materials: Cotton, Polyester',
    price: 12500, // ₪125.00
    image_url: 'https://picsum.photos/seed/dress1/800/600',
    category_id: '10000000-0000-0000-0000-000000000011',
    inventory_count: 1,
    is_featured: true,
    stripe_product_id: null,
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    name: "Vintage Levi's 501 Jeans",
    description:
      "Classic Levi's 501 button-fly jeans from the 1980s. Authentic vintage wash with natural distressing. Size: 32x32, Condition: Very Good, Brand: Levi's, Era: 1980s, Materials: Denim",
    price: 18000, // ₪180.00
    image_url: 'https://picsum.photos/seed/levis/800/600',
    category_id: '10000000-0000-0000-0000-000000000013',
    inventory_count: 3,
    is_featured: true,
    stripe_product_id: null,
    created_at: '2024-10-14T09:00:00Z',
    updated_at: '2024-10-14T09:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    name: 'Pink Floyd 1977 Tour Shirt',
    description:
      'Authentic Pink Floyd Animals Tour 1977 vintage t-shirt. Rare find in excellent condition. Size: L, Condition: Excellent, Brand: Original Tour Merchandise, Era: 1970s, Materials: Cotton',
    price: 45000, // ₪450.00
    image_url: 'https://picsum.photos/seed/pinkfloyd/800/600',
    category_id: '10000000-0000-0000-0000-000000000014',
    inventory_count: 1,
    is_featured: true,
    stripe_product_id: null,
    created_at: '2024-10-13T15:30:00Z',
    updated_at: '2024-10-13T15:30:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    name: 'Vintage Leather Bomber Jacket',
    description:
      'Classic brown leather bomber jacket from the 1980s. Genuine leather with quilted lining. Size: L, Condition: Very Good, Brand: Unknown, Era: 1980s, Materials: Leather',
    price: 35000, // ₪350.00
    image_url: 'https://picsum.photos/seed/bomber/800/600',
    category_id: '10000000-0000-0000-0000-000000000012',
    inventory_count: 2,
    is_featured: false,
    stripe_product_id: null,
    created_at: '2024-10-12T11:00:00Z',
    updated_at: '2024-10-12T11:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    name: '1960s Mod Mini Dress',
    description:
      'Swinging 60s mini dress in geometric print. A-line cut with short sleeves. True vintage piece. Size: S, Condition: Excellent, Brand: Unknown, Era: 1960s, Materials: Polyester',
    price: 14500, // ₪145.00
    image_url: 'https://picsum.photos/seed/moddress/800/600',
    category_id: '10000000-0000-0000-0000-000000000011',
    inventory_count: 1,
    is_featured: false,
    stripe_product_id: null,
    created_at: '2024-10-11T14:20:00Z',
    updated_at: '2024-10-11T14:20:00Z',
  },

  // Retro Electronics
  {
    id: '20000000-0000-0000-0000-000000000006',
    name: 'Sony Walkman WM-10',
    description:
      'Ultra-compact Sony Walkman from 1983. The thinnest Walkman ever made. Fully functional. Condition: Very Good, Brand: Sony, Year: 1983, Working: Yes',
    price: 28000, // ₪280.00
    image_url: 'https://picsum.photos/seed/walkman/800/600',
    category_id: '10000000-0000-0000-0000-000000000002',
    inventory_count: 1,
    is_featured: true,
    stripe_product_id: null,
    created_at: '2024-10-10T10:00:00Z',
    updated_at: '2024-10-10T10:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    name: 'Polaroid SX-70 Camera',
    description:
      'Iconic Polaroid SX-70 instant camera. Fully functional with leather case. True photography legend. Condition: Excellent, Brand: Polaroid, Year: 1970s, Working: Yes',
    price: 42000, // ₪420.00
    image_url: 'https://picsum.photos/seed/polaroid/800/600',
    category_id: '10000000-0000-0000-0000-000000000002',
    inventory_count: 2,
    is_featured: true,
    stripe_product_id: null,
    created_at: '2024-10-09T16:45:00Z',
    updated_at: '2024-10-09T16:45:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    name: 'Nintendo Game Boy Original',
    description:
      'Original gray Nintendo Game Boy from 1989. Works perfectly with Tetris included. Condition: Good, Brand: Nintendo, Year: 1989, Working: Yes',
    price: 15000, // ₪150.00
    image_url: 'https://picsum.photos/seed/gameboy/800/600',
    category_id: '10000000-0000-0000-0000-000000000002',
    inventory_count: 3,
    is_featured: false,
    stripe_product_id: null,
    created_at: '2024-10-08T12:30:00Z',
    updated_at: '2024-10-08T12:30:00Z',
  },

  // Collectibles
  {
    id: '20000000-0000-0000-0000-000000000009',
    name: 'Original Star Wars Action Figures Set',
    description:
      'Complete set of 12 original Kenner Star Wars action figures from 1977-1980. Mint in box. Condition: Mint, Brand: Kenner, Year: 1977-1980, Complete: Yes',
    price: 125000, // ₪1,250.00
    image_url: 'https://picsum.photos/seed/starwars/800/600',
    category_id: '10000000-0000-0000-0000-000000000003',
    inventory_count: 1,
    is_featured: true,
    stripe_product_id: null,
    created_at: '2024-10-07T09:15:00Z',
    updated_at: '2024-10-07T09:15:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000010',
    name: '1st Edition Pokémon Cards Booster Box',
    description:
      "Sealed 1st Edition Base Set Pokémon booster box from 1999. Extremely rare collector's item. Condition: Mint, Brand: Wizards of the Coast, Year: 1999, Sealed: Yes",
    price: 450000, // ₪4,500.00
    image_url: 'https://picsum.photos/seed/pokemon/800/600',
    category_id: '10000000-0000-0000-0000-000000000003',
    inventory_count: 1,
    is_featured: true,
    stripe_product_id: null,
    created_at: '2024-10-06T14:00:00Z',
    updated_at: '2024-10-06T14:00:00Z',
  },

  // Vintage Accessories
  {
    id: '20000000-0000-0000-0000-000000000011',
    name: 'Vintage Aviator Sunglasses',
    description:
      'Classic aviator sunglasses from the 1970s. Gold-tone metal frame with original case. Condition: Very Good, Brand: Ray-Ban, Era: 1970s, Materials: Metal, Glass',
    price: 8500, // ₪85.00
    image_url: 'https://picsum.photos/seed/aviators/800/600',
    category_id: '10000000-0000-0000-0000-000000000004',
    inventory_count: 5,
    is_featured: false,
    stripe_product_id: null,
    created_at: '2024-10-05T11:20:00Z',
    updated_at: '2024-10-05T11:20:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000012',
    name: 'Art Deco Brooch',
    description:
      'Stunning Art Deco brooch from the 1920s. Sterling silver with marcasite stones. Condition: Excellent, Era: 1920s, Materials: Sterling Silver, Marcasite',
    price: 22000, // ₪220.00
    image_url: 'https://picsum.photos/seed/brooch/800/600',
    category_id: '10000000-0000-0000-0000-000000000004',
    inventory_count: 1,
    is_featured: false,
    stripe_product_id: null,
    created_at: '2024-10-04T15:40:00Z',
    updated_at: '2024-10-04T15:40:00Z',
  },

  // Add more products to reach 50+ items
  ...Array.from({ length: 40 }, (_, i) => {
    const condition = ['Mint', 'Excellent', 'Very Good', 'Good'][Math.floor(Math.random() * 4)];
    return {
      id: `20000000-0000-0000-0000-0000000000${(i + 13).toString().padStart(2, '0')}`,
      name: `Vintage Item ${i + 13}`,
      description: `Authentic vintage item #${i + 13}. Excellent condition and great value. Condition: ${condition}`,
      price: Math.floor(Math.random() * 50000) + 5000, // Random price between ₪50-₪550
      image_url: `https://picsum.photos/seed/item${i + 13}/800/600`,
      category_id: MOCK_CATEGORIES[Math.floor(Math.random() * 6)].id,
      inventory_count: Math.floor(Math.random() * 5) + 1,
      is_featured: Math.random() > 0.8,
      stripe_product_id: null,
      created_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    };
  }),
];

// Add default product fields to all products
export const MOCK_PRODUCTS: Tables['products']['Row'][] = MOCK_PRODUCTS_RAW.map((product) => ({
  ...defaultProductFields,
  ...product,
}));

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
export const MOCK_ADDRESSES: Tables['user_addresses']['Row'][] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    name: 'John Customer',
    street: '123 Vintage St, Apt 4',
    city: 'Tel Aviv',
    state: 'Tel Aviv District',
    zip: '6789012',
    country: 'IL',
    is_default: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000003',
    name: 'Jane Doe',
    street: '456 Collector Ave',
    city: 'Haifa',
    state: 'Haifa District',
    zip: '3100101',
    country: 'IL',
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
// COLLECTIONS
// ====================
export const MOCK_COLLECTIONS: Tables['collections']['Row'][] = [
  {
    id: '70000000-0000-0000-0000-000000000001',
    name: 'Editorial Picks',
    slug: 'editorial-picks',
    description: 'Curated selection of our finest vintage pieces, handpicked by our style experts.',
    image_url: 'https://picsum.photos/seed/editorial/1200/600',
    status: 'active',
    display_order: 1,
    metadata: { featured_on_homepage: true, theme: 'luxury' },
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z',
  },
  {
    id: '70000000-0000-0000-0000-000000000002',
    name: 'Summer Sale',
    slug: 'summer-sale',
    description: 'Hot deals on summer essentials. Limited time offers on vintage summer wear.',
    image_url: 'https://picsum.photos/seed/summer/1200/600',
    status: 'active',
    display_order: 2,
    metadata: { discount_percent: 20, end_date: '2024-09-01' },
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
  },
  {
    id: '70000000-0000-0000-0000-000000000003',
    name: 'Retro Tech Treasures',
    slug: 'retro-tech-treasures',
    description: 'Nostalgic electronics and gadgets from the golden era of technology.',
    image_url: 'https://picsum.photos/seed/retrotech/1200/600',
    status: 'active',
    display_order: 3,
    metadata: { category_focus: 'electronics' },
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },
  {
    id: '70000000-0000-0000-0000-000000000004',
    name: '70s Disco Revival',
    slug: '70s-disco-revival',
    description: 'Glitter, glamour, and groovy fashion from the disco era.',
    image_url: 'https://picsum.photos/seed/disco/1200/600',
    status: 'draft',
    display_order: 4,
    metadata: { era: '1970s', style: 'disco' },
    created_at: '2024-10-15T00:00:00Z',
    updated_at: '2024-10-15T00:00:00Z',
  },
  {
    id: '70000000-0000-0000-0000-000000000005',
    name: 'Winter Clearance',
    slug: 'winter-clearance',
    description: 'End of season clearance on winter vintage items.',
    image_url: 'https://picsum.photos/seed/winter/1200/600',
    status: 'archived',
    display_order: 5,
    metadata: { discount_percent: 40 },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
];

// ====================
// COLLECTION PRODUCTS (Junction table)
// ====================
export const MOCK_COLLECTION_PRODUCTS: Tables['collection_products']['Row'][] = [
  // Editorial Picks - Premium items
  {
    id: '80000000-0000-0000-0000-000000000001',
    collection_id: '70000000-0000-0000-0000-000000000001',
    product_id: '20000000-0000-0000-0000-000000000003', // Pink Floyd shirt
    display_order: 1,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000002',
    collection_id: '70000000-0000-0000-0000-000000000001',
    product_id: '20000000-0000-0000-0000-000000000007', // Polaroid camera
    display_order: 2,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000003',
    collection_id: '70000000-0000-0000-0000-000000000001',
    product_id: '20000000-0000-0000-0000-000000000009', // Star Wars figures
    display_order: 3,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000004',
    collection_id: '70000000-0000-0000-0000-000000000001',
    product_id: '20000000-0000-0000-0000-000000000004', // Leather bomber
    display_order: 4,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z',
  },
  // Summer Sale - Clothing items
  {
    id: '80000000-0000-0000-0000-000000000005',
    collection_id: '70000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000001', // Boho maxi dress
    display_order: 1,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000006',
    collection_id: '70000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000005', // Mod mini dress
    display_order: 2,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000007',
    collection_id: '70000000-0000-0000-0000-000000000002',
    product_id: '20000000-0000-0000-0000-000000000011', // Aviator sunglasses
    display_order: 3,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  // Retro Tech - Electronics
  {
    id: '80000000-0000-0000-0000-000000000008',
    collection_id: '70000000-0000-0000-0000-000000000003',
    product_id: '20000000-0000-0000-0000-000000000006', // Sony Walkman
    display_order: 1,
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000009',
    collection_id: '70000000-0000-0000-0000-000000000003',
    product_id: '20000000-0000-0000-0000-000000000007', // Polaroid camera
    display_order: 2,
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000010',
    collection_id: '70000000-0000-0000-0000-000000000003',
    product_id: '20000000-0000-0000-0000-000000000008', // Game Boy
    display_order: 3,
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },
  // 70s Disco Revival (draft)
  {
    id: '80000000-0000-0000-0000-000000000011',
    collection_id: '70000000-0000-0000-0000-000000000004',
    product_id: '20000000-0000-0000-0000-000000000001', // Boho dress
    display_order: 1,
    created_at: '2024-10-15T00:00:00Z',
    updated_at: '2024-10-15T00:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000012',
    collection_id: '70000000-0000-0000-0000-000000000004',
    product_id: '20000000-0000-0000-0000-000000000003', // Pink Floyd shirt
    display_order: 2,
    created_at: '2024-10-15T00:00:00Z',
    updated_at: '2024-10-15T00:00:00Z',
  },
];

// Helper to get collections with product details for stubs
export function getCollectionsWithProducts(): CollectionWithProducts[] {
  return MOCK_COLLECTIONS.map((collection) => {
    const collectionProducts = MOCK_COLLECTION_PRODUCTS.filter(
      (cp) => cp.collection_id === collection.id
    ).sort((a, b) => a.display_order - b.display_order);

    const products = collectionProducts.map((cp) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === cp.product_id);
      return {
        ...cp,
        product: product
          ? {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              inventory_count: product.inventory_count,
              is_featured: product.is_featured,
            }
          : {
              id: cp.product_id,
              name: 'Unknown Product',
              price: 0,
              image_url: null,
              inventory_count: 0,
              is_featured: false,
            },
      };
    });

    return {
      ...collection,
      products,
      product_count: products.length,
    };
  });
}

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
    collections: MOCK_COLLECTIONS,
    collectionProducts: MOCK_COLLECTION_PRODUCTS,
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
