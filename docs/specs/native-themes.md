# 原生外观主题：Apple、Material、Fluent

本文是方案：目标是**先只用主题数据**，让本库组件分别画出 Apple（Liquid Glass）、Android（Material 3 Expressive）和 Windows（Fluent 2）的外观；同时写清楚主题做不到的部分，以及每一期的验收标准。

它承接 [`positioning.md`](positioning.md) 的差异点 1（多风格 × 主题色），沿用 [`theme-roles.md`](theme-roles.md) 已有的规则（token、finish、alias、形状固定）。调研截止 2026-11。

## 结论

现在的主题只管两样：颜色（`theme.json`）和质感（`finishes.json`）。原生外观还需要另外四类数据：**字体、形状、尺寸密度、动效**，此外还缺一个能接到平台原生材质的出口。

把这五样做成主题数据之后，三套原生外观大约能做到七八成。剩下的部分分两类：

- **组件结构不同**，主题改不了，记在 B 类。
- **NSH 没有对应 API**，要向上游提，记在 C 类。

```
原生外观 = 颜色 + 质感 + 平台材质 + 形状 + 字体 + 尺寸密度 + 动效 + 组件结构 + 系统信号
现在可主题化   ✅      ✅      ❌        ⚠️     ❌       ❌        ❌       ❌        ❌
本方案之后     ✅      ✅      ✅        ✅     ✅       ✅        ✅       部分      ❌（上游）
```

| 平台                     | 只用现有主题 | 做完第 1–3 期 | 剩下的缺口                                          |
| ------------------------ | ------------ | ------------- | --------------------------------------------------- |
| Apple iOS / macOS 27     | 约 4 成      | 约 8 成       | 跟随系统强调色、透明度滑杆、减少透明度、增强对比度  |
| Android（M3 Expressive） | 约 3 成      | 约 7 成       | 动态取色、形状变化、Switch 拇指图标、FAB 等组件结构 |
| Windows 11（Fluent 2）   | 约 5 成      | 约 8 成       | Mica 材质、系统强调色、输入框底部强调线             |

## 1 三个平台的设计语言

### 1.1 Apple：Liquid Glass（iOS 27 / iPadOS 27 / macOS 27）

| 方面 | 要点                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 材质 | 默认更不透明、背后内容更模糊、玻璃外圈加一道压暗的边、高光更亮、折射更均匀；设置里新增透明度滑杆（从极透到全着色）；遵循"减少透明度"和"增强对比度"；不能再用 `UIDesignRequiresCompatibility` 退出 |
| 形状 | 控件以胶囊形为主；圆角与容器同心（内圆角 = 外圆角 − 间距）；连续曲率（`borderCurve: continuous`）；macOS 27 所有窗口统一成一个更紧的圆角                                                          |
| 结构 | 内容滚到浮动栏下面时，顶部出现统一的工具栏；侧栏铺满窗口边缘；macOS / iPadOS 新增菜单项图标 API（默认隐藏）                                                                                       |
| 字体 | 系统字体 SF Pro；正文 iOS 17pt、macOS 13pt；Dynamic Type                                                                                                                                          |
| 尺寸 | iOS 触控目标 44pt；macOS 控件 24–32pt，行高 28–36（NSH 设计指南）                                                                                                                                 |

### 1.2 Android：Material 3 Expressive（2025 年发布，2026 年 I/O 扩展）

| 方面 | 要点                                                                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 颜色 | 动态取色（Material You，取自壁纸）；用色调角色（primary / secondary / tertiary / surface-container …）；据二手来源，Android 17 新增自选取色，以及模糊和半透明 |
| 形状 | 圆角分 none 到 full 约 10 档；35 种新形状；形状变化（shape morphing，按下或选中时形状改变）                                                                   |
| 字体 | 基础字号层级之外新增强调字号（emphasized type）                                                                                                               |
| 动效 | 弹簧动效，分 standard 和 expressive 两套方案，每套各有 spatial（空间）和 effects（效果）弹簧                                                                  |
| 状态 | 状态层：在原色上叠一层半透明色（hover 约 8%、focus 和 pressed 约 10%）；按压有 ripple                                                                         |
| 布局 | 2026 年 I/O：Expressive 布局体系、自适应 scaffold、8dp 间距体系；列表、菜单、搜索都有了 Expressive 版本；底部应用栏弃用，改为 docked toolbar                  |
| 尺寸 | 触控目标 48dp                                                                                                                                                 |

### 1.3 Windows 11：Fluent 2

| 方面 | 要点                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| 材质 | Mica：主窗口底，跟随壁纸染色，不透明；Acrylic：菜单、弹层这类临时表面用，半透明加模糊                         |
| 形状 | 圆角小：控件约 4px，弹层和窗口约 8px，另有 circular                                                           |
| 字体 | Segoe UI Variable；正文 14px                                                                                  |
| 尺寸 | 标准控件高 32px                                                                                               |
| 结构 | 输入框底部有一条强调色线；侧栏和标签页的选中项有指示条                                                        |
| 阴影 | 按层级分级                                                                                                    |
| 现状 | 2026 年没有新的设计语言版本，Fluent 2 仍是基准；WinUI 3 在推进，但微软自家的 Edge 和 Copilot 在往别的风格漂移 |

