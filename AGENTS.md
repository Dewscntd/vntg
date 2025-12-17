# Repository Guidelines

## Project Structure & Module Organization
The app router lives in `app/[locale]`, organized by feature areas such as `shop`, `checkout`, and `admin`. Shared React building blocks sit in `components`, reusable hooks in `hooks`, domain logic in `lib`, types in `types`, and localization strings in `i18n`. Test suites are split under `tests/unit`, `tests/integration`, and `tests/e2e`, with helpers in `tests/utils` and network fixtures in `tests/mocks`. Infrastructure, deployment, and database automation scripts reside in `scripts`, `k8s`, and `supabase`.

## Build, Test, and Development Commands
Use `npm run dev:stub`, `npm run dev:local`, or `npm run dev:remote` to start the Next.js dev server in the desired data mode after running `./scripts/setup-local-dev.sh`. Bundle with `npm run build` and serve production with `npm run start`. `npm run lint`, `npm run type-check`, and `npm run format:check` keep the codebase consistent; `npm run format` applies Prettier fixes. Database workflows rely on the Supabase CLI: `npm run db:migrate`, `npm run db:reset:local`, and `npm run db:seed`.

## Coding Style & Naming Conventions
Write TypeScript with Prettier’s two-space indentation and single quotes. Favor PascalCase for React components, camelCase for variables and functions, and kebab-case for file paths within feature folders (for example, `landing-hero.tsx`). Styling belongs in Tailwind utility classes; configure shared tokens in `tailwind.config.js` and component registry entries in `components.json`. Run `npm run lint` before pushing to satisfy Next.js ESLint rules plus Prettier and Tailwind plugins.

## Testing Guidelines
Unit and integration tests use Jest with Testing Library; colocate specs under the matching folder and name them `*.test.ts` or `*.test.tsx`. End-to-end flows use Playwright (`npm run test:e2e` or `npm run test:e2e:headed`). Maintain coverage by running `npm run test:ci`, which drops reports in `coverage/`. When adding features, pair them with at least one Jest spec and refresh Playwright journeys whenever user-visible flows change.

## Commit & Pull Request Guidelines
Follow the Conventional Commit verbs seen in history (`feat:`, `fix:`, `temp:`). Scopes are optional but encouraged (for example, `feat(admin): ...`). Keep commits focused on a single behavior change. PRs should include context, the tests you executed, links to related Supabase migrations or scripts, and screenshots or recordings for UI adjustments. If the change depends on a dev mode, note whether it was validated in stub and local database configurations.
