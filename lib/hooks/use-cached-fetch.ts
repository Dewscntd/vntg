'use client';

import { useState, useEffect } from 'react';
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

  // Try to get initial data from cache
  useEffect(() => {
    if (!skipCache && enabled) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        setState({
          data: cachedData,
          isLoading: false,
          error: null,
        });
      }
    }
  }, [cacheKey, skipCache, enabled]);

  async function fetchData() {
    if (!enabled) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const fetchFunction = async () => {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || `Error ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        return data.status === 'success' ? data.data : data;
      };

      let result: T;

      if (skipCache) {
        result = await fetchFunction();
        // Still cache the result for future use
        apiCache.set(cacheKey, result, cacheTtl);
      } else {
        result = await withCache<T>(fetchFunction, cacheKey, cacheTtl);
      }

      setState({
        data: result,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [url, enabled]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const onFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [revalidateOnFocus, url]);

  // Function to manually refetch data
  async function refetch() {
    await fetchData();
  }

  return { ...state, refetch };
}
