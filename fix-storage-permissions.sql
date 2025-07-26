-- Fix Supabase Storage Permissions for Photos Bucket
-- Run this in your Supabase SQL Editor

-- First, check if the photos bucket exists and is public
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'photos';

-- If the bucket is not public, make it public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'photos';

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public Access to Photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Photos" ON storage.objects;

-- Also drop any other existing policies for the photos bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Create simple public read policy
CREATE POLICY "Public read access for photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Create admin upload policy
CREATE POLICY "Admin can upload photos"
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

-- Create admin update policy
CREATE POLICY "Admin can update photos"
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

-- Create admin delete policy
CREATE POLICY "Admin can delete photos"
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

-- Verify the setup
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%photos%'
ORDER BY policyname;

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'photos';

-- Test query to see objects in the bucket
SELECT name, bucket_id, created_at, metadata
FROM storage.objects 
WHERE bucket_id = 'photos' 
ORDER BY created_at DESC 
LIMIT 5;