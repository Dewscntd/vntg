/**
 * Shop State Management Hook
 *
 * Centralized hook for managing shop state including:
 * - URL-based filtering and sorting
 * - Persistent layout preferences
 * - Gender navigation
 *
 * Follows the single responsibility principle by delegating
 * specific concerns to specialized hooks.
 */

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Gender, GridLayout, ProductFilters, SortOption } from '@/types/shop';

const STORAGE_KEY = 'shop-preferences';

interface ShopPreferences {
  gridLayout: GridLayout;
  lastGender: Gender;
}

/**
 * Get shop preferences from localStorage
 */
function getStoredPreferences(): ShopPreferences {
  if (typeof window === 'undefined') {
    return { gridLayout: 4, lastGender: 'women' };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse shop preferences:', error);
  }

  return { gridLayout: 4, lastGender: 'women' };
}

/**
 * Save shop preferences to localStorage
 */
function savePreferences(preferences: ShopPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save shop preferences:', error);
  }
}

/**
 * Hook for managing shop URL parameters and filters
 */
export function useShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const filters = useMemo<ProductFilters>(() => {
    const params: ProductFilters = {};

    const category = searchParams.get('category');
    if (category) params.category = category;

    const priceMin = searchParams.get('priceMin');
    if (priceMin) params.priceMin = parseFloat(priceMin);

    const priceMax = searchParams.get('priceMax');
    if (priceMax) params.priceMax = parseFloat(priceMax);

    const sizes = searchParams.get('sizes');
    if (sizes) params.sizes = sizes.split(',');

    const colors = searchParams.get('colors');
    if (colors) params.colors = colors.split(',');

    const inStock = searchParams.get('inStock');
    if (inStock) params.inStock = inStock === 'true';

    const isNew = searchParams.get('new');
    if (isNew) params.isNew = isNew === 'true';

    const isSale = searchParams.get('sale');
    if (isSale) params.isSale = isSale === 'true';

    return params;
  }, [searchParams]);

  // Parse current sort
  const sort = useMemo<SortOption>(() => {
    const sortParam = searchParams.get('sort');
    if (
      sortParam &&
      ['newest', 'price-asc', 'price-desc', 'name-asc', 'name-desc'].includes(sortParam)
    ) {
      return sortParam as SortOption;
    }
    return 'newest';
  }, [searchParams]);

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Merge with existing filters
      const merged = { ...filters, ...newFilters };

      // Clear all filter params first
      params.delete('category');
      params.delete('priceMin');
      params.delete('priceMax');
      params.delete('sizes');
      params.delete('colors');
      params.delete('inStock');
      params.delete('new');
      params.delete('sale');

      // Set new values
      if (merged.category) params.set('category', merged.category);
      if (merged.priceMin !== undefined) params.set('priceMin', merged.priceMin.toString());
      if (merged.priceMax !== undefined) params.set('priceMax', merged.priceMax.toString());
      if (merged.sizes?.length) params.set('sizes', merged.sizes.join(','));
      if (merged.colors?.length) params.set('colors', merged.colors.join(','));
      if (merged.inStock !== undefined) params.set('inStock', merged.inStock.toString());
      if (merged.isNew !== undefined) params.set('new', merged.isNew.toString());
      if (merged.isSale !== undefined) params.set('sale', merged.isSale.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, pathname, router, searchParams]
  );

  // Update sort
  const updateSort = useCallback(
    (newSort: SortOption) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', newSort);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    sort,
    updateFilters,
    updateSort,
    clearFilters,
  };
}

/**
 * Hook for managing grid layout preference
 * Uses state to prevent hydration mismatch - starts with default value,
 * then syncs with localStorage after mount
 */
export function useGridLayout() {
  // Default value for SSR - must match server render (4 columns grid)
  const [gridLayout, setGridLayoutState] = useState<GridLayout>(4);

  // Sync with localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    const preferences = getStoredPreferences();
    // Validate stored value is a valid GridLayout
    const validLayouts: GridLayout[] = [2, 4, 'list'];
    if (validLayouts.includes(preferences.gridLayout)) {
      setGridLayoutState(preferences.gridLayout);
    }
  }, []);

  const setGridLayout = useCallback((layout: GridLayout) => {
    setGridLayoutState(layout);
    const current = getStoredPreferences();
    savePreferences({ ...current, gridLayout: layout });
  }, []);

  return {
    gridLayout,
    setGridLayout,
  };
}

/**
 * Hook for managing last visited gender
 * Uses state to prevent hydration mismatch
 */
export function useLastGender() {
  // Default value for SSR
  const [lastGender, setLastGenderState] = useState<Gender>('women');

  // Sync with localStorage after mount
  useEffect(() => {
    const preferences = getStoredPreferences();
    setLastGenderState(preferences.lastGender);
  }, []);

  const setLastGender = useCallback((gender: Gender) => {
    setLastGenderState(gender);
    const current = getStoredPreferences();
    savePreferences({ ...current, lastGender: gender });
  }, []);

  return {
    lastGender,
    setLastGender,
  };
}
