# API-Stub Synchronization System

This system ensures that your stub data stays synchronized with your real API responses, providing reliable local development and E2E testing.

## 🎯 Overview

The API-Stub sync system provides:

- **Schema Validation**: Ensures stub data matches real API response structures
- **Automated Sync**: Automatically detects and fixes API-stub mismatches
- **E2E Test Integration**: Validates that tests work identically with stubs and real APIs
- **CI/CD Integration**: Prevents deployment of inconsistent stubs

## 🚀 Quick Start

### 1. Validate Current Stubs

```bash
# Validate stub data schemas
npm run validate:stubs

# Test API endpoints with schema validation
npm run validate:api-schema
```

### 2. Sync Stubs with Real API

```bash
# Set environment to use real API
echo "NEXT_PUBLIC_USE_STUBS=false" > .env.local

# Start your server
npm run dev

# In another terminal, run sync validation
npm run sync:api-stubs
```

### 3. Run E2E Tests with Stubs

```bash
# Switch back to stub mode
echo "NEXT_PUBLIC_USE_STUBS=true" > .env.local

# Run stub-specific E2E tests
npm run test:e2e:stubs
```

## 📁 System Components

### Scripts

- **`scripts/sync-api-stubs.js`**: Main sync validation script
- **`scripts/pre-commit-validation.js`**: Pre-commit hook for validation

### Validation

- **`lib/validation/api-schema-validator.ts`**: Schema definitions and validation logic
- **`lib/stubs/validate-stubs.ts`**: Stub data validation

### Tests

- **`tests/e2e/api-stub-sync.spec.ts`**: E2E tests that work with both stubs and real APIs

### CI/CD

- **`.github/workflows/api-stub-validation.yml`**: Automated validation workflow

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run validate:stubs` | Validate stub data against schemas |
| `npm run validate:api-schema` | Test API endpoints for schema compliance |
| `npm run sync:api-stubs` | Compare real API vs stubs, generate updates |
| `npm run test:e2e:stubs` | Run E2E tests with stub validation |

## 🛠️ How It Works

### 1. Schema Validation

The system uses Zod schemas to define expected API response structures:

```typescript
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  // ... other fields
});
```

### 2. API Comparison

The sync script:
1. Makes requests to real API endpoints
2. Compares responses with stub data
3. Identifies structural differences
4. Generates updated stub data

### 3. E2E Test Validation

E2E tests run the same scenarios with both environments:
- Stub mode: Fast, no external dependencies
- Real API mode: Production-like validation

## 📊 Validation Reports

The system generates detailed reports:

### Validation Report
```markdown
# API-Stub Validation Report

## Summary
- Total Tests: 4
- Passed: 3
- Failed: 1
- Success Rate: 75%

## Failed Tests
- /api/products - Structure mismatch
  - Missing in stub: inventory_count
  - Extra in stub: stock_quantity
```

### Stub Updates
```json
{
  "endpoint": "/api/products",
  "suggestedUpdate": {
    "products": [
      {
        "id": "prod-1",
        "inventory_count": 50
        // ... updated structure
      }
    ]
  }
}
```

## 🔄 Development Workflow

### Adding New API Endpoints

1. **Develop the API** with real data
2. **Add schema validation**:
   ```typescript
   export const NewEndpointSchema = z.object({
     // Define expected response structure
   });
   ```

3. **Create stub data**:
   ```typescript
   export const mockNewData = [
     // Mock data matching the schema
   ];
   ```

4. **Add to validation**:
   ```javascript
   await validator.validateEndpoint(
     '/api/new-endpoint',
     NewEndpointResponseSchema,
     'NewEndpointResponse'
   );
   ```

5. **Run validation**:
   ```bash
   npm run sync:api-stubs
   ```

### Updating Existing APIs

1. **Make API changes** with real database
2. **Run sync validation**:
   ```bash
   npm run sync:api-stubs
   ```
3. **Review generated updates** in `lib/stubs/stub-updates-*.json`
4. **Update stub data** based on recommendations
5. **Run tests** to ensure everything works:
   ```bash
   npm run validate:stubs
   npm run test:e2e:stubs
   ```

## 🚨 CI/CD Integration

### Automated Validation

The GitHub Actions workflow runs:
- **On every push**: Validates stub data schemas
- **On schedule (daily)**: Compares real API vs stubs
- **On PR**: Adds comments if validation fails

### Pre-commit Hooks

Install the pre-commit hook:
```bash
# Add to .git/hooks/pre-commit
#!/bin/sh
node scripts/pre-commit-validation.js
```

This prevents commits with:
- Invalid stub data
- Development-only console logs
- TypeScript errors
- Linting issues

## 🎯 Best Practices

### 1. Keep Stubs Minimal

Only include fields that are actually used in your UI:
```typescript
// Good: Only fields used in components
export const mockProduct = {
  id: 'prod-1',
  name: 'Product Name',
  price: 29.99,
  image_url: 'https://...'
};

// Avoid: Unnecessary fields
export const mockProduct = {
  id: 'prod-1',
  name: 'Product Name',
  price: 29.99,
  internal_sku: 'ABC123', // Not used in UI
  warehouse_location: 'A1', // Not used in UI
  // ...
};
```

### 2. Use Realistic Data

Make stub data realistic for better testing:
```typescript
// Good: Realistic data
export const mockProducts = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    price: 199.99,
    category_id: 'electronics'
  }
];

// Avoid: Generic test data
export const mockProducts = [
  {
    id: 'test-1',
    name: 'Test Product',
    price: 1.00,
    category_id: 'test-cat'
  }
];
```

### 3. Version Your Schemas

When making breaking changes, version your schemas:
```typescript
export const ProductSchemaV1 = z.object({
  stock_quantity: z.number()
});

export const ProductSchemaV2 = z.object({
  inventory_count: z.number()
});

// Use current version
export const ProductSchema = ProductSchemaV2;
```

## 🐛 Troubleshooting

### Validation Failures

**Problem**: Stub validation fails after API changes
```
❌ Invalid product stub: prod-1
   → inventory_count: Required
```

**Solution**: Update mock data to match new schema
```typescript
export const mockProducts = [
  {
    id: 'prod-1',
    // Add missing field
    inventory_count: 50,
    // ... other fields
  }
];
```

### E2E Test Inconsistencies

**Problem**: Tests pass with stubs but fail with real API

**Solution**: Run sync validation to identify differences
```bash
npm run sync:api-stubs
```

Review the generated report and update stubs accordingly.

### Performance Issues

**Problem**: Sync validation is slow

**Solution**: 
- Add delays between API requests
- Use pagination for large datasets
- Cache API responses during validation

## 🤝 Contributing

When adding new features:

1. Add schema validation for new endpoints
2. Create corresponding stub data
3. Add E2E tests that work with both environments
4. Update this documentation

## 📚 Related Documentation

- [Development Setup](./DEVELOPMENT.md)
- [Testing Guide](./TESTING.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)