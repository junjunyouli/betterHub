---
description: Coding style and conventions for the betterHub Turborepo, enforced by Biome/ultracite.
globs: **/*.{ts,tsx}
---

# Coding Style

## Formatting (enforced by Biome + ultracite)

- Run `npm run check` (ultracite check) before committing; use `npm run fix` to auto-fix.
- Indentation is **tabs**, not spaces (`formatter.indentStyle: "tab"`).
- Use **double quotes** for strings in JS/TS.
- Imports are auto-organized (`organizeImports: on`) — do not hand-sort.
- Do not edit generated files (e.g. `routeTree.gen.ts`, `convex/_generated`); they are excluded from linting.

## TypeScript

- TypeScript everywhere; prefer explicit, well-typed public APIs.
- Do not annotate types that can be inferred (`noInferrableTypes`).
- Use `as const` assertions where appropriate (`useAsConstAssertion`).
- Enums must have explicit initializers (`useEnumInitializers`).
- Never reassign function parameters (`noParameterAssign`); default parameters go last (`useDefaultParameterLast`).
- One variable per declarator (`useSingleVarDeclarator`); avoid `else` after a return (`noUselessElse`).
- Use the `Number` namespace (`Number.parseInt`, `Number.isNaN`) rather than globals.
- Validate external input and env with **zod**.

## React (web app)

- Self-close elements with no children (`useSelfClosingElements`).
- `useExhaustiveDependencies` is informational — keep hook dependency arrays complete and intentional.
- Compose Tailwind classes with `cn` / `clsx` / `cva`; class lists are auto-sorted (`useSortedClasses`), so let the formatter order them.
- Use TanStack Router for routing; keep route trees generated, not hand-edited.

## Server (Hono + tRPC)

- Define API surface as typed tRPC procedures; share types with the web app rather than duplicating.
- Keep auth handled through Better-Auth; do not roll custom session logic.

## Database (Drizzle + PostgreSQL)

- Model schema with Drizzle in the `@betterHub/db` package.
- Change the schema via migrations: `npm run db:generate`, then `npm run db:migrate` (or `db:push` for local dev).
- Do not write raw SQL migrations by hand when Drizzle can generate them.

## Monorepo conventions

- Workspaces live under `apps/*` and `packages/*`; run tasks through Turborepo (`turbo run <task>`) or the root scripts.
- Target a single workspace with `-F <name>` (e.g. `npm run dev:web`, `npm run dev:server`).
- Reference internal packages by their workspace name (e.g. `@betterHub/env`, `@betterHub/config`), not relative paths across packages.
