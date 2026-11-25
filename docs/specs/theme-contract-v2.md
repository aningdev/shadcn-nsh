# 主题契约 v2：按层定角色，同类少值

- 日期：2026-11-22
- 状态：已实施（2026-11-23），第 9 节的 7 步都已落地
- 修订：2026-11-22 补入字体与分发产物（#259）；同日补入 D4–D7（指示器与描边进控件预设、描边两档、交互状态、阴影刻度）与其余风格组的去向；2026-11-24 字体族与字号退出主题（#385，决策 0009）
- 修订：2026-11-23 实施审计：`density.surface` 删掉，区块面的圆角读 `shape.container`；填充色按下变淡写成 `accent` 的 `pressed-opacity`，不进 `state`（D6）；`inverse` 的字色是 `{inverse-foreground}`；分段与胶囊标签页选中的那块读 `raised` 而不是 `knob`（`knob` 在暗色下是白色圆点，上面写不了字，第 5 节）；touch 档 `size.hit` 不小于 44，平台例外点名（第 3 节）
- 修订：2026-11-23（#293）控件形态改为按行为命名的维度，撤销 D4，第 4 节重写；新增第 11–19 节：取值的逐像素表、不在刻度上的数字、可选 finish 字段、官方枚举、按主题 id 的例外去向、分档继承、动效角色与 43 处硬编码时长
- 修订：2026-11-24（#363）`fill` 单独成层（跑起来的填充是另一个面）；`knobOn` 不是层，是 `knob` 的选中态，写成它的 `checked-*` 字段（状态不新立一个面）
- 修订：2026-11-23（#293 评审）按原则 6 降级 winui / material 里辨识度低、却要单占一个维度的还原（第 11.7 节）：维度定为六个，删 `mark`、`trigger`、`arrow`，`cells` 移进新维度 `group`；第 19 节的 5 个问题已确认
- 修订：2026-11-24（P5 数字收口）第 12 节逐条落地并记实测：分段轨道与日历格高的数字改读 `height.md`，开关改读 `icon.md`（钮，`circle` 形制），material / winui 的开关保留各自形制的官方配方，spinner 与抓杆记为组件常量。M1 第一版按“轨道高读 `height.md`”落地，指针档 44×28 超出“差 1–8 点”的预期，当天由 owner 改定为“钮 = `icon.md`、轨道 = 钮 + 4”；第 12 节 M1 的“差”列记的是改定后的实测
- 修订：2026-11-24（#366）契约冻结为 contract v3（第 20 节）：#340、#293 P6、#357、#358 落地即冻结，此后表达不了的外观降级并记进 `native-themes.md` 的差异表，不加键、不加层；`bun run theme:diff --gate` 守着
- 修订：2026-11-24（#336）material 的桌面档整体降一步：高度 `24 / 32 / 40`、图标 `12 / 16 / 20`（与 base 同档，`pointer.tokens.json` 不再声明 `dimension.icon`），开关按 M3 的比例缩到 `40×24`（`1/0`、`16 → 20 → 22`），`RecipeShape` 因此可以按档声明（见 [`0003`](../decisions/0003-material-desktop-tier.md)）
- 修订：2026-11-24（#358）`selection` 补一个 `plate`（轨道里的一块，角读 `shape.control`）：`pill` 回到它本来的意——轨道里的胶囊，`nsh-gallery` 取它，`shadcn` / `solid-glass` / `apple` 取 `plate` 保留 shadcn 的圆角列表与圆角触发项；两个取值都读 `finish.plate`，第 11.3 节拆成两行
- 修订：2026-11-24（#380）控件维度收成四个：删 `selection` 与 `group` 连同取值 `pill` `plate` `underline` `bar` `track` `capsule` `cells`（[决策 0008](../decisions/0008-drop-selection-group.md)）；标签页、分段控件与侧边栏各画一种形态（第 11.1 节的注）
- 取代：[`theme-roles.md`](theme-roles.md) 中与本文冲突的部分；每一步落地时，`theme-roles.md`、[`native-themes.md`](native-themes.md)、[`design-tokens.md`](design-tokens.md)、[`design-semantics.md`](design-semantics.md)、`docs/GLOSSARY.md`、`docs/ARCHITECTURE.md` 在同一个 PR 里改成新的事实
- 决定记录：[`docs/decisions/0001-theme-contract-v2.md`](../decisions/0001-theme-contract-v2.md)、[`docs/decisions/0004-theme-contract-freeze.md`](../decisions/0004-theme-contract-freeze.md)

## 目标

主题只回答"这一层、这种语义长什么样"，不回答"某个组件长什么样"。同一类值（圆角、高度、间距、图标、阴影、弹簧）在一个主题里只有一条短刻度，组件从刻度上取值。

衡量方式：

- 一个主题作者写一套新主题时，要填的键数和要做的选择都减少，而且每个键的名字都能从"层 + 语义"猜出来。
- 用这套主题渲染出的界面，同类东西的值是统一的。

## 现状（`main` 9daf2dcb）

| 类       | 现在                                                                                                                                                         | 问题                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 颜色     | `cssVars.light` 67 个角色（其中 A 层 31 个），另有 `cssVars.theme` 里 11 个颜色键                                                                            | `sidebar-*`、`dialog`、`code`、`scrollbar-thumb`、`window-*` 以组件命名；多个角色在 4–5 套主题里只是别的角色的 alias |
| 圆角     | 8 个（`radius`、`-card`、`-control`、`-field`、`-chip`、`-overlay`、`-dialog`、`-sheet`）                                                                    | 按组件族命名；`control` 同时表示"按钮是胶囊"和"页内元素的圆角"（#253）                                               |
| 高度     | nsh-gallery 指针档有 7 个：24/28/30/32/34/36/40                                                                                                              | 同类值太多                                                                                                           |
| 间距     | nsh-gallery 有 6/10/12/14                                                                                                                                    | 不在 4 的网格上                                                                                                      |
| 图标     | nsh-gallery 有 12/14/15/16                                                                                                                                   | 4 个值                                                                                                               |
| 字阶     | 7 级；nsh-gallery 的 `title` 13 小于 `label` 14；行高是比例小数                                                                                              | 层级倒挂；行高不在网格上                                                                                             |
| 弹簧     | 4 个：`press` 520/34 与 `move` 504/38 几乎相同                                                                                                               | 冗余                                                                                                                 |
| 控件几何 | `checkbox` / `switch` / `slider` / `radio` / `progress` / `spinner` / `tabs` / `calendar` 8 组，100 多个值；nsh-gallery、shadcn、solid-glass、apple 完全相同 | 是组件的事，却放在主题里；主题作者只能照抄                                                                           |
| finish   | 27 个，多数以组件命名（`knob`、`knobOn`、`handle`、`thumb`、`pill`、`chip`、`grabber`、`tooltip`、`groove`、`on`、`fill`）                                   | 按组件分                                                                                                             |
| 阴影     | nsh-gallery 28 条不同的 `shadow`，solid-glass 27 条                                                                                                          | 没有层级刻度                                                                                                         |
| 平涂渐变 | 每套主题有 13–17 处 `linear-gradient(x 0%, x 100%)`                                                                                                          | 为满足"字段必须有"而写的空值                                                                                         |
| 材质     | finish 里直接写平台对象（`material.apple` 等）；fallback 靠 `checkGlassFallback` 在 lint 时兜底（#251、#252）                                                | 每个主题自己拼平台参数，容易漏 fallback                                                                              |

## 原则

1. **按层与语义定角色，不按组件。** 角色名回答"哪一层、什么语义"（面、墨、边、状态、数据），不出现组件名。
2. **同类少值。** 同一类值在一个主题里是一条短刻度：界面的规律、韵律与统一，不会让同类东西出现很多值。新加一个值之前，先看这一类是否已有可用的档。
3. **按主题不同的选择，放在离它最近的地方。**
   - 面的差异放进该主题的 finish。
   - 控件形态的差异由按行为命名的维度回答（见第 4 节、第 11 节）。
   - 平台固定、不随主题变的身份色（macOS 红绿灯）属于组件。
4. **纯 alias 删除。** 一个角色在每套主题里都等于某个已有角色时，就删掉它，读它的组件改读那个角色。
5. **对外格式不动。** NSH 的 `Theme` 就是 shadcn 的 token（`references/nsh/crates/nsh-base/src/theme.rs`），这一层的槽名照旧全写，因为应用会经 `Theme::of` 或 `bg-sidebar` 这类类名读取它们。
6. **原生主题可以裁剪；契约冻结后只降级，不扩张。** 原生主题（apple、material、winui）照官方外观实现；某个控件的官方外观个性化太强、放进契约代价太大时，可以在实现上裁剪，并把裁剪写进该主题的文档（主题 README 与 [`native-themes.md`](native-themes.md) 的差异表），不为它新增层、角色或刻度档。契约在 #340、#293 P6、#357、#358 落地后冻结为 **contract v3**，此后这条从几何扩到整个契约（finish 的层与字段、颜色与圆角阴影角色、控件维度、动效）：表达不了的外观改值降级并记账，不加键、不加层、不在组件里写这套主题的分支（第 20 节，[决策 0004](../decisions/0004-theme-contract-freeze.md)）。`nsh-gallery` 是例外，契约要能完整表达它。

## 1 颜色角色

### A 层：NSH / shadcn 的 31 个槽，全部保留

`background`、`foreground`、`card`、`card-foreground`、`popover`、`popover-foreground`、`primary`、`primary-foreground`、`secondary`、`secondary-foreground`、`muted`、`muted-foreground`、`accent`、`accent-foreground`、`destructive`、`border`、`input`、`ring`、`chart-1`…`chart-5`，以及 `sidebar`、`sidebar-foreground`、`sidebar-primary`、`sidebar-primary-foreground`、`sidebar-accent`、`sidebar-accent-foreground`、`sidebar-border`、`sidebar-ring`。

