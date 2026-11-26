# 主题槽矩阵

- 日期：2026-11-26
- 决策：[0013](../decisions/0013-one-contract-value-slots.md)（一套契约、按主题配值）、[0012](../decisions/0012-derived-colours-are-defaults.md)（值带出处）、[0019](../decisions/0019-theme-contract-v4.md)（Contract v4：强类型嵌套 `controls`、`size` 槽与消歧整理）
- 范围：[0007](../decisions/0007-theme-customization-scope.md) 第 1 条的全局样式与第 2 条的关键组件

## 目标

同一组槽（DTCG 源码写 `slot.*`，编译成强类型嵌套对象 `semantics.json` 的 `controls`，共 86 个叶子，无 `text` 枚举槽），六套主题只配值，组件经 `controls()` / `packages/ui/lib/look.ts` 按槽画。

## 通用写法

槽值是作者写的一行值（`scripts/theme/slots.ts` 的 `SLOTS` / `BASE_SLOTS` 定义类型与默认值；色名统一 kebab-case，如 `color:primary-foreground`）：

| 类型      | 写法                                   | 含义                                                                           |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| `face`    | `color:<role>[@alpha]`                 | 颜色角色（kebab-case），可带不透明度（`color:foreground@0.2`）                 |
|           | `tint:<role>[@alpha]`                  | tint 角色                                                                      |
|           | `finish:<role>[:<field>]`              | finish 的一层或字段（`finish:disabled:foreground`）                            |
|           | `none` / `keep`                        | `none` 不画；`keep` 沿用控件自己的（用于 `disabled.*`、`field.disabled.face`） |
| `shade`   | `shade:<role>` / `none`                | 用 finish 的内阴影/投影，或 `none`                                             |
| `corner`  | `control` / `container` / `full` / 数  | 圆角：控制圆角、容器圆角、胶囊、点数                                           |
| `px`      | 数 / `"none"` / `"control"`            | 长度（`"none"` = 不画，`"control"` = `stroke.control`）                        |
| `ratio`   | 数                                     | 比例/不透明度                                                                  |
| `boolean` | `"yes"` / `"no"`                       | 开关                                                                           |
| `size`    | 数（`dimension`） / `"WxH"` / `"same"` | 2D 尺寸（正方单数、宽×高元组、`"same"` 继承静止 knob 尺寸）                    |

按输入档（`pointer` / `touch`）或外观（`light` / `dark`）区分的值，第二个值写在 `$extensions["dev.aning.shadcn-nsh"].touch` / `.dark` 里。

## 已落地的组（86 槽）

`button`（含 `button.corner.*`、`button.selected.*`、`button.secondary.*`、`button.outline.edge`、`button.destructive.edge`、`button.shade`）、`badge.corner`、`field`、`choice`、`switch`、`slider`、`progress`、`calendar.today`、`spinner`、`popup.corner`、`tooltip`、`toast.action.face`、`list.item`、`menubar.bar`、`tabs.track`、`well.edge` 与 `disabled` 已全部进入 `controls` 树（[ADR 0019](../decisions/0019-theme-contract-v4.md) 删除了 9 个恒定/冗余槽、并将 16 个开关与滑杆宽高槽合并为 9 个 `size` 槽、`switch.feedback` 改为从静/按尺寸自动推导）。

下面第 2、6、7 节（按钮组、面与列表行、提示与日期）还没有槽：那些控件今天读 finish 与全局角色，将来若按本文填，槽的名单与值一起加。

## 1 全局

| 槽                                                  | nsh-gallery | material  | winui                | apple                   |
| --------------------------------------------------- | ----------- | --------- | -------------------- | ----------------------- |
| 圆角：control / container / modal                   | 现值        | 现值      | 现值                 | modal 16（现 26）       |
| 按钮圆角（按 sm / md / lg 高度）                    | full        | full      | 4                    | 待审计：macOS 按尺寸    |
| 高度 sm / md / lg                                   | 现值        | 现值      | 现值                 | 20 / 24 / 28（pointer） |
| 描边：hairline / control                            | 现值        | 现值      | 现值                 | 现值                    |
| 阴影：raised / overlay / modal                      | 现值        | 现值      | 现值                 | 现值                    |
| 焦点：外环 宽 / 偏移 / 色；内环 宽 / 色（0 = 无）   | 内环 0      | 内环 0    | 内环 1 / 暗色 70% 黑 | 内环 0                  |
| 状态层：hover / pressed / focus 不透明度            | 现值        | 现值      | 现值                 | 现值                    |
| 禁用：内容不透明度；填充 / 边 / 墨（`keep` = 不换） | 0.5 / keep  | 0.38 / 换 | keep / 换            | 0.4 / keep              |

