'use client';

// Re-export all hooks
export * from './use-fetch';
export * from './use-cached-fetch';
export * from './use-mutation';
export * from './use-optimistic';

// Export convenience hooks for specific API endpoints

// Products
export function useProducts(options: any = {}) {
  const { useCachedFetch } = require('./use-cached-fetch');
  const url = options.url || '/api/products';
  const cacheKey = options.cacheKey || 'products-list';

  return useCachedFetch(url, {
    cacheKey,
    ...options,
  });
}

export function useProduct(id: string, options = {}) {
  const { useCachedFetch } = require('./use-cached-fetch');
  return useCachedFetch(`/api/products/${id}`, {
    cacheKey: `product-${id}`,
    ...options,
  });
}

export function useCreateProduct(options = {}) {
  const { useCreate } = require('./use-mutation');
  return useCreate('/api/products', options);
}

export function useUpdateProduct(id: string, options = {}) {
  const { useUpdate } = require('./use-mutation');
  return useUpdate(`/api/products/${id}`, options);
}

export function useDeleteProduct(id: string, options = {}) {
  const { useDelete } = require('./use-mutation');
  return useDelete(`/api/products/${id}`, options);
}

// Categories
export function useCategories(options: any = {}) {
  const { useCachedFetch } = require('./use-cached-fetch');
  const url = options.url || '/api/categories';
  const cacheKey = options.cacheKey || 'categories-list';

  return useCachedFetch(url, {
    cacheKey,
    ...options,
  });
}

export function useCategory(id: string, options = {}) {
  const { useCachedFetch } = require('./use-cached-fetch');
  return useCachedFetch(`/api/categories/${id}`, {
    cacheKey: `category-${id}`,
    ...options,
  });
}

export function useCreateCategory(options = {}) {
  const { useCreate } = require('./use-mutation');
  return useCreate('/api/categories', options);
}

export function useUpdateCategory(id: string, options = {}) {
  const { useUpdate } = require('./use-mutation');
  return useUpdate(`/api/categories/${id}`, options);
}

export function useDeleteCategory(id: string, options = {}) {
  const { useDelete } = require('./use-mutation');
  return useDelete(`/api/categories/${id}`, options);
}

// Cart
export function useCart(options = {}) {
  const { useFetch } = require('./use-fetch');
  return useFetch('/api/cart', options);
}

export function useAddToCart(options = {}) {
  const { useCreate } = require('./use-mutation');
  return useCreate('/api/cart/add', options);
}

export function useUpdateCartItem(options = {}) {
  const { useUpdate } = require('./use-mutation');
  return useUpdate('/api/cart/update', options);
}

export function useRemoveFromCart(options = {}) {
  const { useDelete } = require('./use-mutation');
  return useDelete('/api/cart/remove', options);
}
