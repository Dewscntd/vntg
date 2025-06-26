import { http, HttpResponse } from 'msw';
import { createMockProduct, createMockUser, createMockOrder } from '../utils/test-utils';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const handlers = [
  // Auth endpoints
  http.post(`${baseURL}/api/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      user: createMockUser(),
      token: 'mock-jwt-token',
    });
  }),

  http.post(`${baseURL}/api/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      user: createMockUser(),
      message: 'User created successfully',
    }, { status: 201 });
  }),

  http.post(`${baseURL}/api/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  http.get(`${baseURL}/api/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      user: createMockUser(),
    });
  }),

  // Products endpoints
  http.get(`${baseURL}/api/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '12';
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let products = Array.from({ length: 20 }, (_, i) =>
      createMockProduct({
        id: `product-${i + 1}`,
        name: `Test Product ${i + 1}`,
        price: 19.99 + i * 5,
      })
    );

    // Apply filters
    if (category) {
      products = products.filter((p) => p.category_id === category);
    }

    if (search) {
      products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
        totalPages: Math.ceil(products.length / limitNum),
      },
    });
  }),

  http.get(`${baseURL}/api/products/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: createMockProduct({ id }),
    });
  }),

  http.post(`${baseURL}/api/products`, () => {
    return HttpResponse.json({
      success: true,
      data: createMockProduct(),
      message: 'Product created successfully',
    }, { status: 201 });
  }),

  // Cart endpoints
  http.get(`${baseURL}/api/cart`, () => {
    return HttpResponse.json({
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
    });
  }),

  http.post(`${baseURL}/api/cart/add`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Item added to cart',
    });
  }),

  http.put(`${baseURL}/api/cart/update`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Cart updated',
    });
  }),

  http.delete(`${baseURL}/api/cart/remove`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  }),

  // Orders endpoints
  http.get(`${baseURL}/api/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        createMockOrder({ id: 'order-1' }),
        createMockOrder({ id: 'order-2', status: 'completed' }),
      ],
    });
  }),

  http.post(`${baseURL}/api/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: createMockOrder(),
      message: 'Order created successfully',
    }, { status: 201 });
  }),

  http.get(`${baseURL}/api/orders/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: createMockOrder({ id }),
    });
  }),

  // Stripe endpoints
  http.post(`${baseURL}/api/stripe/create-payment-intent`, () => {
    return HttpResponse.json({
      success: true,
      client_secret: 'pi_test_client_secret',
      payment_intent_id: 'pi_test_123',
    });
  }),

  http.post(`${baseURL}/api/stripe/webhook`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Webhook processed',
    });
  }),

  // Error handlers
  http.get(`${baseURL}/api/error-test`, () => {
    return HttpResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }),
];
