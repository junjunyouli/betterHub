---
description: Frontend conventions for the React + TanStack + tRPC web app
globs: ["apps/web/**", "packages/ui/**"]
---

# Frontend Rules

## Stack
- React 19 + TypeScript, built with Vite (`apps/web`).
- Routing: TanStack Router with file-based routes in `apps/web/src/routes`; `routeTree.gen.ts` is generated — never edit it by hand.
- Data fetching: TanStack Query via the tRPC client (`@trpc/tanstack-react-query`); do not call `fetch` directly for server data.
- Forms: TanStack React Form (`@tanstack/react-form`) with Zod resolvers for validation.
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`); shared components live in `packages/ui` (shadcn/ui). Prefer reusing/extending `packages/ui` over duplicating components.
- Auth: Better-Auth client; use its hooks/session, do not roll custom auth flows.
- Toasts: `sonner`. Theming: `next-themes`. Icons: `lucide-react`.

## Conventions
- Keep all server-communication types end-to-end typed through tRPC + Zod; never hand-write API response types.
- Colocate route-specific components under the route; promote shared UI to `packages/ui`.
- Use the workspace aliases (`@betterHub/ui`, `@betterHub/api`, `@betterHub/env`) instead of deep relative imports across packages.
- Read env only through `@betterHub/env`; do not access `import.meta.env` / `process.env` directly in app code.
- Components are function components with hooks; no class components.

## Quality
- Lint/format with Ultracite (Biome): run `npm run check` before finishing.
- Type-check with `npm run check-types` (runs `vite build && tsc --noEmit`); the build must pass with no type errors.
- No `any`; prefer inferred or explicit types and Zod-derived types.
