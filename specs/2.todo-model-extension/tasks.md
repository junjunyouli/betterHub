# todo-model-extension — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始任务 |

## 项目信息

- 项目名: better-hub
- 架构类型: monorepo（Turborepo）
- specs 路径: specs/2.todo-model-extension/

## 任务列表

### 功能 1: 模型扩展（DB）

- [x] T-001: `todo` schema 定义 `todoCategory` pgEnum，新增 `category`/`dueAt`/`createdAt`/`updatedAt` 列，`text`→`title` 重命名，加 `todo_dueAt_idx` ~30min
- [x] T-002: 生成并应用 migration，核对 `text`→`title` 为 rename（不丢数据）、enum 与默认值正确落库 ~15min

### 功能 2: 接口扩展（API）

- [ ] T-003: `todo.create` 入参改 `{ title, category(default Personal), dueAt? }` 并落库；同步入参 Zod 校验 ~30min
- [ ] T-004: 新增 `todo.update`（title/category/dueAt，`where` 校验 userId + returning 越权 NOT_FOUND）~30min
- [ ] T-005: 新增 `todo.getToday`（按今日范围 + userId 过滤）与 `todo.getStats`（total/completed/percent 聚合）~30min

### 功能 3: 前端落库与展示

- [ ] T-006: `BloomAddTaskSheet` 提交联动——`handleCreateTodo` 传 `{ title, category, dueAt }`，截止时间选项映射为 Date ~30min
- [ ] T-007: 列表数据源改用 `getToday`，任务项 `meta` 用真实 category/dueAt；`BloomProgressCard` 接 `getStats` ~30min

### 集成与测试

- [ ] T-008: 联调核验 AC-001~AC-005（落库、默认分类、update、getToday、进度实时）~15min

## 依赖关系

- T-002 依赖 T-001；T-003/T-004/T-005 依赖 T-002；T-006/T-007 依赖 T-003、T-005；T-008 依赖全部
- 跨 feature 依赖：`2.T-001 依赖 1.T-001`（在 feature 1 已加 `userId` 的 schema 上扩展）；`2.T-003 依赖 1.T-003`（沿用受保护 create）

## 风险点

- `text`→`title` 若 Drizzle 生成为 drop+add 会丢数据，需人工确认 migration 为 rename。
- 今日范围时区口径未定（开放问题），先按服务端本地日期截断实现，联调时校准。
- getStats 与前端本地 completedCount 双源可能不一致，统一以 getStats 为准。
