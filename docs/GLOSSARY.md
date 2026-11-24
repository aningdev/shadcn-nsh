# shadcn-nsh

把 NSH 官方示例共享的 UI 层整理成 shadcn 模式的、copy-into-app 的组件库。约定见 [`ARCHITECTURE.md`](ARCHITECTURE.md)，流程见 [`port.md`](port.md)。

## Language

**Upstream（上游）**:
`references/nsh/examples/nsh-gallery-ui`：NSH 的 gallery 与网站 demo 共用的 UI 层。本库的主题、外观（每种 look 的像素）、状态与几何都以它为准；轴的名字与取值见 Variant / Size。
_Avoid_: reference look, 参考实现（它是来源，不是参考）

**Look**:
上游的外观函数：把"哪种、多大、什么状态"算成一组可以展开到 `nsh/base` 控件上的 props（`style`、`hoverStyle`、`activeStyle`、`focusVisibleStyle`、`disabledStyle`、`hitSlop`）。例：`buttonLook("default", { size })`。相当于 shadcn 的 `cva`。
_Avoid_: variants helper, `xVariants`, theme layer

**Shell（外壳）**:
本仓手写的组件部分：读 props、展开 look、提供组合角色。外壳不含外观。
_Avoid_: wrapper, styled layer

**Component（组件）**:
一个文件：look 加外壳，归本库所有；起源于上游的文件在文件头一行致谢。以 Copy-into-app 交付。
_Avoid_: Styled Component, npm component

**Credit Line（致谢行）**:
起源于上游的文件第二行的一句 `// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.`：来源标注，也是该文件唯一的一处来源。代码归本库，可以直接修改；新组件的初稿由 `bun run port:vendor` 抽取。
_Avoid_: 只读区, 逐字照搬

**Port Map（清单）**:
`port-map.json`：上游每个文件、每个顶层声明的去向（目标文件、`pending`、带理由的 `exclude`），以及已审阅到的上游提交。唯一清单，组件表由它生成；`port:check` 据它提醒上游的变化。
_Avoid_: 手写的状态表

**Baseline（基线）**:
`references/nsh` 固定的提交，等于 `port-map.json` 的 `upstream.commit`，也等于 `nsh --version` 显示的提交。
_Avoid_: 自动跟随上游

**Reference Page（参照页）**:
`demos/<id>.ref.tsx`：与 `demos/<id>.tsx` 同一个页面，但按上游的写法把 look 直接展开在 `nsh/base` 控件上。渲染比对要求两者截图相同。

**Demo Adapter（演示适配层）**:
官方示例写演示时用的那套零件（`Stage`、`Split`、`Inspector`、`Panel`、`Log`、`Segmented`、`Chips`，`desktop` / `wide` / `sideBySide`，以及调色板 `ui()`）：主体居中、状态与事件放检查器、窄窗口上下堆叠；`Chips` 是放不下一条 `Segmented` 轨道时的换行版。`apps/website/demos/stage.tsx`，只供演示，不进组件库，也不进 registry。
_Avoid_: 组件库的布局 API, 在组件里用 Stage

**Photo Page（照片页）**:
演示里从网络取图的页面（`apps/website/demos/photos.ts` 的 `photoUrl`、`apps/website/demos/avatar-data.ts` 的 `avatarPortrait`）。它先 `Image.prefetch` 全部图片再让 `Image` 画，并在全部到位后画出 `images-ready` 标记；`port:render` 用 `network: "live"` 打开它、等这个标记，再截图。圆角裁切的边缘在两次运行间偶尔差 1/255：比较按"逐字节，或落在抗锯齿预算内"（`render-cases.ts` 的 `antialiasing`），圆形头像另有更宽的 `tolerance`。
_Avoid_: 截图前 sleep, 让图片页跳过比对

**Composition Facade**:
把 `nsh/base` 的单根复合控件拆成可组合零件树（`Trigger` / `Content` / `Item` 等角色）。零件家族名跟 `nsh/base`（`MenuTrigger`），不是 shadcn 的 `DropdownMenu*`。Root 只持有开关状态；行为仍在 base。
_Avoid_: Radix port, 新的 primitive 层, 根上的 `trigger` prop

**Copy-into-app**:
通过 registry + CLI 把组件源码拷进应用，应用可以直接改。改动点有三个：换颜色、圆角、阴影改 `theme.json` / `semantics.json`；改某个控件的外观改它的 look；改结构或 API 改外壳。
_Avoid_: 黑盒依赖

