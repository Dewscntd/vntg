# Peakees Admin Setup Guide

## 🎉 Your Peakees E-Commerce Platform is LIVE!

**Production URL**: https://peakees.vercel.app

## ✅ Completed Setup

- **Database**: Production Supabase with full schema ✅
- **Products**: 4 sample products across 5 categories ✅
- **Payments**: Stripe integration with webhook ✅
- **Authentication**: Guest checkout + member accounts ✅
- **Israeli Market**: ILS currency support ready ✅

## 🔧 Create Admin User

1. **Visit your store**: https://peakees.vercel.app
2. **Register an account** using the Register button
3. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/ogrpjursibfrejjkfkxa
4. **Navigate to**: Authentication → Users
5. **Find your user** and copy the email
6. **Go to**: SQL Editor
7. **Run this query** (replace with your email):

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

8. **Access admin panel**: https://peakees.vercel.app/admin

## 🛍️ Test Your Store

### Customer Flow:
1. **Browse products** on homepage
2. **Add to cart** 
3. **Guest checkout** (no registration required)
4. **Complete purchase** with test card: `4242 4242 4242 4242`

### Admin Flow:
1. **Login as admin**
2. **Visit `/admin`** to manage:
   - Products and inventory
   - Orders and customers  
   - Analytics and reports

## 🔗 Important URLs

- **Store**: https://peakees.vercel.app
- **Admin**: https://peakees.vercel.app/admin
- **API Health**: https://peakees.vercel.app/api/health
- **Supabase**: https://supabase.com/dashboard/project/ogrpjursibfrejjkfkxa
- **Stripe**: https://dashboard.stripe.com/test/dashboard
- **Vercel**: https://vercel.com/michaelvx-3932s-projects/peakees

## 🎯 Next Actions

1. **Test the store** - Complete a purchase flow
2. **Create admin user** - Follow steps above
3. **Add real products** - Replace sample data
4. **Configure domains** - Set up custom domain if needed
5. **Go live** - Switch to Stripe live keys when ready

## 💡 Pro Tips

- **Test Card**: `4242 4242 4242 4242` (any future date, any CVC)
- **Israeli Cards**: Use `4000 0027 6000 0016` for testing Israeli cards
- **Currency**: Platform supports both USD and ILS
- **Mobile Ready**: Fully responsive design
- **SEO Optimized**: Meta tags and structured data included

Your e-commerce platform is ready for business! 🚀