- 缺一个槽，NSH 就会对这个槽退回 shadcn 的 neutral 灰（`theme.rs` 的 `DEFAULT_THEME`），所以 31 个槽都要写。
- `sidebar-*` 在 DTCG 源码里默认写成指向本层角色的 alias（例如 `sidebar` → `{color.background}` 或 `{color.card}`，由主题决定）；主题写自己的值时在 token 的 `$extensions` 里记出处（[决策 0012](../decisions/0012-derived-colours-are-defaults.md)），`nsh-gallery` 就照上游写了自己的值。
- 本库组件不读 `sidebar-*`：`Sidebar` 读层角色。这 8 个槽只为使用本库主题的应用代码保留。

### B 层：本库的角色（按层分组）

| 组       | 角色                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 面       | `inset`、`raised`、`field`、`track`、`knob`                                                                               |
| 墨       | `faint`、`brand`                                                                                                          |
| 边       | `line`、`brand-edge`                                                                                                      |
| 交互状态 | `hover`；`state.disabled` 与 `state.pressed` 的颜色字段（见第 3 批）                                                      |
| 数据     | `info`、`warn`、`up`，及其 `*-tint`（`brand-tint`、`info-tint`、`warn-tint`、`destructive-tint`、`up-tint`、`down-tint`） |
| 反色     | `inverse`、`inverse-foreground`、`inverse-brand`                                                                          |

### C 层：明暗共用

`scrim`、`media`、`on-media`，以及第 2 节的 3 个圆角。

### 删除与去向

**第 1 批：纯 alias（✅ #262）。** 已删除的七个角色，其读者改读 `accent-foreground`、`destructive`、`card` / `pressed` / `on` / `inverse` finish 的前景字段，以及控件预设的 `trackRole`；`sidebar-*` 保留为 A 层 alias，`down-tint` 与 tone `"down"` 不动。

验收：6 套主题、83 页、亮暗渲染与这一步之前**逐像素相同**。

**第 2 批：以组件命名的角色。** 会有可见变化，每一处都要配截图审阅。

| 角色                                                                                                                | 去向                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dialog`                                                                                                            | `modal` finish（material 用 `SurfaceContainerHigh`）                                                                                                                                                             |
| `code`                                                                                                              | `foreground`，或按语义改读 `brand` / `muted-foreground`                                                                                                                                                          |
| `scrollbar-thumb`、`scrollbar-thumb-hover`                                                                          | `muted-foreground` 加 `state` 透明度                                                                                                                                                                             |
| `chart-foreground`                                                                                                  | `foreground`（浅色图块）与 `on-media`（深色图块）                                                                                                                                                                |
| `brand-fill`、`on-brand`                                                                                            | `primary`、`primary-foreground`（在 5 套主题里本来就是 `var(--primary)`）                                                                                                                                        |
| `window-close`、`window-minimize`、`window-zoom`、`window-control-ink`、`window-control-edge`、`window-control-off` | 移进 `packages/ui/title-bar.tsx`：`#FF5F57` / `#FEBC2E` / `#28C840`，字 50% 黑，边 12% 黑，不可用时的底由已有角色推出。这是 P3（颜色只来自主题）的唯一例外，写进 `ARCHITECTURE.md`：**平台固定的身份色属于组件** |

**第 3 批：只在一两套主题里有意义的角色。**

| 角色                                                                  | 去向                                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `disabled`、`disabled-foreground`                                     | `state.disabled` 的颜色字段（material `OnSurface` 0.10 / 0.38，winui `*Disabled`）   |
| `accent-pressed`、`on-accent-pressed`、`state.accent-pressed-opacity` | `state.pressed` 的颜色字段，经 `pressed` finish 叠在 `accent` 上；透明度并入同一字段 |
| `bevel`、`accent-bevel`                                               | winui 的 `raised` / `accent` finish 的上下边字段                                     |

审完之后，B 层不再出现某个组件的名字。

## 2 圆角（#253，方案 B，数值已确认）

| 角色        | 覆盖                                     |
| ----------- | ---------------------------------------- |
| `control`   | 页内元素：按钮、字段、行、标签、井、色区 |
| `container` | 卡片、菜单、浮层、列表面板、toast        |
| `modal`     | 对话框、sheet                            |

| 主题                 | control | container | modal | 按钮胶囊 |
| -------------------- | ------- | --------- | ----- | -------- |
| nsh-gallery / shadcn | 8       | 12        | 14    | 否       |
| solid-glass          | 11      | 14        | 20    | 否       |
| apple                | 8       | 12        | 26    | 是       |
| material             | 4       | 12        | 28    | 是       |
| winui                | 4       | 8         | 8     | 否       |

- `shape.corners.button` 是一个圆角值：`full`（胶囊）或一个圆角（点数，或像 base 那样引用 `{dimension.radius.control}`）；除按钮类控件外没有元素读它。
- 嵌套元素的圆角按同心推出（内 = 外 − 内边距），不单独写 `inset` 圆角。
- 一个控件各角的圆角是槽（`field.corner.top` / `.bottom`、`choice.corner`）：M3 的下划线输入框只圆上角，靠 `field.corner.bottom: 0` 说出来，不靠形态名（第 11 节）。
- A 层的 `radius`（shadcn 的基准圆角，应用里的 `rounded-lg` 等由它推导）写成 `{radius-control}`。

## 3 尺度

| 类   | 契约                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 高度 | 一条刻度 `sm` / `md` / `lg`，分指针、触屏两档。行、标签栏、单行输入等都从这条刻度上取。只有平台官方确实有第 4 档时，才允许加 `xl`，并且要写出处（例如 M3 的 56 dp 输入框与列表行）                                                                                                                                                                                                                                                                                                                                                                                                         |
| 间距 | 4 的倍数：4 / 8 / 12 / 16 / 24 / 32。`density` 与 `control` 的内边距和间隙都取自这里。平台官方确实是非 4 倍数的值（例如 winui 的 6）才允许例外，并且要写出处                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 图标 | 3 档 `sm` / `md` / `lg`，分指针、触屏两档。勾、清除钮、控件内字形都从这 3 档里取                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 字阶 | 保留 7 级。字号**不降序**：`caption` ≤ `detail` ≤ `body` ≤ `label` ≤ `title` &lt; `headline` &lt; `display`。行高用整数 px，取 4 的倍数。**字号与行高是全主题共用的一把字阶（#385，[决策 0009](../decisions/0009-no-theme-type-scale.md)）**，主题只写 `fontWeight` 与 `letterSpacing`；各平台原来的字阶存档在 `native-themes.md` §3.6                                                                                                                                                                                                                                                     |
| 字体 | 主题不带字体族（#385）：没有 `font-sans` / `font-mono` token，没有 `font.family`。NSH 用应用的 `font-sans` 画所有没写字体的文字，等宽文字写通用族 `monospace`。7 个字阶复合 token 的 `fontFamily` 是 DTCG typography 类型的必填字段，一律写占位值 `system-ui`，没有组件读它                                                                                                                                                                                                                                                                                                                |
| 动效 | 3 个弹簧 `fast` / `default` / `slow`，按速度命名，不按组件命名。用途固定：控件状态（开关、勾选）用 `fast`，按压与移动用 `default`，落定与面板进出用 `slow`。winui 从官方时长里取 3 个。material 取三条空间弹簧：`FastSpatial` 800/ζ0.6 作 `fast`、`DefaultSpatial` 380/ζ0.8 作 `default`（也就是 `move` 原来的值）、`SlowSpatial` 200/ζ0.8 作 `slow`（`ExpressiveMotionTokens.kt`）。另加一条**状态过渡** `state`（`{ duration, timingFunction }`），给 CSS 过渡用（换色、透明度、边框、阴影）：三档弹簧只能驱动 `animate()`，而换色今天是 43 处硬编码时长，它们全部归 `state`（第 17 节） |
| 时长 | `duration.shake`（6 套主题都是 500）移进组件                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 描边 | 两档：`hairline`（分隔线、面的边）与 `control`（控件描边）。`surface` 在 5 套主题里等于 `hairline`，并入；material 的面"不画边"改由 finish 表达（`border-color: transparent` 或不写边），布局可能差 1px，要审截图。`indicator`（标签页、侧栏指示条的粗细）不再存在：#380 后标签页、分段控件与侧边栏各画一种形态，标签页的指示条是 `finish.plate` 的一块、侧边栏的轨线 2 点，都不读刻度（第 11.1 节）                                                                                                                                                                                       |
| 保留 | `shape.curve`（continuous / circular）、`size.hit`（平台最小点击区）、`dimension.focus`（焦点样式、宽度、偏移，属状态层）、`transition.enter`（一条进场过渡，归动效）照旧，各是一个值或一个枚举；新增 `size.target`（可点范围的外扩，今天只有 material 的指针档 40，出处 M3 的 40 dp state layer，第 12 节 M11）                                                                                                                                                                                                                                                                           |

验收：

- 每套主题的高度、间距、图标各自不超过 3 个值，例外都有出处。
- 反例：tabs 的水平内边距固定 8，不读 `size.control.padding`（读刻度会让 winui 从 8 变 6，标签挤在一起；#293 Q3）。
- `check:theme` 会拦下：不在刻度上的值、字号降序、行高不是整数。

## 4 控件形态：四个维度（#293 取代 `controls`）

