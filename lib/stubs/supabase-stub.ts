// Supabase stub implementation for local development
import { mockProducts, mockUser, mockCategories, mockCartItems, mockOrders, createMockProduct, createMockUser } from './mock-data';

// Simulate database operations with delays
const simulateDelay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Supabase client
export const createSupabaseStub = () => {
  console.log('🚀 SUPABASE STUB CREATED - Stubs are active!');
  
  return {
    auth: {
    getUser: async () => {
      await simulateDelay();
      // Check if we have an admin session in localStorage
      if (typeof window !== 'undefined') {
        const adminSession = localStorage.getItem('mock-admin-session');
        if (adminSession) {
          const adminUser = {
            ...mockUser,
            id: 'admin-michael',
            email: 'michaelvx@gmail.com',
            role: 'admin',
            first_name: 'Michael',
            last_name: 'Admin',
          };
          return {
            data: { user: adminUser },
            error: null,
          };
        }
      }
      return {
        data: { user: mockUser },
        error: null,
      };
    },
    
    getSession: async () => {
      await simulateDelay();
      // Check if we have an admin session in localStorage
      if (typeof window !== 'undefined') {
        const adminSession = localStorage.getItem('mock-admin-session');
        if (adminSession) {
          const adminUser = {
            ...mockUser,
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
        }
      }
      return {
        data: {
          session: {
            user: mockUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
          },
        },
        error: null,
      };
    },
    
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      console.error('🚨🚨🚨 STUB METHOD CALLED!!! 🚨🚨🚨');
      console.error('🔐 STUB AUTH: signInWithPassword called with:', credentials);
      alert('STUB METHOD WAS CALLED!');
      const { email, password } = credentials;
      console.log('🔐 Email:', email);
      console.log('🔐 Password:', password);
      console.log('🔐 Email check (michaelvx@gmail.com):', email === 'michaelvx@gmail.com');
      console.log('🔐 Password check (admin123):', password === 'admin123');
      await simulateDelay(500);
      
      // Admin login
      if (email === 'michaelvx@gmail.com' && password === 'admin123') {
        console.log('✅ Admin login successful');
        const adminUser = {
          ...mockUser,
          id: 'admin-michael',
          email: 'michaelvx@gmail.com',
          role: 'admin',
          first_name: 'Michael',
          last_name: 'Admin',
        };
        
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
      
      // Regular user login
      if (email === 'test@example.com' && password === 'password') {
        return {
          data: {
            user: mockUser,
            session: {
              user: mockUser,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
            },
          },
          error: null,
        };
      }
      
      console.log('❌ Login failed - invalid credentials');
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      };
    },
    
    signUp: async ({ email, password }: { email: string; password: string }) => {
      await simulateDelay(800);
      return {
        data: {
          user: createMockUser({ email }),
          session: null, // Typically null until email is confirmed
        },
        error: null,
      };
    },
    
    signOut: async () => {
      await simulateDelay(200);
      // Clear admin session flag
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock-admin-session');
      }
      return { error: null };
    },
    
    onAuthStateChange: (callback: Function) => {
      // Simulate initial auth state
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const adminSession = localStorage.getItem('mock-admin-session');
          if (adminSession) {
            const adminUser = {
              ...mockUser,
              id: 'admin-michael',
              email: 'michaelvx@gmail.com',
              role: 'admin',
              first_name: 'Michael',
              last_name: 'Admin',
            };
            callback('SIGNED_IN', { user: adminUser });
          } else {
            callback('SIGNED_IN', { user: mockUser });
          }
        } else {
          callback('SIGNED_IN', { user: mockUser });
        }
      }, 100);
      
      return {
        data: { subscription: { unsubscribe: () => {} } },
      };
    },
  },
  
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          await simulateDelay();
          
          if (table === 'products') {
            const product = mockProducts.find(p => p.id === value);
            return { data: product || null, error: product ? null : { message: 'Product not found' } };
          }
          
          if (table === 'users') {
            if (value === 'admin-michael' || value === 'michaelvx@gmail.com') {
              const adminUser = {
                ...mockUser,
                id: 'admin-michael',
                email: 'michaelvx@gmail.com',
                role: 'admin',
                first_name: 'Michael',
                last_name: 'Admin',
              };
              return { data: adminUser, error: null };
            }
            return { data: mockUser, error: null };
          }
          
          return { data: null, error: { message: 'Not found' } };
        },
        
        async then(resolve: Function) {
          await simulateDelay();
          
          if (table === 'products') {
            const filtered = mockProducts.filter((p: any) => p[column] === value);
            resolve({ data: filtered, error: null });
          } else if (table === 'categories') {
            const filtered = mockCategories.filter((c: any) => c[column] === value);
            resolve({ data: filtered, error: null });
          } else if (table === 'cart_items') {
            const filtered = mockCartItems.filter((c: any) => c[column] === value);
            resolve({ data: filtered, error: null });
          } else if (table === 'orders') {
            const filtered = mockOrders.filter((o: any) => o[column] === value);
            resolve({ data: filtered, error: null });
          }
          
          return { data: [], error: null };
        },
      }),
      
      limit: (count: number) => ({
        async then(resolve: Function) {
          await simulateDelay();
          
          if (table === 'products') {
            resolve({ data: mockProducts.slice(0, count), error: null });
          } else if (table === 'categories') {
            resolve({ data: mockCategories.slice(0, count), error: null });
          }
          
          return { data: [], error: null };
        },
      }),
      
      order: (column: string, options: any = {}) => ({
        limit: (count: number) => ({
          async then(resolve: Function) {
            await simulateDelay();
            
            if (table === 'products') {
              const sorted = [...mockProducts].sort((a: any, b: any) => {
                if (options.ascending === false) {
                  return b[column] > a[column] ? 1 : -1;
                }
                return a[column] > b[column] ? 1 : -1;
              });
              resolve({ data: sorted.slice(0, count), error: null });
            }
            
            return { data: [], error: null };
          },
        }),
        
        async then(resolve: Function) {
          await simulateDelay();
          
          if (table === 'products') {
            const sorted = [...mockProducts].sort((a: any, b: any) => {
              if (options.ascending === false) {
                return b[column] > a[column] ? 1 : -1;
              }
              return a[column] > b[column] ? 1 : -1;
            });
            resolve({ data: sorted, error: null });
          }
          
          return { data: [], error: null };
        },
      }),
      
      async then(resolve: Function) {
        await simulateDelay();
        
        if (table === 'products') {
          resolve({ data: mockProducts, error: null });
        } else if (table === 'categories') {
          resolve({ data: mockCategories, error: null });
        } else if (table === 'cart_items') {
          resolve({ data: mockCartItems, error: null });
        } else if (table === 'orders') {
          resolve({ data: mockOrders, error: null });
        }
        
        return { data: [], error: null };
      },
    }),
    
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          await simulateDelay(300);
          const newItem = { ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString() };
          return { data: newItem, error: null };
        },
      }),
      
      async then(resolve: Function) {
        await simulateDelay(300);
        const newItem = { ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString() };
        resolve({ data: [newItem], error: null });
        return { data: [newItem], error: null };
      },
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            await simulateDelay(200);
            const updatedItem = { ...data, id: value, updated_at: new Date().toISOString() };
            return { data: updatedItem, error: null };
          },
        }),
        
        async then(resolve: Function) {
          await simulateDelay(200);
          const updatedItem = { ...data, id: value, updated_at: new Date().toISOString() };
          resolve({ data: [updatedItem], error: null });
          return { data: [updatedItem], error: null };
        },
      }),
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => ({
        async then(resolve: Function) {
          await simulateDelay(150);
          resolve({ data: null, error: null });
          return { data: null, error: null };
        },
      }),
    }),
  }),
  
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        await simulateDelay(1000);
        return {
          data: { path },
          error: null,
        };
      },
      
      remove: async (paths: string[]) => {
        await simulateDelay(300);
        return { data: null, error: null };
      },
      
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` },
      }),
    }),
  },
  };
};