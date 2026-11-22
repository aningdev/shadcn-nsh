# 主题契约 v2：按层定角色，同类少值

- 日期：2026-11-22
- 状态：已审定（2026-11-22），按第 9 节的顺序逐步实施，每步一个 PR
- 修订：2026-11-22 补入字体与分发产物（#259）；同日补入 D4–D7（指示器与描边进控件预设、描边两档、交互状态、阴影刻度）与其余风格组的去向
- 取代：[`theme-roles.md`](theme-roles.md) 中与本文冲突的部分；每一步落地时，`theme-roles.md`、[`native-themes.md`](native-themes.md)、[`design-tokens.md`](design-tokens.md)、[`design-semantics.md`](design-semantics.md)、`docs/GLOSSARY.md`、`docs/ARCHITECTURE.md` 在同一个 PR 里改成新的事实
- 决定记录：[`docs/decisions/0001-theme-contract-v2.md`](../decisions/0001-theme-contract-v2.md)

## 目标

主题只回答"这一层、这种语义长什么样"，不回答"某个组件长什么样"。同一类值（圆角、高度、间距、图标、阴影、弹簧）在一个主题里只有一条短刻度，组件从刻度上取值。

衡量方式：

- 一个主题作者写一套新主题时，要填的键数和要做的选择都减少，而且每个键的名字都能从"层 + 语义"猜出来。
- 用这套主题渲染出的界面，同类东西的值是统一的。

## 现状（`main` 9daf2dcb）

| 类       | 现在                                                                                                                                                     | 问题                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 颜色     | `cssVars.light` 74 个角色（其中 A 层 31 个），另有 `cssVars.theme` 里 11 个颜色键                                                                        | `sidebar-*`、`slider-track`、`dialog`、`code`、`scrollbar-thumb`、`window-*` 以组件命名；多个角色在 4–5 套主题里只是别的角色的 alias |
| 圆角     | 8 个（`radius`、`-card`、`-control`、`-field`、`-chip`、`-overlay`、`-dialog`、`-sheet`）                                                                | 按组件族命名；`control` 同时表示"按钮是胶囊"和"页内元素的圆角"（#253）                                                               |
| 高度     | default 指针档有 7 个：24/28/30/32/34/36/40                                                                                                              | 同类值太多                                                                                                                           |
| 间距     | default 有 6/10/12/14                                                                                                                                    | 不在 4 的网格上                                                                                                                      |
| 图标     | default 有 12/14/15/16                                                                                                                                   | 4 个值                                                                                                                               |
| 字阶     | 7 级；default 的 `title` 13 小于 `label` 14；行高是比例小数                                                                                              | 层级倒挂；行高不在网格上                                                                                                             |
| 弹簧     | 4 个：`press` 520/34 与 `move` 504/38 几乎相同                                                                                                           | 冗余                                                                                                                                 |
| 控件几何 | `checkbox` / `switch` / `slider` / `radio` / `progress` / `spinner` / `tabs` / `calendar` 8 组，100 多个值；default、shadcn、solid-glass、apple 完全相同 | 是组件的事，却放在主题里；主题作者只能照抄                                                                                           |
| finish   | 27 个，多数以组件命名（`knob`、`knobOn`、`handle`、`thumb`、`pill`、`chip`、`grabber`、`tooltip`、`groove`、`on`、`fill`）                               | 按组件分                                                                                                                             |
| 阴影     | default 28 条不同的 `shadow`，solid-glass 27 条                                                                                                          | 没有层级刻度                                                                                                                         |
| 平涂渐变 | 每套主题有 13–17 处 `linear-gradient(x 0%, x 100%)`                                                                                                      | 为满足"字段必须有"而写的空值                                                                                                         |
| 材质     | finish 里直接写平台对象（`material.apple` 等）；fallback 靠 `checkGlassFallback` 在 lint 时兜底（#251、#252）                                            | 每个主题自己拼平台参数，容易漏 fallback                                                                                              |

## 原则

1. **按层与语义定角色，不按组件。** 角色名回答"哪一层、什么语义"（面、墨、边、状态、数据），不出现组件名。
2. **同类少值。** 同一类值在一个主题里是一条短刻度：界面的规律、韵律与统一，不会让同类东西出现很多值。新加一个值之前，先看这一类是否已有可用的档。
3. **按主题不同的选择，放在离它最近的地方。**
   - 面的差异放进该主题的 finish。
   - 控件形态的差异放进组件的控件预设（见第 4 节）。
   - 平台固定、不随主题变的身份色（macOS 红绿灯）属于组件。
