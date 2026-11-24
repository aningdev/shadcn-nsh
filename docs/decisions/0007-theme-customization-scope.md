# 0007 主题的定制范围：全局风格 + 关键组件 + 约 15 个源色

- 日期：2026-11-24
- 状态：已采纳（2026-11-24）；第 4 条与第 5 条里“只引用或派生的键不写字面量”一句由 [0012](0012-derived-colours-are-defaults.md) 取代（2026-11-25）
- 取代：[0004](0004-theme-contract-freeze.md) 第 1 条里“冻结前的四件”的清单（#340、#358 按本文重判）；0004 其余各条照旧
- 规范：[`docs/specs/theme-contract-v2.md`](../specs/theme-contract-v2.md)、[`docs/specs/native-themes.md`](../specs/native-themes.md) 第 3.6 节

## 背景

0004 冻结了契约，却没有说**范围**：一套主题可以为哪些组件写自己的配方、可以写哪些颜色。于是每遇到一个平台差异，就要重新讨论“该不该加”，契约在扩充（`mark`、`trigger`、`arrow`、`cells`、`plate`）与收敛（第 11.7 节的降级、#374 的字段瘦身）之间反复，工作量大多花在这里。

现状（2026-11-24，`main`）：

- 每套主题写 **56 个颜色键**：31 个是 shadcn / NSH `Theme` 的对外槽（含 `sidebar-*` 8 个、`chart-1..5`），25 个是本库自加的角色（`brand`、`faint`、`line`、`inset`、`raised`、`field`、`track`、`knob`、`info`、`warn`、`up`、`violet`、7 个 `*-tint`、3 个 `inverse*` 等）；material 与 winui 还手写了一部分本该派生的 `*-tint`。
- 六个控件维度里，`selection` 与 `group` 只服务标签页、分段控件与侧栏，却占了维度一半的取值（`pill`、`plate`、`underline`、`bar`、`track`、`capsule`、`cells`）。

## 决定

**一句话：主题只定制本库组件真正读的东西；平台主题只为关键组件写配方，其余组件只吃全局风格。**

### 1 全局风格（每套主题都写）

| 类         | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 颜色       | 第 4 条的源色                                                                                                               |
| 圆角       | `shape` 的按层角色（0002）                                                                                                  |
| 图标       | 尺寸刻度与线宽                                                                                                              |
| 字体       | 字族、字阶、字重                                                                                                            |
| 密度       | 指针 / touch 两档的高度、间距、命中区                                                                                       |
| 阴影与高度 | 三层：`raised`（卡片、按钮）、`overlay`（popover、菜单、select、tooltip）、`modal`（dialog、sheet、drawer）；按层，不按组件 |
| 焦点       | focus ring 的样式、宽度、偏移                                                                                               |
| 状态层     | hover、pressed、disabled                                                                                                    |
| 动效       | `motion` 的角色（#293 P6）                                                                                                  |

### 2 关键组件（平台主题可以写自己的配方）

| 组   | 组件                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| 按钮 | `button`、`toggle`、`button-group`、`toolbar`、`pressable`                                        |
| 输入 | `input`、`input-group`、`select`、`combobox`、`number-input`、`otp-input`、`time-field`、`editor` |
| 选择 | `checkbox`、`radio-group`、`switch`、`slider`                                                     |
| 进度 | `progress`、`spinner`                                                                             |
| 面   | `card`、`popover`、`hover-card`、`sheet`、`drawer`，以及 `select` 的弹出列表                      |
| 菜单 | `menu`、`context-menu`、`menubar` 的行                                                            |
| 对话 | `dialog`、`alert-dialog`                                                                          |
| 提示 | `tooltip`、`alert`、`toast`                                                                       |
| 日期 | `date-picker`、`calendar`                                                                         |

“配方”只能经契约已有的四个控件维度（第 3 条）、finish 与刻度来表达，不在组件里写主题分支（0004 第 3 条）。

### 3 降级到全局风格（所有平台主题）

不写配方，只吃第 1 条；与原生的差别记进 `native-themes.md` 第 3.6 节的差异表：

- 导航与结构：`tabs`、`segmented`、`sidebar`、`accordion`、`collapsible`、`collapsing-header`、`navigation-menu`、`nav-stack`、`breadcrumb`、`pagination`、`tree`、`title-bar`、`dock-area`、`split-view`、`resizable`、`scrollbar`、`refresh-indicator`
- 数据：`table`、`data-table`、`command`、`carousel`
- 内容（本来就没有配方）：其余组件，如 `badge`、`avatar`、`message`、`plot`、`stat`、`code-block`、`terminal`

