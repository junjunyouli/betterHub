# todo-model-extension — 需求规格

## 概述

扩展 Todo 数据模型以完整支撑现有 UI：将 `text` 语义化为 `title`、落库 `category` 与 `dueAt`、补充时间戳，并新增/增强接口（create 支持分类与截止时间、update 编辑、getToday 今日筛选、getStats 完成统计），解决 PRD §9「分类与截止时间只是 UI 状态、未写库」及 §10 P0 的模型扩展项。

## 项目信息

- 项目名: better-hub
- 架构类型: monorepo（Turborepo；React + TanStack Router / Hono + tRPC / Better Auth / PostgreSQL + Drizzle）

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始需求 |

## 用户故事

- 作为用户，我想要新增任务时选择分类（Work/Personal/Home/Health）和截止时间并被保存，以便任务信息完整可追溯。
- 作为用户，我想要只看到「今日」的任务，以便聚焦当天。
- 作为用户，我想要在进度卡看到真实的完成率与计数，以便即时了解今日进展。

## 功能需求

1. [F-001] Todo 表将展示字段语义化为 `title`（保留兼容策略），新增 `category`、`dueAt`、`createdAt`、`updatedAt`。
2. [F-002] `category` 取值限定为 `Work | Personal | Home | Health`（默认 `Personal`）。
3. [F-003] `todo.create` 支持 `title`、`category`、可选 `dueAt`，全部落库。
4. [F-004] 新增 `todo.update`，可编辑 `title` / `category` / `dueAt`（仅本人任务）。
5. [F-005] 新增 `todo.getToday`，按 `dueAt`（或无截止时间归入今日的规则）返回今日任务。
6. [F-006] 新增 `todo.getStats`，返回今日完成率（已完成/总数）与计数。
7. [F-007] 前端新增任务弹窗（BloomAddTaskSheet）将 `category` 与截止时间选项传给 `create` 并落库；任务项展示真实分类/元信息而非固定 `DEFAULT_TASK_META`。

## 非功能需求

- 性能: `getToday` 按日期范围 + `userId` 查询，复用/新增合适索引；`getStats` 尽量单查询聚合。
- 安全: 沿用 feature 1 的受保护接口与归属校验；`update` 同样在 `where` 层校验 `userId`。
- 兼容性: 字段迁移不得破坏 feature 1 已绑定 user 的数据；`text`→`title` 采用不丢数据的迁移策略。

## 验收标准

- [ ] [AC-001] 新增任务选择分类与「明天」截止后，刷新列表该任务的分类与截止时间被持久化。
- [ ] [AC-002] `todo.create` 未传 category 时使用默认值 `Personal` 且成功落库。
- [ ] [AC-003] `todo.update` 修改标题/分类/截止时间后再查询返回新值；对他人任务 update 无效。
- [ ] [AC-004] `todo.getToday` 只返回属于今日的任务。
- [ ] [AC-005] Daily Goal 进度卡数值来自 `getStats`，随完成/取消实时变化（百分比与「x of y」计数正确，y=0 时显示 0%）。

## 依赖

- feature 1（1.user-todo-auth）：Todo 已绑定用户、接口已受保护，本 feature 在其之上扩展字段与接口。
- Drizzle migration 工具链；前端 `BloomAddTaskSheet` / `BloomProgressCard`（`packages/ui` daily-bloom 组件已存在）。

## 开放问题

- 「今日」判定规则：`dueAt` 落在今天，还是「dueAt 为空也算今日」？倾向：`dueAt IS NULL OR dueAt::date = today`，需产品确认。
- `text`→`title`：物理重命名列 vs 新增 `title` 回填后弃用 `text`，见 design.md 技术决策。
