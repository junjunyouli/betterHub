# user-todo-auth — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始任务 |

## 项目信息

- 项目名: better-hub
- 架构类型: monorepo（Turborepo）
- specs 路径: specs/1.user-todo-auth/

## 任务列表

### 功能 1: Todo–User 数据绑定（DB）

- [ ] T-001: `packages/db/src/schema/todo.ts` 增加 `userId` 外键（引用 `user.id`，onDelete cascade）与 `todo_userId_idx` 索引 ~15min
- [ ] T-002: 生成并应用 migration（`db:generate` → `db:migrate`），确认 `todo` 表新列与索引落库；按技术决策处理历史数据 ~15min

### 功能 2: 受保护的 Todo 接口（API）

- [ ] T-003: `todo.getAll` / `todo.create` 改为 `protectedProcedure`，按 `ctx.session.user.id` 过滤/写入 ~30min
- [ ] T-004: `todo.toggle` / `todo.delete` 改为 `protectedProcedure`，`where` 加 `and(eq(id), eq(userId))` + `returning` 越权返回 `NOT_FOUND` ~30min

### 功能 3: 路由守卫与登录跳转（前端）

- [ ] T-005: 为 `/todos` 加登录守卫（迁入 `_auth` 布局或加 `beforeLoad` 会话检查，未登录 redirect `/login`）~15min
- [ ] T-006: `sign-in-form.tsx` / `sign-up-form.tsx` 成功回调跳转目标由 `/dashboard` 改为 `/todos` ~15min

### 集成与测试

- [ ] T-007: 联调 A/B 双用户数据隔离 + 越权 toggle/delete 校验 + 未登录访问跳转，核验 AC-001~AC-005 ~15min

## 依赖关系

- T-002 依赖 T-001
- T-003、T-004 依赖 T-002
- T-007 依赖 T-003、T-004、T-005、T-006
- 无跨 feature 依赖（本 feature 为链路起点）

## 风险点

- 历史无 user_id 的 Todo 会阻塞「非空列」迁移：先加可空列→回填/清空→再置非空，或开发期直接重建表。
- `ctx.session` 类型：确认 `protectedProcedure` 收窄后 `ctx.session.user.id` 可直接取用（参考 `routers/index.ts` 的 `privateData`）。
