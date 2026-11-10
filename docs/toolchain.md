# 工具链与 TypeScript 分层

从 `AGENTS.md` 拆出；改 tsconfig、types host 或类型检查链路时读这里。

## TypeScript 分层

| 面            | 路径                                                   | extends                                                                                                                                                    | 类型权威                                                                                |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 共享选项      | `tsconfig.base.json`                                   | —                                                                                                                                                          | —                                                                                       |
| NSH 组件作者  | `tsconfig.nsh.json` → `packages/theme`、`packages/ui`  | base + NSH JSX；`paths`/`files` 指向 **gallery `.nsh`（本仓唯一 types host）**                                                                             | `nsh check apps/gallery` 为主；`vp check` 可辅                                          |
| NSH 应用      | `apps/gallery/tsconfig.json`                           | **仅** `./.nsh/tsconfig.json`；自带 `paths` 时须手写回填 `nsh` / `nsh/*` / `*`（TS **不合并** extends 的 paths）；只 `include` 本 app，用 paths 引用包入口 | `nsh check apps/gallery`                                                                |
| Docs（Astro） | `apps/docs/tsconfig.json`                              | `astro/tsconfigs/strict` + `contentMappers`（`@astrojs/ts-content-mapper` → `.astro`）                                                                     | `astro sync && tsc --noEmit --runExternalCode`（不用 `astro check` / `@astrojs/check`） |
| 工具链        | `packages/cli`、根 `tsconfig.json`（`vite.config.ts`） | base；CLI 加 `types: ["node","bun"]`                                                                                                                       | `vp check`                                                                              |

TypeScript 为 **7.1**（content mapper 所需；状态仍 experimental / beta）。`astro check` 方向是弃用或内部转调 `tsc`；TS 7 不再提供旧 Language Service API，故官方推荐原生 `tsc` + content mapper。

改 theme/ui 前先保证 gallery 的 `.nsh` 已生成（`nsh check apps/gallery` / `prepare:types`）。

## NSH CLI

本仓 Phase-1 对齐 **store / GitHub release CLI**（当前 `0.4.0`）。不要用 `install.sh --source`——docs CI 与本地都装 release tarball。仅包装该 release 已注册的 `nsh/base` 导出；清单与缺口见 `packages/ui/README.md`。

```sh
curl -fsSL https://nsh.dev/install.sh | sh
bun run nsh:bootstrap           # prepare:types（生成各 .nsh）
```

## `check` 的组成

根 `bun run check` = `vp check --fix`（fmt + lint + 工具面类型，**会改文件**）→ `nsh check apps/gallery`（NSH 面）→ `check:demos` → `check:docs`（Astro / `tsc`）。
