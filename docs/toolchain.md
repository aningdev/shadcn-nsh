# 工具链与 TypeScript 分层

改 tsconfig、types host、类型检查链路，或升级 NSH CLI 时读这里。

## NSH CLI 与上游基线

本仓**安装** NSH CLI，从不编译 NSH。本地和 CI 是同一条命令：

```sh
curl -fsSL https://nsh.dev/install.sh | sh -s -- --nightly
export PATH="$HOME/.local/bin:$PATH"
```

`--nightly` 把上游 `main` 的最新 nightly 装进 `~/.nsh`（CLI 与运行时同在一棵目录里，`nsh` 自己找得到），并链到 `~/.local/bin/nsh`。

**基线是一个提交**：装到的 nightly 打印的那个。三处必须等于它，缺一不可：

| 哪里       | 怎么读                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------- |
| CLI        | `nsh --version` 括号里的哈希：`nsh 0.5.0 (f4d68f7)`                                          |
| 清单       | `port-map.json` 的 `upstream.commit`（40 位）                                                |
| 安装的 CLI | `port-map.json` 的 `upstream.cli`：构建出该提交的 release tag（当前 `v0.5.0`），或 `nightly` |
| 子模块     | `git -C references/nsh rev-parse HEAD`                                                       |

**nightly 动了，项目跟着动**：`bun run port:bump`（不带参数时用它打印的提交）移动清单与子模块，再 `port:vendor`，一个 commit。`bun run port:check` 在两者不同时只发 warning（新旧方向一样），提示的正是它；`bash scripts/nsh-bootstrap.sh` 在同一情况下停下，给出同样的提示。

**为什么不装更旧的**：上游的 look 用的是它自己那个提交运行时的能力；CLI 早于基线时，搬入的代码可能类型通过而表现不同，或者用到 CLI 还没有的属性（外壳用的 `focusVisibleStyle` 就是这样）。所以基线与 CLI 都不后退。

`install.sh` 装不了任意提交：`--nightly` 是 nightly 频道，`NSH_VERSION=vX.Y.Z` 是一个 release。nightly 落后于基线时（发布还没跟上 `main`），装一个不早于基线的 release —— 仍是安装，不是编译：

```sh
curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=v0.5.0 sh
```

### 运行时

发行包只带本机平台的运行时。`nsh package --target web`（`bun run docs:demos`）与 `nsh test --target web`（`bun run port:render`）需要的 web 运行时由 CLI 自己装（等价于 `nsh component add web`），触屏那一半要 `nsh component add ios`；`nsh component list` 列出装了什么。

**项目不再用 `NSH_RUNTIME`**：脚本不设它；自己导出仍会被尊重。

`bash scripts/nsh-bootstrap.sh` 检查 CLI 与子模块都在基线，然后生成 `apps/gallery` 与 `apps/docs/demos` 的 `.nsh` types host。

### CI

| 文件                                | 做什么                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/actions/setup-nsh`         | 用 `install.sh` 装 `port-map.json` 的 `upstream.cli`（release 按 tag 缓存，`nightly` 按 UTC 日期缓存）；仓库变量 `NSH_CHANNEL` 可覆盖；装上的提交与基线不同只发 `::warning::` |
| `.github/workflows/check.yml`       | 每个 PR：`port:check`、两个 `nsh check`、`test:unit`、`check:docs`、`port:render`。渲染比对要 Chrome（runner 自带）；截图留作 artifact                                        |
| `.github/workflows/deploy-docs.yml` | 同一个 action，然后 `bun run build:docs`（`docs:demos` 逐个打包演示，再 Astro 构建）。它不读 `references/nsh`，所以不取子模块                                                 |

缓存的 key 是 `nsh-<channel>-<os>-<UTC 日期>`：nightly 每天重建，于是每天第一次下载，当天其余运行直接恢复。

### 决定

- 2026-11-12：项目安装 NSH nightly，从不编译 NSH（用户决定）。

## 上游同步

上游一周内就能加完一整个目录（`look/` 就是这样来的），所以基线**不自动跟随 `main`**：它跟安装的 nightly 走，移动是显式操作。

### `bun run port:bump [<提交>]`

省略提交时用 `nsh --version` 打印的那个：先装 nightly，再把基线移到它（顺序见上一节）。按顺序做：

1. fetch，把 `references/nsh` checkout 到该提交（子模块有本地改动时拒绝）；
2. 把 `port-map.json` 的 `upstream.commit` 改成它（只替换那一个哈希，不动文件格式）； 装的是 release 时，`upstream.cli` 一并改成它的 tag；
3. 按清单的说法报变化，每条都给出目标文件：
   - 上游**新增**的声明 —— 没有路由就是清单的缺口；
   - 上游**删掉**的声明 —— 清单还路由着它，要先清掉；
   - **文字改动**的声明 —— `port:vendor` 会重填它所在的区域；
   - 被 `replace` 覆盖的声明在上游也变了 —— 要人看一眼替换是否仍然成立（`port:check` 看不到这一类）；
   - `copy` 的文件变了 —— `port:vendor` 整份重拷；
   - 新增 / 删除的上游文件；
4. `bun run port:check`；清单完整时 `bun run port:vendor`，再 `port:check`，最后 `nsh check apps/docs/demos`。

清单不完整时它在 `port:check` 之后停下，列出要补的路由，不 vendor、不提交。即使全部通过也不提交：子模块指针、`port-map.json` 与重新填充的区域是同一个 commit。早于基线的提交也能跑（回退），但清单通常要多改。

### 漂移报告

`.github/workflows/upstream-drift.yml` 每周一比较上游 `main` 与基线，把 `examples/nsh-gallery-ui` 里变动的文件列成一个 issue（标题固定，就地更新；基线追上后自动评论并关闭）。它只读仓库、不 push，权限只有 issue 的写。

看到漂移后的顺序：装一个 `nsh --version` 不早于该提交的 CLI（nightly 到了就用 `--nightly`，否则一个 release）→ `bun run port:bump <提交>` → 按它列的变化补清单 → `bun run port:render`，四张截图人眼看 → 子模块指针、清单、区域一个 commit。PR 上的 `check` 工作流会再验一遍。

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
| `bun run port:check`        | 清单完整；`// @port` 区域与上游一致；安装的 CLI 与基线不同时只是 warning            |
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

iOS 那一半需要 Xcode 的 iPhone 模拟器，以及 iOS 运行时（`~/.nsh/runtime/ios/iphonesimulator/nsh-ios-host`）。运行时用 CLI 装，不编译：

```sh
nsh component add ios
```

没有模拟器或 host 时脚本报出缺的那一项并以非零退出；`port:render` 不受影响。