- 主题里不再有 `controls: "base" | "material" | "winui"` 这种以主题命名的枚举。控件形态由四个**按行为命名**的维度回答，每套主题各给一个值：`field`、`choice`、`track`、`handle`。名字不说组件、更不说主题（第 11.2 节）。
- 读取只有一个入口（#404 起是 `slots()`，见第 11 节）：原先的 `control()` 四个键各一个 getter，与 `style()`、`motion` 同一套响应式代理，主题切换下一帧重画；`controls()` 与 `Controls` 类型在那之前就删了，没有 alias。
- 维度只回答“形态”；颜色仍来自第 1 节的角色，共同几何（高度、图标、圆点、内边距、间隙、描边、圆角）从第 3 节的刻度取。**取值的配方可以带该形态自己的官方数字**（M3 滑块 16 dp 轨道与 4×44 dp 手柄、WinUI 的 18 px 拇指）：那是那个形态的定义，不是一个跟随主题的新 token。
- 原来塞进“控件预设”的 D4 形态选择改由取值表达：`shape.corners.field` 归 `field`；`indicator.*` 与 `stroke.indicator` 不再存在（`selection` 在 #380 里删掉，标签页与侧边栏各画一种形态，第 11.1 节）。
- 每个控件实现这套值的一个**子集**，主题的值落在子集外时，那个控件取自己的兑底值（第 11.4 节），不留空、不留分支树。
- 主题作者从“选一档”变成“给每个槽填一个值”：任何主题都能写任何值，只有一套主题自己的数字不再存在。
- 一套主题的还原，辨识度低、却要单占一个槽或带来额外 API 的，按原则 6 降级到默认形态：日历、日期选择器、轮播不读槽。标签页、分段控件与侧边栏也不读槽：它们各画一种形态（第 11.4 节）。

验收：

- `packages/ui` 里没有 `Record<Controls>`、`controls()`、对主题名的比较（`terminal` 的字符网格分支不算，它不是主题值）。
- `semantics.json` 里既不出现 `controls`，也不出现 `indicator` / `shape.corners.field` / `stroke.indicator`；新出现一个 `dimension.control` 组（#404 之后改为 `slots`，见第 11 节）。
- 形态层面：全部 **0 差**逐像素相同（#404 的第 6 步复核过）。

## 5 finish：按层，加阴影刻度

| finish（层） | 并入的旧 finish                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `card`       | `card`、`section`                                                                                   |
| `inset`      | `inset`、`field`、`track`（开关、滑杆的槽）                                                         |
| `channel`    | `groove`（分段控件的通道；2026-11-24 自 `inset` 分出，见第 11.3 节）                                |
| `raised`     | `raised`、`light`、`chip`、`pill`                                                                   |
| `plate`      | `thumb`（井里被选中的那块，上面有字；2026-11-24 自 `raised` / `knob` 分出）                         |
| `overlay`    | `menu`（菜单、选择框、弹出面板）                                                                    |
| `modal`      | `dialog`                                                                                            |
| `inverse`    | `inverse`、`tooltip`                                                                                |
| `glass`      | `glass`                                                                                             |
| `accent`     | `accent`、`on`；`fill` 2026-11-24 自 `accent` 分出，见第 11.3 节                                    |
| `fill`       | `fill`（2026-11-24 自 `accent` 分出：一段跑起来的填充，见第 11.3 节）                               |
| `knob`       | `knob`、`knobOn`（选中态写成 `checked-*`，不另立一层）；`handle` 的差异进 `handle` 维度（第 11 节） |
| 状态         | `hover`、`pressed`（含 `accentPressed`）、`disabled`                                                |

`grabber` 不再是 finish；sheet 的抓杆是组件自己的一个 36×5 胶囊，每套主题相同（第 12 节 M10）。

- **阴影刻度（D7）。** 现在一串 `shadow` 里混着投影、内阴影与边光三样东西（nsh-gallery 有 29 种不同的串）。拆成三条刻度，finish 只引用、不手写：

  | 刻度             | 档位                                                      | 用途                                                                                 |
  | ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
  | 投影 `elevation` | `sm` / `md` / `lg` / `xl`，每种外观最多 4 个值，可共用    | `sm` 控件凸起与 knob，`md` 卡片，`lg` 浮层（菜单、提示、toast），`xl` 对话框与 sheet |
  | 内阴影 `inset`   | 每种外观 1 个值                                           | 井、轨道、按下                                                                       |
  | 边光 `edge`      | 每种外观最多 2 个：`surface`、`accent`；平面主题写 `null` | 斜面高光、内描边（nsh-gallery、solid-glass、apple 的 0.5px 描边）                    |

  官方对照：shadcn 为 `shadow-xs` / `-sm` / `-md` / `-lg`；M3 为 level 1 / 1 / 2 / 3；WinUI 3 为 depth 2 / 8 / 32 / 128（tooltip 的 depth 16 并入 32，按原则 6 记为差异）。

  位置：

  - 源码写在 DTCG 的 `light.tokens.json` / `dark.tokens.json` 的 `shadow` 组（DTCG 标准的 `shadow` 复合类型，支持 `inset` 与多层）。阴影随外观变化，颜色引用颜色角色，不写死 oklch。
  - 编译进 `semantics.json` 的 `elevation`（按 light / dark，与 finishes 并列），**不进 `theme.json`**：NSH 读 `theme.json` 时丢掉阴影（`theme.rs` 的测试断言 `shadow-sm` 读不到），运行时的 `token()` 读不到。
  - finish 的 `shadow` 写引用（如 `["{shadow.edge.surface}", "{shadow.sm}"]`），编译时拼成一串 CSS；组件读 finish 的方式不变。
  - `theme.ts` 加 `elevation(level)`，与 `shape`、`font` 并列；组件与应用要阴影时从这里取，不写字面量。
  - 导出的 `light.tokens.json` / `dark.tokens.json` 带上 `shadow` 组，设计工具可以导入为效果样式。

- **平涂。** `gradient` 可以写 `null`，删掉所有 `linear-gradient(x 0%, x 100%)`。有 `gradient` 字段的角色（`fill`、`knob`）平涂时写 `null`，不写空渐变。
- **字段随角色（#293 曾让可选字段变必填，P7 落地；#374 改回按角色）。** #293 之后每个 finish 都写满 16 个字段，不写的取中性值；#374 反向收紧：**只有六套主题里至少一套给出非中性值的字段才属于这个角色**——`material` 只在 `raised`、`overlay`、`inverse`、`glass`，`backdropFilter` 同上，`elevation` 只在 `card`、`plate`、`overlay`、`modal`、`inverse`、`glass`、`hover`、`pressed`，`border-top-color` 只在 `raised`、`hover`，`border-bottom-color` 只在 `raised`、`accent`、`hover`，`pressed-*` 只在 `accent`，`gradient` 只在 `fill`、`knob`，`checked-*` 只在 `knob`。逐角色的表和量出来的证据见 [`theme-roles.md`](theme-roles.md) §2 与 [`docs/decisions/0006-finish-fields-per-role.md`](../decisions/0006-finish-fields-per-role.md)；`packages/theme/finish-fields.ts` 的 `finishFields` 是唯一出处，`check:theme` 拿它与每套主题对齐，角色没有的字段读出来是类型错误。中性值仍写一次在 `tokens/base/style.shared.tokens.json` 的 `finish` 组，但只写在有这个字段的角色上；主题只在真正不同时写。`knob` 的 `checked-background` / `checked-border-color` / `checked-gradient` 依旧没有中性值：选中是旋钮的状态，不是另一个面——主题没写哪一项，选中时就沿用没选中时的值（`checked-gradient: "none"` 是明确的值：选中时平涂）。落地时两处与本文原写法不同，原因记在这里：
  - **两条边色取 `null`，不是 `transparent`。** NSH 里一条设了宽度、没设颜色的边取 `border-color`（`references/nsh/website/docs/styling.md`，"as CSS's currentColor"）；写 `transparent` 会把这层正画的边抹掉，截图逐像素比对下 4 套主题的卡片顶边消失（`card-winui-light.png` 一行 229 → 251）。`null` 的表达是“这条边没有自己的颜色”，与 `gradient` / 按下字段同一种写法。
  - **源码里写 `"none"`，编译成 `null`。** DTCG 2025.10 的 format schema 不接受 token 的 `$value: null`（`scripts/tokens/schema/format.json`），所以中性值以字符串 `"none"`（`elevation` 为 `null`）写在 finish 组的 `$extensions` 上，`scripts/tokens/compile.ts` 编译时换成 `null`；主题写了 token 就压过它。
  - 每套主题原先缺什么见第 13 节（历史）。

验收：

- 每套主题 finish ≤ 15 个；每种外观的阴影构件 ≤ 7 个（投影 4、内阴影 1、边光 2），finish 里没有手写的阴影串。
- 全库没有退化渐变。
- 有可见变化的页面，6 套主题的截图都已审阅。已知会变的：solid-glass 的 knob 阴影（0.3）与 raised（0.06）并到同一档；nsh-gallery 的卡片（0.04）与控件凸起（0.05）并到同一档。

## 6 材质

材质不是 CSS 模仿：NSH 没有 SVG 滤镜，`backdropFilter` 只支持模糊。材质也不写在组件里。

- finish 的 `material` 字段改成一个枚举 `"none" | "glass" | "acrylic"`。
- 配方集中写在 `packages/theme` 的一个文件（`materials`），由它展开成 NSH 的平台属性和 fallback。
- 组件不改：`platformMaterial()` 已经在 `lib/popup`、`toast`、`card`、`editor`、`carousel` 里展开。

