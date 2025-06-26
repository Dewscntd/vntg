# Getting Started with VNTG

This guide will help you set up the VNTG e-commerce platform locally and understand the project structure.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm, yarn, or pnpm** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - Code editor

### Required Accounts

- **Supabase Account** - [Sign up here](https://supabase.com/)
- **Stripe Account** - [Sign up here](https://stripe.com/)
- **Vercel Account** (for deployment) - [Sign up here](https://vercel.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/vntg.git
cd vntg
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

#### Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Wait for the project to be ready
4. Copy the project URL and anon key to your `.env.local`

#### Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Seed Sample Data (Optional)

```bash
npm run db:seed
```

### 5. Stripe Setup

#### Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your publishable and secret keys
3. Add them to your `.env.local`

#### Set Up Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `http://localhost:3000/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook secret to your `.env.local`

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vntg/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── products/                 # Product catalog
│   │   ├── [id]/                 # Product detail pages
│   │   └── page.tsx              # Products listing
│   ├── categories/               # Category pages
│   │   └── [id]/
│   ├── cart/                     # Shopping cart
│   │   ├── recovery/             # Cart recovery
│   │   └── page.tsx              # Cart page
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   └── webhooks/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── products/                 # Product components
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── browse/               # Browse components
│   │   ├── detail/               # Detail components
│   │   └── skeletons/            # Loading states
│   ├── cart/                     # Cart components
│   │   ├── cart-button.tsx
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   └── ...
│   ├── navigation/               # Navigation components
│   ├── layout/                   # Layout components
│   └── providers/                # Context providers
├── lib/                          # Utilities and configurations
│   ├── auth/                     # Authentication
│   ├── context/                  # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utility functions
│   ├── animations/               # GSAP animations
│   ├── validations/              # Zod schemas
│   └── supabase.ts               # Supabase client
├── docs/                         # Documentation
├── types/                        # TypeScript definitions
├── public/                       # Static assets
└── package.json                  # Dependencies
```

## Key Concepts

### App Router

VNTG uses Next.js 14's App Router for:

- File-based routing
- Server and client components
- Nested layouts
- Loading and error states

### Component Architecture

- **UI Components**: Base components from shadcn/ui
- **Feature Components**: Business logic components
- **Layout Components**: Page structure components
- **Provider Components**: Context and state management

### State Management

- **React Context**: Global state (auth, cart)
- **Local State**: Component-specific state
- **Server State**: API data with caching
- **Persistent State**: localStorage for offline support

### Styling

- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Theme customization
- **Component Variants**: Consistent design system
- **Responsive Design**: Mobile-first approach

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Test locally
npm run dev

# Run tests
npm run test

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature
```

### 2. Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run all checks
npm run check
```

### 3. Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage
npm run test:e2e         # Run E2E tests

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed sample data
npm run db:reset         # Reset database

# Deployment
npm run deploy           # Deploy to Vercel
```

## Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Your Supabase service role key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Stripe publishable key
STRIPE_SECRET_KEY=                   # Stripe secret key
STRIPE_WEBHOOK_SECRET=               # Stripe webhook secret
```

### Optional Variables

```env
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=   # Google Analytics ID
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=   # Facebook Pixel ID

# App Configuration
NEXT_PUBLIC_APP_URL=             # App URL (for production)
NEXT_PUBLIC_APP_NAME=            # App name
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Environment Variables Not Loading

```bash
# Check file name
ls -la .env*

# Restart development server
npm run dev
```

### Database Connection Issues

```bash
# Check Supabase project status
# Verify environment variables
# Check network connection
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Explore the Codebase**: Start with `app/page.tsx` and follow the component tree
2. **Read Documentation**: Check out the [Architecture Guide](architecture.md)
3. **Try Features**: Test the product catalog and shopping cart
4. **Make Changes**: Start with small UI tweaks
5. **Run Tests**: Ensure everything works correctly

## Getting Help

- **Documentation**: Check the [docs/](.) folder
- **Issues**: Create a GitHub issue
- **Discussions**: Join GitHub discussions
- **Community**: Join our Discord server

---

Welcome to VNTG! Happy coding! 🚀
