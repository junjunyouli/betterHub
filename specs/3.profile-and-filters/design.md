# profile-and-filters — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo（Turborepo）
- 涉及层: 前端为主（`apps/web` + `packages/ui` daily-bloom），少量 API（日期/分类参数化查询）

> 遵循 `.claude/CLAUDE.md`：函数组件 + 顶层 hooks、`aria-label`/label 可访问性、`target=_blank` 加 `rel=noopener`、避免在组件内定义组件。

## 功能模块设计

### 模块 1: Profile 页面与退出登录（前端）

**涉及层及关键设计:**

- 新增路由 `apps/web/src/routes/_auth/profile.tsx`（置于 `_auth` 布局，继承 feature 1 的登录守卫），路径 `/profile`。
- 数据来源：`authClient.getSession()` / TanStack Router `_auth` 的 `context.session`，展示 `user.name`、`user.email`（可含 `image`）。
- 退出登录：调用 `authClient.signOut()`，成功后 `router.navigate({ to: "/login" })` 并使会话缓存失效（invalidate）。
- `BloomBottomNav` 的 Profile tab 链接到 `/profile`（现有底部导航已渲染 Profile 项，补上路由跳转）。

### 模块 2: 真实用户名接入（前端）

**涉及层及关键设计:**

- `todos.tsx` / `BloomHeader` 当前用户名为占位；改为从 `_auth` route context 或 `authClient.getSession()` 读取 `user.name` 传入 `BloomHeader` 与欢迎区问候语。
- 抽取一个读取当前用户的轻量 hook/工具，避免多处重复调用 session。

### 模块 3: 任务编辑（前端 + 复用 API）

**涉及层及关键设计:**

- 复用/扩展 `BloomAddTaskSheet` 为「新增/编辑」两用，或新增编辑弹窗：预填 `title/category/dueAt`，提交调用 feature 2 的 `todo.update`。
- 任务项（`BloomTaskItem`）增加「编辑」入口（图标按钮，带 `aria-label`），点击打开编辑弹窗并携带该任务数据。
- 成功后 `refetch` 列表与 `getStats`。

### 模块 4: 分类与日期筛选（前端 + API）

**涉及层及关键设计:**

- 筛选状态放在 `todos.tsx`：`{ category: BloomCategory | "All", dateFilter: "today" | "tomorrow" | { date } }`。
- **服务端过滤（推荐）**：扩展查询接口接受可选筛选参数：
  - 方案 A：新增 `todo.list` query，入参 `{ category?, date? }`，服务端 `where` 组合 `userId` + 可选 `category` + 可选日期范围。
  - 方案 B：复用 `getToday` 并新增 `getByDate(date)`；分类过滤作为参数。
  - 推荐方案 A：单接口覆盖分类 + 日期，减少接口碎片化。
- 筛选控件：分类 Chips（含「全部」）+ 日期切换（今日/明日/日期选择器），语义按钮、键盘可达。
- 分类与日期可叠加（AND），由服务端 `and(...)` 组合（待产品确认，见技术决策）。

## 接口契约

| 接口         | 类型  | 入参                                             | 返回              | 备注                     |
| ------------ | ----- | ------------------------------------------------ | ----------------- | ------------------------ |
| `todo.list`  | query | `{ category?: Category, date?: Date }`（均可选） | 过滤后的本人 Todo[] | 新增；覆盖分类+日期筛选   |
| `todo.update`| mutation | 见 feature 2                                  | 更新记录          | 编辑复用                 |
| `authClient.signOut` | -   | -                                            | -                 | Better Auth client       |

> 若采用方案 A，`todo.list` 可与 feature 2 的 `getToday` 收敛为同一接口（`getToday` = `list({ date: today })`），实现时择一，避免重复。

## 数据模型

无新增表/列，复用 feature 2 的 `category` / `dueAt` / 索引。

## 安全考虑

- Profile 与筛选接口均在 `_auth` 守卫与 `protectedProcedure` 之下。
- `signOut` 后使 TanStack Query / router session 缓存失效，防止返回键回到受保护页展示旧数据。

## 技术决策

| 决策           | 选项                                   | 理由                                             |
| -------------- | -------------------------------------- | ------------------------------------------------ |
| 筛选执行位置   | 服务端 `todo.list` vs 前端过滤          | 服务端过滤利用索引、可扩展分页，避免前端全量拉取  |
| 编辑弹窗       | 复用 AddTaskSheet 双模式 vs 新建组件    | 复用减少重复 UI/校验逻辑，符合组合优先            |
| 筛选接口收敛   | `todo.list` 统一 vs 多个 getXxx        | 统一入参组合分类+日期，接口更内聚                 |
| 自定义日期     | `date` 参数化 vs 独立 getByDate         | 参数化单接口，避免接口爆炸                        |
