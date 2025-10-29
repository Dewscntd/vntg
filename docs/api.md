# API Documentation

This document provides comprehensive documentation for all API endpoints in the Peakees e-commerce platform.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

Most endpoints require authentication using Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Products API

### GET /api/products

Retrieve a list of products with optional filtering and pagination.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 100)
- `category` (string): Filter by category slug
- `search` (string): Search in product name and description
- `sort` (string): Sort order (`name`, `price`, `created_at`, `popularity`)
- `order` (string): Sort direction (`asc`, `desc`)
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `in_stock` (boolean): Filter by stock availability

**Example Request:**

```bash
GET /api/products?page=1&limit=12&category=electronics&sort=price&order=asc
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones",
        "price": 99.99,
        "sale_price": 79.99,
        "images": [
          {
            "url": "https://example.com/image1.jpg",
            "alt": "Product image"
          }
        ],
        "category": {
          "id": "cat_123",
          "name": "Electronics",
          "slug": "electronics"
        },
        "inventory_count": 50,
        "is_published": true,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 100,
      "pages": 9
    }
  }
}
```

### GET /api/products/[id]

Retrieve a single product by ID.

**Parameters:**

- `id` (string): Product ID

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 99.99,
    "sale_price": 79.99,
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "alt": "Product image"
      }
    ],
    "category": {
      "id": "cat_123",
      "name": "Electronics",
      "slug": "electronics"
    },
    "inventory_count": 50,
    "is_published": true,
    "specifications": {
      "color": "Black",
      "weight": "250g",
      "battery_life": "30 hours"
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/products (Admin Only)

Create a new product.

**Authentication Required**: Admin role

**Request Body:**

```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "sale_price": 79.99,
  "category_id": "cat_123",
  "inventory_count": 100,
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "Product image"
    }
  ],
  "specifications": {
    "color": "Blue",
    "size": "Large"
  },
  "is_published": true
}
```

## Categories API

### GET /api/categories

Retrieve all product categories.

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories",
      "image_url": "https://example.com/category.jpg",
      "product_count": 150,
      "is_published": true
    }
  ]
}
```

## Cart API

### GET /api/cart

Retrieve the current user's cart.

**Authentication Required**: Yes

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "cart_123",
    "user_id": "user_123",
    "items": [
      {
        "id": "item_123",
        "product_id": "prod_123",
        "quantity": 2,
        "product": {
          "id": "prod_123",
          "name": "Wireless Headphones",
          "price": 99.99,
          "sale_price": 79.99,
          "images": [
            {
              "url": "https://example.com/image.jpg",
              "alt": "Product image"
            }
          ]
        }
      }
    ],
    "subtotal": 159.98,
    "tax": 12.8,
    "total": 172.78,
    "item_count": 2,
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/cart/add

Add an item to the cart.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "product_id": "prod_123",
  "quantity": 1
}
```

### PUT /api/cart/update

Update cart item quantity.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "item_id": "item_123",
  "quantity": 3
}
```

### DELETE /api/cart/remove

Remove an item from the cart.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "item_id": "item_123"
}
```

## Checkout API

### POST /api/checkout/payment-intent

Create a Stripe payment intent for checkout.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "amount": 17278,
  "currency": "usd"
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "payment_intent_id": "pi_123",
    "client_secret": "pi_123_secret_abc",
    "amount": 17278,
    "currency": "usd"
  }
}
```

### POST /api/checkout/create-order

Create an order after successful payment.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "payment_intent_id": "pi_123",
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "12345",
    "country": "US"
  },
  "shipping_method": "standard"
}
```

## Orders API

### GET /api/orders

Retrieve user's orders.

**Authentication Required**: Yes

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by order status

**Example Response:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "order_number": "ORD-2024-001",
        "status": "completed",
        "total": 172.78,
        "currency": "usd",
        "items": [
          {
            "product_name": "Wireless Headphones",
            "quantity": 2,
            "price": 79.99
          }
        ],
        "shipping_address": {
          "first_name": "John",
          "last_name": "Doe",
          "address": "123 Main St",
          "city": "Anytown",
          "state": "CA",
          "zip_code": "12345"
        },
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### GET /api/orders/[id]

Retrieve a specific order.

**Authentication Required**: Yes

**Parameters:**

- `id` (string): Order ID

## Webhooks

### POST /api/webhooks/stripe

Stripe webhook endpoint for payment events.

**Headers:**

- `stripe-signature`: Stripe webhook signature

**Events Handled:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.dispute.created`

## Health Check

### GET /api/health

System health check endpoint.

**Example Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "response_time": 45,
  "checks": {
    "database": {
      "status": "healthy",
      "response_time": 12
    },
    "stripe": {
      "status": "healthy",
      "response_time": 23
    }
  }
}
```

## Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 400  | Bad Request - Invalid input data        |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource not found          |
| 409  | Conflict - Resource already exists      |
| 422  | Unprocessable Entity - Validation error |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error    |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 10 requests per minute
- **Cart endpoints**: 60 requests per minute
- **Product endpoints**: 100 requests per minute
- **Order endpoints**: 30 requests per minute
- **Checkout endpoints**: 20 requests per minute

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Time when window resets
