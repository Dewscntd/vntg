import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { USE_STUBS, createSupabaseStub } from '@/lib/stubs';

export const createServerClient = () => {
  if (USE_STUBS) {
    console.log('🔧 Using simple Supabase stub for server components');
    return {
      auth: {
        getSession: async () => {
          console.log('🎯 SERVER STUB: getSession called');
          const adminUser = {
            id: 'admin-michael',
            email: 'michaelvx@gmail.com',
            role: 'admin',
            first_name: 'Michael',
            last_name: 'Admin',
          };
          return {
            data: {
              session: {
                user: adminUser,
                access_token: 'mock-admin-token',
                refresh_token: 'mock-admin-refresh-token',
              },
            },
            error: null,
          };
        },
        getUser: async () => {
          console.log('🎯 SERVER STUB: getUser called');
          const adminUser = {
            id: 'admin-michael',
            email: 'michaelvx@gmail.com',
            role: 'admin',
            first_name: 'Michael',
            last_name: 'Admin',
          };
          return { data: { user: adminUser }, error: null };
        },
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => {
              console.log('🎯 SERVER STUB: Database query called for table:', table);
              if (table === 'users') {
                const adminUser = {
                  id: 'admin-michael',
                  email: 'michaelvx@gmail.com',
                  role: 'admin',
                  first_name: 'Michael',
                  last_name: 'Admin',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                return { data: adminUser, error: null };
              }
              return { data: [], error: null };
            },
            then: async (resolve: Function) => {
              console.log('🎯 SERVER STUB: Database query.then called for table:', table);
              resolve({ data: [], error: null });
            },
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: {}, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: {}, error: null }),
            }),
          }),
        }),
      }),
    } as any;
  }
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};