> 上面 M3 和 Fluent 的具体数值来自它们公开的 token 规范概要。第 3 期做主题之前，要回官方 token 文件逐项核对，核对结果写回本节。

## 2 现状：哪些已是数据，哪些写死在代码里

下表是第 1a 期做完之后的状态：风格数据已在 `finishes.json`，读取它的 getter 已接上，组件里散落的字号与圆角还没改（第 1b 期）。

| 维度     | 现在在哪                                                                                                                                         | 能否随主题切换                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 颜色     | `theme.json`：shadcn 的 31 个槽位加本库扩展                                                                                                      | ✅                                                       |
| 质感     | `finishes.json`：20 个 finish，字段有 bg / image / border / shadow / backdropFilter，还有 `press.scale`                                          | ✅                                                       |
| 圆角     | `theme.json` 的 `radius`、`radius-card`、`radius-control`，共 3 档；`finishes.json` 的 `shape` 按角色再写一遍（第 1a 期）                        | ✅ 3 档；`shape` 的其余角色待组件读取（第 1b 期）        |
| 曲率     | `finishes.json` 的 `shape.curve`，`theme.ts` 的 `cornerCurve` 读它                                                                               | ✅                                                       |
| 字体     | `finishes.json` 的 `type`；组件经 `font.size / weight / line / tracking` 读角色，`type.family` 经 `selectTheme` 写进 `font-sans`（1b 第 1 部分） | ✅ 角色没有对得上的字号留在代码里（见 `theme-roles.md`） |
| 页面密度 | `finishes.json` 的 `size.density`，`surface.tsx` 的 `density` 读它，按 pointer / touch 两档                                                      | ✅                                                       |
| 控件尺寸 | `finishes.json` 的 `size.control`，`surface.tsx` 的 `controlSize` 读它；terminal 档留在代码里                                                    | ✅                                                       |
| 动效     | `finishes.json` 的 `motion`，`theme.ts` 的 `motion` 读它：press、settle、control、move、enter、shake                                             | ✅                                                       |
| 平台材质 | 组件没有用到 `glassEffect`、`glassTintColor`、`ios.backdropMaterial`、`macos.backdrop`、`windows.backdrop`、`android.ripple`                     | ❌                                                       |
| 主题选择 | `selectTheme(AppTheme)` 只能手动选；`AppTheme` 是 `{ id, label, theme, finishes }`                                                               | ❌ 不会按平台自动选                                      |

**NSH 已经提供的平台能力**（`references/nsh/website/docs/styling.md` 等）：

- Apple：`glassEffect: "regular" | "clear"` 和 `glassTintColor`，iOS / macOS 26 及以上可用，其他平台回落到 `backdropFilter`；`ios={{ backdropMaterial }}`；`macos={{ backdrop: { material, blending, state } }}`。
- Windows：`windows={{ backdrop: { material: "blur" } }}`，Windows 11，透明窗口里才看得到。
- Android：`android={{ ripple }}`；API 31 起支持 `backdropFilter` 模糊。
- 通用：`borderCurve`、系统字体、`fontFamily` 列表、`registerFont`、`fontScale()`、`colorScheme()`、减少动态效果、`platform.os`。

**NSH 没有的**：读系统强调色、动态取色、减少透明度和增强对比度的信号。

## 3 设计

### 3.1 主题仍是两个文件：颜色一层，风格一层

```
packages/theme/themes/<id>/
  theme.json     颜色和圆角                     （NSH setTheme 读取，不变）
  finishes.json  风格：外观无关的部分 + light / dark 的面  （本库读取，扩展）
  index.ts       AppTheme { id, label, theme, finishes }（不变）
```

`finishes.json` 的顶层是 `press` 与九组风格数据（外观无关）、`light`、`dark`（每个 finish 的面）。本方案在顶层、与 `press` 并列，加上 `type`、`shape`、`size`、`stroke`、`focus`、`state`、`motion`、`icon`、`indicator` 九组风格数据（3.2）；平台材质放在每个 finish 里（3.3）。

**为什么放进 `finishes.json`，不新开文件，也不放进 `theme.json`：**

- **两轴模型不变。** [`positioning.md`](positioning.md) 把主题定为"风格（`finishes.json`）× 颜色（`theme.json`）"，`init` 也按这两轴来选。字体、形状、尺寸、动效都是风格，不是颜色。新开第三个文件就成了三轴，`init`、registry 条目、文档站切换都要跟着改。
- **先例已在。** `press.scale` 是按下时下沉多少，本身就不是"面"，早已放在 `finishes.json` 顶层。
- **`theme.json` 不合适。** 它由 NSH 的 `setTheme` 解析，认不出的值会抛 `TypeError`；而且它只按 light / dark 分，表达不了 pointer / touch 两档。

