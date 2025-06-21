# Troubleshooting Guide

This guide covers common issues and their solutions for the VNTG e-commerce platform.

## Table of Contents

- [Development Issues](#development-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Payment Issues](#payment-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Common Error Messages](#common-error-messages)

## Development Issues

### Node.js Version Compatibility

**Problem**: Build fails with Node.js version errors.

**Solution**:
```bash
# Check your Node.js version
node --version

# Install Node.js 18+ if needed
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### Package Installation Failures

**Problem**: `npm install` fails with dependency conflicts.

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solutions**:
1. **Check TypeScript version**:
   ```bash
   npx tsc --version
   ```

2. **Clear TypeScript cache**:
   ```bash
   rm -rf .next
   npm run build
   ```

3. **Common type fixes**:
   ```typescript
   // For missing type definitions
   npm install @types/node @types/react @types/react-dom

   // For Supabase types
   npm install @supabase/supabase-js
   ```

### Environment Variables Not Loading

**Problem**: Environment variables are undefined.

**Solutions**:
1. **Check file naming**:
   - Development: `.env.local`
   - Production: `.env.production`

2. **Verify variable names**:
   ```env
   # Client-side variables must start with NEXT_PUBLIC_
   NEXT_PUBLIC_SUPABASE_URL=your_url
   
   # Server-side variables
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

3. **Restart development server**:
   ```bash
   npm run dev
   ```

## Database Issues

### Supabase Connection Errors

**Problem**: Cannot connect to Supabase database.

**Solutions**:
1. **Verify credentials**:
   ```bash
   # Check if URL and keys are correct
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Check network connectivity**:
   ```bash
   # Test connection
   curl -I $NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Verify project status** in Supabase dashboard.

### Migration Failures

**Problem**: Database migrations fail to run.

**Solutions**:
1. **Check migration syntax**:
   ```sql
   -- Ensure proper SQL syntax
   -- Check for missing semicolons
   -- Verify table/column names
   ```

2. **Run migrations manually**:
   ```bash
   # Check migration status
   npm run db:migrate:status
   
   # Run specific migration
   supabase db push
   ```

3. **Reset database** (development only):
   ```bash
   supabase db reset
   ```

### Row Level Security (RLS) Issues

**Problem**: Database queries fail due to RLS policies.

**Solutions**:
1. **Check RLS policies**:
   ```sql
   -- View existing policies
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

2. **Verify user authentication**:
   ```javascript
   // Check if user is authenticated
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user);
   ```

3. **Update policies**:
   ```sql
   -- Example: Allow users to read their own data
   CREATE POLICY "Users can view own data" ON your_table
     FOR SELECT USING (auth.uid() = user_id);
   ```

## Authentication Issues

### Login/Signup Failures

**Problem**: Users cannot authenticate.

**Solutions**:
1. **Check Supabase Auth settings**:
   - Verify email templates
   - Check redirect URLs
   - Confirm provider settings

2. **Debug authentication flow**:
   ```javascript
   // Add logging to auth functions
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
   });
   console.log('Auth result:', { data, error });
   ```

3. **Verify email confirmation**:
   - Check spam folder
   - Verify email template settings
   - Test with different email providers

### Session Management Issues

**Problem**: User sessions expire unexpectedly.

**Solutions**:
1. **Check session configuration**:
   ```javascript
   // Verify session handling
   const { data: { session } } = await supabase.auth.getSession();
   ```

2. **Implement session refresh**:
   ```javascript
   // Auto-refresh sessions
   supabase.auth.onAuthStateChange((event, session) => {
     if (event === 'TOKEN_REFRESHED') {
       console.log('Token refreshed');
     }
   });
   ```

### Social Login Issues

**Problem**: OAuth providers not working.

**Solutions**:
1. **Verify provider configuration**:
   - Check client IDs and secrets
   - Verify redirect URLs
   - Confirm provider settings in Supabase

2. **Test redirect URLs**:
   ```
   Development: http://localhost:3000/auth/callback
   Production: https://yourdomain.com/auth/callback
   ```

## Payment Issues

### Stripe Integration Problems

**Problem**: Payment processing fails.

**Solutions**:
1. **Verify Stripe keys**:
   ```bash
   # Check if using correct environment keys
   # Test keys start with pk_test_ and sk_test_
   # Live keys start with pk_live_ and sk_live_
   ```

2. **Test webhook endpoints**:
   ```bash
   # Use Stripe CLI to test webhooks
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Check webhook signatures**:
   ```javascript
   // Verify webhook signature
   const sig = headers.get('stripe-signature');
   const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
   ```

