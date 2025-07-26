-- ============================================================================
-- PEAKEES STORAGE SETUP SCRIPT
-- ============================================================================
-- Run this script in your Supabase SQL Editor to set up storage buckets
-- and policies for the Peakees e-commerce platform.
--
-- IMPORTANT: Run this AFTER your database migrations are complete
-- ============================================================================

-- ============================================================================
-- IMPORTANT: Before running this script, you MUST enable Storage via 
-- the Supabase Dashboard first! Go to Storage > Enable Storage
-- ============================================================================

-- Create the product-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,                     -- Public bucket for product images
  5242880,                  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR PRODUCT IMAGES
-- ============================================================================

-- Policy 1: Allow public read access to product images
-- This allows anyone to view product images on the website
CREATE POLICY "Public Access to Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Policy 2: Allow authenticated admin users to upload images
-- This ensures only admin users can upload new product images
CREATE POLICY "Admin Upload Product Images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 3: Allow admin users to update existing images
-- This allows admins to replace product images
CREATE POLICY "Admin Update Product Images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 4: Allow admin users to delete images
-- This allows admins to remove product images
CREATE POLICY "Admin Delete Product Images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify bucket was created successfully
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- Verify policies were created successfully
SELECT 
  policyname,
  cmd,
  permissive,
  qual
FROM storage.policies 
WHERE bucket_id = 'product-images'
ORDER BY policyname;

-- Check admin user exists (replace email with your admin email)
SELECT 
  id,
  email,
  role,
  created_at
FROM public.users 
WHERE email = 'michaelvx@gmail.com';

-- ============================================================================
-- TROUBLESHOOTING QUERIES
-- ============================================================================

-- If you need to remove all policies (in case of errors)
-- DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;

-- If you need to delete and recreate the bucket
-- DELETE FROM storage.objects WHERE bucket_id = 'product-images';
-- DELETE FROM storage.buckets WHERE id = 'product-images';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- After running this script successfully:
-- 1. Product image uploads should work via admin panel
-- 2. Images will be publicly accessible via URLs
-- 3. Only admin users can manage images
-- 4. File size is limited to 5MB
-- 5. Only image files (JPEG, PNG, WebP, GIF) are allowed
-- ============================================================================