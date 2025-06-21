# Production Setup Guide

This guide covers the complete setup process for deploying the VNTG e-commerce platform to production.

## Prerequisites

- Vercel account for hosting
- Supabase account for database
- Stripe account for payments
- Custom domain (optional)
- Sentry account for monitoring (optional)

## 1. Supabase Production Setup

### 1.1 Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and set project name: `vntg-production`
4. Select region closest to your users
5. Generate a strong database password
6. Wait for project creation (2-3 minutes)

### 1.2 Database Migration

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref YOUR_PROJECT_REF

# Push database schema to production
supabase db push

# Run any additional migrations
supabase migration up
```

### 1.3 Configure Row Level Security (RLS)

Ensure all RLS policies are properly configured:

```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust as needed)
CREATE POLICY "Users can view published products" ON products
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can manage their own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

### 1.4 Storage Configuration

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('user-avatars', 'user-avatars', true);

-- Set up storage policies
CREATE POLICY "Public product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 2. Stripe Production Setup

### 2.1 Activate Stripe Account

1. Complete Stripe account verification
2. Provide business information
3. Add bank account for payouts
4. Enable live mode

### 2.2 Configure Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`
5. Copy webhook signing secret

### 2.3 API Keys

1. Go to Stripe Dashboard > Developers > API keys
2. Copy live publishable key (starts with `pk_live_`)
3. Copy live secret key (starts with `sk_live_`)

## 3. Environment Variables

### 3.1 Production Environment Variables

Create `.env.production` file:

```bash
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (choose one)
RESEND_API_KEY=your_resend_key
# OR
SENDGRID_API_KEY=your_sendgrid_key

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project

# Analytics (optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### 3.2 Vercel Environment Variables

Set these in Vercel Dashboard > Project > Settings > Environment Variables:

- `NODE_ENV` = `production`
- `NEXT_PUBLIC_APP_URL` = `https://yourdomain.com`
- `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Your Stripe publishable key
- `STRIPE_SECRET_KEY` = Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret

## 4. Monitoring Setup

### 4.1 Sentry Configuration

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs
```

### 4.2 Performance Monitoring

Enable performance monitoring in `sentry.client.config.js`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

## 5. Security Checklist

- [ ] All environment variables are properly set
- [ ] RLS policies are configured and tested
- [ ] Stripe webhooks are configured with proper secrets
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] Error messages don't expose sensitive information

## 6. Performance Optimization

- [ ] Images are optimized and served via CDN
- [ ] Database queries are optimized with proper indexes
- [ ] Caching is configured for static assets
- [ ] Bundle size is optimized
- [ ] Core Web Vitals are within acceptable ranges

## 7. Backup and Recovery

- [ ] Database backups are automated
- [ ] File storage backups are configured
- [ ] Recovery procedures are documented
- [ ] Backup restoration is tested

## 8. Go-Live Checklist

- [ ] All tests pass in production environment
- [ ] Payment flows are tested with real transactions
- [ ] Email notifications are working
- [ ] Monitoring and alerts are configured
- [ ] DNS is properly configured
- [ ] SSL certificates are valid
- [ ] Performance is acceptable under load
- [ ] Error tracking is working
- [ ] Team has access to production systems