**跟着要改的：**

- [`theme-roles.md`](theme-roles.md) 和 `GLOSSARY.md` 里 `finishes.json` 的定义，从"一个面的样子"改成"风格：外观无关的尺寸、字体、形状、动效，加上每种外观下各个 finish 的面"。finish 这个词仍指一个面，文件名不改。
- 圆角仍留在 `theme.json`（`radius`、`radius-card`、`radius-control`），因为 NSH 的 `token()` 和 Tailwind 的 `rounded-*` 类都读它。`shape` 按用途角色写圆角，其中 `control`、`card`、`inset` 与这三个 token 是同一个数，`check:theme` 检查两处相等；其余角色（`field`、`chip`、`overlay`、`dialog`、`sheet`）只在 `shape` 里。两处分工写在 `theme-roles.md`。

### 3.2 `finishes.json` 的风格键表

风格分 **9 组数据**（`type`、`shape`、`size`、`stroke`、`focus`、`state`、`motion`、`icon`、`indicator`），加上 3.3 的 finish `material` 字段，共 10 组。9 组写在顶层，与 `press`（已有，按下缩多少）并列，排在 `light` / `dark`（各 finish 的面）之前：

```jsonc
{
  "press": { "scale": 0.97 }, // 已有
  "type": {…}, "shape": {…}, "size": {…}, "stroke": {…}, "focus": {…},
  "state": {…}, "motion": {…}, "icon": {…}, "indicator": {…},
  "dark": {…}, "light": {…}
}
```

**通用规则**

- **按用途角色命名，不按档位。** 形状和字号写成 `card`、`dialog`、`control`、`body`、`title`…，不写 xs–xl：三个平台的差别是"哪种部件用多大圆角"，不是一把统一的尺子。
- **tier。** 随设备变的值写成 `{ "pointer": …, "touch": … }`：pointer 是桌面（`platform.desktop`），touch 是触屏；模块加载时定，不随窗口变。terminal 的行高和列宽由字符格决定，留在代码里（`surface.tsx` 的 `terminalSizes`），不进主题。
- **默认值不变画面。** default 主题的数就是原来写死在代码里的数；shadcn 与 solid-glass 的风格数与 default 相同，只有 `shape` 的圆角跟它们自己的 `theme.json` 走（见下）。
- **形状固定。** 三套主题 9 组的键集合完全相同、叶子的类型相同、枚举取白名单里的值、`shape` 与 `theme.json` 的圆角一致：`bun run check:theme` 逐项检查，缺一个键就点名（`scripts/theme/style.ts`）。
- **读取。** `style()` 给出当前主题的风格（响应式：读它的地方在 JSX、`draw`、effect 里随 `selectTheme` 下一帧重画）。`density`、`controlSize`、`motion`、`cornerCurve`、`focusRing` 保持原来的对象形状，每个键是一个 getter，读 `style()`。`density` 的 `title` / `note` / `body` 取 `type.title` / `type.detail` / `type.body` 的 `size`，`controlSize` 的 `label` / `detail` 取 `type.label` / `type.detail`，所以字号只写一处。
- **easing 不进 JSON。** 只写曲线的名字（`motion.enter.easing`），名字到曲线的映射在 `theme.ts`，白名单在 `style.ts`。
- **表里的数。** "default" 一列读自现在的代码；apple / material / fluent 三列来自各平台公开规范的概要，标"约"的是近似值，"待核对"的要在第 3 期回官方 token 文件逐项核对后写回本节；"—" 是该平台没有这个概念，取 default 的值。

#### type：7 个角色

每个角色是 `{ size, line, weight, tracking }`：`size` 和 `line`（行高）分 pointer / touch，`weight` 是字符串 `"400"`–`"700"`，`tracking` 是字距（点）。SF 和 Material 都按字号调字距，所以 `tracking` 不能省。`type.family` 取 `null`（系统字体）、`"sans"`、`"rounded"` 或 `"mono"`。字号乘以 NSH 的 `fontScale()`，跟随系统字号设置（第 1b 期）。

| 角色（用在）                   | default（pointer / touch） | Apple（macOS / iOS） | Material          | Fluent       |
| ------------------------------ | -------------------------- | -------------------- | ----------------- | ------------ |
| `caption`（徽标、时间戳）      | 11 / 12                    | 10 / 12              | label-small 11    | caption1 12  |
| `detail`（描述、次要信息）     | 12 / 13                    | 11 / 13              | body-small 12     | caption1 12  |
| `body`（正文）                 | 13 / 15                    | 13 / 17              | body-medium 14    | body1 14     |
| `label`（控件上的字，500）     | 14 / 15                    | 13 / 17              | label-large 14    | body1 14     |
| `title`（卡片、区块标题，600） | 13 / 13                    | 13（700）/ 17（600） | title-medium 16   | subtitle2 16 |
| `headline`（页面标题）         | 20 / 22                    | 22 / 22              | headline-small 24 | title3 24    |
| `display`（大数字）            | 26 / 28                    | 26 / 34              | display-small 36  | title1 32    |

