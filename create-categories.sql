-- Create basic categories for Peakees clothing store
-- Run this in Supabase SQL Editor

-- Insert main categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Men', 'Men''s clothing and accessories', NOW(), NOW()),
('Women', 'Women''s clothing and accessories', NOW(), NOW()),
('Teens', 'Teen clothing and accessories', NOW(), NOW()),
('Kids', 'Children''s clothing and accessories', NOW(), NOW()),
('Shoes', 'All types of footwear', NOW(), NOW()),
('Accessories', 'Bags, jewelry, and other accessories', NOW(), NOW()),
('Toys', 'Soft toys and plush items', NOW(), NOW()),
('Books', 'Books and reading materials', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify categories were created
SELECT * FROM categories ORDER BY name;