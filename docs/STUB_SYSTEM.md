# Stub System Documentation

## Overview

The VNTG e-commerce platform includes a comprehensive stub/mock system that allows full application functionality without external dependencies (Supabase, Stripe, etc.). This enables offline development, faster testing, and easier onboarding.

**Last Updated**: November 2, 2025
**Status**: ✅ Fully Operational (TypeScript errors resolved)

---

## Quick Start

### Enable Stub Mode

```bash
# Option 1: Use the dev mode switch script
npm run dev:stub

# Option 2: Set environment variable manually
export NEXT_PUBLIC_USE_STUBS=true
npm run dev
```

### Verify Stub Mode

Check your browser console or server logs for:
```
🎭 Creating Supabase client with comprehensive mock data
🔍 Environment check: { NEXT_PUBLIC_USE_STUBS: 'true', USE_STUBS: true }
```

---

## Architecture

### Core Components

```
lib/stubs/
├── index.ts                           # Main export & USE_STUBS flag
├── enhanced-supabase-stub.ts          # Complete Supabase API stub
├── comprehensive-mock-data.ts         # Mock data (products, users, orders)
├── extensive-mock-data.ts             # Extended mock data utilities
└── mock-data.ts                       # Legacy mock data
```

### Key Features

**Enhanced Supabase Stub** ([enhanced-supabase-stub.ts](lib/stubs/enhanced-supabase-stub.ts))
- ✅ Full authentication API (sign in, sign up, sign out, OAuth)
- ✅ Complete database operations (select, insert, update, delete)
- ✅ Query builder with filters, sorting, pagination
- ✅ RPC function support
- ✅ Storage operations (upload, download, delete)
- ✅ Realtime subscriptions (mocked)
- ✅ Proper TypeScript types (Promise-compatible)

**Comprehensive Mock Data** ([comprehensive-mock-data.ts](lib/stubs/comprehensive-mock-data.ts))
- 52+ vintage products (clothing, electronics, collectibles)
- 14 hierarchical categories
- 4 test users (admin, customers)
- 3 orders with various states
- Test credentials for authentication
- Israeli localization (addresses, currency)

---

## Recent Fixes (Nov 2, 2025)

### TypeScript Compatibility Issues Resolved

**Problem**: 40+ TypeScript compilation errors blocking CI/CD deployment

**Root Causes**:
1. Query builder `.then()` method not recognized as proper Promise
2. Auth methods returning incomplete Session objects (missing `expires_in`)
3. Mock products had invalid `specifications` field
4. Auth errors were plain objects instead of Error instances

**Solutions Implemented**:

#### 1. Query Builder Promise Interface
**File**: `lib/stubs/enhanced-supabase-stub.ts:282-465`

```typescript
// BEFORE (TypeScript error TS1320)
async then(resolve: Function) {
  const result = await executeQuery();
  resolve(result);
}

// AFTER (TypeScript compatible)
const queryBuilder = {
  eq: function (column: string, value: any) {
    _filters.push({ type: 'eq', column, value });
    return this;
  },
  then: function (onfulfilled?: any, onrejected?: any) {
    return executeQuery().then(onfulfilled, onrejected);
  },
  catch: function (onrejected?: any) {
    return executeQuery().catch(onrejected);
  },
  finally: function (onfinally?: any) {
    return executeQuery().finally(onfinally);
  },
};
```

**Key Changes**:
- Query state moved to closure variables (`let _filters`, `let _limit`, etc.)
- `executeQuery()` returns actual Promise
- `then()`, `catch()`, `finally()` delegate to Promise methods
- Maintains chainable API while being TypeScript-compatible

#### 2. Session Type Fixes
**File**: `lib/stubs/enhanced-supabase-stub.ts:68-83`

```typescript
// BEFORE (missing expires_in)
session: {
  user,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
}

// AFTER (complete Session type)
session: {
  user,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,  // Unix timestamp
  expires_in: 3600,                                   // Required field
  token_type: 'bearer' as const,                      // Proper typing
}
```

#### 3. Auth Error Objects
**File**: `lib/stubs/enhanced-supabase-stub.ts:148-160`

```typescript
// BEFORE (plain object)
return {
  data: { user: null, session: null },
  error: { message: 'Invalid login credentials' },
};

// AFTER (proper Error instance)
const error = new Error('Invalid login credentials');
error.name = 'AuthApiError';
return {
  data: { user: null, session: null },
  error,
};
```

