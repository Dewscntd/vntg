// Cache service for performance optimization

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size
  strategy: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 300, strategy: 'lru' }) {
    this.config = config;
    
    // Clean up expired items periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  // Set cache item
  set<T>(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    // Check if we need to evict items
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, item);
  }

  // Get cache item
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.value;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize?: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const size = this.cache.size;
    const totalAccess = Array.from(this.cache.values()).reduce(
      (sum, item) => sum + item.accessCount, 0
    );
    
    // Estimate memory usage (rough calculation)
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;

    return {
      size,
      maxSize: this.config.maxSize,
      hitRate: totalAccess > 0 ? (size / totalAccess) * 100 : 0,
      memoryUsage,
    };
  }

  // Check if item is expired
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl * 1000;
  }

  // Evict items based on strategy
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lru': // Least Recently Used
        keyToEvict = this.findLRUKey();
        break;
      case 'lfu': // Least Frequently Used
        keyToEvict = this.findLFUKey();
        break;
      case 'fifo': // First In, First Out
      default:
        keyToEvict = this.findFIFOKey();
        break;
    }

    this.cache.delete(keyToEvict);
  }

  private findLRUKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFUKey(): string {
    let leastUsedKey = '';
    let leastCount = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < leastCount) {
        leastCount = item.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private findFIFOKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }
}

// Create cache instances for different use cases
export const productCache = new CacheService({
  ttl: 600, // 10 minutes
  maxSize: 1000,
  strategy: 'lru',
});

export const userCache = new CacheService({
  ttl: 300, // 5 minutes
  maxSize: 500,
  strategy: 'lru',
});

export const analyticsCache = new CacheService({
  ttl: 1800, // 30 minutes
  maxSize: 100,
  strategy: 'lfu',
});

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  cache: CacheService,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // Try to get from cache
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// Async cache decorator
export function cachedAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cache: CacheService,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // Try to get from cache
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// Cache warming utilities
export class CacheWarmer {
  private cache: CacheService;
  private warmupTasks: Array<() => Promise<void>> = [];

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  // Add warmup task
  addTask(task: () => Promise<void>): void {
    this.warmupTasks.push(task);
  }

  // Execute all warmup tasks
  async warmup(): Promise<void> {
    console.log(`Starting cache warmup with ${this.warmupTasks.length} tasks...`);
    
    const startTime = Date.now();
    
    await Promise.all(
      this.warmupTasks.map(async (task, index) => {
        try {
          await task();
          console.log(`Warmup task ${index + 1} completed`);
        } catch (error) {
          console.error(`Warmup task ${index + 1} failed:`, error);
        }
      })
    );
    
    const duration = Date.now() - startTime;
    console.log(`Cache warmup completed in ${duration}ms`);
  }
}

// Utility functions
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export function invalidatePattern(cache: CacheService, pattern: string): void {
  const regex = new RegExp(pattern);
  
  for (const key of (cache as any).cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

// Cache middleware for API routes
export function withCache(
  cache: CacheService,
  ttl?: number,
  keyGenerator?: (req: Request) => string
) {
  return function (handler: Function) {
    return async function (req: Request, ...args: any[]) {
      const key = keyGenerator ? keyGenerator(req) : req.url;
      
      // Try cache first
      const cached = cache.get(key);
      if (cached) {
        return new Response(JSON.stringify(cached), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Execute handler
      const response = await handler(req, ...args);
      
      // Cache successful responses
      if (response.ok) {
        const data = await response.json();
        cache.set(key, data, ttl);
        
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return response;
    };
  };
}
