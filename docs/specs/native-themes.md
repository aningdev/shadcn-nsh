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

| 维度     | 现在在哪                                                                                                                     | 能否随主题切换             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 颜色     | `theme.json`：shadcn 的 31 个槽位加本库扩展                                                                                  | ✅                         |
| 质感     | `finishes.json`：20 个 finish，字段有 bg / image / border / shadow / backdropFilter，还有 `press.scale`                      | ✅                         |
| 圆角     | `theme.json` 的 `radius`、`radius-card`、`radius-control`，共 3 档                                                           | ✅ 但只有 3 档，没有胶囊形 |
| 曲率     | `theme.ts` 的 `cornerCurve`，固定为 continuous                                                                               | ❌                         |
| 字体     | 只有 `font-mono`；字号、字重散在 `density`、`controlSize` 和各组件里                                                         | ❌                         |
| 页面密度 | `packages/ui/lib/surface.tsx` 的 `density`，按 pointer / touch 两档，模块加载时就定了                                        | ❌                         |
| 控件尺寸 | `surface.tsx` 的 `controlSize`，分 terminal / pointer / touch 三档                                                           | ❌                         |
| 动效     | `theme.ts` 的 `motion`：press、settle、control、move、enter                                                                  | ❌                         |
| 平台材质 | 组件没有用到 `glassEffect`、`glassTintColor`、`ios.backdropMaterial`、`macos.backdrop`、`windows.backdrop`、`android.ripple` | ❌                         |
| 主题选择 | `selectTheme(AppTheme)` 只能手动选；`AppTheme` 是 `{ id, label, theme, finishes }`                                           | ❌ 不会按平台自动选        |

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

`finishes.json` 现在的顶层是 `press`（外观无关）、`light`、`dark`（每个 finish 的面）。本方案在顶层、与 `press` 并列，加上 `type`、`shape`、`density`、`control`、`motion`、`state` 六块；平台材质放在每个 finish 里（3.3）。

**为什么放进 `finishes.json`，不新开文件，也不放进 `theme.json`：**

- **两轴模型不变。** [`positioning.md`](positioning.md) 把主题定为"风格（`finishes.json`）× 颜色（`theme.json`）"，`init` 也按这两轴来选。字体、形状、尺寸、动效都是风格，不是颜色。新开第三个文件就成了三轴，`init`、registry 条目、文档站切换都要跟着改。
- **先例已在。** `press.scale` 是按下时下沉多少，本身就不是"面"，早已放在 `finishes.json` 顶层。
- **`theme.json` 不合适。** 它由 NSH 的 `setTheme` 解析，认不出的值会抛 `TypeError`；而且它只按 light / dark 分，表达不了 pointer / touch 两档。

**跟着要改的：**

- [`theme-roles.md`](theme-roles.md) 和 `GLOSSARY.md` 里 `finishes.json` 的定义，从"一个面的样子"改成"风格：外观无关的尺寸、字体、形状、动效，加上每种外观下各个 finish 的面"。finish 这个词仍指一个面，文件名不改。
- 圆角仍留在 `theme.json`（`radius`、`radius-card`、`radius-control`），因为 NSH 的 `token()` 和 Tailwind 的 `rounded-*` 类都读它。`shape.scale` 只补 NSH 不读的档位（xs–xl）。两处分工写进 `theme-roles.md`。

### 3.2 `finishes.json` 新增的顶层结构

