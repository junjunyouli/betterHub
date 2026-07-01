# todo-model-extension — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo（Turborepo）
- 涉及层: DB（`packages/db`）、API（`packages/api`）、前端（`apps/web` + `packages/ui` daily-bloom 组件）

> 遵循 `.claude/CLAUDE.md`：Zod 校验入参、`as const` 定义枚举、`??` 处理默认值、显式类型、`protectedProcedure` 鉴权。

## 功能模块设计

### 模块 1: Todo 模型扩展（DB 层）

**涉及层及关键设计:**

修改 `packages/db/src/schema/todo.ts`（在 feature 1 已加 `userId` 基础上）：

```ts
import { pgTable, text, boolean, serial, index, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const todoCategory = pgEnum("todo_category", ["Work", "Personal", "Home", "Health"]);

export const todo = pgTable(
  "todo",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),               // 由 text 迁移而来
    completed: boolean("completed").default(false).notNull(),
    category: todoCategory("category").default("Personal").notNull(),
    dueAt: timestamp("due_at"),                   // 可空
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index("todo_userId_idx").on(table.userId), index("todo_dueAt_idx").on(table.dueAt)],
);
```

迁移：`db:generate` → `db:migrate`。`text`→`title` 见技术决策。

### 模块 2: 接口扩展（API 层）

**涉及层及关键设计:**

`packages/api/src/routers/todo.ts` 全部沿用 `protectedProcedure`：

- `create`：入参 `z.object({ title: z.string().min(1), category: z.enum(["Work","Personal","Home","Health"]).default("Personal"), dueAt: z.date().nullish() })`，写入含 `userId`。
- `update`（新增）：入参 `{ id, title?, category?, dueAt? }`，`where(and(eq(id), eq(userId)))` + `returning` 校验归属，仅更新传入字段。
- `getToday`（新增）：`where(and(eq(userId), or(isNull(dueAt), between/gte..lt today range)))`；今日范围在服务端按 UTC/本地策略计算（见开放问题）。
- `getStats`（新增）：对今日集合聚合 `total` 与 `completed`，返回 `{ total, completed, percent }`（`total===0 → percent=0`）。可用一次 `count` 聚合查询实现。
- `getAll`：可保留（返回全部本人任务），列表页优先用 `getToday`。
- 兼容：`create` 入参 `text`→`title` 更名后，前端调用点需同步（见模块 3）。

### 模块 3: 弹窗落库与列表展示（前端层）

**涉及层及关键设计:**

- `apps/web/src/routes/todos.tsx`（或 feature 1 迁移后的 `_auth/todos.tsx`）：
  - `handleCreateTodo` 由只传 `text` 改为传 `{ title, category, dueAt }`；`BloomAddTaskSheet` 的 `category` 与截止时间选项接入 mutation。
  - 列表数据源改用 `todo.getToday`；`taskItems` 的 `meta` 由真实 `category`/`dueAt` 生成，替换常量 `DEFAULT_TASK_META`。
  - `BloomProgressCard` 数值改用 `todo.getStats`（百分比、`x of y`、进度条），替换前端本地 `completedCount` 推算（或以 getStats 为准）。
- 截止时间选项（今天/明天/选择时间）映射为具体 `dueAt` Date 传给后端。

## 接口契约

| 接口            | 类型     | 入参                                                        | 返回                                  |
| --------------- | -------- | ----------------------------------------------------------- | ------------------------------------- |
| `todo.create`   | mutation | `{ title, category?=Personal, dueAt?:Date\|null }`          | 新建记录                              |
| `todo.update`   | mutation | `{ id, title?, category?, dueAt? }`                         | 更新记录（越权 NOT_FOUND）            |
| `todo.getToday` | query    | -                                                           | 今日 Todo[]（本人）                   |
| `todo.getStats` | query    | -                                                           | `{ total, completed, percent }`       |
| `todo.getAll`   | query    | -                                                           | 本人全部 Todo[]                       |

## 数据模型

见模块 1。新增列：`title`、`category`(enum, default Personal)、`due_at`(nullable)、`created_at`、`updated_at`；新增索引 `todo_dueAt_idx`。

## 安全考虑

- 全部接口 `protectedProcedure`；`update` 与 toggle/delete 一致，在 SQL `where` 层校验 `userId`。
- Zod 严格约束 `category` 枚举与 `title` 非空，拒绝非法输入。

## 技术决策

| 决策            | 选项                                       | 理由                                                             |
| --------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| `text`→`title`  | Drizzle 重命名列（rename）vs 新增列回填     | 直接 rename 保留数据、迁移最简；生成 migration 时确认为 rename 而非 drop+add |
| category 存储   | `pgEnum` vs `text`+应用层校验               | `pgEnum` DB 级约束更强，与 UI 固定四类匹配                        |
| 今日范围计算    | 服务端按 date 截断 vs 前端传范围            | 服务端计算避免客户端时区伪造；时区口径见开放问题                 |
| 进度来源        | 后端 `getStats` vs 前端本地推算            | 以后端为单一事实源，避免分页/筛选下前端计数不准                   |
