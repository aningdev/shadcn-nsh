# AGENTS.md

本仓库是 NSH 的 shadcn 模式组件库：一个组件一个文件，经 registry 和 CLI 复制进应用（Copy-into-app），复制后归应用所有。外观、状态、几何和对外 API 由本库决定。行为与无障碍来自 `nsh/base`（不改）。分发方式、目录、组合角色与 API 命名参照 shadcn。

起源于 NSH gallery 的文件在文件头一行致谢（`Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.`），代码归本库，可以直接改。颜色只来自主题（`packages/theme`），组件代码里不写颜色字面量。

**设计或改一套主题之前，先读 [`docs/theme.md`](docs/theme.md)。**

**写或改任何组件、主题、演示之前，读 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)、[`docs/component-authoring.md`](docs/component-authoring.md) 和 [`docs/theme.md`](docs/theme.md)。** 现行文档就是这四篇（含 [`docs/theme-values.md`](docs/theme-values.md)，由 `docs:semantics` 生成）。

**不做**：改 `nsh` / `nsh/base`；在组件代码里写颜色字面量；把演示适配层（`Stage` / `Split` / `Inspector` / `Panel` / `Log` / `Segmented`）放进组件库或 registry；为旧 registry id 提供别名；删掉根目录 `NOTICE` 或已有文件头的 Apache-2.0 致谢行。

## 目录

| 路径                         | 内容                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `docs/`                      | 四篇：架构与词汇、组件写法、主题契约、主题值表                                                                         |
| `packages/theme`             | 真源 `themes/<id>/index.ts`；`theme:build` 导出 `theme.json`、`{light,dark}.tokens.json`、`DESIGN.md`；`theme.ts` 读取 |
| `packages/ui`                | 组件（look + 外壳）。`lib/` 为共享模块                                                                                 |
| `apps/website/demos`         | 验收演示、演示适配层 `stage.tsx`                                                                                       |
| `apps/website/content/docs`  | 文档站页面。路由在 `apps/website/src/routes/`                                                                          |
| `apps/showcase`              | 展示应用。首页 “See it running” 嵌入其打包产物                                                                         |
| `registry.json` → `public/r` | shadcn registry 产物                                                                                                   |
| `apps/gallery`               | 原生行为测试与冒烟页                                                                                                   |
| `packages/cli`               | `shadcn-nsh` CLI                                                                                                       |

## 分层

```
packages/theme   themes/<id>/index.ts --[theme:build]--> theme.json + {light,dark}.tokens.json + DESIGN.md
packages/ui/lib  没有所属控件的共享部分
packages/ui/<id>.tsx  一个组件 = look + 外壳
apps/website/demos、docs
        │
        ▼
registry.json → public/r → shadcn-nsh add
```

依赖向下：本库 → `nsh/base` → `nsh`。六套主题的真源是 `packages/theme/themes/<id>/index.ts`。`bun run theme:build` 单向导出。运行时读 `theme.ts`。平台主题的依据见各自主题目录的 `README.md`。

## 工作约定

- 新组件用 `bun run new:component` 起步，不从空文件或旧组件复制。
- `main` 受保护：每个改动一个分支（`<type>/<短描述>`）、一个 PR（标题是约定式提交信息，squash 合并）。bug 与新组件先有 issue，PR 写 `Closes #N`。用的人能感知到的改动在同一 PR 里写进 `CHANGELOG.md` 的 `Unreleased`。流程见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。
- 一个家族一个 PR。开 PR 前 `bun run check` 通过；改了演示布局再跑 `bun run check:narrow`。
- 改 `registry.json` 或组件文件后运行 `bun run registry:build`。`bun run check` 里的 `registry:build --check` 会拦下没重建的提交。
- 发版按 [`CONTRIBUTING.md`](CONTRIBUTING.md#releasing)：改 `packages/cli/package.json` 的版本号、切 CHANGELOG、`bun run registry:build`、合并后打 `v*` 标签。
- Gallery 是原生行为与冒烟。一族增加 `packages/ui` 组件、`apps/gallery/tests/<family>.fixture.tsx` 与 `.test.tsx`，需要时在 `App.tsx` 加一节。
- 文档站页面在 `apps/website/content/docs/`。组件页章节以 [`docs/component-authoring.md`](docs/component-authoring.md#文档页) 为准。`official.ts` 与 `palettes.ts` 生成的行不手写。`DOCS_BASE` 与 `sitePath()` 见 [`CONTRIBUTING.md`](CONTRIBUTING.md#releasing)。

## 工具链

Bun 管理依赖与脚本。格式化 / lint / 工具面类型经 Vite+（`vp fmt` / `vp lint` / `vp check`），配置在根 `vite.config.ts`。

NSH CLI **只安装、从不编译**。版本是根 `package.json` 的 `engines.nsh`。类型宿主由 `bun run prepare:types` 生成。

## 常用命令

```sh
bun install && bun run prepare:types
bun run new:component <id> --base <Symbol> [--family]
bun run new:component <id> --view [--family]
bun run catalog --check
bun run check:demos          # variant / size / tone 与共享 Tone 在演示里都出现
bun run check:narrow         # 320 宽首帧，右边距是空白页面
bun run check                # 见 CONTRIBUTING.md 的拆解
bun run test:unit
bun run test:gallery
nsh test apps/showcase
bun run test:install
nsh run apps/website/demos/button.tsx
```

`init` / `add` 用法见 [`README.md`](README.md)。
