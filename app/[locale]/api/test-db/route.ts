import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { successResponse, handleDatabaseError } from '@/lib/api/index';

export async function GET(req: NextRequest) {
  try {
    // Debug environment variables
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Test if products table exists with a simple query
    const { data, error } = await supabase.from('products').select('id').limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      throw error;
    }

    return successResponse({
      message: 'Database connection successful',
      productCount: data?.length || 0,
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return handleDatabaseError(error as Error);
  }
}
