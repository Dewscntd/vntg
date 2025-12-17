// Extensive mock data for comprehensive local development
import { Database } from '@/types/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type CartItem = Database['public']['Tables']['cart_items']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

// Generate extensive product data across all categories
export const generateExtensiveProducts = (): Product[] => {
  const baseProducts = [
    // Electronics
    {
      name: 'iPhone 15 Pro',
      description:
        'Latest iPhone with titanium design and A17 Pro chip. Features advanced camera system with 5x telephoto zoom.',
      price: 999.99,
      category_id: 'cat-1',
      brand: 'Apple',
      sku: 'APL-IP15P-128',
      stock_quantity: 25,
      weight: 0.187,
      dimensions: '146.6 x 70.6 x 8.25 mm',
      tags: ['smartphone', 'apple', 'premium', 'camera'],
      rating: 4.8,
      review_count: 342,
      compare_price: 1099.99,
      cost_price: 650.0,
      featured: true,
      vendor: 'Apple Inc.',
    },
    {
      name: 'MacBook Air M3',
      description:
        'Ultra-thin laptop with M3 chip, 13.6-inch Liquid Retina display, and all-day battery life.',
      price: 1299.99,
      category_id: 'cat-1',
      brand: 'Apple',
      sku: 'APL-MBA-M3-256',
      stock_quantity: 15,
      weight: 1.24,
      dimensions: '304 x 215 x 11.3 mm',
      tags: ['laptop', 'apple', 'm3', 'ultrabook'],
      rating: 4.9,
      review_count: 128,
      compare_price: 1399.99,
      cost_price: 850.0,
      featured: true,
      vendor: 'Apple Inc.',
    },
    {
      name: 'Sony WH-1000XM5',
      description:
        'Industry-leading noise canceling wireless headphones with premium sound quality.',
      price: 349.99,
      category_id: 'cat-1',
      brand: 'Sony',
      sku: 'SNY-WH1000XM5',
      stock_quantity: 45,
      weight: 0.25,
      dimensions: '254 x 220 x 32 mm',
      tags: ['headphones', 'wireless', 'noise-canceling', 'premium'],
      rating: 4.7,
      review_count: 892,
      compare_price: 399.99,
      cost_price: 180.0,
      featured: false,
      vendor: 'Sony Electronics',
    },
    {
      name: 'Samsung 65" QLED 4K TV',
      description:
        'Quantum Dot technology delivers brilliant colors and deep contrast in stunning 4K resolution.',
      price: 1899.99,
      category_id: 'cat-1',
      brand: 'Samsung',
      sku: 'SAM-QN65Q80C',
      stock_quantity: 8,
      weight: 28.5,
      dimensions: '1448 x 829 x 57 mm',
      tags: ['tv', '4k', 'qled', 'smart-tv'],
      rating: 4.6,
      review_count: 234,
      compare_price: 2199.99,
      cost_price: 1200.0,
      featured: true,
      vendor: 'Samsung Electronics',
    },
    {
      name: 'Nintendo Switch OLED',
      description: 'Enhanced Nintendo Switch with vibrant 7-inch OLED screen and improved audio.',
      price: 349.99,
      category_id: 'cat-1',
      brand: 'Nintendo',
      sku: 'NIN-SWCH-OLED',
      stock_quantity: 32,
      weight: 0.42,
      dimensions: '242 x 102 x 13.9 mm',
      tags: ['gaming', 'console', 'portable', 'oled'],
      rating: 4.8,
      review_count: 567,
      compare_price: 379.99,
      cost_price: 220.0,
      featured: false,
      vendor: 'Nintendo Co.',
    },

    // Clothing
    {
      name: "Levi's 501 Original Jeans",
      description:
        'Classic straight-leg jeans with iconic button fly and authentic vintage styling.',
      price: 79.99,
      category_id: 'cat-2',
      brand: "Levi's",
      sku: 'LEV-501-32x32',
      stock_quantity: 120,
      weight: 0.65,
      dimensions: '32W x 32L',
      tags: ['jeans', 'denim', 'classic', 'casual'],
      rating: 4.5,
      review_count: 1203,
      compare_price: 89.99,
      cost_price: 35.0,
      featured: false,
      vendor: 'Levi Strauss & Co.',
    },
    {
      name: 'Nike Air Force 1',
      description: 'Iconic basketball shoe with classic white leather design and Air cushioning.',
      price: 110.0,
      category_id: 'cat-2',
      brand: 'Nike',
      sku: 'NIK-AF1-WHT-10',
      stock_quantity: 85,
      weight: 1.2,
      dimensions: 'Size 10 US',
      tags: ['sneakers', 'basketball', 'classic', 'white'],
      rating: 4.7,
      review_count: 2847,
      compare_price: 120.0,
      cost_price: 55.0,
      featured: true,
      vendor: 'Nike Inc.',
    },
    {
      name: 'Patagonia Down Jacket',
      description:
        'Lightweight, packable down jacket perfect for outdoor adventures and cold weather.',
      price: 299.99,
      category_id: 'cat-2',
      brand: 'Patagonia',
      sku: 'PAT-DOWN-M-BLK',
      stock_quantity: 35,
      weight: 0.4,
      dimensions: 'Medium',
      tags: ['jacket', 'down', 'outdoor', 'winter'],
      rating: 4.8,
      review_count: 456,
      compare_price: 349.99,
      cost_price: 150.0,
      featured: false,
      vendor: 'Patagonia Inc.',
    },

    // Home & Garden
    {
      name: 'KitchenAid Stand Mixer',
      description:
        'Professional 5-quart stand mixer with 10 speeds and multiple attachments included.',
      price: 449.99,
      category_id: 'cat-3',
      brand: 'KitchenAid',
      sku: 'KAD-SM5QT-RED',
      stock_quantity: 18,
      weight: 11.1,
      dimensions: '356 x 221 x 348 mm',
      tags: ['kitchen', 'mixer', 'baking', 'appliance'],
      rating: 4.9,
      review_count: 1567,
      compare_price: 499.99,
      cost_price: 280.0,
      featured: true,
      vendor: 'KitchenAid',
    },
    {
      name: 'Dyson V15 Detect',
      description:
        'Powerful cordless vacuum with laser detection and intelligent suction adjustment.',
      price: 749.99,
      category_id: 'cat-3',
      brand: 'Dyson',
      sku: 'DYS-V15DET-YEL',
      stock_quantity: 22,
      weight: 3.05,
      dimensions: '1232 x 250 x 261 mm',
      tags: ['vacuum', 'cordless', 'smart', 'cleaning'],
      rating: 4.6,
      review_count: 789,
      compare_price: 799.99,
      cost_price: 420.0,
      featured: false,
      vendor: 'Dyson Ltd.',
    },

    // Sports & Fitness
    {
      name: 'Peloton Bike+',
      description: 'Premium indoor cycling bike with rotating HD touchscreen and live classes.',
      price: 2495.0,
      category_id: 'cat-4',
      brand: 'Peloton',
      sku: 'PEL-BIKE-PLUS',
      stock_quantity: 5,
      weight: 63.5,
      dimensions: '1371 x 610 x 1270 mm',
      tags: ['bike', 'fitness', 'indoor', 'smart'],
      rating: 4.4,
      review_count: 234,
      compare_price: 2695.0,
      cost_price: 1400.0,
      featured: true,
      vendor: 'Peloton Interactive',
    },
    {
      name: 'YETI Rambler Tumbler',
      description: 'Double-wall vacuum insulated tumbler that keeps drinks cold or hot for hours.',
      price: 39.99,
      category_id: 'cat-4',
      brand: 'YETI',
      sku: 'YET-RAM20-SS',
      stock_quantity: 156,
      weight: 0.45,
      dimensions: '88 x 88 x 188 mm',
      tags: ['tumbler', 'insulated', 'outdoor', 'drinkware'],
      rating: 4.8,
      review_count: 3421,
      compare_price: 44.99,
      cost_price: 18.0,
      featured: false,
      vendor: 'YETI Coolers',
    },

    // Books & Media
    {
      name: 'The Seven Husbands of Evelyn Hugo',
      description:
        'Captivating novel about a reclusive Hollywood icon who finally decides to tell her story.',
      price: 16.99,
      category_id: 'cat-5',
      brand: "St. Martin's Press",
      sku: 'SMP-EVELYN-PB',
      stock_quantity: 78,
      weight: 0.32,
      dimensions: '210 x 140 x 25 mm',
      tags: ['book', 'fiction', 'bestseller', 'novel'],
      rating: 4.9,
      review_count: 12456,
      compare_price: 18.99,
      cost_price: 8.5,
      featured: true,
      vendor: "St. Martin's Press",
    },

    // Health & Beauty
    {
      name: 'CeraVe Moisturizing Cream',
      description:
        'Daily face and body moisturizer with ceramides and hyaluronic acid for all skin types.',
      price: 18.99,
      category_id: 'cat-6',
      brand: 'CeraVe',
      sku: 'CER-MOIST-16OZ',
      stock_quantity: 145,
      weight: 0.5,
      dimensions: '127 x 76 x 203 mm',
      tags: ['skincare', 'moisturizer', 'ceramides', 'sensitive-skin'],
      rating: 4.6,
      review_count: 2134,
      compare_price: 21.99,
      cost_price: 9.5,
      featured: false,
      vendor: "L'Oréal",
    },

    // Toys & Games
    {
      name: 'LEGO Architecture Statue of Liberty',
      description:
        'Detailed LEGO model of the iconic Statue of Liberty with realistic architectural details.',
      price: 119.99,
      category_id: 'cat-7',
      brand: 'LEGO',
      sku: 'LEG-ARCH-SOL',
      stock_quantity: 28,
      weight: 1.2,
      dimensions: '378 x 262 x 76 mm',
      tags: ['lego', 'architecture', 'building', 'collectible'],
      rating: 4.7,
      review_count: 567,
      compare_price: 129.99,
      cost_price: 65.0,
      featured: false,
      vendor: 'LEGO Group',
    },

    // Automotive
    {
      name: 'Michelin Pilot Sport 4S Tire',
      description:
        'High-performance summer tire with exceptional grip and handling for sports cars.',
      price: 289.99,
      category_id: 'cat-8',
      brand: 'Michelin',
      sku: 'MCH-PS4S-245-40-18',
      stock_quantity: 16,
      weight: 12.5,
      dimensions: '245/40R18',
      tags: ['tire', 'performance', 'summer', 'sports'],
      rating: 4.8,
      review_count: 134,
      compare_price: 319.99,
      cost_price: 180.0,
      featured: false,
      vendor: 'Michelin',
    },
  ];

  // Generate products with IDs and timestamps - map to correct schema
  return baseProducts.map((product, index) => ({
    id: `prod-${(index + 1).toString().padStart(3, '0')}`,
    name: product.name,
    description: product.description,
    price: product.price,
    image_url: `https://picsum.photos/400/400?random=${index + 1}`,
    category_id: product.category_id,
    inventory_count: product.stock_quantity || 10, // Map stock_quantity to inventory_count
    is_featured: product.featured || false, // Map featured to is_featured
    is_new: index < 5, // First 5 products are "new"
    is_sale: index % 3 === 0, // Every 3rd product is on sale
    discount_percent: index % 3 === 0 ? Math.floor(Math.random() * 30) + 10 : 0,
    material: null,
    country_of_origin: null,
    care_instructions: null,
    season: 'all-season' as const,
    collection_year: 2024,
    specifications: null,
    stripe_product_id: null,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

// Generate multiple users for different scenarios
export const generateExtensiveUsers = (): User[] => [
  {
    id: 'user-001',
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    avatar_url: 'https://i.pravatar.cc/150?u=john.doe',
    role: 'customer',
    created_at: new Date('2023-01-15').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-002',
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    avatar_url: 'https://i.pravatar.cc/150?u=jane.smith',
    role: 'customer',
    created_at: new Date('2023-02-20').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'admin-001',
    email: 'admin@peakees.com',
    full_name: 'Admin User',
    avatar_url: 'https://i.pravatar.cc/150?u=admin',
    role: 'admin',
    created_at: new Date('2022-12-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-003',
    email: 'mike.wilson@example.com',
    full_name: 'Mike Wilson',
    avatar_url: 'https://i.pravatar.cc/150?u=mike.wilson',
    role: 'customer',
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Generate extensive cart and order data
export const generateExtensiveCartItems = (): CartItem[] => [
  {
    id: 'cart-001',
    user_id: 'user-001',
    product_id: 'prod-001',
    quantity: 1,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cart-002',
    user_id: 'user-001',
    product_id: 'prod-007',
    quantity: 2,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cart-003',
    user_id: 'user-002',
    product_id: 'prod-003',
    quantity: 1,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const generateExtensiveOrders = (): Order[] => [
  {
    id: 'order-001',
    user_id: 'user-001',
    status: 'completed',
    total: 1379.98,
    payment_intent_id: 'pi_mock_completed_001',
    shipping_address: {
      name: 'John Doe',
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'US',
    },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-002',
    user_id: 'user-001',
    status: 'processing',
    total: 459.98,
    payment_intent_id: 'pi_mock_processing_002',
    shipping_address: {
      name: 'John Doe',
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'US',
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-003',
    user_id: 'user-002',
    status: 'pending',
    total: 369.99,
    payment_intent_id: 'pi_mock_pending_003',
    shipping_address: {
      name: 'Jane Smith',
      street: '456 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
    },
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Search and filter utilities
export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;

  const searchTerm = query.toLowerCase().trim();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
  );
};

export const filterProductsByCategory = (products: Product[], categoryId: string): Product[] => {
  return products.filter((product) => product.category_id === categoryId);
};

export const sortProducts = (
  products: Product[],
  sortBy: string,
  order: 'asc' | 'desc' = 'asc'
): Product[] => {
  const sorted = [...products].sort((a, b) => {
    let aVal: any, bVal: any;

    switch (sortBy) {
      case 'price':
        aVal = a.price;
        bVal = b.price;
        break;
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'created_at':
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

export const paginateResults = <T>(
  items: T[],
  page: number,
  limit: number
): { items: T[]; total: number; totalPages: number } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: items.length,
    totalPages: Math.ceil(items.length / limit),
  };
};
