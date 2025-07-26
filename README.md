# VNTG - Modern E-commerce Platform

A production-ready, full-stack e-commerce platform built with Next.js 14, TypeScript, Supabase, and Stripe. Features comprehensive product management, Israeli market support with Hebrew localization, and advanced admin capabilities.

## 🌟 Live Platform

- **🛍️ Store**: https://peakees.vercel.app
- **👑 Admin Panel**: https://peakees.vercel.app/admin-direct
- **📧 Admin Login**: `michaelvx@gmail.com` / `1q1q1q1q`

## 🚀 Current Status: **FULLY DEPLOYED & OPERATIONAL**

## 🚀 Features

### ✅ **Phase 4: Product Catalog & Browsing** (Complete)

- **Complete Shop Pages** - Products listing, categories, search, and detail pages
- **Advanced Navigation** - Search, filters, sorting, breadcrumbs, pagination
- **Performance Features** - Lazy loading, skeleton states, GSAP animations
- **Quick View Modal** - Enhanced product preview functionality
- **SEO Optimization** - Search engine and social media ready

### ✅ **Phase 5: Shopping Cart & User Experience** (Complete)

- **Full Cart System** - Add, remove, update with persistent state
- **Advanced UX** - GSAP animations, accessibility, mobile optimization
- **Cart Preview** - Hover preview with quick actions
- **Abandonment Recovery** - Automated recovery system with analytics
- **Cross-device Sync** - Seamless cart synchronization

### ✅ **Phase 6: Checkout & Payment Processing** (Complete)

- **Stripe Integration** - Complete payment processing with webhooks
- **Multi-step Checkout** - Address validation and payment forms
- **Order Processing** - Automated order creation and confirmation
- **Payment Security** - PCI compliant payment handling
- **Error Handling** - Comprehensive payment failure recovery

### ✅ **Phase 7: Order Management & User Accounts** (Complete)

- **User Dashboard** - Account overview and order history
- **Order Tracking** - Real-time order status updates
- **Profile Management** - User settings and preferences
- **Address Book** - Saved shipping addresses
- **Order Actions** - Cancel, reorder, and return functionality

### ✅ **Phase 8: Admin Panel & Management** (Complete)

- **Admin Dashboard** - Comprehensive management interface
- **Product Management** - CRUD operations with image upload
- **Order Management** - Order processing and fulfillment
- **User Management** - Customer support and administration
- **Analytics & Reporting** - Sales and performance metrics

### ✅ **Phase 9: UI/UX Polish & Animations** (Complete)

- **GSAP Animations** - Professional micro-interactions
- **Responsive Design** - Mobile-first optimization
- **Accessibility** - WCAG 2.1 AA compliance
- **Performance** - Optimized loading and caching
- **SEO** - Search engine optimization

### ✅ **Phase 10: Testing, Deployment & Documentation** (Complete)

- **Comprehensive Testing** - Unit, integration, and E2E tests
- **CI/CD Pipeline** - Automated testing and deployment
- **Production Setup** - Monitoring, security, and backups
- **Documentation** - Complete API and component docs
- **Deployment Tools** - Automated scripts and rollback procedures

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 14** - App Router, Server Components, TypeScript
- **Tailwind CSS** - Utility-first styling with custom design system
- **shadcn/ui** - High-quality, accessible UI components
- **GSAP** - Professional animations and micro-interactions
- **Radix UI** - Accessible primitives for complex components

### **Backend & Database**

- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Database-level security policies
- **Supabase Auth** - Authentication with social login support
- **Supabase Storage** - File storage for product images

### **Payments & Analytics**

- **Stripe** - Payment processing and subscription management
- **Google Analytics 4** - Enhanced ecommerce tracking
- **Facebook Pixel** - Social media conversion tracking
- **Custom Analytics** - Internal event tracking system

## 📁 Project Structure

```
vntg/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication pages
│   ├── products/                 # Product catalog pages
│   ├── categories/               # Category pages
│   ├── cart/                     # Cart and recovery pages
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── products/                 # Product-related components
│   ├── cart/                     # Shopping cart components
│   ├── navigation/               # Navigation components
│   ├── layout/                   # Layout components
│   └── providers/                # Context providers
├── lib/                          # Utilities and configurations
│   ├── auth/                     # Authentication utilities
│   ├── context/                  # React contexts
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── animations/               # GSAP animation utilities
│   └── validations/              # Zod validation schemas
├── docs/                         # Documentation
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Stripe account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/vntg.git
   cd vntg
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Analytics (optional)
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
   NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id
   ```

4. **Database setup**

   ```bash
   # Run database migrations
   npm run db:migrate

   # Seed sample data (optional)
   npm run db:seed
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

### **Core Documentation**

- [**Getting Started**](docs/getting-started.md) - Setup and installation guide
- [**Architecture Overview**](docs/architecture.md) - System design and patterns
- [**API Reference**](docs/api-reference.md) - Complete API documentation
- [**Database Schema**](docs/database-schema.md) - Database structure and relationships

### **Feature Documentation**

- [**Product Catalog**](docs/product-catalog.md) - Product management and browsing
- [**Shopping Cart**](docs/cart-system.md) - Cart functionality and integration
- [**Authentication**](docs/authentication.md) - User authentication and authorization
- [**Payments**](docs/payments.md) - Stripe integration and checkout flow

### **Development Guides**

- [**Component Library**](docs/components.md) - UI component documentation
- [**Styling Guide**](docs/styling.md) - Tailwind CSS and design system
- [**Animation System**](docs/animations.md) - GSAP animations and micro-interactions
- [**Testing Guide**](docs/testing.md) - Testing strategies and examples

### **Deployment & Operations**

- [**Deployment Guide**](docs/deployment.md) - Production deployment instructions
- [**Performance Guide**](docs/performance.md) - Optimization strategies
- [**Security Guide**](docs/security.md) - Security best practices
- [**Monitoring**](docs/monitoring.md) - Analytics and error tracking

## 🧪 Testing

### **Test Coverage**

- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for API routes
- E2E tests with Playwright

### **Running Tests**

```bash
# Unit and component tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### **Vercel (Recommended)**

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### **Self-Hosted**

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/vntg/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/vntg/discussions)
- **Email**: support@vntg.com

---

**Built with ❤️ by the VNTG Team**
