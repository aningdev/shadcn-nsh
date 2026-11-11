# AGENTS.md

本仓库把 NSH 官方示例共享的 UI 层 `references/nsh/examples/nsh-gallery-ui`（下称**上游**）整理成 shadcn 模式的组件库：一个组件一个文件，经 registry 和 CLI 复制进应用（Copy-into-app），复制后归应用所有。

三方各管一件事，互不交叉：

| 权威                  | 管什么                                                              |
| --------------------- | ------------------------------------------------------------------- |
| 上游 `nsh-gallery-ui` | 主题、外观、状态、几何、variant 的集合与取值                        |
| shadcn                | 分发方式、目录、一组件一文件、组合角色（`Trigger` / `Content` / …） |
| `nsh/base`            | 行为与无障碍                                                        |

这是**打包**项目：上游已有的一律由脚本搬运（`bun run port:vendor`），位于 `// @port <上游文件>` 与 `// @port end` 之间，不手改、不换色、不改名。本仓只写组件外壳、registry / CLI 和文档站。上游每个声明的去向记在 [`port-map.json`](port-map.json)。

**写或改任何组件、主题、演示之前，读 [`docs/port-plan.md`](docs/port-plan.md)**：规范（第 4 节）、每个组件的流程（第 5 节）、检查（第 6 节）、工作包与顺序（第 7 节）。词汇见 [`GLOSSARY.md`](GLOSSARY.md)。

**不做**：改 `nsh` / `nsh/base`；改 `// @port` 区域内的文字；在外壳里写颜色或自定外观；搬上游的声音和 NSH 网站的 demo 适配；为旧 registry id 提供别名。

## 过渡期：两套代码并存

| 目录                                                           | 状态                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `next/`（`theme`、`ui`、`demos`、`docs`、`registry.json`）     | **新代码，所有移植工作在这里做**                                                             |
| `packages/theme`、`packages/ui`、`apps/docs/demos`、`public/r` | 旧实现（neutral 配色、R1–R8 配方）。只读：不再按旧规范修改，等全部家族完成后由"切换"一次替换 |
| `packages/cli`、`apps/docs` 的站点外壳、`apps/gallery` 的测试  | 保留并继续使用                                                                               |

`packages/ui/README*`、`packages/theme/README*`、`apps/docs/AGENTS.md`、`apps/gallery/AGENTS.md` 描述的是旧实现，与本文件冲突时以本文件和 `docs/port-plan.md` 为准。

## References

只读参考，默认不在 submodule 内改代码或向上游提 PR（除非用户明确要求）。

| 路径                                           | 用途                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| [`references/nsh`](references/nsh)             | 上游：`examples/nsh-gallery-ui`（搬运来源）；`nsh` / `nsh/base`；文档 |
| [`references/shadcn-ui`](references/shadcn-ui) | 体系模式：registry、文档站、CLI、copy-into-app                        |

克隆后若目录为空：`git submodule update --init --recursive`。

**上游基线跟 CLI 走。** `references/nsh` 固定的提交必须等于 `nsh --version` 显示的提交，`port-map.json` 的 `commit` 与它相同。升级步骤见 [`docs/toolchain.md`](docs/toolchain.md)。

## 何时读参考

- **某个控件长什么样、有哪些状态** — 上游的 `look/*` 与 `README.md`；它在 NSH 网站上的用法见 `references/nsh/website/demos/el-<id>.tsx`。
- **控件行为、parts、平台差异** — `references/nsh` 与 [nsh.dev/llms.txt](https://nsh.dev/llms.txt)。
- **Registry / CLI / 文档页的组织** — `references/shadcn-ui`：先 `CONTRIBUTING.md`，再 `apps/v4/registry`；本仓实现见 `packages/cli`。

## 分层

```
上游 nsh-gallery-ui（固定提交）
   │  port:vendor
   ▼
theme            theme.json + finishes.json + theme.ts
ui/lib           没有所属控件的共享部分（press、overlay、surface…）
ui/<id>.tsx      一个组件 = 上游 look（// @port 区域）+ 外壳（手写）
demos、docs      演示与文档页
   │
   ▼
registry.json → public/r → shadcn-nsh add
```

依赖向下：本库 → `nsh/base` → `nsh`。主题真源是 `theme.json` 与 `finishes.json`，都原样取自上游。

## 工作约定

- 新组件用脚手架起步（建成后；见 `docs/port-plan.md` WP-0），不从空文件或旧组件复制。
- 一个家族一个 commit；提交前 `port:check`、`nsh check next/demos`、`port:render`、`vp check` 全部通过，四张截图人眼看过。
- `// @port` 区域只由 `port:vendor` 写入。要偏离上游，在 `port-map.json` 的 `replace` 里登记并写 `why`。
- 切换完成之前，不运行 `registry:build` 去覆盖 `public/r`（它仍对应旧实现）。

## 工具链

Bun 管理依赖与脚本；格式化 / lint / 工具面类型经 [Vite+](https://viteplus.dev)（`vp fmt` / `vp lint` / `vp check`），配置集中在根 `vite.config.ts`，不用 Prettier。

NSH CLI 用 **nightly**，以上游 `main` 为准开发。TypeScript 分层、types host、CLI 与上游基线的对齐见 [`docs/toolchain.md`](docs/toolchain.md)。

## 常用命令

```sh
bun run port:new <id> --from <上游> …  # 脚手架：路由、外壳、演示、文档、registry
bun run port:vendor            # 按 port-map.json 从上游填充区域与复制文件
bun run port:check             # 清单完整、区域与上游一致、CLI 不落后于基线（--status 列出待办）
bun run port:render            # 渲染比对：组件与"look 展开在 nsh/base 上"截图相同
nsh check next/demos           # 新代码的类型检查
nsh run next/demos/button.tsx  # 运行一个演示

bun run nsh:bootstrap          # 生成各 .nsh types host
bun run check                  # 旧实现的全套检查（会改文件）
```

其余脚本见根 `package.json`；`init` / `add` 用法见 [`README.md`](README.md)。
