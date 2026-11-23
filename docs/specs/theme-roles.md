# 主题的构成：token、finish 与 alias

本库的颜色、圆角、字体只有一个来源，一个面的样子只有一张表，二者之间用 `{token}` alias 相连。设计语义标准与分层判定规则见 [`design-semantics.md`](design-semantics.md)：

| 文件                            | 管什么                                                                                                                                                  | 不管什么               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `packages/theme/theme.json`     | 基础 token：颜色（light / dark 与共用）、圆角（3 个层圆角 `radius-{control,container,modal}` 与 A 层 `radius`）、字体（`font-mono` 及可选 `font-sans`） | 面、边、影、渐变、模糊 |
| `packages/theme/semantics.json` | 语义层：与外观无关的字体字阶、形状、尺寸、动效、状态、枚举，加上 `finishes`（`shared` + 稀疏 `light`/`dark`）                                           | 颜色/圆角/字体字面量   |
| `packages/theme/theme.ts`       | 读时把 `{token}` 换成当前主题、外观与宿主覆写的值（`themed()`、`shape.*`、`font.family()`）                                                             | 具体颜色或圆角值       |
| `packages/ui/*.tsx`             | 只经 `finish.*`、`colors.*`、`shape.*` 取外观                                                                                                           | 内联颜色               |

这样定，是为了两件事：

- **改一个值只改一处。** 组件里没有颜色字面量，`semantics.json` 里通过 `{token}` 引用 `theme.json`，改 token（含宿主 `setThemeOverrides`）同时改到所有用到它的面与组件。
- **平涂的主题不必删字段。** 一个没有渐变的外观也必须给出 `gradient`（见第 3 节），合并 `shared` + `light`/`dark` 后形状在主题之间不变，渲染时才不需要分支。

规则的执行者是 `bun scripts/theme-lint.ts`（在 `bun run check` 里）：下文每一条都在那里有一条检查，写错了会点名文件、finish 和字段。

```sh
bun scripts/theme-lint.ts   # 一次跑完本文所有规则
```

## 1 theme.json 的三层

`theme.json` 的 `cssVars` 有三个块：`theme`（两种外观共用的值）、`light`、`dark`。`light` 与 `dark` 的 token 名字必须完全一样，三套主题之间也必须完全一样。

### A 层：shadcn 的 31 个槽

<!-- theme-lint: tokens-a -->

`background`、`foreground`、`card`、`card-foreground`、`popover`、`popover-foreground`、`primary`、`primary-foreground`、`secondary`、`secondary-foreground`、`muted`、`muted-foreground`、`accent`、`accent-foreground`、`destructive`、`border`、`input`、`ring`、`chart-1`、`chart-2`、`chart-3`、`chart-4`、`chart-5`、`sidebar`、`sidebar-foreground`、`sidebar-primary`、`sidebar-primary-foreground`、`sidebar-accent`、`sidebar-accent-foreground`、`sidebar-border`、`sidebar-ring`。

<!-- /theme-lint: tokens-a -->

**31 个都必须有，不能省。** NSH 的 `Theme::of` 逐名字取值，缺一个就退回 shadcn 的 neutral 灰，主题会变成一半本库、一半 shadcn 的混合体——面板里出一个 shadcn 灰的面，原因往往就在这里。名字的唯一来源是 `references/nsh/crates/nsh-base/src/theme.rs` 的 `theme! { … }` 块，`theme-lint` 从那里读，不从本文手抄。

### B 层：本库自己的 token

这些是 shadcn 没有、本库的组件要用的 token。加一个之前先看第 9 节。

