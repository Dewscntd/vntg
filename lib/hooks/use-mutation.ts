'use client';

import { useState } from 'react';

export type MutationState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export type MutationOptions = {
  headers?: HeadersInit;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
};

/**
 * Custom hook for mutation operations (create, update, delete)
 * @param url The URL to send the request to
 * @param method The HTTP method to use
 * @param options Options for the mutation
 * @returns The mutation state and a mutate function
 */
export function useMutation<T = any, D = any>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: MutationOptions = {}
): [
  (data?: D) => Promise<T | null>,
  MutationState<T>
] {
  const { headers = {}, onSuccess, onError } = options;
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  async function mutate(data?: D): Promise<T | null> {
    setState({ data: null, isLoading: true, error: null });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const responseData = await response.json();
      const result = responseData.status === 'success' ? responseData.data : responseData;
      
      setState({
        data: result,
        isLoading: false,
        error: null,
      });

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState({
        data: null,
        isLoading: false,
        error: errorObj,
      });

      if (onError) {
        onError(errorObj);
      }

      return null;
    }
  }

  return [mutate, state];
}

/**
 * Custom hook for creating data
 */
export function useCreate<T = any, D = any>(
  url: string,
  options: MutationOptions = {}
) {
  return useMutation<T, D>(url, 'POST', options);
}

/**
 * Custom hook for updating data
 */
export function useUpdate<T = any, D = any>(
  url: string,
  options: MutationOptions = {}
) {
  return useMutation<T, D>(url, 'PUT', options);
}

/**
 * Custom hook for deleting data
 */
export function useDelete<T = any, D = any>(
  url: string,
  options: MutationOptions = {}
) {
  return useMutation<T, D>(url, 'DELETE', options);
}
