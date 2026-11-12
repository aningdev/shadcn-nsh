# 工具链与 TypeScript 分层

改 tsconfig、types host、类型检查链路，或升级 NSH CLI 时读这里。

## NSH CLI 与上游基线

本仓用**在基线提交上构建**的 CLI，不跟随 store 发布。

**基线是一个提交**（`port-map.json` 的 `upstream.commit`）。三处必须等于它，缺一不可：

| 哪里   | 怎么读                                              |
| ------ | --------------------------------------------------- |
| CLI    | `nsh --version` 括号里的哈希：`nsh 0.5.0 (30f87b7)` |
| 清单   | `port-map.json` 的 `upstream.commit`（40 位）       |
| 子模块 | `git -C references/nsh rev-parse HEAD`              |

`bash scripts/nsh-version.sh` 检查后两处；`nsh:bootstrap` 与 CI 的 `setup-nsh` 直接调用它，`port:bump` 用同一条解析读 CLI 的提交。方向决定修法：CLI 早于基线，就装一个在基线上的 CLI（基线不后退）；CLI 晚于基线，就 `bun run port:bump` 把基线前移到它。`bun run port:check` 在 CLI 落后于基线时报错。

**为什么不要 release**：上游的 look 用的是它自己那个提交运行时的能力；CLI 早于基线时，搬入的代码可能类型通过而表现不同，或者用到 CLI 还没有的属性（外壳用的 `focusVisibleStyle` 就是这样）。基线与发布标签无关：`30f87b7` 是 `nightly-158-g30f87b7c`，既不是 release，也可能超前最新 nightly。

### 装一个在基线上的 CLI

| 途径                                                         | 结果                                                                                                                                                                                                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bun run nsh:build`                                          | 从 `references/nsh` 的固定提交构建 CLI 与两个 web 运行时（`scripts/nsh-build.sh`），装到 `~/.nsh-sync`。需要 Rust、`rustup target add wasm32-unknown-unknown`、能编译 wasm32 的 clang 与 `llvm-ar`（Debian / Ubuntu：`clang llvm libclang-dev`） |
| `curl -fsSL https://nsh.dev/install.sh \| sh -s -- --source` | 构建 main 的顶端。只有 main 的顶端恰是基线时才对；release 构建较慢（需 Rust）                                                                                                                                                                    |
| 同上，`--nightly`                                            | 发布的最新 nightly。常落后于 main，落后时 `port:check` 报错                                                                                                                                                                                      |

`install.sh` 装不了任意提交（只有 release、最新 nightly、main 的顶端三条路），所以"精确到基线"要么用 `nsh:build`，要么在任意 NSH checkout 里 `cargo build --release --locked -p nsh-cli`。

### `NSH_RUNTIME`

`nsh package --target web`（`bun run docs:demos`）与 `nsh test --target web`（`bun run port:render`）需要一棵运行时目录：

```text
<runtime>/web/nsh-browser.wasm   package 从它链接应用
<runtime>/web/nsh-dev.wasm       test 的开发宿主
<runtime>/web/nsh.js, browser/   DOM 运行时
<runtime>/web/nsh-syntaxes.bin   编辑器高亮用的语法表
```

CLI 先找 `bin/../runtime/web`（发行包布局），再看 `NSH_RUNTIME` 下的 `web/`。源码构建的 CLI 两处都没有时，会就地编译 wasm（慢，且要上面的 C 工具）。`bash scripts/nsh-bootstrap.sh` 检查 CLI 与子模块都在基线、打印该 export 什么，然后生成 `apps/gallery` 与 `apps/docs/demos` 的 `.nsh` types host。

### CI

| 文件                                | 做什么                                                                                                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/actions/setup-nsh`         | 按 `port-map.json` 的提交构建 CLI 与两个 web 运行时（`scripts/nsh-build.sh`），按提交缓存，放进 PATH、设 `NSH_RUNTIME`；`nsh --version` 的提交与基线不同就失败。只在 Linux 上跑（两个工作流都是 `ubuntu-latest`），且 Bun 要先装好 |
| `.github/workflows/check.yml`       | 每个 PR：`port:check`、两个 `nsh check`、`test:unit`、`check:docs`、`port:render`。渲染比对要 Chrome（runner 自带）；截图留作 artifact                                                                                             |
| `.github/workflows/deploy-docs.yml` | 同一个 action，然后 `bun run build:docs`（`docs:demos` 逐个打包演示，再 Astro 构建）                                                                                                                                               |

缓存的 key 含提交与 `scripts/nsh-build.sh` 的哈希：新的基线第一次跑要冷构建（CLI 加两个 wasm），之后直接恢复；改了构建脚本也会重来。

## 上游同步

上游一周内就能加完一整个目录（`look/` 就是这样来的），所以基线**不自动跟随**，前移是显式操作。

### `bun run port:bump [<提交>]`

省略提交时用 `nsh --version` 打印的那个：先升 CLI，再把基线移到它（顺序见上一节）。按顺序做：

1. fetch，把 `references/nsh` checkout 到该提交（子模块有本地改动时拒绝）；
2. 把 `port-map.json` 的 `upstream.commit` 改成它（只替换那一个哈希，不动文件格式）；
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

看到漂移后的顺序：装一个在新提交上的 CLI → `bun run port:bump <提交>` → 按它列的变化补清单 → `bun run port:render`，四张截图人眼看 → 子模块指针、清单、区域一个 commit。PR 上的 `check` 工作流会再验一遍。

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