| token                    | 管什么                                                                                                    | 谁读                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `inset`                  | 卡片里凹下去的一层（井）                                                                                  | `lib/surface`、`otp-input`、`sidebar`、`menu`、`dock-area`                   |
| `raised`                 | 卡片上凸起的一层：按钮、字段、轨道                                                                        | `button`、`select`、`radio-group`、`carousel`、`dock-area`                   |
| `field`                  | 输入井：比卡片和 inset 更下一层                                                                           | `input`、`select`、`combobox`、`checkbox`、`code-editor`                     |
| `hover`                  | 指针停在可点项上的那一步                                                                                  | `button`、`select`、`input`、`command`、`tree`、`menu`                       |
| `line`                   | 井里的发丝线（分隔、网格）                                                                                | `tabs`、`otp-input`、`number-input`、`input`、`lib/surface`                  |
| `faint`                  | 更弱的字：占位、单位、次要标记                                                                            | `input`、`combobox`、`number-input`                                          |
| `brand`                  | 强调色作为前景：字、图标、线                                                                              | `input`、`calendar`、`command`、`otp-input`、`lib/listbox`                   |
| `brand-edge`             | 强调色填充的那条边：主按钮的发丝线（WinUI 下作 `AccentControlElevationBorderBrush` 下边斜角）             | `theme.ts` 的 `colors.brandEdge`、`finish.accent`                            |
| `accent-bevel`           | 强调色控件亮边（WinUI 下 `ControlStrokeColorOnAccentDefault` 上/侧边；其余主题等同 `brand-edge`）         | `finish.light`、`finish.accent`、`finish.on`                                 |
| `bevel`                  | 中性控件斜角亮边/暗边（WinUI 下 `ControlStrokeColorSecondary`；其余主题等同 `border`）                    | `finish.raised`、`finish.hover`                                              |
| `disabled`               | 禁用控件容器底色（`state.disabled.fill` 为 `true` 时启用：`OnSurface 0.10` / `ControlFillColorDisabled`） | `button`、`toggle`（经 `finish.disabled`）                                   |
| `disabled-foreground`    | 禁用控件内容前景色（`state.disabled.fill` 为 `true` 时启用：`OnSurface 0.38` / `TextFillColorDisabled`）  | `button`、`toggle`、`theme.ts` 的 `colors.disabledForeground`                |
| `accent-pressed`         | 强调色按钮按下不淡出整个 View 时的底色（WinUI `AccentFillColorTertiary`；其余主题等同 `primary`）         | `button`（经 `finish.accentPressed`）                                        |
| `on-accent-pressed`      | 强调色按钮按下时的前景色（WinUI `TextOnAccentFillColorSecondary`；其余主题等同 `primary-foreground`）     | `button`、`theme.ts` 的 `colors.onAccentPressed`                             |
| `glass-edge`             | 玻璃面上的发丝线：控件、胶囊、玻璃、浮层外框                                                              | `theme.ts` 的 `colors.glassEdge`                                             |
| `track`                  | 关着的开关、滑杆与进度条的底槽（后两者按控件预设也可读 `brand-tint` / `input`）                           | `switch`、`slider`、`progress`、`tabs`、`listbox`                            |
| `knob`                   | 关着的开关圆点（`finish.knob` 的白底）                                                                    | `theme.ts` 的 `colors.knob`                                                  |
| `info` / `warn` / `up`   | 三状态色：提示、警告、增长；下降读 `destructive`                                                          | `progress`、`diff-view`、`code-editor`、`status`                             |
| `brand-tint` 等 `*-tint` | 状态色的淡底（`info`、`warn`、`destructive`、`up` 各一，另留 `down-tint` 给数据的下降）                   | `theme.ts` 的 `colors` 映射；`brand-tint` 另见 `calendar`、`tree`、`command` |
| `inverse`                | 提示与 toast 的反色面（今天的主题与浮层同色）                                                             | `toast`、`tooltip`（经 `finish.inverse`）                                    |
| `inverse-foreground`     | `inverse` 上的字                                                                                          | `toast`、`tooltip`                                                           |
| `inverse-brand`          | `inverse` 上的强调色：toast 的操作                                                                        | `toast`                                                                      |
| `ring-halo`              | 焦点环外面的一圈晕                                                                                        | `theme.ts` 的 `focusRing`                                                    |
| `violet`                 | 第三个数据色：图的一条线、链接                                                                            | `link`、`plot`                                                               |

`destructive` 本身是 A 层（shadcn 的），本库的 `colors.destructive` 指向它；数据的下降也读它（`toneColor("down")`），不再单设 `down` 角色，`down-tint` 仍作为下降的淡底保留。

### C 层：两种外观一样的值

`cssVars.theme` 里的键在 light 和 dark 下不各写一份——写两份就是两份要同步的答案。圆角是数，字体是一个家族名，颜色是值：

<!-- theme-lint: tokens-c -->

| 键                                                                | 值                              | 用途                                                                                                        |
| ----------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `radius` / `radius-control` / `radius-container` / `radius-modal` | `8px` / `8px` / `12px` / `14px` | A 层 `radius` 槽与按层划分的 3 个圆角角色；`semantics.json` 的 `dimension.shape.*` 以 `{radius-…}` 引用它们 |
| `font-mono`                                                       | `monospace`                     | 等宽字：`font-mono` 类、`Text` 里的代码、`theme.ts` 的 `mono()`                                             |
| `scrim`                                                           | 遮罩                            | `lib/popup`、`dock-area`                                                                                    |
| `media`                                                           | 照片与影片的底                  | `theme.ts` 的 `colors.media`、`image-viewer` 的 ground；不随外观或主题翻转                                  |
| `on-media`                                                        | 照片与深色图块上的白字          | `image-viewer`、`theme.ts` 的 `colors.onMedia`；不随外观翻转                                                |

<!-- /theme-lint: tokens-c -->

3 个层圆角（`radius-control`、`radius-container`、`radius-modal`）及编译出的 A 层 `radius` 槽（等于 `radius-control`）均为非负 `px` 长度，读主题圆角的角一律用 `rounded()`，`shape.curve` 只在 `packages/theme/theme.ts` 给；嵌套元素用 `rounded(outer, inset)` 按同心推出（`Math.max(outer - inset, 0)`）。

`font-mono` 是字体不是颜色：NSH 取列表里第一个不是通用名的家族（`theme.rs` 的 `font_family`），写 `monospace` 就是系统的等宽字；设定自定义正文字体的主题可在 `cssVars.theme` 中声明可选的 `font-sans`，并在 `semantics.json` 的 `typography.fontFamily` 写 `"{font-sans}"`（不设时 `typography.fontFamily` 为 `null`，留给系统默认字体）。