## 2 按钮组（button、toggle、button-group、toolbar、pressable）

每个变体（primary、secondary、outline、ghost、destructive）一组：填充、墨、边（上 / 侧 / 下 色，宽）、阴影、按下（填充 / 墨 / 不透明度）。
**选中 / 开启**（toggle、toolbar 项、图标按钮、选中的 secondary）共用一组：填充、墨、边。button-group 的外框与项共用一组填充与边。

## 3 输入组（input、select、combobox、number-input、otp-input、time-field、editor）

- **高度规范**：指针端单行输入高 `32`；触控端跟随 `dimension.size.hit.touch`（`nsh-gallery` / `shadcn` / `solid-glass` / `apple` / `winui` 为 `44`，`material` 为 `48`）。

| 槽                                                      | nsh-gallery    | material         | winui                 | apple                                |
| ------------------------------------------------------- | -------------- | ---------------- | --------------------- | ------------------------------------ |
| 底色                                                    | field          | field            | field                 | field                                |
| 边宽：上 / 侧 / 下（`field.edge.width`）                | 1 / 1 / 1      | 0 / 0 / 1        | 1 / 1 / 1             | 1 / 1 / 1（指针）· 0 / 0 / 0（触控） |
| 边色：上 / 侧 / 下                                      | input          | — / — / muted-fg | line / border / input | input                                |
| 聚焦：颜色 / 环或下边宽（`field.focus.colour`）         | brand / 实线 2 | primary / 底边 2 | accent / 底边 2       | ring / halo 3                        |
| 下边线宽（`field.focus.width`）                         | 3              | 2                | 2                     | 3                                    |
| 圆角                                                    | control        | 上 4 下 0        | 4                     | control                              |
| 禁用：底 / 边 / 墨（`keep` = 不换，按统一不透明度淡出） | keep           | keep             | finish:disabled       | keep                                 |

## 4 选择组

**checkbox / radio**：外框尺寸、圆角、底色、底色阴影（`none` 或 inset）、边宽、边色；选中底色、选中边色；内部记号（勾 / 点）颜色、线宽、点直径（静止 / hover / 按下）；光晕直径（0 = 无）。

| 槽                              | nsh-gallery     | material        | winui          | apple          |
| ------------------------------- | --------------- | --------------- | -------------- | -------------- |
| 尺寸 / 圆角                     | 16·22 / 5·7     | 18 / 2          | 20 / 4         | 待审计         |
| checkbox 盒边长（`choice.box`） | 16·20           | 18              | 16·20          | 16·20          |
| 底色 / 阴影                     | 透明 / inset    | 透明 / none     | track / none   | card / 待审计  |
| 边 宽 / 色                      | 1 / input       | 2 / muted-fg    | 1 / input      | 待审计         |
| 选中 底色 / 边色                | accent / =底色  | primary / =底色 | accent / =底色 | accent / =底色 |
| radio 点：静止 / hover / 按下   | dot / dot / dot | dot / dot / dot | dot / 14 / 10  | 待审计         |
| 光晕                            | 0               | 32（M3 为 40）  | 0              | 0              |

**switch**：轨道尺寸、轨道边宽（关 / 开）、轨道边色、旋钮尺寸（关 / 开 / hover / 按下，均为宽 × 高）、旋钮颜色（knob finish）。

| 槽                           | nsh-gallery    | shadcn        | solid-glass    | apple               | material                  | winui                           |
| ---------------------------- | -------------- | ------------- | -------------- | ------------------- | ------------------------- | ------------------------------- |
| 轨道（`default` / `sm`）     | height.md 推出 | 32×18 / 24×14 | height.md 推出 | 54×24 / 40×18       | 40×24·52×32 / 32×20·40×24 | 40×20·44×22 / 32×16·36×18       |
| 边宽 关 / 开                 | 1 / 1          | 0 / 0         | 1 / 1          | 0 / 0               | 1·2 / 0                   | 1 / 0                           |
| 边色（`switch.edge.colour`） | `border`       | `none`        | `border`       | `none`              | `border` (`outline`)      | `input` (`ControlStrongStroke`) |
| 旋钮 关 / 开                 | icon.md        | 16 / 16       | icon.md        | 31×20（`sm` 23×14） | 16（`sm` 12） / 20·24     | 12·14（`sm` 10·12） / 12·14     |
| hover / 按下                 | —              | —             | —              | —                   | 16 / 22·28                | 14·16 / 17×14·19×16             |

**slider**：轨道粗细、轨道底色 / 阴影 / 边、旋钮尺寸、旋钮内点直径（0 = 实心）、hover / 按下尺寸、竖向长度。

