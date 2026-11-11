# 工具链与 TypeScript 分层

改 tsconfig、types host、类型检查链路，或升级 NSH CLI 时读这里。

## NSH CLI 与上游基线

本仓用 **nightly** CLI，以上游 `main` 为准开发。

按 [nsh.dev](https://nsh.dev) 的说明安装 nightly。`nsh --version` 会打印构建它的提交，例如 `nsh 0.4.0 (c5214aa nightly)`。

**规则：`references/nsh` 固定的提交等于 `nsh --version` 显示的提交。** 上游的 look 用的是它自己那个提交的运行时能力；CLI 落后时，搬入的代码可能类型通过而表现不同，或者用到 CLI 还没有的属性。`bun run port:check` 会在 CLI 落后于基线时给出警告。

升级步骤：

1. 升级 CLI，记下 `nsh --version` 的提交。优先 `nsh update nightly`；若发布的 nightly 落后于 `main`，用 `curl -fsSL https://nsh.dev/install.sh | sh -s -- --source`（需 Rust）。源码安装的 CLI 跑 `port:render` 时，若本机没有 `llvm-ar` 编不出 wasm，可依赖已有的 `~/.nsh/runtime`（`scripts/port/render.ts` 会自动设 `NSH_RUNTIME`）。
2. `git -C references/nsh fetch && git -C references/nsh checkout <该提交>`。
3. 把 `port-map.json` 的 `upstream.commit` 改成该提交的完整哈希。
4. `bun run port:check`：按报错处理"清单里有、上游没有"和"上游有、清单里没有"的条目。
5. `bun run port:vendor`，再跑 `nsh check next/demos`、`bun run port:render`。
6. 提交子模块指针、`port-map.json` 和被改写的区域，三者同一个 commit。

当前状态（2026-11-11）：CLI 与基线均为 `30f87b7c`（由 `install.sh --source` 装到 main；发布的 nightly 频道当时仍停在 `c5214aa`）。外壳使用 `focusVisibleStyle`；`port:check` 在 CLI 落后于基线时报错。

发布的 nightly 追上 main 之后，可改回 `nsh update nightly`。`scripts/nsh-bootstrap.sh` 的注释仍写着"用 store release"，切换时一并改掉；它的行为（生成 types host、检查 `Button` 与 `Accordion` 存在）不受影响。

## TypeScript 分层

| 面            | 路径                                                  | extends                                                                                                      | 类型权威                                       |
| ------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| 共享选项      | `tsconfig.base.json`                                  | —                                                                                                            | —                                              |
| 新代码        | `next/tsconfig.json` → `next/theme`、`next/ui`        | `tsconfig.nsh.json`；`paths` / `files` 指向 **`next/demos/.nsh`**（它的 `tokens.d.ts` 由新主题生成）         | `nsh check next/demos` 为主；`vp check` 为辅   |
| 新演示        | `next/demos/tsconfig.json`                            | `./.nsh/tsconfig.json`；`@shadcn-nsh/theme` 指向 `../theme/index.ts`，`nsh.json` 的 `resolve.alias` 写同一条 | `nsh check next/demos`                         |
| 旧组件        | `tsconfig.nsh.json` → `packages/theme`、`packages/ui` | base + NSH JSX；`paths` / `files` 指向 gallery 的 `.nsh`                                                     | `nsh check apps/gallery`                       |
| NSH 应用      | `apps/gallery/tsconfig.json`                          | 仅 `./.nsh/tsconfig.json`；自带 `paths` 时须手写回填 `nsh` / `nsh/*` / `*`（TS 不合并 extends 的 paths）     | `nsh check apps/gallery`                       |
| Docs（Astro） | `apps/docs/tsconfig.json`                             | `astro/tsconfigs/strict` + `contentMappers`                                                                  | `astro sync && tsc --noEmit --runExternalCode` |
| 工具链        | `packages/cli`、`scripts/port`、根 `tsconfig.json`    | base；加 `types: ["bun"]`（CLI 另有 `node`）                                                                 | `vp check`                                     |

`Tokens` 类型（`token("…")` 接受哪些名字）由每个 NSH 应用按自己的 `theme.json` 生成到 `.nsh/types/nsh/tokens.d.ts`。新旧主题的 token 不同，所以新代码必须用 `next/demos/.nsh` 这个 types host，不能用 gallery 的。types host 不存在时先跑一次 `nsh check next/demos`。

每个演示文件是一个独立入口；`nsh check` 和 `nsh test` 还需要目录里有 `App.tsx`。带 `nsh.json` `resolve.alias` 的入口必须和 `nsh.json` 在同一目录，放进子目录后别名不生效（所以参照页是 `<id>.ref.tsx`，不是 `ref/<id>.tsx`）。

TypeScript 为 **7.1**（Astro content mapper 所需）。它不提供 JS 解析 API，`scripts/port` 用 `oxc-parser` 解析上游文件。

## 检查的组成

| 命令                   | 范围                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `bun run port:check`   | 清单完整；`// @port` 区域与上游一致（重新生成、格式化后与现有文件相同）；CLI 不落后于基线        |
| `bun run port:render`  | `next/demos/render.test.tsx`，在无头 Chrome / Edge / Chromium 里运行；截图在 `next/demos/shots/` |
| `nsh check next/demos` | 新代码的类型                                                                                     |
| `vp check`             | 全仓格式、lint、工具面类型                                                                       |
| `bun run check`        | 旧实现的全套：`vp check --fix`（会改文件）→ gallery → 旧 demos → docs → `check:recipes`          |

切换完成后，`bun run check` 改为包含 `port:check`，`check:recipes` 删除。
