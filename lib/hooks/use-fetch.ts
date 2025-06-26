'use client';

import { useState, useEffect } from 'react';

export type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export type UseFetchOptions = {
  enabled?: boolean;
  headers?: HeadersInit;
  revalidateOnFocus?: boolean;
};

/**
 * Custom hook for fetching data from an API endpoint
 * @param url The URL to fetch data from
 * @param options Options for the fetch request
 * @returns The fetch state (data, isLoading, error)
 */
export function useFetch<T = any>(url: string, options: UseFetchOptions = {}): FetchState<T> {
  const { enabled = true, headers = {}, revalidateOnFocus = true } = options;
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: enabled,
    error: null,
  });

  async function fetchData() {
    if (!enabled) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
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
      setState({
        data: data.status === 'success' ? data.data : data,
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

  return state;
}