| 槽                             | nsh-gallery   | material  | winui         | apple         |
| ------------------------------ | ------------- | --------- | ------------- | ------------- |
| 轨道底色（`slider.face`）      | tint:brand    | secondary | 现值          | 现值          |
| 轨道粗细                       | 6·8           | 16        | 4             | 4             |
| 旋钮                           | 14·20         | 现值      | 18（内点 12） | 20×16         |
| 旋钮底色（`slider.knob.face`） | `finish:knob` | primary   | `finish:knob` | `finish:knob` |
| hover / 按下                   | 14 / 14·32    | 现值      | 内点 14 / 10  | 待审计        |

## 5 进度组（progress、spinner）

progress：高度、轨道底色 / 阴影 / 边、内线高度（0 = 无）。
spinner：辐条数（0 = 连续弧）、弧长、轨道不透明度（0 = 无轨道）。

| 槽                    | nsh-gallery | material  | winui | apple       |
| --------------------- | ----------- | --------- | ----- | ----------- |
| progress 轨道底色     | 现值        | secondary | 现值  | 现值        |
| progress 高度 / 内线  | 6 / 0       | 4 / 0     | 3 / 1 | 待审计      |
| spinner 辐条数 / 轨道 | 0 / 0.25    | 0 / 0     | 0 / 0 | 8 或 12 / 0 |

## 6 面与列表行（card、popover、sheet、select 弹层、menu 行）

面用 finish（card / overlay / modal）与全局圆角。
**列表行**：高亮底色、高亮边色（=底色 → 只有填充）、边宽、圆角、高度、内缩。

| 槽                                  | nsh-gallery            | material            | winui     | apple          |
| ----------------------------------- | ---------------------- | ------------------- | --------- | -------------- |
| 高亮 底色 / 边色                    | brand-tint / brand 30% | muted（降级，§3.6） | 待审计    | accent / =底色 |
| 弹层圆角（`popup.corner`）          | container              | control             | container | container      |
| 标签页轨道底色（`tabs.track.face`） | inset                  | none                | inset     | inset          |
| 井的边（`well.edge`）               | border                 | none                | border    | none           |

## 7 提示与日期

- tooltip / toast / alert：用 inverse 或 overlay finish、全局圆角；toast 的动作墨色（inverse-brand）。
- calendar：今天（墨色、底色，`transparent` = 只有墨）、选中（底色、墨）、范围（底色）。

## 待填

“待审计”的格子表示还没有按官方规范核对过——已落地的组里，那些格子取的是今天的外观（继承 base 的值），所以与 base 相同；核对后改值，出处随值进 token 的说明与 `$extensions`。

## 8 #407 落地的槽（apple 审计）

apple 审计（#407）把这几组槽从“待审计”变成了真值，并按需补了 18 个槽，分七组（`button.corner.*`、`button.selected.*`、`button.secondary.*`、`button.destructive.*`、`calendar.today.*`、`slider.knob.height`、`spinner.spokes`）。四个主题列的值待并入第 1、2、3、4、5、7 节；这里先记下新槽与 apple 的取值，其余主题是 base 默认值（= 审计前的外观）。

| 槽                                                               | base / 其余主题                                                          | apple                                                     | 出处                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------- |
| `button.corner.sm` / `.md` / `.lg`                               | `control`                                                                | `5` / `6` / `full`                                        | macOS 26 按钮 r5 / r6 / 胶囊       |
| `button.selected.face` / `.ink`                                  | `finish:accent` / `primary-foreground`                                   | `tint:brand` / `brand`                                    | iOS 26 tinted 控件                 |
| `button.secondary.face` / `.ink` / `.edge` / `.shade` / `.hover` | `finish:raised` / `foreground` / raised 的边 / `raised` / `finish:hover` | 同 base 的面 / `foreground` / `none` / `raised` / `muted` | macOS `.gray`（bg-fill-3 + label） |
| `button.destructive.face` / `.ink` / `.edge` / `.shade`          | `tint:destructive` / `destructive` / `destructive@0.32` / `raised`       | 同 base 的面与墨 / `none` / `none`                        | `.destructive` 无边框无影          |
| `calendar.today.face` / `.ink`                                   | `foreground@0.08` / `foreground`                                         | `none` / `brand`                                          | 今天只有品牌色墨                   |
| `slider.knob.height`                                             | = 旋钮宽（圆）                                                           | `16`（20×16 椭圆，触屏 37×24）                            | macOS 滑杆 thumb                   |
| `spinner.spokes`                                                 | `no`（转弧）                                                             | `yes`（八根渐隐射线）                                     | 系统活动指示器                     |

面与边写 `finish:<role>` 时整层都画（WinUI 次要按钮的下边线就在 `raised` 层里），变体只覆盖它自己写了的项；边写 `none` 是真不画（画透明边，不留给 `borderWidth` 去继承标签色）。