`line` 在 default 里是按现有正文行高（13 配 19、15 配 21）推出的初值，第 1b 期把散在组件里的 `lineHeight` 搬上来时逐项对齐；三个平台的 `line` 和 `tracking` 待核对。`weight` 在 default 里：`label` 500，`title`、`headline`、`display` 600，其余 400。`family`：default 与三个平台都是 `null`（SF、Roboto、Segoe UI Variable 就是各自的系统字）。

#### shape：8 个圆角角色加两个枚举

圆角单位是点。`shape.control`、`shape.card`、`shape.inset` **就是** `theme.json` 的 `radius-control`、`radius-card`、`radius`（见决策 1 与 [`theme-roles.md`](theme-roles.md)）。

| 键              | 用在                                 | default                 | Apple                  | Material       | Fluent   |
| --------------- | ------------------------------------ | ----------------------- | ---------------------- | -------------- | -------- |
| `control`       | 按钮、选择器触发、标签、菜单项       | 8（= `radius-control`） | 胶囊（取一个够大的数） | full（胶囊）   | 4        |
| `field`         | 输入框                               | 8                       | 约 6–8                 | xs 4           | 4        |
| `chip`          | 徽标、标签                           | 10                      | 胶囊                   | sm 8           | 4        |
| `card`          | 卡片、侧栏浮层                       | 14（= `radius-card`）   | 约 16 以上             | md 12          | 8        |
| `overlay`       | 菜单、弹出层                         | 10                      | 约 12                  | xs 4（待核对） | 8        |
| `dialog`        | 对话框                               | 14                      | 约 26                  | xl 28          | 8        |
| `sheet`         | 抽屉                                 | 14                      | 与屏幕同心             | xl 28          | 8        |
| `inset`         | 卡片里的井、提示、骨架               | 10（= `radius`）        | 待核对                 | 待核对         | 待核对   |
| `curve`         | 角的曲线：`continuous` 或 `circular` | continuous              | continuous             | circular       | circular |
| `corners.field` | 输入框圆哪几个角：`all` 或 `top`     | all                     | all                    | top（filled）  | all      |

`inset` 是本表在方案的七个角色之外加的一个：今天卡片里的井、提示、骨架都读 `radius`（`radius.inset`），它不是 `overlay`，也不是 `card`，不另立一个角色就只能把它们塞进别的角色里。shadcn 与 solid-glass 的 `shape` 圆角由各自 `theme.json` 的三个半径推出：`control` 和 `field` 取 `radius-control`，`card`、`dialog`、`sheet` 取 `radius-card`，`chip`、`overlay`、`inset` 取 `radius`（`withRadii`，`generate-*.ts` 用它）。`corners.sheet` 与同心圆角（`rounded()` 的 `inset` 参数，见 §4）是后续的事。

#### size：触控目标、密度、控件、控件高度

| 键                    | 含义                                 | default（pointer / touch） | Apple                         | Material     | Fluent       |
| --------------------- | ------------------------------------ | -------------------------- | ----------------------------- | ------------ | ------------ |
| `hit`                 | 最小触控目标；0 是不补               | 0 / 44                     | 0 / 44                        | 48 / 48      | 40 / 40      |
| `density.row`         | 页面里一行的最小高                   | 36 / 48                    | 待核对                        | 待核对       | 待核对       |
| `density.pad`         | 卡片内边距                           | 14 / 16                    | 待核对                        | 待核对       | 待核对       |
| `density.gap`         | 内容之间的间距                       | 12 / 12                    | 待核对                        | 待核对       | 待核对       |
| `density.surface`     | 区块面的圆角                         | 10 / 16                    | 待核对                        | 待核对       | 待核对       |
| `control.row`         | 可按行的最小高                       | 40 / 44                    | 待核对                        | 约 48        | 约 32        |
| `control.padding`     | 行的上下内边距                       | 6 / 8                      | 待核对                        | 待核对       | 待核对       |
| `control.gap`         | 行内元素间距                         | 10 / 12                    | 待核对                        | 待核对       | 待核对       |
| `control.control`     | 复选框、单选框的边长                 | 16 / 22                    | 待核对                        | 18           | 20           |
| `control.corner`      | 复选框的圆角                         | 5 / 7                      | 待核对                        | 2            | 4            |
| `control.check`       | 勾和图标的大小                       | 12 / 16                    | 待核对                        | 待核对       | 待核对       |
| `control.dot`         | 单选框的点                           | 6 / 8                      | 待核对                        | 待核对       | 待核对       |
| `control.tabs`        | 标签栏高                             | 30 / 40                    | 待核对                        | 约 48        | 约 32        |
| `control.line`        | 一行值的高                           | 32 / 44                    | 待核对                        | 待核对       | 待核对       |
| `control.clear`       | 清除按钮的边长                       | 16 / 20                    | 待核对                        | 待核对       | 待核对       |
| `control.switch`      | 行旁开关的尺寸：`small` 或 `regular` | small / regular            | regular                       | regular      | small        |
| `height.sm / md / lg` | 按钮高                               | 24 / 28 / 34；36 / 40 / 48 | macOS 约 20 / 24 / 28；iOS 44 | 32 / 40 / 56 | 24 / 32 / 40 |

