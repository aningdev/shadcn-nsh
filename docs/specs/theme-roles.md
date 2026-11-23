# 主题的构成：token、finish 与 alias

本库的颜色、圆角、字体只有一个来源，一个面的样子只有一张表，二者之间用 `{token}` alias 相连。设计语义标准与分层判定规则见 [`design-semantics.md`](design-semantics.md)：

| 文件                            | 管什么                                                                                                                                              | 不管什么               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `packages/theme/theme.json`     | 基础 token：颜色（light / dark 与共用）、圆角（3 个层圆角 `radius-{control,container,modal}` 与 A 层 `radius`）、字体（`font-sans` 与 `font-mono`） | 面、边、影、渐变、模糊 |
| `packages/theme/semantics.json` | 语义层：与外观无关的字体字阶、形状、尺寸、动效、状态、枚举，加上 `finishes`（`shared` + 稀疏 `light`/`dark`）与 `elevation`（每个外观的影子刻度）   | 颜色/圆角/字体字面量   |
| `packages/theme/theme.ts`       | 读时把 `{token}` 换成当前主题、外观与宿主覆写的值（`themed()`、`shape.*`、`elevation()`、`mono()`）                                                 | 具体颜色或圆角值       |
| `packages/ui/*.tsx`             | 只经 `finish.*`、`colors.*`、`shape.*` 取外观                                                                                                       | 内联颜色               |

这样定，是为了三件事：

- **改一个值只改一处。** 组件里没有颜色字面量，`semantics.json` 里通过 `{token}` 引用 `theme.json`，改 token（含宿主 `setThemeOverrides`）同时改到所有用到它的面与组件。
- **影子只有一份刻度。** 一个 finish 不写影子，只点名刻度里的几部分（`"shadow": ["{shadow.edge.surface}", "{shadow.sm}"]`）；刻度的值在 light / dark 的 `shadow` 组里各写一次，编译进 `semantics.json` 的 `elevation`。同一步影子的面因此长得一样，改一步也只改一处。
- **平涂的主题不写渐变。** 一个没有渐变的外观把 `gradient` 留空（不写这个字段），组件读到的就是没有背景图；`gradient`、`backdropFilter`、`material` 是 finish 里可以缺的字段，其余固定。

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

| token                    | 管什么                                                                                        | 谁读                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `inset`                  | 卡片里凹下去的一层（井）                                                                      | `lib/surface`、`otp-input`、`sidebar`、`menu`、`dock-area`                   |
| `raised`                 | 卡片上凸起的一层：按钮、字段、轨道                                                            | `button`、`select`、`radio-group`、`carousel`、`dock-area`                   |
| `field`                  | 输入井：比卡片和 inset 更下一层                                                               | `input`、`select`、`combobox`、`checkbox`、`code-editor`                     |
| `hover`                  | 指针停在可点项上的那一步                                                                      | `button`、`select`、`input`、`command`、`tree`、`menu`                       |
| `line`                   | 井里的发丝线（分隔、网格）                                                                    | `tabs`、`otp-input`、`number-input`、`input`、`lib/surface`                  |
| `faint`                  | 更弱的字：占位、单位、次要标记                                                                | `input`、`combobox`、`number-input`                                          |
| `brand`                  | 强调色作为前景：字、图标、线                                                                  | `input`、`calendar`、`command`、`otp-input`、`lib/listbox`                   |
| `brand-edge`             | 强调色填充的那条边：主按钮的发丝线（WinUI 下作 `AccentControlElevationBorderBrush` 下边斜角） | `theme.ts` 的 `colors.brandEdge`、`finish.accent`                            |
| `glass-edge`             | 玻璃面上的发丝线：控件、胶囊、玻璃、浮层外框                                                  | `theme.ts` 的 `colors.glassEdge`                                             |
| `track`                  | 关着的开关、滑杆与进度条的底槽（后两者按控件预设也可读 `brand-tint` / `input`）               | `switch`、`slider`、`progress`、`tabs`、`listbox`                            |
| `knob`                   | 关着的开关圆点（`finish.knob` 的白底）                                                        | `theme.ts` 的 `colors.knob`                                                  |
| `info` / `warn` / `up`   | 三状态色：提示、警告、增长；下降读 `destructive`                                              | `progress`、`diff-view`、`code-editor`、`status`                             |
| `brand-tint` 等 `*-tint` | 状态色的淡底（`info`、`warn`、`destructive`、`up` 各一，另留 `down-tint` 给数据的下降）       | `theme.ts` 的 `colors` 映射；`brand-tint` 另见 `calendar`、`tree`、`command` |
| `inverse`                | 提示与 toast 的反色面（今天的主题与浮层同色）                                                 | `toast`、`tooltip`（经 `finish.inverse`）                                    |
| `inverse-foreground`     | `inverse` 上的字                                                                              | `toast`、`tooltip`                                                           |
| `inverse-brand`          | `inverse` 上的强调色：toast 的操作                                                            | `toast`                                                                      |
| `ring-halo`              | 焦点环外面的一圈晕                                                                            | `theme.ts` 的 `focusRing`                                                    |
| `violet`                 | 第三个数据色：图的一条线、链接                                                                | `link`、`plot`                                                               |

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

两个字体族都是 token，不是颜色：`font-sans` 是正文家族（系统字体写通用族 `system-ui`，WinUI 写 `Segoe UI Variable, Segoe UI, sans-serif`），`font-mono` 是等宽家族（`monospace`，WinUI `Consolas, monospace`）。NSH 取列表里第一个不是通用名的家族（`theme.rs` 的 `font_family`），所以写通用族的主题在构建产物里**没有**这个 token —— 那正是“用系统字体”的意思：`font-sans` 由 NSH 自己画在每一段没写字体的文字上，本库不读它；等宽文字经 `mono()` 读 `font-mono`（通用族 `monospace` 不在 NSH 的通用名列表里，所以它总是有 token）。