**Catalog（组件目录）**:
本库交付的组件集合：registry 里的每个 `registry:ui` 条目。目录里的每个组件都有演示、参照页和文档页。
_Avoid_: 组件清单、组件表（手写的列表）

**Registry Name**:
`add` 名、落盘路径和公开导出符号由 `nsh/base` 符号推导（`Menu` → `menu` / `MenuTrigger`）。上游有而 base 没有的零件（`Card`、`Badge`、`Spinner`）用上游的名字。不为旧 id 提供别名。
_Avoid_: shadcn registry id（`dropdown-menu`）

**Variant / Size**:
轴名与取值都用 shadcn 的（[`specs/api-unify.md`](specs/api-unify.md) §4）。`variant` 取 `default` / `secondary` / `outline` / `ghost` / `destructive`；每个组件只收其中一个**子集**，子集写在自己的文档页 API 一节（`Button` 暂无 `outline` / `link` 的 look）。`size` 只表示**刻度**：`sm` / `default` / `lg`，图标按钮另有 `icon*`；精确像素叫 `side` / `width` / `height`，不叫 `size`。按钮之外的取值也照 shadcn：`legend` / `label`（`FieldLegend`）、`muted` / `icon` / `image`（`Item`、`ItemMedia`）、`tinted`（`Bubble`：强调色的一层透明底，比 `default` 轻）、`border` / `separator`（`Marker`：底边一条细线、文字两侧各一条横线）、`sidebar` / `floating` / `inset`（`Sidebar`：列自带边贴着页面、浮成一张卡、或与页面卡同站在列的地面上）、`highlighted` / `added` / `removed`（`CodeBlockLine`：一行代码被强调、新增或删去）。本库特有的变体值各自写在组件页上：`line`（`TabsList` 的下划线轨道）、`tile`（`Radio` 的卡片式）、`traffic-lights` 与 `caption`（`WindowControls`：窗口自己的按钮画在窗口的前端还是后端，macOS 与 Windows 各一种）。`kind` 不再出现。每个导出的 `*Variant` / `*Size` 联合由 `packages/cli/src/api-vocabulary.test.ts` 固定，加一个值要同时改它。
_Avoid_: `kind`, `primary` / `accent` / `danger`, `small` / `regular` / `large`, 把像素尺寸叫 `size`

**Label**:
`Label`（`packages/ui/label.tsx`）：控件旁**可见**的名字，一段文字，不参与无障碍。nsh 没有 `htmlFor` / `labelledBy`，所以它不给旁边的控件命名——控件的名字是它自己的 `accessibilityLabel`。
_Avoid_: 用它给控件命名

**Accessible Name（无障碍名）**:
屏幕阅读器念出的控件名字：控件的 `accessibilityLabel`，否则它画的文字（字符串 child 就是其一）。与可见的 `Label` 是两件事，只是词碰巧同形。
_Avoid_: 把 `Label` 组件当作无障碍名、把控件的文字抄进 `accessibilityLabel`

**Behavior Authority**:
控件行为、a11y 与可转发能力以 `nsh/base` 为准；外壳透传 base 的全部 props。
_Avoid_: 重写行为, 缩减 props

**Theme Source**:
`default` 主题的真源是 `packages/theme/tokens/`（W3C DTCG 2025.10：`base/` 与 `themes/default/`），经 `bun run tokens:build` 编译为运行时产物 `theme.json`（基础 token 层：颜色、3 个层圆角 `radius-{control,container,modal}` 及 A 层 `radius` 槽、字体，oklch 存储）、`semantics.json`（跨平台语义层：风格数据与 `finishes` 的 `shared` + 稀疏 `light`/`dark`，以 `{token}` 引用基础层）与 `themes/default/{theme,semantics}.json`；其余主题（`shadcn`、`solid-glass`、`apple`、`material`、`winui`）同样由 DTCG 源码编译；`theme.ts` 读取编译产物。分层规则见 [`specs/design-semantics.md`](specs/design-semantics.md)，角色清单见 [`specs/theme-roles.md`](specs/theme-roles.md)，DTCG 2025.10 标准见 [`specs/design-tokens.md`](specs/design-tokens.md)。
_Avoid_: neutral 映射, `custom-*` 键

**Design Semantics（语义层 / `semantics.json`）**:
跨 Apple HIG、Material 3 Expressive、WinUI 3 与 shadcn/ui 的设计语义超集，存放 NSH 原生标量 token 表达不了的结构（`pointer`/`touch` 两档尺寸与字阶、枚举、动效、表面配方 `finishes` 与平台 `material`），通过 `{token}` 引用 `theme.json` 中的基础 token。见 [`specs/design-semantics.md`](specs/design-semantics.md)。
_Avoid_: `finishes.json`（旧文件名）、在语义层重复写颜色/圆角/字体字面量

