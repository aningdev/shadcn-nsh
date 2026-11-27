# 参与贡献

先读 [`AGENTS.md`](AGENTS.md)、[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)、[`docs/component-authoring.md`](docs/component-authoring.md) 和 [`docs/theme.md`](docs/theme.md)。

## 环境

本地需要 [Bun](https://bun.sh) 和已安装的 NSH CLI。参考版本是根 `package.json` 的 `engines.nsh`。CLI 只做类型检查、运行演示和测试，**不编译 NSH**，也不初始化子模块。

```sh
bun install
bun run prepare:types
```

`prepare:types` 对 gallery、演示和 showcase 做 `nsh check`，并留下各应用的 `.nsh` 类型宿主。

## 常用命令

| 命令                                           | 做什么                             |
| ---------------------------------------------- | ---------------------------------- |
| `bun run dev:docs`                             | 文档站                             |
| `bun run dev:gallery`                          | gallery                            |
| `bun run dev:showcase`                         | showcase                           |
| `nsh run apps/website/demos/button.tsx`        | 跑单个演示                         |
| `bun run new:component <id> --base <Symbol>`   | 基于 `nsh/base` 的新组件           |
| `bun run new:component <id> --view [--family]` | 只排版上色的新组件                 |
| `bun run check:demos`                          | 演示盖住每个声明的轴               |
| `bun run check:narrow`                         | 320 宽首帧不溢出                   |
| `bun run registry:build`                       | 由 `registry.json` 重建 `public/r` |
| `bun run registry:serve`                       | 本地 registry，试装用              |

## 分支与 PR

`main` 受保护。每个改动一个 PR，`check` 通过后 squash 合并。

- bug 与新组件先开 issue，PR 正文写 `Closes #N`。错字和文档小修可以直接开 PR。
- 分支名 `<type>/<短描述>`，与提交类型相同：`fix/field-label-wrap`、`feat/combobox-chips`。
- 一个 PR 一件事：一个组件家族，或一个 bug。
- PR 标题就是合并后的提交信息。
- 用的人能感知到的改动，在同一个 PR 里写入 `CHANGELOG.md` 的 `## Unreleased`（Added / Changed / Fixed）。只改内部工具、CI、测试的不用写。

## 提 PR 前

`bun run check` 会执行 `vp check --fix`，先看 diff。它依次跑：

```text
vp check --fix
bun run catalog --check
bun run tokens:build --check
bun run check:theme
bun run theme:contrast
bun run docs:semantics --check
bun run check:children
bun run check:rtl
bun run check:ui
bun run registry:build --check
bun run check:demos
nsh check apps/website/demos
nsh check apps/gallery
nsh check apps/showcase
bun run check:pages
bun run check:docs
```

按改动再补：

- 改了演示布局 → `bun run check:narrow`。
- 改了主题数据 → `bun run theme:diff`。只改颜色时，`tokens:build --check`、`check:theme`、`theme:contrast`、`theme:diff` 足够。尺寸、材质、状态或动效要看受影响的演示。平台表达不了的取舍写进 `packages/theme/themes/<id>/README.md`。契约见 [`docs/theme.md`](docs/theme.md)。
- 改了行为 → `bun run test:gallery`。改了展示壳 → `nsh test apps/showcase`。
- 改了 registry 条目或 CLI → `bun run test:install`。
- 改了 `registry.json` 或组件文件 → `bun run registry:build`，`public/r` 一起提交。

## 提交信息

英文、约定式：`type(scope): summary`。类型用 `feat`、`fix`、`docs`、`chore`、`refactor`、`test`。scope 是组件 id、区域或 `cli`。

```text
fix(menu): keep the sub menu inside the window
feat(terminal): draw the program's output on the theme's well
```

PR 正文写为什么改。模板分四段：改了什么与为什么、破坏性变更、截图、怎么确认的。

## 加一个组件

1. `bun run new:component <id> --base <Symbol>`，或 `--view`，需要零件时加 `--family`。
2. 颜色只来自主题。外观上的决定写进组件文档页。
3. 补演示（手机与桌面）与文档页。对得上官方组件时在 `apps/website/src/lib/official.ts` 登记。
4. `bun run catalog --check`、`bun run check:demos`、`bun run registry:build`，再跑上一节的检查。

## 发版

一次 `vX.Y.Z` 标签放出两样东西：npm 上的 `shadcn-nsh@X.Y.Z`，以及该标签下的 `public/r`。CLI 从与自己同版本的标签读 registry：

`https://raw.githubusercontent.com/aningdev/shadcn-nsh/v<version>/public/r/{name}.json`

`main` 上的 registry 不对外读。标签只用 `v*`。

发版前：要带的 PR 都已合并，`check` 是绿的，本地跑过 `bun run test:install`。每个面向使用者的 PR 已写进 `CHANGELOG.md` 的 `Unreleased`。

1.0 之前：组件 API、registry id 或主题数据的破坏性变化，以及新组件、新条目、新主题，升 minor。修 bug、只改外观细节、只改文档与演示，升 patch。1.0 之后，破坏性变化升 major。

切版本时：

- 把 `Unreleased` 改成这一版的标题，顶部留一个空的 `## Unreleased`。
- `packages/cli/package.json` 的 `version` 改为 `X.Y.Z`。
- `README.md` 与 `README.zh.md` 的兼容矩阵加一行（本库版本 ↔ `engines.nsh` 的 NSH CLI 版本）。
- `bun run registry:build`。

发版走 PR：分支 `chore/release-vX.Y.Z`，提交信息 `chore(release): vX.Y.Z`，正文用这一版的 CHANGELOG 节。合并后在 `main` 上打标签：

```sh
git switch main && git pull --ff-only
git tag vX.Y.Z
git push origin vX.Y.Z
```

`publish-cli.yml` 在 `v*` 标签上发布 npm，并核对标签与 `packages/cli/package.json` 的版本。不要改已经发出去的标签。

文档站在 GitHub Pages 的 `site` 分支上，由 `deploy-docs.yml` 构建：

| 位置    | 内容                 | 何时重建          |
| ------- | -------------------- | ----------------- |
| 站点根  | 最新 `v*` 标签的文档 | 推 `v*` 标签      |
| `/dev/` | `main` 的文档        | 每次合并到 `main` |

`main` 的推送用 `DOCS_BASE=/dev/`，只替换 `site` 里的 `dev/`。`v*` 标签检出该标签的树，用根 base 构建，替换除 `dev/` 以外的全部。页面里的站点路径过 `sitePath()`，base 只来自构建时的 `DOCS_BASE`（`apps/website/vite.config.ts`）。
