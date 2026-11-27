# 主题

Theme v5 的现行契约。真源是 `packages/theme/themes/<id>/index.ts`：`nsh-gallery` 写出完整的 `base` `ThemeSpec`，`shadcn`、`solid-glass`、`apple`、`material`、`winui` 用 `defineTheme({ extends: base })` 只写差异。`themes/native` 的 `nativeTheme()` 在 `platform.os` 为 `ios` / `macos` 时返回 Apple，`android` 返回 Material，`windows` 返回 WinUI 3，其余返回 NSH Gallery。

`bun run tokens:build` 从解析后的 spec 单向导出三样东西，运行时只读前两样里的 `theme.json` 与 TypeScript spec：

| 产物                       | 用途                                     |
| -------------------------- | ---------------------------------------- |
| `theme.json`               | NSH `setTheme` 与 Tailwind 读的 CSS 变量 |
| `{light,dark}.tokens.json` | W3C DTCG 2025.10 交换文件，运行时不读    |
| `DESIGN.md`                | 随 registry 分发的设计说明，生成，不手改 |

解析后的全表是 [`theme-values.md`](theme-values.md)（`bun run docs:semantics` 生成，不手改）。写一套新主题的轴与检查见 `.agents/skills/theme-designer/SKILL.md`。

## 两层契约

**`theme.json`。** `compileNshTheme()` 只写出这些键。

`cssVars.theme`（9 个，明暗共用）：

| 键                                      | 来源                                              |
| --------------------------------------- | ------------------------------------------------- |
| `font-sans` / `font-mono`               | `tokens.font`，缺省 `system-ui` / `monospace`     |
| `radius`                                | 与 `radius-md` 相同，等于 `tokens.radius.control` |
| `radius-md` / `radius-lg` / `radius-xl` | `control` / `container` / `modal`，单位 px        |
| `scrim` / `media` / `on-media`          | `tokens.fixed`                                    |

`cssVars.light` 与 `cssVars.dark` 各 21 键：`background`、`card`、`popover`、`muted`、`surface`、`foreground`、`muted-foreground`、`faint`、`primary`、`primary-foreground`、`secondary`、`accent`、`brand`、`border`、`line`、`input`、`ring`、`info`、`success`、`warning`、`destructive`。省略 `brand` 时编译成 `var(--primary)`。

**`ThemeSpec`。** 颜色以外的外观都在这里，不进 `theme.json`：

| 字段        | 内容                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `tokens`    | 上面的调色板，外加 `tintAlpha`、可选的 `tints` 与 `chart`                                               |
| `metrics`   | `pointer` / `touch` 两档的高度、图标、密度、控件 padding、行 inset、命中区，以及 `stroke` 与字重 / 字距 |
| `elevation` | 每种外观的影子刻度：`sm` / `md` / `lg` / `xl` / `inset`，可选 `edgeSurface` / `edgeAccent`              |
| `surfaces`  | 11 个结构面                                                                                             |
| `feedback`  | `hover` / `press` / `focus` / `disabled` / `passive`                                                    |
| `motion`    | 四档时长、弹簧、入场与主题切换预设                                                                      |
| `controls`  | 13 组控件槽                                                                                             |
| `meta`      | 给人读的概述、对比度豁免 `contrastWaivers`、不上格尺寸的 `scaleCitations`                               |

`defineTheme` 的合并顺序：被扩展的主题，然后 L1 `paradigm`（`expandParadigm`，六个轴，不留在解析后的 spec 上），然后这次调用自己的 L2 字段。L2 胜出。材质与 `effect` 整份替换，不能拼出半个 `kind`。

组件不读 JSON。颜色用 `colors` / `tints` / `chart`，面用 `surface(role)`，槽用 `control(name)`，都在 JSX 或 getter 里读。

## 颜色、透明度、圆角、字体

颜色只来自角色。组件、`lib` 与演示里不写颜色字面量（P3）。带透明度写成 `oklch(L C H / a)`，或 `{ color, alpha }` / `{ tint, alpha }`。`tints.brand|info|success|warning|destructive` 默认由 `tintAlpha` 从对应角色算出；主题可以在 `tokens.tints` 里改成实色（Material 的 tonal container、WinUI 的浅底就是这样）。`chart` 默认是 `[brand, info, success, warning, destructive]` 五色，主题可以整组换掉。

`bun run theme:contrast` 查 WCAG 2 AA：正文 4.5:1，图标与大字 3:1。平台官方画法低于这个比值的对子写在该主题的 `meta.contrastWaivers`（`fg`、`bg`、`source`），不再失败的豁免或指向不存在的角色都是错误。选中或悬停的填充与 `background` / `card` / `popover` 的 OKLCH 亮度差至少 `0.015`，没有豁免。