4. **纯 alias 删除。** 一个角色在每套主题里都等于某个已有角色时，就删掉它，读它的组件改读那个角色。
5. **对外格式不动。** NSH 的 `Theme` 就是 shadcn 的 token（`references/nsh/crates/nsh-base/src/theme.rs`），这一层的槽名照旧全写，因为应用会经 `Theme::of` 或 `bg-sidebar` 这类类名读取它们。
6. **原生主题可以裁剪。** 原生主题（apple、material、winui）照官方外观实现；某个控件的官方外观个性化太强、放进契约代价太大时，可以在实现上裁剪，并把裁剪写进该主题的文档（主题 README 与 [`native-themes.md`](native-themes.md) 的差异表），不为它新增层、角色或刻度档。

## 1 颜色角色

### A 层：NSH / shadcn 的 31 个槽，全部保留

`background`、`foreground`、`card`、`card-foreground`、`popover`、`popover-foreground`、`primary`、`primary-foreground`、`secondary`、`secondary-foreground`、`muted`、`muted-foreground`、`accent`、`accent-foreground`、`destructive`、`border`、`input`、`ring`、`chart-1`…`chart-5`，以及 `sidebar`、`sidebar-foreground`、`sidebar-primary`、`sidebar-primary-foreground`、`sidebar-accent`、`sidebar-accent-foreground`、`sidebar-border`、`sidebar-ring`。

- 缺一个槽，NSH 就会对这个槽退回 shadcn 的 neutral 灰（`theme.rs` 的 `DEFAULT_THEME`），所以 31 个槽都要写。
- `sidebar-*` 在 DTCG 源码里一律写成指向本层角色的 alias（例如 `sidebar` → `{color.background}` 或 `{color.card}`，由主题决定），不再给自己的字面值。
- 本库组件不读 `sidebar-*`：`Sidebar` 读层角色。这 8 个槽只为使用本库主题的应用代码保留。

### B 层：本库的角色（按层分组）

| 组       | 角色                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 面       | `inset`、`raised`、`field`、`track`、`knob`                                                                                         |
| 墨       | `faint`、`brand`                                                                                                                    |
| 边       | `line`、`brand-edge`、`glass-edge`、`ring-halo`                                                                                     |
| 交互状态 | `hover`；`state.disabled` 与 `state.pressed` 的颜色字段（见第 3 批）                                                                |
| 数据     | `info`、`warn`、`up`、`violet`，及其 `*-tint`（`brand-tint`、`info-tint`、`warn-tint`、`destructive-tint`、`up-tint`、`down-tint`） |
| 反色     | `inverse`、`inverse-foreground`、`inverse-brand`                                                                                    |

### C 层：明暗共用

`font-mono`、`scrim`、`media`、`on-media`，以及第 2 节的 3 个圆角。

### 删除与去向

**第 1 批：纯 alias。** 读这些角色的组件改读去向列中的角色（或 finish）。

| 角色                                        | 去向                                                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `on-brand-tint`                             | `accent-foreground`（6 套主题都相等）                                                                      |
| `inverse-muted`                             | `muted-foreground`；material 下 M3 snackbar 辅文取 `inverse-foreground`，这个差异放进 `inverse` finish     |
| `down`                                      | `destructive`（6 套主题都相等）                                                                            |
| `card-edge`                                 | `card` finish 的 `border-color`（winui 写 `CardStrokeColorDefault`，material 写 `transparent`）            |
| `selected-foreground`、`pressed-foreground` | 各主题 finish 的前景字段（`foreground` / `accent-foreground` / `primary-foreground` / `muted-foreground`） |
| `slider-track`                              | 控件预设引用的角色（base → `track`，material → `brand-tint`，winui → `input`）                             |

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

| 主题             | control | container | modal | 按钮胶囊 |
| ---------------- | ------- | --------- | ----- | -------- |
| default / shadcn | 8       | 12        | 14    | 否       |
| solid-glass      | 11      | 14        | 20    | 否       |
| apple            | 8       | 12        | 26    | 是       |
| material         | 4       | 12        | 28    | 是       |
| winui            | 4       | 8         | 8     | 否       |