## 2 semantics.json 的两条线

一个 finish 是一个面的样子，由这几样拼出来：

| 字段                  | 写什么                                                 |
| --------------------- | ------------------------------------------------------ |
| `background`          | 底：`{token}`、墨色，或 `transparent`                  |
| `gradient`            | 叠在底上的渐变：`linear-gradient(180deg, …)`           |
| `shadow`              | 内高光、接触影、投影：永远字面（墨色）                 |
| `foreground`          | 面上的字与图标：`{token}`                              |
| `border-color`        | 边：`{token}` 或 `transparent`                         |
| `border-top-color`    | 上边覆写（WinUI 控件斜角）：`{token}` 或 `transparent` |
| `border-bottom-color` | 下边覆写（WinUI 控件斜角）：`{token}` 或 `transparent` |
| `backdropFilter`      | 只有模糊，不放颜色                                     |
| `material`            | `null`，或平台自己的材质（见下）                       |

颜色字段包括 `background`、`gradient`、`foreground`、`border-color` 与 `border-top-color` / `border-bottom-color`（读取后经 `themed()` 映射为 NSH 样式键 `backgroundColor`、`backgroundImage`、`color`、`borderColor`、`borderTopColor`、`borderBottomColor` 与 `boxShadow`）。`foreground` 以不可枚举的 getter 给出，把它展开进 `ViewStyle` 不会多写一个未知键；文字用 `finish.<role>.foreground` 取色。`shadow` 例外：影子是墨色，不为几何、不为对比提供颜色，也就没有对应的 token——它在所有主题里都保留字面（黑或白带 alpha，或强调色的半透明墨）。一条影子里写了一个表面的颜色，是设计问题，不是 lint 能判的。

`finishes` 块分为 `shared`（明暗共用字段）与稀疏覆写 `light` / `dark`（只写与 `shared` 不同的字段）；合并后每个 finish 的角色集合与字段集合固定。

## 2b 风格数据

`semantics.json` 的顶层，在 `finishes` 之前，按 DTCG 2025.10 命名分布以下风格组：`typography`（`fontFamily` 与 7 个字体角色，含 `fontSize`、`lineHeight` 倍率、数值 `fontWeight` 与 `letterSpacing`）、`dimension`（`shape`、`size`、`stroke`、`focus`、`icon`）、`shape`（`curve`、`corners.button`）、`state`（含 `"press-scale"`、`"pressed-opacity"`、`"accent-pressed-opacity"`、`"rest-opacity"`、叠色、水波开关与禁用透明度）、`duration`（`shake`）、`transition`（`enter`）、`motion`（`press`、`settle`、`control`、`move`，其中 timing 用 `timingFunction`）与 `controls`（控件几何预设家族枚举 `"base" | "material" | "winui"`）。它们与 finish 无关，也与外观无关：一个主题写一份，light 和 dark 共用；随设备变的值分 `pointer` / `touch` 两档。每个键的含义和各平台的值在 [`native-themes.md`](native-themes.md) §3.2；`check:theme` 执行的规则是：

- **键集合相同。** 所有主题的风格数据有同样的键、同样类型的叶子，缺一个键就点名它。
- **枚举取白名单。** 字重（数值 `400`–`700`）、曲线、`corners.button`（`"full" | "radius"`）、焦点样式、`timingFunction`、`controls` 的值都在 `scripts/theme/style.ts` 的列表里。
- **`{token}` 引用按 DTCG `$type` 校验。** `dimension.shape` 的 3 个层圆角（`control`、`container`、`modal`）必须是 `"{radius-…}"`（`dimension` 类型），不允许写数字字面量；`typography.fontFamily` 必须是 `null` 或 `fontFamily` 类型的 `{token}`。

**`theme.json` 与 `dimension.shape` 的分工。** 全部 3 个层圆角值（`radius-control`、`radius-container`、`radius-modal`）由 DTCG 源码编译进 `theme.json` 的 `cssVars.theme` 中（同时编译出等于 `radius-control` 的 A 层 `radius` 槽）；`semantics.json` 的 `dimension.shape.{control,container,modal}` 通过 `{radius-…}` 引用它们，外加非 token 的 `shape.curve` 与 `shape.corners.button`。`theme.ts` 的 `shape.*` 经 `token()` 响应式解析这些引用，因此换主题或宿主覆写圆角 token 都会立即到达组件。

组件经 `style()`（响应式）和保持原形状的 `density`、`controlSize`、`motion`、`cornerCurve`、`focusRing`、`controls()` 读风格数据，换主题后下一帧重画。terminal 档的尺寸由字符格决定，留在代码里，不进主题。

