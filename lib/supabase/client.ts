import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { USE_STUBS } from '@/lib/stubs';
import { createEnhancedSupabaseStub } from '@/lib/stubs/enhanced-supabase-stub';

export const createClient = () => {
  if (USE_STUBS) {
    console.log('🎭 Creating Supabase client with comprehensive mock data');
    return createEnhancedSupabaseStub();
  }

  console.log('🔗 Creating real Supabase client');
  return createClientComponentClient<Database>();
};