- `shape.corners.button: "full" | "radius"` 决定按钮类控件是否画成胶囊；除按钮外的元素都不读它。
- 嵌套元素的圆角按同心推出（内 = 外 − 内边距），不再单独写 `inset` 圆角，也不再写 `size.control.corner`（5 / 7）。
- `shape.corners.field`（M3 填充式输入框只圆上角）移进控件预设（第 4 节）：它以组件命名，取值只随控件形态变。
- A 层的 `radius`（shadcn 的基准圆角，应用里的 `rounded-lg` 等由它推导）写成 `{radius-control}`。

## 3 尺度

| 类   | 契约                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 高度 | 一条刻度 `sm` / `md` / `lg`，分指针、触屏两档。行、标签栏、单行输入等都从这条刻度上取。只有平台官方确实有第 4 档时，才允许加 `xl`，并且要写出处（例如 M3 的 56 dp 输入框与列表行）                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 间距 | 4 的倍数：4 / 8 / 12 / 16 / 24 / 32。`density` 与 `control` 的内边距和间隙都取自这里。平台官方确实是非 4 倍数的值（例如 winui 的 6）才允许例外，并且要写出处                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 图标 | 3 档 `sm` / `md` / `lg`，分指针、触屏两档。勾、清除钮、控件内字形都从这 3 档里取                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 字阶 | 保留 7 级。字号**不降序**：`caption` ≤ `detail` ≤ `body` ≤ `label` ≤ `title` < `headline` < `display`（修掉 default 的 `title` 13 < `label` 14）。行高用整数 px：原生主题照官方字阶（Apple、M3、WinUI 3 各有出处），自有主题取 4 的倍数                                                                                                                                                                                                                                                                                                                                                                        |
| 字体 | 每套主题只定义两个字体族 `font.family.sans` 与 `font.family.mono`，输出为 A 层的 `font-sans` / `font-mono`；用系统字体的主题写通用族（`system-ui`、`monospace`），NSH 把通用族当作系统字体。NSH 用 `font-sans` 画所有没写字体的文字，所以 `typography` 组上的 `fontFamily` 扩展、`semantics.json` 的 `typography.fontFamily` 和 `font.family()` 一并删除。7 个字阶复合 token 的 `fontFamily` 是 DTCG typography 类型的必填字段，设计工具导入时要用，一律写成 `{font.family.sans}`，不再写死 `["system-ui", "sans-serif"]`（现在 winui 导出的字阶丢了 Segoe UI Variable）。等宽文字只经 `mono()` 读 `font-mono` |
| 动效 | 3 个弹簧 `fast` / `default` / `slow`，按速度命名，不按组件命名。用途固定：控件状态（开关、勾选）用 `fast`，按压与移动用 `default`，落定与面板进出用 `slow`。winui 从官方时长里取 3 个。material 的 `move` 现在是 380，归到 `default` 后会变快，实施时要对照 M3 motion scheme 核对                                                                                                                                                                                                                                                                                                                              |
| 时长 | `duration.shake`（6 套主题都是 500）移进组件                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 描边 | 两档：`hairline`（分隔线、面的边）与 `control`（控件描边）。`surface` 在 5 套主题里等于 `hairline`，并入；material 的面"不画边"改由 finish 表达（`border-color: transparent` 或不写边），布局可能差 1px，要审截图。`indicator`（标签页、侧栏指示条的粗细）移进控件预设                                                                                                                                                                                                                                                                                                                                         |
| 保留 | `shape.curve`（continuous / circular）、`size.hit`（平台最小点击区）、`dimension.focus`（焦点样式、宽度、偏移，属状态层）、`transition.enter`（一条进场过渡，归动效）照旧，各是一个值或一个枚举                                                                                                                                                                                                                                                                                                                                                                                                                |

验收：

- 每套主题的高度、间距、图标各自不超过 3 个值，例外都有出处。
- `check:theme` 会拦下：不在刻度上的值、字号降序、行高不是整数。

## 4 控件预设

- 主题里只写一个枚举：`controls: "base" | "material" | "winui"`。
- 每个控件的几何与形态写在组件里，是这三档的预设表，分指针、触屏两档；预设里引用颜色时，只引用第 1 节的角色。
- 覆盖的控件：checkbox、switch、slider、radio、progress、spinner、tabs、calendar，以及 sheet 的 grabber。
- 一并移入的形态选择（D4）：`indicator.tabs` / `nav` / `field`（pill、underline、fill、bar、box）、`shape.corners.field`（all / top）、`stroke.indicator`（2 / 3）。它们以组件命名，6 套主题的取值正好随 base / material / winui 三档变化。
- 主题作者从"填 100 多个数"变成"选一档"。想要第四种控件形态，要么改组件的预设，要么在应用里覆写组件的样式：控件形态是组件的事，不是主题的事。

