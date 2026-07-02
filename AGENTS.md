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

- [T-007] 环境陷阱（已缓解，2026-07-01）：本机无本地 Postgres/docker/psql，但现已在 `apps/server/.env` 配置了远端 **Neon Postgres**（`DATABASE_URL`，已 gitignore）。`npm run db:migrate` 可直接对 Neon 落库；AC 端到端核验可用「以 mock session 构造 tRPC caller（`t.createCallerFactory(appRouter)`）打真实 Neon DB」的方式跑，无需起 HTTP/浏览器即可覆盖落库/默认值/越权隔离/getToday/getStats（feature 2 的 AC-001~005 已如此全部通过）。仍需注意：改 `.env` 后已在跑的 dev server 不会自动重载新连接串，需重启；本机 5432 仍关闭，不要假设有本地库。
- [T-007] 文档同步坑：schema 再次 `db:generate` 会重新生成迁移文件（文件名随机，如 `0000_wet_johnny_blaze.sql`），之前 tasks 备注里引用的旧文件名（如 `0000_sticky_living_tribunal.sql`）会失效并误导排查。重生成迁移后，务必同步更新任务记录/文档里引用的迁移文件名。
- [T-007] 部署坑：AWS SAM `template.yaml` 的 Lambda `Handler` 路径必须与 esbuild 打包产物结构匹配。将 `apps/server/src/index.ts` 拆成 `app.ts` + `lambda.ts` 后，打包产物是产物根目录的单文件 `lambda.js`，Handler 若仍写 `apps/server/src/lambda.handler` 会因找不到入口模块导致 Lambda 启动失败；改部署入口/拆分文件后要一并核实 Handler 路径。
- [T-007] tRPC 序列化坑：前端 `httpBatchLink` 未配置 transformer（如 superjson）时，`z.date()` 输入会被 JSON 序列化成字符串，导致带 Date 字段（如 dueAt）的 create/update 校验失败。用到 Date 类型的 procedure，必须前后端一起配同一 transformer。
- [T-007] 时区坑：`getTodayRange` 若用服务器时区计算「今天」窗口，与用户本地时区不一致时会让任务从 getToday/getStats 视图中消失；按用户本地时区处理「今天」边界。
- [T-003] tRPC 序列化坑复发教训（务必先查前置项）：`z.date()` 作为 procedure 输入的坑在 [T-007] 已记录，但因项目至今未全局配 transformer，新增/修改任何带 Date 输入字段（dueAt 等）的 procedure 会再次踩中——review 连续把它判为 P0（阻断 AC 核验）。根因：前端 `httpBatchLink` 与服务端 `initTRPC` 都没配 superjson，Date 走 JSON 序列化变字符串，`z.date()` 校验必然失败，只有传 null 能过。写 Date 类输入前先做前置检查：确认 `apps/web/src/utils/trpc.ts` 与 `packages/api/src/index.ts` 是否已配同一 transformer；未配则要么一次性补 superjson，要么该字段改用 `z.coerce.date()` 接受 ISO 字符串。默认优先 `z.coerce.date()` 以防再次复发。
- [T-003] 写操作返回值约定：create 与 update/toggle/delete 一样属于写操作，应统一 `.returning({ id: todo.id })`（或完整行）以符合 design.md「create 返回新建记录」的接口契约与团队一致性；不要只在 update/toggle/delete 用 returning 而 create 遗漏。
- [T-004] tasks.md 与工作区代码脱节坑（开工前必做前置核对）：多个 task 的实现代码可能已提前存在于工作区但未提交，且 tasks.md 勾选状态与实际代码不一致（如 T-003 未勾选但代码已完成、T-005 的 getToday/getStats 已实现但未在本次范围勾选）。承接任何 task 前先核对目标文件现状与 tasks.md 勾选是否一致；若发现代码已存在，改为「校验既有实现 + 补齐勾选」而非重新实现，避免重复劳动/覆盖他人改动，并把不一致回报主流程统一更新勾选状态。
- [T-006] 前端「选项→Date」映射静默失败坑：把「截止时间」下拉/单选选项映射为 Date 时（如选中「选择时间」再填 datetime-local），若解析失败就静默返回 null，任务会被无声地创建为无截止时间，用户以为设置成功却没有任何反馈。凡是「用户显式选了要设值、但值缺失/无法解析」的分支，都应给轻量校验反馈（禁用提交/toast/内联错误），不要静默降级为 null。
- [T-008] 已记录坑复发的元教训（完成「核验/汇总」类 task 前必做）：本次两处 P0 全是 AGENTS.md 已记录过的坑复发——no-DB 环境不得据静态走查标记 AC 核验完成（[T-007]）、create 缺 `.returning` 不符接口契约（[T-003]）。根因是各 task 收尾时没回扫本模块已记录教训，导致同一坑被 review 反复判 P0。凡是「联调核验/AC 汇总」类 task，动手前先按改动涉及的模块（api/db/web）逐条回读 AGENTS.md 对应条目并连带核查/修复遗留项，再决定勾选与否。
- [T-008] 依赖闭合坑：标记「核验/汇总」类 task 完成前，必须确认 tasks.md 里它声明依赖的所有前置 task checkbox 均已闭合（如 T-008 依赖含 T-007，而 T-007 仍 `[ ]`）。依赖未闭合就勾完成会违反 tasks.md 自身声明的依赖关系，被 review 判问题；发现依赖项已实现但未勾选时，先同步勾选前置项再勾当前项。
- [T-008] OIDC 部署角色信任范围坑：`scripts/setup-github-actions-oidc-role.sh` 用 GitHub environment 维度设置信任范围时，会让该 environment 下任何能对 prod 运行的 workflow 都可假设该部署角色，绕过原本「仅主分支」限制，放大攻击面。配置 GitHub Actions OIDC 假设角色的 `sub` 条件时，应精确到分支（如 `repo:org/repo:ref:refs/heads/main`）而非仅按 environment 放行。
- [T-001] Drizzle 迁移坑（改列名/加 NOT NULL 列）：在 schema 里直接把列名从旧名改成新名（如 text→title），Drizzle `db:generate` 无法感知「重命名」意图，很可能生成 drop 旧列 + add 新列，正式库有数据会丢数据；同理给已有表新增 NOT NULL 且无默认值的列（如 user_id）迁移会直接失败。改列名前先确认目标库是否已初始化过：若已有历史数据，不要复用从零建表的 0000 迁移，必须新增一条 ALTER 迁移手写 `ALTER TABLE ... RENAME COLUMN`；加非空列要先建可空列→回填→再收紧 NOT NULL。生成迁移后务必人工核对 SQL 确实是 RENAME 而非 drop+add，再落库。
