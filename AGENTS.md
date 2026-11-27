# AGENTS.md

本仓库是 NSH 的 shadcn 模式组件库：一个组件一个文件，经 registry 和 CLI 复制进应用（Copy-into-app），复制后归应用所有。组件**由本库自己抽取并拥有**：NSH 官方示例共享的 UI 层 `references/nsh/examples/nsh-gallery-ui`（下称**上游**）与官方推荐的样子是参考规范，不是必须逐字照搬的源头。定位见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#定位)。

各方的角色：

| 来源                  | 角色                                                                                |
| --------------------- | ----------------------------------------------------------------------------------- |
| 本库                  | 主题、外观、状态、几何、对外 API 的**决定者**                                       |
| 上游 `nsh-gallery-ui` | 外观的**参考规范**与抽取起点；它的变化由 `port:check` 提醒，我们审阅后决定是否采纳  |
| shadcn                | 分发方式、目录、一组件一文件、组合角色（`Trigger` / `Content` / …）、API 命名的参照 |
| `nsh/base`            | 行为与无障碍（不改）                                                                |

起源于上游的文件在文件头一行致谢（`Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.`），代码本身归本库、可以直接改。上游每个声明的去向记在 [`port-map.json`](port-map.json)；`port:vendor` 只在新增组件时抽取初稿，不覆盖已有代码。颜色只来自主题（`packages/theme`），组件代码里不写颜色字面量。

**设计或改一套主题之前，先读 [`docs/theme.md`](docs/theme.md)**（Theme v5 契约、角色、检查）。

**写或改任何组件、主题、演示之前，读 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**（目录、分层、规则 P1–P9、归属、词汇）、**[`docs/port.md`](docs/port.md)**（每个组件的流程、外壳写法、检查）**和 [`docs/component-authoring.md`](docs/component-authoring.md)**（文件顺序、私有 Look、TUI 尺寸、响应式、安全区）。

**不做**：改 `nsh` / `nsh/base`；在组件代码里写颜色字面量（颜色一律经主题角色）；搬上游的声音；把上游的 demo 适配层（`Stage` / `Split` / `Inspector` / `Panel` / `Log` / `Segmented`）放进组件库或 registry（它只在 `apps/website/demos` 里，供演示用）；为旧 registry id 提供别名。

## 目录

| 路径                         | 内容                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `docs/`                      | 六篇现行文档：架构与词汇、组件写法、主题契约、主题值表、移植流程、工具链与发版                                          |
| `packages/theme`             | 真源 `themes/<id>/index.ts`；`tokens:build` 导出 `theme.json`、`{light,dark}.tokens.json`、`DESIGN.md`；`theme.ts` 读取 |
| `packages/ui`                | 组件（look + 外壳；起源于上游的文件在文件头致谢）。`lib/` 为 9 个共享模块                                               |
| `apps/website/demos`         | 验收演示、演示适配层 `stage.tsx`、渲染比对、`port:render`                                                               |
| `apps/website/content/docs`  | 文档站页面（组件页、主题页）；路由在 `apps/website/src/routes/`                                                         |
| `apps/showcase`              | 展示应用：Gallery 的壳与本库组件重建的场景（分批实现），首页 “See it running” 嵌入其打包产物                            |
| `registry.json` → `public/r` | shadcn registry 产物                                                                                                    |
| `apps/gallery`               | 原生行为测试与冒烟页                                                                                                    |
| `packages/cli`               | `shadcn-nsh` CLI                                                                                                        |

`port-map.json` 的 `root` 为仓库根；目标路径写全（如 `packages/ui/button.tsx`）。

## References

只读参考，默认不在 submodule 内改代码或向上游提 PR（除非用户明确要求）。