验收：

- 这一步是纯重构，6 套主题的渲染要与 #256 之后的基线**逐像素相同**。
- `semantics.json` 里不再出现上面这些组。

## 5 finish：按层，加阴影刻度

| finish（层） | 并入的旧 finish                                      |
| ------------ | ---------------------------------------------------- |
| `card`       | `card`、`section`                                    |
| `inset`      | `inset`、`field`、`track`、`groove`                  |
| `raised`     | `raised`、`light`、`chip`、`pill`                    |
| `overlay`    | `menu`（菜单、选择框、弹出面板）                     |
| `modal`      | `dialog`                                             |
| `inverse`    | `inverse`、`tooltip`                                 |
| `glass`      | `glass`                                              |
| `accent`     | `accent`、`fill`、`on`                               |
| `knob`       | `knob`；`knobOn`、`handle`、`thumb` 的差异进控件预设 |
| 状态         | `hover`、`pressed`（含 `accentPressed`）、`disabled` |

`grabber` 不再是 finish，归 sheet 的控件预设。

- **阴影刻度（D7）。** 现在一串 `shadow` 里混着投影、内阴影与边光三样东西（default 有 29 种不同的串）。拆成三条刻度，finish 只引用、不手写：

  | 刻度             | 档位                                                      | 用途                                                                                 |
  | ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
  | 投影 `elevation` | `sm` / `md` / `lg` / `xl`，每种外观最多 4 个值，可共用    | `sm` 控件凸起与 knob，`md` 卡片，`lg` 浮层（菜单、提示、toast），`xl` 对话框与 sheet |
  | 内阴影 `inset`   | 每种外观 1 个值                                           | 井、轨道、按下                                                                       |
  | 边光 `edge`      | 每种外观最多 2 个：`surface`、`accent`；平面主题写 `null` | 斜面高光、内描边（default、solid-glass、apple 的 0.5px 描边）                        |

  官方对照：shadcn 为 `shadow-xs` / `-sm` / `-md` / `-lg`；M3 为 level 1 / 1 / 2 / 3；WinUI 3 为 depth 2 / 8 / 32 / 128（tooltip 的 depth 16 并入 32，按原则 6 记为差异）。

  位置：

  - 源码写在 DTCG 的 `light.tokens.json` / `dark.tokens.json` 的 `shadow` 组（DTCG 标准的 `shadow` 复合类型，支持 `inset` 与多层）。阴影随外观变化，颜色引用颜色角色，不写死 oklch。
  - 编译进 `semantics.json` 的 `elevation`（按 light / dark，与 finishes 并列），**不进 `theme.json`**：NSH 读 `theme.json` 时丢掉阴影（`theme.rs` 的测试断言 `shadow-sm` 读不到），运行时的 `token()` 读不到。
  - finish 的 `shadow` 写引用（如 `["{shadow.edge.surface}", "{shadow.sm}"]`），编译时拼成一串 CSS；组件读 finish 的方式不变。
  - `theme.ts` 加 `elevation(level)`，与 `shape`、`font` 并列；组件与应用要阴影时从这里取，不写字面量。
  - 导出的 `light.tokens.json` / `dark.tokens.json` 带上 `shadow` 组，设计工具可以导入为效果样式。

- **平涂。** `gradient` 可以写 `null`，删掉所有 `linear-gradient(x 0%, x 100%)`。finish 的字段集合仍然固定，平涂主题写 `null`，不写空渐变。

验收：

- 每套主题 finish ≤ 12 个；每种外观的阴影构件 ≤ 7 个（投影 4、内阴影 1、边光 2），finish 里没有手写的阴影串。
- 全库没有退化渐变。
- 有可见变化的页面，6 套主题的截图都已审阅。已知会变的：solid-glass 的 knob 阴影（0.3）与 raised（0.06）并到同一档；default 的卡片（0.04）与控件凸起（0.05）并到同一档。

## 6 材质

材质不是 CSS 模仿：NSH 没有 SVG 滤镜，`backdropFilter` 只支持模糊。材质也不写在组件里。

- finish 的 `material` 字段改成一个枚举 `"none" | "glass" | "acrylic"`。
- 配方集中写在 `packages/theme` 的一个文件（`materials`），由它展开成 NSH 的平台属性和 fallback。
- 组件不改：`platformMaterial()` 已经在 `lib/popup`、`toast`、`card`、`code-editor`、`carousel` 里展开。