#### 4. Product Schema Alignment
**File**: `lib/stubs/comprehensive-mock-data.ts:108-302`

```typescript
// BEFORE (invalid field)
{
  id: '20000000-0000-0000-0000-000000000001',
  name: '1970s Boho Maxi Dress',
  specifications: {  // ❌ Not in database schema
    size: 'M',
    condition: 'Excellent',
  },
}

// AFTER (inline in description)
{
  id: '20000000-0000-0000-0000-000000000001',
  name: '1970s Boho Maxi Dress',
  description: 'Beautiful flowing maxi dress. Size: M, Condition: Excellent, Brand: Unknown',
}
```

---

## Usage Guide

### Authentication

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Sign in (uses stub when NEXT_PUBLIC_USE_STUBS=true)
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@vntg.local',
  password: 'TestPassword123!',
});

// Test credentials available in comprehensive-mock-data.ts:
// - admin@vntg.local / TestPassword123!
// - customer@vntg.local / TestPassword123!
// - michaelvx@gmail.com / admin123
```

### Database Operations

```typescript
// Query products
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_featured', true)
  .limit(10);

// Insert new item
const { data: newProduct } = await supabase
  .from('products')
  .insert({ name: 'Test Product', price: 1000 })
  .select()
  .single();

// All operations work with in-memory stub data
```

### Storage Operations

```typescript
// Upload file (simulated)
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('test.jpg', file);

// Get public URL
const { data: urlData } = supabase.storage
  .from('product-images')
  .getPublicUrl('test.jpg');
```

---

## Test Data

### Users

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@vntg.local | TestPassword123! | admin | Admin user |
| customer@vntg.local | TestPassword123! | customer | Regular customer |
| michaelvx@gmail.com | admin123 | admin | Developer admin |
| premium@vntg.local | TestPassword123! | customer | Premium customer |

### Products

- **52+ vintage items** across 6 main categories
- Categories: Clothing, Electronics, Collectibles, Accessories, Home & Decor, Art
- Featured items: Pink Floyd tour shirt (₪450), Polaroid camera (₪420), Star Wars figures (₪1,250)
- All prices in Israeli New Shekel (₪)

### Orders

- 3 sample orders in various states (pending, processing, completed)
- Linked to test users
- Include order items, addresses, and payment information

---

## Troubleshooting

### TypeScript Errors

**Issue**: `error TS1320: Type of 'await' operand must either be a valid promise`

**Solution**: This was fixed in the November 2025 update. If you see this error:
1. Pull latest changes from `feature/landing-page-rework`
2. Verify you have the updated `enhanced-supabase-stub.ts`
3. Run `npm run type-check` to confirm

**Files Changed**:
- `lib/stubs/enhanced-supabase-stub.ts` (refactored query builder)
- `lib/stubs/comprehensive-mock-data.ts` (removed invalid fields)

### Stub Not Activating

**Symptoms**: Real API calls being made instead of using stubs

**Check**:
```bash
# Verify environment variable
echo $NEXT_PUBLIC_USE_STUBS  # Should output: true

# Check .env.local file
grep NEXT_PUBLIC_USE_STUBS .env.local
```

**Fix**:
```bash
# Ensure .env.local contains:
NEXT_PUBLIC_USE_STUBS=true

# Restart dev server
npm run dev
```

### Console Errors

**Issue**: `Cannot find module '@/lib/stubs'`

**Solution**: The stub index file exports all necessary components:
```typescript
// lib/stubs/index.ts
export const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === 'true';
export { createEnhancedSupabaseStub } from './enhanced-supabase-stub';
export * from './comprehensive-mock-data';
```

---

## Development Workflow

### Running Tests with Stubs

```bash
# Unit tests (automatically use stubs)
npm run test

# E2E tests with stubs
npm run test:e2e:stubs
```

### Switching Modes

```bash
# Stub mode (offline, no external dependencies)
npm run dev:stub

# Local Supabase (requires Docker)
npm run dev:local

# Remote dev database
npm run dev:remote
```

### Validation

```bash
# Validate stub implementation
npm run validate:stubs

# Check API schema compatibility
npm run validate:api-schema
```

---

## CI/CD Integration

### GitHub Actions

The stub system is fully integrated with CI/CD:

**Quality Gates** (`.github/workflows/main-ci-cd.yml`)
```yaml
- name: Type checking
  run: npm run type-check  # ✅ Passes with stub fixes

