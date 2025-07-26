-- Simple category cleanup - remove unwanted categories
-- This script safely removes sports, electronics, home, gardening categories

-- First, let's see what categories exist currently
SELECT id, name, created_at FROM categories ORDER BY name;

-- Show products that reference the categories we want to delete
SELECT p.id, p.name, p.category_id, c.name as category_name 
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE c.name IN ('Sports', 'Electronics', 'Home', 'Gardening', 'sports', 'electronics', 'home', 'gardening');

-- If there are products using these categories, you'll need to:
-- 1. Either delete those products OR
-- 2. Update them to use existing valid categories first

-- Example: Delete products in unwanted categories (UNCOMMENT IF NEEDED)
-- DELETE FROM products WHERE category_id IN (
--   SELECT id FROM categories WHERE name IN ('Sports', 'Electronics', 'Home', 'Gardening', 'sports', 'electronics', 'home', 'gardening')
-- );

-- OR Example: Update products to a default category (UNCOMMENT IF NEEDED)
-- UPDATE products SET category_id = (
--   SELECT id FROM categories WHERE name LIKE '%clothing%' LIMIT 1
-- ) WHERE category_id IN (
--   SELECT id FROM categories WHERE name IN ('Sports', 'Electronics', 'Home', 'Gardening', 'sports', 'electronics', 'home', 'gardening')
-- );

-- Delete the unwanted categories
DELETE FROM categories 
WHERE name IN ('Sports', 'Electronics', 'Home', 'Gardening', 'sports', 'electronics', 'home', 'gardening');

-- Verify the cleanup - show remaining categories
SELECT id, name, created_at FROM categories ORDER BY name;