# 项目规划：`nsh-gallery-ui` 的规范化、可分发版本

状态：你已确认。**P0 完成**（现有改动已拆成三个提交；`AGENTS.md`、`GLOSSARY.md`、`NOTICE`、ui README 的"来源与同步"、README 矛盾已修）。**试点 S、P1、家族 2、家族 3 已完成**（neutral 经你确认可用；截图流程见 ui README“视觉核对”）。`check:recipes` 已完成。**家族 4–8 已完成**，27 个组件全部按参考 look 迁移，白名单已删除（M4）。下一步：触屏与动效的真机核对，再决定 P3。规则与决策记录在 [`packages/ui/README.zh.md`](../packages/ui/README.zh.md) 和 [`packages/theme/README.zh.md`](../packages/theme/README.zh.md)；本文只讲**做什么、按什么顺序、怎么验收**。

## 1. 目标

把 NSH 仓库里的 [`examples/nsh-gallery-ui`](../references/nsh/examples/nsh-gallery-ui)（参考实现，上游自述为"内部 UI 层，不作为应用 API 发布"）做成**规范化、可复制进应用（copy-into-app）、可由 CLI 分发**的组件库。

| 要保留的（来自参考实现）                                             | 要改变的                                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 每个控件的状态设计：hover、pressed、selected、focus、disabled 的层次 | 视觉语言：**用 shadcn neutral**，不用它的 graphite + citrus 品牌                                                    |
| 触屏 / 指针两套密度，触屏补点击区到 44pt                             | 形态：公开 API 是 **Composition Facade**（`Trigger` / `Content` / `Item`），家族名与 registry id 跟 `nsh/base` 符号 |
| 几何用算术保证（开关旋钮行程等）并有测试                             | 去掉内部耦合：`Live<>` 选项管线、网站 playground 适配、终端形态、声音                                               |
| 守门测试：look 里不许出现颜色字面量                                  | 分发：registry → `public/r` → `shadcn-nsh add`；应用拥有复制后的代码                                                |
| 动效来自 `nsh` 文档的值，按压下沉、减少动效时去掉位移                | 工程化：配方、六类产物、测试、文档页                                                                                |

**非目标：** 修改 `nsh` / `nsh/base`；把参考实现的品牌色搬过来；为旧的 shadcn 形 registry id 提供别名；自动跟踪上游。

## 2. 已定决策（摘要）

| 决策                | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 视觉语言            | shadcn neutral（31 个官方颜色 + `radius`，全 oklch）。参考实现用到的其他角色（inset、raised、field、line、track、knob、状态色等）**先在 neutral 里找映射**（代码里用官方 `colors.*` 加 `alpha()`），找不到才新增 `custom-*` 键。`custom-*` 只能写 oklch 字面量，不写 `var()`，所以契约测试不用放宽；新增必须在同一提交里有消费者。**风险**：neutral 亮色下 `background` 与 `card` 同为 `oklch(1 0 0)`，`muted` / `secondary` / `accent` 也相同，只有 0.97、0.922 两档灰，层次只能靠阴影，所以视觉要先做试点（§5） |
| 主题边界            | 颜色、半径、阴影（颜色 token + 形状函数）、焦点环、disabled 外观。动效值与尺寸不进 `theme.json`；多个组件共用的行为抽成 `lib` 模块（`press`、`density`），符合 R1。这**修订**了 README 里"没有共享动效 helper"的说法，P0 同步改写                                                                                                                                                                                                                                                                                 |
| 结构                | 参考实现的 `look/*.ts` 对应我们组件文件里的 `look()` + `xVariants()`（Leaf 配方），**不新增 look 层、不新增 registry 条目**                                                                                                                                                                                                                                                                                                                                                                                       |
| 同步                | 按家族一次性移植；每个文件头记录来源路径和**基线提交** `64ab8a1d`（`references/nsh` 子模块固定的提交，可复现；`examples/nsh-gallery-ui` 目录最后一次改动是 `d96fc35c`，2026-11-09，一并记录）；不做自动同步                                                                                                                                                                                                                                                                                                       |
| 与 store CLI 的差距 | 本仓库按 store `nsh 0.4.0 (e626a8d)` 开发，而参考实现跟随 main，它的 look 可能用到 0.4.0 没有的 base 属性或部件。每个家族移植时对照 `.nsh/types` 做类型检查，缺失的能力写进该组件的 Differences，**不硬移植**                                                                                                                                                                                                                                                                                                     |
| 范围外              | 终端形态、声音、网站 playground 适配、`Live<>` 管线                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 许可                | 参考实现是 Apache-2.0（Longbridge），本仓库是 MIT；移植文件保留归属声明，仓库根加 `NOTICE`                                                                                                                                                                                                                                                                                                                                                                                                                        |