| 路径                                           | 用途                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`references/nsh`](references/nsh)             | 上游：`examples/nsh-gallery-ui`（参考规范）；`nsh` / `nsh/base`；文档                                                |
| [`references/shadcn-ui`](references/shadcn-ui) | 体系模式：registry、文档站、CLI、copy-into-app                                                                       |
| [`references/design.md`](references/design.md) | DESIGN.md 格式规范（Google Labs）。本库的 `DESIGN.md` 由 `tokens:build` 按它生成，不手改                             |
| [`references/ui-sdk`](references/ui-sdk)       | Vercel UI SDK：与框架无关的行为层（behavior → primitive → parts）与面向代理的写法（skill、expert、文档），作对照参考 |
| [nsh.dev/llms.txt](https://nsh.dev/llms.txt)   | NSH 官方文档索引（在线）：每页的 URL 加 `.md` 即 Markdown 原文；`references/nsh` 的 `website/` 是它的源，以基线为准  |

克隆后若目录为空：`git submodule update --init --recursive`。

**上游基线跟安装的 CLI 走。** 基线是安装的 CLI 打印的提交（`nsh --version`）：`references/nsh` 固定在那里，`port-map.json` 的 `upstream.commit` 与它相同，`upstream.cli` 记下装的是哪个版本（release tag，如 `v0.5.0`；或 `nightly`）。**不编译 NSH**，也不设 `NSH_RUNTIME`。装法：`curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=<upstream.cli> sh`（`nightly` 时用 `sh -s -- --nightly`）；`bun run nsh:bootstrap` 会打印这条命令。换版本后 `bun run port:bump`。步骤见 [`docs/toolchain.md`](docs/toolchain.md)。

## 何时读参考

- **某个控件长什么样、有哪些状态** — 上游的 `look/*` 与 `README.md`；它在 NSH 网站上的用法见 `references/nsh/website/demos/el-<id>.tsx`。
- **控件行为、parts、平台差异** — `references/nsh` 与 [nsh.dev/llms.txt](https://nsh.dev/llms.txt)。
- **为设计语言写 DESIGN.md** — `references/design.md` 的 `README.md` 与 `docs/spec.md`。
- **Registry / CLI / 文档页的组织** — `references/shadcn-ui`：先 `CONTRIBUTING.md`，再 `apps/v4/registry`；本仓实现见 `packages/cli`。
- **行为如何拆成可组合的部件、怎样写给代理用** — `references/ui-sdk`：先 `AGENTS.md`，再 `packages/core` 与 `.agents/`。

## 分层

```
上游 nsh-gallery-ui（参考规范；port:check 提醒变化）
   │  新增组件时 port:vendor 抽取初稿
   ▼
packages/theme   themes/<id>/index.ts --[tokens:build]--> theme.json + {light,dark}.tokens.json + DESIGN.md；theme.ts 读取
packages/ui/lib  没有所属控件的共享部分（press、overlay、surface…）
packages/ui/<id>.tsx  一个组件 = look + 外壳，都归本库
apps/website/demos、docs  演示与文档页
   │
   ▼
registry.json → public/r → shadcn-nsh add
```

依赖向下：本库 → `nsh/base` → `nsh`。六套主题（`nsh-gallery`、`shadcn`、`solid-glass`、`apple`、`material`、`winui`）的真源是 `packages/theme/themes/<id>/index.ts`：`nsh-gallery` 为完整 `base`，其余用 `defineTheme()` 稀疏覆写。`bun run tokens:build` 单向导出 `theme.json`、W3C DTCG `{light,dark}.tokens.json` 与 `DESIGN.md`。颜色以 oklch 存储。运行时读 `theme.ts`，不读 DTCG 文件。平台主题的依据与取舍见各自主题目录的 `README.md`。

## 工作约定

- 新组件用脚手架（`bun run port:new`）起步，不从空文件或旧组件复制。
- `main` 受保护：每个改动一个分支（`<type>/<短描述>`）、一个 PR（标题是约定式提交信息，squash 合并），bug 与新组件先有 issue，PR 写 `Closes #N`；用的人能感知到的改动在同一 PR 里写进 `CHANGELOG.md` 的 `Unreleased`。流程见 [`CONTRIBUTING.md`](CONTRIBUTING.md#分支与-pr)。
- 一个家族一个 PR；开 PR 前 `port:check`、`nsh check apps/website/demos`、`port:render`、`vp check` 全部通过，四张截图人眼看过。
- look 与外壳都可以直接改；有意的外观决定写进对应文档。上游有变化时 `port:check` 会列出待审阅项，审阅后采纳或忽略；`bun run port:review` 把审阅到的上游提交记进 `port-map.json`。
- 改 `registry.json` 或组件文件后运行 `bun run registry:build` 更新 `public/r`；`bun run check` 里的 `registry:build --check` 会拦下没重建的提交。
- 发版按 [`docs/toolchain.md`](docs/toolchain.md#发版) 走：改版号、切 CHANGELOG、重建 registry、打 `v*` 标签。
- Gallery 是原生行为与冒烟，不是截图。一族增加 `packages/ui` 组件、`apps/gallery/tests/<family>.fixture.tsx` 与 `.test.tsx`，需要时在 `App.tsx` 加一节。测试读原生状态。
- 文档站页面在 `apps/website/content/docs/`，不自造 `DocsLayout`。组件页章节以 [`docs/port.md`](docs/port.md#文档页) 为准。`official.ts` 与 `palettes.ts` 生成的行不手写。`DOCS_BASE` 与 `sitePath()` 见 [`docs/toolchain.md`](docs/toolchain.md#发版)。

## 工具链

Bun 管理依赖与脚本；格式化 / lint / 工具面类型经 [Vite+](https://viteplus.dev)（`vp fmt` / `vp lint` / `vp check`），配置集中在根 `vite.config.ts`，不用 Prettier。

NSH CLI **只安装、从不编译**：装 `port-map.json` 的 `upstream.cli`（不早于上游基线的 release，或 nightly），版本前进后用 `bun run port:bump` 把基线移过去。TypeScript 分层、types host、CLI 与上游基线的对齐见 [`docs/toolchain.md`](docs/toolchain.md)。

## 常用命令

```sh
bun run port:new <id> --from <上游> …  # 脚手架：路由、外壳、演示、文档、registry
bun run port:new <id> --base <nsh/base 符号>  # 本库自己的组件（无上游）：不写路由、不 vendor
bun run port:new <id> --view [--family]  # 只排版上色的自有组件（画在 nsh 的 View / Text 上）
bun run port:vendor <id>       # 新增组件时从上游抽取初稿（不覆盖已有代码）
bun run port:check             # 上游变化提醒（自上次审阅以来）、清单完整、CLI 不落后于基线
bun run port:review            # 记下审阅：把 upstream.reviewed 推到基线
bun run catalog --check        # 组件集合一致（演示、参照页、文档页、导出），catalog.generated.ts 最新
bun run port:render            # 渲染比对：组件与"look 展开在 nsh/base 上"截图相同
bun run port:render:theme --list  # 只打印主题渲染会画哪些页 × 主题及原因（--theme 收窄主题）
nsh check apps/website/demos      # 演示与 UI 的类型检查
nsh run apps/website/demos/button.tsx  # 运行一个演示

bun run nsh:bootstrap          # 校验安装的 CLI 在基线，生成各 .nsh types host
bun run tokens:build           # 从 themes/<id>/index.ts 导出 theme.json、DTCG 与 DESIGN.md
bun run tokens:build --check   # 校验导出产物与主题真源一致
bun run theme:diff             # 主题解析后的值与 origin/main 比较并分类（--same：值不许变）
bun run theme:contrast         # WCAG 2 AA：每套主题亮暗的角色对与 surface
bun run docs:semantics         # 生成 docs/theme-values.md（--check：与真源一致）
bun run check                  # tokens:build --check + check:theme + port:check + demos/gallery 类型 + docs（会改文件）
bun run test:gallery           # 原生行为测试
bun run test:install           # 复制即用：真实 NSH app 里 init / add / nsh check（逐条目）
```

其余脚本见根 `package.json`；`init` / `add` 用法见 [`README.md`](README.md)。
