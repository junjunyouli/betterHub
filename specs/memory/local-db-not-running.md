---
title: 本地 Postgres 未运行 — 只生成迁移不落库
feature: 1.user-todo-auth
type: env
tags: [postgres, drizzle, migration, db:generate, db:migrate, 环境阻塞]
date: 2026-07-01
---

**问题/场景**：`apps/server/.env` 的 `DATABASE_URL` 指向 `localhost:5432`，但本地 Postgres 未启动（端口关闭），`packages/db/src/migrations` 此前不存在。涉及 `db:migrate` 落库和端到端联调的 task 无法真正执行。

**解法/结论**：用户决定「只写代码 + `db:generate` 生成 migration SQL，不 `db:migrate` 落库」。
- `drizzle-kit generate` 不需要连库即可生成 SQL（首个迁移 `0000_sticky_living_tribunal.sql` 为全量建表）。
- 涉及落库/联调的 task（如 1.T-002 的 migrate、1.T-007 联调）标记完成但注明「🚫 阻塞：需可连 Postgres」，待起库后补跑。

**复用方式**：后续 feature（2、3）凡遇 `db:migrate` / 需要活库的联调、QA，同样只做到「代码 + generate」为止，不阻塞流程；起库后统一 `db:migrate` + 联调。首个迁移是全量建表，若目标库已有 better-auth 建的表，落库前需改用增量迁移或先对齐现状。
