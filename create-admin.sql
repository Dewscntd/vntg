-- Create admin user script for production
-- This will be run manually through Supabase dashboard or psql

-- First, add some basic categories
INSERT INTO public.categories (name, description) VALUES 
  ('Fashion', 'Clothing and fashion accessories'),
  ('Electronics', 'Electronic devices and gadgets'),
  ('Home & Garden', 'Home decor and garden supplies'),
  ('Sports', 'Sports equipment and fitness gear'),
  ('Books', 'Books and educational materials')
ON CONFLICT DO NOTHING;

-- Create a sample product
INSERT INTO public.products (
  name, 
  description, 
  price, 
  inventory_count, 
  is_featured,
  category_id,
  image_url
) VALUES (
  'Sample Product',
  'This is a sample product to test the store functionality. A beautiful example item showcasing the Israeli e-commerce platform capabilities.',
  29.99,
  100,
  true,
  (SELECT id FROM public.categories WHERE name = 'Fashion' LIMIT 1),
  'https://picsum.photos/400/400?random=1'
);

-- Create additional sample products
INSERT INTO public.products (
  name, 
  description, 
  price, 
  inventory_count, 
  is_featured,
  category_id,
  image_url
) VALUES 
  ('Premium Electronics Device', 'High-quality electronic device with advanced features', 199.99, 50, true, (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1), 'https://picsum.photos/400/400?random=2'),
  ('Home Decor Item', 'Beautiful home decoration piece to enhance your living space', 49.99, 75, false, (SELECT id FROM public.categories WHERE name = 'Home & Garden' LIMIT 1), 'https://picsum.photos/400/400?random=3'),
  ('Sports Equipment', 'Professional sports equipment for active lifestyle', 89.99, 30, true, (SELECT id FROM public.categories WHERE name = 'Sports' LIMIT 1), 'https://picsum.photos/400/400?random=4');

-- Note: Admin user creation must be done through Supabase Auth
-- You can create an admin user by:
-- 1. Going to your Supabase Dashboard > Authentication > Users
-- 2. Creating a new user with email and password
-- 3. Then updating their role with this query:

-- UPDATE public.users SET role = 'admin' WHERE email = 'your-admin-email@example.com';