**组件怎么读 `typography`。** 组件取字号、字重、行高、字距用 `font.size(role)`、`font.weight(role)`、`font.lineHeight(role)`、`font.letterSpacing(role)`（`theme.ts`，响应式，`size` 与 `lineHeight` 按 `tier` 取 pointer / touch 档，`lineHeight()` 返回四舍五入后的点数 `Math.round(fontSize * lineHeight)`）：只取组件原来写了的那几项，所以没写字重的文字仍继承周围的字重。对应关系：控件上的字（按钮、标签、表单、菜单、标签页）取 `label` 的字重（500）、卡片与区块标题取 `title` 的字重（600）、正文类取 `body`；`body` 的字号（13 / 15）给面包屑、导航菜单、树、命令面板的行与对话框正文，`detail`（12 / 13）给侧栏的分组与计数，`caption`（11 / 12）给分段控件的数量，`label`（14 / 15）给输入框（`fieldSize.font`）。`lineHeight` 倍率按组件今天画的像素行高对齐：`body` 的 19/13、21/15 算出 19 / 21 给对话框正文。**没有角色对得上的字号留在代码里**，各处有一行注释：按钮、徽标、侧栏档位的 12 / 13 / 14，对话框与卡片标题的 17 / 20、`body + 2`，日历格的 12.8 / 14 / 16，图表轴的 10 / 10.5，命令面板分组名的 11 加 0.6 字距，气泡与空状态说明的 1.5 倍行高（取整后 20 / 23，与 `body.lineHeight` 算出的 19 / 21 不同），以及写在 Tailwind 类里的 `text-sm` / `text-base` / `text-xs`、`font-semibold`（类名读不了 getter）。

**组件怎么读 `shape`、`stroke`、`state`、`size`、`controls`。** 圆角按层读 `shape.{control,container,modal,button}`（`theme.ts`，响应式）：页内元素（输入框、行、徽标、标签、井、色区、kbd）读 `shape.control`，按钮类控件（`Button`、`IconButton`、`SplitButton`、`Toggle`、`ButtonGroup`、分页按钮、日历头部按钮）读 `shape.button`（`shape.corners.button` 为 `"full"` 时取 `999` 胶囊，否则取 `shape.control`），容器与浮层（卡片、菜单、弹出层、富提示、列表面板、toast）读 `shape.container`，模态面（对话框、抽屉、底部面板）读 `shape.modal`；嵌套表面不再单设 `inset` 圆角角色，改用 `rounded(outer, inset)` 按同心推出（内 = 外 − inset，不小于 0）：复选框的钩、分段控件的滑块与轨道、组合框的箭头钮、附件缩略图与颜色选择器的色块；复选框小角在组件预设 `checkboxPresets.corner`。线宽读 `stroke`（`dimension.stroke`）：控件的描边 `stroke.control`（按钮、输入框、选择器、复选框、分段、标签页、徽标…），分隔线与描边变体的发丝线 `stroke.hairline`，卡片、面板、浮层与弹窗等表面的描边 `stroke.surface`（Material 下为 `0`）；焦点环宽只有 `dimension.focus.width`，由 `focusRing()` 读。按下的透明度 `dimmed.pressed`（`state["pressed-opacity"]`），静止的指示器（滚动条滑块）读 `dimmed.rest`（`state["rest-opacity"]`，默认 `0.5`），强调色按下时统一组合 `finish.accentPressed` 与 `opacity: state["accent-pressed-opacity"]`、前景色取 `colors.onAccentPressed`；禁用时若 `state.disabled.fill` 为 `false` 则沿用统一视图 `opacity: dimmed.disabled`，为 `true`（Material / WinUI）则由 `finish.disabled`（无边/关态另按变体设边）绘容器、由 `colors.disabledForeground` 绘字与图标；`state.overlay` 经 `stateLayer(kind)` 变成一层前景色的渐变，`hovered()` 已带上悬停的那一层（default 的叠色是 0，不画）。尺寸：按钮高 `controlHeight.sm / md / lg`（`dimension.size.height`），按钮的图标 `iconSize`（`dimension.icon`），触控目标 `hitTarget()`（`dimension.size.hit`；`touchSlop`、`switchHitSlop` 按它补点按范围；0 不补）。各控件家族随平台切换的几何、指示条样式与粗细（`checkbox`、`switch`、`slider`、`radio-group`、`progress`、`spinner`、`tabs`、`calendar`、`sheet` 抓取条、`sidebar` 选中条与字段指示器）归属各自组件及共享 `lib/indicator` 的 `Record<Controls, …>` 预设表，经 `controls()` 选用。

**留在代码里的值**，各处有注释：Tailwind 类里的 `rounded-(--radius-control)` / `rounded-(--radius-container)` / `rounded-(--radius-modal)` / `rounded-[4px]`、`active:opacity-70`、`disabled:opacity-50`、`border`（类名读不了 getter，前三者读 `theme.json` 的 token，与 `shape` 同值）；半高或半径推出的圆（`height / 2`、`side / 2`：胶囊、圆点、开关、进度条）；选择器的 2 点焦点边（`select.tsx` 的 `outlineWidth: 2`，它是边的渐显，不是焦点环）；实心按钮悬停与选中的 0.94 / 0.88 不透明度，附件失败时的 0.6，子菜单禁用的 0.35（没有对应的 state 角色）；toast 的 2 点色条、进度的 2 点限位、头像 2 点的环（装饰，不是 stroke 角色）；圆角 1 / 2 / 3 / 4 / 5 的小件（拇指、插入符、进度条端点、日历格的 17 等）。