| 配方      | 用在                                                                       | 展开                                                                                                                                                                                                                                                                                                             |
| --------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`    | nsh-gallery、shadcn、solid-glass、material 的所有层；apple、winui 的其余层 | 不展开                                                                                                                                                                                                                                                                                                           |
| `glass`   | apple 的 `overlay`、`inverse`、`raised`、`glass`                           | `glassEffect` regular + 层色作 tint（iOS / macOS 26+）；iOS 用 `ios.backdropMaterial`（26 以下的模糊）；fallback：`backdropFilter: blur(30px)`，层色不透明度不低于 0.72。不写 `macos.backdrop`：显式的它会盖过 26+ 的 `glassEffect`，26 以下由模糊回落兜住                                                       |
| `acrylic` | winui 的 `overlay`                                                         | `backdropFilter: blur(30px)`（`AcrylicBrush.h` `sc_blurRadius`）加层色。亮：`#FCFCFC` tint 0，luminosity 0.85；暗：`#2C2C2C` tint 0.15，luminosity 0.96（`AcrylicInAppFillColorDefaultBrush`，`AcrylicBrush_themeresources.xaml` @ `1b5b1a0`）。fallback：不透明的 `FallbackColor`（亮 `#F9F9F9`，暗 `#2C2C2C`） |

- 每个配方都给出 fallback：模糊半径，以及层色的最低不透明度。不画模糊的平台（Linux / GPUI）也不会透出背后的内容。这条取代 `checkGlassFallback`（#251）：fallback 由配方保证，不再靠 lint 兜底。
- 数值（例如 0.72）在实施时用平台截图核对；验收里那条逐字节相同，`material` 主题除外：它的 `material.android.elevation` 挪到新的 `elevation` 字段（`material` 里不再有平台对象），`platformMaterial()` 仍给出同一个 `android.elevation`，渲染不变，产物变了表示法。
- 不做，记为差异：
  - Acrylic 的噪点（`sc_noiseOpacity` 0.02）、luminosity 混合与饱和度 1.25；
  - Mica、macOS `behindWindow` 与侧栏 vibrancy，这些是窗口级的，属于应用；
  - CSS 折射。

验收：

- 主题源码里不再出现平台对象，只有枚举。
- apple 和 winui 的浮层在 macOS 26 以前与 Windows 上都有模糊，在 GPUI 上不透底。
- 其余 4 套主题的编译产物与这一步之前**逐字节相同**。

## 7 不做

- 不改 `nsh` / `nsh/base`。
- 不为删掉的角色、finish、圆角、刻度名留 alias 或兼容层（AGENTS.md：不为旧 id 提供别名）。
- 不改 A 层槽名。
- 应用里的 Tailwind `shadow-*` 类不跟主题：NSH 不读主题文件里的阴影，这些类用 Tailwind 的默认值。应用要跟随主题的阴影，用 `elevation()`。
- `state` 组（`press-scale`、M3 的 state layer `overlay`、`pressed-opacity`、`disabled`）保留在主题里（D6）：它作用于所有可按的东西，不只是控件，所以不进第 11 节的维度。
- 自定义主题的作者要按 `CHANGELOG.md` 里每一步的 breaking 条目迁移。

## 8 跨步骤的验收

- 每一步：`bun run check`、`port:render`、`port:render:theme`、`test:unit`、`test:gallery`、`test:install` 都通过。
- 标为"逐像素相同"的步骤，用 PNG 逐像素比对作证据；其他步骤，变化的截图在 6 套主题下都已审阅。
- 规则由 `check:theme` / `theme-lint` 执行，不靠文档约束。
- 分发产物跟着源码一起变：`packages/theme/themes/<id>/light.tokens.json` / `dark.tokens.json`（给 Figma、Tokens Studio 等设计工具；`init` 也把它们和 `DESIGN.md` 复制进应用）由 `tokens:build` 从 DTCG 源码生成，不手改，由 `tokens:build --check` 保证一致。它们是对外格式：每一步的 `CHANGELOG.md` breaking 条目要写出设计工具一侧的变化（删掉的变量、改名的组、不再导出的控件几何），`design-tokens.md` 里的数量与结构描述在同一个 PR 里改成新的事实。
- 每一步一起改的地方：读这些值的代码（`packages/ui`、`apps/website/demos`、`apps/showcase`、`apps/gallery`）；`DESIGN.md` 的生成器（`scripts/tokens/design-md.ts`）；宿主 `setThemeOverrides` 能覆写的键；文档站的 `theme.md`、`themes.mdx`、`customizing.md`；`packages/theme/README.md` 与 `README.zh.md`。

## 9 实施顺序

每步一个 issue、一个 PR，串行：

1. ✅ B2 合并（#256），作为基线
2. ✅ 控件预设（#268）（含 D4 的指示器、输入框圆角与指示条粗细），逐像素相同；输入框 #249 排在这一步之后。这一步后来被 #293 换成六个维度（第 4 节、第 11 节）
3. ✅ 圆角（第 2 节，#253，#269）
4. 颜色：第 1 批（逐像素相同，✅ #262）→ 第 2 批（✅ #263）→ 第 3 批（✅ #264）
5. ✅ 尺度（第 3 节），含字体（#265）
6. ✅ finish 按层与阴影刻度（第 5 节，#266）
7. ✅ 材质（第 6 节， #267）
8. #293 控件形态改为维度：八步见第 18 节，排在上面 7 步之后；D4 撤销（第 10 节）

## 10 已确认的问题

| #   | 问题                                                                                   | 建议                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `sidebar-*`：删掉，还是作为对外格式保留？                                              | ✅ 已确认（2026-11-22）：**保留为 A 层 alias，组件不读。** NSH 的 `Theme` 就是 shadcn 的 31 个槽，缺一个就退回 neutral 灰，应用里写的 `bg-sidebar` 会变色。这改了之前"第 2 批删掉其余 `sidebar-*`"的计划                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| D2  | 材质是写在 finish 的字段里，还是按层固定？                                             | ✅ 已确认（2026-11-22）：**写在 finish 的 `material` 字段里，用枚举（方案 A）。** apple 现在在 `raised` 上也用玻璃（#252），按层固定会丢掉这个选择                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| D3  | finish 数量                                                                            | ✅ 已确认（2026-11-22）：**9 层 + 3 种状态 = 12 个**，M3 中过于个性化的差异按原则 6 裁剪。（比之前说的"约 8 个"多了 `modal` 和 `inverse`）。M3 的对话框（`SurfaceContainerHigh`）与菜单（`SurfaceContainer`）颜色不同，提示与 toast 的反色面也是一层，和第 2 节圆角的 `modal` 对得上。**2026-11-24 加了两个**（#331 深色下选中的那块要比井亮、#337 分段控件的通道不是开关的槽）：`plate` 井里被选中的那块（上面有字，不能读 `knob`）、`channel` 一组选择所在的通道；现在是 11 层 + 3 种状态 = 14 个；**2026-11-24 又加了一个**（#357/#363 对齐上游 `finish.fill` 与 `finish.knobOn`）：`fill` 一段跑起来的填充（上游 `knobOn` 不是层，是 `knob` 的选中态，写在它的 `checked-*` 上）；现在是 12 层 + 3 种状态 = 15 个 |
| D4  | 以组件命名的形态选择（`indicator.*`、`shape.corners.field`、`stroke.indicator`）放哪？ | ~~✅ 已确认（2026-11-22）：并入控件预设（第 4 节）~~ **已推翻（2026-11-23，#293）**：控件预设仍然是组件在回答“这个控件长什么样”，只是把三档换成十四张表（与 #293 的 Problem 同罪）。改为六个按行为命名的维度：`indicator.*` 归 `selection`，`shape.corners.field` 归 `field`，`stroke.indicator` 随取值消失（第 4 节、第 11 节）                                                                                                                                                                                                                                                                                                                                                                                     |
| D5  | 描边 4 个值                                                                            | ✅ 已确认（2026-11-22）：**收成 `hairline`、`control` 两档**，`surface` 并入 `hairline`；`indicator` 这档随 #293 的 `selection`/`field` 取值消失（第 3、11 节）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| D6  | `state` 组                                                                             | ✅ 已确认（2026-11-22）：**保留在主题**，只把 `accent-pressed-opacity` 并入第 3 批的 `state.pressed`（第 7 节）。**第 3 批实际（#264）：** `state` 只读亮色指针档、不随外观翻转，而 winui 的禁用与按下颜色明暗不同，所以这些颜色落进 `finish.disabled` / `finish.accentPressed` 的 `background`、`foreground`；`accent-pressed-opacity` 合进 `accentPressed` 的底色。**第 6 步之后（2026-11-23）：** `accentPressed` 并进 `accent`，按下变淡成了 `accent` 的 `pressed-opacity`（数，Material / WinUI 写 1），换面的颜色是 `accent` 的 `pressed-background` / `pressed-foreground`。                                                                                                                                  |
| D7  | 阴影                                                                                   | ✅ 已确认（2026-11-22）：**拆成投影 4 档、内阴影 1 个、边光 2 个**；源码在亮暗 DTCG 文件，编译进 `semantics.json`，不进 `theme.json`（第 5 节）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## 11 控件外观：槽（#404，取代本节早先的四个维度与第 4 节的预设）

控件的外观是**值**，不是枚举：一套主题给每个槽填一个值，组件按槽画一种画法。[决策 0013](../decisions/0013-one-contract-value-slots.md) 说了为什么；槽的名单、单位与分组在 [`theme-slots.md`](theme-slots.md)。

### 11.1 来源、读取与校验

