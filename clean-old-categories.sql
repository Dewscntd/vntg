-- Clean up old categories and create new Peakees category structure
-- This script removes sports, electronics, home, gardening categories
-- and creates the new Men/Women/Teens structure with subcategories

-- First, let's see what categories exist currently
SELECT id, name, created_at FROM categories ORDER BY name;

-- Create the new Peakees categories with proper UUIDs
INSERT INTO categories (id, name, description, created_at, updated_at)
VALUES 
  -- Main Categories
  (gen_random_uuid(), 'Men / גברים', 'Second-hand men''s fashion and accessories', NOW(), NOW()),
  (gen_random_uuid(), 'Women / נשים', 'Second-hand women''s fashion and accessories', NOW(), NOW()),
  (gen_random_uuid(), 'Teens / נוער', 'Second-hand teen fashion and accessories', NOW(), NOW()),
  (gen_random_uuid(), 'Kids / ילדים', 'Second-hand children''s clothing (ages 2-12)', NOW(), NOW()),
  (gen_random_uuid(), 'Babies / תינוקות', 'Second-hand baby clothing (ages 0-2)', NOW(), NOW()),
  (gen_random_uuid(), 'Toys / צעצועים', 'Second-hand toys and games', NOW(), NOW()),
  (gen_random_uuid(), 'Books / ספרים', 'Second-hand books in various languages', NOW(), NOW()),
  
  -- Men Subcategories
  ('men-shirts', 'Men - Shirts / גברים - חולצות', 'Men''s shirts', NOW(), NOW()),
  ('men-t-shirts', 'Men - T-Shirts / גברים - טישרטים', 'Men''s t-shirts', NOW(), NOW()),
  ('men-pants', 'Men - Pants / גברים - מכנסיים', 'Men''s pants', NOW(), NOW()),
  ('men-jeans', 'Men - Jeans / גברים - ג''ינסים', 'Men''s jeans', NOW(), NOW()),
  ('men-shorts', 'Men - Shorts / גברים - מכנסיים קצרים', 'Men''s shorts', NOW(), NOW()),
  ('men-blazers', 'Men - Blazers / גברים - בלייזרים', 'Men''s blazers', NOW(), NOW()),
  ('men-jackets', 'Men - Jackets / גברים - ז''קטים', 'Men''s jackets', NOW(), NOW()),
  ('men-sweaters', 'Men - Sweaters / גברים - סוודרים', 'Men''s sweaters', NOW(), NOW()),
  ('men-hoodies', 'Men - Hoodies / גברים - הודיס', 'Men''s hoodies', NOW(), NOW()),
  ('men-suits', 'Men - Suits / גברים - חליפות', 'Men''s suits', NOW(), NOW()),
  ('men-shoes', 'Men - Shoes / גברים - נעליים', 'Men''s shoes', NOW(), NOW()),
  ('men-accessories', 'Men - Accessories / גברים - אביזרים', 'Men''s accessories', NOW(), NOW()),
  
  -- Women Subcategories
  ('women-dresses', 'Women - Dresses / נשים - שמלות', 'Women''s dresses', NOW(), NOW()),
  ('women-shirts', 'Women - Shirts / נשים - חולצות', 'Women''s shirts', NOW(), NOW()),
  ('women-blouses', 'Women - Blouses / נשים - חולצות מכופתרות', 'Women''s blouses', NOW(), NOW()),
  ('women-t-shirts', 'Women - T-Shirts / נשים - טישרטים', 'Women''s t-shirts', NOW(), NOW()),
  ('women-tops', 'Women - Tops / נשים - טופים', 'Women''s tops', NOW(), NOW()),
  ('women-pants', 'Women - Pants / נשים - מכנסיים', 'Women''s pants', NOW(), NOW()),
  ('women-jeans', 'Women - Jeans / נשים - ג''ינסים', 'Women''s jeans', NOW(), NOW()),
  ('women-skirts', 'Women - Skirts / נשים - חצאיות', 'Women''s skirts', NOW(), NOW()),
  ('women-shorts', 'Women - Shorts / נשים - מכנסיים קצרים', 'Women''s shorts', NOW(), NOW()),
  ('women-blazers', 'Women - Blazers / נשים - בלייזרים', 'Women''s blazers', NOW(), NOW()),
  ('women-jackets', 'Women - Jackets / נשים - ז''קטים', 'Women''s jackets', NOW(), NOW()),
  ('women-sweaters', 'Women - Sweaters / נשים - סוודרים', 'Women''s sweaters', NOW(), NOW()),
  ('women-hoodies', 'Women - Hoodies / נשים - הודיס', 'Women''s hoodies', NOW(), NOW()),
  ('women-shoes', 'Women - Shoes / נשים - נעליים', 'Women''s shoes', NOW(), NOW()),
  ('women-accessories', 'Women - Accessories / נשים - אביזרים', 'Women''s accessories', NOW(), NOW()),
  
  -- Teens Subcategories
  ('teens-shirts', 'Teens - Shirts / נוער - חולצות', 'Teen shirts', NOW(), NOW()),
  ('teens-t-shirts', 'Teens - T-Shirts / נוער - טישרטים', 'Teen t-shirts', NOW(), NOW()),
  ('teens-pants', 'Teens - Pants / נוער - מכנסיים', 'Teen pants', NOW(), NOW()),
  ('teens-jeans', 'Teens - Jeans / נוער - ג''ינסים', 'Teen jeans', NOW(), NOW()),
  ('teens-shorts', 'Teens - Shorts / נוער - מכנסיים קצרים', 'Teen shorts', NOW(), NOW()),
  ('teens-dresses', 'Teens - Dresses / נוער - שמלות', 'Teen dresses', NOW(), NOW()),
  ('teens-skirts', 'Teens - Skirts / נוער - חצאיות', 'Teen skirts', NOW(), NOW()),
  ('teens-blazers', 'Teens - Blazers / נוער - בלייזרים', 'Teen blazers', NOW(), NOW()),
  ('teens-jackets', 'Teens - Jackets / נוער - ז''קטים', 'Teen jackets', NOW(), NOW()),
  ('teens-sweaters', 'Teens - Sweaters / נוער - סוודרים', 'Teen sweaters', NOW(), NOW()),
  ('teens-hoodies', 'Teens - Hoodies / נוער - הודיס', 'Teen hoodies', NOW(), NOW()),
  ('teens-shoes', 'Teens - Shoes / נוער - נעליים', 'Teen shoes', NOW(), NOW()),
  ('teens-accessories', 'Teens - Accessories / נוער - אביזרים', 'Teen accessories', NOW(), NOW()),
  ('teens-school-uniforms', 'Teens - School Uniforms / נוער - מדי בית ספר', 'Teen school uniforms', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Show products that need category updates
SELECT p.id, p.name, p.category_id, c.name as current_category_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
WHERE p.category_id IN ('sports', 'electronics', 'home', 'gardening') 
   OR p.category_id NOT IN (
     'men', 'women', 'teens', 'kids', 'babies', 'toys', 'books',
     'men-shirts', 'men-t-shirts', 'men-pants', 'men-jeans', 'men-shorts', 'men-blazers', 'men-jackets', 'men-sweaters', 'men-hoodies', 'men-suits', 'men-shoes', 'men-accessories',
     'women-dresses', 'women-shirts', 'women-blouses', 'women-t-shirts', 'women-tops', 'women-pants', 'women-jeans', 'women-skirts', 'women-shorts', 'women-blazers', 'women-jackets', 'women-sweaters', 'women-hoodies', 'women-shoes', 'women-accessories',
     'teens-shirts', 'teens-t-shirts', 'teens-pants', 'teens-jeans', 'teens-shorts', 'teens-dresses', 'teens-skirts', 'teens-blazers', 'teens-jackets', 'teens-sweaters', 'teens-hoodies', 'teens-shoes', 'teens-accessories', 'teens-school-uniforms'
   );

-- Example: Update products to appropriate categories
-- UPDATE products SET category_id = 'men-shirts' WHERE category_id = 'sports' AND name LIKE '%shirt%';
-- UPDATE products SET category_id = 'toys' WHERE category_id = 'electronics' AND name LIKE '%toy%';

-- After updating products, delete the old unwanted categories
DELETE FROM categories 
WHERE id IN ('sports', 'electronics', 'home', 'gardening');

-- Verify the new category structure
SELECT id, name, created_at FROM categories ORDER BY name;