## 3. 现状

| 已有                                                 | 说明                                                                                                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 27 个组件、registry、CLI、`public/r`                 | 视觉值是我们早期自拟的，不是参考实现的                                                                                                         |
| 配方与组件包规范（R1–R8、Leaf / Family、文件内顺序） | 已写进 README，**尚无脚本强制**                                                                                                                |
| 已按 Family 配方迁移                                 | `popover`、`tooltip`、`menu`、`context-menu`                                                                                                   |
| 试点                                                 | `button`：R3 与主题持有的外观已完成；`look()` 合并、`min*` 几何未做                                                                            |
| 主题                                                 | `theme.json`（官方键齐全 + 3 个 `custom-*`）、`finish` 角色、`focusRing`、`disabledOpacity`                                                    |
| 测试                                                 | `test:unit`（8 个：CLI 导入改写、合并、主题契约）、`test:gallery`（18 个行为测试）                                                             |
| 缺口                                                 | 无视觉验证；gallery 应用只有一个 `App.tsx`，没有逐家族的演示页；`check:recipes` 与白名单未实现；触屏密度未做；无已提交的基线（现有改动未提交） |

## 4. 目标架构

```
nsh/base                 行为与无障碍（不改）
   ↑
packages/theme           theme.json（neutral + custom-*）、finish、focusRing、disabledOpacity
   ↑
packages/ui/lib          共享行为：press、density、open-state（R1：多个文件必须一致才抽）
   ↑
packages/ui/<id>.tsx     每个组件：look() + xVariants() + Composition Facade
   ↑
registry.json → public/r → shadcn-nsh add
```

每个组件文件头：

```ts
// Source: examples/nsh-gallery-ui/look/<file> @ 64ab8a1d (baseline; dir last changed d96fc35c, 2026-11-09)
// Normalized for copy-into-app. Apache-2.0, © Longbridge; see NOTICE.
```

## 5. 阶段

### P0 对齐（小，先做）

| 项                         | 内容                                                                                                                                                                                                                                                                                                                                                        | 退出标准                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `AGENTS.md`、`GLOSSARY.md` | 删除"不把 Gallery 演示样式当成可发布 API"，改为"本库是 gallery-ui 的规范化版本"；表格里 gallery-ui 一行的"勿当契约"改为"来源"                                                                                                                                                                                                                               | 文字与本文一致                       |
| `NOTICE`                   | 记录 Apache-2.0 归属与上游提交号                                                                                                                                                                                                                                                                                                                            | 文件存在，README 链接它              |
| ui README                  | 新增"来源与同步"一节：来源路径、上游提交号、同步策略                                                                                                                                                                                                                                                                                                        | 一节说清楚                           |
| 本文件                     | 作为路线图提交                                                                                                                                                                                                                                                                                                                                              | 你确认                               |
| 修正 README 之间的矛盾     | ① ui README "组件内的动效"与 theme README 里的"没有共享动效 helper"改为"`press` / `density` 是 `lib` 模块，其余动效仍在组件内"，两份决策记录各加一条理由（R1：参考实现里它们被多个 look 共用）；② 守门测试与 `check:recipes` 共用**一份**白名单 `scripts/recipes-allowlist.json`，不再各写一套；③ 守门测试明确放行 `"transparent"`（R5 允许它作布局字面量） | 三处文字一致                         |
| 提交现有改动               | 现有 50 多个文件的改动（主题回退、CLI 合并、契约测试、README）先提交，P0 的改动才好审                                                                                                                                                                                                                                                                       | 你决定一个还是拆开，**我不自行提交** |

### 试点 S：先看视觉（P0 之后、P1 之前）

neutral 的层次有限，所以不先做基础设施，先用 **button + switch** 两个控件，按 neutral 映射直接移植（颜色全走 `colors.*` 与 `finish`，不新增 token），亮暗各截一张，和参考实现的同一控件并排看。

| 项   | 内容                                                                                                                                            | 退出标准                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 移植 | `button` 与 `switch` 的状态、几何、按压；开关旋钮行程用算术并加测试                                                                             | `bun run check`、`test:unit`、`test:gallery` 全绿 |
| 截图 | `nsh test <entry> --target macos` 配合 `app.screenshot`，亮 / 暗各一张；需要屏幕录制与辅助功能权限，顺便验证这条流程在这台机器上能跑通          | 截图产出，流程写进 ui README                      |
| 结论 | 你判断 neutral 能否撑住层次。**能**：进入 P1；**不能**：回到映射表，决定新增哪些 `custom-*`（inset、raised、field 等）或调整 finish，再重做试点 | 你确认                                            |

### P1 地基（试点通过之后）

