# Local Development Environment Guide

Complete guide for setting up and working with the VNTG e-commerce platform in local development.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Modes](#development-modes)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Workflows](#development-workflows)
- [Database Management](#database-management)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Quick Start

### One-Command Setup

```bash
# Run the automated setup script
./scripts/setup-local-dev.sh

# Or setup specific mode
./scripts/setup-local-dev.sh stub    # Stub mode only
./scripts/setup-local-dev.sh local   # Local database only
./scripts/setup-local-dev.sh remote  # Remote development only
```

### Start Development

```bash
# Stub mode (no external services)
npm run dev:stub

# Local database mode
npm run dev:local

# Remote development mode
npm run dev:remote
```

---

## Development Modes

The platform supports three distinct development modes, each optimized for different workflows:

### 1. Stub Mode (In-Memory Mocks)

**Best for:**
- UI/UX development
- Component development
- Offline work
- Fast iteration without dependencies
- Testing error states and edge cases

**Features:**
- No external services required
- Instant startup
- Predictable test data
- Simulated API responses
- File upload simulation
- Payment flow mocking

**Activate:**
```bash
npm run dev:stub
```

**Environment:** `.env.local.stub`

---

### 2. Local Database Mode

**Best for:**
- Full-stack development
- Database schema changes
- Testing with real database
- Auth flow development
- Isolated development environment

**Features:**
- Local Supabase instance via Docker
- PostgreSQL database
- GoTrue authentication
- Storage with file uploads
- Real-time subscriptions
- Local email testing (Inbucket)

**Prerequisites:**
- Docker Desktop installed and running
- Supabase CLI installed

**Activate:**
```bash
# Start Supabase
npm run db:start

# Switch to local mode and start dev server
npm run dev:local

# Access Supabase Studio
npm run db:studio
```

**Environment:** `.env.local.db`

**Service URLs:**
- API: http://127.0.0.1:54321
- Studio: http://localhost:54323
- Inbucket (Email): http://localhost:54324

---

### 3. Remote Development Mode

**Best for:**
- Testing with shared data
- Collaborating with team
- Testing production-like scenarios
- Edge function development

**Features:**
- Connects to remote Supabase project
- Shared database with team
- Real Stripe test mode
- Production-like environment

**Prerequisites:**
- Supabase project credentials
- Internet connection

**Setup:**
1. Update `.env.local.remote` with your Supabase credentials
2. Get credentials from: https://supabase.com/dashboard/project/_/settings/api

**Activate:**
```bash
npm run dev:remote
```

**Environment:** `.env.local.remote`

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node -v  # Check version
   ```
   Install from: https://nodejs.org/

2. **npm** (comes with Node.js)
   ```bash
   npm -v  # Check version
   ```

### Optional (for Local Database Mode)

3. **Docker Desktop**
   - Required for local Supabase
   - Install from: https://www.docker.com/products/docker-desktop
   - Verify: `docker info`

4. **Supabase CLI**
   ```bash
   # macOS
   brew install supabase/tap/supabase

   # Windows (via Scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase

   # Linux
   # See: https://supabase.com/docs/guides/cli

   # Verify
   supabase -v
   ```

---

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd vntg

# Install dependencies
npm install
```

### 2. Run Setup Script

```bash
# Automated setup for all modes
./scripts/setup-local-dev.sh

# Or setup specific mode
./scripts/setup-local-dev.sh stub
./scripts/setup-local-dev.sh local
./scripts/setup-local-dev.sh remote
```

### 3. Manual Setup (Alternative)

#### For Stub Mode:
```bash
# Copy stub environment
cp .env.local.stub .env.local

# Start development
npm run dev
```

#### For Local Database Mode:
```bash
# Copy local DB environment
cp .env.local.db .env.local

# Start Supabase
npm run db:start

# Apply migrations and seed data
npm run db:reset:local
npm run db:seed:local

# Start development
npm run dev
```

#### For Remote Development Mode:
```bash
# Copy remote environment
cp .env.local.remote .env.local

# Update with your credentials
# Edit .env.local with your Supabase project details

# Start development
npm run dev
```

---

## Development Workflows

### Switching Between Modes

```bash
# Check current mode
npm run dev:mode

# Switch to stub mode
npm run dev:stub

# Switch to local database
npm run dev:local

# Switch to remote
npm run dev:remote
```

The switcher:
- Backs up your current `.env.local`
- Copies the appropriate template
- Displays setup instructions

### Common Tasks

#### Working with Stubs

```bash
# Validate stub data
npm run validate:stubs

# Sync API stubs with schema
npm run sync:api-stubs

# Run stub-specific E2E tests
npm run test:e2e:stubs
```

#### Database Operations

```bash
# Start local Supabase
npm run db:start

# Stop local Supabase
npm run db:stop

# Check Supabase status
npm run db:status

# Open Supabase Studio
npm run db:studio

# Reset database (apply all migrations)
npm run db:reset:local

# Seed database with test data
npm run db:seed:local

# Create admin user
npm run db:create-admin
```

#### Docker Services

```bash
# Start additional services (Redis, etc.)
npm run docker:up

# Stop Docker services
npm run docker:down

# View Docker logs
npm run docker:logs

# Check Docker service status
npm run docker:ps
```

---

## Database Management

### Local Database Structure

The local database includes comprehensive test data:

**Users:**
- Admin: `admin@vntg.local` / Password: `TestPassword123!`
- Customer: `customer@vntg.local` / Password: `TestPassword123!`
- Additional test users

**Products:**
- 16 products across 6 categories
- Various inventory levels (in stock, low stock, out of stock)
- Featured and regular products

**Orders:**
- Sample orders in different states (pending, processing, completed, cancelled)
- Order history for test users

**Test Data IDs:**
All test data uses predictable UUIDs for easier testing:
- Users: `00000000-0000-0000-0000-00000000000X`
- Categories: `10000000-0000-0000-0000-00000000000X`
- Products: `20000000-0000-0000-0000-00000000000X`
- Orders: `30000000-0000-0000-0000-00000000000X`

### Migrations

```bash
# Create a new migration
supabase migration new migration_name

# Apply migrations to local DB
supabase db reset

# Check migration status
supabase migration list

# Push migrations to remote
supabase db push
```

### Seeding Data

The seed file (`supabase/seed.sql`) is automatically applied when you:
- Run `supabase db reset`
- Run `npm run db:seed:local`
- Start Supabase for the first time

To modify seed data:
1. Edit `supabase/seed.sql`
2. Run `npm run db:reset:local`

### Creating Test Users

Local auth users need to be created separately from the database records:

```bash
# Method 1: Via Supabase Studio
# 1. Open http://localhost:54323
# 2. Go to Authentication > Users
# 3. Add user manually

# Method 2: Via SQL
# Execute in Studio SQL editor:
```sql
-- Create auth user and public user record
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'customer@vntg.local',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

---

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Stub-specific tests
npm run test:e2e:stubs
```

### Test All

```bash
# Run type checking, linting, unit tests, and E2E tests
npm run test:all
```

---

## Troubleshooting

### Common Issues

#### 1. Docker Daemon Not Running

**Error:**
```
Cannot connect to the Docker daemon
```

**Solution:**
- Start Docker Desktop
- Wait for it to fully initialize
- Run `docker info` to verify

#### 2. Supabase Port Conflicts

**Error:**
```
Error: Port 54321 is already in use
```

**Solution:**
```bash
# Stop existing Supabase instance
npm run db:stop

# Or find and kill process using port
lsof -ti:54321 | xargs kill -9

# Restart Supabase
npm run db:start
```

#### 3. Migration Errors

**Error:**
```
Error applying migrations
```

**Solution:**
```bash
# Reset database completely
npm run db:stop
npm run db:start
npm run db:reset:local
```

#### 4. Stub Mode Not Working

**Error:**
```
Cannot find module '@/lib/stubs'
```

**Solution:**
- Verify `NEXT_PUBLIC_USE_STUBS=true` in `.env.local`
- Check that stub files exist in `lib/stubs/`
- Run `npm run validate:stubs`

#### 5. Authentication Issues

**Error:**
```
Invalid JWT token / Auth session expired
```

**Solution:**

For Local Mode:
- Ensure auth.users table has matching records
- Check JWT keys in `.env.local.db` match Supabase
- Clear browser storage and cookies

For Remote Mode:
- Verify credentials in `.env.local.remote`
- Check project is not paused in Supabase dashboard

#### 6. Environment Variable Issues

**Error:**
```
Missing environment variables
```

**Solution:**
```bash
# Check current mode
npm run dev:mode

# Re-copy environment file
cp .env.local.stub .env.local  # or .db or .remote

# Verify variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Debug Mode

Enable verbose logging:

```bash
# In your .env.local, add:
VERBOSE_LOGGING=true
DEBUG_STUBS=true
DEBUG_SQL=true
```

### Reset Everything

If all else fails:

```bash
# Stop all services
npm run db:stop
npm run docker:down

# Clean installation
rm -rf node_modules
rm -rf .next
rm .env.local

# Reinstall
npm install

# Run setup again
./scripts/setup-local-dev.sh
```

---

## Best Practices

### Development Workflow

1. **Start with Stub Mode** for UI development
2. **Switch to Local DB** when testing full flows
3. **Use Remote Mode** for integration testing

### Environment Management

- Never commit `.env.local` to version control
- Keep `.env.local.stub`, `.env.local.db`, `.env.local.remote` as templates
- Document any new environment variables
- Use the mode switcher to change environments safely

### Database Best Practices

- Always use migrations for schema changes
- Never modify the database directly in production
- Test migrations locally before pushing
- Keep seed data comprehensive and realistic
- Use predictable IDs for test data

### Testing Best Practices

- Write tests alongside features
- Use stubs for fast unit tests
- Use local DB for integration tests
- Run full test suite before committing
- Mock external services (Stripe, email) in tests

### Code Organization

- Keep stub data in `lib/stubs/`
- Keep fixtures in `lib/fixtures/`
- Keep scripts in `scripts/`
- Keep migrations in `supabase/migrations/`
- Document complex workflows

### Performance Tips

**Stub Mode:**
- Fastest startup time
- No database overhead
- Ideal for rapid iteration

**Local DB Mode:**
- Restart Supabase only when needed
- Use `npm run db:status` to check if running
- Leverage Supabase Studio for quick data inspection

**Docker:**
- Start only services you need
- Use profiles: `docker-compose --profile mailhog up -d`
- Monitor resource usage: `docker stats`

---

## Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Playwright Documentation](https://playwright.dev/)

### Project Documentation

- `CLAUDE.md` - Project overview and patterns
- `README.md` - General project information
- `CONTRIBUTING.md` - Contribution guidelines

### Useful Commands Reference

```bash
# Development
npm run dev:stub              # Start with stubs
npm run dev:local             # Start with local DB
npm run dev:remote            # Start with remote DB
npm run dev:mode              # Check current mode

# Database
npm run db:start              # Start Supabase
npm run db:stop               # Stop Supabase
npm run db:status             # Check status
npm run db:studio             # Open Studio UI
npm run db:reset:local        # Reset local DB
npm run db:seed:local         # Seed local DB

# Docker
npm run docker:up             # Start Docker services
npm run docker:down           # Stop Docker services
npm run docker:logs           # View logs
npm run docker:ps             # Check status

# Testing
npm run test                  # Unit tests
npm run test:watch            # Unit tests (watch)
npm run test:e2e              # E2E tests
npm run test:all              # All tests

# Code Quality
npm run lint                  # Run linter
npm run lint:fix              # Fix linting issues
npm run type-check            # TypeScript check
npm run format                # Format code

# Setup
./scripts/setup-local-dev.sh  # Full setup
npm run setup:local:stub      # Setup stub mode
npm run setup:local:db        # Setup local DB
npm run setup:local:remote    # Setup remote mode
```

---

## Getting Help

### Common Questions

**Q: Which mode should I use?**
A: Start with stub mode for UI work, switch to local DB for full-stack development.

**Q: How do I add new test data?**
A: Edit `supabase/seed.sql` and run `npm run db:reset:local`.

**Q: Can I use multiple modes at once?**
A: No, but you can quickly switch between them using `npm run dev:stub/local/remote`.

**Q: How do I test payments locally?**
A: Use Stripe test mode with test card numbers. See [Stripe Testing](https://stripe.com/docs/testing).

**Q: Where are uploaded files stored locally?**
A: In Supabase Storage at `<supabase_project_dir>/storage/`.

### Support

- Check `CLAUDE.md` for project-specific guidance
- Review this documentation thoroughly
- Check the troubleshooting section
- Search existing issues in the repository

---

## Summary

You now have a complete local development environment with:

- Three flexible development modes
- Comprehensive test data and fixtures
- Automated setup and switching
- Local database with Supabase
- Docker support for additional services
- Complete testing infrastructure

Happy coding! 🚀
