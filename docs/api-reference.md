# API Reference Documentation

## Overview

The Peakees API provides RESTful endpoints for managing products, cart operations, user authentication, and order processing. All endpoints follow consistent patterns and return JSON responses.

## 🔐 Authentication

### Authentication Methods

- **JWT Tokens** - Supabase Auth JWT tokens in Authorization header
- **Session Cookies** - httpOnly cookies for web clients
- **API Keys** - Service-to-service authentication

### Authorization Header

```http
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /api/auth/login

Authenticate user with email and password.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_at": 1234567890
    }
  }
}
```

#### POST /api/auth/register

Register new user account.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST /api/auth/logout

Logout current user session.

```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

## 🛍️ Products API

### GET /api/products

Retrieve products with filtering and pagination.

```http
GET /api/products?search=query&category=id&sort=price&order=asc&page=1&limit=12
```

**Query Parameters:**

- `search` (string) - Search query for product name/description
- `category` (string) - Category ID filter
- `sort` (string) - Sort field: `name`, `price`, `created_at`, `updated_at`
- `order` (string) - Sort order: `asc`, `desc`
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 12, max: 100)
- `featured` (boolean) - Filter featured products
- `new` (boolean) - Filter new products
- `sale` (boolean) - Filter sale products

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "description": "Product description",
        "price": 99.99,
        "discount_percent": 10,
        "image_url": "https://example.com/image.jpg",
        "inventory_count": 50,
        "is_featured": true,
        "is_new": false,
        "category": {
          "id": "uuid",
          "name": "Category Name"
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 100,
      "totalPages": 9,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /api/products/[id]

Retrieve single product by ID.

```http
GET /api/products/uuid
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Detailed product description",
    "price": 99.99,
    "discount_percent": 10,
    "image_url": "https://example.com/image.jpg",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "inventory_count": 50,
    "is_featured": true,
    "is_new": false,
    "specifications": {
      "weight": "1.5kg",
      "dimensions": "30x20x10cm",
      "material": "Cotton"
    },
    "category": {
      "id": "uuid",
      "name": "Category Name",
      "slug": "category-name"
    },
    "related_products": [
      {
        "id": "uuid",
        "name": "Related Product",
        "price": 79.99,
        "image_url": "https://example.com/related.jpg"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/products (Admin Only)

Create new product.

```http
POST /api/products
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category_id": "uuid",
  "inventory_count": 100,
  "is_featured": false,
  "specifications": {
    "weight": "1kg"
  }
}
```

### PUT /api/products/[id] (Admin Only)

Update existing product.

```http
PUT /api/products/uuid
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 89.99,
  "inventory_count": 75
}
```

### DELETE /api/products/[id] (Admin Only)

Delete product.

```http
DELETE /api/products/uuid
Authorization: Bearer <admin_jwt_token>
```

## 🛒 Cart API

### GET /api/cart

Retrieve user's cart items.

```http
GET /api/cart
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "quantity": 2,
        "product": {
          "id": "uuid",
          "name": "Product Name",
          "price": 99.99,
          "discount_percent": 10,
          "image_url": "https://example.com/image.jpg",
          "inventory_count": 50
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 179.98,
    "itemCount": 2,
    "subtotal": 199.98,
    "discount": 19.98
  }
}
```

### POST /api/cart/add

Add item to cart.

```http
POST /api/cart/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "quantity": 1,
    "message": "Item added to cart"
  }
}
```

### PUT /api/cart/update

Update cart item quantity.

```http
PUT /api/cart/update
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "id": "cart_item_uuid",
  "quantity": 3
}
```

### DELETE /api/cart/remove

Remove item from cart.

```http
DELETE /api/cart/remove
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "id": "cart_item_uuid"
}
```

### POST /api/cart/sync

Sync cart data (for cross-device synchronization).

```http
POST /api/cart/sync
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ]
}
```

### DELETE /api/cart/clear

Clear all items from cart.

```http
DELETE /api/cart/clear
Authorization: Bearer <jwt_token>
```

## 📂 Categories API

### GET /api/categories

Retrieve all product categories.

```http
GET /api/categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic products",
      "image_url": "https://example.com/category.jpg",
      "product_count": 150,
      "parent_id": null,
      "children": [
        {
          "id": "uuid",
          "name": "Smartphones",
          "slug": "smartphones",
          "product_count": 50
        }
      ]
    }
  ]
}
```

### GET /api/categories/[id]

Retrieve single category with products.

```http
GET /api/categories/uuid?page=1&limit=12
```

**Response:**

```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Electronics",
      "description": "Electronic products",
      "image_url": "https://example.com/category.jpg"
    },
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "price": 99.99,
        "image_url": "https://example.com/product.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

## 🔍 Search API

### GET /api/search

Search products with advanced filtering.

```http
GET /api/search?q=query&category=id&min_price=10&max_price=100
```

**Query Parameters:**

- `q` (string) - Search query
- `category` (string) - Category filter
- `min_price` (number) - Minimum price filter
- `max_price` (number) - Maximum price filter
- `sort` (string) - Sort field
- `order` (string) - Sort order

### GET /api/search/suggestions

Get search suggestions for autocomplete.

```http
GET /api/search/suggestions?q=partial_query&limit=5
```

**Response:**

```json
{
  "success": true,
  "data": {
    "suggestions": ["iPhone 15", "iPhone 14", "iPhone case"],
    "products": [
      {
        "id": "uuid",
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "image_url": "https://example.com/iphone.jpg"
      }
    ]
  }
}
```

## 📊 Analytics API

### POST /api/analytics/events

Track custom analytics events.

```http
POST /api/analytics/events
Content-Type: application/json

{
  "event": "product_view",
  "data": {
    "product_id": "uuid",
    "category": "electronics",
    "price": 99.99
  },
  "timestamp": 1234567890,
  "session_id": "session_uuid",
  "user_id": "user_uuid"
}
```

### POST /api/analytics/cart-abandonment

Track cart abandonment events.

```http
POST /api/analytics/cart-abandonment
Content-Type: application/json

{
  "event_id": "abandon_uuid",
  "timestamp": 1234567890,
  "total": 199.98,
  "item_count": 3,
  "user_id": "user_uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 99.99
    }
  ]
}
```

## 🔔 Webhooks

### POST /api/webhooks/stripe

Handle Stripe webhook events.

```http
POST /api/webhooks/stripe
Stripe-Signature: signature_header
Content-Type: application/json