**Token**:
`theme.json` 里的一个基础设计量（按 DTCG `$type` 分 `color`、`dimension`、`fontFamily`）：颜色（`cssVars.light` / `cssVars.dark` 逐外观，或 `cssVars.theme` 共用）、按层划分的 3 个圆角（`radius-control`、`radius-container`、`radius-modal`，以及由 `radius-control` 派生的 A 层 `radius` 槽）、字体（`font-mono` 及可选 `font-sans`）。`theme.json` 内部用 `var(--token)`，语义层用 `{token}` 引用。A 层是 shadcn 的 31 个槽（NSH 的 `Theme::of` 逐名字解析，缺一个就退回 shadcn 的灰），B 层是本库自己的颜色扩展，C 层是明暗共用的 token。
_Avoid_: 用别的词指它；在 B 层另起一个与 A 层槽同义的名字

**Finish（Finish Role）**:
`semantics.json` 里 `finishes`（`shared` + 稀疏 `light` / `dark` 合并后）的一个条目：组件可能画在上面的一个**图层**（`card`、`inset`、`channel`、`raised`、`plate`、`overlay`、`modal`、`inverse`、`glass`、`accent`、`fill`、`knob`、`hover`、`pressed`、`disabled`，共 15 个，见 [`specs/theme-roles.md`](specs/theme-roles.md)）。它写一个面的底、面上的墨 `foreground`、渐变、模糊、三个边色、按下的颜色，外加它向平台要的原生材质 `material`（`null` 表示不要）；`shadow` 只写影子刻度（[`影子刻度`](#影子刻度)）的引用，不写自己的影子。finish 只管一个面的画法，颜色写 `{token}`。合并后每个 finish 在每套主题、每种外观里的字段集合相同，一个字段都不省：不写就取中性值（`material: null`、`backdropFilter: "none"`、`elevation: null`、`gradient: null`、两条边色 `null`、按下字段 `null`），中性值写一次在 `tokens/base/style.shared.tokens.json` 的 `finish` 组里（[`中性值`](#中性值neutral-value)）。唯一不取中性值的是 `knob` 的 `checked-*`：选中是旋钮的[状态](#状态state)，不是另一个面，没写的那一项就沿用没选中时的值。
_Avoid_: 把 finish 当 token；用别的词指它；删字段表示“没有渐变”

**Neutral Value（中性值）**:
一个 finish 字段“什么都没设”时的取值：`material: null`（不要平台材质）、`backdropFilter: "none"`（不模糊）、`elevation: null`（不交给平台画高度）、`gradient: null`（平涂）、`border-top-color` / `border-bottom-color` 为 `null`（这条边没有自己的颜色，取 `border-color`；写 `transparent` 会把它抹掉）、按下字段 `null`（按下只压暗，不换色）。写一次，在 `tokens/base/style.shared.tokens.json` 的 `finish` 组里，每套主题继承；主题只在真正不同时写那个字段。源码里以字符串 `"none"`（`elevation` 为 `null`）写在 `$extensions["dev.aning.shadcn-nsh"]` 上，因为 DTCG 的 token 不接受 `$value: null`，编译时换成 `null`；主题写了 token 就压过它。`check:theme` 要求每个 finish 的字段与默认主题一样齐。
_Avoid_: 在某套主题里删字段表示“没有”；把 `transparent` 当“没有颜色”

**Waiver（对比度豁免）**:
一套主题按平台官方画法保留在 WCAG AA 之下的颜色对，写在它自己 `theme.tokens.json` 的 `$extensions["dev.aning.shadcn-nsh"].contrast.waivers[]`（`{ fg, bg, source }`）。`bun run theme:contrast` 读它：先算，再按豁免放行；一条豁免不再失败，或者某套主题引用了不存在的角色，都是错误——所以清单跟着主题走，脚本里没有按主题 id 的列表。
_Avoid_: 在脚本里写 `if (theme === "apple")`

**Citation（刻度出处）**:
一套主题按平台官方尺寸留下的、不在尺子上的值，写在它自己 `theme.tokens.json` 的 `$extensions["dev.aning.shadcn-nsh"].scales.citations`（键是 token 路径，值是出处：页面链接或资源文件名）。`check:theme` 拿它对照编译后的 `semantics.json`：键必须存在且确实还是那个不上格的值，值回了格子就报“出处不再需要”。
_Avoid_: 在 lint 脚本里给某个主题开白名单

**Tier（分档）**:
随输入设备变的一对值：`pointer`（鼠标）与 `touch`（手指），同一个结构只换数值，例如 `dimension.size.hit` 的 `0` / `44`。DTCG 的 resolver 用 `modifiers.input` 表达：先读 `tokens/base/style.{pointer,touch}.tokens.json`，再读主题目录下的同名文件（后写者赢，没有就整套继承）。一个值要么两档都给、要么都不给，两档的键必须相同（`check:theme` 的 `checkTiers`）。
_Avoid_: 只写一档、按主题在代码里补另一档

**Shadow Scale（影子刻度）**:

一套主题、一种外观里 `sm` / `md` / `lg` / `xl` / `inset` / `edge.surface` / `edge.accent` 七个影子部件（DTCG `shadow` 复合 token，写在 `light.tokens.json` / `dark.tokens.json` 的 `shadow` 组）。finish 的 `shadow` 只引用它们，编译后落在 `semantics.json` 的 `elevation`，`theme.ts` 的 `elevation(level)` 读它。没有的部件写 `$extensions.none = true`，引用后跳过。见 [`specs/theme-roles.md`](specs/theme-roles.md)。
_Avoid_: 在 finish 里写阴影字符串；把 `elevation` 放进 `theme.json`

**Alias（`{token}` 引用）**:
语义层引用 `theme.json` 基础 token 的花括号写法（对齐 DTCG 2025.10）：`dimension.shape.*` 写 `{radius-…}`、7 个 typography 复合 token 的 `fontFamily` 写 `{font.family.sans}`、finish 颜色与 `material.apple.tint` 写 `{token}` 或 `oklch(from {token} l c h / a)`。`theme.ts` 在**读的时候**经 `token()` 响应式解析，所以切外观、`selectTheme` 切主题与宿主 `setThemeOverrides` 都自动生效。finish 允许的字面量只有墨色（黑或白带 alpha）、`transparent`，以及规范里待定表列出的那些；`shadow` 不写字面量，只引用影子刻度。
_Avoid_: 在语义层写 `var(--token)` 或重复的色值/圆角数字；用别的词指它

**Build-time Theme / AppTheme**:
**构建时主题**是 `nsh.json` 指向的 `theme.json` 与 `lib/ui/semantics.json`，由 `init --theme <name>` 定；**AppTheme**（`{ id, label, theme, semantics }`）是运行时可切的一套，装在 `themes/<name>/`，`selectTheme` 切过去、`selectTheme(null)` 回构建时那套、`currentTheme()` 读当前 `id`（还在构建时主题上时为 `null`）。应用清单里的构建时主题就是 `null`。
_Avoid_: 把 `add theme-<x>` 当成换构建时主题、把主题叫“皮肤”、把 finish 当 token

**Control Dimension（控件维度 / `dimension.control`）**:
主题对“一个控件怎么画自己的零件”的六个按行为命名的答案：`selection`（选中项标在哪：`pill` / `underline` / `bar`）、`field`（输入框边界：`box` / `underline` / `box-underline`）、`choice`（一组里被选中的那一格：`well` / `outline` / `inset`）、`track`（滑动轨道与进度剩余：`sunk` / `tint` / `hairline`）、`handle`（可拖部分：`circle` / `ring`）、`group`（并排一组控件之间：`track` / `cells`）。各档画成什么样、按什么数字见 [`specs/theme-roles.md`](specs/theme-roles.md) 第 11、14 节；组件经 `@shadcn-nsh/theme` 的 `control()` 读取，换主题后下一帧重画。
_Avoid_: 用组件名当维度名、把某个控件的整套尺寸塞进主题、为单个控件在 `theme.json` / `semantics.json` 里逐键放宽几何或状态字段、在组件里按主题 `id` 分支（`bun run check:ui` 拦下）

**Difference Table（差异表）**:
[`specs/native-themes.md`](specs/native-themes.md) 第 3.6 节：契约表达不了、因而被降级掉的原生外观，逐行记着“官方长什么样、本库降级成什么、省掉了哪个契约项”。契约冻结在 contract v3 之后，一套主题的差异只有两条出路——改值靠向契约，或者进这张表；加键、加层、加字段不在其中。
_Avoid_: 在主题 README 里各记一段、把待办当差异、为一张表加一个维度
