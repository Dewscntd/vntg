# VNTG Deployment Guide

Complete guide for deploying the VNTG e-commerce platform to production.

## 🚀 Current Deployment

### Live Platform
- **Store**: https://vntg-store.vercel.app
- **Admin Panel**: https://vntg-store.vercel.app/admin-direct
- **Status**: ✅ **FULLY OPERATIONAL**

### Current Infrastructure
- **Frontend**: Vercel (Next.js 14)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Storage**: Supabase Storage
- **CDN**: Vercel Edge Network

## 📋 Prerequisites

### Required Accounts
- [Vercel Account](https://vercel.com) (Frontend hosting)
- [Supabase Account](https://supabase.com) (Database & Backend)
- [Stripe Account](https://stripe.com) (Payment processing)
- [GitHub Account](https://github.com) (Code repository)

### Required Tools
- Node.js 18+ and npm
- Git
- Vercel CLI (optional)

## 🔧 Environment Setup

### 1. Supabase Configuration

#### Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Note your project URL and keys

#### Database Setup
```sql
-- Run migrations in Supabase SQL Editor
-- Files located in: supabase/migrations/
```

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Stripe Configuration

#### Setup Stripe Account
1. Create [Stripe account](https://dashboard.stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhooks endpoint: `https://your-domain.com/api/webhooks/stripe`

#### Webhook Events
Configure these webhook events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.dispute.created`

#### Environment Variables
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Application Configuration

#### Required Environment Variables
```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789
```

## 🌐 Vercel Deployment

### Method 1: Automatic Deployment (Recommended)

#### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Connect your GitHub repository
4. Select the VNTG repository

#### 2. Configure Project
```json
{
  "name": "vntg",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev"
}
```

#### 3. Environment Variables
Add all environment variables in Vercel Dashboard:
- Project Settings > Environment Variables
- Add each variable for Production environment

#### 4. Deploy
- Vercel automatically deploys on push to main branch
- Check deployment status in Vercel Dashboard

### Method 2: Manual Deployment

#### Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all environment variables
```

## 🗄️ Database Deployment

### Migration Process
```bash
# Apply database migrations
npm run db:migrate

# Create admin user
npm run db:create-admin

# Seed sample data (optional)
npm run db:seed
```

### Production Database Setup
```sql
-- 1. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- 3. Set up database functions
-- (Run all migration files in order)
```

## 🔐 Security Configuration

### HTTPS Setup
- Vercel automatically provides HTTPS
- Custom domains get free SSL certificates
- Ensure all API calls use HTTPS

### CORS Configuration
```typescript
// In API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### Security Headers
```typescript
// In next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];
```

## 🌍 Custom Domain Setup

### Vercel Domain Configuration
1. **Add Domain**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Records**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL
   - Usually takes 5-10 minutes to activate

### Domain Verification
```bash
# Check domain status
dig your-domain.com
nslookup your-domain.com
```

## 🔄 CI/CD Pipeline

### Automatic Deployments
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
```

### Pre-deployment Checks
```bash
# Run before deploying
npm run type-check  # TypeScript validation
npm run lint        # Code linting
npm run test        # Unit tests
npm run build       # Production build
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Real User Monitoring**: Track actual user performance
- **Core Web Vitals**: Monitor loading, interactivity, visual stability

### Error Tracking
```typescript
// Sentry integration (optional)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Custom Analytics
```typescript
// Google Analytics 4 tracking
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'VNTG Store',
  page_location: window.location.href,
});
```

## 🛡️ Backup & Recovery

### Database Backups
```bash
# Automated daily backups (Supabase Pro)
# Manual backup script
npm run backup:database
```

### Code Backups
- Git repository (GitHub)
- Vercel deployment history
- Local development backups

### Recovery Procedures
```bash
# Rollback deployment
vercel rollback

# Restore database
npm run restore:database [backup-file]

# Emergency maintenance mode
vercel env add MAINTENANCE_MODE true
```

## 🚀 Production Optimization

### Performance Optimizations
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
};
```

### Caching Strategy
```typescript
// API route caching
export const config = {
  runtime: 'edge',
  regions: ['iad1'], // US East for Israeli users
};

// Static asset caching
Cache-Control: public, max-age=31536000, immutable
```

## 📱 Mobile Optimization

### PWA Configuration
```json
// public/manifest.json
{
  "name": "VNTG Store",
  "short_name": "VNTG",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/"
}
```

## 🌏 Israeli Market Optimization

### Geographic Configuration
```typescript
// Vercel regions for Israeli users
export const config = {
  regions: ['iad1'], // US East (closest to Israel)
};

// Currency and locale
const locale = 'he-IL';
const currency = 'ILS';
```

### Payment Configuration
```typescript
// Israeli payment methods
const paymentMethods = {
  card: {
    supportedCountries: ['IL'],
    supportedNetworks: ['visa', 'mastercard', 'isracard'],
  },
};
```

## 🔧 Troubleshooting

### Common Deployment Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules
rm -rf node_modules
npm ci
```

#### Environment Variable Issues
```bash
# Check environment variables
vercel env ls

# Update environment variables
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME
```

#### Database Connection Issues
```typescript
// Test database connection
const { data, error } = await supabase
  .from('products')
  .select('count')
  .limit(1);

console.log('DB Connection:', error ? 'Failed' : 'Success');
```

### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check Core Web Vitals
lighthouse https://your-domain.com --view
```

## 📞 Support & Maintenance

### Monitoring Checklist
- [ ] Website uptime (99.9%+)
- [ ] Database performance
- [ ] Payment processing
- [ ] Error rates < 0.1%
- [ ] Core Web Vitals scores

### Maintenance Schedule
- **Daily**: Monitor error logs and performance
- **Weekly**: Review analytics and user feedback
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Performance optimization review

### Emergency Contacts
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com

## 📚 Additional Resources

### Documentation Links
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production](https://supabase.com/docs/guides/platform/going-to-prod)
- [Stripe Integration](https://stripe.com/docs/development)

### Useful Commands
```bash
# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Environment management
vercel env ls
vercel env add [name]
vercel env rm [name]
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Domain DNS configured
- [ ] SSL certificate active

### Post-Deployment
- [ ] Website loads correctly
- [ ] Admin panel accessible
- [ ] Payment processing works
- [ ] Database connections stable
- [ ] Performance metrics acceptable

### Go-Live
- [ ] Monitor error logs
- [ ] Test all critical user flows
- [ ] Verify admin functionality
- [ ] Check payment processing
- [ ] Monitor performance metrics

**Your VNTG e-commerce platform is ready for production! 🎉**