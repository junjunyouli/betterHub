---
description: Git 分支、提交与 PR 规范，适用于 betterHub monorepo (Turborepo / Better-T-Stack)
---

# Git Workflow

## 分支策略
- 主分支为 `main`，保持随时可发布，禁止直接向 `main` 推送。
- 从最新的 `main` 切出功能分支，命名遵循 `<type>/<scope>-<short-desc>`：
  - `feat/web-user-profile`、`fix/server-auth-session`、`chore/db-migration`。
  - `scope` 建议对应模块：`web`、`server`、`docs`、`db`（frontend / backend / database）。
- 一个分支只解决一件事，保持 PR 小而聚焦。

## 提交规范（Conventional Commits）
- 格式：`<type>(<scope>): <subject>`，subject 用祈使句、小写开头、不加句号。
- 常用 type：`feat`、`fix`、`refactor`、`chore`、`docs`、`test`、`perf`、`build`、`ci`。
- scope 使用受影响的 workspace/包名或模块（如 `web`、`server`、`docs`、`db`、`auth`）。
- 涉及数据库结构变更时，schema 修改与生成的 Drizzle migration 放在同一提交内，保持可回溯。

## 提交前检查
提交或推送前，在仓库根运行并确保通过：
- `npm run check`（Biome / ultracite lint + format）
- `npm run check-types`（TypeScript 类型检查，作为测试门槛）
- `npm run build`（涉及构建产物或跨包改动时）
- Turborepo 会按依赖顺序执行任务，跨 workspace 改动时优先在根目录跑上述命令。

## Pull Request
- 目标分支为 `main`，PR 标题沿用 Conventional Commits 风格。
- PR 描述包含：变更动机、影响的模块（frontend / backend / database）、验证方式。
- 数据库改动需在描述中说明 migration 及回滚影响。
- 合并前确保 CI（lint、类型检查、build）全部通过，优先使用 squash 合并保持历史整洁。

## 禁止事项
- 不提交密钥、`.env` 及本地凭证；敏感配置通过环境变量管理（Better-Auth / 数据库连接串等）。
- 不提交 `node_modules`、构建产物与 `.turbo` 缓存。
- 不强推（`--force`）到共享分支；如需覆盖使用 `--force-with-lease` 并仅限自己的功能分支。
