# Development Stubs

This directory contains stub implementations for external services to enable local development without requiring real API keys or internet connectivity.

## Quick Start

Add this to your `.env.local` file:

```env
NEXT_PUBLIC_USE_STUBS=true
```

## What's Stubbed

### Supabase
- Authentication (sign in, sign up, session management)
- Database operations (CRUD operations on all tables)
- Storage operations (file upload/download)

### Stripe
- Payment intent creation and confirmation
- Customer management
- Product and price management
- Webhook events

## Features

- **Realistic Delays**: All operations include simulated network delays
- **Consistent Data**: Mock data matches your database schema
- **Error Simulation**: Some operations can simulate errors for testing
- **Console Logging**: All stub operations log to console for debugging

## Available Mock Data

- **Products**: 3 sample products across different categories
- **Users**: Regular user and admin user
- **Categories**: Electronics, Clothing, Home & Garden
- **Cart Items**: Sample cart with 2 items
- **Orders**: Sample pending order

## Usage

Once enabled, all your existing code will work with mock data:

```typescript
// This will use mock data when stubs are enabled
const supabase = createClient();
const { data: products } = await supabase
  .from('products')
  .select('*')
  .limit(10);

// Stripe operations also work with mocks
const stripe = await getStripe();
const result = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: '/success' }
});
```

## Customization

You can modify the mock data in `mock-data.ts` or extend the stub implementations in `supabase-stub.ts` and `stripe-stub.ts`.

## Debugging

When stubs are enabled, you'll see console logs like:
- "Mock Stripe Element card mounted to #card-element"
- Database operations will show realistic delays
- All operations return predictable mock data

## Disabling Stubs

Remove or set to false in `.env.local`:

```env
NEXT_PUBLIC_USE_STUBS=false
```

Your app will immediately switch back to real API calls.