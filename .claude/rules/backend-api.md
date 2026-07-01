---
description: Backend API 规范 —— Hono + tRPC 服务端约定（路由、认证、输入校验、错误处理、数据访问）
globs: apps/server/**, packages/api/**, packages/auth/**
---

# Backend API 规范

本项目服务端为 `apps/server`（Hono 运行时入口），API 逻辑集中在 `packages/api`（tRPC）。
认证在 `packages/auth`（Better-Auth），数据访问在 `packages/db`（Drizzle + PostgreSQL）。

## 分层与目录

- `apps/server/src/app.ts` 只负责组装 Hono 应用：中间件、CORS、挂载 Better-Auth handler 与 tRPC handler。不要在此写业务逻辑。
- 业务逻辑写在 `packages/api/src/routers/*.ts`，每个领域一个 router 文件，统一在 `routers/index.ts` 合并进 `appRouter`。
- tRPC 初始化、`publicProcedure` / `protectedProcedure` 定义在 `packages/api/src/index.ts`，请求上下文在 `packages/api/src/context.ts`。

## 路由与 procedure

- 新增领域时创建 `packages/api/src/routers/<domain>.ts`，导出 `export const <domain>Router = router({ ... })`，并在 `routers/index.ts` 挂载。
- 需要登录的接口一律用 `protectedProcedure`；仅健康检查/公开信息用 `publicProcedure`。
- 读操作用 `.query()`，写操作用 `.mutation()`。命名用动词化短名（`getAll`、`getToday`、`create`、`update`、`toggle`、`delete`）。
- `appRouter` 类型通过 `export type AppRouter = typeof appRouter` 暴露给前端，保持端到端类型安全；不要手写前端请求类型。

## 输入校验

- 所有带输入的 procedure 必须用 `.input(z.object({ ... }))` 定义 Zod schema，禁止直接消费未校验的原始参数。
- 复用的枚举/子 schema 提取为常量（如 `const categorySchema = z.enum([...])`），可选字段用 `.optional()` / `.nullish()`，带默认值用 `.default(...)`。
- 校验规则贴合业务：字符串必填用 `z.string().min(1)`，id 用 `z.number()`。

## 认证与上下文

- 上下文由 `createContext` 通过 `auth.api.getSession({ headers })` 解析 session；procedure 内通过 `ctx.session` 访问。
- `protectedProcedure` 已保证 `ctx.session` 非空并透传，procedure 内直接用 `ctx.session.user.id`，不要重复判空。
- Better-Auth 的 HTTP 路由挂在 `/api/auth/*`，tRPC 挂在 `/trpc/*`；不要改动这两个前缀约定。
- CORS 的 `origin` 来自 `env.CORS_ORIGIN`，`credentials: true`；新增跨域来源改环境变量，不要硬编码。

## 数据访问

- 通过 `@betterHub/db` 的 `db` 与 `@betterHub/db/schema/*` 的表定义访问数据库，使用 Drizzle 查询构造器（`eq`、`and`、`or`、`gte`、`lt`、`isNull`、`sql`）。
- 所有按用户隔离的查询/写入必须带 `eq(table.userId, ctx.session.user.id)` 条件，防止越权访问他人数据。
- 写操作（update/delete/toggle）用 `.returning({ id: ... })`，据返回行数判断资源是否存在/归属当前用户。
- 需要原子聚合时用 `sql` 模板（如 `count(*) filter (where ...)`），并对可能为空的结果做 `?? 0` 兜底。

## 错误处理

- 抛错统一用 `TRPCError`，选择语义化 `code`：无 session → `UNAUTHORIZED`，参数不合法/无可更新字段 → `BAD_REQUEST`，资源不存在或不属于当前用户 → `NOT_FOUND`。
- 写操作 `returning` 结果为空（`result.length === 0`）时抛 `NOT_FOUND`，不要静默返回成功。
- 提供简洁的 `message`，不要把内部实现细节/敏感信息泄露到错误消息中。

## 环境与配置

- 环境变量统一经 `@betterHub/env`（server 侧从 `@betterHub/env/server`）读取，禁止直接 `process.env` 散读。
- 服务端依赖通过 workspace 包 `@betterHub/*` 引用，跨包逻辑放到对应包而非在 `apps/server` 内联。

## 校验命令

- 类型检查：`npm run check-types`（对应 `tsc -b`）。
- Lint / 格式（Biome / ultracite）：`npm run check`。
- 提交前确保上述命令通过。
