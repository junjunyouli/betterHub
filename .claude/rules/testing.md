---
description: Testing and verification rules for the betterHub Turborepo monorepo
globs:
---

# Testing

## Current State

There is no dedicated unit/E2E test runner (Vitest, Jest, Playwright) configured
in this repo yet. Verification currently relies on the TypeScript type-checker and
the Biome/ultracite linter. Treat both as required gates before considering work done.

## Required Checks

- `npm run check-types` — run Turborepo `check-types` across all workspaces; must pass with zero type errors.
- `npm run check` — run `ultracite check` (Biome) lint/format verification; must pass clean.
- Run both from the repo root so Turborepo can cache and fan out across `apps/*` and `packages/*`.
- Fix issues at the source. Do not silence errors with `@ts-ignore`, `any`, or `biome-ignore` unless justified with a comment.

## Adding a Test Runner

- Prefer **Vitest** for TypeScript unit/integration tests to match the ESM (`"type": "module"`) setup.
- Add a `test` task to each package's `package.json` and wire it into `turbo.json` so `turbo run test` fans out and caches results.
- Co-locate tests next to source as `*.test.ts` / `*.test.tsx`, or under a `__tests__/` folder in the workspace.

## Per-Domain Guidance

### Frontend (`apps/web` — React + TanStack Router)
- Use Vitest + `@testing-library/react` for component tests; assert on user-visible behavior, not implementation details.
- Test router loaders and route guards; mock tRPC calls at the client boundary.
- Reserve Playwright for critical end-to-end user flows only.

### Backend (`apps/server`, `packages/api` — Hono + tRPC)
- Unit-test tRPC procedures and Hono handlers directly by invoking them with mock context; avoid a full network round-trip where possible.
- Test authentication and authorization paths (Better-Auth) explicitly, including unauthenticated and forbidden cases.
- Assert on Zod input/output validation for every procedure.

### Database (`packages/db` — Drizzle ORM + PostgreSQL)
- Integration-test queries and migrations against a disposable/ephemeral Postgres instance, never a shared or production database.
- Reset state between tests (transaction rollback or truncate) to keep tests isolated and deterministic.
- Keep Drizzle schema changes in sync via `npm run db:generate` and verify migrations apply cleanly.

## Conventions

- Tests must be deterministic: no reliance on wall-clock time, network, or ordering between tests.
- Every bug fix should add a regression test (once a runner exists) that fails before the fix and passes after.
- CI-equivalent gate before merge: `npm run check-types` and `npm run check` both green.
