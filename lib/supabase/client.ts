import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { USE_STUBS } from '@/lib/stubs';
import { createEnhancedSupabaseStub } from '@/lib/stubs/enhanced-supabase-stub';

// Admin user for development
const adminUser = {
  id: 'admin-michael',
  email: 'michaelvx@gmail.com',
  role: 'admin',
  first_name: 'Michael',
  last_name: 'Admin',
};

// Auto-set admin session for development when stubs are enabled
if (typeof window !== 'undefined' && USE_STUBS) {
  // Auto-login for development
  localStorage.setItem('mock-admin-session', 'true');
  console.log('🔧 AUTO-LOGIN: Set mock-admin-session for development');
}

export const createClient = () => {
  if (USE_STUBS) {
    console.log('🎭 Creating Supabase client with comprehensive mock data');
    return createEnhancedSupabaseStub();
  }

  console.log('🔗 Creating real Supabase client');
  return createClientComponentClient<Database>();
};