`typography.fontFamily` 在 `semantics.json` 中写 `null`（系统默认）或 `"{font-…}"`（引用 `theme.json` 中 `fontFamily` 类型的 token，如 `"{font-sans}"`）：`font.family()` 通过 `token()` 响应式读取它，构建时与运行时主题行为一致，宿主覆写 `font-sans` 也同样生效。

## 3 固定形状

**每种主题、每种外观里，合并 `shared` 与稀疏覆写后的同一个 finish 的字段集合完全一样，且等于默认主题的那一份。** 一个主题觉得“我没有渐变”，答案不是删掉 `gradient`，而是把它写成一种颜色：

```json
"gradient": "linear-gradient(180deg, {primary} 0%, {primary} 100%)"
```

两个 stop 同色，等于没有渐变，但形状还在，`fillStyle()` 与 `sliderFill` 不需要 `undefined` 分支，换主题也就不会换出另一种结构。

引擎先画 `backgroundColor`，再把 `backgroundImage` 叠上去（`references/nsh/crates/nsh-core/src/canvas.rs`），所以一个面有底、有渐变两层：**颜色写在哪一层，另一层就写 `transparent`**，别把同一个颜色写两遍。三种情形：

- **平涂**（大多数 finish）：颜色在 `background`，渐变在同一层上再来一遍——两个 stop 同色，看不出区别。
- **半透明**（`solid-glass` 的玻璃感）：颜色在 `background`，渐变两站写 `transparent`；同一个半透明色画两遍，alpha 会翻倍（7% 的白变成 13.5%）。
- **渐变承担颜色**（`fill`：绿到深绿的一段）：颜色在渐变里，`background` 写 `transparent`。底下垫一个不透明的颜色不是“看不见”的：它会从渐变里透出来，实测把默认主题的 `progress` 整条调亮 15/255，`port:render` 会拦下。在每个主题里都如此，哪怕颜色是半透明的：`solid-glass` 的 `fill` 把它的半透明墨色写在渐变的两站，底仍是 `transparent`。

两层不能同时清空：默认主题里画出底色的 finish，在每个主题里都画出底色；默认主题里清空的（`inset`、`field`、`track`、`groove`：靠阴影和边画出来的井与槽），在每个主题里都清空。`theme-lint` 检查这一条。`port:render:theme` 拦不住这种错：组件和参照页读的是同一个 finish，一起变透明时两张图依然相同。

**`material`**（2a，#199）是一个 finish 向平台要的原生材质，**每个 finish 都写**，不要就写 `null`（形状固定，不删字段）。值是 `null`，或下面这个形状里写了的几项，取值来自 NSH 的类型：

| 键        | 内容                                                                                                                                                 | 变成                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `apple`   | `{ glass: "regular" \| "clear", tint: <颜色或 null> }`；`tint` 与别处一样写 `{token}`，不写字面量                                                    | style 里的 `glassEffect`、`glassTintColor`（`themed()` 随 style 给） |
| `ios`     | `{ backdrop: "ultraThin" \| "thin" \| "regular" \| "thick" \| "chrome" }`                                                                            | `ios={{ backdropMaterial }}`                                         |
| `macos`   | `{ backdrop: <NSVisualEffectView 材质>, blending?: "withinWindow" \| "behindWindow", state?: "followsWindowActiveState" \| "active" \| "inactive" }` | `macos={{ backdrop: { material, blending, state } }}`                |
| `windows` | `{ backdrop: "blur" }`                                                                                                                               | `windows={{ backdrop: { material } }}`                               |
| `android` | `{ elevation?: number, ripple?: { color: <"{token}">, borderless?: boolean, radius?: number, foreground?: boolean } }`                               | `android={{ elevation, ripple }}`                                    |

`themed()` 从不把 `material` 放进 style；style 里只多 `glassEffect`（有 `apple` 时）和 `glassTintColor`（`tint` 不为 `null` 时），`material: null` 时键与以前完全一样。`ios`、`macos`、`windows`、`android` 不是 style 键，由 `theme.ts` 的 `platformMaterial(role)` 返回，组件在同一个 View 上铺开：`<View {...platformMaterial("menu")} style={{ ...finish.menu }} />`（按压水波由启用了 `state.ripple` 的可按组件并入 `android`）。`check:theme` 检查 `material` 存在于每个 finish，取值在白名单里，`apple.tint` 与 `android.ripple.color` 是该主题有的颜色（`scripts/theme/material.ts`）。

**玻璃要有回落。** `apple.glass` 只在 iOS / macOS 26 及以上画出来，别处画的是 `backdropFilter`。所以写了 `apple`、底又半透明（alpha 小于 1 或 `transparent`）的 finish，`backdropFilter` 必须是一个模糊，不能缺、不能是 `"none"`：否则在 Liquid Glass 之外，面板后面的文字原样透出来（#251）。`check:theme` 拦下这种 finish（`checkGlassFallback`）。

