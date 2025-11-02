# Test Fixtures

This directory contains comprehensive test data (fixtures) for all entities in the VNTG e-commerce platform.

## Purpose

Fixtures provide consistent, reusable test data for:
- Unit tests
- Integration tests
- E2E tests
- Local database seeding
- Stub/mock implementations
- Development environments

## Structure

```
lib/fixtures/
├── index.ts              # Central export point
├── users.ts              # User fixtures (admin, customers)
├── categories.ts         # Product categories
├── products.ts           # Products with inventory
├── orders.ts             # Orders and order items
├── cart-items.ts         # Shopping cart items
├── addresses.ts          # User addresses
└── payment-intents.ts    # Stripe payment intents
```

## Usage

### Import All Fixtures

```typescript
import { fixtures } from '@/lib/fixtures';

// Access specific entity fixtures
const products = fixtures.products;
const users = fixtures.users;
const adminUser = fixtures.adminUser;
```

### Import Specific Fixtures

```typescript
import {
  adminUser,
  customerUser,
  denimJacket,
  floralDress,
  completedOrder
} from '@/lib/fixtures';
```

### Create Custom Fixtures

```typescript
import { createProductFixture } from '@/lib/fixtures';

const customProduct = createProductFixture({
  name: 'Custom Product',
  price: 99.99,
  inventory_count: 50,
});
```

## Fixture Data

### Users (5 total)
- **Admin User**: `admin@vntg.local` (admin role)
- **Customer User**: `customer@vntg.local` (default test user)
- **Test Users**: Additional customer accounts for testing

**Default Password**: `TestPassword123!`

### Categories (10 total)
- **Parent Categories**: Man, Woman, Teens, Kids, Books & Media, Toys & Games
- **Subcategories**: Shirts, Pants, Dresses, Tops

### Products (16 total)
- Distributed across all categories
- Various inventory levels (in stock, low stock, out of stock)
- Featured and regular products
- Realistic pricing and descriptions

### Orders (5 total)
- **Completed**: Fulfilled orders
- **Processing**: Orders being prepared
- **Pending**: Awaiting payment
- **Cancelled**: Cancelled orders

### Cart Items (4 total)
- Active cart items for test users
- Various quantities and products

### Addresses (5 total)
- Multiple addresses per user
- Default and secondary addresses
- Domestic and international addresses

### Payment Intents (5 total)
- Various Stripe payment states
- Succeeded, processing, failed, and cancelled

## ID Conventions

All fixtures use predictable UUID prefixes for easy identification:

- Users: `00000000-0000-0000-0000-00000000000X`
- Categories: `10000000-0000-0000-0000-00000000000X`
- Products: `20000000-0000-0000-0000-00000000000X`
- Orders: `30000000-0000-0000-0000-00000000000X`
- Order Items: `31000000-0000-0000-0000-00000000000X`
- Cart Items: `40000000-0000-0000-0000-00000000000X`
- Addresses: `50000000-0000-0000-0000-00000000000X`
- Payment Intents: `60000000-0000-0000-0000-00000000000X`

This makes it easy to:
- Identify test data in logs
- Write tests that reference specific entities
- Clean up test data after tests

## Best Practices

### Do's
- Use fixtures for consistent test data
- Import from central `fixtures` object for better discoverability
- Create custom fixtures using helper functions
- Document any new fixtures added

### Don'ts
- Don't hardcode test data in tests
- Don't modify fixture files directly in tests (use helpers)
- Don't use production data as fixtures
- Don't create fixtures with random IDs (use predictable ones)

## Examples

### Using Fixtures in Tests

```typescript
import { adminUser, denimJacket, completedOrder } from '@/lib/fixtures';

describe('Order Management', () => {
  it('should display order details', () => {
    // Use fixture data
    expect(completedOrder.status).toBe('completed');
    expect(completedOrder.user_id).toBe(adminUser.id);
  });
});
```

### Using Fixtures in Stubs

```typescript
import { productFixtures } from '@/lib/fixtures';

export const mockProductsAPI = {
  getProducts: () => Promise.resolve(productFixtures),
  getProduct: (id: string) =>
    Promise.resolve(productFixtures.find(p => p.id === id)),
};
```

### Creating Dynamic Test Data

```typescript
import { createOrderFixture, customerUser } from '@/lib/fixtures';

const testOrder = createOrderFixture({
  user_id: customerUser.id,
  status: 'pending',
  total: 299.99,
});
```

## Seeding Database

Fixtures are also used to seed the local database. See:
- `supabase/seed.sql` - SQL seed file (auto-generated from fixtures)
- `scripts/seed.js` - Seed script for remote databases

## Maintenance

When adding new entities or fields:
1. Update corresponding fixture file
2. Update `index.ts` exports
3. Update `supabase/seed.sql` if needed
4. Update this README

## Related Files

- `/lib/stubs/` - Runtime stubs/mocks using these fixtures
- `/supabase/seed.sql` - Database seed data
- `/__tests__/` - Tests using these fixtures