`density` 和 `control` 的 pointer / touch 两档就是原来的 `density` 与 `controlSize`；它们的 `label`、`detail`、`title`、`note`、`body` 已改读 `type`。三个平台的 `density` 与 `control` 数值方案没有给，第 3 期做主题时核对。

#### stroke 与 focus

| 键                 | 含义                                                    | default | Apple      | Material | Fluent         |
| ------------------ | ------------------------------------------------------- | ------- | ---------- | -------- | -------------- |
| `stroke.hairline`  | 发丝线                                                  | 1       | 1 物理像素 | 1        | 1              |
| `stroke.control`   | 控件描边                                                | 1       | 1          | 1        | 1              |
| `stroke.focus`     | 焦点环线宽（参考，读 `focus.width`）                    | 3       | 3          | 3        | 2              |
| `stroke.indicator` | 指示条线宽                                              | 2       | —          | 3        | 3              |
| `focus.style`      | 焦点环样式：`halo`（强调色光晕）、`outline`（实线外框） | halo    | halo       | outline  | double（见下） |
| `focus.width`      | 焦点环宽                                                | 3       | 3          | 3        | 2              |
| `focus.offset`     | 焦点环离边多远（`focusRing(offset)` 不传时用它）        | 0       | 0          | 2        | 0              |

`focus.style` 白名单现在只有 `halo` 与 `outline`，是代码已经画得出的两种；Fluent 的双线（外 2 内 1）要在第 3 期随绘制代码一起加进白名单。`stroke.focus` 和 `focus.width` 的关系待第 1b 期并成一个。

#### state

| 键                   | 含义                                  | default | Apple            | Material        | Fluent           |
| -------------------- | ------------------------------------- | ------- | ---------------- | --------------- | ---------------- |
| `overlay.hover`      | 悬停叠色的透明度                      | 0       | 0                | 0.08            | 0                |
| `overlay.focus`      | 聚焦叠色                              | 0       | 0                | 0.10            | 0                |
| `overlay.pressed`    | 按下叠色                              | 0       | 0                | 0.10            | 0                |
| `overlay.dragged`    | 拖动叠色                              | 0       | 0                | 0.16            | 0                |
| `ripple`             | 按下是否有水波（接 `android.ripple`） | false   | false            | true            | false            |
| `pressedOpacity`     | 按下时整体变淡到多少                  | 0.7     | 约 0.7           | 1（用叠色表达） | 约 0.8           |
| `disabled.content`   | 禁用时内容的透明度                    | 0.5     | 约 0.3（待核对） | 0.38            | 约 0.4（待核对） |
| `disabled.container` | 禁用时容器的透明度                    | 0.5     | 约 0.3（待核对） | 0.12            | 约 0.4（待核对） |

default 与 shadcn、solid-glass 的叠色全是 0：它们的悬停与按下继续由 `hover` / `pressed` 两个 finish 表达（"换面"）；原生主题用叠色表达（见决策 3）。禁用与强调色的悬停、按下都不加颜色 token，由透明度推出（见决策 2）。

#### motion

| 键               | 含义                                            | default                   | Apple      | Material                             | Fluent                         |
| ---------------- | ----------------------------------------------- | ------------------------- | ---------- | ------------------------------------ | ------------------------------ |
| `press`          | 按下（弹簧）                                    | stiffness 520，damping 34 | 同 default | 待核对（expressive 的 spatial 弹簧） | 时长曲线，约 100 ms（第 3 期） |
| `settle`         | 落定（弹簧）                                    | 320，30                   | 同 default | 待核对                               | 约 150 ms（第 3 期）           |
| `control`        | 控件的标记、填充出入（弹簧）                    | 1218，70                  | 同 default | 待核对                               | 约 100 ms（第 3 期）           |
| `move`           | 拇指、指示条的移动（弹簧）                      | 504，38                   | 同 default | 待核对                               | 约 200 ms（第 3 期）           |
| `enter.duration` | 浮层出现的时长                                  | 420 ms                    | 约         | 约 400（待核对）                     | 约 200（待核对）               |
| `enter.easing`   | 曲线名：`out-cubic`、`in-cubic`、`in-out-cubic` | out-cubic                 | —          | 待核对（emphasized）                 | 待核对（decelerate）           |
| `shake.duration` | 拒绝值的横向抖动，对齐 `play("shake")`          | 500 ms                    | 同 default | 同 default                           | 同 default                     |