- name: Build application
  run: npm run build        # ✅ Builds with stub support
  env:
    NEXT_PUBLIC_USE_STUBS: true
```

**Status**: ✅ All checks passing as of November 2, 2025

---

## API Reference

### createEnhancedSupabaseStub()

Returns a full Supabase client stub with all methods.

**Auth Methods**:
- `getUser()` - Returns current user or null
- `getSession()` - Returns session with user and tokens
- `signInWithPassword({ email, password })` - Authenticates user
- `signUp({ email, password, options })` - Registers new user
- `signOut()` - Logs out user
- `signInWithOAuth({ provider })` - OAuth authentication
- `resetPasswordForEmail(email)` - Password reset request
- `updateUser(attributes)` - Updates user profile
- `onAuthStateChange(callback)` - Auth state listener

**Database Methods**:
- `from(table).select(columns)` - Query builder
- `from(table).insert(data)` - Insert records
- `from(table).update(data).eq(column, value)` - Update records
- `from(table).delete().eq(column, value)` - Delete records
- `from(table).rpc(functionName, params)` - RPC calls

**Storage Methods**:
- `storage.from(bucket).upload(path, file)` - Upload file
- `storage.from(bucket).remove(paths)` - Delete files
- `storage.from(bucket).getPublicUrl(path)` - Get public URL
- `storage.from(bucket).createSignedUrl(path, expiresIn)` - Signed URL

---

## Performance Characteristics

### Simulated Delays

The stub includes realistic delays to mimic network latency:

| Operation | Delay (ms) | Purpose |
|-----------|------------|---------|
| `getUser()` | 150 | Auth check |
| `getSession()` | 120 | Session fetch |
| `signInWithPassword()` | 800 | Login authentication |
| `signUp()` | 1200 | Account creation |
| `select()` queries | 100-300 | Database query |
| `insert()` | 300 | Record creation |
| `update()` | 250 | Record update |
| `delete()` | 200 | Record deletion |
| `storage.upload()` | 1500-3500 | File upload |

**Note**: These delays help identify race conditions and ensure the app handles async operations correctly.

### Error Simulation

Random errors are injected to test error handling:

- Auth errors: 2% failure rate
- Database errors: 5% failure rate
- Insert/Update errors: 3% failure rate
- Storage errors: 5% failure rate

---

## Future Improvements

### Planned Enhancements

1. **Persistent State**: Save stub data to localStorage for session persistence
2. **Admin Panel**: UI for managing stub data during development
3. **Request Recording**: Capture real API requests to generate stub data
4. **GraphQL Support**: Add stub support for GraphQL APIs
5. **MSW Integration**: Integrate with Mock Service Worker for network-level mocking

### Known Limitations

1. **Realtime**: Subscriptions are mocked but don't receive actual updates
2. **File Storage**: Files aren't actually stored, just mocked URLs returned
3. **Transactions**: Database transactions aren't fully simulated
4. **Complex Queries**: Some advanced PostgreSQL queries may not work identically

---

## Support

### For Developers

If you encounter issues with the stub system:

1. Check this documentation first
2. Verify `NEXT_PUBLIC_USE_STUBS=true` is set
3. Run `npm run type-check` to check for TypeScript errors
4. Review recent changes in `lib/stubs/enhanced-supabase-stub.ts`

### For AI Agents

When working with this codebase:

1. **Always check** if stub mode is enabled before debugging API issues
2. **Refer to** `lib/stubs/comprehensive-mock-data.ts` for available test data
3. **Remember** the November 2025 TypeScript fixes when modifying stub code
4. **Validate** changes with `npm run type-check` before committing
5. **Test** both stub and real API modes when making auth/database changes

---

## Changelog

### November 2, 2025 - TypeScript Compatibility Fix
- ✅ Fixed query builder Promise interface (TS1320 errors)
- ✅ Added `expires_in` to Session objects
- ✅ Changed auth errors to proper Error instances
- ✅ Removed invalid `specifications` field from products
- ✅ All TypeScript compilation errors resolved
- ✅ CI/CD pipeline fully passing

### October 2024 - Initial Implementation
- Created enhanced Supabase stub
- Added comprehensive mock data
- Integrated with development workflow
- Added environment switching scripts

---

## License

This stub system is part of the VNTG e-commerce platform and follows the same license as the main project.
