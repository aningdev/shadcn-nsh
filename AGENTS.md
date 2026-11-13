# AGENTS.md

本仓库把 NSH 官方示例共享的 UI 层 `references/nsh/examples/nsh-gallery-ui`（下称**上游**）整理成 shadcn 模式的组件库：一个组件一个文件，经 registry 和 CLI 复制进应用（Copy-into-app），复制后归应用所有。

三方各管一件事，互不交叉：

| 权威                  | 管什么                                                              |
| --------------------- | ------------------------------------------------------------------- |
| 上游 `nsh-gallery-ui` | 主题、外观、状态、几何、variant 的集合与取值                        |
| shadcn                | 分发方式、目录、一组件一文件、组合角色（`Trigger` / `Content` / …） |
| `nsh/base`            | 行为与无障碍                                                        |

这是**打包**项目：上游已有的一律由脚本搬运（`bun run port:vendor`），位于 `// @port <上游文件>` 与 `// @port end` 之间，不手改、不换色、不改名。本仓只写组件外壳、registry / CLI 和文档站。上游每个声明的去向记在 [`port-map.json`](port-map.json)。

**写或改任何组件、主题、演示之前，读 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**（目录、分层、规则 P1–P7、归属）**和 [`docs/port.md`](docs/port.md)**（每个组件的流程、外壳写法、检查）。词汇见 [`docs/GLOSSARY.md`](docs/GLOSSARY.md)。

**不做**：改 `nsh` / `nsh/base`；改 `// @port` 区域内的文字；在外壳里写颜色或自定外观；搬上游的声音；把上游的 demo 适配层（`Stage` / `Split` / `Inspector` / `Panel` / `Log` / `Segmented`）放进组件库或 registry（它只在 `apps/docs/demos` 里，供演示用）；为旧 registry id 提供别名。

## 目录

| 路径                                  | 内容                                                             |
| ------------------------------------- | ---------------------------------------------------------------- |
| `packages/theme`                      | `theme.json`、`finishes.json`、`theme.ts`（上游主题 + 角色读取） |
| `packages/ui`                         | 移植组件（`// @port` 区域 + 外壳）                               |
| `apps/docs/demos`                     | 验收演示、演示适配层 `stage.tsx`、渲染比对、`port:render`        |
| `apps/docs/src/pages/docs/components` | 组件文档页                                                       |
| `registry.json` → `public/r`          | shadcn registry 产物                                             |
| `apps/gallery`                        | 原生行为测试与冒烟页                                             |
| `packages/cli`                        | `shadcn-nsh` CLI                                                 |

`port-map.json` 的 `root` 为仓库根；目标路径写全（如 `packages/ui/button.tsx`）。

## References

只读参考，默认不在 submodule 内改代码或向上游提 PR（除非用户明确要求）。

| 路径                                           | 用途                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| [`references/nsh`](references/nsh)             | 上游：`examples/nsh-gallery-ui`（搬运来源）；`nsh` / `nsh/base`；文档 |
| [`references/shadcn-ui`](references/shadcn-ui) | 体系模式：registry、文档站、CLI、copy-into-app                        |

克隆后若目录为空：`git submodule update --init --recursive`。

**上游基线跟安装的 CLI 走。** 基线是安装的 CLI 打印的提交（`nsh --version`）：`references/nsh` 固定在那里，`port-map.json` 的 `upstream.commit` 与它相同，`upstream.cli` 记下装的是哪个版本（release tag，如 `v0.5.0`；或 `nightly`）。**不编译 NSH**，也不设 `NSH_RUNTIME`。装法：`curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=<upstream.cli> sh`（`nightly` 时用 `sh -s -- --nightly`）；`bun run nsh:bootstrap` 会打印这条命令。换版本后 `bun run port:bump`。步骤见 [`docs/toolchain.md`](docs/toolchain.md)。

## 何时读参考

- **某个控件长什么样、有哪些状态** — 上游的 `look/*` 与 `README.md`；它在 NSH 网站上的用法见 `references/nsh/website/demos/el-<id>.tsx`。
- **控件行为、parts、平台差异** — `references/nsh` 与 [nsh.dev/llms.txt](https://nsh.dev/llms.txt)。
- **Registry / CLI / 文档页的组织** — `references/shadcn-ui`：先 `CONTRIBUTING.md`，再 `apps/v4/registry`；本仓实现见 `packages/cli`。

## 分层

```
上游 nsh-gallery-ui（固定提交）
   │  port:vendor
   ▼
packages/theme   theme.json + finishes.json + theme.ts
packages/ui/lib  没有所属控件的共享部分（press、overlay、surface…）
packages/ui/<id>.tsx  一个组件 = 上游 look（// @port 区域）+ 外壳（手写）
apps/docs/demos、docs  演示与文档页
   │
   ▼
registry.json → public/r → shadcn-nsh add
```

依赖向下：本库 → `nsh/base` → `nsh`。主题真源是 `theme.json` 与 `finishes.json`，都原样取自上游。

## 工作约定

- 新组件用脚手架（`bun run port:new`）起步，不从空文件或旧组件复制。
- 一个家族一个 commit；提交前 `port:check`、`nsh check apps/docs/demos`、`port:render`、`vp check` 全部通过，四张截图人眼看过。
- `// @port` 区域只由 `port:vendor` 写入。要偏离上游，在 `port-map.json` 的 `replace` 里登记并写 `why`。
- 改 `registry.json` 或组件文件后运行 `bun run registry:build` 更新 `public/r`。

## 工具链

Bun 管理依赖与脚本；格式化 / lint / 工具面类型经 [Vite+](https://viteplus.dev)（`vp fmt` / `vp lint` / `vp check`），配置集中在根 `vite.config.ts`，不用 Prettier。

NSH CLI **只安装、从不编译**：装 `port-map.json` 的 `upstream.cli`（不早于上游基线的 release，或 nightly），版本前进后用 `bun run port:bump` 把基线移过去。TypeScript 分层、types host、CLI 与上游基线的对齐见 [`docs/toolchain.md`](docs/toolchain.md)。

## 常用命令

```sh
bun run port:new <id> --from <上游> …  # 脚手架：路由、外壳、演示、文档、registry
bun run port:vendor            # 按 port-map.json 从上游填充区域与复制文件
bun run port:check             # 清单完整、区域与上游一致、CLI 不落后于基线（--status 列出待办）
bun run catalog --check        # 组件集合一致（演示、参照页、文档页、导出），catalog.generated.ts 最新
bun run port:render            # 渲染比对：组件与"look 展开在 nsh/base 上"截图相同
nsh check apps/docs/demos      # 演示与 UI 的类型检查
nsh run apps/docs/demos/button.tsx  # 运行一个演示

bun run nsh:bootstrap          # 校验安装的 CLI 在基线，生成各 .nsh types host
bun run check                  # port:check + demos/gallery 类型 + docs（会改文件）
bun run test:gallery           # 原生行为测试
bun run test:install           # 复制即用：真实 NSH app 里 init / add / nsh check（逐条目）
```

其余脚本见根 `package.json`；`init` / `add` 用法见 [`README.md`](README.md)。