| 项                                       | 状态                    | 说明                                                                                                                                                                                            |
| ---------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 守门测试                                 | **完成**                | `packages/cli/src/ui-guards.test.ts`：组件和 `theme.ts` 里不许有颜色字面量；红绿都验证过；白名单是 `scripts/recipes-allowlist.json`（现为空，只减不增）。检查结果：现有组件本来就没有颜色字面量 |
| gallery 演示                             | **完成**                | `apps/gallery/demo-kit.tsx`（`Page`、`Panel`、`Row`、`Flow`），试点页已改用它；每个家族一页，随家族建                                                                                           |
| 视觉验证流程                             | **完成**                | `bun run shots <entry> <out-dir> [name]`；试点已跑通                                                                                                                                            |
| `lib/press`、`lib/density`、`lib/follow` | **完成**（家族 2 抽出） | 第二个消费者出现时才抽（R1）：`follow` 给 switch、checkbox、radio；`press` 给 button、toggle；`density` 给 button、switch、toggle、checkbox、radio                                              |
| `theme` 补充                             | 无                      | 试点只新增了 `mix()` 与两个读取器，没有新的 `custom-*` 键；之后按映射表在有消费者时加                                                                                                           |

#### 参考实现的角色 → neutral 映射（P1 起草，逐家族补全）

| 参考实现角色                                   | neutral 来源（优先级自上而下）                                  |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `surface`                                      | `card`                                                          |
| `inset`（凹陷）                                | `muted`                                                         |
| `raised`（凸起）                               | `card` + `finish.control.rest`                                  |
| `field` / `fieldBorder`                        | `background` / `input`                                          |
| `line`（发丝线）                               | `border`                                                        |
| `faint`                                        | `muted-foreground` 加 `alpha()`                                 |
| `accent` / `onAccent`                          | `primary` / `primary-foreground`                                |
| `track` / `knob`                               | `muted` / `background`；不够再新增 `custom-*`                   |
| 状态色 `info` / `warn` / `up` / `down` 及 tint | 无 neutral 对应；**第一个消费者出现时**新增 `custom-*`（oklch） |
| `radius-card` / `radius-control`               | 派生自 `radius`（`radius-sm/md/lg` 的 shadcn 做法）；不够再新增 |

### P2 按家族移植

进入家族 3 之前先完成 `check:recipes`：合并三项 grep、doc comment、文档章节、演示和测试是否存在，白名单是同一份 `scripts/recipes-allowlist.json`，只减不增，接入 `bun run check`。

每个家族一个提交，走统一循环（见 §6）。顺序按依赖和体量：

| 序  | 家族                             | 我们的组件                                                    | 参考 look                                                   | 体量 | 备注                                                         |
| --- | -------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- | ---- | ------------------------------------------------------------ |
| 1   | 按钮（试点 S 已做部分在此补全）  | `button`                                                      | `look/button.ts`（含 icon / round / split）                 | M    | 先用它验证"移植 + 规范化"的真实成本；split 按钮放在后续      |
| 2   | 切换与选择（**已完成**）         | `toggle`、`toggle-group`、`switch`、`checkbox`、`radio-group` | `tool.ts`、`switch.ts` + `switch-geometry.ts`、`choice.tsx` | M    | 开关旋钮行程用算术测试                                       |
| 3   | 字段（**已完成**）               | `input`、`number-input`、`otp-input`                          | `field.tsx`                                                 | M    | 焦点边、无效、只读、禁用的优先级                             |
| 4   | 列表选择（**已完成**）           | `select`、`combobox`                                          | `listbox.tsx`（565 行，最大）                               | L    | 触屏下是 sheet                                               |
| 5   | 菜单（**已完成**）               | `menu`、`context-menu`                                        | `menu.tsx`                                                  | M    | 参考 look 已移植                                             |
| 6   | 浮层（**已完成**）               | `tooltip`、`popover`、`dialog`、`sheet`、`toast`              | `overlay.ts`                                                | L    | 已加 `modalSurface()`；Dialog / Sheet Root 属性在 Content 上 |
| 7   | 导航与披露（**已完成**，本分支） | `tabs`、`accordion`、`collapsible`、`link`、`pagination`      | `tabs.tsx`、`disclosure.tsx`、`nav.tsx`                     | M    | 不新增 token；禁用一律 0.5                                   |
| 8   | 度量与其他（**已完成**）         | `progress`、`slider`、`avatar`、`table`                       | `meter.ts`、`slider.ts`、`avatar.ts`、`data-table.ts`       | M    | `progress` 的不确定态循环用 `ignoreReduceMotion`             |
| 9   | 日期（**已完成**）               | `calendar`、`date-picker`、`time-field`                       | `listbox.tsx` 的日历半段、`field.tsx` 的 `timeFieldClass`   | M    | 不新增 token；弹层复用 listbox；`ColorPicker` 仍未做         |

