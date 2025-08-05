'use client';

// Re-export all hooks
export * from './use-fetch';
export * from './use-cached-fetch';
export * from './use-mutation';
export * from './use-optimistic';

// Import hooks at the top level
import { useCachedFetch } from './use-cached-fetch';
import { useFetch } from './use-fetch';
import { useCreate, useUpdate, useDelete } from './use-mutation';

// Export convenience hooks for specific API endpoints

// Products
export function useProducts(options: any = {}) {
  const url = options.url || '/api/products';
  const cacheKey = options.cacheKey || 'products-list';

  return useCachedFetch(url, {
    cacheKey,
    ...options,
  });
}

export function useProduct(id: string, options = {}) {
  return useCachedFetch(`/api/products/${id}`, {
    cacheKey: `product-${id}`,
    ...options,
  });
}

export function useCreateProduct(options = {}) {
  return useCreate('/api/products', options);
}

export function useUpdateProduct(id: string, options = {}) {
  return useUpdate(`/api/products/${id}`, options);
}

export function useDeleteProduct(id: string, options = {}) {
  return useDelete(`/api/products/${id}`, options);
}

// Categories
export function useCategories(options: any = {}) {
  const url = options.url || '/api/categories';
  const cacheKey = options.cacheKey || 'categories-list';

  return useCachedFetch(url, {
    cacheKey,
    ...options,
  });
}

export function useCategory(id: string, options = {}) {
  return useCachedFetch(`/api/categories/${id}`, {
    cacheKey: `category-${id}`,
    ...options,
  });
}

export function useCreateCategory(options = {}) {
  return useCreate('/api/categories', options);
}

export function useUpdateCategory(id: string, options = {}) {
  return useUpdate(`/api/categories/${id}`, options);
}

export function useDeleteCategory(id: string, options = {}) {
  return useDelete(`/api/categories/${id}`, options);
}

// Cart
export function useCart(options = {}) {
  return useFetch('/api/cart', options);
}

export function useAddToCart(options = {}) {
  return useCreate('/api/cart/add', options);
}

export function useUpdateCartItem(options = {}) {
  return useUpdate('/api/cart/update', options);
}

export function useRemoveFromCart(options = {}) {
  return useDelete('/api/cart/remove', options);
}