### Payment Intent Errors

**Problem**: Payment intents fail to create.

**Solutions**:
1. **Verify amount format**:
   ```javascript
   // Amount should be in cents
   const amount = Math.round(totalInDollars * 100);
   ```

2. **Check currency support**:
   ```javascript
   // Ensure currency is supported by Stripe
   const supportedCurrencies = ['usd', 'eur', 'gbp'];
   ```

3. **Validate customer data**:
   ```javascript
   // Ensure required fields are present
   const requiredFields = ['email', 'name'];
   ```

## Deployment Issues

### Vercel Deployment Failures

**Problem**: Deployment fails on Vercel.

**Solutions**:
1. **Check build logs**:
   - Review build output in Vercel dashboard
   - Look for TypeScript errors
   - Check for missing dependencies

2. **Verify environment variables**:
   - Ensure all required variables are set
   - Check variable names and values
   - Verify production vs development settings

3. **Build locally**:
   ```bash
   # Test production build locally
   npm run build
   npm start
   ```

### Environment Variable Issues

**Problem**: Environment variables not available in production.

**Solutions**:
1. **Set variables in Vercel dashboard**:
   - Go to Project Settings > Environment Variables
   - Add all required variables
   - Set correct environment (Production/Preview/Development)

2. **Verify variable access**:
   ```javascript
   // Client-side variables must start with NEXT_PUBLIC_
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
   
   // Server-side variables
   console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);
   ```

### Database Connection in Production

**Problem**: Cannot connect to database in production.

**Solutions**:
1. **Check production database URL**:
   - Verify using production Supabase project
   - Confirm connection pooling settings

2. **Test connection**:
   ```bash
   # Test from production environment
   curl -H "apikey: $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/products?select=id&limit=1"
   ```

## Performance Issues

### Slow Page Loading

**Problem**: Pages load slowly.

**Solutions**:
1. **Optimize images**:
   ```javascript
   // Use Next.js Image component
   import Image from 'next/image';
   
   <Image
     src="/product.jpg"
     alt="Product"
     width={300}
     height={200}
     priority={false}
   />
   ```

2. **Implement caching**:
   ```javascript
   // Add caching headers
   export async function GET() {
     return new Response(data, {
       headers: {
         'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
       }
     });
   }
   ```

3. **Use loading states**:
   ```javascript
   // Add skeleton loading
   {loading ? <ProductSkeleton /> : <ProductGrid />}
   ```

### Database Query Performance

**Problem**: Slow database queries.

**Solutions**:
1. **Add database indexes**:
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_products_category ON products(category_id);
   CREATE INDEX idx_products_price ON products(price);
   ```

2. **Optimize queries**:
   ```javascript
   // Select only needed columns
   const { data } = await supabase
     .from('products')
     .select('id, name, price, image_url')
     .limit(12);
   ```

3. **Use pagination**:
   ```javascript
   // Implement proper pagination
   const { data } = await supabase
     .from('products')
     .select('*')
     .range(start, end);
   ```

## Common Error Messages

### "Module not found"

**Error**: `Module not found: Can't resolve 'module-name'`

**Solution**:
```bash
# Install missing module
npm install module-name

# Or check import path
import { Component } from '@/components/Component';
```

### "Hydration failed"

**Error**: `Hydration failed because the initial UI does not match`

**Solution**:
```javascript
// Use useEffect for client-only code
useEffect(() => {
  // Client-only code here
}, []);

// Or use dynamic imports
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
});
```

### "CORS error"

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
```javascript
// Add CORS headers to API routes
export async function GET() {
  return new Response(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### "Invalid JWT token"

**Error**: `JWT token is invalid or expired`

**Solution**:
```javascript
// Refresh the session
const { data: { session }, error } = await supabase.auth.refreshSession();

// Or redirect to login
if (error) {
  router.push('/login');
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs**:
   - Browser console for client-side errors
   - Vercel function logs for server-side errors
   - Supabase logs for database issues

2. **Search existing issues**:
   - GitHub Issues
   - Supabase documentation
   - Stripe documentation

3. **Create a minimal reproduction**:
   - Isolate the problem
   - Create a simple test case
   - Include error messages and logs

4. **Contact support**:
   - GitHub Issues for bugs
   - Discussions for questions
   - Email for urgent issues