## 2 semantics.json 的两条线

一个 finish 是一个面的样子，由这几样拼出来：

| 字段                  | 写什么                                                       |
| --------------------- | ------------------------------------------------------------ |
| `background`          | 底：`{token}`、墨色，或 `transparent`                        |
| `gradient`            | 叠在底上的渐变：`linear-gradient(180deg, …)`；平涂的主题不写 |
| `shadow`              | 影子刻度的几部分：`["{shadow.edge.surface}", "{shadow.sm}"]` |
| `foreground`          | 面上的字与图标：`{token}`                                    |
| `border-color`        | 边：`{token}` 或 `transparent`                               |
| `border-top-color`    | 上边覆写（WinUI 控件斜角）：`{token}` 或 `transparent`       |
| `border-bottom-color` | 下边覆写（WinUI 控件斜角）：`{token}` 或 `transparent`       |
| `backdropFilter`      | 只有模糊，不放颜色                                           |
| `material`            | `"none"` 之外，`"glass"` 或 `"acrylic"`（见下）              |
| `elevation`           | 平台自己的阴影高度（dp），只有要它的层写（见下）             |

颜色字段包括 `background`、`gradient`、`foreground`、`border-color` 与 `border-top-color` / `border-bottom-color`（读取后经 `themed()` 映射为 NSH 样式键 `backgroundColor`、`backgroundImage`、`color`、`borderColor`、`borderTopColor`、`borderBottomColor`）。`foreground` 以不可枚举的 getter 给出，把它展开进 `ViewStyle` 不会多写一个未知键；文字用 `finish.<role>.foreground` 取色。`shadow` 不是颜色字段：它引用刻度，刻度的值也是墨色 + alpha，`themed()` 把引用接成一条 `boxShadow`。按下时换色的主题另写 `pressed-background` / `pressed-foreground`（WinUI 的 `AccentFillColorTertiary` 与 `TextOnAccentFillColorSecondary`），同样以不可枚举的 getter 给出。

`finishes` 块分为 `shared`（明暗共用字段）与稀疏覆写 `light` / `dark`（只写与 `shared` 不同的字段）；合并后每个 finish 的角色集合固定，字段集合也固定，除了可以缺的 `gradient`、`backdropFilter`、`material`。

## 2b 风格数据

`semantics.json` 的顶层，在 `finishes` 之前，按 DTCG 2025.10 命名分布以下风格组：`typography`（7 个字体角色，含 `fontSize`、整数点数 `lineHeight`、数值 `fontWeight` 与 `letterSpacing`）、`dimension`（`shape`、`size`、`stroke`、`focus`、`icon`、`control`）、`shape`（`curve`、`corners.button`）、`state`（含 `"press-scale"`、`"pressed-opacity"`、`"rest-opacity"`、叠色、水波开关与禁用透明度）、`elevation`（每个外观的影子刻度：`sm`、`md`、`lg`、`xl`、`inset`，可选的两条边）、`transition`（`enter`）、`motion`（四档：`fast`、`default`、`slow` 三档弹簧与 `state` 状态淡变，timing 用 `timingFunction`）与 `controls`（控件几何预设家族枚举 `"base" | "material" | "winui"`）。它们与 finish 无关：一个主题写一份，light 和 dark 共用（`elevation` 例外，每个外观一份）；随设备变的值分 `pointer` / `touch` 两档。每个键的含义和各平台的值在 [`native-themes.md`](native-themes.md) §3.2；`check:theme` 执行的规则是：

- **键集合相同。** 所有主题的风格数据有同样的键、同样类型的叶子，缺一个键就点名它。
- **枚举取白名单。** 字重（数值 `400`–`700`）、曲线、`corners.button`（`"full" | "radius"`）、焦点样式、`dimension.control` 的六个维度、`timingFunction`、`controls` 的值都在 `scripts/theme/style.ts` 的列表里，清单在下面的枚举表里，`check:theme` 两边对账。
- **`{token}` 引用按 DTCG `$type` 校验。** `dimension.shape` 的 3 个层圆角（`control`、`container`、`modal`）必须是 `"{radius-…}"`（`dimension` 类型），不允许写数字字面量；字体家族只来自 `theme.json` 的 `font-sans` / `font-mono`：7 个字阶复合 token 的 `fontFamily` 一律是 `{font.family.sans}`（DTCG 复合类型的必填字段，设计工具导入要用），`typography` 自己不另设家族。
- **尺寸落在三把尺子上**（`checkScales`）：高度与图标各三个台阶，逐档递增、都是 4 的整数倍；间距（`density.pad` / `density.gap` / `control.padding` / `control.gap`）取自 `4, 8, 12, 16, 24, 32`，每档最多三个值；列表行的 `item.inset` / `item.pad` 也取这些台阶（`inset` 可为 0，即填充铺满容器），`pad` 不小于 `inset`，不计入每档三个值；字号按 `caption → display` 不递减，行高是不小于字号的整数点数；touch 档的点按区 `dimension.size.hit` 不小于 44（Apple HIG 的最小点按区，WCAG 2.2 SC 2.5.5）。平台自己规定的例外值在下表里点名，附出处；表外的一个都不许。

<!-- theme-lint: scales -->

