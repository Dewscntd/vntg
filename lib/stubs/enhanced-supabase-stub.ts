// Enhanced Supabase stub with comprehensive query simulation
import {
  generateExtensiveProducts,
  generateExtensiveUsers,
  generateExtensiveCartItems,
  generateExtensiveOrders,
  searchProducts,
  filterProductsByCategory,
  sortProducts,
  paginateResults,
} from './extensive-mock-data';
import { mockCategories } from './mock-data';

// Simulate database operations with realistic delays
const simulateDelay = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Global mock data stores
let mockProducts = generateExtensiveProducts();
let mockUsers = generateExtensiveUsers();
let mockCartItems = generateExtensiveCartItems();
let mockOrders = generateExtensiveOrders();

// Simulate random failures for testing error handling
const shouldSimulateError = (errorRate: number = 0.05): boolean => {
  return Math.random() < errorRate;
};

// Enhanced Supabase client with comprehensive query support
export const createEnhancedSupabaseStub = () => ({
  auth: {
    getUser: async () => {
      await simulateDelay(150);

      if (shouldSimulateError(0.02)) {
        return { data: { user: null }, error: { message: 'Network error' } };
      }

      // Simulate different auth states
      const authStates = [
        { user: mockUsers[0] }, // Logged in user
        { user: mockUsers[2] }, // Admin user
        { user: null }, // Not logged in
      ];

      const randomState = authStates[Math.floor(Math.random() * authStates.length)];
      return { data: randomState, error: null };
    },

    getSession: async () => {
      await simulateDelay(120);
      const user = mockUsers[0];
      return {
        data: {
          session: user
            ? {
                user,
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Date.now() + 3600000,
                token_type: 'bearer',
              }
            : null,
        },
        error: null,
      };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      await simulateDelay(800);

      // Simulate various auth scenarios
      const validCredentials = [
        { email: 'john.doe@example.com', password: 'password123' },
        { email: 'admin@peakees.com', password: 'admin123' },
        { email: 'michaelvx@gmail.com', password: 'admin123' }, // Admin user
        { email: 'jane.smith@example.com', password: 'password123' },
      ];

      const isValid = validCredentials.some(
        (cred) => cred.email === email && cred.password === password
      );

      if (isValid) {
        let user = mockUsers.find((u) => u.email === email);

        // Special handling for admin user
        if (email === 'michaelvx@gmail.com') {
          user = {
            id: 'admin-michael',
            email: 'michaelvx@gmail.com',
            full_name: 'Michael Admin',
            avatar_url: null,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Set admin session flag in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('mock-admin-session', 'true');
          }
        }

        user = user || mockUsers[0];

        return {
          data: {
            user,
            session: {
              user,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000,
              token_type: 'bearer',
            },
          },
          error: null,
        };
      }

      // Simulate different error types
      const errors = [
        { message: 'Invalid login credentials' },
        { message: 'Email not confirmed' },
        { message: 'Too many requests, please try again later' },
      ];

      return {
        data: { user: null, session: null },
        error: errors[Math.floor(Math.random() * errors.length)],
      };
    },

    signUp: async ({ email, password, options }: any) => {
      await simulateDelay(1200);

      // Check if email already exists
      const existingUser = mockUsers.find((u) => u.email === email);
      if (existingUser) {
        return {
          data: { user: null, session: null },
          error: { message: 'User already registered' },
        };
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        full_name:
          `${options?.data?.firstName || ''} ${options?.data?.lastName || ''}`.trim() || null,
        avatar_url: null,
        role: 'customer' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockUsers.push(newUser);

      return {
        data: {
          user: newUser,
          session: null, // Typically null until email is confirmed
        },
        error: null,
      };
    },

    signOut: async () => {
      await simulateDelay(200);
      return { error: null };
    },

    onAuthStateChange: (callback: Function) => {
      // Simulate auth state changes
      setTimeout(() => {
        callback('SIGNED_IN', { user: mockUsers[0] });
      }, 100);

      return {
        data: { subscription: { unsubscribe: () => {} } },
      };
    },
  },

  from: (table: string) => ({
    select: (columns: string = '*') => {
      const queryBuilder = {
        _table: table,
        _columns: columns,
        _filters: [] as any[],
        _limit: null as number | null,
        _offset: null as number | null,
        _order: null as { column: string; ascending: boolean } | null,
        _single: false,

        eq: function (column: string, value: any) {
          this._filters.push({ type: 'eq', column, value });
          return this;
        },

        neq: function (column: string, value: any) {
          this._filters.push({ type: 'neq', column, value });
          return this;
        },

        gt: function (column: string, value: any) {
          this._filters.push({ type: 'gt', column, value });
          return this;
        },

        gte: function (column: string, value: any) {
          this._filters.push({ type: 'gte', column, value });
          return this;
        },

        lt: function (column: string, value: any) {
          this._filters.push({ type: 'lt', column, value });
          return this;
        },

        lte: function (column: string, value: any) {
          this._filters.push({ type: 'lte', column, value });
          return this;
        },

        like: function (column: string, pattern: string) {
          this._filters.push({ type: 'like', column, value: pattern });
          return this;
        },

        ilike: function (column: string, pattern: string) {
          this._filters.push({ type: 'ilike', column, value: pattern });
          return this;
        },

        in: function (column: string, values: any[]) {
          this._filters.push({ type: 'in', column, value: values });
          return this;
        },

        limit: function (count: number) {
          this._limit = count;
          return this;
        },

        range: function (from: number, to: number) {
          this._offset = from;
          this._limit = to - from + 1;
          return this;
        },

        order: function (column: string, options: { ascending?: boolean } = {}) {
          this._order = { column, ascending: options.ascending !== false };
          return this;
        },

        single: function () {
          this._single = true;
          return this;
        },

        async then(resolve: Function) {
          await simulateDelay(100 + Math.random() * 200);

          if (shouldSimulateError()) {
            const error = { message: 'Database connection error', code: 'PGRST301' };
            resolve({ data: null, error });
            return;
          }

          let data: any[] = [];

          // Get base data
          switch (this._table) {
            case 'products':
              data = [...mockProducts];
              break;
            case 'categories':
              data = [...mockCategories];
              break;
            case 'users':
              data = [...mockUsers];
              break;
            case 'cart_items':
              data = [...mockCartItems];
              break;
            case 'orders':
              data = [...mockOrders];
              break;
            default:
              data = [];
          }

          // Apply filters
          data = this._filters.reduce((filteredData, filter) => {
            return filteredData.filter((item: any) => {
              const itemValue = item[filter.column];

              switch (filter.type) {
                case 'eq':
                  return itemValue === filter.value;
                case 'neq':
                  return itemValue !== filter.value;
                case 'gt':
                  return itemValue > filter.value;
                case 'gte':
                  return itemValue >= filter.value;
                case 'lt':
                  return itemValue < filter.value;
                case 'lte':
                  return itemValue <= filter.value;
                case 'like':
                case 'ilike':
                  const pattern = filter.value.replace(/%/g, '.*');
                  const regex = new RegExp(pattern, filter.type === 'ilike' ? 'i' : '');
                  return regex.test(String(itemValue));
                case 'in':
                  return filter.value.includes(itemValue);
                default:
                  return true;
              }
            });
          }, data);

          // Apply ordering
          if (this._order) {
            data.sort((a, b) => {
              const aVal = a[this._order!.column];
              const bVal = b[this._order!.column];

              if (aVal < bVal) return this._order!.ascending ? -1 : 1;
              if (aVal > bVal) return this._order!.ascending ? 1 : -1;
              return 0;
            });
          }

          // Apply pagination
          if (this._offset !== null) {
            data = data.slice(this._offset, this._offset + (this._limit || data.length));
          } else if (this._limit !== null) {
            data = data.slice(0, this._limit);
          }

          // Return single item or array
          if (this._single) {
            resolve({
              data: data[0] || null,
              error: data[0] ? null : { message: 'No rows found' },
            });
          } else {
            resolve({ data, error: null });
          }
        },
      };

      return queryBuilder;
    },

    insert: (data: any) => ({
      select: (columns: string = '*') => ({
        single: async () => {
          await simulateDelay(300);

          if (shouldSimulateError(0.03)) {
            return { data: null, error: { message: 'Insert failed', code: 'PGRST204' } };
          }

          const newItem = {
            ...data,
            id: `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Add to appropriate mock store
          switch (table) {
            case 'products':
              mockProducts.push(newItem);
              break;
            case 'users':
              mockUsers.push(newItem);
              break;
            case 'cart_items':
              mockCartItems.push(newItem);
              break;
            case 'orders':
              mockOrders.push(newItem);
              break;
          }

          return { data: newItem, error: null };
        },
      }),

      async then(resolve: Function) {
        await simulateDelay(300);

        const newItems = Array.isArray(data) ? data : [data];
        const insertedItems = newItems.map((item) => ({
          ...item,
          id: `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        resolve({ data: insertedItems, error: null });
      },
    }),

    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: (columns: string = '*') => ({
          single: async () => {
            await simulateDelay(250);

            if (shouldSimulateError(0.03)) {
              return { data: null, error: { message: 'Update failed' } };
            }

            const updatedItem = {
              ...data,
              id: value,
              updated_at: new Date().toISOString(),
            };

            // Update in appropriate mock store
            switch (table) {
              case 'products':
                const productIndex = mockProducts.findIndex((p) => p.id === value);
                if (productIndex !== -1) {
                  mockProducts[productIndex] = {
                    ...mockProducts[productIndex],
                    ...data,
                    updated_at: new Date().toISOString(),
                  };
                  return { data: mockProducts[productIndex], error: null };
                }
                break;
              case 'users':
                const userIndex = mockUsers.findIndex((u) => u.id === value);
                if (userIndex !== -1) {
                  mockUsers[userIndex] = {
                    ...mockUsers[userIndex],
                    ...data,
                    updated_at: new Date().toISOString(),
                  };
                  return { data: mockUsers[userIndex], error: null };
                }
                break;
            }

            return { data: updatedItem, error: null };
          },
        }),

        async then(resolve: Function) {
          await simulateDelay(250);
          resolve({ data: [{ ...data, updated_at: new Date().toISOString() }], error: null });
        },
      }),
    }),

    delete: () => ({
      eq: (column: string, value: any) => ({
        async then(resolve: Function) {
          await simulateDelay(200);

          if (shouldSimulateError(0.02)) {
            resolve({ data: null, error: { message: 'Delete failed' } });
            return;
          }

          // Remove from appropriate mock store
          switch (table) {
            case 'products':
              mockProducts = mockProducts.filter((p) => p.id !== value);
              break;
            case 'users':
              mockUsers = mockUsers.filter((u) => u.id !== value);
              break;
            case 'cart_items':
              mockCartItems = mockCartItems.filter((c) => c.id !== value);
              break;
            case 'orders':
              mockOrders = mockOrders.filter((o) => o.id !== value);
              break;
          }

          resolve({ data: null, error: null });
        },
      }),
    }),

    // RPC functions
    rpc: (functionName: string, params?: any) => ({
      async then(resolve: Function) {
        await simulateDelay(300);

        switch (functionName) {
          case 'get_cart_total':
            const userId = params?.user_id;
            const userCartItems = mockCartItems.filter((item) => item.user_id === userId);
            let total = 0;

            userCartItems.forEach((item) => {
              const product = mockProducts.find((p) => p.id === item.product_id);
              if (product) {
                total += product.price * item.quantity;
              }
            });

            resolve({ data: total, error: null });
            break;

          case 'search_products':
            const { query, category_id, limit = 20, offset = 0 } = params || {};
            let searchResults = [...mockProducts];

            if (query) {
              searchResults = searchProducts(searchResults, query);
            }

            if (category_id) {
              searchResults = filterProductsByCategory(searchResults, category_id);
            }

            const paginatedResults = searchResults.slice(offset, offset + limit);
            resolve({ data: paginatedResults, error: null });
            break;

          default:
            resolve({ data: null, error: { message: `Function ${functionName} not found` } });
        }
      },
    }),
  }),

  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File | Blob) => {
        await simulateDelay(1500 + Math.random() * 2000); // Simulate file upload time

        if (shouldSimulateError(0.05)) {
          return {
            data: null,
            error: { message: 'Upload failed', statusCode: '413' },
          };
        }

        const fileSize = file.size || 1024;
        const mockPath = `${bucket}/${path}`;

        return {
          data: {
            path: mockPath,
            id: `file-${Date.now()}`,
            fullPath: mockPath,
          },
          error: null,
        };
      },

      remove: async (paths: string[]) => {
        await simulateDelay(400);
        return { data: { message: `Removed ${paths.length} files` }, error: null };
      },

      getPublicUrl: (path: string) => {
        return {
          data: {
            publicUrl: `https://mock-storage.supabase.co/storage/v1/object/public/${bucket}/${path}?t=${Date.now()}`,
          },
        };
      },

      createSignedUrl: async (path: string, expiresIn: number) => {
        await simulateDelay(200);
        return {
          data: {
            signedUrl: `https://mock-storage.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=mock-signed-token&expires=${expiresIn}`,
          },
          error: null,
        };
      },
    }),
  },

  // Real-time subscriptions (mock)
  channel: (name: string) => ({
    on: (event: string, filter: any, callback: Function) => {
      console.log(`Mock realtime subscription: ${name}, event: ${event}`);

      // Simulate real-time updates
      const interval = setInterval(() => {
        if (Math.random() < 0.1) {
          // 10% chance of update every 5 seconds
          callback({
            eventType: event,
            new: { id: 'mock-update', ...filter },
            old: {},
            errors: null,
          });
        }
      }, 5000);

      return {
        subscribe: () => ({
          unsubscribe: () => clearInterval(interval),
        }),
      };
    },
  }),
});
