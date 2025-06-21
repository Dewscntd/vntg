import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/cart/route'
import { createMockCartItem, createMockUser } from '@/tests/utils/test-utils'

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
      single: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
    },
  })),
}))

describe('/api/cart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/cart', () => {
    it('should return user cart items', async () => {
      const mockUser = createMockUser()
      const mockCartItems = [
        createMockCartItem({ id: '1', user_id: mockUser.id }),
        createMockCartItem({ id: '2', user_id: mockUser.id }),
      ]

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: mockCartItems,
        error: null,
      })

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/cart',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.data.items).toHaveLength(2)
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('user_id', mockUser.id)
    })

    it('should return empty cart for new users', async () => {
      const mockUser = createMockUser()
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: [],
        error: null,
      })

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/cart',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.data.items).toHaveLength(0)
      expect(data.data.total).toBe(0)
    })

    it('should require authentication', async () => {
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/cart',
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(401)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle database errors', async () => {
      const mockUser = createMockUser()
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/cart',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(500)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should calculate cart total correctly', async () => {
      const mockUser = createMockUser()
      const mockCartItems = [
        createMockCartItem({ 
          id: '1', 
          user_id: mockUser.id, 
          quantity: 2,
          product: { price: 10.00 }
        }),
        createMockCartItem({ 
          id: '2', 
          user_id: mockUser.id, 
          quantity: 1,
          product: { price: 15.00 }
        }),
      ]

      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: mockCartItems,
        error: null,
      })

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/cart',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })

      await handler.GET(req)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.data.total).toBe(35.00) // (2 * 10.00) + (1 * 15.00)
    })
  })

  describe('DELETE /api/cart', () => {
    it('should clear user cart', async () => {
      const mockUser = createMockUser()
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: null,
      })

      const { req, res } = createMocks({
        method: 'DELETE',
        url: '/api/cart',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })

      await handler.DELETE(req)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.message).toBe('Cart cleared successfully')
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('user_id', mockUser.id)
    })

    it('should require authentication for cart clearing', async () => {
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const { req, res } = createMocks({
        method: 'DELETE',
        url: '/api/cart',
      })

      await handler.DELETE(req)

      expect(res._getStatusCode()).toBe(401)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle deletion errors', async () => {
      const mockUser = createMockUser()
      const mockSupabase = require('@/lib/supabase/server').createServerClient()
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' },
      })

      const { req, res } = createMocks({
        method: 'DELETE',
        url: '/api/cart',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })

      await handler.DELETE(req)

      expect(res._getStatusCode()).toBe(500)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(false)
      expect(data.error).toBe('Deletion failed')
    })
  })
})
