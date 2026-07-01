---
description: 安全规范 —— Better-Auth 认证、tRPC/Hono 授权、Drizzle 数据访问与密钥管理
globs:
  - "apps/server/**"
  - "packages/**"
---

# 安全规范

适用于 Turborepo monorepo（web: React + TanStack Router；server: Hono + tRPC；db: Drizzle ORM + PostgreSQL；认证: Better-Auth）。

## 认证 (Better-Auth)

- 认证逻辑统一走 Better-Auth，禁止自行实现密码哈希、session 签发或 token 校验。
- 会话校验必须在服务端（Hono/tRPC 上下文）完成，前端状态仅用于展示，绝不作为授权依据。
- Cookie/Session 使用 `httpOnly`、`secure`（生产环境）、`sameSite` 合理配置；不要把 session token 写入 localStorage。
- OAuth / 第三方回调必须校验 state 参数，回调地址使用白名单。
- 密码策略、邮箱验证、账户锁定等交由 Better-Auth 插件配置，不在业务代码里绕过。

## 授权 (tRPC / Hono)

- 使用 tRPC `protectedProcedure`（或等价中间件）保护需要登录的接口，默认拒绝、显式放行。
- 在 procedure 内部校验资源归属（当前用户是否有权访问该记录），不要只依赖「已登录」。
- 服务端做基于角色/权限的访问控制，前端隐藏按钮不等于授权。
- 避免在错误信息中泄露内部细节（堆栈、SQL、存在性探测）。

## 输入校验

- 所有 tRPC 输入使用 zod（或 schema）严格校验，拒绝未知字段。
- 服务端不得信任任何客户端传入的数据，包括 header、query、body。
- 对外部 API / 用户上传内容做大小、类型、频率限制。

## 数据访问 (Drizzle + PostgreSQL)

- 一律使用 Drizzle 查询构造器 / 参数化查询，禁止字符串拼接 SQL，防止注入。
- 敏感字段（密码哈希、token、密钥）不得出现在 tRPC 返回值或日志中，查询时显式选择列。
- 数据库连接串仅从环境变量读取，最小权限账户，生产环境启用 TLS。
- migration 变更需经审查，避免误删列或放开权限。

## 密钥与配置

- 所有密钥（DATABASE_URL、Better-Auth secret、OAuth client secret、第三方 API key）放环境变量，禁止硬编码或提交到仓库。
- `.env` 系列文件纳入 `.gitignore`；提供 `.env.example` 只含占位值。
- 前端只暴露必要的公开变量（如 `VITE_`/`PUBLIC_` 前缀），敏感值绝不打进客户端 bundle。

## 传输与通用

- 生产环境全站 HTTPS；配置合理的 CORS 白名单，不要用 `*` 搭配凭据。
- 对状态变更接口做 CSRF 防护（Better-Auth / SameSite Cookie 配合）。
- 及时更新依赖，关注 npm audit / 安全公告；锁定 lockfile。
- 记录安全相关事件（登录失败、权限拒绝），但日志中不含明文凭据或个人敏感信息。
