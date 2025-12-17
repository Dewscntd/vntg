# Quick Reference - Local Development

## One-Line Setup

```bash
./scripts/setup-local-dev.sh && npm run dev:stub
```

---

## Development Modes

| Mode | Command | Use Case |
|------|---------|----------|
| **Stub** | `npm run dev:stub` | UI development, offline work |
| **Local DB** | `npm run dev:local` | Full-stack, database changes |
| **Remote** | `npm run dev:remote` | Team collaboration, testing |

---

## Most Used Commands

```bash
# Development
npm run dev:stub              # Start with stubs
npm run dev:local             # Start with local DB (requires Docker)
npm run dev:mode              # Check current mode

# Database (Local Mode)
npm run db:start              # Start Supabase
npm run db:stop               # Stop Supabase
npm run db:studio             # Open Studio UI (localhost:54323)
npm run db:reset:local        # Reset & migrate
npm run db:seed:local         # Seed test data

# Testing
npm run test                  # Unit tests
npm run test:e2e              # E2E tests
npm run lint                  # Check code quality
```

---

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@vntg.local` | `TestPassword123!` | Admin |
| `customer@vntg.local` | `TestPassword123!` | Customer |

---

## Service URLs (Local Mode)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Supabase API | http://127.0.0.1:54321 |
| Studio UI | http://localhost:54323 |
| Email Testing | http://localhost:54324 |
| Redis | localhost:6379 |

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker error | Start Docker Desktop |
| Port conflict | `npm run db:stop && npm run db:start` |
| Auth error | Clear browser storage, check .env.local |
| Migration error | `npm run db:reset:local` |
| Lost mode | `npm run dev:mode` to check |

---

## File Locations

```
.env.local.stub     → Stub mode config
.env.local.db       → Local DB config
.env.local.remote   → Remote config
.env.local          → Active config (auto-switched)

lib/fixtures/       → Test data
supabase/seed.sql   → Database seed
supabase/config.toml → Supabase config
```

---

## Switching Modes

```bash
# The scripts handle environment switching automatically
npm run dev:stub    # Copies .env.local.stub → .env.local
npm run dev:local   # Copies .env.local.db → .env.local
npm run dev:remote  # Copies .env.local.remote → .env.local
```

---

## First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Run setup (installs Supabase CLI if needed)
./scripts/setup-local-dev.sh

# 3. Start developing
npm run dev:stub    # No dependencies needed
# OR
npm run db:start && npm run dev:local  # With local database
```

---

## Docker Services

```bash
# Start Redis + optional services
npm run docker:up

# Stop all Docker services
npm run docker:down

# View logs
npm run docker:logs

# Check status
npm run docker:ps
```

---

## Import Test Data

```typescript
// Import all fixtures
import { fixtures } from '@/lib/fixtures';

// Import specific items
import {
  adminUser,
  customerUser,
  denimJacket,
  floralDress,
  completedOrder
} from '@/lib/fixtures';

// Use in tests
expect(completedOrder.total).toBe(249.97);
```

---

## Database IDs

Test data uses predictable UUIDs:

```
Users:     00000000-0000-0000-0000-00000000000X
Categories: 10000000-0000-0000-0000-00000000000X
Products:   20000000-0000-0000-0000-00000000000X
Orders:     30000000-0000-0000-0000-00000000000X
```

---

## Documentation

| File | Purpose |
|------|---------|
| `LOCAL_DEVELOPMENT.md` | Complete guide (14,000+ words) |
| `SETUP_SUMMARY.md` | Setup overview |
| `QUICK_REFERENCE.md` | This file |
| `lib/fixtures/README.md` | Fixture documentation |

---

## Getting Help

1. Check `LOCAL_DEVELOPMENT.md` (troubleshooting section)
2. Run `npm run dev:mode` to verify mode
3. Try `./scripts/setup-local-dev.sh` to reset
4. Check Docker is running (for local mode)
5. Verify environment file exists (`.env.local`)

---

## Pro Tips

- Start with **stub mode** for UI work (fastest)
- Use **local DB mode** for backend/database work
- Use **remote mode** for integration testing
- Keep `LOCAL_DEVELOPMENT.md` bookmarked
- Run `npm run test:all` before committing
- Use Studio UI for quick database inspection
- Check `npm run docker:logs` if services fail

---

## Reset Everything

```bash
# Nuclear option (fixes 99% of issues)
npm run db:stop
npm run docker:down
rm .env.local
./scripts/setup-local-dev.sh
npm run dev:stub
```

---

**For detailed information, see `LOCAL_DEVELOPMENT.md`**