- 主题源码：`packages/theme/tokens/themes/<id>/theme.tokens.json` 的 `slot` 组，只写与本库默认不同的槽（今天 material、winui 与 apple 写）。
- 默认值：`packages/theme/tokens/base/slots.tokens.json`。这个文件是**生成物**——`scripts/theme/slots.ts` 的 `BASE_SLOTS` 是它的源（名单 `SLOTS`、类型与说明也在那里），`tokens:build` 写它、`tokens:build --check` 拦下手改。每套主题的 resolver 在 `style.shared.tokens.json` 之后读它。
- 编译产物：`semantics.json` 的 `slots`，扁平、点分键（`slider.mark.size`）；`theme.json` 不带（纯 CSS 侧不用）。
- 读取：`theme.ts` 的 `slots()`，响应式；组件一律经 `packages/ui/lib/look.ts`（`fieldLook`、`choiceLook`、`trackLook`、`sliderLook`、`switchLook`、`disabledLook`）取解好的部件，不自己拼字符串。每套主题都必须有全部槽，缺一个就抛错。
- 校验：`check:theme` 要求 6 套主题的 `slots` 键集与 `SLOTS` 完全一致（多一个、少一个都失败）；`tokens:build` 拦下 `SLOTS` 里没有的槽；同一个槽不能既是另一个槽的前缀（DTCG 的嵌套装不下 `field.corner` 与 `field.corner.top` 并存）。

### 11.2 一个值怎么写

槽值是作者写的一行字符串，编译成数、布尔或对象。写法是全库统一的：

| 写法                                  | 意思                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| `color:<role>[@alpha]`                | 颜色角色，可带不透明度（`color:foreground@0.2`）              |
| `tint:<role>[@alpha]`                 | tint 角色                                                     |
| `finish:<role>[:<field>]`             | finish 的一层，取它的哪个字段（`finish:disabled:foreground`） |
| `none`                                | 不画（边宽 0、点 0、光晕 0、底 `none`）                       |
| `keep`                                | 沿用控件自己的（只用于 `state.disabled.*`）                   |
| `shade:<role>`                        | 用 finish 的内阴影作底色阴影                                  |
| `control` / `container` / `full` / 数 | 圆角：控制圆角、容器圆角、胶囊、点                            |
| 数                                    | 点（宽度、直径、高度）；0 是"没有"，不是"最小"                |

尺寸槽可以按输入档给两个值（`pointer`、`touch`），面与边可以按外观给两个值（亮、暗）。第二个值写在同一个 token 的 `$extensions["dev.aning.shadcn-nsh"].touch` / `.dark` 里——一条槽一个 token，主题改一次就改到两个档，新主题也继承到两个档。布尔写成 `"yes"` / `"no"`（DTCG 没有布尔类型）。

### 11.3 每套主题今天填的值

`nsh-gallery`、`shadcn`、`solid-glass` 取同一套值（本库默认），material、winui 与 apple 各写自己的。前两套的值是 #404 之前枚举选出来的样子（第 2 步：值 = 今天的外观），出处随值进了 token 的说明；apple 的槽是 2026-11-25 的审计按 macOS 26 / iOS 26 的规范改的值（按钮按尺寸的圆角、选中与次要变体的面与墨、破坏性没有边与阴影、开关与滑块的椭圆钮、日历今天的墨、spinner 的 8 根辐条）。

| 槽                              | nsh-gallery、shadcn、solid-glass   | material                        | winui                  | apple                              |
| ------------------------------- | ---------------------------------- | ------------------------------- | ---------------------- | ---------------------------------- |
| `field.face` / `.shade`         | `field` / `inset`                  | 同左                            | 同左                   | 同左                               |
| `field.edge.sides` / `.width`   | 四边 / 1                           | 只下边 / 1                      | 四边 / 1               | 四边 / 1                           |
| `field.edge.colour` / `.bottom` | `input` / `input`                  | `—` / `mutedForeground`         | `border` / `input`     | `input` / `input`                  |
| `field.corner.top` / `.bottom`  | `control` / `control`              | `control` / 0                   | `control` / 0          | `control` / `control`              |
| `field.focus.line`              | `no`                               | `yes`                           | `yes`                  | `no`                               |
| `field.disabled.face`           | `keep`                             | `keep`                          | `finish:disabled`      | `keep`                             |
| `choice.size` / `.corner`       | 16·22 / 5·7                        | 20 / 2                          | 20 / 4                 | 16·22 / 4·7                        |
| `choice.face` / `.shade`        | `field`（暗 `input@0.3`）/ `inset` | `none` / `none`                 | `track` / `none`       | `card`（暗 `raised`）/ `none`      |
| `choice.edge.width` / `.colour` | 1 / `input`（暗 `foreground@0.2`） | 2 / `mutedForeground`           | 1 / `input`            | 1 / `input`（暗 `foreground@0.2`） |
| `choice.checked.face`           | `finish:accent`                    | `primary`                       | `finish:accent`        | `finish:accent`                    |
| `choice.mark`                   | 6·8，无 hover/按下                 | 6·8                             | 6·8，hover 14、按下 10 | 6·8，无 hover/按下                 |
| `choice.halo`                   | `none`                             | 32                              | `none`                 | `none`                             |
| `switch.width` / `.height`      | 36·44 / 20·24                      | 40·52 / 24·32                   | 40 / 20                | 54·63 / 24·28                      |
| `switch.knob` 关 / 开           | 16·20 / 16·20                      | 16 / 20·24                      | 12 / 12                | 31·37 × 20·24 / 同静止             |
| `switch.knob.hover` / 按下      | 同关 / 同关                        | 16 / 22·28                      | 14 / 17×14             | 同关 / 同关                        |
| `switch.edge` 关 / 开           | 1 / 1                              | 1·2 / 0                         | 1 / 0                  | 0 / 0                              |
| `switch.feedback`               | `none`                             | `expand`                        | `stretch`              | `none`                             |
| `slider.rail` / `.band`         | 6·8 / 20·32                        | 6·8 / 20·32                     | 4 / 32                 | 4·6 / 24·32                        |
| `slider.face` / `.shade` / 边   | `track` / `inset` / `border` 1     | `secondary` / `none` / 0        | `input` / `none` / 0   | `track` / `none` / 0               |
| `slider.knob` 宽 × 高 / 按下    | 14·20 × 14·20 / 14·32              | 同左                            | 18 × 18 / 18           | 20·37 × 16·24 / 同静止             |
| `slider.mark`（内点）           | 0（实心）                          | 0                               | 12，hover 14、按下 10  | 0（实心）                          |
| `slider.brightens`              | `yes`                              | `yes`                           | `no`                   | `yes`                              |
| `progress.height` / `.line`     | 6 / 0                              | 4 / 0                           | 3 / 1                  | 6 / 0                              |
| `progress.face` / `.shade` / 边 | `track` / `inset` / `border` 1     | `secondary` / `none` / 0        | `input` / `none` / 0   | `track` / `inset` / `border` 1     |
| `spinner.spokes` / `.opacity`   | `no` / 0.25                        | `no` / 0                        | `no` / 0               | `yes` / 0                          |
| `state.disabled.*`              | `keep`                             | `finish:disabled`（面、墨、边） | 同 material            | `keep`                             |
| `field.focus.width`             | 3                                  | 2                               | 2                      | 3（它的 3 px 焦点环宽）            |
| `choice.box`                    | 16·20（`icon.md` 的盒）            | 18                              | 16·20                  | 16·20                              |
| `slider.knob.face`              | `finish:knob`                      | `primary`                       | `finish:knob`          | `finish:knob`                      |
| `popup.corner`                  | `container`                        | `control`                       | `container`            | `container`                        |
| `tabs.track.face`               | `inset`                            | `none`                          | `inset`                | `inset`                            |
| `well.edge`                     | `border`                           | `none`                          | `border`               | `none`                             |

按钮与日历今天（`button.*`、`calendar.today.*`）是 2026-11-25 为 apple 审计加的，只有圆角与 apple 的那几行离开默认：

| 槽                                   | nsh-gallery、shadcn、solid-glass   | material | winui            | apple                       |
| ------------------------------------ | ---------------------------------- | -------- | ---------------- | --------------------------- |
| `button.corner` sm / md / lg         | `control`                          | `full`   | `control`（= 4） | 5 / 6 / `full`              |
| `button.selected` 面 / 墨            | `accent` / `primary-fg`            | 同左     | 同左             | `brand-tint` / `brand`      |
| `button.secondary` 面 / 墨           | `raised` / `foreground`            | 同左     | 同左             | `raised` / `foreground`     |
| `button.secondary` hover / 边 / 阴影 | `hover` / `raised` 的边 / `raised` | 同左     | 同左             | `muted` / `none` / `raised` |
| `button.destructive` 面 / 墨         | `destructive-tint` / `destructive` | 同左     | 同左             | 同左                        |
| `button.destructive` 边 / 阴影       | `destructive@0.32` / `raised`      | 同左     | 同左             | `none` / `none`             |
| `calendar.today` 面 / 墨             | `foreground@0.08` / `foreground`   | 同左     | 同左             | `none` / `brand`            |

`switch.small.*` 没有单列：M3 与 WinUI 的开关只有一种尺寸，小号与默认同尺寸；四套基础主题的小号是 `icon.sm` 的钮（12·16）与钮 + 4 的轨道（28·36）。

### 11.4 不读槽的控件

分段控件与侧边栏不读槽：它们各画一种形态，颜色、圆角与阴影读全局角色。标签页今天只读一个槽（轨道底色 `tabs.track.face`），其余仍读全局角色。标签页是轨道里的一块胶囊（`finish.plate`、外端 `controlSize.tabs / 2`），分段控件是一条通道（`finish.channel`）里的滑块（`finish.plate`），侧边栏的选中项整行填 `sidebarAccent`、轨线 2 点。这是 #380 的结论：删掉那几个维度之后，只有 `nsh-gallery` 原本的样子留了下来，其余主题在这里降级（[决策 0008](../decisions/0008-drop-selection-group.md)）。

### 11.5 槽表达不了的样子

