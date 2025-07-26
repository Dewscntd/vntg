-- Create a test admin user directly in the database
-- This bypasses any auth issues

-- First, let's see what auth users exist
SELECT email, email_confirmed_at FROM auth.users LIMIT 5;

-- If you want to create a user manually (replace with your details):
-- Note: This is just to show the structure - you should use Supabase dashboard for actual creation