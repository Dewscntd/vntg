import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { USE_STUBS, createSupabaseStub } from '@/lib/stubs';

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
  console.log('🔍 createClient called - creating simple admin stub');

  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        console.log('🎯 SIMPLE STUB: signInWithPassword called with:', { email, password });

        if (email === 'michaelvx@gmail.com' && password === 'admin123') {
          console.log('✅ SIMPLE STUB: Admin login successful!');

          // Set admin session flag in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('mock-admin-session', 'true');
          }

          return {
            data: {
              user: adminUser,
              session: {
                user: adminUser,
                access_token: 'mock-admin-token',
                refresh_token: 'mock-admin-refresh-token',
              },
            },
            error: null,
          };
        }

        console.log('❌ SIMPLE STUB: Invalid credentials');
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        };
      },

      getUser: async () => {
        console.log('🎯 SIMPLE STUB: getUser called');
        if (typeof window !== 'undefined') {
          const adminSession = localStorage.getItem('mock-admin-session');
          if (adminSession) {
            console.log('🎯 SIMPLE STUB: Returning admin user');
            return { data: { user: adminUser }, error: null };
          }
        }
        return { data: { user: null }, error: null };
      },

      getSession: async () => {
        console.log('🎯 SIMPLE STUB: getSession called');
        if (typeof window !== 'undefined') {
          const adminSession = localStorage.getItem('mock-admin-session');
          if (adminSession) {
            const session = {
              user: adminUser,
              access_token: 'mock-admin-token',
              refresh_token: 'mock-admin-refresh-token',
            };
            console.log('🎯 SIMPLE STUB: Returning admin session');
            return { data: { session }, error: null };
          }
        }
        return { data: { session: null }, error: null };
      },
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mock-admin-session');
        }
        return { error: null };
      },
      onAuthStateChange: (callback: Function) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({ select: () => ({ then: () => Promise.resolve({ data: [], error: null }) }) }),
    storage: { from: () => ({}) },
  } as any;
};
