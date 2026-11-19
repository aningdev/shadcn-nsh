# 参与贡献

谢谢你看这个库。欢迎的事：**本库还没有的组件**（上游有）、某个控件外观或行为的修正、文档与演示的改进、报告 bug。

先花十分钟读这几份，改动才不会撞上既有规则：

- [`AGENTS.md`](AGENTS.md) —— 各方的角色、能做什么、不能做什么。
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) —— 目录、分层、规则 P1–P6、归属。
- [`docs/port.md`](docs/port.md) —— 加一个组件要走的路：外壳怎么写、`// @port` 区域怎么标、怎么检查。
- [`docs/GLOSSARY.md`](docs/GLOSSARY.md) —— token / finish / alias 这些词在库里指什么。

## 环境

需要 [Bun](https://bun.sh) 与 NSH CLI。NSH CLI 只用于类型检查与运行演示，**不编译 NSH**。

```sh
git submodule update --init --recursive   # references/ 是只读参考
bun install
bun run nsh:bootstrap                     # 校验 CLI 与 references/nsh 在基线，生成各 .nsh 的类型
```

`bun run nsh:bootstrap` 会打印安装命令；CLI 的版本跟 `port-map.json` 的 `upstream.cli` 与 `upstream.commit` 走。细节见 [`docs/toolchain.md`](docs/toolchain.md)。

## 常用命令

| 命令                                      | 做什么                                                |
| ----------------------------------------- | ----------------------------------------------------- |
| `bun run dev:docs`                        | 文档站（含组件演示）                                  |
| `bun run dev:gallery`                     | gallery：原生行为测试的页面                           |
| `nsh run apps/website/demos/button.tsx`   | 跑单个演示                                            |
| `bun run port:new <id> --from <上游文件>` | 新组件脚手架（路由、外壳、演示、文档、registry）      |
| `bun run port:new <id> --base <符号>`     | 不来自上游的自有组件（不写路由、不 vendor）           |
| `bun run port:new <id> --view`            | 只排版上色的自有组件（画在 `View` / `Text` 上）       |
| `bun run port:vendor <id>`                | 从上游抽取初稿（只在新增时用，不覆盖已有代码）        |
| `bun run port:check`                      | 上游变化提醒、清单完整、CLI 不落后于基线              |
| `bun run port:review`                     | 审阅完上游的变化后记下来                              |
| `bun run port:render`                     | 渲染比对：组件与"look 展开在 `nsh/base` 上"的截图相同 |
| `bun run registry:build`                  | 由 `registry.json` 重建 `public/r`                    |
| `bun run registry:serve`                  | 本地起一个 registry，试装用                           |

## 分支与 PR

`main` 受保护：不直接推，每个改动都是一个 PR，`check` 通过后 **squash 合并**，`main` 上一个 PR 一个提交，分支合并后自动删除。

- **先有 issue**：bug 与新组件先开 issue，PR 正文写 `Closes #N`。错字、文档小修可以直接开 PR。三个模板：**Bug report**（受影响的组件、现象、最小复现、版本）、**Feature request**（想要什么、为什么、参照）、**Task**（维护者或代理在动手前写的计划：问题与证据、改什么、完成标准、不做什么与破坏性变更）。
- **分支名** `<type>/<短描述>`，type 与提交信息的相同：`fix/field-label-wrap`、`feat/combobox-chips`、`docs/install-tabs`。
- **一个 PR 一件事**：一个组件家族、一个 bug。不相关的改动分开提，review 和回滚都按 PR 来。
- **PR 标题就是合并后的提交信息**，照下面「提交信息」的格式写；分支里的提交怎么写都行，合并时会压成一个。
- **CHANGELOG**：用的人能感知到的改动，在 `CHANGELOG.md` 的 `## Unreleased` 下加一条（Added / Changed / Fixed），写在同一个 PR 里。只改内部工具、CI、测试的不用写。根目录 `.gitattributes` 给它设了 `merge=union`：本地 rebase 时两边的条目都保留，不再起冲突（GitHub 网页上的 "Update branch" 不用它，请在本地 rebase）；顺序发版时再理。
- **发版**也是一个 PR（`chore(release): vX.Y.Z`），合并后打标签，见 [`docs/release.md`](docs/release.md)。

## 提 PR 前

一条命令覆盖大部分：**`bun run check`**（会 `vp check --fix` 改格式，所以先提交或先看 diff）。它跑

```text
vp check --fix                    格式化、lint、工具面的类型
bun run catalog --check           演示、参照页、文档页、导出是否一致
bun run check:theme               主题数据是否符合 docs/specs/theme-roles.md
bun run registry:build --check    public/r 是否与 registry.json 同步
bun run port:check                上游变化与清单完整性
bun run port:coverage             每个组件有没有演示、文档页、参照
nsh check apps/website/demos      演示与 UI 的类型
nsh check apps/gallery            gallery 的类型
bun run check:pages               文档站的页面与链接
bun run check:docs                文档站自身
```

按改动涉及的东西再补：

- **改组件或演示** → `bun run port:render`，四张截图人眼看过。
- **改行为** → `bun run test:gallery`（原生行为测试）。
- **改 registry 条目或 CLI** → `bun run test:install`（在真实 NSH 应用里 `init` / `add`，逐条目）。
- **改过 `registry.json` 或组件文件** → `bun run registry:build`，把 `public/r` 的改动一起提交；`check` 里的 `registry:build --check` 会拦下没重建的提交。

## 提交信息

英文、约定式：`type(scope): summary`。类型用 `feat`、`fix`、`docs`、`chore`、`refactor`、`test`；scope 是组件 id、区域或 `cli`：

```text
fix(menu): keep the sub menu inside the window
feat(terminal): draw the program's output on the theme's well
docs(readme): point the registry URL at the released tag
```

PR 标题用这个格式，它就是 squash 之后 `main` 上的提交信息；正文说**为什么**改、改之前是什么样。PR 模板分四段：改了什么与为什么、破坏性变更（旧 → 新的 diff，没有就删）、截图（亮 / 暗，前 / 后，看不见的改动就删）、怎么确认的（跑过的命令与结果，上面哪些检查没跑及原因）。

## 加一个组件

1. `bun run port:new <id> --from <上游文件>` 生成骨架（外壳、演示、文档页、registry 条目、路由）。
2. `bun run port:vendor <id>` 把上游的那段抽进 `// @port <上游文件>` 与 `// @port end` 之间；**这两个标记之间归本库**，可以直接改。
3. 颜色只来自主题（`theme.json` 的 token 与 `finishes.json` 的 finish），组件文件里不写颜色字面量；外观上的决定写进对应文档。
4. 补演示（手机与桌面两种画布）与文档页；`bun run catalog --check` 会查它们与导出是否齐全。
5. `bun run registry:build`，然后按上一节跑检查。

维护者发版的步骤见 [`docs/release.md`](docs/release.md)。
