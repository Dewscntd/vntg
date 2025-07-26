-- Clean up old categories from database
-- This script removes categories that are not in the Peakees category list
-- and updates any products that reference them

-- First, let's see what categories exist currently
SELECT id, name, created_at FROM categories ORDER BY name;

-- Keep only the Peakees categories and remove old ones
-- Safe approach: Update products first, then delete categories

-- Update products that reference old categories to use appropriate new ones
-- You'll need to map old categories to new Peakees categories manually based on your data

-- Example mappings (adjust based on your actual data):
-- 'electronics' -> 'soft-toys' (if applicable)
-- 'gardening' -> delete products or move to appropriate category
-- 'books' -> 'hebrew-books' or 'english-books'

-- First, let's create the Peakees categories if they don't exist
INSERT INTO categories (id, name, description, created_at, updated_at)
VALUES 
  ('mens-clothing', 'Men''s Clothing', 'Second-hand men''s fashion', NOW(), NOW()),
  ('womens-clothing', 'Women''s Clothing', 'Second-hand women''s fashion', NOW(), NOW()),
  ('kids-clothing', 'Kids'' Clothing', 'Second-hand children''s clothing', NOW(), NOW()),
  ('unisex-clothing', 'Unisex Clothing', 'Gender-neutral clothing items', NOW(), NOW()),
  ('mens-shoes', 'Men''s Shoes', 'Second-hand men''s footwear', NOW(), NOW()),
  ('womens-shoes', 'Women''s Shoes', 'Second-hand women''s footwear', NOW(), NOW()),
  ('kids-shoes', 'Kids'' Shoes', 'Second-hand children''s footwear', NOW(), NOW()),
  ('soft-toys', 'Soft Toys', 'Plush toys and stuffed animals', NOW(), NOW()),
  ('hebrew-books', 'Hebrew Books', 'Books in Hebrew language', NOW(), NOW()),
  ('english-books', 'English Books', 'Books in English language', NOW(), NOW()),
  ('other-books', 'Other Languages', 'Books in other languages', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- List products that need category updates
SELECT p.id, p.name, p.category_id, c.name as current_category_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
WHERE p.category_id NOT IN (
  'mens-clothing', 'womens-clothing', 'kids-clothing', 'unisex-clothing',
  'mens-shoes', 'womens-shoes', 'kids-shoes', 'soft-toys',
  'hebrew-books', 'english-books', 'other-books'
) OR p.category_id IS NULL;

-- After manually reviewing and updating products as needed,
-- you can delete the old categories:

-- UNCOMMENT THESE LINES AFTER UPDATING PRODUCTS:
-- DELETE FROM categories 
-- WHERE id NOT IN (
--   'mens-clothing', 'womens-clothing', 'kids-clothing', 'unisex-clothing',
--   'mens-shoes', 'womens-shoes', 'kids-shoes', 'soft-toys',
--   'hebrew-books', 'english-books', 'other-books'
-- );

-- Verify the cleanup
SELECT id, name FROM categories ORDER BY name;