-- ============================================================================
-- PHOTOS BUCKET POLICIES SETUP
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up policies for the 'photos' bucket
-- ============================================================================

-- Policy 1: Allow public read access to photos
-- This allows anyone to view product images on the website
CREATE POLICY "Public Access to Photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

-- Policy 2: Allow authenticated admin users to upload images
-- This ensures only admin users can upload new product images
CREATE POLICY "Admin Upload Photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 3: Allow admin users to update existing images
-- This allows admins to replace product images
CREATE POLICY "Admin Update Photos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'photos'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 4: Allow admin users to delete images
-- This allows admins to remove product images
CREATE POLICY "Admin Delete Photos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'photos'
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

-- Verify policies were created successfully
SELECT 
  policyname,
  cmd,
  permissive,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%Photos%'
ORDER BY policyname;

-- Check if your admin user exists (replace with your email)
SELECT 
  id,
  email,
  role,
  created_at
FROM public.users 
WHERE email = 'michaelvx@gmail.com';

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If you need to remove policies (in case of errors):
-- DROP POLICY IF EXISTS "Public Access to Photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin Upload Photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin Update Photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin Delete Photos" ON storage.objects;