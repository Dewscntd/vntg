-- Add your first real product
-- Customize this template with your actual product details

INSERT INTO public.products (
  name, 
  description, 
  price, 
  inventory_count, 
  is_featured,
  category_id,
  image_url
) VALUES (
  'Your First Product',  -- ← Change this to your product name
  'Write a compelling description of your product here. Include features, benefits, and what makes it special. This will help customers understand why they should buy it.',  -- ← Your product description
  99.99,  -- ← Your price in USD (or ILS if you prefer)
  100,    -- ← How many you have in stock
  true,   -- ← true = featured on homepage, false = regular product
  (SELECT id FROM public.categories WHERE name = 'Fashion' LIMIT 1),  -- ← Change 'Fashion' to your category
  'https://picsum.photos/400/400?random=10'  -- ← Replace with your actual product image URL
);

-- Example: Add a second product
INSERT INTO public.products (
  name, 
  description, 
  price, 
  inventory_count, 
  is_featured,
  category_id,
  image_url
) VALUES (
  'Another Great Product',
  'Description for your second product...',
  149.99,
  50,
  false,
  (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1),
  'https://picsum.photos/400/400?random=11'
);

-- Check what categories are available:
-- SELECT name FROM public.categories;