# shadcn-nsh

[English](./README.md)

给 [Native Shell (NSH)](https://github.com/longbridge/nsh) 的带样式组件：画在 `nsh/base` 上，以**你自己的文件**交给应用 —— 组件、主题，以及一个把它们复制下来的 registry。形状与 [shadcn/ui](https://github.com/shadcn-ui/ui) 给 React 的一样。

文档站，每个组件的属性与可运行演示：**https://shadcn-nsh.aning.dev/**

- **复制即拥有。** `add` 把组件、它的主题和它用到的共享外观写进你的应用，然后放手：没有我们的运行时包，也没有需要跟着升级的东西。
- **外观是数据。** 组件只从 `theme.json` 与 `semantics.json` 读颜色、圆角与表面，从不写死，所以换一套主题数据就换整套外观。
- **该原生处原生。** 行为、无障碍与平台差异都来自 `nsh/base`；外壳只决定长什么样，并在手机、桌面、终端三种形态下自适应。

## 快速开始

应用里先有 `nsh.json`（`nsh init` 生成）：

```sh
npx shadcn-nsh init                 # 写 nsh-ui.json、装主题、nsh.json 指向它、配好 @/ 别名
npx shadcn-nsh add button           # 一个条目，连同它依赖的文件
npx shadcn-nsh add --all            # 全部组件
```

`init` 的选择记在 `nsh-ui.json`，主题写在 `theme.json` + `lib/ui/semantics.json`，每个 `nsh.json` 指过去；应用里还会配好 `@/` 导入别名（`tsconfig.json` 的 paths 加 `"@/*": ["./*"]`，`nsh.json` 加 `"resolve": { "alias": { "@": "./" } }`），文档示例里的 `@/components/ui/<name>`、`@/lib/ui/theme` 因此可解析。`add` 复制文件，并用你的包管理器装上条目声明的包（含 `lucide`）。从此这些文件归你改。

`list`、`view`、`diff` 只读不写：`npx shadcn-nsh list`、`view button`、`diff`（应用的副本与 registry 不同时退出码 1）。每个命令都接受 `-c <dir>`，`add` 另有 `--dry-run` 与 `--overwrite`。参数与默认值见 [CLI 参考](https://shadcn-nsh.aning.dev/docs/cli)。

## 主题

`init` 装的是本库自己的主题。另外两套以主题条目提供：

```sh
npx shadcn-nsh init --theme shadcn                      # 用 shadcn 的中性配色构建
npx shadcn-nsh add theme-apple                    # 多带一套，运行时切换
```

`init --theme <default|shadcn|solid-glass|apple|material|native>` 决定应用**构建时**用的主题；`add theme-<name>` 则**多装一套**到 `themes/<name>/`，供应用运行时用 `selectTheme` 切换（`selectTheme(null)` 回到构建时那套）。`nsh-ui.json` 记着构建时用的是哪一套，所以 `add` 不会把别的主题写回去。token、语义层与切换示例见[主题](https://shadcn-nsh.aning.dev/docs/themes)与 [`docs/specs/design-semantics.md`](docs/specs/design-semantics.md)。

## Registry

`init`、`add`、`list`、`view`、`diff` 读的是**与你这个 CLI 同版本**发布的 registry：

`https://raw.githubusercontent.com/aningdev/shadcn-nsh/v<version>/public/r/{name}.json`

即 `shadcn-nsh@0.7.0` 读 `v0.7.0` 的 registry：文件与你在跑的 CLI 对得上，新版本发布也不会悄悄改掉已装应用的源码。`--registry <template>`（含 `{name}`）可以指向别处 —— 分支、本地 `serve`、fork。

## 兼容矩阵

本库每个版本对应一个 NSH CLI 版本。装了更新的 CLI 不会让旧版本变错，只是那些组件是照着当时 `nsh/base` 的样子写的。

| shadcn-nsh | NSH CLI |
| ---------- | ------- |
| 0.9.x      | v0.6.1  |
| 0.8.x      | v0.6.0  |
| 0.7.x      | v0.5.1  |
| 0.6.x      | v0.5.1  |

## 参与与声明

- 贡献 —— 开发环境、提交前要跑的检查、提交信息格式：[`CONTRIBUTING.md`](CONTRIBUTING.md)。
- 项目怎么搭起来、代码守哪些规则：[`AGENTS.md`](AGENTS.md)、[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)，词汇见 [`docs/GLOSSARY.md`](docs/GLOSSARY.md)。
- 安全问题上报：[`SECURITY.md`](SECURITY.md)。
- 许可：MIT；改编自 NSH 的部分为 Apache-2.0，Solid Glass 主题附其 MIT 文本 —— [`NOTICE`](NOTICE)、[`LICENSE`](LICENSE)。

## 在本仓库开发

需要 Bun 与 NSH CLI（只安装，不编译），然后：

```sh
git submodule update --init --recursive
bun install
bun run nsh:bootstrap   # 校验 CLI 与 references/nsh 在基线，生成各 .nsh
bun run dev:docs        # 文档站
bun run check           # CI 跑的那一串
```

完整环境、一次改动要过的检查、怎么移植一个组件，见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

## 目录

| 路径                         | 包 / 角色             | 说明                                                                                                                                                        |
| ---------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/theme`             | `@shadcn-nsh/theme`   | `theme.json`、`semantics.json`、`theme.ts` —— 基础 token 与语义层（本库所有，oklch）；`themes/<name>/` 是另一套主题的数据，作为它的 `theme-<name>` 条目发布 |
| `packages/ui`                | `@shadcn-nsh/ui`      | 一个组件一个文件：外观（`// @port` 区域）+ 外壳                                                                                                             |
| `apps/website/demos`         | —                     | 验收演示、参照页、`port:render`                                                                                                                             |
| `apps/website/content/docs`  | —                     | 文档页（`/docs/…`），由 `src/routes/docs/$.tsx` 渲染                                                                                                        |
| `apps/gallery`               | `@shadcn-nsh/gallery` | 原生行为测试与冒烟页                                                                                                                                        |
| `packages/cli`               | `shadcn-nsh`（npm）   | `init` / `add` / `list` / `view` / `diff` / `build` / `serve`                                                                                               |
| `registry.json` → `public/r` | —                     | registry 源 → 提交的 HTTP 产物                                                                                                                              |
| `scripts/port`               | —                     | `port:new` / `port:vendor` / `port:check` / `port:review` / `port:render` / `port:bump`                                                                     |
| `port-map.json`              | —                     | 上游每个文件与声明的去向                                                                                                                                    |
| `references/`                | —                     | 只读 submodule：上游基线、shadcn 参考                                                                                                                       |
