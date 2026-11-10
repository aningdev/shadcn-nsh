# AGENTS.md

本仓库为 NSH 构建 **styled component-library 层**（社区/应用层）：在 `nsh/base` 的 unstyled 行为与无障碍结构之上，提供可复制进应用的品牌化组件与分发体验。分发模式对齐 shadcn/ui；行为权威仍是 `nsh/base`；**视觉与状态设计的来源是 `references/nsh/examples/nsh-gallery-ui`，本库是它的规范化、可分发版本**（配色用 shadcn neutral），路线图见 [`docs/roadmap.md`](docs/roadmap.md)。

产品单元是 **Styled Component**（Copy-into-app）：双主目标为品牌外观（`theme.json` / `token()`）与 registry/CLI 分发。复合控件公开 **Composition Facade**（`Trigger` / `Content` / `Item` 等角色），**家族名与 registry id 跟 `nsh/base` 符号**（如 `Menu` / `MenuTrigger` / `add menu`），不是 shadcn 的 `DropdownMenu*` / `dropdown-menu`。内部仍适配 base 的 value/open/items/`trigger` 模型；对外 **Composition-only**（不保留 legacy 单根 `trigger` 双路径）。无法抹平的差异写进各组件 docs 的 Differences。词汇见 [`GLOSSARY.md`](GLOSSARY.md)；写或改组件前读 [`packages/ui/README.zh.md`](packages/ui/README.zh.md)（范围规则、组件包、配方、文件内顺序、改造方法）；写或改主题（颜色、半径、阴影）前读 [`packages/theme/README.zh.md`](packages/theme/README.zh.md)；动效与过渡的约定在 `packages/ui/README.zh.md` 的“组件内的动效”。新决策追加到这两份 README 的“决策记录”。

**不做**：改 `nsh` / `nsh/base` 本身；不搬 gallery-ui 的品牌色、终端形态、声音和网站 playground 适配；不新增无 base 的 Extensions；不为旧 shadcn 形 registry id 提供 alias。

## References

只读参考，默认不在 submodule 内改代码或向上游提 PR（除非用户明确要求）。

| 路径                                           | 用途                                                          |
| ---------------------------------------------- | ------------------------------------------------------------- |
| [`references/shadcn-ui`](references/shadcn-ui) | 体系模式：registry、文档站、CLI、copy-into-app                |
| [`references/nsh`](references/nsh)             | 平台与 unstyled 基础：`nsh` / `nsh/base`；视觉来源 gallery-ui |

克隆后若目录为空：`git submodule update --init --recursive`。

## 分层

| 层             | 权威参考                                                        | 本仓职责                                                                  |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 分发与作者体验 | `references/shadcn-ui`（`apps/v4/registry`、`packages/shadcn`） | `registry.json` → `public/r` + `packages/cli`                             |
| 行为与 a11y    | `references/nsh` 的 `nsh/base`                                  | 组合与样式，不重写行为                                                    |
| 视觉与状态来源 | `references/nsh` 的 `examples/nsh-gallery-ui`（`look/*`）       | 规范化移植：取状态设计与几何，颜色走 neutral，文件头记基线提交 `64ab8a1d` |

依赖向下：本库 → `nsh/base` → `nsh`。

主题真源是 **`theme.json`（`nsh.json` 的 `theme`）**，不是 CSS；`lib/theme.ts` 读取它，并提供 `token()` 辅助、finish、焦点环和 disabled 外观。

## 何时读参考

- **Registry / CLI / 组件源码组织** — 读 `references/shadcn-ui`：先 `CONTRIBUTING.md`，再 `apps/v4/registry`；本仓实现见 `packages/cli`。
- **控件行为、parts、平台差异、Tailwind/theme** — 读 `references/nsh` 与 [nsh.dev/llms.txt](https://nsh.dev/llms.txt)。
- **组件库架构约定** — 对齐 NSH Coding Guides 的 library 边界。
- **组件的视觉与状态设计** — 读 `references/nsh/examples/nsh-gallery-ui/README.md` 与对应 `look/*`；移植循环见 [`docs/roadmap.md`](docs/roadmap.md) §6。

## 布局

Bun workspaces（`apps/*`、`packages/*`）；路径与包名见 [`README.md`](README.md) 的 Layout。copy-into-app：`build` → `public/r` → `init` / `add`。

**两面分工**：gallery = 原生验真；docs = 公开说明 + web 示意。作者侧 `packages/ui`（`@shadcn-nsh/ui`）是 registry 源；消费方落点通常是应用内或 `@workspace/ui`（copy-into-app）。扩展布局时同步更新 README 的 Layout。

## 工作约定

- 改 `packages/ui` 或 `packages/theme` 后必须 `bun run registry:build`，并提交 `public/r`。
- `public/r` 提交进 git，可以直接手改；手改后建议 `vp fmt public/r`。`apps/docs/public/demos` 是产物（已 gitignore），不要手改。
- 改 theme/ui 前先保证 gallery 的 `.nsh` 已生成：`bun run nsh:bootstrap`。

## 工具链

Bun 管理依赖与脚本；格式化 / lint / 工具面类型经 [Vite+](https://viteplus.dev)（`vp fmt` / `vp lint` / `vp check`），配置集中在根 `vite.config.ts`，不用 Prettier。

TypeScript 分层（tsconfig 的 extends、types host、各面类型权威）、TS 7.1 与 NSH CLI（store release，勿用 `install.sh --source`）见 [`docs/toolchain.md`](docs/toolchain.md)。

## 常用命令

```sh
bun run nsh:bootstrap   # 生成各 .nsh types host
bun run check           # vp check --fix → nsh check → check:demos → check:docs（会改文件）
bun run registry:build  # registry.json → public/r
bun run registry:serve  # http://127.0.0.1:4173/{name}.json
```

其余脚本（`dev:*`、`check:*`、`docs:demos`、`cli:build`）见根 `package.json`；`init` / `add` 用法与默认远程 registry 见 [`README.md`](README.md)。
