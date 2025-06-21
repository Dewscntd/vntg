'use client';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

type CacheOptions = {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries in the cache
};

/**
 * Simple in-memory cache for API responses
 */
class Cache {
  private cache: Map<string, CacheEntry<any>>;
  private ttl: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000; // Default: 5 minutes
    this.maxSize = options.maxSize || 100; // Default: 100 entries
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set a value in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttl Optional custom TTL for this entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Enforce max size by removing the oldest entry if needed
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + (ttl || this.ttl);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
    });
  }

  /**
   * Remove a value from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the key of the oldest entry in the cache
   * @returns The key of the oldest entry or undefined if the cache is empty
   */
  private getOldestKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

// Create a singleton instance
export const apiCache = new Cache();

/**
 * Wrap a fetch function with caching
 * @param fetchFn The fetch function to wrap
 * @param cacheKey The cache key
 * @param ttl Optional custom TTL for this entry
 * @returns The result of the fetch function, either from cache or from the API
 */
export async function withCache<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cachedData = apiCache.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // If not in cache, fetch the data
  const data = await fetchFn();
  
  // Cache the result
  apiCache.set(cacheKey, data, ttl);
  
  return data;
}
