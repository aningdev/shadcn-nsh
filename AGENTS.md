# AGENTS.md

本仓库为 NSH 构建 **styled component-library 层**（社区/应用层）：在 `nsh/base` 的 unstyled 行为与无障碍结构之上，提供可复制进应用的品牌化组件与分发体验。角色对齐 shadcn/ui 之于 Radix。

**不做**：改 `nsh` / `nsh/base` 本身；不把 Gallery 演示样式当成可发布 API。

## References

只读参考，默认不在 submodule 内改代码或向上游提 PR（除非用户明确要求）。

| 路径                                           | 用途                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- |
| [`references/shadcn-ui`](references/shadcn-ui) | 体系模式：registry、文档站、CLI、copy-into-app             |
| [`references/nsh`](references/nsh)             | 平台与 unstyled 基础：`nsh` / `nsh/base`、Gallery 示例样式 |

克隆后若目录为空：`git submodule update --init --recursive`。

## 分层

| 层                 | 权威参考                                                          | 本仓职责                     |
| ------------------ | ----------------------------------------------------------------- | ---------------------------- |
| 分发与作者体验     | `references/shadcn-ui`（`apps/v4/registry`、`packages/shadcn`）   | 后续仿 registry / docs / CLI |
| 行为与 a11y        | `references/nsh` 的 `nsh/base`                                    | 组合与样式，不重写行为       |
| 样式示例（非 API） | `references/nsh` 的 `examples/nsh-gallery-ui`、`examples/gallery` | 可借鉴 token/零件，勿当契约  |

依赖向下：本库 → `nsh/base` → `nsh`。

## 何时读参考

- **Registry / CLI / 组件源码组织** — 读 `references/shadcn-ui`：先 `CONTRIBUTING.md`，再 `apps/v4/registry`。
- **控件行为、parts、平台差异、Tailwind/theme** — 读 `references/nsh` 与 [nsh.dev/llms.txt](https://nsh.dev/llms.txt)。
- **组件库架构约定** — 对齐 NSH Coding Guides 的 library 边界。

## 当前布局

仓库处于初始化阶段：仅有 agent 指引与 `references/` 子模块，尚无应用代码、registry 或 CLI。新增产品代码前先更新本节。
