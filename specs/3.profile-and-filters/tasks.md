# profile-and-filters — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-07-01 | v1   | 初始任务 |

## 项目信息

- 项目名: better-hub
- 架构类型: monorepo（Turborepo）
- specs 路径: specs/3.profile-and-filters/

## 任务列表

### 功能 1: Profile 页与退出登录

- [ ] T-001: 新增 `routes/_auth/profile.tsx`，展示 session 用户姓名/邮箱，`BloomBottomNav` Profile tab 跳转 `/profile` ~30min
- [ ] T-002: 退出登录入口——调用 `authClient.signOut()`，成功后 invalidate session 并跳转 `/login` ~15min

### 功能 2: 真实用户名接入

- [ ] T-003: `todos.tsx`/`BloomHeader`/欢迎区用户名改用 session `user.name`（抽取读取当前用户的工具/hook）~15min

### 功能 3: 任务编辑

- [ ] T-004: `BloomAddTaskSheet` 扩展为新增/编辑双模式（预填 title/category/dueAt）~30min
- [ ] T-005: `BloomTaskItem` 增加编辑入口（`aria-label` 图标按钮），打开编辑弹窗调用 `todo.update` 并 refetch ~30min

### 功能 4: 分类与日期筛选

- [ ] T-006: 后端 `todo.list` query，入参 `{ category?, date? }`，服务端 `and` 组合过滤（可与 getToday 收敛）~30min
- [ ] T-007: 前端分类 Chips + 日期切换（今日/明日/自定义）控件，联动 `todo.list` 并支持叠加 ~30min

### 集成与测试

- [ ] T-008: E2E 核验 AC-001~AC-006（Profile/登出/用户名/编辑/分类筛选/日期筛选）~15min

## 依赖关系

- T-002 依赖 T-001；T-005 依赖 T-004；T-007 依赖 T-006；T-008 依赖全部
- 跨 feature 依赖：`3.T-004/3.T-005 依赖 2.T-004`（todo.update）；`3.T-006 依赖 2.T-005`（getToday/日期查询基础）；`3.T-001` 依赖 `1.T-005`（`_auth` 守卫）

## 风险点

- `todo.list` 与 feature 2 的 `getToday` 若不收敛会出现重复接口，实现时择一并统一。
- 分类+日期叠加的交互与「全部」重置逻辑需明确（开放问题待产品确认）。
- `signOut` 后缓存未失效会导致返回键仍显示旧受保护数据，需 invalidate。
