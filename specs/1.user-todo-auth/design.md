# user-todo-auth — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo（Turborepo）
- 涉及层:
  - 数据库：`packages/db`（Drizzle + PostgreSQL）
  - 后端 API：`packages/api`（tRPC on Hono）
  - 前端路由/组件：`apps/web`（React + TanStack Router）

> 依据 `.claude/CLAUDE.md`（Ultracite/Biome 规范）：类型显式、`protectedProcedure` 明确鉴权、避免 `any`，写库/接口用 Zod 校验入参。

## 功能模块设计

### 模块 1: Todo–User 数据绑定（DB 层）

**涉及层及关键设计:**

- 修改 `packages/db/src/schema/todo.ts`，新增 `userId` 列并关联 `user.id`：

```ts
import { pgTable, text, boolean, serial, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const todo = pgTable(
  "todo",
  {
    id: serial("id").primaryKey(),
    text: text("text").notNull(),
    completed: boolean("completed").default(false).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("todo_userId_idx").on(table.userId)],
);
```

- 生成 migration：`npm run db:generate`，应用：`npm run db:migrate`（开发期可 `db:push`）。
- 历史数据处理见「技术决策」。

### 模块 2: 受保护的 Todo 接口（API 层）

**涉及层及关键设计:**

- `packages/api/src/routers/todo.ts` 全部改用 `protectedProcedure`（已在 `packages/api/src/index.ts` 定义，`ctx.session` 非空且收窄）。
- 读取当前用户：`ctx.session.user.id`。
- `getAll`：`where(eq(todo.userId, ctx.session.user.id))`。
- `create`：`values({ text, userId: ctx.session.user.id })`。
- `toggle` / `delete`：在 `where` 中同时匹配 `id` 与 `userId`，实现服务端归属校验：

```ts
toggle: protectedProcedure
  .input(z.object({ id: z.number(), completed: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const result = await db
      .update(todo)
      .set({ completed: input.completed })
      .where(and(eq(todo.id, input.id), eq(todo.userId, ctx.session.user.id)))
      .returning({ id: todo.id });
    if (result.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Todo not found" });
    }
    return result[0];
  }),
```

`delete` 同理用 `and(eq(id), eq(userId))` + `returning` 判断影响行数。

### 模块 3: 路由守卫与登录跳转（前端层）

**涉及层及关键设计:**

- `/todos` 加登录守卫。复用现有 `_auth` 布局模式（`apps/web/src/routes/_auth/route.tsx` 已有 `beforeLoad` session 检查）。两种落地方式：
  - **方案 A（推荐）**：把 `todos.tsx` 迁到 `_auth` 布局下（`routes/_auth/todos.tsx`），自动继承守卫，路径仍为 `/todos`。
  - 方案 B：在 `routes/todos.tsx` 自身加 `beforeLoad`，调用 `authClient.getSession()`，无 session 时 `throw redirect({ to: "/login" })`。
- 登录/注册成功跳转：修改 `apps/web/src/components/sign-in-form.tsx` 与 `sign-up-form.tsx` 中 Better Auth 成功回调的跳转目标为 `/todos`（原为 `/dashboard`）。

## 接口契约

| 接口          | 类型     | 鉴权      | 入参                            | 返回                     |
| ------------- | -------- | --------- | ------------------------------- | ------------------------ |
| `todo.getAll` | query    | protected | -                               | 当前用户的 Todo[]        |
| `todo.create` | mutation | protected | `{ text: string(min1) }`        | 新建结果                 |
| `todo.toggle` | mutation | protected | `{ id: number, completed: bool }` | `{ id }`（越权 NOT_FOUND） |
| `todo.delete` | mutation | protected | `{ id: number }`                | `{ id }`（越权 NOT_FOUND） |

> 注：本 feature 保持 `text` 字段不变；字段扩展（title/category/dueAt）在 feature 2 处理。

## 数据模型

`todo` 表新增：`user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE`，并建索引 `todo_userId_idx`。

## 安全考虑

- 所有 Todo 接口走 `protectedProcedure`，无 session 直接 `UNAUTHORIZED`。
- 写操作在 SQL `where` 层做归属校验（`and(id, userId)`），杜绝 IDOR 越权。
- 越权统一返回 `NOT_FOUND`，不区分「不存在」与「非本人」，避免探测他人数据。

## 技术决策

| 决策             | 选项                                     | 理由                                                                 |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| 历史 Todo 迁移   | 清空旧无主 Todo（开发期数据） vs 回填占位用户 | 当前为原型/开发数据、无真实用户归属，倾向清空后以非空列重建；上线前需产品确认 |
| 归属校验位置     | SQL where 层 vs 应用层先查后改           | SQL where 一次往返完成校验+写入，避免 TOCTOU，性能与安全更优         |
| 路由守卫落地     | 迁入 `_auth` 布局 vs 单独 beforeLoad     | 复用已有 `_auth` 守卫，减少重复 session 逻辑                          |