槽是一套固定的写法，说不出的都记在 [`native-themes.md`](native-themes.md) 第 3.6 节，不靠再加一个槽或一句分支去凑：M3 滑块的 4×44 竖条手柄（槽里只有旋钮的宽 × 高，没有"长条 + 端圆角"；手柄的底色已由 `slider.knob.face` 表达）、M3 弹层的 4 dp 与日期选择器的 28 dp 不可能同值（`popup.corner` 一个槽）、M3 菜单与下拉的选中行是 `TertiaryContainer`（库没有 tertiary 角色）、M3 spinner 的 10 比 8 弧宽、WinUI 日历的选中日与日期选择器触发器、轮播箭头等等。加一个槽的唯一理由，是它对**每一套**主题都说得通。

## 12 数字：今天不在刻度上的地方

14 张预设表里的数字大部分已经落在刻度上（高度、图标、圆点、内边距、间隙、描边、圆角）；12 组不在：开关的轨道，滑块的轨道与手柄，分段的格高（#380 后随 `cells` 删掉），日历的格高与 `today`/`cellShape`，复选框的圆角，tabs 的内边距，spinner 的弧，sheet 的抓杆，进度条的高度，控件的可点范围外扩。第 3 节的决定（#293 第 3 条）是“复用已有刻度，不加新的按组件 token”，逐条（P5 已全部落地，下表的“差”记落地后的实测）：

下表是 P5 落地时的实测，「四套基础主题」指 `nsh-gallery`、`shadcn`、`solid-glass`、`apple` 共用的那一套值；2026-11-25 起 apple 自己写开关、滑块、日历与 spinner 的槽（54×24 的轨道、20×16 的椭圆钮、今天的品牌色数字、8 根辐条），M1、M2、M5、M9 里 apple 的那一列随之作废，其余三套基础主题不变。

| #   | 字段                                                                   | 今天（四套基础主题 / material / winui）                                                                                                    | 应读                                                                                                                                                                                                                                             | 差                                                                                                                                                                                                                                                                | 处理                                                                                                                                                                                                                          |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | switch `width`/`height`/`knob`                                         | 4 套 28×16/12、触屏 42×24/20；material 桌面 40×24/16（开 20、按 22）、触屏 52×32/16（开 24、按 28）；winui 40×20/12（悬停 14、按下 17×14） | `circle`：钮 = `icon.md`（`sm` 读 `icon.sm`），轨道高 = 钮 + 4，轨道长 = 2 × 钮 + 4（四边各 2：1 描边 + 1 内边距）；`ring` 与 `track: tint` 的 M3 配方：各自形制的官方配方点数（第 4 节）；没发布桌面密度的形制按档声明（`Tiered<RecipeShape>`） | 指针 4 套 28×16/12 → 36×20/16（+8/+4，钮 +4）；触屏 42×24/20 → 44×24/20（+2）；`sm` 指针 28×16/12 不变、触屏 34×20/16 → 36×20/16（+2）；winui 逐像素 0；material 触屏逐像素 0，桌面按 M3 比例缩到 `40×24`（[`0003`](../decisions/0003-material-desktop-tier.md)） | 已落地（2026-11-24 改定）：`geometry()` 的 `circle` 由 `iconSize` 算（`CIRCLE_ROOM = 4`），`ring` 与 `track: tint` 的 M3 配方读各自的 `RecipeShape` 点数（`sm` 与 `default` 相同，与 P5 前一致）；winui 的悬停/按下是配方点数 |
| M2  | slider `band`/`rail`/`thumb`/`verticalLength`                          | 20/6/14、32/8/20、128；material 同左（`44/16/4×44` 于 #367 降级）；32/4/18                                                                 | `handle` 的配方（各带官方数字）                                                                                                                                                                                                                  | 0                                                                                                                                                                                                                                                                 | 逐像素；material 的手柄自 #367 起读 `circle`，与 4 套同组                                                                                                                                                                     |
| M3  | segmented `CELL_HEIGHT`/`CELL_PADDING`/`CELL_GAP`/`CHECK_SIZE`、轨道高 | 轨道高 30（指针）/ 36（触屏）；含 `cells` 时 40/12/8/18                                                                                    | 轨道高读 `height.md`（`cells` 的 40/12/8/18 随 #380 删掉）                                                                                                                                                                                       | 轨道 30 → 28（−2）、36 → 40（+4）；`cells` 的一行随 #380 消失                                                                                                                                                                                                     | 已落地：轨道高读 `controlHeight`（`sm` 读 `height.sm`）；#380 后不画 `cells`                                                                                                                                                  |
| M4  | progress `height`/`trackHeight`                                        | 6/6、4/4、3/1                                                                                                                              | `track` 配方（6/6、4/4、3/1）                                                                                                                                                                                                                    | 0                                                                                                                                                                                                                                                                 | 逐像素                                                                                                                                                                                                                        |
| M5  | calendar `cell`/`outlineWidth`/`today`/`cellShape`                     | 32/42/1/control/quiet；40/1/pill/outline；40/2/pill/fill                                                                                   | 格高读高度；其余一律 base（第 11.7 节）                                                                                                                                                                                                          | 指针 32 → 28（−4，32 原是 `height.lg`）；触屏 42 → 40（−2）；material / winui 的指针格高本来就是 32（`height.md`），不动；其余见 11.7                                                                                                                             | 已落地：格高读 `controlHeight.md`；日期选择器随之窄 4 点                                                                                                                                                                      |
| M6  | checkbox `corner`/`border`                                             | 5/7/1、2、2/1                                                                                                                              | `choice` 配方（井 5/7、outline 2、inset 4）                                                                                                                                                                                                      | 0                                                                                                                                                                                                                                                                 | 逐像素                                                                                                                                                                                                                        |
| M7  | tabs `padX`                                                            | 8 / 8 / 8（winui 的内边距刻度是 6）                                                                                                        | `size.control.padding` 或固定 8                                                                                                                                                                                                                  | 读刻度则 winui −2；固定 8 则 0                                                                                                                                                                                                                                    | 固定 8（逐像素，Q3 已确认），第 3 节记为反例                                                                                                                                                                                  |
| M8  | radio `size`/`dot`/`border`                                            | 16/22/6/8/1；20/10/2；20/12/1                                                                                                              | `choice` 配方（well 16/22、outline 20、inset 20）                                                                                                                                                                                                | 0                                                                                                                                                                                                                                                                 | 逐像素；`dotFeedback` 的放大归 `fast`                                                                                                                                                                                         |
| M9  | spinner `minStroke`/`strokeShare`                                      | 1.5/8、1.5/10、1.5/8                                                                                                                       | 无刻度（不是 4 网格）                                                                                                                                                                                                                            | material 10 → 8                                                                                                                                                                                                                                                   | 已落地：组件常量 1.5 / 8（P3d），material 的弧变细                                                                                                                                                                            |
| M10 | sheet grabber `width`/`height`                                         | 36×5、32×4、36×5                                                                                                                           | 一套抓杆，不按主题列表：4 套取 36×5                                                                                                                                                                                                              | 0；material 32×4 → 36×5（+4 / +1，P4 已落地）                                                                                                                                                                                                                     | 一个 36×5 胶囊（`packages/ui/sheet.tsx` 的 `GRABBER_WIDTH`/`GRABBER_HEIGHT`，见第 11.5 节）                                                                                                                                   |
| M11 | radio/checkbox 外扩                                                    | 0 / 40 / 0                                                                                                                                 | 刻度 `dimension.size.target[tier]`（material 指针档 40，出处 M3 的 40 dp state layer）                                                                                                                                                           | 0（其余主题两档都是 0）                                                                                                                                                                                                                                           | 逐像素；新刻度项写进第 3 节与 `$extensions` 的刻度出处                                                                                                                                                                        |
| M12 | carousel `edge` 16×38、date-picker `split` 32                          | 16×38/字形 12、32                                                                                                                          | —                                                                                                                                                                                                                                                | 随取值删掉                                                                                                                                                                                                                                                        | 见第 11.7 节                                                                                                                                                                                                                  |

结论：7 组 0 差（M2、M3 的 `cells`、M4、M6、M7、M8、M11，各自落回刻度或取值的配方），M10 落地后也是 0 差（抓杆一处 36×5），material 与 winui 的开关按形制配方逐像素不变，可见的只有 M1 的 `circle` 开关、M3 的轨道、M5 的格高与 M9 的弧，M12 随第 11.7 节的降级消失。实测（P5，`port:render:theme --against`）：开关 4 套 × 亮暗 8 张（指针 36×20 / 触屏 44×24）、分段 4 套 × 2 张、日历与日期选择器各 3 套 × 2 张、spinner 的 material 与 winui 变细 1 点。方向是收向刻度，也都落在“差 1–8 点”里：最大的是指针档 +8 宽、+4 高（钮 +4），触屏只宽 2 点。第一版按“轨道高读 `height.md`”落地的 44×28 / 60×40 已由 2026-11-24 的改定取代。

## 13 finish 的可选字段：每套主题补写的中性值

第 5 节把可选字段改成必填时，各主题缺什么、补什么（中性值写在 base，主题只在真不同时写）。**下表是 P7 之前的状态，保留作记录**：P7 落地后六套主题都带齐了字段，补齐的活由 base 的 `finish` 组一次做完，没有任何主题单独补写（两条边色见第 5 节，取 `null` 而非 `transparent`）：

| 主题                             | 今天缺的字段                                                                                     | 补写                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| nsh-gallery、shadcn、solid-glass | `material`（全 null）、`elevation`、`backdropFilter`（只有 `glass` 有 20 px）、`gradient`        | `material: null`、`elevation: null`、`backdropFilter: "none"`、`gradient: null`                                               |
| apple                            | `elevation`、`gradient`、`backdropFilter`（`raised`/`overlay`/`inverse` 已有 30 px）、多层的边色 | `elevation: null`、`gradient: null`、`backdropFilter: "none"`、`border-color: "transparent"`、`border-*-color: "transparent"` |
| material                         | `material`、`backdropFilter`、`gradient`、`border-color`（面不画边）                             | `material: null`、`backdropFilter: "none"`、`gradient: null`、`border-color: "transparent"`                                   |
| winui                            | `elevation`、`gradient`、`backdropFilter`（`overlay` 是 acrylic，没有模糊串）                    | `elevation: null`、`gradient: null`、`backdropFilter: "none"`                                                                 |

