# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev           # Start development server on localhost:3000
npm run build         # Build for production
npm run start         # Start production server
npm run type-check    # TypeScript type checking (run before committing)
npm run lint          # ESLint checking
npm run lint:fix      # Fix linting issues automatically
```

### Testing
```bash
npm run test          # Run unit tests with Jest
npm run test:watch    # Run Jest in watch mode
npm run test:coverage # Generate test coverage report
npm run test:e2e      # Run Playwright end-to-end tests
npm run test:all      # Run all tests (type-check, lint, unit, e2e)
```

### Database Operations
```bash
npm run db:migrate    # Apply database migrations
npm run db:seed       # Seed sample data
npm run db:create-admin # Create admin user
```

## Architecture Overview

This is a **Next.js 14 e-commerce platform** using:
- **App Router** with TypeScript
- **Supabase** for database, auth, and storage
- **Stripe** for payment processing
- **Tailwind CSS** + **shadcn/ui** for styling
- **GSAP** for animations

### Key Patterns

1. **Context + Custom Hooks Pattern**: Global state (cart, auth) managed via React Context with custom hooks like `useCart()`, `useAuth()`

2. **API Route Structure**: RESTful routes in `/app/api/` with consistent error handling and middleware

3. **Component Organization**: Atomic design structure - atoms in `/components/ui/`, larger components organized by domain (cart, products, auth)

4. **Authentication Flow**: Supabase Auth with middleware protection for `/admin`, `/account`, `/checkout` routes

### Critical Files

- `middleware.ts` - Route protection and authentication
- `lib/context/cart-context.tsx` - Shopping cart state management  
- `lib/supabase/client.ts` & `lib/supabase/server.ts` - Database connections
- `lib/stripe/client.ts` & `lib/stripe/server.ts` - Payment processing
- `app/layout.tsx` - Root layout with providers

### Database Schema

- Users, products, categories, cart_items, orders tables
- Row Level Security (RLS) policies enforce data access
- Custom database functions for cart totals and inventory

### State Management

- **Server State**: API calls to Supabase
- **Global State**: React Context (cart, auth, checkout)
- **Local State**: Component state with `useState`
- **Persistent State**: LocalStorage for cart (unauthenticated users)

## Development Guidelines

### Adding New Features
1. Create components in appropriate domain folder (`/components/[domain]/`)
2. Add API routes following RESTful conventions
3. Use existing validation schemas in `/lib/validations/`
4. Follow established patterns for hooks and context

### Database Changes
1. Create migration files in `/supabase/migrations/`
2. Update TypeScript types in `/types/supabase.ts`
3. Run `npm run db:migrate` to apply changes

### Authentication
- Protected routes use middleware automatically
- API routes get user from `createServerComponentClient`
- Client components use `useAuth()` hook

### Testing Strategy
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- E2E tests with Playwright for critical user flows
- API tests in `/tests/integration/`

### Performance Considerations
- Uses Next.js Image optimization
- GSAP animations with hardware acceleration
- Code splitting by route and component
- Caching strategies for API responses

## Common Workflows

### Adding a Product Feature
1. Update product schema/validation
2. Create API endpoints in `/app/api/products/`
3. Build components in `/components/products/`
4. Add pages in `/app/products/`
5. Test with both unit and E2E tests

### Cart Modifications
- Cart state is managed in `cart-context.tsx`
- API endpoints in `/app/api/cart/`
- Local storage sync for unauthenticated users
- Analytics tracking built into cart actions

### Payment Integration
- Stripe client/server setup in `/lib/stripe/`
- Checkout flow in `/app/checkout/`
- Webhook handling in `/app/api/webhooks/stripe/`
- Order creation tied to successful payments

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Key Dependencies

- `@supabase/auth-helpers-nextjs` - Supabase integration
- `@stripe/stripe-js` & `stripe` - Payment processing  
- `@radix-ui/*` - Accessible UI primitives
- `gsap` - Animation library
- `zod` - Schema validation
- `@playwright/test` - E2E testing