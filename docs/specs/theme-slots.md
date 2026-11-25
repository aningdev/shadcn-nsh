# 主题槽矩阵

- 日期：2026-11-25
- 决策：[0013](../decisions/0013-one-contract-value-slots.md)（一套契约、按主题配值）、[0012](../decisions/0012-derived-colours-are-defaults.md)（值带出处）
- 范围：[0007](../decisions/0007-theme-customization-scope.md) 第 1 条的全局样式与第 2 条的关键组件

## 目标

同一组槽，四套主题（nsh-gallery、apple、material、winui；shadcn、solid-glass 同样填）只配值。组件按槽画，一种画法。

**完成的标准**（逐条可答是 / 否）：

1. 下表每个槽在每套主题都有值，平台值有出处（规范名 + token，或文件 + 行号）。
2. `packages/ui` 里没有形态枚举、没有平台配方表（`look.ts` 的四张表、`switch.tsx` 的 `winuiSwitch` / `materialSwitch` 已删）。
3. 表达不了的样子都在 `native-themes.md` 第 3.6 节有一行。
4. 第 2 条的每个组件 × 4 套主题 × 亮 / 暗，截图看过、进了基线、CI 比对。
5. 加一套新平台主题只写 token、不改组件（用一套试验主题验证一次）。

## 通用写法

槽值是作者写的一行字符串（`scripts/theme/slots.ts` 的 `SLOTS` / `BASE_SLOTS` 定义写法与默认值），编译成数、布尔或对象：

| 写法                                  | 含义                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| `color:<role>[@alpha]`                | 颜色角色，可带不透明度（`color:foreground@0.2`）              |
| `tint:<role>[@alpha]`                 | tint 角色                                                     |
| `finish:<role>[:<field>]`             | finish 的一层，取它的哪个字段（`finish:disabled:foreground`） |
| `none`                                | 不画：边宽 0、点 0、光晕 0、底 `none`                         |
| `keep`                                | 沿用控件自己的（只用于 `state.disabled.*`）                   |
| `shade:<role>`                        | 用 finish 的内阴影作底色阴影                                  |
| `control` / `container` / `full` / 数 | 圆角：控制圆角、容器圆角、胶囊（高度一半）、点                |
| 数 / `"yes"` / `"no"`                 | 点（宽度、直径、高度；0 是“没有”，不是“最小”）、布尔          |

形态由值的退化表达，不另起名字：边宽 0 或边色等于底 → 只有填充；侧边与上边宽 0 → 下划线；宽 = 高 → 圆，不等 → 椭圆；圆角 = 高度一半 → 胶囊；内点 0 → 实心；光晕 0 → 没有。

每个尺寸槽可按输入档（`pointer` / `touch`）给两个值，面与边可按外观（亮 / 暗）给两个值；第二个值写在同一个 token 的 `$extensions["dev.aning.shadcn-nsh"].touch` / `.dark` 里，一条槽一个 token。

## 已经落地的组

`field`、`choice`、`switch`、`slider`、`progress`、`spinner`、`state.disabled` 已经成为 `semantics.json` 的 `slots`（[契约第 11 节](theme-contract-v2.md)，[决策 0013](../decisions/0013-one-contract-value-slots.md)）：每套主题都填了全部槽，值是 #404 之前枚举选出来的样子，`check:theme` 要求键集一致。

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

| 槽                              | nsh-gallery | material         | winui                 | apple   |
| ------------------------------- | ----------- | ---------------- | --------------------- | ------- |
| 底色                            | field       | field            | field                 | field   |
| 边宽：上 / 侧 / 下              | 1 / 1 / 1   | 0 / 0 / 1        | 1 / 1 / 1             | 待审计  |
| 边色：上 / 侧 / 下              | input       | — / — / muted-fg | line / border / input | 待审计  |
| 聚焦：边色 / 下边宽             | ring / 1    | primary / 2      | accent / 2            | 待审计  |
| 下边线宽（`field.focus.width`） | 3           | 2                | 2                     | 3       |
| 圆角                            | control     | 上 4 下 0        | 4                     | control |

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
| 光晕                            | 0               | 40              | 0              | 0              |

**switch**：轨道尺寸、轨道边宽（关 / 开）、旋钮尺寸（关 / 开 / hover / 按下，均为宽 × 高）、旋钮颜色（knob finish）。

| 槽           | nsh-gallery    | material   | winui      | apple                       |
| ------------ | -------------- | ---------- | ---------- | --------------------------- |
| 轨道         | height.md 推出 | 52×32      | 40×20      | 待审计（审计值 54×24）      |
| 边宽 关 / 开 | 1 / 1          | 2 / 0      | 1 / 0      | 待审计                      |
| 旋钮 关 / 开 | icon.md        | 16 / 24    | 12 / 12    | 待审计（审计值 31×20 椭圆） |
| hover / 按下 | —              | 16 / 28×28 | 14 / 17×14 | 待审计                      |

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