`press`、`settle`、`control`、`move` 现在只能写弹簧（`{ stiffness, damping }`），`follow()` 与 `motion.move` 的调用形状不变，弹簧在每次起跳时读当前主题，所以先建的控件也跟着换。Fluent 基本只用时长加曲线（50–500 ms 八档）：第 3 期把角色扩成"弹簧或时长曲线"二选一（`{ spring }` / `{ timing }`），并把曲线名的白名单加到 decelerate、accelerate 等。`exit`、`enter` 的起点（从哪变来）同属第 3 期。

#### icon

| 键                  | 含义     | default（pointer / touch） | Apple    | Material          | Fluent       |
| ------------------- | -------- | -------------------------- | -------- | ----------------- | ------------ |
| `size.sm / md / lg` | 图标尺寸 | 12 / 14 / 15；14 / 16 / 18 | 跟随字号 | 18 / 24（待核对） | 16 / 20 / 24 |

描边粗细（`weight`）待查 NSH 的图标能否取，查清再加。**换哪套图标不进主题**：SF Symbols、Material Symbols、Fluent Icons 的图标名不同，换图标集属于应用层或另一个 registry 条目。

#### indicator：外观枚举（白名单）

| 键      | 取值                 | default | Apple | Material                                                  | Fluent    |
| ------- | -------------------- | ------- | ----- | --------------------------------------------------------- | --------- |
| `tabs`  | `underline` / `pill` | pill    | pill  | underline                                                 | underline |
| `nav`   | `fill` / `bar`       | fill    | fill  | fill                                                      | bar       |
| `field` | `box` / `underline`  | box     | box   | box（filled 的底线由 `shape.corners.field` 与 finish 画） | underline |

只收组件已经支持、或者改起来很便宜的外观；每加一项都要过评审（决策 4）。

### 3.3 平台材质：finish 新增 `material` 字段

```jsonc
"glass": {
  "backgroundColor": "var(--glass)",
  "backdropFilter": "blur(24px)",          // 回落值，所有平台都用得上
  "borderColor": "var(--glass-edge)",
  "boxShadow": "…",
  "material": {
    "apple":   { "glass": "regular", "tint": "var(--glass)" },  // → glassEffect、glassTintColor
    "ios":     { "backdrop": "thin" },                           // → ios.backdropMaterial（26 之前）
    "macos":   { "backdrop": "menu", "blending": "behindWindow" },
    "windows": { "backdrop": "blur" }
  }
}
```

- `themed()` 读 finish 时，把 `material` 翻译成 NSH 的 style 和平台 prop：`glassEffect` 和 `glassTintColor` 放进 style；`ios`、`macos`、`windows` 作为单独的 props 一并返回。
- 用 finish 的组件需要多铺开一组 props。这是第 2 期里唯一要改组件的地方。
- 遵守"形状固定"：所有主题、所有 finish 都写 `material`，不用材质的写 `null`。
- 先接四个浮层或半透明的 finish：`glass`、`menu`、`card`（侧栏和面板）、`raised`（Apple 的玻璃按钮）。

### 3.4 按平台自动选主题

- 新增 `themes/native/index.ts`，导出 `nativeTheme()`，按 `platform.os` 返回 apple、material 或 fluent 主题。按 NSH 兼容性规定，`switch` 要写 `default` 分支，回落到 default 主题。
- 不新增 `selectTheme("auto")` 这种别名，应用自己调用 `selectTheme(nativeTheme())`。
- `init` 的风格选择里加一项 "Native (per platform)"，等于同时复制三套主题和 `native/index.ts`。

### 3.5 三套原生主题