### P3 扩展（Registry 完整性）

`Command`、`Tree`、`DataTable`（`data-table`）、`Scrollbar`（`scrollbar`）、`Calendar`、`DatePicker` 与 `TimeField` 已进入 registry（store `nsh` 0.4.0 有导出）。仍未做：`ColorPicker`（有导出，尚未包装）、`EmojiPicker`（store 0.4.0 无导出）、`ScrollArea`（无 base 导出，滚动条用 `Scrollbar`）、`Segmented`（无 base 导出，见 Extensions）、拆分按钮。准入仍是 store CLI 上存在对应 `nsh/base` 导出。

## 6. 每个家族的完成循环

1. 在 gallery 增加该家族演示页，并先写测试看它失败（Leaf：reactive；Family：行为）。
2. 从参考实现读取对应 look，**只取状态设计和几何**，颜色换成 neutral 映射，去掉外部耦合；文件头写来源。用 store 版本的 `.nsh/types` 做类型检查，参考实现里 0.4.0 没有的 base 能力不硬移植，写进 Differences。
3. 按配方和文件内顺序写 `look()` + `xVariants()` + 外观；共享行为用 `lib` 模块。
4. 守门测试变绿，白名单里删掉该组件。
5. 文档页（固定章节）、`index.ts`、`registry.json`、`bun run registry:build`，`public/r` 同提交。
6. 亮 / 暗截图各一张，对照参考实现的同一控件，存入 PR 描述（不入库）。
7. `bun run check`、`test:unit`、`test:gallery` 全绿。
8. commit message 写明使哪些规则达标，以及参考实现的来源文件和提交号。

## 7. 风险

| 风险                                                                                                                                     | 缓解                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| neutral 层次不足（亮色下 `background` = `card`，`muted` = `secondary` = `accent`），而参考实现的层次靠自有的 inset / raised / field 色阶 | **试点 S 在 P1 之前**，用 button 与 switch 看亮暗截图；不行就回到映射表，决定新增哪些 `custom-*` |
| 参考实现跟 main，store CLI 是 0.4.0，API 可能有差距                                                                                      | 每个家族用 store 版 `.nsh/types` 类型检查，缺失能力写 Differences                                |
| 上游持续演进，移植版会过时                                                                                                               | 文件头记录来源提交；ui README 记录"基线提交"；落后时按家族对照，不承诺自动同步                   |
| Apache-2.0 归属遗漏                                                                                                                      | `NOTICE`、文件头、README 三处；P0 退出标准包含这一项                                             |
| 工作量大（参考实现 look 约 3000 行，我们组件约 5300 行）                                                                                 | 严格按家族切分；每个家族独立可发布，不做大爆炸合并                                               |
| 视觉验证依赖本机权限，无法进 CI                                                                                                          | 当前只做人工截图；CI 保持行为测试和守门测试                                                      |
| 规则多于脚本                                                                                                                             | P1 的 `check:recipes` 优先于 P2；规则没有脚本强制之前不新增                                      |
| 已复制过组件的应用，升级时可能与新 token 不一致                                                                                          | `add --overwrite` 加上 `theme.json` 的"缺则补"合并；破坏性变更写进 Differences                   |

## 8. 里程碑

| 里程碑 | 内容     | 判定                                                     |
| ------ | -------- | -------------------------------------------------------- |
| M0     | P0 完成  | 文档、许可、README 矛盾已修，现有改动已按你的决定提交    |
| M1     | 试点 S   | 你在亮暗截图上确认 neutral 能撑住层次，截图流程跑通      |
| M2     | P1       | 守门测试、`lib/density`、`lib/press`、gallery 演示页就位 |
| M3     | 家族 1–5 | 按钮、选择、字段、列表、菜单；`check:recipes` 已接入     |
| M4     | 家族 6–8 | 27 个组件全部迁移，白名单清空并删除                      |
| M5     | P3       | 按需                                                     |

## 9. 开放问题

- 现有未提交改动怎么提交：合成一个，还是按"文档与 ADR 合并 / 主题回退 / CLI 合并与测试"拆开。

- 触屏尺寸取"指针 +8（32→40）"还是仅靠 `hitSlop`：建议 +8，需在 iOS / Android 实机上看一眼。
- 状态色（`up` / `down` / `warn` / `info`）的 neutral 色值如何定义：等第一个消费者出现再设计。
- `radius` 是否拆分为 sm / md / lg：等有第二个圆角需求的组件出现。
- 视觉验证能否自动化（截图比对）：先人工，积累样本后再评估。
