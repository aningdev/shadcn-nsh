# 设计语义标准：基础 token 与跨平台语义层

本库的主题由两个文件构成：

- **`theme.json`（基础 token 层）**：NSH 原生识别的扁平设计 token（颜色、长度/数值、字体家族），每个值只定义一次，同时面向 Tailwind、TSX 的 `token()`、Rust 的 `theme()` 与宿主覆写（`setThemeOverrides`）。
- **`semantics.json`（跨平台语义层）**：以 Apple HIG、Material 3 Expressive、WinUI 3与 shadcn/ui 的**跨平台超集**建出的设计语义——存放 NSH 原生 token 表达不了的结构（表面配方 finish、枚举、`pointer`/`touch` 两档尺寸与字阶、弹簧与动效、平台材质），凡是基础层已有的颜色、圆角或字体，一律通过 `{token}` 引用，不再重复写字面量。

各平台主题（`default`、`shadcn`、`solid-glass`、`apple`，以及后续的 `material`、`winui`）都按同一份标准填满这两个文件。人类与编码代理阅读的 `DESIGN.md`（参照 [`references/design.md`](../../references/design.md)）由 `bun run tokens:build`（`scripts/tokens/design-md.ts`）从 DTCG 源码与按外观编译的 pointer 档解析结果生成，分别落盘于 `packages/theme/DESIGN.md` 与 `packages/theme/themes/<id>/DESIGN.md`。

具体的 token 分层清单与 finish 字段规则见 [`theme-roles.md`](theme-roles.md)；三套原生平台的设计调研与分期路线见 [`native-themes.md`](native-themes.md)。

## 1 分层判定规则

一个设计值进入 **`theme.json`（基础 token 层）**，当且仅当它同时满足以下四条：

1. **NSH 标量类型**：它是 **Color**（单色或明暗自适应 `AdaptiveColor`）、**Length / Number**（`px`、`rem` 或无单位 `f32`）或 **Font Family**（`font-*` 字体族列表）——即 `nsh_core::element::Tokens` 原生解析的三种类型。
2. **与输入档位无关（Tier-Invariant）**：在 `pointer`（桌面）与 `touch`（触屏）下取值相同；NSH `Tokens` 没有 `pointer`/`touch` 维度。
3. **与明暗模式兼容（Mode-Compatible）**：如果是数值或字体，明暗外观下取值相同；NSH 只有 `Color` 携带 `light`/`dark`，`Number` 与 `Font` 均不区分明暗。
4. **原子值，非复合配方**：它是独立的基础量，而非复合配方（渐变、阴影、模糊、原生材质 `material`）、动效物理量（弹簧 / 时序）或外观枚举（`shape.curve`、`focus.style`、`controls`）。

凡是不满足上述任一条的设计值，一律进入 **`semantics.json`（语义层）**，并且在消费基础层已存在的颜色、圆角或字体时，**必须引用基础 token**，禁止重复写字面量。

| 类别                                                                                                                                         | 归属                            | 说明                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| 全部颜色角色（A/B/C 层）                                                                                                                     | `theme.json`                    | 明暗外观放 `light`/`dark`，不随明暗变的放 `theme`                                 |
| 全部 8 个圆角（`radius`、`radius-control`、`radius-field`、`radius-chip`、`radius-card`、`radius-overlay`、`radius-dialog`、`radius-sheet`） | `theme.json` (`cssVars.theme`)  | `semantics.json` 的 `shape.*` 通过 `{radius-…}` 引用                              |
| 字体家族（`font-mono`，以及设定字体时可选的 `font-sans`）                                                                                    | `theme.json` (`cssVars.theme`)  | `semantics.json` 的 `typography.fontFamily` 写 `"{font-…}"` 或 `null`（系统默认） |
| 字体字阶、页面密度、控件尺寸、按钮高、图标尺寸                                                                                               | `theme.json` / `semantics.json` | 不；该类别属语义层，依 `pointer`/`touch` 两档分别定义                             |
| 线宽、焦点环样式与几何、交互状态叠色与透明度、动效、外观枚举                                                                                 | `semantics.json`                | 枚举或非 token 标量                                                               |
| 表面配方（`finishes`：底色、渐变、边、阴影、模糊、平台 `material`）                                                                          | `semantics.json`                | 复合配方；其中颜色与 `material.apple.tint` 一律以 `{token}` 引用                  |

## 2 `{token}` 引用语法与类型检查

语义层统一使用 `{token}` 花括号语法引用 `theme.json` 中的扁平 token（对应 `token("…")`）：

- **标量引用**：整个字段就是引用，如 `"card": "{radius-card}"`、`"fontFamily": "{font-sans}"`、`"background": "{raised}"`。
- **CSS 字符串内嵌引用**：渐变或相对颜色中同样写 `{token}`，如 `"linear-gradient(180deg, {card} 0%, {card} 100%)"`、`"oklch(from {card} l c h / 0.78)"`。
- `theme.json` 内部仍沿用 NSH / CSS 的 `var(--token)` 语法，因为 `theme.json` 直接交由 NSH 运行时解析。

`bun run check:theme`（`scripts/theme-lint.ts`）对每一处 `{token}` 执行严格的类型与防重复检查，token 种类按 DTCG `$type` 命名：

| 语义层位置                                                                                                                                                                             | 要求的 `$type` | 不允许的写法                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `finishes` 颜色字段（`background`、`gradient`、`border-color`、`border-top-color`、`border-bottom-color`、`shadow` 中的引用）与 `material.apple.tint`、`material.android.ripple.color` | `color`        | 非墨色/非待定表字面量、旧式 `var(--x)`、引用非 `color` token     |
| `dimension.shape.{control,field,chip,card,overlay,dialog,sheet,inset}`                                                                                                                 | `dimension`    | 裸数字字面量、引用非 `dimension` token                           |
| `typography.fontFamily`（非 `null` 时）                                                                                                                                                | `fontFamily`   | 裸字符串（如 `"sans"` / `"rounded"`）、引用非 `fontFamily` token |

