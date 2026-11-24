# DTCG 2025.10 Token 源标准与编译架构

本文定义本库如何以 **W3C Design Tokens Community Group (DTCG) 2025.10** 三份正式报告作为唯一主题源码真源，取代手写的 `theme.json` + `semantics.json` 双私有格式（Issue #237）。Batch 1–4（提案、正式编译器、`theme-lint` 源码阶段校验与全部 6 套主题的 DTCG 真源切换）已落地，运行时与分发按第 10 节分批推进。

规范依据（第一手来源）：

- **Format Module 2025.10**：[`https://www.designtokens.org/TR/2025.10/format/`](https://www.designtokens.org/TR/2025.10/format/)（Schema：[`format.json`](https://www.designtokens.org/schemas/2025.10/format.json)）
- **Color Module 2025.10**：[`https://www.designtokens.org/TR/2025.10/color/`](https://www.designtokens.org/TR/2025.10/color/)
- **Resolver Module 2025.10**：[`https://www.designtokens.org/TR/2025.10/resolver/`](https://www.designtokens.org/TR/2025.10/resolver/)（Schema：[`resolver.json`](https://www.designtokens.org/schemas/2025.10/resolver.json)）
- **NSH 运行时契约**：[`references/nsh/website/modules/nsh.md`](../../references/nsh/website/modules/nsh.md)（`setTheme` 与 `cssVars { theme, light, dark }`）
- **语义与角色前置标准**：[`design-semantics.md`](design-semantics.md)、[`theme-roles.md`](theme-roles.md)、[`native-themes.md`](native-themes.md)

---

## 1 工具生态对 DTCG 2025.10 的实际支持现状

W3C DTCG 2025.10 于 2025-10-28 发布为首个稳定版本（[W3C DTCG 发布公告](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)），但各工具对三个子模块（Format / Color / Resolver）的落地进度存在明确差异：**Terrazzo** 目前支持最完整，其文档明确支持 2025.10 的 `format.json`、包含 `oklch` 等 CSS Color 4 色彩空间的 `colorSpace`/`components` 对象，以及 `resolver.json`（`sets` / `modifiers` / `resolutionOrder` / `$defs`）（[Terrazzo DTCG & Resolvers 文档](https://terrazzo.app/docs/guides/resolvers/)）；**Style Dictionary** 自 v4 起原生识别 `$value` / `$type` / `$description` 语法，但其官方文档明确提示“对 2025.10 完整规范的支持尚在 v5 开发中”（[Style Dictionary DTCG 说明](https://styledictionary.com/info/dtcg/)），目前主要消费已解析的单文件 token 树而不直接执行 2025.10 `.resolver.json`；**Tokens Studio** 作为规范的三个参考实现之一，支持在存储/同步设置中切换为 W3C DTCG 格式，但对颜色修改器（如变亮/透明度运算）与多套主题条件组合仍依赖自有配置或需在导出时求值（[Tokens Studio DTCG 格式说明](https://docs.tokens.studio/)）；**Figma Variables** 已原生支持按 W3C DTCG JSON 格式导入与导出变量模式（按单模式 `.json` 或多模式 `.zip`），但原生面板消费的是按模式展开的单文件 `.tokens.json`，暂不直接解析 `.resolver.json` 编排文件（[Figma Variables 导入导出指南](https://help.figma.com/hc/en-us/articles/15339657135383)）。这一现状直接决定了本库第 7 节“向设计工具分发按外观展开的 `.tokens.json` 并附带 `hex` 回退”的策略。

---

## 2 源文件布局与 Resolver 架构

### 2.1 目录结构

所有 DTCG 源码位于 `packages/theme/tokens/`（`.tokens.json` 遵循 Format §4.2 推荐扩展名）：

```text
packages/theme/tokens/
  base/
    style.shared.tokens.json      # 跨主题共用的基础语义骨架（typography 复合结构、stroke、focus、state、motion 骨架、10 条 cubicBezier）
    style.pointer.tokens.json     # default / shadcn / solid-glass 共用的 pointer 档字阶、尺寸与图标刻度
    style.touch.tokens.json       # default / shadcn / solid-glass 共用的 touch 档字阶、尺寸与图标刻度
  themes/
    <id>/                         # default | shadcn | solid-glass | apple | material | winui
      theme.resolver.json         # 该主题的 DTCG 2025.10 Resolver
      theme.tokens.json           # 外观与输入档位无关的 token（3 个层圆角、字体家族、C 层共用色、shared 状态/枚举等覆写）
      finishes.shared.tokens.json # 明暗共用的 finish 字段（含 material）
      light.tokens.json           # 亮色外观：A/B 层 56 个颜色 + light 稀疏 finish 覆写
      dark.tokens.json            # 暗色外观：A/B 层 56 个颜色 + dark 稀疏 finish 覆写
      pointer.tokens.json         # （可选，仅平台主题 apple/material/winui）覆盖 base 的 pointer 档字阶与尺寸
      touch.tokens.json           # （可选，仅平台主题 apple/material/winui）覆盖 base 的 touch 档字阶与尺寸
```

### 2.2 Resolver 设计：单 Resolver vs 每主题一个 Resolver

我们对比了两种 Resolver 组织方式：

| 方案                                                                       | 架构                                                                                                                                                                 | 优势                                                                                                                                                                                                                                                                                    | 规范约束与缺陷                                                                                                                                                                                                                                                                                                                                                                                            |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **方案 1：单 Resolver + `theme` modifier**                                 | 单个 `themes.resolver.json`，含 `theme`、`appearance`、`input` 三个 modifiers                                                                                        | 全局只有一个入口文件                                                                                                                                                                                                                                                                    | **违反或绕路 Resolver §4.1.5.1**：该条款规定 _“a modifier MUST NOT reference any other modifier”_ 且不支持二维条件键 `(theme, appearance)`。若先选 `theme` 再选 `appearance`，`appearance.contexts.dark` 无法针对不同主题加载不同暗色文件；若在最终树里保留 `{shadcn.dark.*}` 等中间命名空间，会污染导出给设计工具的 token 树；若合并成 24 个笛卡尔积 context（`default-light-pointer`…），则失去正交性。 |
| **方案 2：共享 `base` Set + 每主题一个 `theme.resolver.json`**（**推荐**） | 共用 `tokens/base/*` 作为基础 Set；每个主题维护一个仅含 `appearance`（`light` / `dark`）与 `input`（`pointer` / `touch`）两个正交 modifiers 的 `theme.resolver.json` | 1. 100% 遵守 Resolver §2.1 正交性与 §4.1.5.1 无交叉引用约束；<br>2. `base/` 消除 `shadcn` / `solid-glass` 与 `default` 之间全部风格数值重复（仅稀疏覆写 `pressScale`、半径、颜色与 finishes）；<br>3. 解析出的最终 token 树纯净无中间命名空间；<br>4. 与按主题分发的产物目录 1:1 对齐。 | 编译器与 lint 需遍历 `tokens/themes/*/theme.resolver.json`（6 个文件，目录约定即可确定发现）。                                                                                                                                                                                                                                                                                                            |

**结论**：采用 **方案 2（共享 `base` Set + 每主题一个 `theme.resolver.json`）**。

每个 `theme.resolver.json` 的标准 `resolutionOrder`（Resolver §4.1.6 & §6.2，后者覆盖前者）：

```json
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
  "name": "NSH Gallery UI",
  "version": "2025.10",
  "sets": {
    "base": { "sources": [{ "$ref": "../../base/style.shared.tokens.json" }] },
    "theme": {
      "sources": [{ "$ref": "./theme.tokens.json" }, { "$ref": "./finishes.shared.tokens.json" }]
    }
  },
  "modifiers": {
    "appearance": {
      "default": "light",
      "contexts": {
        "light": [{ "$ref": "./light.tokens.json" }],
        "dark": [{ "$ref": "./dark.tokens.json" }]
      }
    },
    "input": {
      "default": "pointer",
      "contexts": {
        "pointer": [{ "$ref": "../../base/style.pointer.tokens.json" }],
        "touch": [{ "$ref": "../../base/style.touch.tokens.json" }]
      }
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/base" },
    { "$ref": "#/sets/theme" },
    { "$ref": "#/modifiers/appearance" },
    { "$ref": "#/modifiers/input" }
  ]
}
```

对于平台主题（`apple` / `material` / `winui`），`modifiers.input.contexts.{pointer,touch}` 在末尾追加 `{ "$ref": "./pointer.tokens.json" }` 与 `{ "$ref": "./touch.tokens.json" }`，按 Resolver §6.2 覆盖 `base` 的默认尺寸与字阶。

---

## 3 组结构与命名规则

### 3.1 DTCG 命名规范（Format §5.1.1）

所有组名与 token 名必须满足官方 schema 正则 `^[^${}.][^{}.]*$`：

- 不得以 `$` 开头（保留给 `$value`、`$type`、`$description`、`$extensions`、`$schema`、`$ref`、`$extends`、`$deprecated`、`$root`）；
- 不得包含 `.`、`{`、}`。

### 3.2 为什么 `color.*` 保持单层 kebab-case 而不拆成 `{color.card.$root}`

现有 `theme.json` 中存在大量“前缀名称自身也是一个独立颜色 token”的命名对：如 `card` 与 `card-foreground`、`primary` 与 `primary-foreground`、`sidebar` 与 `sidebar-foreground`/`sidebar-accent`/`sidebar-border`、`brand` 与 `brand-edge`/`brand-tint`、`ring` 与 `ring-halo`、`info` 与 `info-tint` 等。

在 DTCG Format §6.1–6.2 中，一个 JSON 对象不能同时拥有 `$value`（Token）和子 Token（Group），除非使用 `$root`（`color.card.$root` + `color.card.foreground`）。但目前 **Figma Variables 与多款导出工具对 `$root` 语法支持并不稳定**，而保留 `color.card`、`color.card-foreground`、`color.brand-edge`、`color.sidebar-accent` 这样的扁平单层键名：

1. 100% 合法且与现有 `cssVars` 键名直接一一映射（仅多前缀 `color.`）；
2. 零 `$root` 兼容风险；
3. 别名路径清晰：`{color.card}`、`{color.foreground}`、`{color.brand-edge}`。

圆角组 `dimension.radius` 只声明 `control`、`container`、`modal` 三个层角色；编译 `theme.json` 时，除写出 `radius-control`、`radius-container`、`radius-modal` 外，还由 `dimension.radius.control` 派生 A 层 `radius` 槽（满足 NSH `theme.rs` 对长度类型的解析要求）。

### 3.3 顶层组树概览

```text
color.*                  # $type: "color"       全部 75 个颜色（11 个共用 + 64 个明暗自适应）
dimension.radius.*       # $type: "dimension"   3 个层圆角（control, container, modal）
dimension.shape.*        # $type: "dimension"   3 个按层划分的语义圆角别名（引用 {dimension.radius.*}）
dimension.size.hit       # $type: "dimension"   点击/触控最小目标（随 input modifier 变化）
dimension.size.density.* # $type: "dimension"   页面密度（row, pad, gap, surface）
dimension.size.density.* # $type: "dimension"   页面间距（pad, gap, surface）
dimension.size.control.* # $type: "dimension"   控件行内尺寸（padding, gap, dot）
dimension.size.height.*  # $type: "dimension"   高度尺子：按钮、行、标签栏、值行（sm, md, lg）
dimension.stroke.*       # $type: "dimension"   线宽（hairline, control）
dimension.focus.*        # $type: "dimension"   焦点环几何（width, offset）
dimension.control.*      # group ($extensions)  控件维度的四档（field, choice, track, handle）
dimension.icon.*         # $type: "dimension"   图标尺寸（sm, md, lg）
font.family.*            # $type: "fontFamily"  sans 与 mono，每套主题各一条
font.size.*              # $type: "dimension"   7 个字阶字号（随 input modifier 变化，供 typography 引用）
font.line-height.*       # $type: "number"      7 个字阶无单位行高倍率（line / size，供 typography 引用）
typography.*             # $type: "typography"  7 个复合字阶角色（caption, detail, body, label, title, headline, display）
state.*                  # $type: "number"      press-scale, overlay.*, pressed-opacity, rest-opacity, disabled.{content,fill}
cubicBezier.*            # $type: "cubicBezier" 10 条命名缓动曲线
transition.enter         # $type: "transition"  入场过渡（duration + delay + timingFunction）
motion.*                 # group                4 个动效角色：fast / default / slow 三档弹簧，加 state 状态过渡
shape                    # group ($extensions)  非数值几何枚举（curve, corners.button）
controls                 # group ($extensions)  控件几何预设家族枚举（preset: "base" | "material" | "winui"）
finish.<role>.*          # group + tokens       27 个表面配方（background, gradient, foreground, border-color, shadow + $extensions）
```

---

## 4 完整映射表

### 4.1 `theme.json` → DTCG 2025.10（80 个必填）

#### A. `cssVars.theme`（9 个必填，含 `font-sans`）

| `theme.json` 键    | DTCG 路径                    | `$type`      | DTCG `$value` 形态 / 示例                                                           | 说明与反向编译                                                |
| :----------------- | :--------------------------- | :----------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| `radius`           | `dimension.radius.control`   | `dimension`  | `{"value": 8, "unit": "px"}`                                                        | A 层槽位，编译 `theme.json` 时由 `control` 派生写入           |
| `radius-control`   | `dimension.radius.control`   | `dimension`  | `{"value": 8, "unit": "px"}`                                                        | 编译为 `"8px"` 写入 `cssVars.theme.radius-control`            |
| `radius-container` | `dimension.radius.container` | `dimension`  | `{"value": 12, "unit": "px"}`                                                       | 同上，键名还原为 `radius-container`                           |
| `radius-modal`     | `dimension.radius.modal`     | `dimension`  | `{"value": 14, "unit": "px"}`                                                       | 同上，键名还原为 `radius-modal`                               |
| `font-mono`        | `font.family.mono`           | `fontFamily` | `"monospace"` 或 `["Cascadia Mono", "Consolas", "monospace"]`                       | 若为数组，编译时用 `", "` 拼回 CSS 字符串                     |
| `font-sans`        | `font.family.sans`           | `fontFamily` | `["system-ui"]`，或 `["Segoe UI Variable", "Segoe UI", "sans-serif"]`（`winui`）    | 每套主题都声明；通用族在 NSH 里表示“用系统字体”，不生成 token |
| `scrim`            | `color.scrim`                | `color`      | `{"colorSpace": "oklch", "components": [0, 0, 0], "alpha": 0.45, "hex": "#000000"}` | 无损还原 `"oklch(0 0 0 / 0.45)"`                              |
| `media`            | `color.media`                | `color`      | DTCG oklch 对象                                                                     | 同上                                                          |
| `on-media`         | `color.on-media`             | `color`      | DTCG oklch 对象                                                                     | 同上                                                          |

#### B. `cssVars.light` 与 `cssVars.dark`（各 56 个，进入 `light.tokens.json` / `dark.tokens.json`）

- **A 层（31 个 shadcn 槽位）**：`background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `border`, `input`, `ring`, `chart-1`, `chart-2`, `chart-3`, `chart-4`, `chart-5`, `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring` → 全部映射至 `color.<name>`（`$type: "color"`）。其中直接写 `var(--x)` 的槽位（如 `card-foreground`、`popover-foreground`、`secondary`、`secondary-foreground`、`accent-foreground`、`sidebar-foreground`、`sidebar-primary`、`sidebar-primary-foreground`、`sidebar-accent`、`sidebar-accent-foreground`、`sidebar-ring`）写为 DTCG 花括号别名 `"{color.<x>}"`，编译回 `theme.json` 时还原为 `"var(--<x>)"`。
- **B 层（25 个本库扩展槽位）**：
  - 直接 oklch 颜色或 `var(--x)` 别名（14 个）：`inset`, `raised`, `field`, `line`, `faint`, `brand`, `brand-edge`, `track`, `knob`, `info`, `warn`, `up`, `inverse`（`{color.popover}`）, `inverse-foreground`（`{color.foreground}`）, `inverse-brand`（`{color.primary-foreground}`） → `color.<name>`（`$type: "color"`）。
  - 含 `color-mix(in srgb, ...)` 算术的颜色（7 个）：`hover`, `brand-tint`, `info-tint`, `warn-tint`, `destructive-tint`, `up-tint`, `down-tint` → `color.<name>`（`$type: "color"`），`$value` 放静态求值后的 DTCG oklch 对象（含 `hex`），`$extensions["dev.aning.shadcn-nsh"].colorOp` 放混合配方（见第 6 节）。注：在部分平台主题（如 `winui`）中这些键是静态色而非 `color-mix`，此时直接写 DTCG oklch 对象、不附 `colorOp`。

### 4.2 `semantics.json` → DTCG 2025.10

#### A. 风格数据（8 组）

| 现有路径                                                                                    | DTCG 路径                                                           | `$type`                    | DTCG `$value` / 规则                                                                                                                                                                       | 备注                                                                                                                                                                                                   |
| :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------ | :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type.family`                                                                               | `typography.*.fontFamily`（一律 `"{font.family.sans}"`）            | `fontFamily`（复合子字段） | 非空时引用 `"{font.family.sans}"`；为 `null` 时 `typography.*.fontFamily` 填 `["system-ui", "sans-serif"]`（Format §9.8 必填）且扩展记 `"fontFamily": null`                                | `fontFamily.json` schema 不允许 `null`                                                                                                                                                                 |
| `type.<role>`（7 个：`caption`, `detail`, `body`, `label`, `title`, `headline`, `display`） | `typography.<role>`                                                 | `typography`               | `{"fontFamily": ..., "fontSize": "{font.size.<role>}", "fontWeight": 400\|500\|600\|700, "lineHeight": "{font.line-height.<role>}", "letterSpacing": {"value": <tracking>, "unit": "px"}}` | `fontWeight` 用数字（§8.4 禁 `"400"` 字符串）；`lineHeight` 为倍率 `line / size`（§9.8）；辅助 token `font.size.<role>`（`dimension`）与 `font.line-height.<role>`（`number`）随 `input` modifier 切换 |
| `shape.{control,container,modal}`                                                           | `dimension.shape.<role>`                                            | `dimension`                | `"{dimension.radius.<role>}"`                                                                                                                                                              | 3 个按层划分的语义圆角引用；嵌套元素经 `rounded(outer, inset)` 同心推出                                                                                                                                |
| `shape.curve`                                                                               | `shape.$extensions["dev.aning.shadcn-nsh"].curve`                   | —                          | `"continuous" \| "circular"`                                                                                                                                                               | DTCG 无枚举 `$type`                                                                                                                                                                                    |
| `shape.corners.button`                                                                      | `shape.$extensions["dev.aning.shadcn-nsh"].corners.button`          | —                          | `"full" \| "radius"`                                                                                                                                                                       | 按钮类控件是否画成胶囊（`999`）                                                                                                                                                                        |
| `size.hit.{pointer,touch}`                                                                  | `dimension.size.hit`                                                | `dimension`                | `{"value": N, "unit": "px"}`                                                                                                                                                               | `input` modifier 切换                                                                                                                                                                                  |
| `size.density.{pointer,touch}.{row,pad,gap,surface}`                                        | `dimension.size.density.<k>`                                        | `dimension`                | `{"value": N, "unit": "px"}`                                                                                                                                                               | 同上                                                                                                                                                                                                   |
| `size.control.{pointer,touch}.{row,padding,gap,control,check,dot,tabs,line,clear}`          | `dimension.size.control.<k>`                                        | `dimension`                | `{"value": N, "unit": "px"}`                                                                                                                                                               | 同上（`corner` 已移入 `checkboxPresets`）                                                                                                                                                              |
| `size.control.{pointer,touch}.switch`                                                       | `dimension.size.control.$extensions["dev.aning.shadcn-nsh"].switch` | —                          | `"small" \| "regular"`                                                                                                                                                                     | `input` modifier 切换                                                                                                                                                                                  |
| 控件维度（4 档：`field`, `choice`, `track`, `handle`）                                      | `dimension.control.$extensions["dev.aning.shadcn-nsh"].<dimension>` | —                          | 四档各自的枚举值见 [`theme-roles.md`](theme-roles.md) 的枚举表；缺省取 `base` 的值，只写与本主题不同的档                                                                                   | 枚举值由该表登记，`check:theme` 两边对账                                                                                                                                                               |
| `size.height.{pointer,touch}.{sm,md,lg}`                                                    | `dimension.size.height.<step>`                                      | `dimension`                | `{"value": N, "unit": "px"}`                                                                                                                                                               | 同上                                                                                                                                                                                                   |
| `stroke.{hairline,surface,control}`                                                         | `dimension.stroke.<k>`                                              | `dimension`                | `{"value": N, "unit": "px"}`                                                                                                                                                               | 3 个线宽                                                                                                                                                                                               |
| `focus.{width,offset}`                                                                      | `dimension.focus.<k>`                                               | `dimension`                | `{"value": N, "unit": "px"}`                                                                                                                                                               | 焦点环几何                                                                                                                                                                                             |
| `focus.style`                                                                               | `dimension.focus.$extensions["dev.aning.shadcn-nsh"].style`         | —                          | `"halo" \| "outline" \| "double"`                                                                                                                                                          | 焦点环样式枚举                                                                                                                                                                                         |
| `state.pressScale`                                                                          | `state.press-scale`                                                 | `number`                   | `0 < n <= 1`                                                                                                                                                                               | 无单位比例                                                                                                                                                                                             |
| `state.overlay.{hover,focus,pressed,dragged}`                                               | `state.overlay.<k>`                                                 | `number`                   | `0 <= n <= 1`                                                                                                                                                                              | 叠层透明度                                                                                                                                                                                             |
| `state.pressedOpacity`                                                                      | `state.pressed-opacity`                                             | `number`                   | `0 <= n <= 1`                                                                                                                                                                              | 按下透明度；悬停或拖动的被动指示器也取它                                                                                                                                                               |
| `state.restOpacity`                                                                         | `state.rest-opacity`                                                | `number`                   | `0 <= n <= 1`                                                                                                                                                                              | 静止的指示器（滚动条滑块）的不透明度                                                                                                                                                                   |
| `state.disabled.content`                                                                    | `state.disabled.content`                                            | `number`                   | `0 <= n <= 1`                                                                                                                                                                              | 禁用内容透明度                                                                                                                                                                                         |
| `state.disabled.fill`                                                                       | `state.disabled.$extensions["dev.aning.shadcn-nsh"].fill`           | —                          | `boolean`                                                                                                                                                                                  | 禁用容器是否切换为 `finish.disabled`                                                                                                                                                                   |
| `state.ripple`                                                                              | `state.$extensions["dev.aning.shadcn-nsh"].ripple`                  | —                          | `boolean`                                                                                                                                                                                  | Android 水波开关                                                                                                                                                                                       |
| `motion.{fast,default,slow}`（Timing）                                                      | `motion.<role>.timing`                                              | `transition`               | `{"duration": {"value": ms, "unit": "ms"}, "delay": {"value": 0, "unit": "ms"}, "timingFunction": "{cubicBezier.<name>}"}`                                                                 | WinUI 3 等时序主题使用标准 `transition`（§9.5）；`state` 只用这一种                                                                                                                                    |
| `motion.{fast,default,slow}`（Spring）                                                      | `motion.<role>.$extensions["dev.aning.shadcn-nsh"].spring`          | —                          | `{"stiffness": number, "damping": number}`                                                                                                                                                 | 弹簧物理量（§5.2.3 扩展）                                                                                                                                                                              |
| `motion.state`                                                                              | `motion.state.timing`                                               | `transition`               | 同上                                                                                                                                                                                       | 悬停 / 按下 / 选中状态来去的时长与曲线                                                                                                                                                                 |
| `motion.enter`                                                                              | `transition.enter`                                                  | `transition`               | `{"duration": {"value": ms, "unit": "ms"}, "delay": {"value": 0, "unit": "ms"}, "timingFunction": "{cubicBezier.<name>}"}`                                                                 | 标准 `transition`                                                                                                                                                                                      |
| 10 条命名缓动（`theme.ts` `easings`）                                                       | `cubicBezier.<name>`                                                | `cubicBezier`              | `[x1, y1, x2, y2]`                                                                                                                                                                         | 见表 4.2.B                                                                                                                                                                                             |
| `icon.size.{pointer,touch}.{sm,md,lg}`                                                      | `dimension.icon.<step>`                                             | `dimension`                | `{"value": N, "unit": "px"}`                                                                                                                                                               | `input` modifier 切换                                                                                                                                                                                  |
| `controls`                                                                                  | `controls.$extensions["dev.aning.shadcn-nsh"].preset`               | —                          | `"base" \| "material" \| "winui"`                                                                                                                                                          | 控件几何预设家族枚举                                                                                                                                                                                   |

#### B. 10 条命名 `cubicBezier` 曲线（`base/style.shared.tokens.json`）

| 曲线名                  | DTCG `cubicBezier` 控制点    | 来源依据                                                                           |
| :---------------------- | :--------------------------- | :--------------------------------------------------------------------------------- |
| `out-cubic`             | `[0.333333, 1, 0.666667, 1]` | 精确等价 `1 - (1-t)^3`（`references/nsh/crates/nsh-core/src/animation/driver.rs`） |
| `in-cubic`              | `[0.333333, 0, 0.666667, 0]` | 精确等价 `t^3`                                                                     |
| `in-out-cubic`          | `[0.65, 0, 0.35, 1]`         | 近似分段 `inOut(cubic)`；`$extensions.nshEasing = "in-out-cubic"` 保留原生曲线名   |
| `standard`              | `[0.2, 0, 0, 1]`             | M3 `md.sys.motion.easing.standard`（`theme.ts:983`）                               |
| `emphasized-decelerate` | `[0.05, 0.7, 0.1, 1]`        | M3 `emphasized-decelerate`（`theme.ts:985`）                                       |
| `emphasized-accelerate` | `[0.3, 0, 0.8, 0.15]`        | M3 `emphasized-accelerate`（`theme.ts:987`）                                       |
| `decelerate`            | `[0, 0, 0, 1]`               | WinUI 3 Direct Entrance（`theme.ts:989`）                                          |
| `accelerate`            | `[1, 0, 1, 1]`               | WinUI 3 Gentle Exit（`theme.ts:991`）                                              |
| `point-to-point`        | `[0.55, 0.55, 0, 1]`         | WinUI 3 Point-to-Point（`theme.ts:995`）                                           |

#### C. `finishes`（15 个角色，每个映射为 `finish.<role>` Group）

每层一个 finish，六套主题的集合一致：`card`, `inset`, `channel`, `raised`, `plate`, `overlay`, `modal`, `inverse`, `glass`, `accent`, `fill`, `knob`, `hover`, `pressed`, `disabled`（`section` 并入 `card`，`field` / `track`（开关、滑杆的槽）并入 `inset`，`groove`（分段控件的通道）并入 `channel`，`chip` / `pill` 并入 `raised`，`thumb` 并入 `plate`，`menu` 并入 `overlay`，`tooltip` 并入 `inverse`，`light` / `on` 并入 `accent`，`fill` 单独成层（一段跑起来的填充），`accentPressed` 并入 `pressed`，`knobOn` / `handle` 并入 `knob`（`knobOn` 写成 `knob` 的 `checked-*`），`grabber` 化为 `sheet` 预设）。每个角色按如下字段映射（`background`、`foreground`、`material` 必写；`gradient`、`backdropFilter`、三个 border 字段与 `pressed-background` / `pressed-foreground` 可省，`pressed-opacity` 只在 `accent` 上写，`checked-*` 只在 `knob` 上写：平涂的主题不写 gradient，只有按下时换强调色的主题写 `pressed-background` / `pressed-foreground`，只有选中时要变的旋钮写 `checked-*`），合并后保持固定形状：

| `finish` 字段                              | DTCG 路径                                                          | `$type`    | DTCG `$value` 形态与细节                                                                                                                                                                                                                  |
| :----------------------------------------- | :----------------------------------------------------------------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backgroundColor`                          | `finish.<role>.background`                                         | `color`    | `{color.<token>}` 别名、静态 oklch、`transparent`（`alpha: 0` + 扩展标 `"transparentKeyword": true`）、或静态求值色 + `colorOp: { op: "alpha", ... }`                                                                                     |
| `backgroundImage`                          | `finish.<role>.gradient`                                           | `gradient` | `[{"color": ..., "position": 0}, {"color": ..., "position": 1}]`（Format §9.7）；角度 `180` 记于 `gradient.$extensions["dev.aning.shadcn-nsh"].angle = 180`；stop 若为 `transparent` 记 `transparentKeyword`                              |
| `color`                                    | `finish.<role>.foreground`                                         | `color`    | 面上的字与图标：`{color.<token>}` 别名、静态 oklch 或 `transparent`；读取后经 `themed()` 成为文字样式键 `color`                                                                                                                           |
| `borderColor`                              | `finish.<role>.border-color`                                       | `color`    | `{color.<token>}` 别名、静态 oklch、`transparent`、或 `colorOp`。**不用 `$type: "border"`**：因 `finish` 不拥有线宽（不同组件按场景选 `stroke.control` / `stroke.hairline`），且 `border.json` 要求必填 `width` 与 `style`（Format §9.4） |
| `boxShadow`                                | `finish.<role>.shadow`                                             | `shadow`   | 只写刻度的引用数组，如 `["{shadow.edge.surface}", "{shadow.sm}"]`，不写自己的阴影；编译时按当前外观取 `shadow.<part>` 的值，`none` 的部件跳过，拼成一条 CSS shadow 字符串。刻度见下面的 `shadow` 组                                       |
| `backdropFilter`                           | `finish.<role>.$extensions["dev.aning.shadcn-nsh"].backdropFilter` | —          | 原字符串或结构化 `{ "blur"?: Dimension, "saturate"?: number } \| "none"`（DTCG 无 filter `$type`）                                                                                                                                        |
| `material`                                 | `finish.<role>.$extensions["dev.aning.shadcn-nsh"].material`       | —          | `null` 或 `{ apple?, ios?, macos?, windows?, android? }`（其中 `apple.tint` 与 `android.ripple.color` 写 `"{color.<token>}"` 别名）                                                                                                       |
| `pressedBackground` / `pressedForeground`  | `finish.<role>.pressed-background` / `.pressed-foreground`         | `color`    | 可选：主题在按下时换掉这层填色与字色（WinUI 的 `accent` 写 `AccentFillColorTertiary` 与 `TextOnAccentFillColorSecondary`），其余主题不写，按下按 `pressed-opacity` 变淡                                                                   |
| `pressedOpacity`                           | `finish.<role>.pressed-opacity`                                    | `number`   | `0 < n <= 1`；每套主题在 `accent` 上写：填充色控件按下时整体变淡到的不透明度（default / shadcn / solid-glass / apple 0.88；Material 叠色、WinUI 换面，写 1）                                                                              |
| `checkedBackground` / `checkedBorderColor` | `finish.knob.checked-background` / `.checked-border-color`         | `color`    | 可选，只在 `knob` 上：旋钮被选中时换掉的底与边。没写就沿用没选中时的值——它不是中性值，是“这个状态不改这一项”；读取后同样是不可枚举的 getter                                                                                               |
| `checkedGradient`                          | `finish.knob.checked-gradient`                                     | `gradient` | 可选，只在 `knob` 上：选中时叠在底上的渐变；写 `"none"` 表示选中时平涂（编译成 `null`，与“没写”不同）                                                                                                                                     |

#### D. `shadow`（影子刻度，每个外观一组）

`shadow` 组不住在 `finish` 里，而是和 `color` 并列写在每套主题的 `light.tokens.json` / `dark.tokens.json` 里——同一层在两种外观下深浅不同。每层最多 7 个部件：

| 部件                  | `$type`  | 用途                                                                     |
| :-------------------- | :------- | :----------------------------------------------------------------------- |
| `shadow.sm`           | `shadow` | 控件接触影：`raised` / `knob` / `hover` / `disabled` / `glass`           |
| `shadow.md`           | `shadow` | 卡片的落下：`card`                                                       |
| `shadow.lg`           | `shadow` | 浮层：`overlay` / `inverse`（`modal` 在同一档时共用）                    |
| `shadow.xl`           | `shadow` | 页面等待的层：`modal`                                                    |
| `shadow.inset`        | `shadow` | 沉下去的一层：`inset` / `pressed`（`inset: true` 的层）                  |
| `shadow.edge.surface` | `shadow` | 面自己的边：上缘一道光、一圈发丝描边（`edge.accent` 同理，用在强调色上） |
| `shadow.edge.accent`  | `shadow` | 强调色自己的边                                                           |

值为 `$type: "shadow"` 的 DTCG 复合 token（Format §9.6：`color`、`offsetX`、`offsetY`、`blur`、`spread`、`inset`），没有就是 `$extensions.none = true` 的占位。编译到 `semantics.json` 顶层的 `elevation.{light,dark}`（`sm` / `md` / `lg` / `xl` / `inset` / `edge`），不进 `theme.json`；`theme.ts` 的 `elevation(level)` 读它，finish 只引用它。

---

## 5 `$extensions` 命名空间与 Schema 规范

### 5.1 命名空间：`dev.aning.shadcn-nsh`

按 DTCG Format §5.2.3 与 Resolver §4.3 要求，`$extensions` 必须使用反向域名（reverse-DNS）供应商键。本库公开域名为 `aning.dev`（文档站 `shadcn-nsh.aning.dev`，仓库 `aningdev/shadcn-nsh`），因此采用 **`dev.aning.shadcn-nsh`**（绝对不占用上游的 `nsh.dev` / `dev.nsh`）。

### 5.2 各扩展结构定义

1. **枚举与开关扩展**（校验值与 `scripts/theme/style.ts` 白名单一致）：
   - `shape.$extensions["dev.aning.shadcn-nsh"]`: `{ "curve": "continuous" | "circular", "corners": { "button": "full" | "radius" } }`
   - `dimension.size.control.$extensions["dev.aning.shadcn-nsh"]`: `{ "switch": "small" | "regular" }`
   - `dimension.focus.$extensions["dev.aning.shadcn-nsh"]`: `{ "style": "halo" | "outline" | "double" }`
   - `state.$extensions["dev.aning.shadcn-nsh"]`: `{ "ripple": boolean }`
   - `controls.$extensions["dev.aning.shadcn-nsh"]`: `{ "preset": "base" | "material" | "winui" }`
2. **弹簧物理量**（`motion.<role>.$extensions["dev.aning.shadcn-nsh"]`）：
   - `{ "spring": { "stiffness": number (>= 0), "damping": number (>= 0) } }`
3. **Finish 配方扩展**（`finish.<role>.{gradient,shadow,background}.$extensions["dev.aning.shadcn-nsh"]` 与组扩展）：
   - `gradient`: `{ "angle": number }`（默认 `180`）
   - `shadow`: `{ "none": true }`（仅当语义为无阴影 `"none"` 时）
   - `color` / `gradient` stop: `{ "transparentKeyword": true }`（区分 CSS `transparent` 关键字与 `oklch(0 0 0 / 0)` 零不透明度黑）
   - `finish.<role>` 组扩展：
     - `"backdropFilter"`: `string`（`"none"` | `"blur(20px)"` | `"blur(14px) saturate(180%)"`）
     - `"material"`: `null | { apple?: { glass: "regular" | "clear", tint: string | null }, ios?: { backdrop: ... }, macos?: { backdrop: ..., blending?: ..., state?: ... }, windows?: { backdrop: "blur" }, android?: { elevation?: number, ripple?: { color: string, borderless?: boolean, radius?: number, foreground?: boolean } } }`
4. **颜色算术**（`color.<name>` 或 `finish.<role>.<field>.$extensions["dev.aning.shadcn-nsh"].colorOp`）：
   - `mix`（对应 `color-mix`）：`{ "op": "mix", "space": "srgb", "a": ColorOrRef, "percent": number, "b": ColorOrRef | "transparent" }`
   - `alpha`（对应 `oklch(from ... l c h / a)`）：`{ "op": "alpha", "color": Ref, "alpha": number }`
5. **颜色角色分类与 `DESIGN.md` 指南扩展**（用于 `scripts/tokens/design-md.ts` 投影）：
   - `color.<name>.$extensions["dev.aning.shadcn-nsh"].role`: `"surface" | "ink" | "brand" | "status" | "chrome"`（75 个颜色按职责分节）
   - 根级 `.$extensions["dev.aning.shadcn-nsh"].designMd`（`base/style.shared.tokens.json` 放共享 `sharedDos`、`sharedDonts`、`voiceOmitted`；各主题 `theme.tokens.json` 放 `overview`、`elevation`、`dos`、`donts`）

---

## 6 Colour Arithmetic（颜色算术）规范与宿主覆写穿透

DTCG 2025.10 Color Module 不包含任何颜色运算语法，但本库有两处动态算术需求：

- `theme.json` 中每套主题约 8–20 处 `color-mix(in srgb, <A> <P>%, <B>)`（`*-tint`）；
- `semantics.json` 中 `oklch(from {token} l c h / a)`（如 `apple` 的 `glass` / `overlay` / `inverse` / `raised`、`winui` 的 `glass`、`solid-glass` 的 `accent` / `pressed`）；

**规范写法（双重表示：静态回退 + 符号配方）**：

1. **`$value` 写入精确求值后的静态 DTCG Color 对象**（包含 `colorSpace: "oklch"`、`components`、`alpha` 与 6 位 `hex` 回退），保证 Figma / Style Dictionary / Terrazzo 无需理解本库扩展就能直接使用正确颜色。
2. **`$extensions["dev.aning.shadcn-nsh"].colorOp` 保留符号表达式**：

```json
"hover": {
  "$type": "color",
  "$value": {
    "colorSpace": "oklch",
    "components": [0.18636, 0.01318, 264.182],
    "alpha": 0.05,
    "hex": "#121317"
  },
  "$extensions": {
    "dev.aning.shadcn-nsh": {
      "colorOp": {
        "op": "mix",
        "space": "srgb",
        "a": "{color.foreground}",
        "percent": 5,
        "b": "transparent"
      }
    }
  }
}
```

3. **编译回运行时产物**：
   - **编译 `theme.json`**：检测到 `colorOp.op === "mix"` 时，编译器还原为 `"color-mix(in srgb, var(--foreground) 5%, transparent)"`。因此当原生宿主调用 `setThemeOverrides` 覆写 `--foreground`、`--ring`、`--muted-foreground` 或 `--info` 时，NSH 运行时依然自动重新混合所有派生色。
   - **编译语义产物**：检测到 `colorOp.op === "alpha"` 时，还原为 `oklch(from {token} l c h / a)`（方案 a）或输出 `{ op: "alpha", token: "...", alpha: a }` 供 `theme.ts` 经 `token()` 动态 `atAlpha(...)`（方案 b），同样穿透 `setThemeOverrides`。
4. **`theme-lint` 校验**：校验静态 `$value` 与根据同外观基础 token 现算的结果误差在 `1e-4` 以内（`sRGB` 8-bit 通道完全一致），防止手工修改 `$value` 或基础色后二者脱节。

---

## 7 运行时侧对比与推荐：方案 (a) vs 方案 (b)

| 维度                                     | 方案 (a)：编译器继续发射现行 `semantics.json` 形状                                                        | 方案 (b)：运行时读 DTCG 字段命名产物并对齐 `theme.ts` API（**推荐**）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **产物形态**                             | `theme.json` + 现行 `semantics.json`                                                                      | `theme.json` + 经 resolver 预按 4 组 context 合并后的 DTCG 命名语义产物（例如 `semantics.resolved.json` 或 `tokens.runtime.json`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **`packages/theme/theme.ts` 变动**       | 零变动                                                                                                    | 接口与内部实现读取 `typography`/`transition`/`shadow`/`gradient`/`dimension`/`state`；**公共访问器去除历史名字**：<br>• `font.line(role)` → `font.lineHeight(role)`（仍返回点数 `Math.round(fontSize * lineHeight)` 给 NSH）<br>• `font.tracking(role)` → `font.letterSpacing(role)`<br>• `Timing.easing` → `Timing.timingFunction`（`animate()` 内部映射到 NSH `value.timing(to, { duration, easing: config.timingFunction })`）<br>• `style()` 返回 DTCG 命名结构（`Style` / `Semantics` 类型重命名）                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **组件与演示调用点影响（实测精确计数）** | 0 处                                                                                                      | 全仓受影响符号仅占极少数：<br>• `font.line`：**9 处**（全在 `packages/ui/`，如 `code-block.tsx` 4、`dialog.tsx` 1、`trace.tsx` 2）<br>• `font.tracking`：**1 处**（`packages/ui/collapsing-header.tsx`）<br>• `style()`：**59 处**（`packages/theme/theme.ts` 内部 40、`packages/ui/lib/surface.tsx` 2、`packages/ui/lib/indicator.ts` 4、`apps/showcase` 等外部读取点 13）<br>• `motion.*` 直接解构 `.easing` 传给 `nsh`：`apps/showcase/demos/` 3 处 + `apps/gallery/tests/` 2 处（其余 44 处经 `animate()` / `follow()` 透传，不受影响）<br>• **高频核心 API 零变动**：`colors.*`（2971 处）、`finish.*`（208）、`shape.*`（203）、`focusRing()`（145）、`rounded()`（119）、`stroke.*`（113）、`hovered()`（120）、`chart.*`（68）、`tints.*`（48）、`dimmed.*`（30）、`stateLayer()`（22）、`platformMaterial()`（15）、`cornerCurve`（13）、`controlHeight`（6）、`iconSize`（5）、`hitTarget`（3）、`press.scale`（3）**100% 不改名** |
| **项目规范契合度**                       | **保留历史债**：源码是 DTCG，产物退回私有 `semantics.json` 形状，永久维护两套语义结构与两套命名           | **零历史债**：符合“不为旧写法留兼容层、废弃代码”原则，源码、编译产物、文档与 `theme.ts` API 统一使用 DTCG 词汇                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **应用开发者体验**                       | 应用拷贝到的 `lib/ui/semantics.json` 仍使用 `line`/`tracking`/`easing` 等私有键名，与 `.tokens.json` 割裂 | 应用根 `theme.json` 保持不变；`lib/ui/` 产物与 `.tokens.json` 字段一致，CLI `theme-merge` 同步升级（不留双格式兼容分支）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

**推荐**：采用 **方案 (b)**。全仓需改写的调用点不足 30 处且均可由 TypeScript 编译器静态抓全；`theme.json` 作为 NSH 运行时（`setTheme` / `Tokens`）的唯一边界保持 100% 不变。

---

## 8 分发策略（Distribution）

用户已明确：registry 继续分发编译好的 `theme.json`（及语义运行时产物），同时为每个主题增发 `.tokens.json` 供设计工具消费；应用仍可直接编辑 `theme.json`。

针对“每主题向设计工具分发的 `.tokens.json` 应该是什么形式”，对比两种形态：

1. **每主题一个带 Resolver 的捆绑文件**（按 Resolver §7 内联为一个自包含 `.resolver.json`）：能够一次打包全部 4 种排列，但 **Figma 原生 Variables 导入与 Style Dictionary v4 目前均不直接读取 2025.10 `.resolver.json`**。
2. **按外观预解析的单文件对：`light.tokens.json` 与 `dark.tokens.json`**（基于默认 `pointer` 档解析、消除跨目录 `base/` 引用、保留组内 `{color.*}` 别名与 6 位 `hex` 回退）：**推荐**。Figma Variables 可直接以“Import mode”分别拖入 Light / Dark 两列，Tokens Studio 与 Style Dictionary v4 亦可直接读取标准 Format 2025.10 文件；若需要 4 维完整源码或 `touch` 档，Terrazzo 等完整工具可直接读取仓库中的 `theme.resolver.json`（也可按需另附自包含 `tokens.resolver.json`）。

---

## 9 生成器、`theme-lint` 与 `DESIGN.md` 生成器预留

### 9.1 主题生成器迁移（`scripts/theme/`）

目前 `scripts/theme/{shadcn,solid-glass,apple,m3,winui}.ts` 与 `generate-*.ts` 直接生成 `packages/theme/themes/<name>/{theme,semantics}.json`。迁移后：

1. 生成器改为输出或更新 `packages/theme/tokens/themes/<name>/` 下的稀疏 DTCG 文件（`theme.tokens.json`、`light.tokens.json`、`dark.tokens.json`、`finishes.shared.tokens.json` 及平台特有的 `pointer.tokens.json` / `touch.tokens.json`）与 `theme.resolver.json`；
2. 由统一的编译器 `bun run tokens:build` 读取全部 `tokens/themes/*/theme.resolver.json`，生成各主题与根 `packages/theme/` 的编译产物（`theme.json` + 运行时语义文件 + 分发用 `{light,dark}.tokens.json`）；
3. `themes/default/` 与 `packages/theme/` 根目录产物由同一 `tokens/themes/default/theme.resolver.json` 编译得出，天然逐字节一致。

### 9.2 `theme-lint` 演进

`scripts/theme-lint.ts` 演进为两阶段：

1. **标准 Schema 校验**：用官方 2025.10 JSON Schema（`format.json`、`resolver.json`）校验全部 `.tokens.json` 与 `.resolver.json`；
2. **本库语义校验**：解析 4 种 context 排列后执行现有约束——31 个 shadcn A 层槽位完整（`theme.rs`）、C 层键集合与 `radius >= 0`、各层 finish 合并后角色与字段集合齐一、与 `finish-fields.ts` 的 `finishFields` 一致（含 `material` 白名单）、`colorOp` 静态 `$value` 一致性、`unread` / 未使用 token 检查、以及 `$description` 覆盖检查。

### 9.3 `DESIGN.md` 生成器（`scripts/tokens/design-md.ts`，#246）

参照 `references/design.md`（Google Labs DESIGN.md 规范 `alpha`），`scripts/tokens/design-md.ts` 由 `buildThemeTargets`（`bun run tokens:build` / `--check`）调用，从 DTCG 源码与 `compileAppearanceTokensJson`（pointer 档 light/dark）直接投影生成全部 6 套主题的 `packages/theme/themes/<id>/DESIGN.md` 与默认构建时主题的 `packages/theme/DESIGN.md`：

- **YAML front matter**：`name`/`description` 取自 `theme.resolver.json`；`colors`（C 层与明暗无关的色放顶层，其余按 `light`/`dark` 分组，全用 `#RRGGBB`/`#RRGGBBAA`）、`typography`（7 角色，`pointer` 档）、`rounded`（3 个语义圆角角色：`control`、`container`、`modal`）、`spacing`（`pointer` 档 `hit`/`density`/`control`/`height`/`stroke`/`focus`/`icon`）、`motion`（`enter`/`shake` 及 timing 主题角色；spring 物理量无 DESIGN.md 对应字段故留空并写入正文）、`components`（由 finish 配方推导，保留 `{colors.*}`/`{rounded.*}`/`{typography.*}`/`{spacing.*}` 引用）；
- **正文（按规范固定 10 节顺序）**：`Overview`（resolver `description` + 主题 `overview`）、`Colors`（按 `color.<name>.$extensions["dev.aning.shadcn-nsh"].role` 分为 `Surface`/`Ink`/`Brand`/`Status`/`Chrome` 并保留各 token `$description` 中的平台引用）、`Typography`、`Layout`、`Elevation & Depth`、`Shapes`、`Motion & Micro-interaction`、`Voice & Content Strategy`（说明不拥有文案与语调，来自 `base` 扩展 `voiceOmitted`）、`Components`、`Do's and Don'ts`（合并 `base` 共享规则与主题规则）；
- **校验与分发**：`scripts/tokens/build.test.ts` 使用 `@google/design.md` linter 校验全部 7 份文件（0 errors）并与编译产物逐字段比对；`registry.json` 与 `packages/cli` 随 `theme` / `theme-<id>` 分发 `DESIGN.md`。

---

## 10 分批迁移计划（每批 ≤ 1 小时，文件尽量正交）

为避免过渡期的双格式兼容代码，**运行时切换（Option (b)）排在全部主题源码迁移之后**：在 Batch 5 之前，编译器的语义输出直接以现行 `semantics.json` 形状为运行时目标（这是当前的运行时契约，并非兼容层），Batch 5 再将编译器语义输出与 `theme.ts` / CLI `theme-merge` 一并切换至 Option (b)。

| 批次                | 状态   | 内容与触及文件集                                                                                                                                                                                                                                                                                            | 验收标准                                                                                                                                                                                                       |
| :------------------ | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Batch 1**         | 已完成 | 提案文档 `docs/specs/design-tokens.md` + `scripts/tokens/` spike（官方 schema 缓存与 Draft-07 校验器 + `default` 主题 DTCG 源码 + 编译器 + 单测，PR #238）                                                                                                                                                  | `bun test scripts/tokens`、`bun run test:unit`、`vp check`、`bun run check` 全绿，不改任何已分发文件                                                                                                           |
| **Batch 2（本批）** | 已完成 | 正式化 `scripts/tokens/` 编译器（`bun run tokens:build` / `--check` 接入 `bun run check` 与 CI）与 `theme-lint` 源码阶段校验；删掉一次性转换脚本；`default` 源码补全 `$description`                                                                                                                         | `tokens:build` 产出的 `default` 全部产物（`packages/theme/{theme,semantics}.json` 与 `themes/default/*`）逐字节一致；`bun test scripts/tokens`、`bun run check`、`vp check` 通过                               |
| **Batch 3**         | 已完成 | `shadcn` 与 `solid-glass` 迁至 DTCG 源码（`scripts/theme/{shadcn,solid-glass,generate-shadcn,generate-solid-glass,dtcg}.ts` 改输出 `packages/theme/tokens/themes/{shadcn,solid-glass}/` 并自动调用 `tokens:build`；编译器与 source lint 泛化）                                                              | 生成的产物与 `origin/main` 逐字节一致；`bun test scripts/tokens`、`bun run check:theme`、`bun run check`、`vp check` 通过                                                                                      |
| **Batch 4**         | 已完成 | `apple`、`material`、`winui` 迁至 DTCG 源码（`scripts/theme/{apple,m3,winui,generate-*}.ts` 改经 `dtcg.ts` 输出 DTCG 稀疏源文件，含平台 `pointer`/`touch` 覆写与 `material`；`resolver.ts`/`compile.ts`/`lint.ts` 泛化）                                                                                    | 6 套主题全部由 DTCG 编译生成，`themes.test.ts` 与渲染比对逐像素一致（`material` 阴影为规范简写）                                                                                                               |
| **Batch 5**         | 已完成 | 全部主题统一切换至运行时 Option (b)：编译器语义输出改用 DTCG 字段命名，`packages/theme/theme.ts`、`packages/ui/*` / `apps/showcase` / `apps/gallery` 调用点、CLI `theme-merge` 与 `CHANGELOG.md` 同步更新（#237）                                                                                           | `bun run test:unit`、`nsh check`（demos / gallery / showcase）、`bun run test:gallery`、`bun run port:render:theme` 全部通过                                                                                   |
| **Batch 6**         | 已完成 | 更新 Registry 分发与 CLI：`tokens:build` 生成各主题及默认主题 `pointer` 档 `{light,dark}.tokens.json`（保留组内 `{...}` 别名与 6 位 `hex` 回退）；`registry.json`、`packages/cli` 附带分发并更新单测与 `test:install`；同步文档（#237）                                                                     | `bun test scripts/tokens`、`bun run test:unit`、`bun run registry:build --check`、`bun run test:install`、`bun run port:render`、`bun run port:render:theme`、`bun run test:gallery`、`bun run check` 全部通过 |
| **Batch 7（#246）** | 已完成 | `DESIGN.md` 生成器落地：`scripts/tokens/design-md.ts` 接入 `tokens:build` / `--check`，产出 `packages/theme/DESIGN.md` 与 `packages/theme/themes/<id>/DESIGN.md`（共 7 份）；DTCG 源码补充 `role` 与 `designMd` 扩展；`@google/design.md` 校验 0 errors 与编译值相等测试；`registry.json` 与 CLI 随主题分发 | `bun test scripts/tokens scripts/theme`、`bun run test:unit`、`bun run tokens:build --check`、`bun run registry:build --check`、`bun run test:install`、`bun run check`、`vp check` 全部通过                   |

整体验收基准：全部 6 套主题 `port:render` 与 `port:render:theme` **零像素差异**，`test:gallery` 与 `test:install` 全通过。

---

## 11 已拍板问题（Adopted Decisions）

以下提案阶段问题已由用户拍板采纳：

1. **Runtime 方案选型（第 7 节）**：采用 **Option (b)**（在 Batch 5 中统一将语义编译产物与 `theme.ts` 切换为 DTCG 字段命名，同步将 `font.line` → `font.lineHeight`、`font.tracking` → `font.letterSpacing`、`Timing.easing` → `Timing.timingFunction`）。
2. **向设计工具分发的 `.tokens.json` 形态（第 8 节）**：在 Batch 6 中为每个主题附带按外观预先解析的两个单文件（`light.tokens.json` + `dark.tokens.json`，基于 `pointer` 档并附 `hex` 回退）；需要 4 维完整编排的工具可直接读取源码中的 `theme.resolver.json`。
3. **语义运行时产物的 `theme-merge` 升级策略**：Batch 5 切换为 Option (b) 后，`packages/cli/src/utils/theme-merge.ts` 直接按新结构合并，不留旧格式兼容分支。
4. **`$root` 与 `dimension.radius.base`（第 3.2 节）**：避开 DTCG Format §6.2 的 `$root` 语法，使用 `dimension.radius.base` 与单层 `color.<name>`。
