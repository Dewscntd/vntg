-- Create admin user for michaelvx@gmail.com
-- Run this in Supabase SQL Editor

-- First, check if user exists
SELECT id, email, role FROM users WHERE email = 'michaelvx@gmail.com';

-- If user doesn't exist, we need to get the auth user ID first
-- You can find this in Supabase Dashboard > Authentication > Users

-- Option 1: If user exists in auth.users but not in public.users
INSERT INTO public.users (id, email, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  'admin' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au 
WHERE au.email = 'michaelvx@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Option 2: If user exists, just update role to admin
UPDATE public.users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'michaelvx@gmail.com';

-- Verify the admin user was created/updated
SELECT id, email, role, created_at FROM users WHERE email = 'michaelvx@gmail.com';