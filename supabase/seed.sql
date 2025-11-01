-- Seed Data for Local Development
-- This file populates the database with comprehensive test data
-- Run with: supabase db seed

-- Note: UUIDs are predictable for easier testing
-- In production, use gen_random_uuid() for real UUIDs

-- ============================================================================
-- 1. USERS
-- ============================================================================
-- Note: In local development, create auth users separately using the setup script
-- This only creates the public.users records that reference auth.users

INSERT INTO public.users (id, email, full_name, avatar_url, role, created_at, updated_at) VALUES
  -- Admin User
  ('00000000-0000-0000-0000-000000000001', 'admin@vntg.local', 'Admin User', 'https://i.pravatar.cc/150?u=admin@vntg.local', 'admin', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Customer Users
  ('00000000-0000-0000-0000-000000000002', 'customer@vntg.local', 'John Doe', 'https://i.pravatar.cc/150?u=customer@vntg.local', 'customer', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000003', 'jane.smith@vntg.local', 'Jane Smith', 'https://i.pravatar.cc/150?u=jane.smith@vntg.local', 'customer', '2024-01-02T00:00:00.000Z', '2024-01-02T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000004', 'bob.johnson@vntg.local', 'Bob Johnson', 'https://i.pravatar.cc/150?u=bob.johnson@vntg.local', 'customer', '2024-01-03T00:00:00.000Z', '2024-01-03T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000005', 'alice.williams@vntg.local', 'Alice Williams', 'https://i.pravatar.cc/150?u=alice.williams@vntg.local', 'customer', '2024-01-04T00:00:00.000Z', '2024-01-04T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================
INSERT INTO public.categories (id, name, description, parent_id, created_at, updated_at) VALUES
  -- Parent Categories
  ('10000000-0000-0000-0000-000000000001', 'Man', 'Fashion and apparel for men - shirts, pants, jackets, shoes, and accessories', NULL, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000002', 'Woman', 'Fashion and apparel for women - dresses, tops, bottoms, shoes, and accessories', NULL, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000003', 'Teens', 'Trendy fashion for teenagers - casual wear, streetwear, and youth styles', NULL, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000004', 'Kids', 'Comfortable and fun clothing for children of all ages', NULL, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000005', 'Books & Media', 'Books, magazines, movies, music, and digital content', NULL, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000006', 'Toys & Games', 'Fun toys, board games, puzzles, and educational products for all ages', NULL, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Subcategories
  ('10000000-0000-0000-0000-000000000011', 'Shirts', 'Casual and formal shirts for men', '10000000-0000-0000-0000-000000000001', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000012', 'Pants', 'Jeans, chinos, and dress pants for men', '10000000-0000-0000-0000-000000000001', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000021', 'Dresses', 'Elegant and casual dresses for women', '10000000-0000-0000-0000-000000000002', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('10000000-0000-0000-0000-000000000022', 'Tops', 'Blouses, t-shirts, and tank tops for women', '10000000-0000-0000-0000-000000000002', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. PRODUCTS
-- ============================================================================
INSERT INTO public.products (id, name, description, price, category_id, image_url, inventory_count, is_featured, stripe_product_id, created_at, updated_at) VALUES
  -- Men's Products
  ('20000000-0000-0000-0000-000000000001', 'Classic Denim Jacket', 'Vintage-style denim jacket perfect for casual outings and layering. Made from premium cotton with durable construction.', 89.99, '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 45, true, 'prod_test_denim_jacket', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000002', 'Casual Button-Up Shirt', 'Versatile button-up shirt for professional and casual wear. Breathable fabric with modern fit.', 54.99, '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', 70, false, 'prod_test_casual_shirt', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000003', 'Premium Chino Pants', 'Classic chino pants with a modern slim fit. Perfect for business casual or weekend wear.', 69.99, '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', 55, false, 'prod_test_chino_pants', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Women's Products
  ('20000000-0000-0000-0000-000000000011', 'Floral Summer Dress', 'Elegant floral dress perfect for summer occasions and everyday wear. Lightweight and comfortable.', 79.99, '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', 60, true, 'prod_test_floral_dress', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000012', 'Elegant Evening Blouse', 'Sophisticated blouse perfect for evening events and dinner parties. Silky smooth fabric with modern cut.', 69.99, '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800', 40, true, 'prod_test_evening_blouse', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000013', 'High-Rise Skinny Jeans', 'Classic skinny jeans with high-rise fit. Premium denim with stretch for all-day comfort.', 84.99, '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', 75, false, 'prod_test_skinny_jeans', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Teens Products
  ('20000000-0000-0000-0000-000000000021', 'Streetwear Hoodie', 'Trendy oversized hoodie with urban design, perfect for teens. Soft fleece interior.', 65.99, '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 80, false, 'prod_test_hoodie', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000022', 'Vintage Graphic T-Shirt', 'Cool vintage-inspired graphic tee. 100% cotton with premium print quality.', 29.99, '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 100, false, 'prod_test_graphic_tee', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Kids Products
  ('20000000-0000-0000-0000-000000000031', 'Kids Rainbow T-Shirt', 'Colorful and comfortable t-shirt with fun rainbow design for children. Soft cotton blend.', 24.99, '10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800', 120, false, 'prod_test_kids_tee', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000032', 'Denim Overalls', 'Classic denim overalls for kids. Durable and comfortable with adjustable straps.', 39.99, '10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1622290291468-a28f7a7e3d2e?w=800', 65, false, 'prod_test_overalls', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Books & Media
  ('20000000-0000-0000-0000-000000000041', 'Fashion Photography Book', 'Stunning collection of contemporary fashion photography from renowned artists worldwide.', 39.99, '10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 30, false, 'prod_test_fashion_book', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000042', 'Complete Style Guide', 'Comprehensive guide to personal style, wardrobe essentials, and fashion fundamentals.', 29.99, '10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 45, false, 'prod_test_style_guide', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Toys & Games
  ('20000000-0000-0000-0000-000000000051', 'Designer Puzzle Game', 'Creative puzzle game featuring fashion designs and patterns. 1000 pieces.', 32.99, '10000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?w=800', 50, false, 'prod_test_puzzle', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000052', 'Fashion Designer Doll Set', 'Complete fashion designer doll set with interchangeable outfits and accessories.', 44.99, '10000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1578070181910-f1e514afdd08?w=800', 35, false, 'prod_test_doll_set', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),

  -- Special Cases
  ('20000000-0000-0000-0000-000000000061', 'Limited Edition Leather Jacket', 'Exclusive limited edition leather jacket. Premium Italian leather with custom hardware.', 299.99, '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 3, true, 'prod_test_limited_jacket', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('20000000-0000-0000-0000-000000000062', 'Designer Sneakers', 'Sold out designer sneakers - check back for restock.', 149.99, '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', 0, false, 'prod_test_sneakers', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. USER ADDRESSES
-- ============================================================================
INSERT INTO public.user_addresses (id, user_id, name, street, city, state, zip, country, is_default, created_at, updated_at) VALUES
  -- Customer addresses
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'John Doe', '123 Main Street', 'New York', 'NY', '10001', 'US', true, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'John Doe', '456 Work Plaza, Suite 200', 'New York', 'NY', '10002', 'US', false, '2024-01-05T00:00:00.000Z', '2024-01-05T00:00:00.000Z'),

  -- Test user addresses
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Jane Smith', '456 Oak Avenue', 'Los Angeles', 'CA', '90001', 'US', true, '2024-01-02T00:00:00.000Z', '2024-01-02T00:00:00.000Z'),
  ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Bob Johnson', '789 Pine Road', 'Chicago', 'IL', '60601', 'US', true, '2024-01-03T00:00:00.000Z', '2024-01-03T00:00:00.000Z'),

  -- International address
  ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'John Doe', '10 Downing Street', 'London', 'Greater London', 'SW1A 2AA', 'GB', false, '2024-01-10T00:00:00.000Z', '2024-01-10T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. ORDERS
-- ============================================================================
INSERT INTO public.orders (id, user_id, status, total, payment_intent_id, shipping_address, created_at, updated_at) VALUES
  -- Completed order
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'completed', 249.97, 'pi_test_completed_001', '{"name":"John Doe","street":"123 Main Street","city":"New York","state":"NY","zip":"10001","country":"US"}', '2024-01-10T10:00:00.000Z', '2024-01-10T15:00:00.000Z'),

  -- Processing order
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'processing', 154.98, 'pi_test_processing_001', '{"name":"John Doe","street":"123 Main Street","city":"New York","state":"NY","zip":"10001","country":"US"}', '2024-01-15T14:30:00.000Z', '2024-01-15T14:30:00.000Z'),

  -- Pending order
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'pending', 89.99, 'pi_test_pending_001', '{"name":"John Doe","street":"123 Main Street","city":"New York","state":"NY","zip":"10001","country":"US"}', '2024-01-20T09:15:00.000Z', '2024-01-20T09:15:00.000Z'),

  -- Cancelled order
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'cancelled', 79.99, 'pi_test_cancelled_001', '{"name":"Jane Smith","street":"456 Oak Avenue","city":"Los Angeles","state":"CA","zip":"90001","country":"US"}', '2024-01-05T11:20:00.000Z', '2024-01-06T08:00:00.000Z'),

  -- Large order
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'completed', 524.92, 'pi_test_large_001', '{"name":"Jane Smith","street":"456 Oak Avenue","city":"Los Angeles","state":"CA","zip":"90001","country":"US"}', '2024-01-08T16:45:00.000Z', '2024-01-09T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. ORDER ITEMS
-- ============================================================================
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, created_at, updated_at) VALUES
  -- Completed order items
  ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 2, 89.99, '2024-01-10T10:00:00.000Z', '2024-01-10T10:00:00.000Z'),
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 1, 79.99, '2024-01-10T10:00:00.000Z', '2024-01-10T10:00:00.000Z'),

  -- Processing order items
  ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000012', 1, 69.99, '2024-01-15T14:30:00.000Z', '2024-01-15T14:30:00.000Z'),
  ('31000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000013', 1, 84.99, '2024-01-15T14:30:00.000Z', '2024-01-15T14:30:00.000Z'),

  -- Pending order items
  ('31000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 1, 89.99, '2024-01-20T09:15:00.000Z', '2024-01-20T09:15:00.000Z'),

  -- Large order items
  ('31000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 2, 89.99, '2024-01-08T16:45:00.000Z', '2024-01-08T16:45:00.000Z'),
  ('31000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000011', 1, 79.99, '2024-01-08T16:45:00.000Z', '2024-01-08T16:45:00.000Z'),
  ('31000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000012', 2, 69.99, '2024-01-08T16:45:00.000Z', '2024-01-08T16:45:00.000Z'),
  ('31000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 3, 54.99, '2024-01-08T16:45:00.000Z', '2024-01-08T16:45:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. CART ITEMS
-- ============================================================================
INSERT INTO public.cart_items (id, user_id, product_id, quantity, created_at, updated_at) VALUES
  -- Customer cart
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2, '2024-01-20T10:00:00.000Z', '2024-01-20T10:00:00.000Z'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000011', 1, '2024-01-20T10:05:00.000Z', '2024-01-20T10:05:00.000Z'),

  -- Test user cart
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 3, '2024-01-21T14:20:00.000Z', '2024-01-21T14:20:00.000Z'),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000012', 1, '2024-01-21T14:25:00.000Z', '2024-01-21T14:25:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. PAYMENT INTENTS
-- ============================================================================
INSERT INTO public.payment_intents (id, stripe_payment_intent_id, user_id, amount, currency, status, metadata, created_at, updated_at) VALUES
  ('60000000-0000-0000-0000-000000000001', 'pi_test_succeeded_001', '00000000-0000-0000-0000-000000000002', 24997, 'usd', 'succeeded', '{"order_id":"30000000-0000-0000-0000-000000000001","items_count":2}', '2024-01-10T10:00:00.000Z', '2024-01-10T10:05:00.000Z'),
  ('60000000-0000-0000-0000-000000000002', 'pi_test_processing_001', '00000000-0000-0000-0000-000000000002', 15498, 'usd', 'processing', '{"order_id":"30000000-0000-0000-0000-000000000002","items_count":2}', '2024-01-15T14:30:00.000Z', '2024-01-15T14:32:00.000Z'),
  ('60000000-0000-0000-0000-000000000003', 'pi_test_requires_action_001', '00000000-0000-0000-0000-000000000003', 7999, 'usd', 'requires_action', '{"order_id":"30000000-0000-0000-0000-000000000003","items_count":1}', '2024-01-20T09:15:00.000Z', '2024-01-20T09:16:00.000Z'),
  ('60000000-0000-0000-0000-000000000004', 'pi_test_failed_001', '00000000-0000-0000-0000-000000000003', 7999, 'usd', 'canceled', '{"order_id":"30000000-0000-0000-0000-000000000004","items_count":1,"failure_reason":"card_declined"}', '2024-01-05T11:20:00.000Z', '2024-01-05T11:22:00.000Z'),
  ('60000000-0000-0000-0000-000000000005', 'pi_test_large_001', '00000000-0000-0000-0000-000000000003', 52492, 'usd', 'succeeded', '{"order_id":"30000000-0000-0000-0000-000000000005","items_count":8}', '2024-01-08T16:45:00.000Z', '2024-01-08T16:50:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================
-- Users: 5 (1 admin, 4 customers)
-- Categories: 10 (6 parent, 4 subcategories)
-- Products: 16 (various categories, including low stock and out of stock)
-- Orders: 5 (various statuses)
-- Order Items: 9
-- Cart Items: 4
-- Addresses: 5
-- Payment Intents: 5
-- ============================================================================