编译产物因此变大（每个 finish 12 个字段全在），`theme:diff --same` 把“新增键”判为通过、“两侧都有的键变了值”才失败，所以这一步只会多出键，不出值。

## 14 官方枚举

平台自己的名字原样保留，注册成任何主题都能选的通用枚举；其余取行为词，不用组件名、不用主题名（#293 第 5 条）。

| 枚举                              | 值                                                                                                                                                                   | 今天谁用                                     | 注册在哪                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `dimension.focus.style`           | `halo` `outline` `double`                                                                                                                                            | halo：4 套；outline：material；double：winui | `theme-roles.md` 的 `theme-lint: enums`，`style.ts` 读 |
| finish `material`                 | `none` `glass` `acrylic`                                                                                                                                             | glass：apple；acrylic：winui                 | 同上                                                   |
| `shape.curve`                     | `continuous` `circular`                                                                                                                                              | continuous：apple                            | 同上                                                   |
| `dimension.size.control.*.switch` | `small` `regular`                                                                                                                                                    | small：4 套；regular：material、winui        | 同上                                                   |
| 缓动名（9 项）                    | `out-cubic` `in-cubic` `in-out-cubic`（通用）、`standard` `emphasized-decelerate` `emphasized-accelerate`（M3）、`decelerate` `accelerate` `point-to-point`（WinUI） | 见第 17 节                                   | 同上                                                   |

## 15 例外：按主题 id 的脚本，以及各自搬去哪

“没有一项只为某个主题配置”这条规则在 P1–P4 时还被四处绕过。下表是当时的账，以及每一行搬去了哪；P7 已按它落地，`scripts/theme/no-theme-ids.test.ts` 守住“脚本不再按主题 id 分支”：

| 例外                       | 今天在哪                                                                                           | 谁                                                                                                                                                                                                                                                                                                                                                                                                                      | 搬去哪                                                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 对比度豁免                 | `scripts/theme/contrast.ts` 的 `platform`（11 条）                                                 | apple 8 条（`muted-foreground` 在 background / muted / card / raised，Apple `secondaryLabel` 的 60%；`primary-foreground` 在 primary 与 `finish.accent`、`sidebar-primary-foreground` 在 sidebar-primary，systemBlue 上的白字；`brand` 在 background，链接）、shadcn 2 条（neutral `muted-foreground` 在 muted、raised）、winui 1 条（按下时 `finish.accent.pressed-foreground` 在 `finish.accent.pressed-background`） | 各主题 `theme.tokens.json` 的 `$extensions["dev.aning.shadcn-nsh"].contrast.waivers[]`（`{ fg, bg, source }`）；`contrast.ts` 读它，不再有按 id 的 TS 列表；某条不再失败就是错误 |
| 刻度出处（不在格子上的值） | `docs/specs/theme-roles.md` 的 `theme-lint: scales` 表（winui 的 `padding` 6、`pad` 11、`hit` 40） | winui                                                                                                                                                                                                                                                                                                                                                                                                                   | winui 的 `$extensions…scales.citations`（键为 token 路径、值为出处），`scripts/theme/extensions.ts` 读它（`spec.ts` 只解析 Markdown 表，保持纯函数）                             |
| 枚举白名单                 | `scripts/theme/style.ts` 的 `whitelists`（按路径列允许值）                                         | 不分主题                                                                                                                                                                                                                                                                                                                                                                                                                | 移到 `scripts/theme/enums.ts`，加载时读 `theme-roles.md` 的 `theme-lint: enums` 表，`style.ts` 转出（值名按第 14 节）                                                            |
| finish 可省字段            | `scripts/theme-lint.ts` 的 `optionalFields`                                                        | 不分主题                                                                                                                                                                                                                                                                                                                                                                                                                | 第 5、13 节改成必填，这份集合删掉                                                                                                                                                |
| 动效角色名单               | `scripts/theme/style.ts` 的 `motionRoleNames`                                                      | 不分主题                                                                                                                                                                                                                                                                                                                                                                                                                | 加 `state`（第 17 节）                                                                                                                                                           |
| `nsh-gallery` 的两份产物   | `scripts/tokens/build.ts:59`、`scripts/theme/diff.ts:221`                                          | nsh-gallery                                                                                                                                                                                                                                                                                                                                                                                                             | **不是风格例外**：`nsh-gallery` 是构建根主题（`packages/theme/theme.json` 与 `themes/nsh-gallery/` 同一份），保留并在 `docs/theme-design.md` 写明                                |
| 终端字符网格               | 每个组件的 `terminal` 分支                                                                         | 不分主题                                                                                                                                                                                                                                                                                                                                                                                                                | 保留（不是主题值）                                                                                                                                                               |
| 控件维度表按主题取列       | `scripts/theme-lint.ts` 的 `theme === "material" ? … : theme === "winui" ? …`                      | material、winui                                                                                                                                                                                                                                                                                                                                                                                                         | `theme-roles.md` 的 `theme-lint: controls` 表头点名每个值是哪几套主题的，列由表头读（P7）                                                                                        |
| 不检查的对比度对           | `contrast.ts` 的 `skipped`（`disabled-foreground`、`chart-foreground`）                            | 不分主题                                                                                                                                                                                                                                                                                                                                                                                                                | 保留（WCAG 的豁免，与主题无关）                                                                                                                                                  |

## 16 分档（tier）继承

分档今天已经是 DTCG 的 resolver 机制：`theme.resolver.json` 的 `modifiers.input` 列出 `pointer` / `touch` 两个 context，先引 `../../base/style.{pointer,touch}.tokens.json`，再引主题自己的同名文件（后写的赢）。`scripts/theme/dtcg.ts:1189-1192` 只在文件存在时才加引用，所以：

- **每个主题都可以有分档**，不是三套原生主题的特权；今天的 nsh-gallery、shadcn、solid-glass 只用 base 的值（没有 `pointer.tokens.json` / `touch.tokens.json`）。
- **没有分档文件的主题继承 base**：resolver 的 context 仍然有两条来源中的第一条，编译出两档完整的值。
- 只写一档也合法：例如只写 `touch.tokens.json`，指针档全取 base。
- 校验：`check:theme` 断言每套主题编译后的 `semantics.json` 两档都在、`dimension.size.hit.touch ≥ 44`（winui 的 40 走第 15 节的出处）、`pointer` 的每个键在 `touch` 里也有；`tokens:build --check` 保证 `themes/<id>/` 两档产物与源码一致。
- 文档：`docs/theme-design.md` 补一段“加一套分档值”的做法（加文件、不用改代码），`docs/theme-roles.md` 记两档的键。

## 17 动效角色与硬编码时长

第 3 节的三档弹簧只驱动 `animate()`；换色、透明度、边框、阴影今天是 43 处硬编码时长（CSS 类与内联 `transitionDuration`），它们需要一条**时序**角色。新增 `motion.state`：

| 主题                             | `motion.state`      | 出处                                                                                                                                           |
| -------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| nsh-gallery、shadcn、solid-glass | 120 ms，`out-cubic` | 上游 `nsh-gallery-ui` 的悬停洗色 120 ms ease-out（`references/nsh` 的设计指南把“悬停洗色/换色”定为 120 ms）；`out-cubic` 就是它的 ease-out     |
| apple                            | 120 ms，`out-cubic` | Apple HIG 的 Motion 一节只讲“短、不抢注意力”，不给状态过渡的秒数；按 `native-themes.md` 的既有约定（apple 与 nsh-gallery 同值）取上游的 120 ms |
| material                         | 100 ms，`standard`  | `MotionTokens.DurationShort2`（100 ms）+ `Easing.StandardCubicBezier(0.2, 0, 0, 1)`（Compose M3，`ExpressiveMotionTokens.kt` 同仓）            |
| winui                            | 83 ms，`decelerate` | `ControlFasterAnimationDuration` + `ControlFastOutSlowInKeySpline`（与 `fast` 同源，`Common_themeresources_any.xaml`）                         |

43 处的去向：其中 41 处归 `state`；`combobox.tsx:532` 的 `popIn`（320 ms）是出现，归 `transition.enter`；`progress.tsx:159` 的 800 ms 是**循环周期**，不是过渡，留组件常量并在注释里写明（`spinner.tsx` 的 `TURN_MS` 同理，它本就不在这 43 处里）。

| 今天的值       | 处数 | 位置（`packages/ui/`）                                                                                                                                                                                                                                                                                                       | 归      |
| -------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 100 ms         | 10   | `calendar.tsx:165,199,286,494`、`command.tsx:53`、`emoji-picker.tsx:75`、`lib/listbox.tsx:81`、`number-input.tsx:23`、`radio-group.tsx:128`、`switch.tsx:244`                                                                                                                                                                | `state` |
| 120 ms（内联） | 3    | `title-bar.tsx:147,154,162`                                                                                                                                                                                                                                                                                                  | `state` |
| 150 ms         | 18   | `accordion.tsx:88`、`breadcrumb.tsx:33`、`checkbox.tsx:143,173`、`color-picker.tsx:422`、`input.tsx:129`、`lib/listbox.tsx:116`、`lib/popup.tsx:203`、`progress.tsx:386`、`resizable.tsx:20`、`rich-editor.tsx:27`、`sidebar.tsx:384`、`slider.tsx:133`、`switch.tsx:230,238`、`table.tsx:28`、`trace.tsx:24`、`tree.tsx:29` | `state` |
| 160 ms         | 1    | `badge.tsx:73`                                                                                                                                                                                                                                                                                                               | `state` |
| 180 ms         | 1    | `progress.tsx:46`（数值变化的滑行）                                                                                                                                                                                                                                                                                          | `state` |
| 200 ms         | 5    | `accordion.tsx:81`、`link.tsx:18`、`pagination.tsx:38`、`toast.tsx:425`、`tree.tsx:65`                                                                                                                                                                                                                                       | `state` |
| 300 ms         | 3    | `link.tsx:21`（图标滑入）、`scrollbar.tsx:54,60`（变粗）                                                                                                                                                                                                                                                                     | `state` |
| 320 ms         | 1    | `combobox.tsx:532`（`popIn`）                                                                                                                                                                                                                                                                                                | `enter` |
| 800 ms         | 1    | `progress.tsx:159`（不确定态循环）                                                                                                                                                                                                                                                                                           | 常量    |

