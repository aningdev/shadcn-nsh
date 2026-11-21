# 原生外观主题：Apple、Material、Fluent

本文是方案：目标是**先只用主题数据**，让本库组件分别画出 Apple（Liquid Glass）、Android（Material 3 Expressive）和 Windows（Fluent 2）的外观；同时写清楚主题做不到的部分，以及每一期的验收标准。

它承接 [`positioning.md`](positioning.md) 的差异点 1（多风格 × 主题色），沿用 [`design-semantics.md`](design-semantics.md) 与 [`theme-roles.md`](theme-roles.md) 的规则（基础 token、语义层 `{token}` 引用、形状固定）。调研截止 2026-11。

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

| 平台                     | 只用现有主题 | 做完第 1–3 期 | 剩下的缺口                                                            |
| ------------------------ | ------------ | ------------- | --------------------------------------------------------------------- |
| Apple iOS / macOS 27     | 约 4 成      | 约 8 成       | 跟随系统强调色、透明度滑杆、减少透明度、增强对比度                    |
| Android（M3 Expressive） | 约 3 成      | 约 7 成       | 动态取色、形状变化、Switch 拇指图标、FAB 等组件结构                   |
| Windows 11（Fluent 2）   | 约 5 成      | 约 8 成       | 系统强调色、输入框底部强调线（Mica 是应用的窗口 `backdrop`，见 C 类） |

## 1 三个平台的设计语言

### 1.1 Apple：Liquid Glass（iOS 27 / iPadOS 27 / macOS 27）

| 方面 | 要点                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 材质 | 默认更不透明、背后内容更模糊、玻璃外圈加一道压暗的边、高光更亮、折射更均匀；设置里新增透明度滑杆（从极透到全着色）；遵循"减少透明度"和"增强对比度"；不能再用 `UIDesignRequiresCompatibility` 退出 |
| 形状 | 控件以胶囊形为主；圆角与容器同心（内圆角 = 外圆角 − 间距）；连续曲率（`borderCurve: continuous`）；macOS 27 所有窗口统一成一个更紧的圆角                                                          |
| 结构 | 内容滚到浮动栏下面时，顶部出现统一的工具栏；侧栏铺满窗口边缘；macOS / iPadOS 新增菜单项图标 API（默认隐藏）                                                                                       |
| 字体 | 系统字体 SF Pro；正文 iOS 17pt、macOS 13pt；Dynamic Type                                                                                                                                          |
| 尺寸 | iOS 触控目标 44pt；macOS 控件 24–32pt，行高 28–36（NSH 设计指南）                                                                                                                                 |

### 1.2 Android：Material 3 Expressive（2025 年发布，2026 年 I/O 扩展；已核对）