| 主题 id    | 颜色                                                   | 质感与材质                                                 | 风格（finishes 顶层）                                                                                                                |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apple`    | 系统中性灰，强调色用系统蓝（读不到系统强调色，先写死） | `glass`、`menu`、`raised` 用 Liquid Glass；其余平涂加细边  | 系统字体，`rounded` 关；控件 `capsule`；continuous 曲率；同心圆角；iOS 正文 17、macOS 13                                             |
| `material` | M3 基线色（tonal roles 映射到我们的 31 个槽位加扩展）  | 平涂，阴影按层级；不用模糊                                 | 系统字体（Roboto）；圆角 xs–xl 用 M3 档位；控件 `capsule`；触控 48；`state` 用 8 / 10 / 10 叠色，`ripple` 开；动效用 expressive 弹簧 |
| `fluent`   | Fluent 中性灰，强调色用 Windows 默认蓝                 | 卡片平涂；`menu`、`glass` 接 Acrylic（`windows.backdrop`） | 系统字体（Segoe UI Variable）；控件 `rounded` 4、弹层 8；circular 曲率；控件高 32；动效更克制                                        |

## 4 主题做不到的部分

### B 类：组件结构（本库按组件逐项决定）

按 [shadcn 先行](../../AGENTS.md)的原则：shadcn 有对应 API 的才在组件里做，其余在文档里给应用写配方。

| 平台     | 结构                                 | 建议                                                                                                   |
| -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Material | Switch 拇指里的图标                  | `Switch` 加 `thumbIcon` 槽位，主题不管                                                                 |
| Material | 分段按钮                             | 用 `ToggleGroup` 加 `variant="outline"` 拼出来，写配方                                                 |
| Material | FAB、docked toolbar                  | 应用层组合，写配方                                                                                     |
| Material | 形状变化（按下时改变形状）           | 需要能动画的圆角。先查 NSH 能不能对 `borderRadius` 做动画；能就作为 `state` 的一项，不能就记成上游缺口 |
| Fluent   | 输入框底部强调线                     | `field` finish 用 `boxShadow` 画内阴影底线，focus 时换成强调色，主题能做到，不加结构                   |
| Fluent   | 侧栏和标签页的选中指示条             | `Sidebar` 和 `Tabs` 已有指示器，改由 `finishes.json` 加一项指示条样式（bar / fill）控制                |
| Apple    | 滚动时边缘效果、浮动工具栏、侧栏铺满 | 属于应用和窗口层，写配方                                                                               |
| Apple    | 同心圆角                             | `rounded()` 加一个可选参数 `inset`，内圆角 = 外圆角 − inset                                            |

### C 类：NSH 平台能力（向上游提 issue，不阻塞本方案）

| #   | 缺口                                                          | 影响                             |
| --- | ------------------------------------------------------------- | -------------------------------- |
| C1  | 读系统强调色（macOS、Windows、Material You 动态取色）         | 三套原生主题的强调色只能先写死   |
| C2  | 减少透明度、增强对比度两个信号；Liquid Glass 透明度滑杆的状态 | 主题无法在用户关掉透明时换成实底 |
| C3  | Windows 不透明窗口里的 Mica                                   | `fluent` 主题的窗口底只能平涂    |
| C4  | Android 上的玻璃和模糊材质（若 Android 17 开放）              | `material` 主题无法跟上          |
| C5  | `borderRadius` 动画（如果查下来不支持）                       | Material 的形状变化做不了        |

## 5 分期与验收

```
第 1 期 写死的数挪进主题 ──► 第 2 期 平台材质 + 自动选主题 ──► 第 3 期 三套原生主题
        (纯重构，画面不变)          (apple 先行)                  (material、fluent)
                    └──────────── C 类上游 issue 并行 ────────────┘
