# VNTG Development Guide

Complete guide for setting up and developing the VNTG e-commerce platform locally.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm/yarn/pnpm
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **Supabase Account** (free tier available)
- **Stripe Account** (test mode)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/vntg.git
cd vntg
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# Create admin user
npm run db:create-admin

# Seed sample data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to see your application.

## 🏗️ Project Architecture

### Directory Structure
```
vntg/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin panel
│   ├── admin-direct/      # Direct admin access
│   ├── api/              # API routes
│   ├── account/          # User account pages
│   ├── checkout/         # Checkout flow
│   ├── products/         # Product pages
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── cart/             # Shopping cart components
│   ├── checkout/         # Checkout components
│   ├── layout/           # Layout components
│   ├── navigation/       # Navigation components
│   ├── orders/           # Order components
│   └── products/         # Product components
├── lib/                  # Utilities and configurations
│   ├── auth/             # Authentication logic
│   ├── config/           # App configuration
│   ├── context/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── stripe/           # Stripe integration
│   ├── supabase/         # Supabase client
│   ├── utils/            # Utility functions
│   └── validations/      # Form validation schemas
├── docs/                 # Documentation
├── public/               # Static assets
├── supabase/             # Database schema and migrations
├── tests/                # Test files
└── types/                # TypeScript definitions
```

### Key Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality UI components
- **Supabase**: Backend-as-a-Service (PostgreSQL)
- **Stripe**: Payment processing
- **GSAP**: Advanced animations
- **Zod**: Schema validation

## 🔧 Development Tools

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🗄️ Database Development

### Local Database Setup

#### Option 1: Supabase Cloud (Recommended)
1. Create project at [supabase.com](https://supabase.com)
2. Get your project URL and keys
3. Run migrations: `npm run db:migrate`

#### Option 2: Local Supabase
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local instance
supabase start

# Apply migrations
supabase db reset
```

### Database Migrations
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
npm run db:migrate

# Reset database
npm run db:reset
```

### Database Schema
Key tables and relationships:
```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  role VARCHAR DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  inventory_count INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status VARCHAR DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI Development

### Component Development
```typescript
// Component template
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function Component({ className, children }: ComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}
```

### Styling Guidelines
```typescript
// Use Tailwind CSS classes
className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"

// Use design tokens from lib/design/design-tokens.ts
import { colors, spacing, typography } from '@/lib/design/design-tokens';

// Use CSS variables for consistent theming
className="bg-primary text-primary-foreground"
```

### Animation Development
```typescript
// GSAP animations
import { useGSAP } from '@/lib/hooks/use-gsap';

export function AnimatedComponent() {
  const { scope } = useGSAP(() => {
    gsap.from('.animate-in', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1
    });
  });

  return (
    <div ref={scope}>
      <div className="animate-in">Content</div>
    </div>
  );
}
```

## 🔌 API Development

### API Route Structure
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Your API logic here
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ products: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Authentication in API Routes
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  
  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Admin-only logic here
}
```

## 🧪 Testing

### Test Setup
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Unit Testing
```typescript
// utils.test.ts
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats ILS correctly', () => {
    expect(formatCurrency(1234.56, 'ILS')).toBe('₪1,234.56');
  });
});
```

### Component Testing
```typescript
// components/product-card.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/products/product-card';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  image_url: 'https://example.com/image.jpg'
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

### E2E Testing
```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete shopping flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Browse products
  await page.click('[data-testid="product-card"]:first-child');
  
  // Add to cart
  await page.click('[data-testid="add-to-cart"]');
  
  // Go to cart
  await page.click('[data-testid="cart-button"]');
  
  // Proceed to checkout
  await page.click('[data-testid="checkout-button"]');
  
  // Verify checkout page
  await expect(page).toHaveURL(/.*checkout/);
});
```

## 🚀 Performance

### Development Optimization
```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    domains: ['localhost', 'supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for duplicate dependencies
npx duplicate-package-checker

# Lighthouse CI
npx lighthouse-ci autorun
```

### Code Splitting
```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <div>Loading...</div>,
});
```

## 🐛 Debugging

### Development Debugging
```typescript
// Console debugging
console.log('Debug info:', { variable });

// React DevTools profiling
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Render:', { id, phase, actualDuration });
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

### Database Debugging
```sql
-- Check database connections
SELECT * FROM pg_stat_activity;

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 'uuid';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'products';
```

### Network Debugging
```bash
# Check API responses
curl -X GET http://localhost:3000/api/products | jq

# Monitor network requests
# Use browser DevTools Network tab
```

## 📚 Common Development Tasks

### Adding New Components
```bash
# Create component file
touch components/ui/new-component.tsx

# Add to index file
echo "export * from './new-component';" >> components/ui/index.ts

# Create story (if using Storybook)
touch components/ui/new-component.stories.tsx
```

### Adding New API Routes
```bash
# Create API route
mkdir -p app/api/new-endpoint
touch app/api/new-endpoint/route.ts

# Add validation schema
touch lib/validations/new-endpoint.ts

# Add tests
touch tests/integration/api/new-endpoint.test.ts
```

### Database Changes
```bash
# Create migration
supabase migration new add_new_table

# Edit migration file
vim supabase/migrations/timestamp_add_new_table.sql

# Apply migration
npm run db:migrate

# Update TypeScript types
npm run db:generate-types
```

## 🔧 Troubleshooting

### Common Issues

#### Module Resolution
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

#### Database Connection
```typescript
// Test database connection
const { data, error } = await supabase.from('products').select('count');
if (error) console.error('DB Error:', error);
```

#### Stripe Webhooks (Local Development)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📝 Code Style Guidelines

### TypeScript
```typescript
// Use explicit types
interface Product {
  id: string;
  name: string;
  price: number;
}

// Use type guards
function isProduct(obj: any): obj is Product {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

// Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API Error:', error);
  throw new Error('Failed to fetch data');
}
```

### React Patterns
```typescript
// Use proper component patterns
export function Component({ prop1, prop2, ...rest }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState();
  const query = useQuery();

  // Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // Render
  return <div {...rest}>Content</div>;
}

// Use proper prop types
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
  className?: string;
}
```

## 🔄 Git Workflow

### Branch Naming
```bash
feature/add-product-reviews
bugfix/fix-cart-calculation
hotfix/security-patch
refactor/update-api-structure
```

### Commit Messages
```bash
# Format: type(scope): description
feat(products): add product review system
fix(cart): resolve calculation error
docs(api): update endpoint documentation
refactor(auth): simplify authentication flow
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with tests
3. Run `npm run test:all`
4. Create pull request
5. Code review and approval
6. Merge to `main`

## 📞 Getting Help

### Resources
- **Documentation**: `/docs` directory
- **API Reference**: `/docs/API_REFERENCE.md`
- **Component Library**: Storybook (if set up)
- **Database Schema**: Supabase Dashboard

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Architecture and development questions
- **Discord/Slack**: Real-time development chat

---

## ✅ Development Checklist

### Setup Checklist
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] Development server running
- [ ] Admin user created

### Before Committing
- [ ] Code linted (`npm run lint`)
- [ ] Types checked (`npm run type-check`)
- [ ] Tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)

### Code Quality
- [ ] Components have proper TypeScript types
- [ ] API routes have proper error handling
- [ ] Database queries use proper RLS policies
- [ ] UI components are accessible
- [ ] Performance optimizations applied

**Happy coding! 🚀**