/**
 * Infinite Scroll Hook
 *
 * Manages infinite pagination state with automatic loading on scroll.
 * Follows clean separation of concerns - this hook only manages state,
 * the component using it handles rendering and intersection observer setup.
 */

import { useState, useCallback, useRef } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UseInfiniteScrollOptions {
  initialLimit?: number;
  onLoadMore?: (page: number) => Promise<void>;
}

export interface UseInfiniteScrollReturn {
  // State
  pagination: PaginationState;
  isLoading: boolean;
  error: Error | null;

  // Actions
  loadMore: () => Promise<void>;
  reset: () => void;
  setPagination: (pagination: Partial<PaginationState>) => void;

  // Refs for intersection observer
  observerTarget: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for managing infinite scroll pagination state
 */
export function useInfiniteScroll({
  initialLimit = 10,
  onLoadMore,
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn {
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasMore: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false); // Prevent concurrent loads

  /**
   * Load the next page of data
   */
  const loadMore = useCallback(async () => {
    // Prevent concurrent loads or loading when no more data
    if (loadingRef.current || !pagination.hasMore || isLoading) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const nextPage = pagination.page + 1;

      if (onLoadMore) {
        await onLoadMore(nextPage);
      }

      setPaginationState((prev) => ({
        ...prev,
        page: nextPage,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more'));
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [pagination.hasMore, pagination.page, isLoading, onLoadMore]);

  /**
   * Reset pagination to initial state
   */
  const reset = useCallback(() => {
    setPaginationState({
      page: 1,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
      hasMore: true,
    });
    setError(null);
    loadingRef.current = false;
  }, [initialLimit]);

  /**
   * Update pagination state (used by parent component after fetching)
   */
  const setPagination = useCallback((updates: Partial<PaginationState>) => {
    setPaginationState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return {
    pagination,
    isLoading,
    error,
    loadMore,
    reset,
    setPagination,
    observerTarget,
  };
}
