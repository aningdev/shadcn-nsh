# 主题的构成：token、finish 与 alias

本库的颜色只有一个来源，一个面的样子只有一张表，二者之间用 alias 相连：

| 文件                           | 管什么                                                                                                   | 不管什么                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| `packages/theme/theme.json`    | 颜色：每个 token 在 light / dark 下的值                                                                  | 面、边、影、渐变、模糊   |
| `packages/theme/finishes.json` | 风格：与外观无关的字体、形状、尺寸、动效、状态，加上每种外观下各个 finish 的面（底、渐变、边、影、模糊） | 颜色字面量（只写 alias） |
| `packages/theme/theme.ts`      | 读时把 alias 换成当前主题与外观的颜色（`themed()`）                                                      | 具体颜色值               |
| `packages/ui/*.tsx`            | 只经 `finish.*` 与 `colors.*` 取色                                                                       | 内联颜色                 |

这样定，是为了两件事：

- **改一个颜色只改一处。** 组件里没有颜色字面量，`finishes.json` 里只有 `var(--token)`，改 token 的值同时改到所有用到它的面。
- **平涂的主题不必删字段。** 一个没有渐变的外观也必须给出 `backgroundImage`（见第 3 节），形状在主题之间不变，渲染时才不需要分支。

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

| token                           | 管什么                                                           | 谁读                                                                         |
| ------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `inset`                         | 卡片里凹下去的一层（井）                                         | `lib/surface`、`otp-input`、`sidebar`、`menu`、`dock-area`                   |
| `raised`                        | 卡片上凸起的一层：按钮、字段、轨道                               | `button`、`select`、`radio-group`、`carousel`、`dock-area`                   |
| `field`                         | 输入井：比卡片和 inset 更下一层                                  | `input`、`select`、`combobox`、`checkbox`、`code-editor`                     |
| `hover`                         | 指针停在可点项上的那一步                                         | `button`、`select`、`input`、`command`、`tree`、`menu`                       |
| `line`                          | 井里的发丝线（分隔、网格）                                       | `tabs`、`otp-input`、`number-input`、`input`、`lib/surface`                  |
| `faint`                         | 更弱的字：占位、单位、次要标记                                   | `input`、`combobox`、`number-input`                                          |
| `brand`                         | 强调色作为前景：字、图标、线                                     | `input`、`calendar`、`command`、`otp-input`、`lib/listbox`                   |
| `brand-edge`                    | 强调色填充的那条边：主按钮的发丝线                               | `theme.ts` 的 `colors.brandEdge`                                             |
| `brand-fill`                    | 强调色作为填充（见 C 层）                                        | `calendar`                                                                   |
| `on-brand`                      | `brand-fill` 上的字（见 C 层）                                   | `calendar`                                                                   |
| `glass-edge`                    | 玻璃面上的发丝线：控件、胶囊、玻璃、浮层外框                     | `theme.ts` 的 `colors.glassEdge`                                             |
| `track`                         | 关着的开关、滑杆、进度条底槽                                     | `switch`、`slider`、`progress`、`tabs`、`listbox`                            |
| `knob`                          | 关着的开关圆点（`finish.knob` 的白底）                           | `theme.ts` 的 `colors.knob`                                                  |
| `code`                          | 井里的等宽字                                                     | `theme.ts` 的 `colors.code`                                                  |
| `info` / `warn` / `up` / `down` | 四状态色：提示、警告、增长、下降                                 | `progress`、`diff-view`、`code-editor`、`status`                             |
| `brand-tint` 等 `*-tint`        | 状态色的淡底（`info`、`warn`、`destructive`、`up`、`down` 各一） | `theme.ts` 的 `colors` 映射；`brand-tint` 另见 `calendar`、`tree`、`command` |
| `scrollbar-thumb` / `-hover`    | 滚动条滑块及其悬停                                               | `scrollbar`                                                                  |
| `ring-halo`                     | 焦点环外面的一圈晕                                               | `theme.ts` 的 `focusRing`                                                    |
| `violet`                        | 第三个数据色：图的一条线、链接                                   | `link`、`plot`                                                               |
| `window-control-off`            | 窗口按钮不可用时的底                                             | `theme.ts`                                                                   |

