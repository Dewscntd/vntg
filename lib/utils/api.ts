/**
 * API Utilities
 * Helper functions for making API calls with proper locale routing
 */

/**
 * Get the current locale from the URL or default to 'he'
 * This works both client-side and server-side
 */
export function getCurrentLocale(): string {
  if (typeof window !== 'undefined') {
    // Client-side: get from URL pathname
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(en|he)\//);
    return localeMatch ? localeMatch[1] : 'he';
  }
  // Server-side: default to 'he'
  return 'he';
}

/**
 * Build an API URL with the correct locale prefix
 * @param path - API path starting with /api/
 * @returns Full API URL with locale prefix
 * 
 * @example
 * apiUrl('/api/products') // Returns '/he/api/products' or '/en/api/products'
 */
export function apiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Ensure path starts with 'api/'
  const apiPath = cleanPath.startsWith('api/') ? cleanPath : `api/${cleanPath}`;
  
  const locale = getCurrentLocale();
  return `/${locale}/${apiPath}`;
}

/**
 * Make a typed fetch request to an API endpoint
 * Automatically adds locale prefix and handles common errors
 * 
 * @example
 * const data = await apiFetch<Category[]>('/api/categories');
 */
export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = apiUrl(path);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}
