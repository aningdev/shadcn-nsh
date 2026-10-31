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

| 层                 | 权威参考                                                          | 本仓职责                                      |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------- |
| 分发与作者体验     | `references/shadcn-ui`（`apps/v4/registry`、`packages/shadcn`）   | `registry.json` → `public/r` + `packages/cli` |
| 行为与 a11y        | `references/nsh` 的 `nsh/base`                                    | 组合与样式，不重写行为                        |
| 样式示例（非 API） | `references/nsh` 的 `examples/nsh-gallery-ui`、`examples/gallery` | 可借鉴 token/零件，勿当契约                   |

依赖向下：本库 → `nsh/base` → `nsh`。

主题真源是 **`theme.json`（`nsh.json` 的 `theme`）**，不是 CSS；`lib/theme.ts` 仅为 `token()` 辅助。

## 何时读参考

- **Registry / CLI / 组件源码组织** — 读 `references/shadcn-ui`：先 `CONTRIBUTING.md`，再 `apps/v4/registry`；本仓实现见 `packages/cli`。
- **控件行为、parts、平台差异、Tailwind/theme** — 读 `references/nsh` 与 [nsh.dev/llms.txt](https://nsh.dev/llms.txt)。
- **组件库架构约定** — 对齐 NSH Coding Guides 的 library 边界。

## 当前布局

Bun workspaces（`apps/*`、`packages/*`）。copy-into-app：`build` → `public/r` → `create` / `init` / `add`。

| 路径                                               | 职责                                                        |
| -------------------------------------------------- | ----------------------------------------------------------- |
| [`packages/theme`](packages/theme)                 | `theme.json` + `token()` 辅助（`@shadcn-nsh/theme`）        |
| [`packages/ui`](packages/ui)                       | 包装 `nsh/base` 的 styled 组件（`@shadcn-nsh/ui`）          |
| [`packages/cli`](packages/cli)                     | `shadcn-nsh`：`create` / `build` / `init` / `add` / `serve` |
| [`registry.json`](registry.json)                   | 源 catalog                                                  |
| [`public/r`](public/r)                             | 可 HTTP 拉取的 registry 产物（提交进 git）                  |
| [`apps/gallery`](apps/gallery)                     | 原生验真 demo（workspace 依赖作者包）                       |
| [`apps/docs`](apps/docs)                           | Astro 文档站；可选 `docs:demos` 打 NSH web 预览             |
| [`templates/nsh-monorepo`](templates/nsh-monorepo) | 消费方 starter（`create` 拷贝）；**不进**根 workspaces      |
| [`references/`](references/)                       | 只读 submodule                                              |

**三面分工**：gallery = 原生验真；docs = 公开说明 + web 示意；template/`create` = 消费方 monorepo（`apps/web` + `packages/ui`）。作者侧 `packages/ui`（`@shadcn-nsh/ui`）≠ 模板内 `packages/ui`（`@workspace/ui` copy-into-app 落点）。

尚未开建：多 style、npm publish。扩展布局时同步更新本节。

## 工具链

Bun 管理依赖与脚本；格式化 / lint / 工具面类型经 [Vite+](https://viteplus.dev)（`vp fmt` / `vp lint` / `vp check`，内置 Oxfmt / Oxlint），配置集中在根 `vite.config.ts`，不用 Prettier。

### TypeScript 分层

| 面           | 路径                                                   | extends                                                                                                                                                    | 类型权威                                       |
| ------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 共享选项     | `tsconfig.base.json`                                   | —                                                                                                                                                          | —                                              |
| NSH 组件作者 | `tsconfig.nsh.json` → `packages/theme`、`packages/ui`  | base + NSH JSX；`paths`/`files` 指向 **gallery `.nsh`（本仓唯一 types host）**                                                                             | `nsh check apps/gallery` 为主；`vp check` 可辅 |
| NSH 应用     | `apps/gallery/tsconfig.json`                           | **仅** `./.nsh/tsconfig.json`；自带 `paths` 时须手写回填 `nsh` / `nsh/*` / `*`（TS **不合并** extends 的 paths）；只 `include` 本 app，用 paths 引用包入口 | `nsh check apps/gallery`                       |
| 工具链       | `packages/cli`、根 `tsconfig.json`（`vite.config.ts`） | base；CLI 加 `types: ["node","bun"]`                                                                                                                       | `vp check`                                     |

改 theme/ui 前先保证 gallery 的 `.nsh` 已生成（`nsh check apps/gallery` / `prepare:types`）。

根 `check` = `vp check`（fmt + lint + 工具面类型）+ `nsh check apps/gallery`（NSH 面）。

## 常用命令

```sh
bun install
bun run check                   # vp check + nsh check apps/gallery
bun run check:fix              # vp check --fix
bun run registry:build
bun run registry:serve          # http://127.0.0.1:4173/{name}.json
bun run shadcn-nsh -- create <name>
bun run shadcn-nsh -- init -c <app> --registry 'http://127.0.0.1:4173/{name}.json'
bun run shadcn-nsh -- add button -c <app> --registry 'http://127.0.0.1:4173/{name}.json'
bun run check:gallery
bun run dev:gallery
bun run dev:docs
bun run docs:demos              # nsh package demos → apps/docs/public/demos
```

默认远程 registry（push 后）：`https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`。