字段顺序固定：`background`、`gradient`、`shadow`、`foreground`、`border-color`、`border-top-color`、`border-bottom-color`、`backdropFilter`、`material`。`tokens:build`（`scripts/tokens/compile.ts`）按默认主题的字段顺序写出编译产物；`check:theme` 拦下比默认主题多一个或少一个字段的 finish。

## 4 每个 finish

<!-- theme-lint: finishes -->

| finish          | 画什么                                                                                  | What it draws                                                                    | 谁读                                          |
| --------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| `card`          | 卡片的底：一道内高光、一道发丝、接触影、投影                                            | The card's face: an inner highlight, a hairline, a contact shadow and a cast one | `sidebar`                                     |
| `section`       | 页面区块与卡片容器的面（`default`、`winui` 无阴影，`material` 带 Level 1 阴影与无边框） | A section or card surface: unshadowed by default, elevated in Material           | `card`、`lib/surface`                         |
| `inset`         | 卡片里的井：只靠内阴影凹下去                                                            | The well inside a card: sunk by its inner shadow alone                           | `lib/surface`、`otp-input`、`sidebar`         |
| `field`         | 输入井的边与内阴影                                                                      | A field's well: its edge and its inner shadow                                    | `input`、`select`、`combobox`、`checkbox`     |
| `raised`        | 卡片上的控件：渐变、内高光、硬投影、边                                                  | A control on a card: a gradient, an inner highlight, a hard shadow, an edge      | `button`、`select`、`radio-group`、`carousel` |
| `hover`         | 悬停时那一步的底                                                                        | The step the surface takes under the pointer                                     | `button`、`carousel`                          |
| `pressed`       | 按下时那一步的底                                                                        | The step it takes while pressed                                                  | `button`                                      |
| `disabled`      | 禁用控件容器的底（容器与内容分开设色时使用）                                            | A disabled control's container when container and content dim independently      | `button`、`toggle`                            |
| `light`         | 主操作：最亮的一档，强调色的渐变                                                        | The main action's brightest step: the accent's gradient                          | `checkbox`                                    |
| `accent`        | 强调色的面（同 `light`）                                                                | The accent's face (the same as `light`)                                          | `button`                                      |
| `accentPressed` | 强调色控件按下时切换的面（不淡出整个控件时用）                                          | The accent control surface while pressed without whole-view opacity fade         | `button`                                      |
| `track`         | 底槽：内阴影 + 边                                                                       | A groove: an inner shadow and an edge                                            | `tabs`、`slider`、`progress`、`switch`        |
| `fill`          | 已填充的一段（滑杆、进度、关掉的开关）                                                  | The filled run: a slider, a progress bar, a switch that is on                    | `slider`、`progress`、`switch`                |
| `knob`          | 关着的开关圆点                                                                          | A switch's knob, off                                                             | `switch`                                      |
| `knobOn`        | 开着的开关圆点                                                                          | A switch's knob, on                                                              | `switch`                                      |
| `handle`        | 滑杆的把手（与 `knob` 分开，见第 6 节）                                                 | A slider's handle (kept apart from `knob`, see 6)                                | `slider`                                      |
| `pill`          | 上游的胶囊面，留给应用                                                                  | The upstream capsule, left to the app                                            | —（见第 8 节）                                |
| `thumb`         | 分段控件、标签里被选中的那一块                                                          | The chosen segment of a segmented control or a tag                               | `tabs`、`segmented`                           |
| `on`            | 选中的开关/勾选框/按钮面，以及它上面的标记                                              | A chosen switch, toggle or secondary button surface, and the mark on it          | `button`、`toggle`                            |
| `chip`          | 字段里一个已选值的标签：底色、一道内高光与边                                            | A chosen value's label inside a field: a fill, an inner highlight and an edge    | `combobox`                                    |
| `glass`         | 玻璃：半透明底 + 模糊                                                                   | Glass: a translucent fill and a blur                                             | `carousel`                                    |
| `menu`          | 浮层：菜单、弹层                                                                        | A floating surface: a menu, a popover                                            | `popover`、`lib/listbox`                      |
| `modal`         | 模态面的底：卡片色/模态容器色 + 浮层阴影                                                | A modal's face: the modal container's fill with a floating elevation shadow      | `dialog`                                      |
| `grabber`       | 底部抽屉顶部的抓取条                                                                    | The drag handle pill centered at the top of a bottom sheet                       | `sheet`                                       |
| `tooltip`       | 提示的面：浮层的底，不带阴影                                                            | A tooltip's face: the popover's pane, without a shadow                           | `tooltip`                                     |
| `inverse`       | 反色面：toast 的底（今天等于 `menu`）                                                   | The inverse surface: a toast's face (today the same as `menu`)                   | `toast`                                       |
| `groove`        | 菜单里一道凹槽                                                                          | A groove cut inside a menu                                                       | `menu`                                        |

<!-- /theme-lint: finishes -->

## 5 alias 与例外

一个 finish 的颜色这样写：

