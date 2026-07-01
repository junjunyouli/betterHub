# Ultracite Code Standards

## Project Core Summary

本项目是 Daily Bloom/betterHub，一个以 React + Tailwind 前端、Hono/tRPC 后端、Better Auth 认证和 PostgreSQL/Drizzle 数据层构建的轻量级任务管理应用，核心体验覆盖登录注册、今日任务、完成进度和新增任务。
本次项目交付以 AWS 云端部署为主，主要技术栈参考 ProcessOn《[半中心化前端架构部署方案](https://www.processon.com/view/link/62e77f4f7d9c08072e6eea09)》：前端静态资源与 Web 应用优先面向 AWS 托管/CDN 分发，服务端 API、认证、数据库与后续云资源按 AWS 云上架构进行规划和集成。

## AWS Architecture Resources

- S3：用于前端静态资源、构建产物和公共资源托管。
- API Gateway：用于统一暴露后端 API 入口，承接前端到服务端的请求流量。
- EC2：用于承载 Node/Hono 服务端运行环境，适合需要完整服务器控制权的部署方式。
- Lightsail：用于简化版云服务器部署，可作为中小规模服务端或演示环境承载方案。
- Aurora and RDS：用于 PostgreSQL 关系型数据存储，承载用户、认证、任务等核心业务数据。
- Secrets Manager：用于管理数据库连接、Better Auth 密钥、API 密钥等敏感配置。
- Key Management Service：用于密钥管理和数据加密能力，支撑数据库、密钥和服务间安全访问。
- IAM Identity Center：用于 AWS 云端访问身份、账号权限和团队成员登录管理。
- Amazon EventBridge：用于后续任务提醒、异步事件、定时任务和跨服务事件集成。
- Amazon Bedrock：用于后续 AI 能力接入，例如智能任务建议、自然语言任务生成和内容总结。
- Amazon Q：用于 AWS 云上问答、架构辅助和服务使用建议。
- Amazon Q Business：用于企业知识问答和业务资料检索场景。
- Amazon Q Developer：用于开发辅助、代码建议、云资源排查和 AWS 集成开发支持。
- Amazon Q Developer in chat applications：用于在聊天应用中接入开发辅助、告警分析和团队协作问答。
- 账单与成本管理：用于跟踪 AWS 资源成本、预算、用量和后续成本优化。

## Environment Variables

开发过程中需要的运行参数、云资源配置、数据库连接、认证密钥、API Key 等都写入对应 `.env` 文件作为占位，不要硬编码到源码中；本地可使用占位值或示例值，真实密钥只在部署环境或安全密钥管理服务中配置。

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `npm exec -- ultracite fix`
- **Check for issues**: `npm exec -- ultracite check`
- **Diagnose setup**: `npm exec -- ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `npm exec -- ultracite fix` before committing to ensure compliance.

---

# 项目踩坑与教训（AGENTS.md）

供后续 task 与人类开发者复用；每条带 task 来源。

- [T-007] 环境陷阱：本开发环境无本地 Postgres（localhost:5432 关闭）、无 docker、无 psql/pg_isready，也无 .env/DATABASE_URL。凡是需要真实 DB 的端到端 AC 核验（数据隔离、越权 toggle/delete、未登录跳转）只能做静态代码走查，不能据此标记完成；必须在可连 Postgres 环境回归：`npm run db:migrate` 落库 → 起 apps/server + apps/web → 用 A/B 两个账号实跑。task 要求「核验 AC」时，缺真实联调证据就保持未完成、记为 blocker。
- [T-007] 文档同步坑：schema 再次 `db:generate` 会重新生成迁移文件（文件名随机，如 `0000_wet_johnny_blaze.sql`），之前 tasks 备注里引用的旧文件名（如 `0000_sticky_living_tribunal.sql`）会失效并误导排查。重生成迁移后，务必同步更新任务记录/文档里引用的迁移文件名。
- [T-007] 部署坑：AWS SAM `template.yaml` 的 Lambda `Handler` 路径必须与 esbuild 打包产物结构匹配。将 `apps/server/src/index.ts` 拆成 `app.ts` + `lambda.ts` 后，打包产物是产物根目录的单文件 `lambda.js`，Handler 若仍写 `apps/server/src/lambda.handler` 会因找不到入口模块导致 Lambda 启动失败；改部署入口/拆分文件后要一并核实 Handler 路径。
- [T-007] tRPC 序列化坑：前端 `httpBatchLink` 未配置 transformer（如 superjson）时，`z.date()` 输入会被 JSON 序列化成字符串，导致带 Date 字段（如 dueAt）的 create/update 校验失败。用到 Date 类型的 procedure，必须前后端一起配同一 transformer。
- [T-007] 时区坑：`getTodayRange` 若用服务器时区计算「今天」窗口，与用户本地时区不一致时会让任务从 getToday/getStats 视图中消失；按用户本地时区处理「今天」边界。
- [T-001] Drizzle 迁移坑（改列名/加 NOT NULL 列）：在 schema 里直接把列名从旧名改成新名（如 text→title），Drizzle `db:generate` 无法感知「重命名」意图，很可能生成 drop 旧列 + add 新列，正式库有数据会丢数据；同理给已有表新增 NOT NULL 且无默认值的列（如 user_id）迁移会直接失败。改列名前先确认目标库是否已初始化过：若已有历史数据，不要复用从零建表的 0000 迁移，必须新增一条 ALTER 迁移手写 `ALTER TABLE ... RENAME COLUMN`；加非空列要先建可空列→回填→再收紧 NOT NULL。生成迁移后务必人工核对 SQL 确实是 RENAME 而非 drop+add，再落库。
