-- Final cleanup: Remove all unwanted categories from database
-- Run this in Supabase SQL Editor

-- Show current categories
SELECT id, name FROM categories ORDER BY name;

-- Delete products that reference unwanted categories (if any)
DELETE FROM products WHERE category_id IN (
  SELECT id FROM categories 
  WHERE LOWER(name) IN ('sports', 'electronics', 'home', 'gardening', 'fashion', 'books', 'home & garden')
  OR name ILIKE '%sport%' 
  OR name ILIKE '%electronic%' 
  OR name ILIKE '%garden%'
  OR name ILIKE '%home%'
  OR name ILIKE '%fashion%'
  OR name ILIKE '%book%'
);

-- Delete the unwanted categories
DELETE FROM categories 
WHERE LOWER(name) IN ('sports', 'electronics', 'home', 'gardening', 'fashion', 'books', 'home & garden')
OR name ILIKE '%sport%' 
OR name ILIKE '%electronic%' 
OR name ILIKE '%garden%'
OR name ILIKE '%home%'
OR name ILIKE '%fashion%'
OR name ILIKE '%book%';

-- Show remaining categories
SELECT id, name FROM categories ORDER BY name;