| 配方      | 用在                                                                   | 展开                                                                                                                                                                                                                                                                                                             |
| --------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`    | default、shadcn、solid-glass、material 的所有层；apple、winui 的其余层 | 不展开                                                                                                                                                                                                                                                                                                           |
| `glass`   | apple 的 `overlay`、`inverse`、`raised`、`glass`                       | `glassEffect` regular + 层色作 tint（iOS / macOS 26+）；macOS 26 以前用 `macos.backdrop` 的 `menu` / `popover` 材质；iOS 用 `ios.backdropMaterial`；fallback：`backdropFilter: blur(30px)`，层色不透明度不低于 0.72                                                                                              |
| `acrylic` | winui 的 `overlay`                                                     | `backdropFilter: blur(30px)`（`AcrylicBrush.h` `sc_blurRadius`）加层色。亮：`#FCFCFC` tint 0，luminosity 0.85；暗：`#2C2C2C` tint 0.15，luminosity 0.96（`AcrylicInAppFillColorDefaultBrush`，`AcrylicBrush_themeresources.xaml` @ `1b5b1a0`）。fallback：不透明的 `FallbackColor`（亮 `#F9F9F9`，暗 `#2C2C2C`） |

- 每个配方都给出 fallback：模糊半径，以及层色的最低不透明度。不画模糊的平台（Linux / GPUI）也不会透出背后的内容。这条取代 `checkGlassFallback`（#251）：fallback 由配方保证，不再靠 lint 兜底。
- 数值（例如 0.72）在实施时用平台截图核对。
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
- `state` 组（`press-scale`、M3 的 state layer `overlay` 与 `ripple`、`pressed-opacity`、`disabled`）保留在主题里（D6）：它作用于所有可按的东西，不只是控件，所以不进控件预设。
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
2. 控件预设（第 4 节，含 D4 的指示器、输入框圆角与指示条粗细），逐像素相同；输入框 #249 排在这一步之后，直接写进预设
3. 圆角（第 2 节，#253）
4. 颜色：第 1 批（逐像素相同）→ 第 2 批 → 第 3 批
5. 尺度（第 3 节），含字体
6. finish 按层与阴影刻度（第 5 节）
7. 材质（第 6 节）

## 10 已确认的问题

| #   | 问题                                                                                   | 建议                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | `sidebar-*`：删掉，还是作为对外格式保留？                                              | ✅ 已确认（2026-11-22）：**保留为 A 层 alias，组件不读。** NSH 的 `Theme` 就是 shadcn 的 31 个槽，缺一个就退回 neutral 灰，应用里写的 `bg-sidebar` 会变色。这改了之前"第 2 批删掉其余 `sidebar-*`"的计划                                                                             |
| D2  | 材质是写在 finish 的字段里，还是按层固定？                                             | ✅ 已确认（2026-11-22）：**写在 finish 的 `material` 字段里，用枚举（方案 A）。** apple 现在在 `raised` 上也用玻璃（#252），按层固定会丢掉这个选择                                                                                                                                   |
| D3  | finish 数量                                                                            | ✅ 已确认（2026-11-22）：**9 层 + 3 种状态 = 12 个**，M3 中过于个性化的差异按原则 6 裁剪。（比之前说的"约 8 个"多了 `modal` 和 `inverse`）。M3 的对话框（`SurfaceContainerHigh`）与菜单（`SurfaceContainer`）颜色不同，提示与 toast 的反色面也是一层，和第 2 节圆角的 `modal` 对得上 |
| D4  | 以组件命名的形态选择（`indicator.*`、`shape.corners.field`、`stroke.indicator`）放哪？ | ✅ 已确认（2026-11-22）：**并入控件预设**（第 4 节）                                                                                                                                                                                                                                 |
| D5  | 描边 4 个值                                                                            | ✅ 已确认（2026-11-22）：**收成 `hairline`、`control` 两档**，`surface` 并入 `hairline`，`indicator` 进控件预设（第 3 节）                                                                                                                                                           |
| D6  | `state` 组                                                                             | ✅ 已确认（2026-11-22）：**保留在主题**，只把 `accent-pressed-opacity` 并入第 3 批的 `state.pressed`（第 7 节）                                                                                                                                                                      |
| D7  | 阴影                                                                                   | ✅ 已确认（2026-11-22）：**拆成投影 4 档、内阴影 1 个、边光 2 个**；源码在亮暗 DTCG 文件，编译进 `semantics.json`，不进 `theme.json`（第 5 节）                                                                                                                                      |
