# Supabase Storage Setup Guide

This guide will help you set up the required storage buckets for the Peakees e-commerce platform.

## 🪣 Required Storage Buckets

### 1. Product Images Bucket

**Bucket Name**: `product-images`
**Purpose**: Store product photos uploaded by admin users
**Access**: Public read, Admin write only

## 🔧 Setup Instructions

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "Buckets" tab

3. **Create Product Images Bucket**
   - Click "New bucket"
   - Name: `product-images`
   - Set as **Public bucket**: ✅ Yes
   - Click "Create bucket"

4. **Configure Bucket Policies**
   - Click on the `product-images` bucket
   - Go to "Policies" tab
   - Add the following policies:

### Method 2: Enable Storage via Dashboard (REQUIRED FIRST)

⚠️ **CRITICAL**: Storage must be enabled via Supabase Dashboard first:

1. **Enable Storage in Dashboard**
   - Go to your Supabase Dashboard
   - Click **Storage** in the left sidebar
   - If you see "Storage is not enabled", click **Enable Storage**
   - Wait for it to initialize (this creates all storage tables and policies)

2. **Verify Storage is Working**
   - You should see the Storage interface with "Buckets" tab
   - If you see an error about extensions, Storage isn't properly enabled

3. **Then Run Setup Script**
   - After Storage is enabled via dashboard, use `setup-storage.sql`

```sql
-- Step 1: Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated admin users to upload images
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admin users to update images
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admin users to delete images
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

## 🔐 Storage Policies Explained

### Public Access Policy
- **Purpose**: Allows anyone to view product images
- **Scope**: Read-only access to all files in `product-images` bucket
- **Security**: Safe for public e-commerce site

### Admin Upload Policy
- **Purpose**: Only admin users can upload new images
- **Validation**: Checks user exists in `users` table with `role = 'admin'`
- **Security**: Prevents unauthorized uploads

### Admin Update/Delete Policies
- **Purpose**: Only admin users can modify or remove images
- **Security**: Protects against unauthorized file manipulation

## 🧪 Testing Storage Setup

### Test 1: Verify Bucket Creation
```bash
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://YOUR_PROJECT.supabase.co/storage/v1/bucket/product-images"
```

### Test 2: Test Image Upload (via admin panel)
1. Go to: https://peakees.vercel.app/admin-direct
2. Navigate to "Add Product"
3. Try uploading a product image
4. Should work without 500 errors

### Test 3: Verify Public Access
- Upload an image via admin
- Visit the returned URL in browser
- Image should load publicly

## 🚨 Troubleshooting

### Common Issues

**Error: "Bucket not found"**
- Solution: Ensure bucket name is exactly `product-images`
- Check bucket exists in Supabase dashboard

**Error: "Insufficient permissions"**
- Solution: Verify storage policies are created correctly
- Ensure admin user has correct role in `users` table

**Error: "File too large"**
- Solution: Check file size limit (5MB max)
- Verify `file_size_limit` in bucket configuration

**Error: "Invalid file type"**
- Solution: Only JPEG, PNG, WebP, and GIF are allowed
- Check `allowed_mime_types` configuration

### Policy Debugging

To check existing policies:
```sql
-- View all storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'product-images';

-- Check if user is admin
SELECT role FROM public.users WHERE email = 'michaelvx@gmail.com';
```

## 📁 File Organization

Images will be stored with this structure:
```
product-images/
├── products/
│   ├── 1640123456789-abc123def456.jpg
│   ├── 1640123456790-def789ghi012.png
│   └── ...
```

**File Naming Convention:**
- `{timestamp}-{randomId}.{extension}`
- Example: `1640123456789-abc123def456.jpg`
- Prevents naming conflicts
- Maintains chronological order

## 🔗 URL Format

Public image URLs will be:
```
https://YOUR_PROJECT.supabase.co/storage/v1/object/public/product-images/products/filename.jpg
```

These URLs can be:
- Used directly in `<img>` tags
- Cached by CDNs
- Accessed without authentication

## ✅ Verification Checklist

- [ ] `product-images` bucket created
- [ ] Bucket set as public
- [ ] File size limit set to 5MB
- [ ] Allowed MIME types configured
- [ ] Public read policy created
- [ ] Admin upload policy created
- [ ] Admin update policy created
- [ ] Admin delete policy created
- [ ] Test upload via admin panel works
- [ ] Public image URLs accessible

Once completed, product image uploads should work perfectly in your admin panel!