{
  "id": "evt_uuid",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_uuid",
      "payment_status": "paid",
      "customer_email": "user@example.com"
    }
  }
}
```

## 📝 Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_REQUIRED` - User must be authenticated
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `DUPLICATE_RESOURCE` - Resource already exists
- `INVENTORY_INSUFFICIENT` - Not enough stock available
- `RATE_LIMIT_EXCEEDED` - Too many requests

## 🔒 Rate Limiting

### Rate Limits

- **Anonymous users**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour
- **Admin users**: 5000 requests per hour

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## 📋 Request/Response Examples

### Successful Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "req_uuid"
  }
}
```

## 🧪 Testing

### API Testing

Use the provided test utilities for API testing:

```typescript
// Test helper
import { createTestClient } from '@/lib/test-utils';

const client = createTestClient();

test('should fetch products', async () => {
  const response = await client.get('/api/products');
  expect(response.status).toBe(200);
  expect(response.data.success).toBe(true);
});
```

### Mock Data

Mock data is available for testing:

```typescript
import { mockProducts, mockUser } from '@/lib/test-data';

// Use in tests
const product = mockProducts[0];
const user = mockUser();
```

---

This API reference provides comprehensive documentation for all available endpoints in the Peakees e-commerce platform. For implementation examples, see the respective feature documentation.
