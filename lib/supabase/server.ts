import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { USE_STUBS } from '@/lib/stubs';
import { mockProducts } from '@/lib/stubs/mock-data';

// In-memory cart storage for stub mode
let stubCartItems: any[] = [
  {
    id: 'cart-admin-001',
    user_id: 'admin-michael',
    quantity: 1,
    product_id: 'prod-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cart-admin-002',
    user_id: 'admin-michael',
    quantity: 2,
    product_id: 'prod-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// In-memory favorites storage for stub mode
let stubFavoriteItems: any[] = [
  {
    id: 'fav-admin-001',
    user_id: 'admin-michael',
    product_id: 'prod-3',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fav-admin-002',
    user_id: 'admin-michael',
    product_id: 'prod-5',
    created_at: new Date().toISOString(),
  },
];

// Get cart items with joined product data
const getCartItemsWithProducts = (userId: string) => {
  return stubCartItems
    .filter(item => item.user_id === userId)
    .map(item => {
      const product = mockProducts.find(p => p.id === item.product_id);
      return {
        ...item,
        products: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          inventory_count: product.inventory_count,
        } : null,
      };
    });
};

// Get favorite items with joined product data
const getFavoriteItemsWithProducts = (userId: string) => {
  return stubFavoriteItems
    .filter(item => item.user_id === userId)
    .map(item => {
      const product = mockProducts.find(p => p.id === item.product_id);
      return {
        ...item,
        products: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          inventory_count: product.inventory_count,
          discount_percent: product.discount_percent || 0,
        } : null,
      };
    });
};