## 3 两档与明暗稀疏覆盖

### `pointer` / `touch` 两档

只对真正随输入形态变化的尺寸与字阶保留 `{ "pointer": V, "touch": V }`（`typography.*.fontSize`、`typography.*.lineHeight`、`dimension.size.*`、`dimension.icon`）。`theme.ts` 通过 `tier`（`platform.desktop ? "pointer" : "touch"`）响应式读取。不要在 `theme.json` 里发明 `pointer`/`touch` 变体。

### `finishes` 稀疏覆盖（`shared` + `light` / `dark`）

大多数 finish 在明暗外观下使用相同的 `{token}` 引用（由 NSH `token()` 自身完成明暗切换）。为避免把 23 个 finish 在 `light` 与 `dark` 中各抄一遍，`semantics.json` 的 `finishes` 采用三段结构：

```json
"finishes": {
  "shared": { "...": "明暗相同的字段，每个 finish 角色出现一次" },
  "light":  { "...": "仅亮色下与 shared 不同（或仅亮色特有）的稀疏覆写" },
  "dark":   { "...": "仅暗色下与 shared 不同（或仅暗色特有）的稀疏覆写" }
}
```

读取时 `theme.ts` 合并 `{ ...shared[role], ...finishes[appearance]?.[role] }`。`check:theme` 在合并后校验：每套主题在 `light` 与 `dark` 下解析出的 finish 角色集合与每个角色的字段集合，都与 `default` 主题完全一致。

## 4 宿主覆写（`setThemeOverrides`）的到达范围

原生宿主可通过 `setThemeOverrides(cssVarsJson)` 覆写 `theme.json` 中的任意 token。由于语义层通过 `token()` 响应式解析 `{token}`：

| 宿主覆写的内容                                                                                                                                   | 能否自动到达语义层与组件 | 原因                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------ |
| 颜色 token（`primary`、`background`、`card`、`ring`、`inverse` 等）                                                                              | **能**                   | Tailwind 类、`colors.*`、`tints.*` 与 `finish.*` 均经 `token()` 响应式读取           |
| 8 个圆角 token（`radius`、`radius-control`、`radius-field`、`radius-chip`、`radius-card`、`radius-overlay`、`radius-dialog`、`radius-sheet`）    | **能**                   | `shape.*` 解析 `{radius-…}` 后调用 `token()`；`rounded-(--radius-*)` 由 NSH 直接读取 |
| 字体 token（`font-sans`、`font-mono`）                                                                                                           | **能**                   | NSH 原生以 `font-sans` 绘制默认文本，`font.family()` 与 `mono()` 经 `token()` 读取   |
| 语义层自有结构（`shape.curve`、`controls`、`dimension.focus.style`、`shadow`、`material.*`、`motion.*`、`transition.*`、`pointer`/`touch` 尺寸） | **不能**                 | 无法表示为 NSH `Tokens`，属于应用选定的设计语言而非宿主品牌覆写                      |

## 5 与 W3C DTCG 2025.10 的映射

本标准在概念与命名上对齐 W3C **Design Tokens Format Module 2025.10**（DTCG，[`designtokens.org/tr/2025.10/format/`](https://www.designtokens.org/tr/2025.10/format/)，含其 Color 与 Resolver 模块）：

| 本标准概念                                                                                                                            | DTCG 2025.10 对应                         | 说明                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{token}` 引用                                                                                                                        | 花括号别名（Curly-brace alias）           | NSH 的 token 命名空间是扁平的，因此语义层写 `{card}` / `{radius-dialog}`；导出 DTCG 时映射到分组路径（如 `{color.card}`、`{dimension.radius.dialog}`）              |
| token 种类                                                                                                                            | `$type`                                   | 直接沿用 DTCG `$type` 词汇：`color`、`dimension`、`fontFamily`、`fontWeight`、`number`、`duration`、`cubicBezier`、`shadow`、`typography`                           |
| `shared` + `light`/`dark`、`pointer`/`touch` 两档及未来的平台主题                                                                     | Resolver `sets` 与 `modifiers` / contexts | `shared` 为基础 set，`light`/`dark` 与 `pointer`/`touch`（及后续平台维度）对应 Resolver 的 modifier contexts                                                        |
| 动效时序（`{ duration, timingFunction }`）                                                                                            | `duration` + `cubicBezier`                | 以 `{ duration }`（ms）与命名 `cubicBezier` 曲线表达时序动效（如 WinUI 3 动效与 `transition.enter`）；导出 DTCG 源码时拆成标准 `$type`，运行时再编译回 `TimingSpec` |
| 弹簧物理量（`stiffness`/`damping`）、外观枚举（`controls`、`dimension.focus.style`、`shape.curve`）、finish 复合配方与平台 `material` | `$extensions`                             | DTCG 标准类型无法表达的运行时语义，归入 `$extensions` 命名空间                                                                                                      |

DTCG 2025.10 源码真源（`packages/theme/tokens/`）、编译器（`bun run tokens:build`）与 Option (b) DTCG 命名运行时（`semantics.json` 与 `theme.ts`）已为全部 6 套主题落地（Batch 2–5）；按外观展开的 `.tokens.json` 分发（Batch 6）与每套主题的 `DESIGN.md` 生成及分发（#246，Batch 7）亦已完成。完整的 DTCG 2025.10 Token 源架构、键名映射与分批计划见 [`design-tokens.md`](design-tokens.md)。
