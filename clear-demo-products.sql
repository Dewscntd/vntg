-- Clear demo products and add your real products
-- Run this in Supabase SQL Editor

-- 1. DELETE ALL DEMO PRODUCTS
DELETE FROM public.products;

-- 2. ADD YOUR REAL PRODUCTS (example - customize these)
INSERT INTO public.products (
  name, 
  description, 
  price, 
  inventory_count, 
  is_featured,
  category_id,
  image_url
) VALUES 
  (
    'Your Product Name', 
    'Detailed description of your actual product with features and benefits',
    99.99,
    50,
    true,
    (SELECT id FROM public.categories WHERE name = 'Fashion' LIMIT 1),
    'https://your-image-url.com/product1.jpg'
  ),
  (
    'Another Product', 
    'Description of your second product',
    149.99,
    25,
    false,
    (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1),
    'https://your-image-url.com/product2.jpg'
  );

-- 3. VERIFY - Check your products
SELECT name, price, inventory_count, is_featured FROM public.products;