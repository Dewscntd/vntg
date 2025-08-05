'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiCache, withCache } from '@/lib/utils/cache';
import { FetchState, UseFetchOptions } from './use-fetch';

export type UseCachedFetchOptions = UseFetchOptions & {
  cacheKey?: string;
  cacheTtl?: number;
  skipCache?: boolean;
};

/**
 * Custom hook for fetching data from an API endpoint with caching
 * @param url The URL to fetch data from
 * @param options Options for the fetch request
 * @returns The fetch state (data, isLoading, error)
 */
export function useCachedFetch<T = any>(
  url: string,
  options: UseCachedFetchOptions = {}
): FetchState<T> & { refetch: () => Promise<void> } {
  const {
    enabled = true,
    headers = {},
    revalidateOnFocus = true,
    cacheKey = url,
    cacheTtl,
    skipCache = false,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: enabled,
    error: null,
  });

  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  
  // Memoize headers to prevent infinite loops
  const memoizedHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...headers,
  }), [JSON.stringify(headers)]);

  // Initialize with cached data
  useEffect(() => {
    if (!skipCache && enabled) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        setState({
          data: cachedData,
          isLoading: false,
          error: null,
        });
        return;
      }
    }

    // Only fetch if we're enabled and not already fetching
    if (enabled && !fetchingRef.current) {
      fetchingRef.current = true;
      
      const doFetch = async () => {
        if (!isMountedRef.current) return;
        
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
          const response = await fetch(url, {
            headers: memoizedHeaders,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error?.message || `Error ${response.status}: ${response.statusText}`
            );
          }

          const data = await response.json();
          const result = data.status === 'success' ? data.data : data;

          if (!skipCache) {
            apiCache.set(cacheKey, result, cacheTtl);
          }

          if (isMountedRef.current) {
            setState({
              data: result,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          if (isMountedRef.current) {
            setState({
              data: null,
              isLoading: false,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        } finally {
          fetchingRef.current = false;
        }
      };

      doFetch();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []); // Only run once on mount

  // Function to manually refetch data
  const refetch = useCallback(async () => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(url, {
        headers: memoizedHeaders,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const result = data.status === 'success' ? data.data : data;

      if (!skipCache) {
        apiCache.set(cacheKey, result, cacheTtl);
      }

      if (isMountedRef.current) {
        setState({
          data: result,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [url, cacheKey, cacheTtl, skipCache, memoizedHeaders]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const onFocus = () => {
      refetch();
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [revalidateOnFocus, refetch]);

  return { ...state, refetch };
}