```

### 第 1 期：风格数据进 `finishes.json`（拆成两个 PR）

```
1a 数据、getter、lint、文档（不动组件，画面不变）──► 1b 组件读 type、shape、state、focus
```

#### 1a：数据、getter、lint、文档（#144）

内容：

- `finishes.json` 顶层新增 3.2 的九组风格数据：三套主题加上 `packages/theme/` 的构建时副本；`shadcn`、`solid-glass` 的生成脚本从 default 取风格并按各自半径写 `shape`；`Finishes` 类型跟着扩展。
- `density`、`controlSize`、`motion`、`cornerCurve`、`focusRing` 改为读当前主题的 getter，对外形状不变；新增 `style()` 读取当前风格。
- `theme-lint` 增加三项检查：每套主题的风格键集合相同、枚举取白名单、`shape` 与 `theme.json` 的圆角一致；单元测试含"删一个键，lint 点名"的反向测试。
- `theme-roles.md` 和 `GLOSSARY.md` 改 `finishes.json` 的定义，增加风格数据一节。

验收：

- `port:render` 和 `port:render:theme` 逐像素一致（不更新基线）。
- `bun run check`、`nsh check`（demos、showcase、gallery）、`bunx vp check`、`test:gallery`、`test:install` 全部通过。
- 反向测试：在一套主题里删掉一个风格键，`theme-lint` 要点名报错。
- 运行时切到一套改过风格数据的临时主题，已渲染的页面下一帧跟着变（`apps/gallery/tests/theme-style.test.tsx`）。

#### 1b：组件读取风格数据

- ✅ （第 1 部分，#154）组件里写死的 `fontSize`、`fontWeight`、`lineHeight` 改读 `type` 的角色，`type.*.line` 的初值同时对齐；`font-sans` 与 `type.family` 接上。没有角色对得上的字号（按钮档位的 12/13/14、标题的 17/20、Tailwind 的 `text-sm` 类等）留在代码里，各处注明原因。验收：`port:render` 与 `port:render:theme` 逐像素不变，`apps/gallery/tests/theme-type.test.tsx` 切到临时主题后字号与字重下一帧跟着变。
- 圆角改读 `shape` 的角色（`dialog`、`sheet`、`overlay`、`chip`、`field`），不再只有 `radius.*` 三档；`rounded()` 加 `inset` 参数（同心圆角）。
- `state`（叠色、`pressedOpacity`、`disabled`）和 `focus`、`stroke` 接到组件，`stroke.focus` 与 `focus.width` 并成一个；`icon.size`、`size.height`、`size.hit` 取代按钮与图标里的同名常量。
- 验收同 1a，画面仍逐像素一致。

### 第 2 期：平台材质与 `nativeTheme()`（一个 PR）

内容：

- finish 增加 `material` 字段，`themed()` 负责翻译。
- 用到 `glass`、`menu`、`card`、`raised` 的组件铺开平台 props。
- 新增 `themes/native` 和 `apple` 主题。
- 新增颜色 token：`on-brand-tint`（强调淡底上的字）、`inverse`、`inverse-foreground`，以及可能的 `inverse-brand`（snackbar 的操作按钮）。`on-media`（照片上的白字）和 `chart-foreground`（浅色图块上的深字）已经在 C 层，名字以 `theme-roles.md` 为准，这里不再另起。新增 finish：`dialog`、`tooltip`、`inverse`；先查清现在 dialog、tooltip、toast 借用的是哪个 finish，三个平台在这里本来就不同的才拆开。

验收：

- 已有三套主题的 `material` 全为 `null`，画面逐像素不变。
- 在 macOS 26+ 上运行演示：菜单和弹层是 Liquid Glass，截图人眼看过。
- 在 iOS 上用 `nsh test --target ios` 截图。
- 低于 26 的系统和非 Apple 平台回落到模糊。

### 第 3 期：`material` 与 `fluent` 主题（各一个 PR）

内容：

- 先回官方 token 文件核对第 1 节的数值，写回本文。
- 做两套主题；B 类里定为"组件做"的结构逐项开 issue。

验收：

- 每个组件演示在对应平台截图，和官方组件并排比对，差异写进主题的 README。
- 文档站主题下拉可以切到这两套。

### 并行：C 类

C1–C5 各开一个上游 issue，链接记在本节。

## 6 待决定

### 已决定

| #   | 问题                                                     | 决定                                                                                            | 理由                                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 形状和字号按用途角色命名，还是按通用档位                 | **按用途角色**（`card`、`dialog`、`control`…）                                                  | 三个平台的差别是"哪种部件用多大圆角"，不是一把统一的尺子；按档位命名，每个组件还得各自记一张"我用哪档"的表。`theme.json` 保留 `radius`、`radius-card`、`radius-control`（NSH 的 `token()` 和 `rounded-*` 类读它们），`check:theme` 保证它们等于 `shape.inset`、`shape.card`、`shape.control`。 |
| 2   | 禁用、强调色的悬停与按下加颜色 token，还是用透明度推出来 | **用透明度**（`state`）                                                                         | 三个平台本质上都是对同一个颜色调透明度；加 token 是每套主题多写约 10 个值，且容易写得不一致。                                                                                                                                                                                                  |
| 3   | 悬停与按下继续"换 finish"，还是统一改成叠色              | **两种并存，主题自己选**                                                                        | 统一改成叠色会改动 default 的画面。default、shadcn、solid-glass 的叠色全是 0；Material 用叠色。                                                                                                                                                                                                |
| 4   | 外观枚举（`indicator`）开不开                            | **开，只用白名单**：`tabs`（underline / pill）、`nav`（fill / bar）、`field`（box / underline） | 不开则 Fluent、Material 的输入框和标签页画不像；全放开会让主题变成第二套组件 API。                                                                                                                                                                                                             |
| 5   | 第 1 期是否顺带统一组件里散落的 `fontSize`               | **是，放在 1b**                                                                                 | 不统一的话字号层级形同虚设；改动面大，所以和数据分开一个 PR。                                                                                                                                                                                                                                  |

### 仍待决定

| 问题                                                                               | 建议   | 理由                                     |
| ---------------------------------------------------------------------------------- | ------ | ---------------------------------------- |
| 原生主题是否进 registry，作为 `theme-apple`、`theme-material`、`theme-fluent` 发布 | 进     | 和 `theme-shadcn` 一致，复制后归应用所有 |
| 原生主题的强调色是写死，还是等 C1                                                  | 先写死 | 不阻塞；C1 落地后改成读系统值            |
| 尺寸能否和面分开选（只换尺寸不换面）                                               | 暂不   | 先按"一个主题是一套整体"处理，以后再拆   |

## 来源

**Apple**

- [MacRumors：iOS 27 里 Liquid Glass 的变化](https://www.macrumors.com/2026/06/10/how-liquid-glass-is-changing-in-ios-27/)
- [Cult of Mac：iOS 27 / macOS 27 的 Liquid Glass 变化](https://www.cultofmac.com/news/liquid-glass-changes-ios-27-macos-27)
- [Wikipedia：Liquid Glass](https://en.wikipedia.org/wiki/Liquid_Glass)

**Android**

- [Material Design：What's new at I/O 2026](https://m3.material.io/blog/whats-new-at-io26)
- [Google：Material 3 Expressive 发布](https://blog.google/products/android/material-3-expressive-android-wearos-launch/)

**Windows**

- [Wikipedia：Fluent Design System](https://en.wikipedia.org/wiki/Fluent_Design_System)
- [Fluent 2 Design Tokens](https://fluent2.microsoft.design/design-tokens)

**NSH**

- 本地文档：`references/nsh/website/docs/styling.md`（glassEffect、backdrop）、`macos.md`、`android.md`、`design-guides.md`
