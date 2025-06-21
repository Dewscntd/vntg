import { apiCache, withCache } from '@/lib/utils/cache'

describe('Cache', () => {
  beforeEach(() => {
    apiCache.clear()
  })

  describe('apiCache', () => {
    it('should store and retrieve values', () => {
      const testData = { id: 1, name: 'Test' }
      apiCache.set('test-key', testData)
      
      const retrieved = apiCache.get('test-key')
      expect(retrieved).toEqual(testData)
    })

    it('should return undefined for non-existent keys', () => {
      const result = apiCache.get('non-existent-key')
      expect(result).toBeUndefined()
    })

    it('should handle expiration', async () => {
      const testData = { id: 1, name: 'Test' }
      apiCache.set('test-key', testData, 10) // 10ms TTL
      
      // Should be available immediately
      expect(apiCache.get('test-key')).toEqual(testData)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 15))
      
      // Should be expired
      expect(apiCache.get('test-key')).toBeUndefined()
    })

    it('should delete values', () => {
      const testData = { id: 1, name: 'Test' }
      apiCache.set('test-key', testData)
      
      expect(apiCache.get('test-key')).toEqual(testData)
      
      apiCache.delete('test-key')
      expect(apiCache.get('test-key')).toBeUndefined()
    })

    it('should clear all values', () => {
      apiCache.set('key1', 'value1')
      apiCache.set('key2', 'value2')
      
      expect(apiCache.get('key1')).toBe('value1')
      expect(apiCache.get('key2')).toBe('value2')
      
      apiCache.clear()
      
      expect(apiCache.get('key1')).toBeUndefined()
      expect(apiCache.get('key2')).toBeUndefined()
    })

    it('should handle custom TTL per entry', async () => {
      apiCache.set('short-ttl', 'data1', 10) // 10ms
      apiCache.set('long-ttl', 'data2', 100) // 100ms
      
      // Both should be available initially
      expect(apiCache.get('short-ttl')).toBe('data1')
      expect(apiCache.get('long-ttl')).toBe('data2')
      
      // Wait for short TTL to expire
      await new Promise(resolve => setTimeout(resolve, 15))
      
      expect(apiCache.get('short-ttl')).toBeUndefined()
      expect(apiCache.get('long-ttl')).toBe('data2')
    })
  })

  describe('withCache', () => {
    it('should cache function results', async () => {
      let callCount = 0
      const fetchFn = jest.fn(async () => {
        callCount++
        return { data: 'test-data', call: callCount }
      })

      // First call should execute the function
      const result1 = await withCache(fetchFn, 'test-cache-key')
      expect(result1).toEqual({ data: 'test-data', call: 1 })
      expect(fetchFn).toHaveBeenCalledTimes(1)

      // Second call should return cached result
      const result2 = await withCache(fetchFn, 'test-cache-key')
      expect(result2).toEqual({ data: 'test-data', call: 1 })
      expect(fetchFn).toHaveBeenCalledTimes(1) // Still only called once
    })

    it('should handle different cache keys', async () => {
      const fetchFn1 = jest.fn(async () => ({ data: 'data1' }))
      const fetchFn2 = jest.fn(async () => ({ data: 'data2' }))

      const result1 = await withCache(fetchFn1, 'key1')
      const result2 = await withCache(fetchFn2, 'key2')

      expect(result1).toEqual({ data: 'data1' })
      expect(result2).toEqual({ data: 'data2' })
      expect(fetchFn1).toHaveBeenCalledTimes(1)
      expect(fetchFn2).toHaveBeenCalledTimes(1)
    })

    it('should handle function errors', async () => {
      const fetchFn = jest.fn(async () => {
        throw new Error('Fetch failed')
      })

      await expect(withCache(fetchFn, 'error-key')).rejects.toThrow('Fetch failed')
      expect(fetchFn).toHaveBeenCalledTimes(1)

      // Should not cache errors - second call should try again
      await expect(withCache(fetchFn, 'error-key')).rejects.toThrow('Fetch failed')
      expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('should respect custom TTL', async () => {
      let callCount = 0
      const fetchFn = jest.fn(async () => {
        callCount++
        return { call: callCount }
      })

      // First call with short TTL
      const result1 = await withCache(fetchFn, 'ttl-key', 10) // 10ms
      expect(result1).toEqual({ call: 1 })

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 15))

      // Second call should execute function again
      const result2 = await withCache(fetchFn, 'ttl-key', 10)
      expect(result2).toEqual({ call: 2 })
      expect(fetchFn).toHaveBeenCalledTimes(2)
    })
  })
})
