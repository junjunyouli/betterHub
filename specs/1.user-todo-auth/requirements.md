# user-todo-auth — 需求规格

## 概述

将 Todo 数据与登录用户绑定，把 Todo 接口改为受保护接口，保护 `/todos` 路由，并让登录/注册成功后跳转到 `/todos`，解决 PRD §9 中「Todo 未绑定用户、任务是全局数据」以及 §10 P0 的鉴权类限制。

## 项目信息

- 项目名: better-hub
- 架构类型: monorepo（Turborepo，`apps/*` + `packages/*`；前端 React + TanStack Router，后端 Hono + tRPC，认证 Better Auth，数据 PostgreSQL + Drizzle）

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始需求 |

## 用户故事

- 作为登录用户，我想要只看到自己创建的任务，以便任务列表是私有的、不与他人混淆。
- 作为未登录访客，当我访问 `/todos` 时应被跳转到 `/login`，以便受保护内容不外泄。
- 作为刚登录/注册成功的用户，我想要直接进入 `/todos` 开始管理任务，而不是停在示例 dashboard。

## 功能需求

1. [F-001] Todo 表新增 `user_id` 外键，关联 `user.id`，级联删除。
2. [F-002] `todo.getAll` 改为受保护接口，仅返回当前 session 用户的任务。
3. [F-003] `todo.create` 改为受保护接口，写入时绑定当前 session 用户 id。
4. [F-004] `todo.toggle` / `todo.delete` 改为受保护接口，且仅能操作属于当前用户的任务（越权操作不生效/报错）。
5. [F-005] `/todos` 路由需要登录态守卫，未登录跳转 `/login`。
6. [F-006] 登录与注册成功后跳转目标由 `/dashboard` 改为 `/todos`。

## 非功能需求

- 性能: `getAll` 按 `user_id` 过滤，需为 `todo.user_id` 建索引避免全表扫描。
- 安全: 所有 Todo 写操作必须在服务端校验归属，不能仅依赖前端过滤；越权返回 `NOT_FOUND`/`FORBIDDEN`，不泄露他人数据存在性。
- 兼容性: 现有 Todo 数据无 user_id，迁移策略需明确（见 design.md 技术决策）。

## 验收标准

- [ ] [AC-001] 用户 A 登录后仅能看到 A 创建的任务，看不到用户 B 的任务。
- [ ] [AC-002] 未登录访问 `/todos` 被重定向到 `/login`。
- [ ] [AC-003] 未携带有效 session 调用任一 `todo.*` 接口返回 `UNAUTHORIZED`。
- [ ] [AC-004] 用户 A 尝试 toggle/delete 用户 B 的任务 id 时操作无效并返回错误，B 数据不变。
- [ ] [AC-005] 登录/注册成功后浏览器落在 `/todos`。

## 依赖

- Better Auth session（`auth.api.getSession`，已在 `packages/api/src/context.ts` 接入）。
- Drizzle migration 工具链（`npm run db:generate` / `db:migrate` / `db:push`）。

## 开放问题

- 现有历史 Todo（无 user_id）如何处理：迁移方案倾向「新增可空列 → 回填/清空 → 置为非空」，最终取值见 design.md 技术决策，需在迁移前与产品确认是否保留旧数据。
