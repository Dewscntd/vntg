import { rest } from 'msw'
import { createMockProduct, createMockUser, createMockOrder } from '../utils/test-utils'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const handlers = [
  // Auth endpoints
  rest.post(`${baseURL}/api/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: createMockUser(),
        token: 'mock-jwt-token',
      })
    )
  }),

  rest.post(`${baseURL}/api/auth/register`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        user: createMockUser(),
        message: 'User created successfully',
      })
    )
  }),

  rest.post(`${baseURL}/api/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully',
      })
    )
  }),

  rest.get(`${baseURL}/api/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Unauthorized',
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: createMockUser(),
      })
    )
  }),

  // Products endpoints
  rest.get(`${baseURL}/api/products`, (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1'
    const limit = req.url.searchParams.get('limit') || '12'
    const category = req.url.searchParams.get('category')
    const search = req.url.searchParams.get('search')

    let products = Array.from({ length: 20 }, (_, i) =>
      createMockProduct({
        id: `product-${i + 1}`,
        name: `Test Product ${i + 1}`,
        price: 19.99 + i * 5,
      })
    )

    // Apply filters
    if (category) {
      products = products.filter(p => p.category_id === category)
    }

    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedProducts = products.slice(startIndex, endIndex)

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: products.length,
          totalPages: Math.ceil(products.length / limitNum),
        },
      })
    )
  }),

  rest.get(`${baseURL}/api/products/:id`, (req, res, ctx) => {
    const { id } = req.params

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: createMockProduct({ id }),
      })
    )
  }),

  rest.post(`${baseURL}/api/products`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: createMockProduct(),
        message: 'Product created successfully',
      })
    )
  }),

  // Cart endpoints
  rest.get(`${baseURL}/api/cart`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          items: [
            {
              id: 'cart-item-1',
              product_id: 'product-1',
              quantity: 2,
              product: createMockProduct({ id: 'product-1' }),
            },
          ],
          total: 59.98,
        },
      })
    )
  }),

  rest.post(`${baseURL}/api/cart/add`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Item added to cart',
      })
    )
  }),

  rest.put(`${baseURL}/api/cart/update`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Cart updated',
      })
    )
  }),

  rest.delete(`${baseURL}/api/cart/remove`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Item removed from cart',
      })
    )
  }),

  // Orders endpoints
  rest.get(`${baseURL}/api/orders`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          createMockOrder({ id: 'order-1' }),
          createMockOrder({ id: 'order-2', status: 'completed' }),
        ],
      })
    )
  }),

  rest.post(`${baseURL}/api/orders`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: createMockOrder(),
        message: 'Order created successfully',
      })
    )
  }),

  rest.get(`${baseURL}/api/orders/:id`, (req, res, ctx) => {
    const { id } = req.params

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: createMockOrder({ id }),
      })
    )
  }),

  // Stripe endpoints
  rest.post(`${baseURL}/api/stripe/create-payment-intent`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        client_secret: 'pi_test_client_secret',
        payment_intent_id: 'pi_test_123',
      })
    )
  }),

  rest.post(`${baseURL}/api/stripe/webhook`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Webhook processed',
      })
    )
  }),

  // Error handlers
  rest.get(`${baseURL}/api/error-test`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal server error',
      })
    )
  }),
]
