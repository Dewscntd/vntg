-- Add missing product fields
-- This migration adds discount_percent and specifications columns to the products table

-- Add discount_percent column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100);

-- Add specifications column as JSONB for flexible key-value storage
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;

-- Update the updated_at timestamp trigger to include new columns
-- (This ensures the updated_at field is automatically updated when these columns change)

-- Add comments for documentation
COMMENT ON COLUMN public.products.discount_percent IS 'Discount percentage (0-100) for the product';
COMMENT ON COLUMN public.products.specifications IS 'Product specifications as key-value pairs in JSON format';