| 主题    | 键                                       | 值   | 出处                                                                                                                                              |
| ------- | ---------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `winui` | `dimension.size.control.pointer.padding` | `6`  | WinUI 3 按钮内边距 6px（`Button_themeresources.xaml`）                                                                                            |
| `winui` | `dimension.size.control.touch.padding`   | `6`  | 同上                                                                                                                                              |
| `winui` | `dimension.size.item.pointer.pad`        | `11` | WinUI 3 菜单行文字内边距 11px（`MenuFlyoutItemThemePadding` 11,8,11,9，`MenuFlyout_themeresources.xaml`）                                         |
| `winui` | `dimension.size.item.touch.pad`          | `11` | 同上（触控沿用同一内边距）                                                                                                                        |
| `winui` | `dimension.size.hit.touch`               | `40` | Windows 触控目标 40×40 epx（[Touch interactions](https://learn.microsoft.com/en-us/windows/apps/design/input/touch-interactions)，“Target size”） |

<!-- /theme-lint: scales -->

**`theme.json` 与 `dimension.shape` 的分工。** 全部 3 个层圆角值（`radius-control`、`radius-container`、`radius-modal`）由 DTCG 源码编译进 `theme.json` 的 `cssVars.theme` 中（同时编译出等于 `radius-control` 的 A 层 `radius` 槽）；`semantics.json` 的 `dimension.shape.{control,container,modal}` 通过 `{radius-…}` 引用它们，外加非 token 的 `shape.curve` 与 `shape.corners.button`。`theme.ts` 的 `shape.*` 经 `token()` 响应式解析这些引用，因此换主题或宿主覆写圆角 token 都会立即到达组件。

组件经 `style()`（响应式）和保持原形状的 `density`、`controlSize`、`motion`、`cornerCurve`、`focusRing`、`controls()` 读风格数据，换主题后下一帧重画。terminal 档的尺寸由字符格决定，留在代码里，不进主题。

**组件怎么读 `typography`。** 组件取字号、字重、行高、字距用 `font.size(role)`、`font.weight(role)`、`font.lineHeight(role)`、`font.letterSpacing(role)`（`theme.ts`，响应式，`size` 与 `lineHeight` 按 `tier` 取 pointer / touch 档；`lineHeight()` 返回整数点数，源码里的 DTCG 倍率已在 `tokens:build` 时乘回点数）：只取组件原来写了的那几项，所以没写字重的文字仍继承周围的字重。对应关系：控件上的字（按钮、标签、表单、菜单、标签页）取 `label` 的字重（500）、卡片与区块标题取 `title` 的字重（600）、正文类取 `body`；`body` 的字号（13 / 15）给面包屑、导航菜单、树、命令面板的行与对话框正文，`detail`（12 / 13）给侧栏的分组与计数，`caption`（11 / 12）给分段控件的数量，`label`（14 / 15）给输入框（`fieldSize.font`）。`body` 的行高（20 / 20）给对话框正文。**没有角色对得上的字号留在代码里**，各处有一行注释：按钮、徽标、侧栏档位的 12 / 13 / 14，对话框与卡片标题的 17 / 20、`body + 2`，日历格的 12.8 / 14 / 16，图表轴的 10 / 10.5，命令面板分组名的 11 加 0.6 字距，气泡与空状态说明的 1.5 倍行高（取整后 20 / 20，与 `body` 的 20 同值），以及写在 Tailwind 类里的 `text-sm` / `text-base` / `text-xs`、`font-semibold`（类名读不了 getter）。

**组件怎么读 `shape`、`stroke`、`state`、`size`、`controls`。** 圆角按层读 `shape.{control,container,modal,button}`（`theme.ts`，响应式）：页内元素（输入框、行、徽标、标签、井、色区、kbd）读 `shape.control`，按钮类控件（`Button`、`IconButton`、`SplitButton`、`Toggle`、`ButtonGroup`、分页按钮、日历头部按钮）读 `shape.button`（`shape.corners.button` 为 `"full"` 时取 `999` 胶囊，否则取 `shape.control`），容器与浮层（卡片、菜单、弹出层、富提示、列表面板、toast）读 `shape.container`，模态面（对话框、抽屉、底部面板）读 `shape.modal`；嵌套表面不再单设 `inset` 圆角角色，改用 `rounded(outer, inset)` 按同心推出（内 = 外 − inset，不小于 0）：复选框的钩、分段控件的滑块与轨道、组合框的箭头钮、附件缩略图与颜色选择器的色块；复选框小角在组件预设 `checkboxPresets.corner`。线宽读 `stroke`（`dimension.stroke`），只有两条：控件的描边 `stroke.control`（按钮、输入框、选择器、复选框、分段、标签页、徽标…）与发丝线 `stroke.hairline`（分隔线、描边变体，以及卡片、面板、浮层与弹窗等表面的边 —— Material 不要这道边，由它的 finish 把 `border-color` 写成 `transparent`，而不是把线宽设成 0）；焦点环宽只有 `dimension.focus.width`，由 `focusRing()` 读。按下的透明度 `dimmed.pressed`（`state["pressed-opacity"]`），静止的指示器（滚动条滑块）读 `dimmed.rest`（`state["rest-opacity"]`，默认 `0.5`），在指针下或被拖动时升到 `dimmed.pressed`（写进滑块的 class 字符串：悬停是 class 的事），强调色控件按下时读 `finish.accent.pressedOpacity`（`accent` 的 `pressed-opacity`），按下时换强调色的主题再读 `finish.accent` 的 `pressedBackground` / `pressedForeground`；禁用时若 `state.disabled.fill` 为 `false` 则沿用统一视图 `opacity: dimmed.disabled`，为 `true`（Material / WinUI）则由 `finish.disabled`（无边/关态另按变体设边）绘容器、由 `finish.disabled.foreground` 绘字与图标；`state.overlay` 经 `stateLayer(kind)` 变成一层前景色的渐变，`hovered()` 已带上悬停的那一层（default 的叠色是 0，不画）。尺寸：高度只有一把尺子 `dimension.size.height`（`controlHeight.sm / md / lg` 与 `controlSize.row`、`controlSize.line`、`controlSize.tabs` 都取它，`row`/`line`/`tabs` 取 `lg`），图标一把 `dimension.icon`（`iconSize` 与 `controlSize.control`、`controlSize.clear` 取 `md`，`controlSize.check` 取 `sm`），触控目标 `hitTarget()`（`dimension.size.hit`；`touchSlop`、`switchHitSlop` 按它补点按范围；0 不补）。各控件家族随平台切换的几何、指示条样式与粗细（`checkbox`、`switch`、`slider`、`radio-group`、`progress`、`spinner`、`tabs`、`calendar`、`sheet` 抓取条、`sidebar` 选中条与字段指示器）归属各自组件及共享 `lib/indicator` 的 `Record<Controls, …>` 预设表，经 `controls()` 选用；控件维度的六档由 `control()` 读，换主题后下一帧重画。

**留在代码里的值**，各处有注释：Tailwind 类里的 `rounded-(--radius-control)` / `rounded-(--radius-container)` / `rounded-(--radius-modal)` / `rounded-[4px]`、`active:opacity-70`、`disabled:opacity-50`、`border`（类名读不了 getter，前三者读 `theme.json` 的 token，与 `shape` 同值）；半高或半径推出的圆（`height / 2`、`side / 2`：胶囊、圆点、开关、进度条）；选择器的 2 点焦点边（`select.tsx` 的 `outlineWidth: 2`，它是边的渐显，不是焦点环）；实心按钮悬停与选中的 0.94 / 0.88 不透明度，附件失败时的 0.6，子菜单禁用的 0.35（没有对应的 state 角色）；toast 的 2 点色条、进度的 2 点限位、头像 2 点的环（装饰，不是 stroke 角色）；圆角 1 / 2 / 3 / 4 / 5 的小件（拇指、插入符、进度条端点、日历格的 17 等）。

正文家族不经本库读取：每个字阶复合 token 的 `fontFamily` 是 `{font.family.sans}`，NSH 用它画所有没写字体的文字，所以 `typography` 组上没有字体家族的扩展，语义层里没有顶层的字体家族键，`theme.ts` 里也没有解析正文家族的 getter；宿主覆写 `font-sans` 由 NSH 生效。

### 枚举与取值

每一组枚举只有这一份清单：`scripts/theme/style.ts` 的 `whitelists` 必须与下表一致，`check:theme` 两边对账（少一行、多一个值都点名）。取值名是行为词，同一个名字可以在另一个维度里有另一个意思（`track` 既是轨道的形状，也是 `group` 的一个取值）；平台自己的名字原样保留（`standard`、`box-underline`），其余不用组件名、不用主题名。

<!-- theme-lint: enums -->

| 键                                | 取值                                                                                                                                        | 管什么                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `typography.*.fontWeight`         | `400` `500` `600` `700`                                                                                                                     | 字重                                            |
| `shape.curve`                     | `continuous` `circular`                                                                                                                     | 圆角的曲率（Apple 是连续曲线）                  |
| `shape.corners.button`            | `radius` `full`                                                                                                                             | 按钮的角：取圆角刻度，还是胶囊                  |
| `dimension.size.control.*.switch` | `small` `regular`                                                                                                                           | 开关的钮取哪一档                                |
| `dimension.focus.style`           | `halo` `outline` `double`                                                                                                                   | 焦点环的画法                                    |
| `dimension.control.selection`     | `pill` `underline` `bar`                                                                                                                    | 选中项的那块记号画成什么、覆盖多宽              |
| `dimension.control.field`         | `box` `underline` `box-underline`                                                                                                           | 输入井的框：四条边、只下边、还是框加下边        |
| `dimension.control.choice`        | `well` `outline` `inset`                                                                                                                    | 选择框静止时的面，勾选记号由值推出              |
| `dimension.control.track`         | `sunk` `tint` `hairline`                                                                                                                    | 轨道：凹槽、色带、还是一条细线                  |
| `dimension.control.handle`        | `circle` `bar` `ring`                                                                                                                       | 手柄：圆钮、竖条、环                            |
| `dimension.control.group`         | `track` `cells`                                                                                                                             | 一组互斥按钮：轨道里的胶囊，还是相邻格          |
| `transition.enter.timingFunction` | `out-cubic` `in-cubic` `in-out-cubic` `standard` `emphasized-decelerate` `emphasized-accelerate` `decelerate` `accelerate` `point-to-point` | 表面进场用的缓动名（引用 `cubicBezier.<name>`） |
| `controls`                        | `base` `material` `winui`                                                                                                                   | 控件几何预设家族（第 4 阶段随预设表一起移除）   |

<!-- /theme-lint: enums -->

`finish` 的 `material`（`none` `glass` `acrylic`）不在这张表里：它是 finish 的字段，由 `scripts/theme/dtcg.ts` 在生成时校验。

**六个控件维度各主题取什么。** 四套基础主题取同一档（合成一列），`material` 与 `winui` 只写与默认不同的键，编译后六个键都齐全；`check:theme` 拿这张表与六套 `semantics.json` 逐格对账。维度名、取值名之外，其余不建主题键：`span`、`indicatorCorners` 由取值自带，控件的兜底写在控件里。

<!-- theme-lint: controls -->

| 维度        | `default` `shadcn` `solid-glass` `apple` | `material`  | `winui`         |
| ----------- | ---------------------------------------- | ----------- | --------------- |
| `selection` | `pill`                                   | `underline` | `bar`           |
| `field`     | `box`                                    | `underline` | `box-underline` |
| `choice`    | `well`                                   | `outline`   | `inset`         |
| `track`     | `sunk`                                   | `tint`      | `hairline`      |
| `handle`    | `circle`                                 | `bar`       | `ring`          |
| `group`     | `track`                                  | `cells`     | `track`         |

<!-- /theme-lint: controls -->

**维度配方的数字。** 共同几何（高度、图标、圆点、内边距、间隙、描边、圆角）从刻度取；形态自己的官方数字写进取值的配方（`packages/ui/lib/look.ts`），由 `check:theme` 与下表对齐。下表是这些数字唯一的一处可查，改了数字就要改这里。

<!-- theme-lint: recipes -->

| 维度        | 取值        | 数字                                                             | 出处                                      |
| ----------- | ----------- | ---------------------------------------------------------------- | ----------------------------------------- |
| `selection` | `underline` | 标签下 3 点线，只覆盖标签，上两角半径 = 粗细的一半               | M3 PrimaryTabs 3 dp                       |
| `selection` | `bar`       | 整项下 3 点线，胶囊端                                            | WinUI SelectorBar / NavigationView 指示条 |
| `choice`    | `well`      | 井的角 5 / 7（触屏）                                             | 本库自有                                  |
| `choice`    | `outline`   | 描边 2 px、角 2，点按范围外扩 `size.target`                      | M3 outline 2 dp、state layer 40 dp        |
| `choice`    | `inset`     | 边框 1 px、角 4                                                  | WinUI `ControlStrokeColorDefault`         |
| `track`     | `sunk`      | 沟：progress 6、slider 6，spinner 带 0.25 的底                   | 本库自有                                  |
| `track`     | `tint`      | 色带：progress 4、slider 16                                      | M3 16 dp 轨道                             |
| `track`     | `hairline`  | progress 3 的条 + 1 的线、slider 4                               | WinUI                                     |
| `handle`    | `circle`    | slider 6 轨道 / 14 钮（触屏 8 / 20，按压 32）；switch 的钮也用它 | 本库自有                                  |
| `handle`    | `bar`       | 4 × 44 钮（按压 2 宽）、16 轨道、端点圆 2                        | M3                                        |
| `handle`    | `ring`      | 18 px 钮带 12 的点（悬停 14、按下 10）、4 px 轨道                | WinUI                                     |
| `group`     | `cells`     | 格高 40、内边距 12、间隙 8、勾 18                                | M3 SegmentedButton                        |

<!-- /theme-lint: recipes -->

## 3 固定形状

**每种主题、每种外观里，合并 `shared` 与稀疏覆写后的同一个 finish 的角色集合一样，且等于默认主题的那一份；字段集合也一样，除了可以缺的 `gradient`、`backdropFilter`、`material`。** 一个主题觉得“我没有渐变”，答案是不写 `gradient`——不是写一条两个 stop 同色的渐变。`fillStyle()` 与 `sliderFill` 读到 `undefined` 就是没有背景图，换主题不会换出另一种结构。

引擎先画 `backgroundColor`，再把 `backgroundImage` 叠上去（`references/nsh/crates/nsh-core/src/canvas.rs`），所以一个面有底、有渐变两层，**颜色写在一层上，另一层留空**：

- **平涂**（大多数 finish）：颜色在 `background`，没有渐变。
- **渐变承担颜色**（`accent` 在 `solid-glass` 里的一段）：颜色在渐变里，`background` 不写。底下垫一个不透明的颜色不是“看不见”的：它会从渐变里透出来，实测把默认主题的 `progress` 整条调亮 15/255，`port:render` 会拦下。

两层不能同时清空：默认主题里画出底色的 finish，在每个主题里都画出底色；默认主题里清空的（`inset`：靠影子和边画出来的井与槽），在每个主题里都清空。`theme-lint` 检查这一条。`port:render:theme` 拦不住这种错：组件和参照页读的是同一个 finish，一起变透明时两张图依然相同。

### 影子刻度

一个 finish 的 `shadow` 是一串刻度里几部分的引用，不写任何影子值：

```json
"shadow": { "$type": "shadow", "$value": ["{shadow.edge.surface}", "{shadow.sm}"] }
```

刻度的值是 DTCG 的 `shadow` composite token，写在 light / dark 源文件的 `shadow` 组里，编译进 `semantics.json` 的 `elevation`；`theme.ts` 的 `elevation(level)` 读一组，`themed()` 把 finish 点名的那几部分接成一条 CSS 影子给 `boxShadow`。

| 部分           | 画什么                               | 谁穿                                           | 出处                                                   |
| -------------- | ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------ |
| `sm`           | 控件的接触影：卡片上的面离卡片一步   | `raised`、`knob`、`hover`、`disabled`、`glass` | shadcn `shadow-xs`/`shadow-sm`，WinUI 控件深度 2px     |
| `md`           | 卡片离页面一步                       | `card`                                         | shadcn `shadow-sm`/`shadow-md`，M3 level 1，WinUI 8    |
| `lg`           | 浮层离页面好几步                     | `overlay`、`inverse`                           | shadcn `shadow-md`/`shadow-lg`，M3 level 2，WinUI 32   |
| `xl`           | 模态面：页面在它后面等着             | `modal`                                        | shadcn `shadow-lg`，M3 level 3，WinUI 128              |
| `inset`        | 井：光落进凹槽                       | `inset`、`pressed`                             | CSS `inset` 阴影                                       |
| `edge.surface` | 凸起面的硬边：内高光、一道发丝       | `raised`、`hover`、`disabled`、`glass`         | WinUI `ControlElevationBorderBrush`、Apple 的 0.5px 环 |
| `edge.accent`  | 强调色填充自己的边：高光、自己的投影 | `accent`                                       | `brand-edge` 的对应物                                  |

规则（`check:theme` 与 DTCG lint 各查一遍）：每个外观最多 4 档 `elevation`、最多 7 个部分；一个 finish 的 `shadow` 只能是这些部分的引用；一个主题没写某部分，就写 `none`（`$extensions` 里的 `none: true`），引用它的 finish 里那部分整段消失——所以 `apple` 的 `inset` 是空的，`shadcn` 的 `edge.*` 是空的，同一个 finish 在主题之间仍然说得通。

**折掉的档位**（有意为之，记在这里）：`solid-glass` 的旋钮投影（0.3）与控件影（0.06）落进同一档 `sm`；`default` 的卡片影（0.04）与控件影（0.05）落进同一档 `md`；`apple` 的浮层与模态面本来就没有更深的档，`lg` 与 `xl` 同值。

**`material`**（#267）是一个 finish 向平台要的原生材质，**每个 finish 都写**，不要就写 `"none"`（形状固定，不删字段）。源码里的取值只有三个：`"none"`、`"glass"`、`"acrylic"`，编译进 `semantics.json` 时是 `"glass"`、`"acrylic"` 或 `null`（`"none"` 与平涂不写 `gradient` 一样，编译后什么都不写）。

配方只有一份，在 `packages/theme/materials.ts`；主题只点名，不写平台参数：

| 值        | 展开                                                                                                                        | 谁用                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `none`    | 不展开                                                                                                                      | 其余所有层                                         |
| `glass`   | style 里的 `glassEffect: "regular"` 与 `glassTintColor`（该面自己的 `background`），`ios={{ backdropMaterial: "regular" }}` | `apple` 的 `overlay`、`inverse`、`raised`、`glass` |
| `acrylic` | `windows={{ backdrop: { material: "blur" } }}`（宿主窗口的模糊）                                                            | `winui` 的 `overlay`                               |

**玻璃要有回落。** 系统玻璃只在 iOS / macOS 26 及以上画出来，Acrylic 的模糊只在 Windows 11 的透明窗口里画出来，别处画的是 `backdropFilter`。所以每个配方都带回落：模糊半径（30px）与面色的最低不透明度（`glass` 0.72、`acrylic` 0.85）。`themed()` 在缺 `backdropFilter` 时补上配方的模糊；`check:theme` 核对面色 alpha 不低于最低值（`checkMaterialFill`），否则面板后面的字会原样透出来（#251）。

**`elevation`** 是 Android 自己的阴影高度（dp），只有要平台阴影的层写（`material` 主题的 `card`、`raised`、`hover`、`pressed` 是 1，`overlay`、`glass` 是 3，`modal`、`inverse` 是 6）。它和 `shadow` 无关：`shadow` 是画出来的影子，`elevation` 是平台按高度生成的影子。

`themed()` 从不把 `material` 放进 style；style 里只多配方的玻璃键，`material` 为 `null` 时键与以前完全一样。`ios`、`windows` 不是 style 键，由 `theme.ts` 的 `platformMaterial(role)` 按配方返回，`elevation` 在同一处作为 `android.elevation`，组件在同一个 View 上铺开：`<View {...platformMaterial("overlay")} style={{ ...finish.overlay }} />`。`check:theme` 检查 `material` 存在于每个 finish、取值是三个之一，`elevation` 是非负数值（`scripts/theme/material.ts`）。

字段顺序固定：`background`、`gradient`、`shadow`、`foreground`、`border-color`、`border-top-color`、`border-bottom-color`、`backdropFilter`、`material`、`elevation`（后两者按需缺）。`tokens:build`（`scripts/tokens/compile.ts`）按默认主题的字段顺序写出编译产物；`check:theme` 拦下比默认主题多一个或少一个字段的 finish。

## 4 每个 finish

十二个层，一个面属于哪一层只由它“是什么”决定，不由它“画了什么”决定。旧的 27 个角色折进这里：`section`→`card`，`field`/`track`/`groove`→`inset`，`chip`/`pill`→`raised`，`menu`→`overlay`，`tooltip`→`inverse`，`light`/`fill`/`on`→`accent`，`accentPressed`→`pressed`（填充色按下见下），`thumb`→`raised`，`knobOn`/`handle`→`knob`，`grabber`→`sheet` 的控件预设。

<!-- theme-lint: finishes -->

| finish     | 画什么                                                                          | What it draws                                                              | 谁读                                                                                |
| ---------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `card`     | 卡片的底：一道接触影                                                            | A card's face: one contact shadow                                          | `sidebar`、`card`、`lib/surface`                                                    |
| `inset`    | 凹下去的一层：输入井、轨道、槽、凹槽                                            | A well: a field, a track, a groove                                         | `lib/surface`、`input`、`select`、`tabs`、`switch`、`slider`、`progress`、`menu`    |
| `raised`   | 卡片上的控件：内高光、接触影、边；分段与胶囊标签页选中的那块                    | A control on a card: an inner highlight, a contact shadow, an edge         | `button`、`select`、`radio-group`、`carousel`、`combobox`、`segmented`、`tabs`      |
| `overlay`  | 浮层：菜单、弹层、toast                                                         | A floating surface: a menu, a popover                                      | `popover`、`lib/listbox`、`menu`、`command`                                         |
| `modal`    | 模态面：对话框、抽屉、底部面板                                                  | A modal's face: a dialog, a sheet                                          | `dialog`、`sheet`                                                                   |
| `inverse`  | 反色的面：toast、提示                                                           | The page's inverse: a toast, a tooltip                                     | `toast`、`tooltip`                                                                  |
| `glass`    | 玻璃：半透明底 + 模糊                                                           | Glass: a translucent fill and a blur                                       | `carousel`、`lib/surface`                                                           |
| `accent`   | 强调色的面：主操作、选中的开关/勾选/进度                                        | The accent's own surface: the main action, a chosen switch, a progress run | `button`、`toggle`、`checkbox`、`switch`、`slider`、`progress`、`collapsing-header` |
| `knob`     | 旋钮：开关圆点、滑杆把手（不带字）                                              | A knob: a switch's thumb, a slider's handle (no text on it)                | `switch`、`slider`                                                                  |
| `hover`    | 指针停在可点项上的那一步                                                        | The step a control takes under the pointer                                 | `button`、`carousel`                                                                |
| `pressed`  | 按下的那一步（填充色按下读 `accent`，按它的 `pressed-opacity` 变淡，见第 6 节） | The step a control takes while pressed                                     | `button`                                                                            |
| `disabled` | 禁用控件：容器与它自己的 `foreground`                                           | A disabled control's container and its own `foreground`                    | `button`、`toggle`                                                                  |

<!-- /theme-lint: finishes -->

每个 finish 都写 `foreground`（面上的字与图标），所以组件不用 `?? colors.foreground` 兜底：`card`/`inset`/`raised`/`overlay`/`modal`/`glass`/`knob`/`hover`/`pressed` 是 `{foreground}`（`knob` 上不写字，它的 `foreground` 只为形状一致，`theme:contrast` 不查它），`accent` 是 `{primary-foreground}`，`inverse` 是 `{inverse-foreground}`，`disabled` 是 `{muted-foreground}`。填充色的按下态是 `accent` 按自己的 `pressed-opacity`（`finish.accent.pressedOpacity`，每套主题都写：按下变淡的主题写 0.88，按下叠色或换面的 Material / WinUI 写 1）变淡，不再另设一个面；主题若在按下时换掉强调色（WinUI 的 `AccentFillColorTertiary`），就在 `accent` 上多写两个字段 `pressed-background` 与 `pressed-foreground`，`button` 按下时读它们。

## 5 alias 与例外

一个 finish 的颜色这样写：

1. **alias**：`{token}`，token 必须在同一主题的 `light`/`dark` 或 `cssVars.theme` 里且为 `color` 类型。`theme.ts` 的 `themed()` 在**读的时候**把它换成当前主题、外观与宿主覆写的颜色（`token(name)`，NSH 给的 `#rrggbbaa`），所以切外观、`selectTheme` 切主题与宿主覆写都自动生效。
2. **墨色**：`oklch(0 0 0 / a)`、`oklch(1 0 0 / a)` 允许字面——刻度的每一部分都由它组成。
3. **`transparent`**：允许，表示这一面没有边。
4. **带 alpha 的 token**：`oklch(from {token} l c h / a)`——一个 token 的颜色换一个透明度，唯一允许的相对颜色写法（见第 7 节）。`alias()` 在读的时候把它展开成具体的颜色，因为 NSH 的 CSS 解析器不认相对颜色。
5. **`shadow` 不写颜色**：它只点名刻度的部分，颜色在刻度里（见第 3 节）。
6. 其它字面量一律不许出现，除非它在第 7 节的待定表里：那是一份清单，说明这个颜色还没有 token，暂时留在 finish 里。表里的每一条都是待办，不是许可。

## 6 折叠与例外

十二个层不是十二个恰好画得一样的面：一个面属于哪一层，由它是什么决定。三条折叠需要理由，记在这里：

| 折起来的东西                                     | 为什么是一层                                                                                                                                                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `accentPressed` → `pressed`                      | 按下是控件的事，不是面的事。填充色按下不是另一个面：`accent` 按自己的 `pressed-opacity` 变淡，按下时换强调色的主题在 `accent` 上写 `pressed-background` / `pressed-foreground`——一个面的按下态只该暗一点，不该换一整套边和阴影 |
| `knobOn` / `handle` → `knob`；`thumb` → `raised` | 开关圆点与滑杆把手都是“一个能拨动、不带字的小块”，开着的开关圆点改读 `accent` 的字色；分段与胶囊标签页选中的那块上面有字，是一块抬起来的面，读 `raised`——`knob` 在暗色下是白色圆点（iOS、shadcn），字写不上去                  |
| `grabber` → `sheet` 的控件预设                   | 抓取条是抽屉这个控件的一部分，不是一个层；`sheetGrabber()` 画它（`alpha(colors.mutedForeground, 0.4)`）                                                                                                                        |

`light` 与 `accent` 本来就是同一个面（在五套主题里逐字节相同），`fill` 与 `on` 是强调色的两种用法，`field`/`track`/`groove` 是井的不同深度，`chip`/`pill` 是控件面，`tooltip` 是反色面——它们不是“值相同但决定不同”，是同一层上的不同控件。

## 7 待定颜色

一个 finish 里的颜色离开这张表只有三条路，每条的理由不同：

1. **一个 token 的颜色，带别的 alpha**：写 `oklch(from {token} l c h / a)`。像素不变：`alias()` 从当前主题里取出那个 token 的值，替换其 alpha。`theme-lint` 只认这一种写法，`from` 后面的 `{token}` 必须是这个主题真有的 `color` 类型 token；别的相对形式（把 alpha 写成 `{token}`、在 L/C/H 里用 `calc()`）仍然算“没有 token 的颜色”。
2. **与某个 token 肉眼无差**：ΔL ≤ 0.015、ΔC ≤ 0.003、色相在同一段灰里，就写 `{token}`。像素会有一两个单位的差别，受影响的基线重拍。数值够近但语义不对的不换：`chart-*` 是数据色，`track` 是槽的底，一个选中的行不该跟着图表的颜色走。
3. **材质自己的设计色**：同一个主题的两个外观里值相同、语义相同，又出现在两处以上，就进 `theme.json` 的 B 层（第 1 节）。default 用原来的值，另外两个主题取自己同一位置的颜色或最近的 token，零像素变化。只在一处出现的，留在表里。

表里剩下的二十二行都是第 3 条没走的、只在一两处出现的材质色：`modal` 的底色比 `field`/`popover` 高一档（Material 的 `SurfaceContainerHigh`）、WinUI 的四道描边在基色上合成、开关圆点比 `knob` 深两档、WinUI 按下时换的强调色与它的字（`AccentFillColorTertiary` / `TextOnAccentFillColorSecondary`）。

`theme-lint` 管两头：表外的字面量报错；表里的条目如果哪个主题都不再写它，也报错——留下一行对不上的，等于给那个颜色留了一条悄悄回来的路。

<!-- theme-lint: pending -->

| 主题        | 外观  | 色值                             | 位置                                                                                       | 最接近的 token                              |
| ----------- | ----- | -------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| default     | dark  | `oklch(0.88185 0.00589 264.53)`  | `knob.gradient`                                                                            | `knob`（ΔL +0.040，ΔC -0.002）              |
| default     | dark  | `oklch(0.8324 0.00597 264.528)`  | `knob.border-color`                                                                        | `knob`（ΔL +0.090，ΔC -0.002）              |
| material    | light | `oklch(0.93251 0.01479 312.24)`  | `modal.background`（`SurfaceContainerHigh`，本库没有同名角色）                             | `field`（ΔL -0.019，ΔC -0.001）             |
| material    | dark  | `oklch(0.2859 0.01293 298.633)`  | `modal.background`（同上）                                                                 | `popover`（ΔL -0.041，ΔC +0.001）           |
| shadcn      | dark  | `oklch(0.34846 0 0)`             | `pressed.background`                                                                       | `chart-4`（ΔL -0.023，ΔC -0.000，语义不同） |
| solid-glass | light | `oklch(0.38 0.03 265 / 0.22)`    | `overlay.border-color`、`inverse.border-color`                                             | `muted`（ΔL +0.079，ΔC +0.011）             |
| winui       | light | `oklch(0.92191 0 0)`             | `card.border-color`（`CardStrokeColorDefault`）                                            | `border`                                    |
| winui       | light | `oklch(0.81093 0 0)`             | `modal.border-color`（`SurfaceStrokeColorDefault` 在基色上合成）                           | `border`（ΔL -0.107，ΔC 0）                 |
| winui       | light | `oklch(0.84522 0 0)`             | `raised.border-bottom-color`、`hover.border-bottom-color`（`ControlStrokeColorSecondary`） | `border`（ΔL +0.077，ΔC 0）                 |
| winui       | light | `oklch(0.52768 0.14982 252.341)` | `accent.border-color`、`accent.border-top-color`（`ControlStrokeColorOnAccentDefault`）    | `primary`（ΔL -0.036，ΔC -0.010）           |
| winui       | light | `oklch(0.97015 0 0)`             | `disabled.background`（`ControlFillColorDisabled`）                                        | `raised`（ΔL +0.018，ΔC 0）                 |
| winui       | light | `oklch(0.68949 0 0)`             | `disabled.foreground`（`TextFillColorDisabled`）                                           | `input`（ΔL -0.069，ΔC 0）                  |
| winui       | dark  | `oklch(0.23075 0 0)`             | `card.border-color`（`CardStrokeColorDefault`）                                            | `border`                                    |
| winui       | dark  | `oklch(0.37909 0 0)`             | `modal.border-color`（`SurfaceStrokeColorDefault` 在基色上合成）                           | `border`（ΔL +0.070，ΔC 0）                 |
| winui       | dark  | `oklch(0.32897 0 0)`             | `raised.border-top-color`、`hover.border-top-color`（`ControlStrokeColorSecondary`）       | `line`（ΔL -0.012，ΔC 0）                   |
| winui       | dark  | `oklch(0.81732 0.11439 230)`     | `accent.border-color`、`accent.border-top-color`（`ControlStrokeColorOnAccentDefault`）    | `primary`（ΔL -0.013，ΔC +0.008）           |
| winui       | dark  | `oklch(0.28502 0 0)`             | `disabled.background`（`ControlFillColorDisabled`）                                        | `raised`（ΔL +0.012，ΔC 0）                 |
| winui       | dark  | `oklch(0.54863 0 0)`             | `disabled.foreground`（`TextFillColorDisabled`）                                           | `faint`（ΔL +0.124，ΔC 0）                  |
| winui       | light | `oklch(0.5773 0.13223 250.006)`  | `accent.pressed-background`（`AccentFillColorTertiary` 在基色上合成）                      | `info`（ΔL +0.010，ΔC -0.034）              |
| winui       | light | `oklch(0.87245 0.03754 247.003)` | `accent.pressed-foreground`（`TextOnAccentFillColorSecondary` 在按下底色上合成）           | `brand-tint`（ΔL -0.042，ΔC +0.022）        |
| winui       | dark  | `oklch(0.70029 0.10192 230.522)` | `accent.pressed-background`（同上）                                                        | `brand-edge`（ΔL -0.021，ΔC -0.006）        |
| winui       | dark  | `oklch(0.42706 0.05878 229.834)` | `accent.pressed-foreground`（同上）                                                        | `brand-tint`（ΔL +0.122，ΔC +0.041）        |

<!-- /theme-lint: pending -->

## 8 留给应用

`theme-lint` 要求每个 token 和每个 finish 都被读到，否则就是写了没人用。上游的 `pill` 折进 `raised` 之后，本库的十二个层都由组件读着，这张表是空的——写一个没人读的 finish，组件里就会多一个看不出用处的东西。

<!-- theme-lint: unread -->

<!-- /theme-lint: unread -->

## 9 加一个 token 之前

1. 先看上游：`references/nsh/examples/nsh-gallery-ui` 的 `look/*` 里有没有同一个面，`references/nsh/website/demos/el-<id>.tsx` 用它做什么。
2. 再看 shadcn 的主题有没有：A 层的槽已经覆盖了 shadcn 的全部颜色，能对上就用槽，不要另起一个同义的名字。
3. 确实要加，就在第 1 节的 B 层（逐外观的颜色）或 C 层（两种外观一样）表格里写清楚：管什么、谁读。同时让组件真的读它，否则 `theme-lint` 会问它被谁读。
4. 六套主题都要有：默认主题手写值；`shadcn`、`solid-glass`、`apple`、`material`、`winui` 由 `scripts/theme/generate-<id>.ts` 生成（改生成器，不改产物）。
5. 跑 `bun scripts/theme-lint.ts` 与 `bun run port:render:theme`：前者管形状，后者管像素——加 token 不该改一个像素，改了就是形状或颜色出了问题。