核对基线（2026-11-21）：[`material-components/material-web`](https://github.com/material-components/material-web/tree/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass) `v34.0.21`（`a0bab1d`）、[`androidx/androidx` Compose Material 3](https://github.com/androidx/androidx/tree/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens) `1.5.0` / `1.6.0-alpha01`（`ac364f3`）、[`material-color-utilities`](https://github.com/material-foundation/material-color-utilities/tree/dca2d34221e4a56f90e05ef3223481183ebd1d5d/typescript/dynamiccolor)（`dca2d34`）与 [m3.material.io](https://m3.material.io/sitemap.xml)。

| 方面       | 要点                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 颜色       | 动态取色（Material You）；基线静态种子 `#6750A4`，用色调角色（`primary` / `secondary` / `tertiary` / `surface` / `surface-container-lowest..highest` / `inverse-*`）；M3 Expressive 将浅色模式 `on*Container` 调至 **Tone 30**（[`ColorScheme.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ColorScheme.kt)、[`_md-sys-color.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-color.scss)）                                                                                                                                                                                                                                                                                                                                          |
| 形状       | 圆角从 `none`（0）到 `extra-small`（4dp）、`small`（8dp）、`medium`（12dp）、`large`（16dp）、`extra-large`（28dp）到 `full`（胶囊）（[`ShapeTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt)）；Expressive Chip 未选中态为 12dp（[`ChipsTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ChipsTokens.kt)）；Filled TextField 仅圆顶部两角（4dp）；圆形曲线（`circular`）；支持按下/选中形状变化（shape morphing）                                                                                                                                                                                                                                                  |
| 字体       | 系统字体 Roboto（`FontFamily.SansSerif`，[`TypefaceTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypefaceTokens.kt)）；基础字阶外新增 emphasized 字号/字重（[`TypeScaleTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt)、[`_md-sys-typescale-emphasized.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-typescale-emphasized.scss)）                                                                                                                                                                                                                            |
| 动效       | 弹簧动效分 `standard` 与 `expressive` 两套方案，每套含 `spatial`（`FastSpatial` k=800/ζ=0.6、`DefaultSpatial` k=380/ζ=0.8）与 `effects`（`DefaultEffects` k=1600/ζ=1.0）弹簧（[`ExpressiveMotionTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt)）；时序曲线 `emphasized-decelerate`、`DurationLong2 = 500ms`（[`_md-sys-motion.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-motion.scss)）                                                                                                                                                                                                                                                                                                |
| 状态       | 状态层：hover `0.08`、focus `0.10`、pressed `0.10`、dragged `0.16`（[`StateTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StateTokens.kt)、[`_md-sys-state.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-state.scss)）；禁用内容 `0.38`、按钮容器 `0.10`（[`_md-comp-button-filled.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-comp-button-filled.scss)）；按压开 ripple；焦点指示器 3dp 实线外框、偏移 2dp（[`_md-sys-state-focus-indicator.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-state-focus-indicator.scss)） |
| 布局与海拔 | 8dp 间距体系；阴影分 Level 0–3（[`_elevation.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/elevation/internal/_elevation.scss)，Level 1=1dp、Level 2=3dp、Level 3=6dp [`ElevationTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ElevationTokens.kt)）；不使用毛玻璃模糊；底部应用栏由 docked toolbar 替代（[m3.material.io](https://m3.material.io/blog/whats-new-at-io26)）                                                                                                                                                                                                                                                                                                                                                                             |
| 尺寸       | 触控目标 48dp（[`InteractiveComponentSize.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/InteractiveComponentSize.kt)）、桌面指针目标 44dp（[M3 Desktop Components](https://m3.material.io/foundations/desktop/components)）；按钮高度 XSmall 32 / Small 40 / Medium 56dp；单行列表项 56dp（[`ListTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ListTokens.kt)）                                                                                                                                                                                                                                                                                                                             |

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

> 上面 Fluent 的具体数值来自公开的 token 规范概要。第 3 期做 `fluent` 主题之前，要回官方 token 文件逐项核对，核对结果写回本节；Material 3 Expressive 已回官方 token 文件逐项核对并写回本节与 §3.2。

## 2 现状：哪些已是数据，哪些写死在代码里

下表是第 1b 期做完之后的状态：风格数据在 `finishes.json`，组件经 getter 读它（字号、圆角、线宽、状态、尺寸）；Tailwind 类里写死的值（`text-sm`、`rounded-(--radius-control)`、`active:opacity-70`）读不了 getter，留在代码里。

| 维度     | 现在在哪                                                                                                                                                                                                                                                                                                                                                                  | 能否随主题切换                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 颜色     | `theme.json`：shadcn 的 31 个槽位加本库扩展                                                                                                                                                                                                                                                                                                                               | ✅                                                       |
| 质感     | `finishes.json`：20 个 finish，字段有 bg / image / border / shadow / backdropFilter，还有 `press.scale`                                                                                                                                                                                                                                                                   | ✅                                                       |
| 圆角     | `finishes.json` 的 `shape` 按角色写；组件经 `theme.ts` 的 `shape` 读，`rounded(radius, inset)` 取同心圆角；`theme.json` 的三档留给 `token()` 与 Tailwind 的 `rounded-*` 类（1b）                                                                                                                                                                                          | ✅ 8 个角色                                              |
| 曲率     | `finishes.json` 的 `shape.curve`，`theme.ts` 的 `cornerCurve` 读它                                                                                                                                                                                                                                                                                                        | ✅                                                       |
| 字体     | `finishes.json` 的 `type`；组件经 `font.size / weight / line / tracking` 读角色，`type.family` 经 `selectTheme` 写进 `font-sans`（1b 第 1 部分）                                                                                                                                                                                                                          | ✅ 角色没有对得上的字号留在代码里（见 `theme-roles.md`） |
| 页面密度 | `finishes.json` 的 `size.density`，`surface.tsx` 的 `density` 读它，按 pointer / touch 两档                                                                                                                                                                                                                                                                               | ✅                                                       |
| 控件尺寸 | `finishes.json` 的 `size.control`，`surface.tsx` 的 `controlSize` 读它；terminal 档留在代码里                                                                                                                                                                                                                                                                             | ✅                                                       |
| 动效     | `finishes.json` 的 `motion`，`theme.ts` 的 `motion` 读它：press、settle、control、move、enter、shake                                                                                                                                                                                                                                                                      | ✅                                                       |
| 平台材质 | `finishes.json` 每个 finish 的 `material`（`null` 或 `apple` / `ios` / `macos` / `windows`）；`themed()` 把 `apple` 翻成 style 里的 `glassEffect`、`glassTintColor`，`theme.ts` 的 `platformMaterial(role)` 给出 `ios`、`macos`、`windows` props，用到 `glass`、`menu`、`raised` 的浮层与玻璃按钮已经铺开（2a，#199）。`android.ripple` 不属于 finish，留给 material 主题 | ✅ 数据与接线已有，三套现有主题全为 `null`               |
| 主题选择 | `selectTheme(AppTheme)` 只能手动选；`AppTheme` 是 `{ id, label, theme, finishes }`                                                                                                                                                                                                                                                                                        | ❌ 不会按平台自动选                                      |

**NSH 已经提供的平台能力**（`references/nsh/website/docs/styling.md` 等）：

- Apple：`glassEffect: "regular" | "clear"` 和 `glassTintColor`，iOS / macOS 26 及以上可用，其他平台回落到 `backdropFilter`；`ios={{ backdropMaterial }}`；`macos={{ backdrop: { material, blending, state } }}`。
- Windows：`windows={{ backdrop: { material: "blur" } }}`，Windows 11，透明窗口里才看得到。
- Android：`android={{ ripple }}`；API 31 起支持 `backdropFilter` 模糊。
- 通用：`borderCurve`、系统字体、`fontFamily` 列表、`registerFont`、`fontScale()`、`colorScheme()`、减少动态效果、`platform.os`。

**NSH 没有的**：读系统强调色、动态取色、减少透明度和增强对比度的信号。（Mica 不在其中：它是窗口的 `backdrop`，应用在 `nsh.json` 里设；Android 的模糊与 `borderRadius` 过渡 NSH 都支持，见 C 类。）

## 3 设计

### 3.1 主题仍是两个文件：基础 token 层与跨平台语义层

```
packages/theme/themes/<id>/
  theme.json      基础 token：颜色、8 个圆角、字体                （NSH setTheme 读取）
  semantics.json  语义层：风格数据 + finishes（shared + 稀疏覆盖） （本库读取）
  index.ts        AppTheme { id, label, theme, semantics }
```

两文件的分层判定规则、 `{token}` 引用语法与 DTCG 2025.10 映射见 [`design-semantics.md`](design-semantics.md)。全部 8 个圆角与可选 `font-sans` 统一定义在 `theme.json`；`semantics.json` 的 `shape.*` 与 `type.family` 以 `{token}` 引用它们，`finishes` 拆为 `shared` 与稀疏 `light`/`dark` 覆写，按压缩放归入 `state.pressScale`。

### 3.2 `semantics.json` 的风格键表

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

| 角色（用在）                   | default（pointer / touch） | Apple（macOS / iOS）       | Material（已核对，M3 baseline）          | Fluent       |
| ------------------------------ | -------------------------- | -------------------------- | ---------------------------------------- | ------------ |
| `caption`（徽标、时间戳）      | 11 / 12                    | 10 / 12（行 13 / 16）      | label-small 11（行 16，500，字距 0.5）   | caption1 12  |
| `detail`（描述、次要信息）     | 12 / 13                    | 11 / 13（行 14 / 18）      | body-small 12（行 16，400，字距 0.4）    | caption1 12  |
| `body`（正文）                 | 13 / 15                    | 13 / 17（行 16 / 22）      | body-medium 14（行 20，400，字距 0.25）  | body1 14     |
| `label`（控件上的字，500）     | 14 / 15                    | 13 / 17（行 16 / 22）      | label-large 14（行 20，500，字距 0.1）   | body1 14     |
| `title`（卡片、区块标题，600） | 13 / 13                    | 13 / 17（600，行 16 / 22） | title-medium 16（行 24，500，字距 0.15） | subtitle2 16 |
| `headline`（页面标题）         | 20 / 22                    | 22 / 22（行 26 / 28）      | headline-small 24（行 32，400，字距 0）  | title3 24    |
| `display`（大数字）            | 26 / 28                    | 26 / 34（行 32 / 41）      | display-small 36（行 44，400，字距 0）   | title1 32    |

`line` 在 default 里是按现有正文行高（13 配 19、15 配 21）推出的初值，第 1b 期把散在组件里的 `lineHeight` 搬上来时逐项对齐；Apple 与 Material 的字阶、行高、字重、字距均已核对；Fluent 的仍待核对。

**Material 的核对（第 3 期）。** 来源为 [`TypeScaleTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt) 与 [`_md-sys-typescale.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-typescale.scss)（`v34.0.21`）：字重采用 Compose 基线（`caption` / `label` / `title` 为 `"500"`，`detail` / `body` / `headline` / `display` 为 `"400"`）；M3 未发布独立的桌面字阶，pointer 档保持与 touch 一致；`type.family` 为 `null`（系统无衬线字体 Roboto，[`TypefaceTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypefaceTokens.kt)）。

**Apple 的核对（2b）。** 来源是 HIG 的 [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) 内置文字样式表：macOS 的 body 13 点（行 16）、callout / caption 11 点（行 14）、caption 2 的 10 点（行 13）；iOS 的 body 17 点（行 22）、subheadline 15、footnote 13（行 18）、caption 1 12（行 16）、title 2 22（行 28）、large title 34（行 41）。`caption`、`detail`、`body`、`display` 取这些档；`title` 取 body 的字号加 semibold，不用原表的 700，因为 SF 的 600 与 body 同行高，列表里不会撑行。`tracking` 取 0：SF 的字距随光学尺寸由系统字体内置（`SF Pro` 的 Text / Display 光学尺寸自动切换），应用不再补，所以主题写 0，不写表里每个字号的 tracking。`weight` 在 default 里：`label` 500，`title`、`headline`、`display` 600，其余 400。`family`：default 与三个平台都是 `null`（SF、Roboto、Segoe UI Variable 就是各自的系统字）。

#### shape：8 个圆角角色加两个枚举

圆角单位是点。`shape.control`、`shape.card`、`shape.inset` **就是** `theme.json` 的 `radius-control`、`radius-card`、`radius`（见决策 1 与 [`theme-roles.md`](theme-roles.md)）。

| 键              | 用在                                 | default                 | Apple                                                       | Material（已核对）                                                                                                                                                                                                                                                         | Fluent   |
| --------------- | ------------------------------------ | ----------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `control`       | 按钮、选择器触发、标签、菜单项       | 8（= `radius-control`） | 胶囊（999）                                                 | 999（`CornerFull`，[`ButtonSmallTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ButtonSmallTokens.kt)）                                 | 4        |
| `field`         | 输入框                               | 8                       | 8                                                           | 4（`CornerExtraSmall`，[`FilledTextFieldTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/FilledTextFieldTokens.kt)）                     | 4        |
| `chip`          | 徽标、标签                           | 10                      | 胶囊（999）                                                 | 12（Expressive `CornerMedium`，[`ChipsTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ChipsTokens.kt)）                                 | 4        |
| `card`          | 卡片、侧栏浮层                       | 14（= `radius-card`）   | 20                                                          | 12（`CornerMedium`，[`ElevatedCardTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ElevatedCardTokens.kt)）                              | 8        |
| `overlay`       | 菜单、弹出层                         | 10                      | 12                                                          | 4（`CornerExtraSmall`，[`MenuTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/MenuTokens.kt)）                                           | 8        |
| `dialog`        | 对话框                               | 14                      | 26                                                          | 28（`CornerExtraLarge`，[`DialogTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DialogTokens.kt)）                                      | 8        |
| `sheet`         | 抽屉                                 | 14                      | 34（与屏幕圆角同心的一档，iPhone 屏角约 55 点，边距 21 点） | 28（`CornerExtraLargeTop`，[`SheetBottomTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SheetBottomTokens.kt)）                         | 8        |
| `inset`         | 卡片里的井、提示、骨架               | 10（= `radius`）        | 8（= `radius`）                                             | 8（`CornerSmall`，无专用 token，取与 `card` 12dp 同心内缩 4dp，[`ShapeTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt)） | 待核对   |
| `curve`         | 角的曲线：`continuous` 或 `circular` | continuous              | continuous                                                  | circular（[`ShapeTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt)）                                                      | circular |
| `corners.field` | 输入框圆哪几个角：`all` 或 `top`     | all                     | all                                                         | top（`FilledTextFieldTokens` `CornerExtraSmallTop`）                                                                                                                                                                                                                       | all      |

`inset` 是本表在方案的七个角色之外加的一个：今天卡片里的井、提示、骨架都读 `radius`（`radius.inset`），它不是 `overlay`，也不是 `card`，不另立一个角色就只能把它们塞进别的角色里。shadcn 与 solid-glass 的 `shape` 圆角由各自 `theme.json` 的三个半径推出：`control` 和 `field` 取 `radius-control`，`card`、`dialog`、`sheet` 取 `radius-card`，`chip`、`overlay`、`inset` 取 `radius`（`withRadii`，`generate-*.ts` 用它）。同心圆角由 `rounded(radius, inset)` 的 `inset` 参数给（内圆角 = 外圆角 − inset，不小于 0）；`corners.sheet` 是后续的事。

#### size：触控目标、密度、控件、控件高度

| 键                    | 含义                                 | default（pointer / touch） | Apple                                | Material（pointer / touch）                                                                                                                                                                                                                                                                                                       | Fluent       |
| --------------------- | ------------------------------------ | -------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `hit`                 | 最小触控目标；0 是不补               | 0 / 44                     | 0 / 44                               | 44 / 48（[Desktop Components](https://m3.material.io/foundations/desktop/components)、[`InteractiveComponentSize.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/InteractiveComponentSize.kt)）              | 40 / 40      |
| `density.row`         | 页面里一行的最小高                   | 36 / 48                    | 32 / 44                              | 48 / 56（touch 取 [`ListTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ListTokens.kt)；pointer 按 [M3 Density](https://m3.material.io/foundations/layout/grids-spacing/density) `-2` 档推导） | 待核对       |
| `density.pad`         | 卡片内边距                           | 14 / 16                    | 14 / 16                              | 16 / 16（`ListTokens.ItemLeadingSpace = 16dp`）                                                                                                                                                                                                                                                                                   | 待核对       |
| `density.gap`         | 内容之间的间距                       | 12 / 12                    | 12 / 12                              | 12 / 12（`ListTokens.ItemBetweenSpace = 12dp`）                                                                                                                                                                                                                                                                                   | 待核对       |
| `density.surface`     | 区块面的圆角                         | 10 / 16                    | 12 / 20                              | 12 / 16（`CornerMedium` / `ListTokens.ContainerShape = CornerLarge`）                                                                                                                                                                                                                                                             | 待核对       |
| `control.row`         | 可按行的最小高                       | 40 / 44                    | 36 / 44                              | 48 / 56（touch 取 `ListTokens` 56dp；pointer `-2` 档）                                                                                                                                                                                                                                                                            | 约 32        |
| `control.padding`     | 行的上下内边距                       | 6 / 8                      | 6 / 8                                | 8 / 10（[`SegmentedMenuTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SegmentedMenuTokens.kt) / `ListTokens.ItemTopSpace`）                                                                   | 待核对       |
| `control.gap`         | 行内元素间距                         | 10 / 12                    | 10 / 12                              | 12 / 12（`ListTokens` 与 `SegmentedMenuTokens`）                                                                                                                                                                                                                                                                                  | 待核对       |
| `control.control`     | 复选框、单选框的边长                 | 16 / 22                    | 16 / 22                              | 18 / 18（[`CheckboxTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/CheckboxTokens.kt) `18dp`；Radio 外框 20dp）                                                                                | 20           |
| `control.corner`      | 复选框的圆角                         | 5 / 7                      | 4 / 11                               | 2 / 2（`CheckboxTokens.ContainerShape = 2dp`）                                                                                                                                                                                                                                                                                    | 4            |
| `control.check`       | 勾和图标的大小                       | 12 / 16                    | 12 / 16                              | 18 / 18（`CheckboxTokens.IconSize = 18dp`）                                                                                                                                                                                                                                                                                       | 待核对       |
| `control.dot`         | 单选框的点                           | 6 / 8                      | 6 / 8                                | 10 / 10（由 [`_md-comp-radio-button.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-comp-radio-button.scss) 20dp 外环内缩推导，无独立 token）                                                                                            | 待核对       |
| `control.tabs`        | 标签栏高                             | 30 / 40                    | 28 / 36                              | 48 / 48（[`PrimaryNavigationTabTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/PrimaryNavigationTabTokens.kt)）                                                                                | 约 32        |
| `control.line`        | 一行值的高                           | 32 / 44                    | 28 / 44                              | 48 / 56（touch 取 [`OutlinedTextFieldTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/OutlinedTextFieldTokens.kt) `56dp`；pointer `-2` 档）                                                     | 待核对       |
| `control.clear`       | 清除按钮的边长                       | 16 / 20                    | 16 / 20                              | 20 / 24（touch 对齐尾部图标 24dp；无独立 clear token）                                                                                                                                                                                                                                                                            | 待核对       |
| `control.switch`      | 行旁开关的尺寸：`small` 或 `regular` | small / regular            | regular                              | regular / regular（[`SwitchTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SwitchTokens.kt) `52×32dp`）                                                                                        | small        |
| `height.sm / md / lg` | 按钮高                               | 24 / 28 / 34；36 / 40 / 48 | macOS 24 / 28 / 32；iOS 32 / 44 / 50 | 32 / 40 / 56（两档共用，[`ButtonXSmallTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ButtonXSmallTokens.kt) / `Small` / `Medium`）                                                            | 24 / 32 / 40 |

`density` 和 `control` 的 pointer / touch 两档就是原来的 `density` 与 `controlSize`；它们的 `label`、`detail`、`title`、`note`、`body` 已改读 `type`。Apple 的数（第 2b 期）取自 HIG 的 [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) 与 [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)：触摸目标最小 44 点，macOS 的标准控件高约 28 点（small 24、large 32），iOS 按钮 44 点（大号 50）；`density.surface` 取与 `shape.card` 相邻的同心一档（pointer 12、touch 20）。Material 的数（第 3 期）已核对：无独立桌面数值的 pointer 密度按 M3 Density `-2` 档推导，其余取 Compose / Material Web tokens；Fluent 的数第 3 期做 `fluent` 主题时核对。

#### stroke 与 focus

| 键                 | 含义                                                                                  | default | Apple           | Material（已核对）                                                                                                                                                                                                                                                                                                                                                                                                                                  | Fluent |
| ------------------ | ------------------------------------------------------------------------------------- | ------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `stroke.hairline`  | 分隔线与描边变体的发丝线                                                              | 1       | 0.5（物理像素） | 1（[`DividerTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DividerTokens.kt)）                                                                                                                                                                                                                                  | 1      |
| `stroke.surface`   | 卡片、抽屉、浮层等表面的描边                                                          | 1       | 0.5             | 0（[`ElevatedCardTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ElevatedCardTokens.kt)、[`SheetBottomTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SheetBottomTokens.kt)） | 1      |
| `stroke.control`   | 控件描边                                                                              | 1       | 1               | 1（[`ButtonSmallTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ButtonSmallTokens.kt) `Outlined`)                                                                                                                                                                                                                | 1      |
| `stroke.indicator` | 指示条线宽                                                                            | 2       | —               | 3（[`PrimaryNavigationTabTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/PrimaryNavigationTabTokens.kt)）                                                                                                                                                                                                        | 3      |
| `focus.style`      | 焦点环样式：`halo`（强调色光晕）、`outline`（实线外框）、`double`（外实线内反色细边） | halo    | halo            | outline（[`focus-ring.md`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/docs/components/focus-ring.md)）                                                                                                                                                                                                                                                                                       | double |
| `focus.width`      | 焦点环宽                                                                              | 3       | 3               | 3（[`_md-sys-state-focus-indicator.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-state-focus-indicator.scss)）                                                                                                                                                                                                                                       | 2      |
| `focus.offset`     | 焦点环离边多远（`focusRing(offset)` 不传时用它）                                      | 0       | 0               | 2（[`_md-sys-state-focus-indicator.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-state-focus-indicator.scss)）                                                                                                                                                                                                                                       | 0      |

`focus.style` 白名单包含 `halo`、`outline` 与 `double`（#231）：`halo` 给边缘着色并绕 `ring-halo` 光晕，`outline` 只画 `ring` 外框而不改 `borderColor`，`double` 在边缘外先画一条 1 px 的 `ring-halo`（扩散阴影，聚焦时代替表面自己的阴影），`ring` 外框再往外让出这 1 px，对应 Fluent 2 的 `FocusStrokeColorOuter` / `FocusStrokeColorInner`。焦点环的线宽只有 `focus.width` 一个键（1b 并掉了 `stroke.focus`）。

#### state

| 键                   | 含义                                  | default | Apple | Material（已核对）                                                                                                                                                                                                                                                                  | Fluent           |
| -------------------- | ------------------------------------- | ------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `overlay.hover`      | 悬停叠色的透明度                      | 0       | 0     | 0.08（[`StateTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StateTokens.kt)）                                                                   | 0                |
| `overlay.focus`      | 聚焦叠色                              | 0       | 0     | 0.10（[`_md-sys-state.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-state.scss) `v34.0.21`）                                                                                         | 0                |
| `overlay.pressed`    | 按下叠色                              | 0       | 0     | 0.10（[`_md-sys-state.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-state.scss) `v34.0.21`）                                                                                         | 0                |
| `overlay.dragged`    | 拖动叠色                              | 0       | 0     | 0.16（`StateTokens.kt`）                                                                                                                                                                                                                                                            | 0                |
| `ripple`             | 按下是否有水波（接 `android.ripple`） | false   | false | true（[M3 State Layers](https://m3.material.io/foundations/interaction/states/state-layers)）                                                                                                                                                                                       | false            |
| `pressedOpacity`     | 按下时整体变淡到多少                  | 0.7     | 0.7   | 1（用叠色与水波表达，`StateTokens.kt`）                                                                                                                                                                                                                                             | 约 0.8           |
| `disabled.content`   | 禁用时内容的透明度                    | 0.5     | 0.3   | 0.38（[`_md-comp-button-filled.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-comp-button-filled.scss)）                                                                                  | 约 0.4（待核对） |
| `disabled.container` | 禁用时容器的透明度                    | 0.5     | 0.3   | 0.10（Expressive 按钮 [`FilledButtonTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/FilledButtonTokens.kt) `0.1f`；Switch/Slider 轨道为 `0.12`） | 约 0.4（待核对） |

Apple 的 `disabled` 取 0.3：HIG 不给数，系统控件禁用时约三成不透明度，与 `pressedOpacity` 0.7 一样是实测近似；`stroke.hairline` 的 0.5 是一个物理像素在 2× 屏上的点数（NSH 没有发丝线 API，按 0.5 点画，在 3× 屏上约 1.5 像素）。

default 与 shadcn、solid-glass 的叠色全是 0：它们的悬停与按下继续由 `hover` / `pressed` 两个 finish 表达（"换面"）；原生主题用叠色表达（见决策 3）。禁用与强调色的悬停、按下都不加颜色 token，由透明度推出（见决策 2）。`stateLayer(kind, ink?, under?)` 把墨色洗层叠在已有 `backgroundImage` 渐变之上，不覆盖底色，`hovered(ink?, under?)` 仅在 `overlay.hover === 0` 时写 `backgroundColor: token("hover")`，`state.ripple: true` 时可按控件给 Android 加上按压水波 `android.ripple`。

#### motion

| 键               | 含义                                                                | default                   | Apple      | Material（已核对，[`ExpressiveMotionTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt)） | Fluent                 |
| ---------------- | ------------------------------------------------------------------- | ------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `press`          | 按下（弹簧 `{ stiffness, damping }` 或时序 `{ duration, easing }`） | stiffness 520，damping 34 | 同 default | 800，33.94（`SpringFastSpatial` k=800, ζ=0.6）                                                                                                                                                                                                      | 时长曲线，约 83–167 ms |
| `settle`         | 落定（弹簧或时序）                                                  | 320，30                   | 同 default | 380，31.19（`SpringDefaultSpatial` k=380, ζ=0.8）                                                                                                                                                                                                   | 约 167 ms              |
| `control`        | 控件的标记、填充出入（弹簧或时序）                                  | 1218，70                  | 同 default | 1600，80（`SpringDefaultEffects` k=1600, ζ=1.0）                                                                                                                                                                                                    | 约 167 ms              |
| `move`           | 拇指、指示条的移动（弹簧或时序）                                    | 504，38                   | 同 default | 380，31.19（`SpringDefaultSpatial` k=380, ζ=0.8）                                                                                                                                                                                                   | 约 250 ms              |
| `enter.duration` | 浮层出现的时长                                                      | 420 ms                    | 约         | 500 ms（`DurationLong2` / [`_md-sys-motion.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-motion.scss) `default.spatial`）                            | 约 200（待核对）       |
| `enter.easing`   | 曲线名（`out-cubic`、`standard`、`decelerate` 等 10 项共享白名单）  | out-cubic                 | —          | emphasized-decelerate（`cubic-bezier(0.05, 0.7, 0.1, 1)`，[`_md-sys-motion.scss`](https://github.com/material-components/material-web/blob/a0bab1d9448bbcecab053e6085b8ec621e4cae3e/tokens/versions/latest/sass/_md-sys-motion.scss)）              | decelerate             |
| `shake.duration` | 拒绝值的横向抖动，对齐 `play("shake")`                              | 500 ms                    | 同 default | 同 default（500 ms，M3 无专用 shake token）                                                                                                                                                                                                         | 同 default             |

`press`、`settle`、`control`、`move` 支持 `{ stiffness, damping }` 弹簧或 `{ duration, easing }` 时序曲线二选一（#231）：`follow()` 与各动效调用点统一经 `animate()`（`Roll` 按 `isTiming()` 切换关键帧时序或弹簧）按当前形状分派，经由响应式代理随 `selectTheme()` 实时切换并在开启减弱动画时立即到位。曲线白名单扩为全平台中性命名：`out-cubic`、`in-cubic`、`in-out-cubic`、`standard`、`emphasized-decelerate`、`emphasized-accelerate`、`decelerate`、`accelerate`、`easy-ease`、`point-to-point`，与 `enter.easing` 共用同一份清单。

#### icon

| 键                  | 含义     | default（pointer / touch） | Apple    | Material（已核对）                                                                                                                                                                                                                                                             | Fluent       |
| ------------------- | -------- | -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `size.sm / md / lg` | 图标尺寸 | 12 / 14 / 15；14 / 16 / 18 | 跟随字号 | 18 / 20 / 24（[`CheckboxTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/CheckboxTokens.kt) / `ButtonSmall` / `ButtonMedium`，pointer 同档） | 16 / 20 / 24 |

描边粗细（`weight`）待查 NSH 的图标能否取，查清再加。**换哪套图标不进主题**：SF Symbols、Material Symbols、Fluent Icons 的图标名不同，换图标集属于应用层或另一个 registry 条目。

#### indicator：外观枚举（白名单）

| 键      | 取值                 | default | Apple | Material（已核对）                                                                                                                                                                                                                                   | Fluent    |
| ------- | -------------------- | ------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `tabs`  | `underline` / `pill` | pill    | pill  | underline（[`PrimaryNavigationTabTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/PrimaryNavigationTabTokens.kt)） | underline |
| `nav`   | `fill` / `bar`       | fill    | fill  | fill（[`NavigationDrawerTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationDrawerTokens.kt)）              | bar       |
| `field` | `box` / `underline`  | box     | box   | underline（[`FilledTextFieldTokens.kt`](https://github.com/androidx/androidx/blob/ac364f3c7f575c0e10f089b254a8eedb5b7d705a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/FilledTextFieldTokens.kt)）           | underline |

只收组件已经支持、或者改起来很便宜的外观；每加一项都要过评审（决策 4）。这些键现在有人读了（#224）：`tabs` 由 `Tabs`，`nav` 由侧栏菜单项，`field` 与 `shape.corners.field` 由各字段形控件读取，读取方见第 5 节"第 3 期批 1"。

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
    "windows": { "backdrop": "blur" },
    "android": { "elevation": 4, "ripple": { "color": "{foreground}" } }
  }
}
```

- `themed()` 读 finish 时，把 `material.apple` 翻译成 style 里的 `glassEffect` 与 `glassTintColor`（色值走 alias 路径，不写字面量），`material` 本身从不进 style；`ios`、`macos`、`windows`、`android` 不是 style 键，由 `theme.ts` 的 `platformMaterial(role)` 返回（含 Android 的 `elevation` 与解析 `{token}` 后的 `ripple`），组件在同一个 View 上 `{...platformMaterial("menu")}` 铺开。`material` 为 `null` 时 style 的键与以前完全一样。
- 用 finish 的组件需要多铺开一组 props。这是第 2 期里唯一要改组件的地方。`nsh/base` 的弹层（`Menu`、`Select`、`Popover` 的 popup）只开放 `popupStyle`，所以那里只有 style 里的玻璃键生效，`ios` / `macos` / `windows` 铺不上去；这是已知限制，要用就在应用自己的 View 上铺。
- 遵守"形状固定"：所有主题、所有 finish 都写 `material`，不用材质的写 `null`。
- 先接四个浮层或半透明的 finish：`glass`、`menu`、`card`（侧栏和面板）、`raised`（Apple 的玻璃按钮）。

### 3.4 按平台自动选主题

- 新增 `themes/native/index.ts`，导出 `nativeTheme()`，按 `platform.os` 返回 `apple`（iOS / macOS）、`material`（Android）或 `fluent`（Windows，待批 4 接入）主题。按 NSH 兼容性规定，`switch` 要写 `default` 分支，回落到 default 主题。
- 不新增 `selectTheme("auto")` 这种别名，应用自己调用 `selectTheme(nativeTheme())`。
- `init` 的风格选择里加一项 "Native (per platform)"，等于同时复制三套主题和 `native/index.ts`。

### 3.5 三套原生主题

| 主题 id              | 颜色                                                                          | 质感与材质                                                                            | 风格（`semantics.json` 顶层）                                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apple`（2b 已做）   | 系统中性灰，强调色用系统蓝（读不到系统强调色，先写死）                        | `glass`、`menu`、`raised` 用 Liquid Glass；其余平涂加细边                             | 系统字体，`rounded` 关；控件 `capsule`；continuous 曲率；同心圆角；iOS 正文 17、macOS 13                                                                                               |
| `material`（3 已做） | M3 Expressive 基线色（`#6750A4`，浅色 `on*Container` Tone 30，含 `inverse*`） | 平涂，Material Web Level 1–3 阴影 + `material.android.elevation`（1/3/6dp）；不用模糊 | 系统字体（Roboto）；圆角 `4/8/12/28` 与胶囊 `999`；circular 曲率；触控 48 / 指针 44；`8/10/10/16%` 叠色，`ripple` 开；expressive 弹簧 + `emphasized-decelerate`；`tabs`/`field` 下划线 |
| `fluent`             | Fluent 中性灰，强调色用 Windows 默认蓝                                        | 卡片平涂；`menu`、`glass` 接 Acrylic（`windows.backdrop`）                            | 系统字体（Segoe UI Variable）；控件 `rounded` 4、弹层 8；circular 曲率；控件高 32；动效更克制                                                                                          |

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
| Fluent   | 侧栏和标签页的选中指示条             | ✅ 已做（#224）：`Sidebar` 读 `indicator.nav`，`Tabs` 读 `indicator.tabs`                              |
| Apple    | 滚动时边缘效果、浮动工具栏、侧栏铺满 | 属于应用和窗口层，写配方                                                                               |
| Apple    | 同心圆角                             | `rounded()` 加一个可选参数 `inset`，内圆角 = 外圆角 − inset                                            |

### C 类：NSH 平台能力（向上游提 issue，不阻塞本方案）

| #   | 缺口                                                          | 影响                             |
| --- | ------------------------------------------------------------- | -------------------------------- |
| C1  | 读系统强调色（macOS、Windows、Material You 动态取色）         | 三套原生主题的强调色只能先写死   |
| C2  | 减少透明度、增强对比度两个信号；Liquid Glass 透明度滑杆的状态 | 主题无法在用户关掉透明时换成实底 |

**已查清、不是上游缺口的三项：**

| #   | 原以为的缺口                | 实际                                                                                                                                                                                                                                                    |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C3  | Windows 不透明窗口里的 Mica | Mica 是 `nsh-desktop` 窗口的 `backdrop`（`references/nsh/website/modules/nsh-desktop.md` 的 Look 一行：Windows 11 映射到 Mica 或 Acrylic），在 `nsh.json` 的 `window.backdrop` 里设一次，属于**应用的事**，不是主题的 finish。配方写在站点的 Theme 页。 |
| C4  | Android 上的玻璃和模糊材质  | `backdropFilter` 的模糊在 Android API 31 起可用（`styling.md`），不是缺口；`material` 主题不用模糊（见 3.5），要用时走 `backdropFilter`。                                                                                                               |
| C5  | `borderRadius` 动画         | 支持过渡（`animation.md`），不是上游缺口；Material 的形状变化走 `transition`。                                                                                                                                                                          |

所以只有 C1、C2 是真正要向上游提的缺口。

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

#### 1b：组件读取风格数据（完成：第 1 部分 #162，第 2 部分 #154）

- ✅ （第 1 部分，#154）组件里写死的 `fontSize`、`fontWeight`、`lineHeight` 改读 `type` 的角色，`type.*.line` 的初值同时对齐；`font-sans` 与 `type.family` 接上。没有角色对得上的字号（按钮档位的 12/13/14、标题的 17/20、Tailwind 的 `text-sm` 类等）留在代码里，各处注明原因。验收：`port:render` 与 `port:render:theme` 逐像素不变，`apps/gallery/tests/theme-type.test.tsx` 切到临时主题后字号与字重下一帧跟着变。
- ✅ （第 2 部分，#154）圆角改读 `shape` 的角色（`dialog`、`sheet`、`overlay`、`chip`、`field`，其余按 `control`、`card`、`inset`），`radius.*` 不再导出；`rounded()` 加 `inset` 参数（同心圆角）。
- ✅ `state`（`pressedOpacity`、`disabled`，叠色经 `stateLayer`，悬停叠色接在 `hovered()` 上）和 `focus`、`stroke` 接到组件，`stroke.focus` 与 `focus.width` 并成一个（留 `focus.width`）；`icon.size`、`size.height`、`size.hit` 取代按钮与图标里的同名常量。写在 Tailwind 类里的值、没有对应角色的值留在代码里，各处注明原因（见 `theme-roles.md`）。
- 验收同 1a，画面仍逐像素一致；`apps/gallery/tests/theme-shape.test.tsx` 切到临时主题后圆角、线宽、高度、透明度与触控目标下一帧跟着变。

### 第 2 期：平台材质与 `nativeTheme()`（拆成 2a、2b 两个 PR）

#### 2a：材质的数据与接线（完成，#199）

- ✅ finish 增加 `material` 字段，所有主题、所有 finish 都写（现有三套全为 `null`），`check:theme` 检查它存在、取值在 NSH 的白名单里、`apple.tint` 是主题里有的颜色。
- ✅ `themed()` 翻译 `apple`，`platformMaterial(role)` 给出 `ios`、`macos`、`windows`；`popup` 的 `PopIn`（Popover、HoverCard、NavigationMenu 的面板）、`Toast`、`CodeEditorFindBar`（`menu`）和 `CarouselPrevious` / `CarouselNext` 的 `glass` 铺开平台 props。`listbox`、`menu`、`plot`、`refresh-indicator` 的 look 只交出 style，玻璃键随 style 走，平台 props 由画这个 View 的人铺开。侧栏的 `finish.card` 只取了 `boxShadow`，没有画玻璃，不用铺。
- ✅ 验收：`port:render` 与 `port:render:theme` 逐像素不变；`apps/gallery/tests/theme-material.test.tsx` 切到临时主题后 View 带上 `glassEffect`、`glassTintColor` 与平台 props，`selectTheme(null)` 后下一帧消失。

#### 2b：`nativeTheme()` 与 `apple` 主题（完成，#200）

内容：

- ✅ 新增 `themes/native`（`nativeTheme()`：iOS、macOS 返回 `apple`，其余平台走 `default` 分支返回默认主题）和 `apple` 主题（`scripts/theme/generate-apple.ts` 生成）；registry 增 `theme-apple`、`theme-native`，`init --theme apple` 与 `--theme native` 可用，文档站主题切换器列出 Apple，`test:install` 覆盖。`glass`、`menu`、`raised` 带 `material.apple`，其余 finish 平涂加发丝边，`material` 为 `null`。macOS 不写 `backdrop`：显式的 `macos.backdrop` 会盖过 26+ 的 `glassEffect`；iOS 的 `backdrop` 只给 26 以下回落。
- **已在第 3 期批 1 完成（#224）：** 见下文"第 3 期批 1"。当时推迟的原因：新增颜色 token `on-brand-tint`、`inverse`、`inverse-foreground`、`inverse-brand` 与新增 finish `dialog`、`tooltip`、`inverse`。查过：对话框用 `card` 加 `menu` 的阴影、tooltip 用 popover 的面、toast 用 `finish.menu`，三者在 Apple 上与现在没有差别，不需要拆开；这些 token 要等 `material` 的 snackbar 反色与 `fluent` 的 tooltip 出现才有第二个使用者，现在加只会让三套现有主题多出无人读的键。
- 原计划（保留作第 3 期的起点）：新增颜色 token：`on-brand-tint`（强调淡底上的字）、`inverse`、`inverse-foreground`，以及可能的 `inverse-brand`（snackbar 的操作按钮）。`on-media`（照片上的白字）和 `chart-foreground`（浅色图块上的深字）已经在 C 层，名字以 `theme-roles.md` 为准，这里不再另起。新增 finish：`dialog`、`tooltip`、`inverse`；先查清现在 dialog、tooltip、toast 借用的是哪个 finish，三个平台在这里本来就不同的才拆开。

验收：

- ✅ 已有三套主题的 `material` 全为 `null`，画面逐像素不变（`port:render` 与 `port:render:theme`，`apple` 加入后只多出它自己的比对）。
- ✅ 在 macOS 上用 `nsh test --target macos` 截图：无头渲染是 web 画法，看不到 Liquid Glass，只看到半透明回落填充。
- ✅ 在 iOS 上用 `nsh test --target ios` 截图（模拟器）：popover 是玻璃，能透出下面的字。
- 低于 26 的系统和非 Apple 平台回落到模糊。

### 第 3 期：`material` 与 `fluent` 主题（各一个 PR）

#### 批 1：共用的接线（完成，#224）

本批不加主题，只让组件读 `finishes.json` 里已有但没人读的键，并补上 2b 推迟的颜色 token 与 finish。default、shadcn、solid-glass、apple 逐像素不变（`port:render`、`port:render:theme`）。

- ✅ `indicator.tabs`：`Tabs` 的 `TabsList` 在未给 `variant` 时按它选 `default`（胶囊）或 `line`（下划线）。
- ✅ `indicator.nav`：`bar` 时侧栏菜单项（`SidebarMenuButton`、`SidebarMenuSubButton`）的选中态不填色，改画前缘一条 `stroke.indicator` 宽、强调色的竖条。`NavigationMenu` 是横排的触发器，不读它。
- ✅ `indicator.field` 与 `shape.corners.field`：共用逻辑在 `lib/indicator`（`fieldCorners`、`fieldEdgeWidths`、`fieldRestColor`），`Input`、`Textarea`、`InputGroup`、`Select`、`DatePicker`、`Combobox`、`CodeEditor` 与 `edgeClass` 读它：`underline` 只画下边线（静止时 `muted-foreground`，聚焦时 `focus.width` 的强调色，不画光环），`top` 只圆上两角。`NumberInput`、`TimeField` 与 OTP 的格子的外框是写死在模块级的 class，不读它们，仍是方框。
- ✅ 颜色 token `on-brand-tint`、`inverse`、`inverse-foreground`、`inverse-muted`、`inverse-brand`；finish `dialog`、`tooltip`、`inverse`。读取方：`DialogContent`、`Tooltip`、`Toast`、`Bubble` 的淡底变体。`AlertDialog` 不画卡片，没有读取方。
- 现有四套主题里新增键取值与原来借用的面相同，`on-brand-tint` 取 `foreground`（`Bubble` 的淡底字今天就是它）；选中的图标按钮仍用 `brand`，选择卡片没有自己的字，两处不接 `on-brand-tint`，留给第 3 期用到时再接。

#### 批 2：跨平台主题原语（完成，#231）

在 `material`（#224）与 `fluent`（#225）之前补齐剩余跨平台主题原语，四套现有主题保持零像素变化：

- ✅ `focus.style: "double"`：贴边 1 px `ring-halo`（扩散阴影）+ 其外 `focus.width` 宽 `ring` 实线；只有 `halo` 写 `borderColor: token("ring")`，`outline` 与 `double` 均不覆写边框色。
- ✅ `motion` 时序曲线联合类型：`press` / `settle` / `control` / `move` 均支持 `{ stiffness, damping }` 或 `{ duration, easing }`，响应式随 `selectTheme()` 切换，经 `animate()`、`follow()` 与 `Roll` 统一分发并尊从 `reduceMotion()`。
- ✅ 曲线白名单扩至 10 项（`out-cubic`、`in-cubic`、`in-out-cubic`、`standard`、`emphasized-decelerate`、`emphasized-accelerate`、`decelerate`、`accelerate`、`easy-ease`、`point-to-point`），`enter.easing` 与时序角色共享一份清单。
- ✅ `stateLayer(kind, ink?, under?)` 按表面前景墨色（强调/品牌、选中开关、破坏性与反色各传对应 token）把叠色叠在已有 `backgroundImage` 之上；`hovered(ink?, under?)` 仅在 `overlay.hover === 0` 时写 `backgroundColor: token("hover")`。
- ✅ `state.ripple` 为 `true` 时，可按控件将对应前景墨色按 `overlay.pressed` 透明度写入 `android.ripple.color`；`material.android`（`elevation` 与 `{token}` 水波配置）经 `platformMaterial()` 接入并通过 `scripts/theme/material.ts` 校验。

#### 批 3：`material` 主题（#224，已完成）

- ✅ 从 `scripts/theme/m3.ts` + `scripts/theme/generate-material.ts` 生成 `packages/theme/themes/material/{theme.json,semantics.json}` 并导出 `material` `AppTheme`；`nativeTheme()` 在 Android 返回 `material`。
- ✅ `registry.json` 增 `theme-material`、`init --theme material` 可用、网站主题切换器与 `/docs/themes/material` 落地、`test:install` 覆盖。
- ✅ 每个组件演示在 `material` 下截图（无 Android 设备，基于 headless web / macOS 渲染），差异与 B/C 类缺口记在 `packages/theme/themes/material/README.md`。

#### 批 4：`fluent` 主题（待做）

- 先回官方 token 文件核对第 1 节与 §3.2 的 Fluent 数值，写回本文，再生成 `fluent` 主题与对比截图；B 类里定为"组件做"的结构逐项开 issue。

### 并行：C 类

C1、C2 各开一个上游 issue，链接记在本节（C3–C5 已查清，不是缺口）。

## 6 待决定

### 已决定

| #   | 问题                                                     | 决定                                                                                            | 理由                                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 形状和字号按用途角色命名，还是按通用档位                 | **按用途角色**（`card`、`dialog`、`control`…）                                                  | 三个平台的差别是"哪种部件用多大圆角"，不是一把统一的尺子；按档位命名，每个组件还得各自记一张"我用哪档"的表。`theme.json` 保留 `radius`、`radius-card`、`radius-control`（NSH 的 `token()` 和 `rounded-*` 类读它们），`check:theme` 保证它们等于 `shape.inset`、`shape.card`、`shape.control`。 |
| 2   | 禁用、强调色的悬停与按下加颜色 token，还是用透明度推出来 | **用透明度**（`state`）                                                                         | 三个平台本质上都是对同一个颜色调透明度；加 token 是每套主题多写约 10 个值，且容易写得不一致。                                                                                                                                                                                                  |
| 3   | 悬停与按下继续"换 finish"，还是统一改成叠色              | **两种并存，主题自己选**                                                                        | 统一改成叠色会改动 default 的画面。default、shadcn、solid-glass 的叠色全是 0；Material 用叠色。                                                                                                                                                                                                |
| 4   | 外观枚举（`indicator`）开不开                            | **开，只用白名单**：`tabs`（underline / pill）、`nav`（fill / bar）、`field`（box / underline） | 不开则 Fluent、Material 的输入框和标签页画不像；全放开会让主题变成第二套组件 API。                                                                                                                                                                                                             |
| 5   | 第 1 期是否顺带统一组件里散落的 `fontSize`               | **是，放在 1b**                                                                                 | 不统一的话字号层级形同虚设；改动面大，所以和数据分开一个 PR。                                                                                                                                                                                                                                  |
| 6   | 原生主题是否进 registry                                  | **进**，作为 `theme-apple`、`theme-material`、`theme-fluent` 发布                               | 和 `theme-shadcn` 一致，复制后归应用所有。                                                                                                                                                                                                                                                     |
| 7   | 原生主题的强调色是写死，还是等 C1                        | **先写死**                                                                                      | 不阻塞；C1 落地后改成读系统值。                                                                                                                                                                                                                                                                |
| 8   | 尺寸能否和面分开选（只换尺寸不换面）                     | **暂不**                                                                                        | 先按"一个主题是一套整体"处理，以后再拆。                                                                                                                                                                                                                                                       |

### 仍待决定

暂无。

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
