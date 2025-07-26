# VNTG API Reference

Quick reference guide for the VNTG e-commerce platform API endpoints.

## 🌐 Base URL

```
Production: https://peakees.vercel.app/api
Development: http://localhost:3000/api
```

## 🔐 Authentication

Most endpoints require session-based authentication. Admin endpoints require admin role.

## 📦 Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | List products | No |
| GET | `/products/{id}` | Get product details | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/{id}` | Update product | Admin |
| DELETE | `/products/{id}` | Delete product | Admin |

## 🏷️ Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | List categories | No |
| GET | `/categories/{id}` | Get category with products | No |
| POST | `/categories` | Create category | Admin |

## 🛒 Cart

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get cart items | Yes |
| POST | `/cart/add` | Add item to cart | Yes |
| PUT | `/cart/update` | Update cart item | Yes |
| POST | `/cart/remove` | Remove item from cart | Yes |

## 💳 Checkout

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/checkout/payment-intent` | Create payment intent | Yes |
| POST | `/checkout/create-order` | Create order after payment | Yes |

## 📋 Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | List orders | Yes |
| GET | `/orders/{id}` | Get order details | Yes |
| PUT | `/orders/{id}` | Update order status | Admin |
| POST | `/orders/{id}/cancel` | Cancel order | Yes |

## 👤 User

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update user profile | Yes |
| GET | `/user/addresses` | Get user addresses | Yes |
| POST | `/user/addresses` | Add user address | Yes |

## 📊 Analytics (Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/events` | Get analytics events | Admin |
| GET | `/analytics/metrics` | Get analytics metrics | Admin |
| POST | `/analytics/events` | Track analytics event | No |

## 🔍 Common Query Parameters

### Products
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `category` - Filter by category ID
- `search` - Search query
- `sort` - Sort field (name, price, created_at)
- `order` - Sort order (asc, desc)
- `featured` - Filter featured products

### Orders
- `status` - Filter by order status
- `customer_email` - Filter by customer email
- `date_from` - Start date filter
- `date_to` - End date filter

## 📝 Example Requests

### Add Product to Cart
```bash
curl -X POST https://peakees.vercel.app/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"product_id": "uuid", "quantity": 1}'
```

### Create Payment Intent
```bash
curl -X POST https://peakees.vercel.app/api/checkout/payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 2999, "currency": "usd"}'
```

### Get Products
```bash
curl "https://peakees.vercel.app/api/products?page=1&limit=12&featured=true"
```

## ❌ Error Responses

All API errors return JSON in this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## 🔄 Rate Limits

- Public endpoints: 100 requests/minute
- Authenticated: 300 requests/minute  
- Admin endpoints: 1000 requests/minute

---

For detailed documentation with full request/response examples, see the complete API documentation.