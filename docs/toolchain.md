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
5. `bun run port:vendor`，再跑 `nsh check apps/docs/demos`、`bun run port:render`。
6. 提交子模块指针、`port-map.json` 和被改写的区域，三者同一个 commit。

当前状态（2026-11-11）：CLI 与基线均为 `30f87b7c`（由 `install.sh --source` 装到 main；发布的 nightly 频道当时仍停在 `c5214aa`）。外壳使用 `focusVisibleStyle`；`port:check` 在 CLI 落后于基线时报错。

发布的 nightly 追上 main 之后，可改回 `nsh update nightly`。`scripts/nsh-bootstrap.sh` 的注释仍写着"用 store release"，待删改；它的行为（生成 types host、检查 `Button` 与 `Accordion` 存在）不受影响。

## TypeScript 分层

| 面            | 路径                            | extends                                                                                                 | 类型权威                                       |
| ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 共享选项      | `tsconfig.base.json`            | —                                                                                                       | —                                              |
| 组件 + 主题   | `tsconfig.nsh.json`             | base + NSH JSX；`paths` → `packages/theme`、`packages/ui`；`files` 可用 gallery 或 demos 的 tokens host | `vp check`、单文件抽查                         |
| 验收演示      | `apps/docs/demos/tsconfig.json` | `./.nsh/tsconfig.json`；`@shadcn-nsh/theme` → `packages/theme`；`@` → 仓库根                            | **`nsh check apps/docs/demos`**（主）          |
| Gallery 测试  | `apps/gallery/tsconfig.json`    | 仅 `./.nsh/tsconfig.json`；须手写回填 `nsh` / `nsh/*` paths                                             | `nsh check apps/gallery`                       |
| Docs（Astro） | `apps/docs/tsconfig.json`       | `astro/tsconfigs/strict` + `contentMappers`                                                             | `astro sync && tsc --noEmit --runExternalCode` |
| 工具链        | `packages/cli`、`scripts/port`  | base；加 `types: ["bun"]`（CLI 另有 `node`）                                                            | `vp check`                                     |

`Tokens` 类型（`token("…")` 接受哪些名字）由每个 NSH 应用按自己的 `theme.json` 生成到 `.nsh/types/nsh/tokens.d.ts`。移植主题与旧 neutral 主题的 token 不同；**docs 演示**用 `apps/docs/demos/.nsh`（绑定 `packages/theme/theme.json`），**gallery** 用 `apps/gallery/.nsh`。types host 不存在时先跑一次对应的 `nsh check`。

每个演示文件是一个独立入口；`nsh check` 和 `nsh test` 还需要目录里有 `App.tsx`。带 `nsh.json` `resolve.alias` 的入口必须和 `nsh.json` 在同一目录，放进子目录后别名不生效（所以参照页是 `<id>.ref.tsx`，不是 `ref/<id>.tsx`）。

TypeScript 为 **7.1**（Astro content mapper 所需）。它不提供 JS 解析 API，`scripts/port` 用 `oxc-parser` 解析上游文件。

## 检查的组成

| 命令                        | 范围                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `bun run port:check`        | 清单完整；`// @port` 区域与上游一致；CLI 不落后于基线                               |
| `bun run port:render`       | `apps/docs/demos/render.test.tsx`：指针，亮 / 暗；截图在 `apps/docs/demos/shots/`   |
| `bun run port:render:touch` | `apps/docs/demos/render-touch.test.tsx`：iOS 模拟器上的触屏，亮 / 暗；同一 `shots/` |
| `nsh check apps/docs/demos` | 移植 UI + 演示的类型                                                                |
| `nsh check apps/gallery`    | Gallery 行为夹具与冒烟页                                                            |
| `vp check`                  | 全仓格式、lint、工具面类型                                                          |
| `bun run check`             | `vp check --fix` → `port:check` → demos → gallery → docs（见根 `package.json`）     |
| `bun run registry:build`    | 根据 `registry.json` 生成 `public/r`                                                |

### 渲染比对的两半

`port:render` 用无头浏览器（Chrome / Edge / Chromium），它始终只量到精细指针：在 `--target web` 上强制不了触屏，所以这一半只跑指针。触屏那一半 `port:render:touch` 用 `nsh test render-touch.test.tsx --target ios`，在 iOS 模拟器上打开同一批演示与参照页（`open(…, { platform: "ios" })`），亮 / 暗各一组，截图落在同一个 `shots/`。

两份测试共用的用例表、截图比较和 **200 ms 的定身等待**在 `apps/docs/demos/render-cases.ts`：手动时钟把两页的入场过渡（弹层 150 ms、颜色 160 ms）走完再截图，避免一页停在过渡中途而另一页已经落定。这是确定性的等待，不是失败重试。

iOS 那一半需要 Xcode 的 iPhone 模拟器，以及 `~/.nsh/runtime/ios/iphonesimulator/nsh-ios-host`。源码安装的 CLI 的 runtime 树可能没有它，从 `nsh` 的 checkout 构建：

```sh
cd <nsh checkout>   # 即 `nsh --version` 的提交
cargo build -p nsh-ios-host --target aarch64-apple-ios-sim --release
mkdir -p ~/.nsh/runtime/ios/iphonesimulator
cp target/aarch64-apple-ios-sim/release/nsh-ios-host ~/.nsh/runtime/ios/iphonesimulator/
```

没有模拟器或 host 时脚本报出缺的那一项并以非零退出；`port:render` 不受影响。
