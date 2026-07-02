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

## 技术栈

- 语言：TypeScript
- 前端：React + TanStack Router (`apps/web`)
- 后端：Hono + tRPC (`apps/server`)
- 文档：Astro Starlight (`apps/docs`)
- 数据层：Drizzle ORM + PostgreSQL (`packages/db`)
- 认证：Better-Auth (`packages/auth`)
- Monorepo：npm workspaces + Turborepo
- 代码规范：Biome / ultracite

## 常用命令

| 用途 | 命令 |
| --- | --- |
| 安装依赖 | `npm install` |
| 开发 | `npm run dev` |
| 构建 | `npm run build` |
| 类型检查（测试） | `npm run check-types` |
| Lint / 格式化 | `npm run check` |

## 目录结构

```
betterHub/
├── apps/
│   ├── web/         # React + TanStack Router 前端
│   ├── server/      # Hono + tRPC 后端
│   └── docs/        # Astro Starlight 文档
├── packages/
│   ├── api/         # tRPC 路由/契约
│   ├── auth/        # Better-Auth 配置
│   ├── db/          # Drizzle ORM + PostgreSQL
│   ├── config/      # 共享配置
│   ├── env/         # 环境变量校验
│   └── ui/          # 共享 UI 组件
├── specs/           # 开发规格 (requirements/design/tasks)
├── biome.json       # Biome/ultracite 配置
└── turbo.json       # Turborepo 任务管线
```

## Rules（按需引入）

- @rules/coding-style.md — 通用编码风格与 Biome/ultracite 格式约定
- @rules/frontend.md — 前端（`apps/web`，React + TanStack Router）规范
- @rules/backend-api.md — 后端 API（`apps/server` + `packages/api`，Hono + tRPC）规范
- @rules/database.md — 数据层（`packages/db`，Drizzle + PostgreSQL）规范
- @rules/security.md — 认证、授权、输入校验与密钥安全规范
- @rules/git-workflow.md — 分支、提交、PR 与提交前检查
- @rules/testing.md — 测试策略与必需的校验门槛

---

<!-- 项目踩坑/教训（自学习闭环，开发中持续追加） -->
@AGENTS.md