1. **alias**：`{token}`，token 必须在同一主题的 `light`/`dark` 或 `cssVars.theme` 里且为 `color` 类型。`theme.ts` 的 `themed()` 在**读的时候**把它换成当前主题、外观与宿主覆写的颜色（`token(name)`，NSH 给的 `#rrggbbaa`），所以切外观、`selectTheme` 切主题与宿主覆写都自动生效。
2. **墨色**：`oklch(0 0 0 / a)`、`oklch(1 0 0 / a)` 允许字面——内高光、接触影、投影都是它。
3. **`transparent`**：允许，表示这一面没有边。
4. **带 alpha 的 token**：`oklch(from {token} l c h / a)`——一个 token 的颜色换一个透明度，唯一允许的相对颜色写法（见第 7 节）。`alias()` 在读的时候把它展开成具体的颜色，因为 NSH 的 CSS 解析器不认相对颜色。
5. **`shadow` 整条豁免**（见第 2 节）。
6. 其它字面量一律不许出现，除非它在第 7 节的待定表里：那是一份清单，说明这个颜色还没有 token，暂时留在 finish 里。表里的每一条都是待办，不是许可。

## 6 为什么相同的值不合并

好几个 finish 今天取到同一个颜色，看起来可以合并成一条。不合并，是因为它们是不同的决定，改其中一个不该顺手改掉另一个：

| 两个 finish                          | 今天相同的原因                           | 分开的原因                                                                                         |
| ------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `light` / `accent`                   | 主操作与强调是同一个色                   | 上游留了两档，主题可以只让其中一档更亮                                                             |
| `thumb` / `raised`                   | 分段控件选中的那块，与卡片上的控件面同色 | 一个在井里，一个在卡片上，深色下要分开调                                                           |
| `knob` / `handle`                    | 开关圆点与滑杆把手同色                   | shadcn 的滑杆把手带 `border-primary`，开关圆点不带（`f34fa75` 拆出来的）                           |
| `pill` / `raised`、`chip` / `raised` | 上游的胶囊与 chip 借了控件的面           | 胶囊是上游规范、本库还没有组件读；chip 是字段里一个标签，和卡片上的控件不在同一层（第 8 节）       |
| `card` / `section`                   | 页面卡片底色同源                         | `card` 给侧栏浮层，`section` 给页面区块与卡片（`default` 无阴影，`material`/`winui` 按主题加阴影） |

合并的代价是隐形的：某天主题想把 `thumb` 调深一点，`raised` 会跟着变，而两个地方隔着一个井，肉眼很难对上。

## 7 待定颜色

一个 finish 里的颜色离开这张表只有三条路，每条的理由不同：

1. **一个 token 的颜色，带别的 alpha**：写 `oklch(from {token} l c h / a)`。像素不变：`alias()` 从当前主题里取出那个 token 的值，替换其 alpha。`theme-lint` 只认这一种写法，`from` 后面的 `{token}` 必须是这个主题真有的 `color` 类型 token；别的相对形式（把 alpha 写成 `{token}`、在 L/C/H 里用 `calc()`）仍然算“没有 token 的颜色”。
2. **与某个 token 肉眼无差**：ΔL ≤ 0.015、ΔC ≤ 0.003、色相在同一段灰里，就写 `{token}`。像素会有一两个单位的差别，受影响的基线重拍。数值够近但语义不对的不换：`chart-*` 是数据色，`track` 是槽的底，一个选中的行不该跟着图表的颜色走。
3. **材质自己的设计色**：同一个主题的两个外观里值相同、语义相同，又出现在两处以上，就进 `theme.json` 的 B 层（第 1 节）。default 用原来的值，另外两个主题取自己同一位置的颜色或最近的 token，零像素变化。只在一处出现的，留在表里。

表里剩下的二十一行都是第 3 条没走的、只在一两处出现的材质色：`fill` 的渐变末端比 `primary` 深一档或浅一档、开关圆点比 `primary` 淡两档、`track` 的边比 `input` 深一档。其中 `fill` 的那两行只能留在渐变里：NSH 的解析器不认相对颜色，渐变里的颜色写不成 `oklch(from …)`。

`theme-lint` 管两头：表外的字面量报错；表里的条目如果哪个主题都不再写它，也报错——留下一行对不上的，等于给那个颜色留了一条悄悄回来的路。

<!-- theme-lint: pending -->

