-- If all else fails, create user manually through Supabase SQL Editor
-- This creates the public.users record after you create the auth.users record

-- 1. First create user via Supabase Dashboard Auth > Users
-- 2. Then run this to create the public users record and make them admin:

INSERT INTO public.users (
  id, 
  email, 
  full_name, 
  role, 
  created_at, 
  updated_at
) VALUES (
  'your-auth-user-id-here',  -- Get this from auth.users table after creating
  'your-email@example.com',
  'Your Full Name',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Or if user already exists, just make them admin:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';