契约随之删掉 `dimension.control.selection` 与 `dimension.control.group`（连同取值 `pill`、`plate`、`underline`、`bar`、`track`、`capsule`、`cells`），留下 `field`、`choice`、`track`、`handle` 四个维度。标签页与分段控件只画一种形态：`default`（NSH Gallery）的胶囊，颜色与圆角读全局风格。

### 4 颜色：约 15 个源色，其余只引用或派生

> 0012 起：下表左侧仍是主题必须写的源色；右侧的键默认按本文派生，主题也可以写自己的值，条件是把它取自什么记在 token 的 `$extensions` 里。见 [0012](0012-derived-colours-are-defaults.md)。

| 层   | 源色（主题写值）                                                                   | 只引用或派生（不写新值）                                                                          |
| ---- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 品牌 | `primary`、`primary-foreground`、`secondary`                                       | `brand`、`accent`、`ring`、`sidebar-primary`、`inverse-brand`、`brand-tint`                       |
| 墨   | `foreground`、`muted-foreground`、`faint`                                          | `card-foreground`、`popover-foreground`、`inverse`、`inverse-foreground`                          |
| 背景 | `background`、`card`、`muted`                                                      | `popover`、`inset`、`raised`、`field`、`track`、`knob`、`sidebar`                                 |
| 线   | `border`（强：控件与输入框的边，对比 ≥ 3:1）、`line`（弱：分割线、卡片边、表格线） | `input`、`sidebar-border`                                                                         |
| 状态 | `destructive`（红）、`warn`（黄）、`info`（蓝）、`up`（绿）                        | 全部 `*-tint`：同一条公式 `color-mix(in srgb, X N%, transparent)`，`N` 每套主题一个数             |
| 图表 | —                                                                                  | `chart-1..5` 只能引用源色：要么状态色序列（主色、蓝、绿、黄、红），要么由 `foreground` 派生的灰阶 |

- 对外槽（`chart-*`、`sidebar-*` 等 shadcn / NSH `Theme` 的 31 个）照旧保留，NSH 缺一个就退回 neutral；只是值改成引用。
- 本库没有组件读的颜色（第 6 个起的图表系列、分类色、标签色、品牌辅助色）**归应用**：应用在自己的主题文件里加，本库不维护。`violet` 这类只有个别组件读的颜色，实施时改读源色或交给应用。
- 一套平台主题的某个派生值与原生不同，按 0004 第 2 条降级记账，不为它新增源色。

### 5 闸门

`theme-lint` 按第 4 条的源色与第 3 条的四个维度做白名单：主题源码里写了清单外的键，或给“只引用”的键写了值却没有出处（0012），就失败。扩大范围只有一条路：新的决策记录。

## 理由

- **范围不定，冻结就守不住。** 0004 管住了“改 schema 要记录”，但没管“哪些东西值得定制”，于是每次讨论都从零开始。白名单把答案写死，讨论变成查表。
- **用户看得出的平台差异集中在关键组件。** 按钮、输入框、开关、滑杆、卡片、菜单、对话框是一眼能认出平台的地方；标签页、侧栏、表格换成全局风格，读起来仍然属于这套主题（颜色、圆角、字体、阴影都是它的）。
- **颜色以组件读不读为界。** shadcn 自己只给 5 个图表色、2 种边色，余下交给应用；这是 copy-into-app 的分工，和本库其余部分一致。
- **派生值不该手写。** `*-tint` 手写一次，亮暗两档、六套主题就是 12 个要维护的值，而它们都只是“状态色淡一点”。

## 不采纳的方案

- **保留六个维度，只给降级组件停写新值。** 维度留着就会被用，下一个平台差异又会从这里长出来。
- **命名色板（Apple 的 12 色相里取 8 个）进主题。** 图表能画 8 个系列，但本库没有组件读它；放进主题等于替应用定色板。
- **线只留一级。** 控件边要 ≥ 3:1 的对比，分割线要弱；Apple（`separator` / `opaqueSeparator`）、M3（`outline` / `outlineVariant`）、WinUI（`ControlStroke` / `DividerStroke`）都是两级。
- **一次做完再冻结。** 删减与派生要动 6 套主题与几十个组件；先合本记录与闸门，范围当天生效，之后的工作只减不增。
