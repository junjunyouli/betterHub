# Memory 索引

N2 进入 feature 前先扫此索引，命中则读对应 `{slug}.md` 全文注入上下文。

- [本地 Postgres 未运行 — 只生成迁移不落库](local-db-not-running.md) — db:migrate/联调需活库时只做到 generate 为止 | tags: postgres,drizzle,migration,环境阻塞
