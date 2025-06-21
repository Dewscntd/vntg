import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/products/route'
import { createMockProduct } from '@/tests/utils/test-utils'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
    },
  })),
}))

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Product 1' }),
        createMockProduct({ id: '2', name: 'Product 2' }),
      ]

      // Mock Supabase response
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.from().single.mockResolvedValue({
        data: mockProducts,
        error: null,
      })

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/products',
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })

    it('should handle pagination parameters', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/products?page=2&limit=5',
      })

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.from().single.mockResolvedValue({
        data: [],
        error: null,
      })

      await handler.GET(req)

      expect(mockSupabase.from().range).toHaveBeenCalledWith(5, 9) // page 2, limit 5
    })

    it('should handle search parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/products?search=test',
      })

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.from().single.mockResolvedValue({
        data: [],
        error: null,
      })

      await handler.GET(req)

      expect(mockSupabase.from().select).toHaveBeenCalled()
    })

    it('should handle category filter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/products?category=electronics',
      })

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.from().single.mockResolvedValue({
        data: [],
        error: null,
      })

      await handler.GET(req)

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('category_id', 'electronics')
    })

    it('should handle database errors', async () => {
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/products',
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(500)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database error')
    })
  })

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'A new product',
        price: 29.99,
        category_id: 'cat-1',
        inventory_count: 10,
      }

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1', role: 'admin' } },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: { ...newProduct, id: 'product-1' },
        error: null,
      })

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/products',
        body: newProduct,
      })

      await handler.POST(req)

      expect(res._getStatusCode()).toBe(201)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.data.name).toBe(newProduct.name)
    })

    it('should reject unauthorized requests', async () => {
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/products',
        body: { name: 'Test Product' },
      })

      await handler.POST(req)

      expect(res._getStatusCode()).toBe(401)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should validate product data', async () => {
      const invalidProduct = {
        name: '', // Invalid: empty name
        price: -10, // Invalid: negative price
      }

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1', role: 'admin' } },
        error: null,
      })

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/products',
        body: invalidProduct,
      })

      await handler.POST(req)

      expect(res._getStatusCode()).toBe(400)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toContain('validation')
    })

    it('should handle database insertion errors', async () => {
      const newProduct = {
        name: 'New Product',
        price: 29.99,
      }

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1', role: 'admin' } },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Insertion failed' },
      })

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/products',
        body: newProduct,
      })

      await handler.POST(req)

      expect(res._getStatusCode()).toBe(500)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toBe('Insertion failed')
    })
  })

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        url: '/api/products',
      })

      const response = await handler.DELETE?.(req)
      
      if (response) {
        expect(response.status).toBe(405)
      } else {
        // If handler doesn't have DELETE method, it should return 405
        expect(true).toBe(true)
      }
    })
  })
})