| 主题        | 外观  | 色值                             | 位置                                                                           | 最接近的 token                              |
| ----------- | ----- | -------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| default     | light | `oklch(0.80472 0.1815 126.061)`  | `fill.gradient`                                                                | `chart-1`（ΔL +0.054，ΔC -0.003）           |
| default     | light | `oklch(0.69169 0.17204 126.956)` | `fill.border-color`                                                            | `chart-1`（ΔL -0.059，ΔC -0.013）           |
| default     | light | `oklch(0.97867 0.00945 119.575)` | `knobOn.gradient`                                                              | `primary`（ΔL +0.082，ΔC -0.157）           |
| default     | light | `oklch(0.72099 0.15728 124.776)` | `knobOn.border-color`                                                          | `chart-1`（ΔL -0.030，ΔC -0.027）           |
| default     | light | `oklch(0.89487 0.00554 274.959)` | `on.background`, `on.gradient`                                                 | `chart-5`（ΔL -0.009，ΔC +0.001，语义不同） |
| default     | dark  | `oklch(0.37091 0.01103 264.432)` | `track.border-color`                                                           | `input`（ΔL +0.015，ΔC -0.000）             |
| default     | dark  | `oklch(0.88348 0.15928 123.937)` | `fill.gradient`                                                                | `primary`（ΔL -0.005，ΔC -0.004）           |
| default     | dark  | `oklch(0.83973 0.16469 124.137)` | `fill.gradient`                                                                | `primary`（ΔL -0.049，ΔC +0.001）           |
| default     | dark  | `oklch(0.71963 0.15821 125.456)` | `fill.border-color`, `knobOn.border-color`                                     | `up`（ΔL -0.060，ΔC +0.010）                |
| default     | dark  | `oklch(0.88185 0.00589 264.53)`  | `knob.gradient`, `handle.gradient`                                             | `knob`（ΔL +0.040，ΔC -0.002）              |
| default     | dark  | `oklch(0.8324 0.00597 264.528)`  | `knob.border-color`, `handle.border-color`                                     | `knob`（ΔL +0.090，ΔC -0.002）              |
| default     | dark  | `oklch(0.97867 0.00945 119.575)` | `knobOn.gradient`                                                              | `brand`（ΔL +0.074，ΔC -0.157）             |
| default     | dark  | `oklch(0.42689 0.01421 264.414)` | `on.background`, `on.gradient`                                                 | `chart-5`（ΔL -0.033，ΔC -0.003）           |
| material    | light | `oklch(0.93251 0.01479 312.24)`  | `modal.background`（`SurfaceContainerHigh`，本库没有同名角色）                 | `field`（ΔL -0.019，ΔC -0.001）             |
| material    | dark  | `oklch(0.2859 0.01293 298.633)`  | `modal.background`（同上）                                                     | `popover`（ΔL -0.041，ΔC +0.001）           |
| shadcn      | dark  | `oklch(0.34846 0 0)`             | `pressed.background`, `pressed.gradient`, `thumb.background`, `thumb.gradient` | `chart-4`（ΔL -0.023，ΔC -0.000，语义不同） |
| solid-glass | light | `oklch(0.2 0 0 / 0.88)`          | `fill.gradient`                                                                | `primary`（ΔL +0.000，ΔC +0.000）           |
| solid-glass | light | `oklch(0.38 0.03 265 / 0.22)`    | `menu.border-color`                                                            | `muted`（ΔL +0.079，ΔC +0.011）             |
| solid-glass | dark  | `oklch(0.94 0 0 / 0.86)`         | `fill.gradient`                                                                | `primary`（ΔL +0.000，ΔC +0.000）           |
| winui       | light | `oklch(0.92191 0 0)`             | `card.border-color`, `section.border-color`（`CardStrokeColorDefault`）        | `border`                                    |
| winui       | light | `oklch(0.81093 0 0)`             | `modal.border-color`（`SurfaceStrokeColorDefault` `#66757575` 在基色上合成）   | `border`（ΔL -0.107，ΔC 0）                 |
| winui       | dark  | `oklch(0.23075 0 0)`             | `card.border-color`, `section.border-color`（`CardStrokeColorDefault`）        | `border`                                    |
| winui       | dark  | `oklch(0.37909 0 0)`             | `modal.border-color`（`SurfaceStrokeColorDefault` `#66757575` 在基色上合成）   | `border`（ΔL +0.070，ΔC 0）                 |

<!-- /theme-lint: pending -->

## 8 留给应用

`theme-lint` 要求每个 token 和每个 finish 都被读到，否则就是写了没人用。下面这些是有意的例外——上游的规范里有，本库还没有组件读它们，应用装进来可以自己用：

<!-- theme-lint: unread -->

`pill`
<!-- /theme-lint: unread -->

- `pill`：上游的胶囊面。本库的组件里没有一处用它，留着是因为它属于上游的规范面（`references/nsh/examples/nsh-gallery-ui`），应用要用就有。

## 9 加一个 token 之前

1. 先看上游：`references/nsh/examples/nsh-gallery-ui` 的 `look/*` 里有没有同一个面，`references/nsh/website/demos/el-<id>.tsx` 用它做什么。
2. 再看 shadcn 的主题有没有：A 层的槽已经覆盖了 shadcn 的全部颜色，能对上就用槽，不要另起一个同义的名字。
3. 确实要加，就在第 1 节的 B 层（逐外观的颜色）或 C 层（两种外观一样）表格里写清楚：管什么、谁读。同时让组件真的读它，否则 `theme-lint` 会问它被谁读。
4. 六套主题都要有：默认主题手写值；`shadcn`、`solid-glass`、`apple`、`material`、`winui` 由 `scripts/theme/generate-<id>.ts` 生成（改生成器，不改产物）。
5. 跑 `bun scripts/theme-lint.ts` 与 `bun run port:render:theme`：前者管形状，后者管像素——加 token 不该改一个像素，改了就是形状或颜色出了问题。
