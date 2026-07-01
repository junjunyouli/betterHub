# 开发计划索引

## 本次 PRD（2026-07-01）切分为 3 个 feature

来源需求文档：仓库根 `prd.md`（Daily Bloom / betterHub）。
本次 specs 聚焦 PRD §9（当前限制）与 §10（P0/P1 迭代）的**净新增工作**，已实现的原型（Better Auth 邮箱登录、基础 Todo UI）不重复 spec。P2（Calendar/Focus/统计可视化/暗色主题）留待后续 `/zj:prd --change` 追加。

| 序号 | feature                | 说明                                                       | 依赖 | 状态   |
| ---- | ---------------------- | ---------------------------------------------------------- | ---- | ------ |
| 1    | user-todo-auth         | Todo 绑定登录用户、protected procedures、路由保护、登录跳转 | -    | 待开发 |
| 2    | todo-model-extension   | 扩展 Todo 模型（title/category/dueAt/时间戳）、落库与新增接口 | 1    | 待开发 |
| 3    | profile-and-filters    | Profile 页+退出登录、真实 session 用户名、分类/日期筛选、编辑 | 2    | 待开发 |

**推荐执行顺序**：1 → 2 → 3（严格串行，后者依赖前者的数据模型与鉴权基础）。

## 迭代对应关系

- feature 1、2 = PRD §10 P0
- feature 3 = PRD §10 P1
- PRD §10 P2 = 本次不纳入

## ID 编号约定

- 功能需求 / 任务 / 验收标准 ID **在单个 feature 内编号**，跨 feature 用 `{序号}.` 前缀区分。
- 例：`1.T-001` = 序号 1 这个 feature 的 T-001；`2.F-005` = 序号 2 的 F-005。
- **跨 feature 依赖**写全限定 ID，如 `2.T-001 依赖 1.T-002`。
