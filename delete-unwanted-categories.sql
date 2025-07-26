-- Delete unwanted categories (run this in Supabase SQL Editor)

-- First, check what categories exist
SELECT id, name FROM categories ORDER BY name;

-- Delete products that reference unwanted categories (if any)
DELETE FROM products WHERE category_id IN (
  SELECT id FROM categories 
  WHERE LOWER(name) IN ('sports', 'electronics', 'home', 'gardening')
);

-- Delete the unwanted categories
DELETE FROM categories 
WHERE LOWER(name) IN ('sports', 'electronics', 'home', 'gardening');

-- Verify the cleanup
SELECT id, name FROM categories ORDER BY name;