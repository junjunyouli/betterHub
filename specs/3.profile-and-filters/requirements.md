# profile-and-filters — 需求规格

## 概述

补齐 PRD §10 P1：实现 Profile 页面与退出登录入口、将顶部用户名替换为真实 session 用户、任务编辑，以及按分类和按今日/明日/自定义日期的任务筛选，让 Daily Bloom 的信息架构从「查看/新增」扩展到「管理/组织」。

## 项目信息

- 项目名: better-hub
- 架构类型: monorepo（Turborepo；React + TanStack Router / Hono + tRPC / Better Auth / PostgreSQL + Drizzle）

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始需求 |

## 用户故事

- 作为登录用户，我想要在 Profile 页看到自己的账号信息并能退出登录，以便管理会话。
- 作为用户，我想要顶部显示我真实的名字，而不是占位文案。
- 作为用户，我想要编辑已创建任务的标题/分类/截止时间，以便修正信息。
- 作为用户，我想要按分类或日期筛选任务，以便聚焦某一类或某一天。

## 功能需求

1. [F-001] 新增 Profile 页面（底部导航 Profile 入口），展示当前 session 用户的姓名、邮箱。
2. [F-002] Profile 页提供退出登录入口，调用 Better Auth 登出并跳转 `/login`。
3. [F-003] 顶部品牌栏（BloomHeader）与欢迎区用户名替换为真实 session `user.name`。
4. [F-004] 任务项支持编辑：打开编辑弹窗，修改标题/分类/截止时间并调用 `todo.update`。
5. [F-005] 支持按分类（Work/Personal/Home/Health/全部）筛选任务列表。
6. [F-006] 支持按今日/明日/自定义日期筛选任务列表（接 `getToday` 及日期参数化查询）。

## 非功能需求

- 性能: 筛选优先服务端过滤（利用 `todo_dueAt_idx` / category），避免全量拉取后前端过滤大数据集。
- 安全: 沿用受保护接口；退出登录清理本地 session 状态并阻止返回受保护页。
- 可访问性: 遵循 `.claude/CLAUDE.md` —— 图标按钮 `aria-label`、表单字段有 label、语义元素，Profile/筛选控件键盘可达。

## 验收标准

- [ ] [AC-001] 点击底部导航 Profile 进入 Profile 页，显示真实姓名与邮箱。
- [ ] [AC-002] 点击退出登录后 session 失效、跳转 `/login`，再访问 `/todos` 被重定向到 `/login`。
- [ ] [AC-003] `/todos` 顶部与欢迎区显示的用户名等于登录用户的 `user.name`。
- [ ] [AC-004] 编辑任务保存后列表显示新标题/分类/截止时间。
- [ ] [AC-005] 选择某分类后列表仅显示该分类任务；切「全部」恢复。
- [ ] [AC-006] 选择今日/明日/自定义日期后列表按对应日期展示任务。

## 依赖

- feature 2（2.todo-model-extension）：`todo.update`、`category`/`dueAt` 字段、`getToday` 已就绪。
- feature 1（1.user-todo-auth）：`_auth` 路由守卫、受保护接口、session 可用。
- Better Auth client（`apps/web/src/lib/auth-client.ts`，`getSession`/`signOut`）。

## 开放问题

- 自定义日期筛选是否需要后端新增按任意 date 查询的接口（如 `todo.getByDate`），或复用 `getToday` 参数化 —— 见 design.md 技术决策。
- 分类筛选与日期筛选是否可叠加（AND 组合）——倾向支持叠加，需产品确认交互。
