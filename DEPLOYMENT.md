# VNTG Vercel Deployment Guide

## 🚀 Quick Deploy Steps

### 1. Create Vercel Account & Connect GitHub
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Import Project" and select your `vntg` repository
3. Vercel will auto-detect Next.js framework

### 2. Configure Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

#### 🔑 Required Environment Variables

**Supabase Configuration:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Stripe Configuration:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_your_key
STRIPE_SECRET_KEY=sk_live_or_sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Next.js Configuration:**
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret_string
```

#### 🔧 Optional Environment Variables

**Analytics & Monitoring:**
```bash
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

**Email Services (if using):**
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
```

### 3. Set Up Production Supabase Project

#### Create Production Database
1. Go to [supabase.com](https://supabase.com)
2. Create new project for production
3. Wait for database to initialize
4. Copy URL and keys to Vercel environment variables

#### Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

#### Set Up Supabase Storage
1. In Supabase dashboard, go to Storage
2. Create bucket: `product-images`
3. Set bucket to public: Storage > Settings > Make bucket public
4. Configure RLS policies for image uploads

### 4. Configure Stripe for Production

#### Create Stripe Production Account
1. Go to [stripe.com](https://stripe.com)
2. Create account or switch to live mode
3. Get production API keys
4. Add keys to Vercel environment variables

#### Set Up Webhook Endpoint
1. In Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy webhook secret to Vercel environment variables

### 5. Deploy to Vercel

#### Automatic Deployment
```bash
# Push to main branch triggers automatic deployment
git add .
git commit -m "feat: Ready for production deployment"
git push origin master
```

#### Manual Deployment via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 6. Post-Deployment Configuration

#### Update Domain Settings
1. In Vercel dashboard > Settings > Domains
2. Add your custom domain if you have one
3. Configure DNS records as instructed

#### Create Admin User
```bash
# Run the admin creation script
npm run db:create-admin
```

#### Test Core Functionality
- [ ] Browse products without login (guest experience)
- [ ] Add items to cart
- [ ] Complete guest checkout
- [ ] Create user account
- [ ] Member login and checkout
- [ ] Admin login and product management
- [ ] Payment processing (test mode first)

## 🛠️ Environment Variables Template

Create a `.env.production` file with these variables (don't commit this file):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Next.js
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-random-string-here

# Optional: Analytics
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

## 🔍 Troubleshooting

### Build Failures
- Check TypeScript errors: `npm run type-check`
- Verify all environment variables are set
- Check Vercel build logs for specific errors

### Database Issues
- Verify Supabase connection string
- Check if migrations ran successfully
- Ensure RLS policies are configured correctly

### Payment Issues
- Test with Stripe test keys first
- Verify webhook endpoint is accessible
- Check webhook secret matches Stripe dashboard

### Performance Issues
- Monitor Vercel Analytics
- Check Sentry for error tracking
- Optimize images and API responses

## 📈 Production Checklist

### Security
- [ ] All environment variables configured
- [ ] Database RLS policies enabled
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] API rate limiting configured
- [ ] Admin routes protected

### Performance
- [ ] Images optimized
- [ ] Caching strategies enabled
- [ ] CDN configured (automatic with Vercel)
- [ ] Database queries optimized

### Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Analytics tracking enabled
- [ ] Uptime monitoring set up
- [ ] Performance monitoring active

### Business
- [ ] Payment processing tested
- [ ] Email notifications working
- [ ] Order management functional
- [ ] Customer support ready

## 🌟 Your VNTG Store Will Have:

✅ **Guest Shopping**: Anyone can shop without signup
✅ **Member Benefits**: Enhanced features for registered users
✅ **Israeli Market Support**: ILS currency, Hebrew support, local shipping
✅ **Secure Payments**: Stripe integration with proper security
✅ **Admin Panel**: Complete store management
✅ **Mobile Optimized**: Perfect mobile shopping experience
✅ **SEO Optimized**: Search engine friendly
✅ **Performance**: Lightning-fast loading

## 🚀 Go Live!

Once deployed, your store will be live at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

**Ready to launch your e-commerce empire!** 🛍️