圆角三层：控件 `radius-md`，卡片与弹出层 `radius-lg`，对话框 `radius-xl`，且 `control ≤ container ≤ modal`。`tokens.radius.curve` 是 `continuous`（连续曲率）或 `circular`。嵌套的面用 `rounded(outer, inset)` 收成同心圆角。按钮角不单走层圆角：`controls.button.corner` 可以是点数、`"control"` / `"container"`，或 `"full"`（胶囊，`999`）。

不设平台字阶。七个角色（`caption`、`detail`、`body`、`label`、`title`、`headline`、`display`）的字号与行高是共享的 `SHARED_TYPE_SCALE`（指针 / 触屏各一套）。主题只覆写 `metrics.typography` 的 `fontWeight` 与 `letterSpacing`。字族默认系统字体；要换才写 `tokens.font`。

## 材质与弹簧

一个面可以要原生材质：`"glass"`、`"acrylic"`，或 `MaterialSpec`（`kind: "glass" | "acrylic" | "blur"`，以及 `blur`、`saturate`、`minOpacity`、`specular`、`glass: "regular" | "clear"`、`ios` 材质、`macos` backdrop）。macOS 26+ 上写出 `macos.backdrop` 会画 `NSVisualEffectView`，盖住 `NSGlassEffectView`；要原生 Liquid Glass 的主题就不写 `macos`，旧系统与 web 回落到 `backdropFilter`。

面上的着色器是 `effect.kind`：`liquid-glass`、`acrylic-noise`、`specular-rim`、`paper-grain`。主题切换是 `motion.presets.themeSwitch`：`none` / `fade` / `dissolve` / `radial-wipe`。

`motion.state|fast|default|slow` 是 `{ duration, easing }`，时长保持 `state ≤ fast ≤ default ≤ slow`。弹簧是 `stiffness` / `damping` / 可选 `mass`，阻尼比 `damping / (2 * sqrt(stiffness * mass))` 落在 `[0.55, 1.5]`。预设可以用 `spring: true` 或 `"snappy" | "smooth" | "bouncy"`。

`metrics` 的指针与触屏尺寸在 4px 格子上，触屏不小于对应的指针档。`hit.pointer` 是 `0`，`hit.touch` 至少 `44`。间距取 `4 / 8 / 12 / 16 / 24 / 32`，平台官方的例外写进 `meta.scaleCitations`。

## 控件槽位

13 组，组件按值画一种画法，不按主题名分支。边宽 `0` 或边色等于底就是填充；`"full"` 是胶囊；旋钮按下尺寸与静止相同则没有形变，变宽是 `stretch`，变大是 `expand`。

| 槽         | 主题通常在这里分叉                                             |
| ---------- | -------------------------------------------------------------- |
| `button`   | 分档圆角、选中底与墨、次要 / 描边 / 破坏性的边、是否带面的影子 |
| `badge`    | 圆角（`"full"` 或层圆角）                                      |
| `field`    | 底色、四边还是只有底边、焦点是环还是加粗的底线                 |
| `choice`   | 盒尺寸、圆角、未选底、边宽、勾选后面                           |
| `switch`   | 轨道与旋钮的宽高、关时的边、按下时旋钮变大还是拉长             |
| `slider`   | 轨高、旋钮尺寸、可选的内点 `mark`（WinUI 的环）                |
| `progress` | 条高与槽的面                                                   |
| `spinner`  | 槽的不透明度（`0` 是无槽）                                     |
| `popup`    | 弹出层圆角                                                     |
| `list`     | 行高亮色与行边                                                 |
| `tabs`     | 轨道的面、边、圆角                                             |
| `menubar`  | 条用 `card` 还是 `"none"`                                      |
| `well`     | 井的边，或 `"none"`                                            |

每套主题今天的值在 [`theme-values.md`](theme-values.md)。平台有意不做的原生差异写在 `themes/apple`、`themes/material`、`themes/winui` 的 README，不在组件里加分支。

## 作者工作流

改 `themes/<id>/index.ts`，然后：

```sh
bun run tokens:build          # 导出 theme.json、DTCG、DESIGN.md
bun run check:theme           # theme-lint：键、分档、不变量
bun run theme:contrast        # WCAG 2 AA 与填充分离
bun run docs:semantics        # 重写 docs/theme-values.md
bun run theme:diff            # 与 origin/main 比解析后的值；--same 不许已有键变
```

只改颜色时，`tokens:build --check`、`check:theme`、`theme:contrast`、`theme:diff` 足够。改了尺寸、材质、状态或动效，打开受影响的演示看结果。契约（`schema.ts`、`theme.ts`、`themes/nsh-gallery/index.ts`、导出脚本）或键的增删要先跑 `theme:diff`，再看每一套主题下的演示。`theme:diff` 把每个改动键分成颜色、其余值、契约（键的增删）。