// Admin user object
const adminUser = {
  id: 'admin-michael',
  email: 'michaelvx@gmail.com',
  role: 'admin',
  first_name: 'Michael',
  last_name: 'Admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const createServerClient = () => {
  if (USE_STUBS) {
    console.log('🔧 Using Supabase stub for server components');

    // Create a query builder that tracks state
    const createQueryBuilder = (table: string) => {
      let filters: { column: string; value: any }[] = [];
      let selectedColumns = '*';
      let insertData: any = null;
      let updateData: any = null;

      const builder: any = {
        select: (columns: string = '*') => {
          selectedColumns = columns;
          return builder;
        },
        eq: (column: string, value: any) => {
          filters.push({ column, value });
          return builder;
        },
        single: async () => {
          console.log(`🎯 STUB: ${table}.single() with filters:`, filters);

          if (table === 'users') {
            const idFilter = filters.find(f => f.column === 'id');
            if (idFilter?.value === 'admin-michael') {
              return { data: adminUser, error: null };
            }
            return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
          }

          if (table === 'products') {
            const idFilter = filters.find(f => f.column === 'id');
            const product = mockProducts.find(p => p.id === idFilter?.value);
            if (product) {
              return { data: product, error: null };
            }
            return { data: null, error: { code: 'PGRST116', message: 'Product not found' } };
          }

          if (table === 'cart_items') {
            const userFilter = filters.find(f => f.column === 'user_id');
            const productFilter = filters.find(f => f.column === 'product_id');
            const idFilter = filters.find(f => f.column === 'id');

            let items = stubCartItems;

            if (idFilter) {
              items = items.filter(i => i.id === idFilter.value);
            }
            if (userFilter) {
              items = items.filter(i => i.user_id === userFilter.value);
            }
            if (productFilter) {
              items = items.filter(i => i.product_id === productFilter.value);
            }

            if (items.length > 0) {
              return { data: items[0], error: null };
            }
            return { data: null, error: { code: 'PGRST116', message: 'Cart item not found' } };
          }

          if (table === 'favorites') {
            const userFilter = filters.find(f => f.column === 'user_id');
            const productFilter = filters.find(f => f.column === 'product_id');

            let items = stubFavoriteItems;

            if (userFilter) {
              items = items.filter(i => i.user_id === userFilter.value);
            }
            if (productFilter) {
              items = items.filter(i => i.product_id === productFilter.value);
            }

            if (items.length > 0) {
              return { data: items[0], error: null };
            }
            return { data: null, error: { code: 'PGRST116', message: 'Favorite not found' } };
          }

          return { data: null, error: null };
        },
        then: (resolve: Function) => {
          console.log(`🎯 STUB: ${table}.then() with filters:`, filters);

          if (table === 'cart_items') {
            const userFilter = filters.find(f => f.column === 'user_id');
            if (userFilter) {
              const items = getCartItemsWithProducts(userFilter.value);
              console.log(`✅ STUB: Returning ${items.length} cart items for user ${userFilter.value}`);
              resolve({ data: items, error: null });
              return;
            }
            resolve({ data: [], error: null });
            return;
          }

          if (table === 'favorites') {
            const userFilter = filters.find(f => f.column === 'user_id');
            if (userFilter) {
              const items = getFavoriteItemsWithProducts(userFilter.value);
              console.log(`✅ STUB: Returning ${items.length} favorite items for user ${userFilter.value}`);
              resolve({ data: items, error: null });
              return;
            }
            resolve({ data: [], error: null });
            return;
          }

          resolve({ data: [], error: null });
        },
      };

      // Insert operation
      builder.insert = (data: any) => {
        insertData = data;
        return {
          select: () => ({
            single: async () => {
              console.log(`🎯 STUB: ${table}.insert():`, insertData);

              if (table === 'cart_items') {
                const newItem = {
                  id: `cart-${Date.now()}`,
                  ...insertData,
                };
                stubCartItems.push(newItem);
                console.log('✅ STUB: Added cart item:', newItem);
                return { data: newItem, error: null };
              }

              if (table === 'favorites') {
                const newItem = {
                  id: `fav-${Date.now()}`,
                  created_at: new Date().toISOString(),
                  ...insertData,
                };
                stubFavoriteItems.push(newItem);
                console.log('✅ STUB: Added favorite:', newItem);
                return { data: newItem, error: null };
              }

              return { data: { id: `${table}-${Date.now()}`, ...insertData }, error: null };
            },
          }),
        };
      };

      // Update operation
      builder.update = (data: any) => {
        updateData = data;
        return {
          eq: (column: string, value: any) => {
            filters.push({ column, value });
            return {
              select: () => ({
                single: async () => {
                  console.log(`🎯 STUB: ${table}.update():`, updateData, 'filters:', filters);

                  if (table === 'cart_items') {
                    const idFilter = filters.find(f => f.column === 'id');
                    if (idFilter) {
                      const index = stubCartItems.findIndex(i => i.id === idFilter.value);
                      if (index !== -1) {
                        stubCartItems[index] = { ...stubCartItems[index], ...updateData };
                        console.log('✅ STUB: Updated cart item:', stubCartItems[index]);
                        return { data: stubCartItems[index], error: null };
                      }
                    }
                  }

                  return { data: { ...updateData }, error: null };
                },
              }),
              then: async (resolve: Function) => {
                resolve({ data: [updateData], error: null });
              },
            };
          },
        };
      };

      // Delete operation
      builder.delete = () => {
        return {
          eq: (column: string, value: any) => {
            filters.push({ column, value });
            return {
              eq: (col2: string, val2: any) => {
                filters.push({ column: col2, value: val2 });
                return {
                  then: async (resolve: Function) => {
                    console.log(`🎯 STUB: ${table}.delete() with filters:`, filters);

                    if (table === 'favorites') {
                      const userFilter = filters.find(f => f.column === 'user_id');
                      const productFilter = filters.find(f => f.column === 'product_id');
                      if (userFilter && productFilter) {
                        const index = stubFavoriteItems.findIndex(
                          i => i.user_id === userFilter.value && i.product_id === productFilter.value
                        );
                        if (index !== -1) {
                          const removed = stubFavoriteItems.splice(index, 1);
                          console.log('✅ STUB: Removed favorite:', removed[0]);
                        }
                      }
                    }

                    resolve({ data: null, error: null });
                  },
                };
              },
              then: async (resolve: Function) => {
                console.log(`🎯 STUB: ${table}.delete() with filters:`, filters);

                if (table === 'cart_items') {
                  const idFilter = filters.find(f => f.column === 'id');
                  if (idFilter) {
                    const index = stubCartItems.findIndex(i => i.id === idFilter.value);
                    if (index !== -1) {
                      const removed = stubCartItems.splice(index, 1);
                      console.log('✅ STUB: Removed cart item:', removed[0]);
                    }
                  }
                }

                if (table === 'favorites') {
                  const productFilter = filters.find(f => f.column === 'product_id');
                  if (productFilter) {
                    const index = stubFavoriteItems.findIndex(i => i.product_id === productFilter.value);
                    if (index !== -1) {
                      const removed = stubFavoriteItems.splice(index, 1);
                      console.log('✅ STUB: Removed favorite:', removed[0]);
                    }
                  }
                }

                resolve({ data: null, error: null });
              },
            };
          },
        };
      };

      return builder;
    };

    return {
      auth: {
        getSession: async () => {
          console.log('🎯 STUB: getSession called');
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
          console.log('🎯 STUB: getUser called');
          return { data: { user: adminUser }, error: null };
        },
      },
      from: (table: string) => createQueryBuilder(table),
    } as any;
  }

  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};