```jsonc
{
  "press": { "scale": 0.97 }, // 已有
  "type": {
    "family": { "sans": null, "rounded": false }, // null = 系统字体
    "scale": {
      // 每个层级分 pointer / touch 两个值
      "caption": { "pointer": 11, "touch": 12 },
      "detail": { "pointer": 12, "touch": 13 },
      "body": { "pointer": 13, "touch": 15 },
      "label": { "pointer": 14, "touch": 15 },
      "title": { "pointer": 13, "touch": 13 },
      "headline": { "pointer": 20, "touch": 22 },
    },
    "weight": { "regular": "400", "medium": "500", "strong": "600" },
  },
  "shape": {
    "curve": "continuous", // continuous | circular
    "control": "rounded", // rounded | capsule
    "scale": { "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 28 },
  },
  "density": {
    // 现在的 density，挪过来
    "pointer": { "row": 36, "pad": 14, "gap": 12, "surface": 10 },
    "touch": { "row": 48, "pad": 16, "gap": 12, "surface": 16 },
  },
  "control": {
    // 现在的 controlSize 的 pointer / touch 两档
    "pointer": {
      "row": 40,
      "padding": 6,
      "gap": 10,
      "control": 16,
      "corner": 5,
      "check": 12,
      "dot": 6,
      "tabs": 30,
      "line": 32,
      "clear": 16,
      "switch": "small",
    },
    "touch": {
      "row": 44,
      "padding": 8,
      "gap": 12,
      "control": 22,
      "corner": 7,
      "check": 16,
      "dot": 8,
      "tabs": 40,
      "line": 44,
      "clear": 20,
      "switch": "regular",
    },
  },
  "motion": {
    "press": { "stiffness": 520, "damping": 34 },
    "settle": { "stiffness": 320, "damping": 30 },
    "control": { "stiffness": 1218, "damping": 70 },
    "move": { "stiffness": 504, "damping": 38 },
    "enter": { "duration": 420 },
  },
  "state": { "hover": 0, "focus": 0, "pressed": 0, "ripple": false },
  "dark": { … }, // 已有：各 finish 的面
  "light": { … },
}
```

规则：

- **默认值不变画面。** default 主题新增的这几块就是现在写死在代码里的数，第 1 期做完 `port:render` 必须逐像素一致。
- **形状固定。** 和 finish 的字段一样，三套主题这六块的键集合完全相同（由 `theme-lint` 检查）。
- **terminal 档不进主题。** 终端的行高和列宽由字符格决定，保留在代码里。
- **要跟随主题切换。** 现在 `density` 和 `controlSize` 是模块加载时定下的常量。改成和 `radius`、`press` 一样的 getter，读 `selected()`，切换主题后下一帧重画。
- **easing 不进 JSON。** `enter` 只放 `duration`，曲线由代码按名字映射。
- **`state` 默认全 0。** 现在的 hover 和 pressed 由 finish 表达，状态层只给 Material 用；`ripple: true` 时，组件把 `android={{ ripple: { color } }}` 接上。

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

### 第 1 期：风格数据进 `finishes.json`（一个 PR）

内容：

- `finishes.json` 顶层新增 `type`、`shape`、`density`、`control`、`motion`、`state`：三套主题加上 `packages/theme/` 的构建时副本；`Finishes` 类型跟着扩展。
- `density`、`controlSize`、`motion`、`cornerCurve` 改为从主题读取的 getter。
- 新增 `font-sans` 和字号层级，组件里写死的 `fontSize` 和 `fontWeight` 改读层级。
- `theme-lint` 增加这六块的形状检查。
- `theme-roles.md` 和 `GLOSSARY.md` 改 `finishes.json` 的定义，增加风格数据一节。

验收：

- `port:render` 和 `port:render:theme` 逐像素一致。
- `bun run check`、`nsh check apps/website/demos`、`bunx vp check`、`test:gallery`、`test:install` 全部通过。
- 反向测试：在一套主题里删掉一个风格键，`theme-lint` 要点名报错。
- 运行时切到一套改过风格数据的临时主题，已渲染的控件下一帧跟着变。

### 第 2 期：平台材质与 `nativeTheme()`（一个 PR）

内容：

- finish 增加 `material` 字段，`themed()` 负责翻译。
- 用到 `glass`、`menu`、`card`、`raised` 的组件铺开平台 props。
- 新增 `themes/native` 和 `apple` 主题。

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

| 问题                                                                               | 建议   | 理由                                             |
| ---------------------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| 原生主题是否进 registry，作为 `theme-apple`、`theme-material`、`theme-fluent` 发布 | 进     | 和 `theme-shadcn` 一致，复制后归应用所有         |
| 原生主题的强调色是写死，还是等 C1                                                  | 先写死 | 不阻塞；C1 落地后改成读系统值                    |
| 第 1 期是否顺带统一组件里散落的 `fontSize`                                         | 是     | 不统一的话字号层级形同虚设；改动面大，但画面不变 |
| 尺寸能否和面分开选（只换尺寸不换面）                                               | 暂不   | 先按"一个主题是一套整体"处理，以后再拆           |

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
