-- Fix admin access by ensuring michaelvx@gmail.com has admin role
-- Run this in Supabase SQL Editor

-- First, check current user status
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  pu.id as profile_id,
  pu.email as profile_email,
  pu.role as current_role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'michaelvx@gmail.com';

-- Delete existing profile if it exists (so it gets recreated with admin role)
DELETE FROM public.users WHERE email = 'michaelvx@gmail.com';

-- Verify deletion
SELECT * FROM public.users WHERE email = 'michaelvx@gmail.com';

-- Now when you visit /admin, the API will create a new profile with admin role