三档弹簧的调用点不动（已经走 `animate()` / `follow()`）；`state` 只回答“换形、换色要多久”，不回答“移动多快”。

## 18 实施顺序

一步一个 issue、一个 PR，标题是约定式提交。P1 之后 P2 与 P3a–P3f 可以并行（文件互不相交）；P4、P5、P6 串行在 P3 之后（它们要改同一批组件文件）；P7 与 P8 只需避开 P1 与 P4 的 `tokens/` 与 `scripts/` 写点。

| 步  | 内容                                                                                                                                                                                                                                                                                | 文件                                                                                                                     | 逐像素                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| P1  | 主题侧：base 与 6 套主题加 `dimension.control` 六键（#380 后为四键）与 `motion.state`，编译产物加 `dimension.control`；`control()` 读取；枚举白名单；`theme-roles.md` 的枚举与配方数字表                                                                                            | `packages/theme/tokens/**`、`scripts/theme/{style,spec,dtcg}.ts`、`packages/theme/theme.ts`、`docs/specs/theme-roles.md` | 相同（没人读）                   |
| P2  | `packages/ui/lib/look.ts`：一个取值 → 一个控件的各部分（形态与刻度），纯函数 + 单测，组件还不调用                                                                                                                                                                                   | `packages/ui/lib/look.ts`                                                                                                | 相同                             |
| P3a | `selection` + `group`：tabs、segmented、sidebar                                                                                                                                                                                                                                     | `packages/ui/{tabs,segmented,sidebar}.tsx`、对应演示                                                                     | 相同                             |
| P3b | `field`：`lib/indicator` 及其读者                                                                                                                                                                                                                                                   | `packages/ui/lib/indicator.ts`                                                                                           | 相同                             |
| P3c | `choice`：radio-group、checkbox；calendar 按第 11.7 节降级（删 `CalendarPreset`）                                                                                                                                                                                                   | `packages/ui/{radio-group,checkbox,calendar}.tsx`                                                                        | **可见**：material、winui 的日历 |
| P3d | `track`：progress、spinner（与分段轨道共用配方）                                                                                                                                                                                                                                    | `packages/ui/{progress,spinner}.tsx`                                                                                     | 相同                             |
| P3e | 降级（第 11.7 节）：date-picker 回到整块触发器、carousel 回到胶囊箭头；删 `iconCell` 与 `placement: "over"` 及其演示与文档                                                                                                                                                          | `packages/ui/{date-picker,carousel}.tsx`、对应演示与文档页                                                               | **可见**：winui                  |
| P3f | `handle`：slider、switch                                                                                                                                                                                                                                                            | `packages/ui/slider.tsx`、`packages/ui/switch.tsx`、`lib/switch-geometry.ts`                                             | 相同                             |
| P4  | 删 `controls`：14 张表删 `Record<Controls>`、`Controls` 类型、`controls()`、`semantics.json` 的 `controls` 键、`style.ts` 白名单项、`dtcg.ts` 的写入器；在 `scripts/` 加一条 grep 门禁（`Record<Controls>`、`controls(`、`"material" \| "winui"` 的主题比较）并挂进 `bun run check` | `packages/theme/**`、`packages/ui/**`、`scripts/`                                                                        | 相同                             |
| P5  | 数字收口：第 12 节的 M1、M3 轨道、M5 的格高、M9、M10 按刻度/配方落地                                                                                                                                                                                                                | 同 P3 的组件                                                                                                             | **可见**，6 套截图审             |
| P6  | 动效：43 处换成 `motion.state`，`combobox` 用 `enter`，两处循环留常量并注释                                                                                                                                                                                                         | 全部组件                                                                                                                 | 相同（时间轴变，静止帧不变）     |
| P7  | 例外搬进 `$extensions`（第 15 节），可选 finish 字段变必填（第 13 节）                                                                                                                                                                                                              | `packages/theme/tokens/**`、`scripts/theme/{contrast,spec,style}.ts`、`scripts/theme-lint.ts`                            | 相同（出现中性值）               |
| P8  | 分档继承的校验与文档（第 16 节）                                                                                                                                                                                                                                                    | `scripts/theme/spec.ts`、`docs/theme-design.md`、`docs/theme-roles.md`                                                   | 相同                             |

每步的收口：`bun run check`、`port:render`、`port:render:theme`、`test:unit`、`test:gallery`、`test:install`；`registry.json` 与 `public/r` 跟着重建；`CHANGELOG.md` 的 `Unreleased` 写一条（P1、P4、P7 是 breaking：主题作者要加六键、删 `controls`、补 finish 字段；P3e 删掉 `Picker` 的 `iconCell` 与 carousel 的 `placement: "over"`，也是 breaking）。

## 19 已确认的问题（2026-11-23）

1. **第 12 节可见的那 5 组数字**：按刻度改，集中在 P5 一步，6 套截图审。
2. **日历的 `today` 与 `cellShape`**：不加维度，按原则 6 降级为 base 的样子（第 11.7 节），`mark` 一并删掉。
3. **tabs 的 `padX`**：固定 8，第 3 节记为反例。
4. **`state` 的数字**：照第 17 节的表（winui 83 ms、apple 120 ms）。
5. **`cells`**：移出 `selection`，成为新维度 `group` 的值；material 的分段按钮取 `cells`，标签页仍是下划线。

## 20 冻结与降级（#366）

契约就是 `semantics.json` 的 schema：finish 的层与字段、颜色与圆角阴影角色、控件的槽（第 11 节）、动效角色。

**冻结在 contract v3。** 最后四件是 #340（删 `cells`、`ripple` 与弹簧，见[决策 0010](../decisions/0010-drop-ripple-springs.md)）、#293 P6（`motion.state` 等动效角色）、#357（`fill` 层；开关的 `checked-*` 字段）、#358（`dimension.control.selection` 增加取值 `plate`：`pill` 是 `nsh-gallery` 的胶囊，`plate` 是 shadcn、solid-glass、apple 里按控件圆角切齐的块）。它们落地即冻结；在那之前，schema 只有它们能改。**#380 之后 `dimension.control` 只剩四键**（`selection` 与 `group` 删掉，[决策 0008](../decisions/0008-drop-selection-group.md)）：契约只减不增，这一次是减。**#404 之后那四键也没了**：`dimension.control` 换成 `slots`（第 11 节）——那不是在契约里加主题风味，而是把"一套主题选一档枚举"换成"一套主题给每个槽填值"，枚举、白名单与配方表一起删掉（[决策 0013](../decisions/0013-one-contract-value-slots.md) 重述了冻结这一条）：槽的名单是全库共用的，加一个槽要它对每套主题都说得通。

冻结之后，一套主题表达不了的外观按三条处置（现在写主题也该照这个来，冻结只是让它不可绕过）：

1. **降级。** 在这套主题的现有键里改值，向契约里最近的一档靠；与原生的差别写进 [`native-themes.md`](native-themes.md) 第 3.6 节的差异表。第 11.7 节就是这样降级的一批（winui 的日历选中日、日期选择器触发器、轮播箭头，material 与 winui 的日历 `today` 与日格，material 的 spinner 弧）。
2. **不扩张。** 不为一套主题加键、加层、加字段，也不在组件里写这套主题的代码或分支（[`ARCHITECTURE.md`](../ARCHITECTURE.md) 的 P8）。新的一层（finish）只给一种不同的**表面**，不给状态；状态是 finish 上的字段（`pressed-opacity`、`pressed-background`、`checked-*`）。
3. **一处例外。** `nsh-gallery`（NSH Gallery）是官方 look，契约必须能完整表达它；另外五套（shadcn、solid-glass、apple、material、winui）可以降级。

**闸门。** `bun run theme:diff --gate <base>` 在 diff 里有 `contract` 类改动（键的新增或删除，或共用源改动：基础 token、读取层、编译）且分支在 `<base>...HEAD` 上没有新增 `docs/decisions/*.md` 时，以非零退出并列出每一处改动。CI 在碰 `packages/theme/`、`scripts/theme/`、`scripts/tokens/` 的 PR 上跑它。闸门没有放行开关：契约改动只靠同一分支的决定记录通过。

闸门看的是键与共用源，看不到两种同类的改动：**给已有的键加一个取值**（枚举增长，如 #358 的 `plate`；`theme:diff` 把它读成这套主题的一次值改动），以及**给 finish 加一个字段**（字段的清单在 `theme.ts` 的类型与 `theme-lint` 里，不在键上）。这两种同样是契约改动，同样需要决策记录；它们由 `check:theme`、类型与审阅守住，不靠闸门。

契约改动是 breaking change：`CHANGELOG.md` 的 `Unreleased` 由维护者写。决定记录见 [`docs/decisions/0004-theme-contract-freeze.md`](../decisions/0004-theme-contract-freeze.md)。
