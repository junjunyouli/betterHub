---
description: Drizzle ORM + PostgreSQL 数据层规范（schema、migration、查询）
globs: packages/db/**
---

# 数据库规范

数据层集中在 `packages/db`（`@betterHub/db`），使用 Drizzle ORM + PostgreSQL（`drizzle-orm/node-postgres`，驱动 `pg`）。schema 定义于 `packages/db/src/schema`，migration 输出到 `packages/db/src/migrations`。

## Schema 定义

- 所有表定义放在 `src/schema/` 下，按领域拆分文件（如 `auth.ts`、`todo.ts`），并在 `src/schema/index.ts` 统一 `export *`。
- 使用 `pgTable` 定义表；枚举用 `pgEnum`；列类型从 `drizzle-orm/pg-core` 导入。
- 表名、列名用 snake_case（如 `user_id`、`created_at`），对应的 TS 属性用 camelCase（如 `userId`、`createdAt`）。
- 时间戳统一：`createdAt` 用 `timestamp(...).defaultNow().notNull()`；`updatedAt` 用 `.defaultNow().$onUpdate(() => new Date()).notNull()`。
- 外键必须显式声明 `.references(() => target.id, { onDelete: "cascade" })`，并按业务需要设置级联行为。
- 为高频查询列（尤其外键、排序/过滤列）建立索引：表定义第二个参数返回 `[index("name_idx").on(table.col)]`。
- 认证相关表（`user`、`session`、`account` 等）由 Better-Auth 约定生成，改动需与 auth 配置保持一致，勿手工破坏字段结构。

## 迁移 (Migration)

- 修改 schema 后，用 `drizzle-kit generate` 生成迁移文件，勿手写迁移。
- 开发期快速同步可用 `db:push`；正式环境使用 `db:generate` + `db:migrate` 流程，提交生成的迁移文件。
- 常用命令（在 `packages/db` 内）：
  - `npm run db:generate` — 生成迁移
  - `npm run db:migrate` — 应用迁移
  - `npm run db:push` — 直接推送 schema（开发用）
  - `npm run db:studio` — 打开 Drizzle Studio
- 迁移文件视为不可变历史，勿修改已提交的迁移；需要变更时新增迁移。

## 连接与访问

- 通过 `@betterHub/db` 导出的 `db` 实例访问数据库；不要在其他包重复创建连接。
- `DATABASE_URL` 由 `@betterHub/env/server` 校验后注入，勿直接读 `process.env`。
- server 端（Hono + tRPC）通过导入 `db` 与 schema 执行查询，业务查询逻辑不下沉到 `packages/db`。

## 查询规范

- 优先使用类型安全的 Drizzle 查询构造器与关系查询；避免拼接原始 SQL，必要时用 `sql` 模板并参数化，杜绝字符串插值注入。
- 涉及多表写入或需原子性的操作使用事务。
- 查询只 select 需要的列，避免无谓全表扫描；分页/过滤条件对应字段应有索引支撑。
- 遵循仓库 Biome/ultracite 规范；类型检查用 `npm run check-types`。