`destructive` 本身是 A 层（shadcn 的），本库的 `colors.destructive` 指向它；`down` 是另一个色，红得更亮一点，用在数据里表示下降（见[为什么不合并](#6-why-identical-values-are-not-merged)）。

### C 层：两种外观一样的值

`cssVars.theme` 里的键在 light 和 dark 下不各写一份——写两份就是两份要同步的答案。圆角是数，字体是一个家族名，颜色是值：

<!-- theme-lint: tokens-c -->

| 键                                                 | 值                      | 用途                                                            |
| -------------------------------------------------- | ----------------------- | --------------------------------------------------------------- |
| `radius` / `radius-card` / `radius-control`        | `10px` / `14px` / `8px` | 基础圆角与由它推导的两档                                        |
| `font-mono`                                        | `monospace`             | 等宽字：`font-mono` 类、`Text` 里的代码、`theme.ts` 的 `mono()` |
| `brand-fill`                                       | 强调色的填充            | `calendar` 的选中日                                             |
| `on-brand`                                         | `brand-fill` 上的字     | 同上                                                            |
| `scrim`                                            | 遮罩                    | `lib/popup`、`dock-area`                                        |
| `on-media`                                         | 照片上的白字            | `theme.ts` 的 `colors.onMedia`；不随外观翻转                    |
| `chart-foreground`                                 | 浅色图块上的深字        | `theme.ts` 的 `colors.chartForeground`；深色块用 `on-media`     |
| `window-close` / `window-minimize` / `window-zoom` | 三颗窗口按钮各自的色    | `theme.ts` 的窗口按钮映射                                       |
| `window-control-ink` / `window-control-edge`       | 窗口按钮的字与边        | 同上                                                            |

<!-- /theme-lint: tokens-c -->

`radius` 是唯一的基础值：`radius-control` = round(0.8 × `radius`)，`radius-card` = round(1.4 × `radius`)，`check:theme` 拒绝不合的档位；对话框用 `radius-card`。读主题圆角的角一律用 `rounded()`，continuous 曲线只在 `packages/theme/theme.ts` 给。

`font-mono` 是字体不是颜色：NSH 取列表里第一个不是通用名的家族（`theme.rs` 的 `font_family`），写 `monospace` 就是系统的等宽字，不是一套叫这个名字的字体——本库三套主题都写它，所以这份 token 不动一个像素；应用在自己的主题里写 `"JetBrains Mono, monospace"` 并引入字体文件，见[字体](https://shadcn-nsh.aning.dev/docs/theme#fonts)。`font-sans` 故意不写：不写就是系统字，写了就要求应用自带那个家族。

## 2 finishes.json 的两条线

一个 finish 是一个面的样子，由这几样拼出来：

| 字段              | 写什么                                       |
| ----------------- | -------------------------------------------- |
| `backgroundColor` | 底：`var(--token)`、墨色，或 `transparent`   |
| `backgroundImage` | 叠在底上的渐变：`linear-gradient(180deg, …)` |
| `boxShadow`       | 内高光、接触影、投影：永远字面（墨色）       |
| `borderColor`     | 边：`var(--token)` 或 `transparent`          |
| `backdropFilter`  | 只有模糊，不放颜色                           |

颜色字段只有 `backgroundColor`、`backgroundImage`、`borderColor` 三个，规则也管这三个。`boxShadow` 例外：影子是墨色，不为几何、不为对比提供颜色，也就没有对应的 token——它在所有主题里都保留字面（黑或白带 alpha，或强调色的半透明墨）。一条影子里写了一个表面的颜色，是设计问题，不是 lint 能判的。

## 2b 风格数据

`finishes.json` 的顶层，在 `press` 与 `light` / `dark` 之间，还有九组**风格数据**：`type`（字体角色）、`shape`（圆角角色）、`size`（触控目标、密度、控件、控件高度）、`stroke`、`focus`、`state`（叠色与透明度）、`motion`、`icon`、`indicator`（外观枚举）。它们与 finish 无关，也与外观无关：一个主题写一份，light 和 dark 共用；随设备变的值分 `pointer` / `touch` 两档。每个键的含义和各平台的值在 [`native-themes.md`](native-themes.md) §3.2；`check:theme` 执行的规则是：

- **键集合相同。** 三套主题的风格数据有同样的键、同样类型的叶子，缺一个键就点名它。
- **枚举取白名单。** 字重、曲线、焦点样式、easing 名、`indicator` 的值都在 `scripts/theme/style.ts` 的列表里。
- **圆角一致。** `theme.json` 的 `radius`、`radius-card`、`radius-control` 与 `shape.inset`、`shape.card`、`shape.control` 是同一个数。

**`theme.json` 的圆角与 `shape` 怎么分工。** NSH 的 `token()` 和 Tailwind 的 `rounded-*` 类读 `theme.json`，所以那三档圆角留在那里；`shape` 按用途角色写圆角，是组件读的地方，三个平台的差别（胶囊、同心、只圆上两个角）只有它能表达。两处写同一个数的三个角色（`inset` ↔ `radius`、`card` ↔ `radius-card`、`control` ↔ `radius-control`）由 lint 保证相等；`field`、`chip`、`overlay`、`dialog`、`sheet` 只在 `shape` 里，生成的主题（shadcn、solid-glass）按半径推出它们，见 `scripts/theme/style.ts` 的 `withRadii`。

组件经 `style()`（响应式）和保持原形状的 `density`、`controlSize`、`motion`、`cornerCurve`、`focusRing` 读风格数据，换主题后下一帧重画。terminal 档的尺寸由字符格决定，留在代码里，不进主题。

**组件怎么读 `type`。** 组件取字号、字重、行高、字距用 `font.size(role)`、`font.weight(role)`、`font.line(role)`、`font.tracking(role)`（`theme.ts`，响应式，`size` 与 `line` 按 `tier` 取 pointer / touch 档）：只取组件原来写了的那几项，所以没写字重的文字仍继承周围的字重。对应关系：控件上的字（按钮、标签、表单、菜单、标签页）取 `label` 的字重（500）、卡片与区块标题取 `title` 的字重（600）、正文类取 `body`；`body` 的字号（13 / 15）给面包屑、导航菜单、树、命令面板的行与对话框正文，`detail`（12 / 13）给侧栏的分组与计数，`caption`（11 / 12）给分段控件的数量，`label`（14 / 15）给输入框（`fieldSize.font`）。`line` 的初值与组件今天画的一致：`body` 的 19 / 21 是对话框正文的行高。**没有角色对得上的字号留在代码里**，各处有一行注释：按钮、徽标、侧栏档位的 12 / 13 / 14，对话框与卡片标题的 17 / 20、`body + 2`，日历格的 12.8 / 14 / 16，图表轴的 10 / 10.5，命令面板分组名的 11 加 0.6 字距，气泡与空状态说明的 1.5 倍行高（取整后 20 / 23，与 `body.line` 的 19 / 21 不同），以及写在 Tailwind 类里的 `text-sm` / `text-base` / `text-xs`、`font-semibold`（类名读不了 getter）。

`type.family` 经 `selectTheme` 写进 `font-sans`（NSH 里每个没写家族的文字取它）：`null` 留给 `theme.json`（默认是系统字），`"sans"` 取 `theme.json` 的 `font-sans`，`"rounded"` 是圆体（`ui-rounded`），`"mono"` 取 `font-mono`。构建时的主题没有 `selectTheme` 这一步，它的家族照 `theme.json` 写。

## 3 固定形状

**每种主题、每种外观里，同一个 finish 的字段集合完全一样，且等于默认主题的那一份。** 一个主题觉得“我没有渐变”，答案不是删掉 `backgroundImage`，而是把它写成一种颜色：

```json
"backgroundImage": "linear-gradient(180deg, var(--primary) 0%, var(--primary) 100%)"
```

两个 stop 同色，等于没有渐变，但形状还在，`fillStyle()` 与 `sliderFill` 不需要 `undefined` 分支，换主题也就不会换出另一种结构。

引擎先画 `backgroundColor`，再把 `backgroundImage` 叠上去（`references/nsh/crates/nsh-core/src/canvas.rs`），所以一个面有底、有渐变两层：**颜色写在哪一层，另一层就写 `transparent`**，别把同一个颜色写两遍。三种情形：

- **平涂**（大多数 finish）：颜色在 `backgroundColor`，渐变在同一层上再来一遍——两个 stop 同色，看不出区别。
- **半透明**（`solid-glass` 的玻璃感）：颜色在 `backgroundColor`，渐变两站写 `transparent`；同一个半透明色画两遍，alpha 会翻倍（7% 的白变成 13.5%）。
- **渐变承担颜色**（`fill`：绿到深绿的一段）：颜色在渐变里，`backgroundColor` 写 `transparent`。底下垫一个不透明的颜色不是“看不见”的：它会从渐变里透出来，实测把默认主题的 `progress` 整条调亮 15/255，`port:render` 会拦下。在每个主题里都如此，哪怕颜色是半透明的：`solid-glass` 的 `fill` 把它的半透明墨色写在渐变的两站，底仍是 `transparent`。

两层不能同时清空：默认主题里画出底色的 finish，在每个主题里都画出底色；默认主题里清空的（`inset`、`field`、`track`、`groove`：靠阴影和边画出来的井与槽），在每个主题里都清空。`theme-lint` 检查这一条。`port:render:theme` 拦不住这种错：组件和参照页读的是同一个 finish，一起变透明时两张图依然相同。

字段顺序固定：`backgroundColor`、`backgroundImage`、`boxShadow`、`borderColor`、`backdropFilter`。`scripts/theme/order.ts` 的 `orderedFinish` 按默认主题的键序写文件，多一个或少一个键都报错。

## 4 每个 finish

<!-- theme-lint: finishes -->

| finish    | 画什么                                       | What it draws                                                                    | 谁读                                          |
| --------- | -------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| `card`    | 卡片的底：一道内高光、一道发丝、接触影、投影 | The card's face: an inner highlight, a hairline, a contact shadow and a cast one | `sidebar`                                     |
| `inset`   | 卡片里的井：只靠内阴影凹下去                 | The well inside a card: sunk by its inner shadow alone                           | `lib/surface`、`otp-input`、`sidebar`         |
| `field`   | 输入井的边与内阴影                           | A field's well: its edge and its inner shadow                                    | `input`、`select`、`combobox`、`checkbox`     |
| `raised`  | 卡片上的控件：渐变、内高光、硬投影、边       | A control on a card: a gradient, an inner highlight, a hard shadow, an edge      | `button`、`select`、`radio-group`、`carousel` |
| `hover`   | 悬停时那一步的底                             | The step the surface takes under the pointer                                     | `button`、`carousel`                          |
| `pressed` | 按下时那一步的底                             | The step it takes while pressed                                                  | `button`                                      |
| `light`   | 主操作：最亮的一档，强调色的渐变             | The main action's brightest step: the accent's gradient                          | `checkbox`                                    |
| `accent`  | 强调色的面（同 `light`）                     | The accent's face (the same as `light`)                                          | `button`                                      |
| `track`   | 底槽：内阴影 + 边                            | A groove: an inner shadow and an edge                                            | `tabs`、`slider`、`progress`、`switch`        |
| `fill`    | 已填充的一段（滑杆、进度、关掉的开关）       | The filled run: a slider, a progress bar, a switch that is on                    | `slider`、`progress`、`switch`                |
| `knob`    | 关着的开关圆点                               | A switch's knob, off                                                             | `switch`                                      |
| `knobOn`  | 开着的开关圆点                               | A switch's knob, on                                                              | `switch`                                      |
| `handle`  | 滑杆的把手（与 `knob` 分开，见第 6 节）      | A slider's handle (kept apart from `knob`, see 6)                                | `slider`                                      |
| `pill`    | 上游的胶囊面，留给应用                       | The upstream capsule, left to the app                                            | —（见第 8 节）                                |
| `thumb`   | 分段控件、标签里被选中的那一块               | The chosen segment of a segmented control or a tag                               | `tabs`、`segmented`                           |
| `on`      | 选中的开关/勾选框，以及它上面的标记          | A chosen switch or box, and the mark on it                                       | `button`、`toggle`                            |
| `chip`    | 字段里一个已选值的标签：底色、一道内高光与边 | A chosen value's label inside a field: a fill, an inner highlight and an edge    | `combobox`                                    |
| `glass`   | 玻璃：半透明底 + 模糊                        | Glass: a translucent fill and a blur                                             | `carousel`                                    |
| `menu`    | 浮层：菜单、弹层、提示                       | A floating surface: a menu, a popover, a tooltip                                 | `popover`、`dialog`、`toast`、`lib/listbox`   |
| `groove`  | 菜单里一道凹槽                               | A groove cut inside a menu                                                       | `menu`                                        |

<!-- /theme-lint: finishes -->

## 5 alias 与例外

一个 finish 的颜色这样写：

1. **alias**：`var(--token)`，token 必须在同一主题的 `light`/`dark` 或 `cssVars.theme` 里。`theme.ts` 的 `themed()` 在**读的时候**把它换成当前主题与外观的颜色（`token(name)`，NSH 给的 `#rrggbbaa`），所以切外观、`selectTheme` 切主题都自动生效，一次读一次换。
2. **墨色**：`oklch(0 0 0 / a)`、`oklch(1 0 0 / a)` 允许字面——内高光、接触影、投影都是它。
3. **`transparent`**：允许，表示这一面没有边。
4. **带 alpha 的 token**：`oklch(from var(--token) l c h / a)`——一个 token 的颜色换一个透明度，唯一允许的相对颜色写法（见第 7 节）。`alias()` 在读的时候把它展开成具体的 `oklch(L C H / a)`，因为 NSH 的 CSS 解析器不认相对颜色。
5. **`boxShadow` 整条豁免**（见第 2 节）。
6. 其它字面量一律不许出现，除非它在第 7 节的待定表里：那是一份清单，说明这个颜色还没有 token，暂时留在 finish 里。表里的每一条都是待办，不是许可。

## 6 为什么相同的值不合并

好几个 finish 今天取到同一个颜色，看起来可以合并成一条。不合并，是因为它们是不同的决定，改其中一个不该顺手改掉另一个：

| 两个 finish                          | 今天相同的原因                           | 分开的原因                                                                                   |
| ------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `light` / `accent`                   | 主操作与强调是同一个色                   | 上游留了两档，主题可以只让其中一档更亮                                                       |
| `primary` / `brand-fill`             | 强调色的填充就是主操作的色               | `primary` 是 shadcn 的槽，`brand-fill` 是本库的填充                                          |
| `primary-foreground` / `on-brand`    | 同上                                     | 同上：一个是槽，一个是本库的字色                                                             |
| `thumb` / `raised`                   | 分段控件选中的那块，与卡片上的控件面同色 | 一个在井里，一个在卡片上，深色下要分开调                                                     |
| `knob` / `handle`                    | 开关圆点与滑杆把手同色                   | shadcn 的滑杆把手带 `border-primary`，开关圆点不带（`f34fa75` 拆出来的）                     |
| `down` / `destructive`               | 都是红                                   | `destructive` 是危险的语义，`down` 是数据的方向                                              |
| `pill` / `raised`、`chip` / `raised` | 上游的胶囊与 chip 借了控件的面           | 胶囊是上游规范、本库还没有组件读；chip 是字段里一个标签，和卡片上的控件不在同一层（第 8 节） |

合并的代价是隐形的：某天主题想把 `thumb` 调深一点，`raised` 会跟着变，而两个地方隔着一个井，肉眼很难对上。

## 7 待定颜色

一个 finish 里的颜色离开这张表只有三条路，每条的理由不同：

1. **一个 token 的颜色，带别的 alpha**：写 `oklch(from var(--token) l c h / a)`。像素不变：`alias()` 从当前主题里取出那个 token 的声明值，补上它的 L、C、H，写出的就是同一个颜色。`theme-lint` 只认这一种写法，`from` 后面的 `var()` 必须是这个主题真有的 token；别的相对形式（把 alpha 写成 `var()`、在 L/C/H 里用 `calc()`）仍然算“没有 token 的颜色”。
2. **与某个 token 肉眼无差**：ΔL ≤ 0.015、ΔC ≤ 0.003、色相在同一段灰里，就写 `var(--token)`。像素会有一两个单位的差别，受影响的基线重拍。数值够近但语义不对的不换：`chart-*` 是数据色，`window-control-off` 是窗口按钮的底，一个选中的行不该跟着图表的颜色走。
3. **材质自己的设计色**：同一个主题的两个外观里值相同、语义相同，又出现在两处以上，就进 `theme.json` 的 B 层（第 1 节）。default 用原来的值，另外两个主题取自己同一位置的颜色或最近的 token，零像素变化。只在一处出现的，留在表里。

表里剩下的十七行都是第 3 条没走的、只在一处出现的材质色：`fill` 的渐变末端比 `primary` 深一档或浅一档、开关圆点比 `primary` 淡两档、`track` 的边比 `input` 深一档。其中 `fill` 的那两行只能留在渐变里：NSH 的解析器不认相对颜色，渐变里的颜色写不成 `oklch(from …)`。

`theme-lint` 管两头：表外的字面量报错；表里的条目如果哪个主题都不再写它，也报错——留下一行对不上的，等于给那个颜色留了一条悄悄回来的路。

<!-- theme-lint: pending -->

| 主题        | 外观  | 色值                             | 位置                                                                                                   | 最接近的 token                               |
| ----------- | ----- | -------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| default     | light | `oklch(0.80472 0.1815 126.061)`  | `fill.backgroundImage`                                                                                 | `chart-1`（ΔL +0.054，ΔC -0.003）            |
| default     | light | `oklch(0.69169 0.17204 126.956)` | `fill.borderColor`                                                                                     | `chart-1`（ΔL -0.059，ΔC -0.013）            |
| default     | light | `oklch(0.97867 0.00945 119.575)` | `knobOn.backgroundImage`                                                                               | `primary`（ΔL +0.082，ΔC -0.157）            |
| default     | light | `oklch(0.72099 0.15728 124.776)` | `knobOn.borderColor`                                                                                   | `chart-1`（ΔL -0.030，ΔC -0.027）            |
| default     | light | `oklch(0.89487 0.00554 274.959)` | `on.backgroundColor`, `on.backgroundImage`                                                             | `chart-5`（ΔL -0.009，ΔC +0.001，语义不同）  |
| default     | dark  | `oklch(0.37091 0.01103 264.432)` | `track.borderColor`                                                                                    | `input`（ΔL +0.015，ΔC -0.000）              |
| default     | dark  | `oklch(0.88348 0.15928 123.937)` | `fill.backgroundImage`                                                                                 | `primary`（ΔL -0.005，ΔC -0.004）            |
| default     | dark  | `oklch(0.83973 0.16469 124.137)` | `fill.backgroundImage`                                                                                 | `primary`（ΔL -0.049，ΔC +0.001）            |
| default     | dark  | `oklch(0.71963 0.15821 125.456)` | `fill.borderColor`, `knobOn.borderColor`                                                               | `up`（ΔL -0.060，ΔC +0.010）                 |
| default     | dark  | `oklch(0.88185 0.00589 264.53)`  | `knob.backgroundImage`, `handle.backgroundImage`                                                       | `code`（ΔL -0.014，ΔC -0.003）               |
| default     | dark  | `oklch(0.8324 0.00597 264.528)`  | `knob.borderColor`, `handle.borderColor`                                                               | `code`（ΔL -0.064，ΔC -0.003）               |
| default     | dark  | `oklch(0.97867 0.00945 119.575)` | `knobOn.backgroundImage`                                                                               | `brand`（ΔL +0.074，ΔC -0.157）              |
| default     | dark  | `oklch(0.42689 0.01421 264.414)` | `on.backgroundColor`, `on.backgroundImage`                                                             | `window-control-off`（ΔL +0.026，ΔC +0.003） |
| shadcn      | dark  | `oklch(0.34846 0 0)`             | `pressed.backgroundColor`, `pressed.backgroundImage`, `thumb.backgroundColor`, `thumb.backgroundImage` | `chart-4`（ΔL -0.023，ΔC -0.000，语义不同）  |
| solid-glass | light | `oklch(0.2 0 0 / 0.88)`          | `fill.backgroundImage`                                                                                 | `primary`（ΔL +0.000，ΔC +0.000）            |
| solid-glass | light | `oklch(0.38 0.03 265 / 0.22)`    | `menu.borderColor`                                                                                     | `muted`（ΔL +0.079，ΔC +0.011）              |
| solid-glass | dark  | `oklch(0.94 0 0 / 0.86)`         | `fill.backgroundImage`                                                                                 | `primary`（ΔL +0.000，ΔC +0.000）            |

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
4. 三套主题都要有：默认主题写值；shadcn 与 solid glass 由 `scripts/theme/generate-*.ts` 生成（改生成器，不改产物）。
5. 跑 `bun scripts/theme-lint.ts` 与 `bun run port:render:theme`：前者管形状，后者管像素——加 token 不该改一个像素，改了就是形状或颜色出了问题。
