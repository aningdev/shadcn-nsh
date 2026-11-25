# 0016 按钮、日历今天、滑块旋钮高与 spinner 形态的槽

- 日期：2026-11-25
- 状态：已采纳（2026-11-25）
- 依据：[0013](0013-one-contract-value-slots.md) 第 3 条（加槽要对每套主题都有意义、nsh-gallery 有值）；[0004](0004-theme-contract-freeze.md)（契约变化要有决策记录）；[0014](0014-six-more-slots.md)

## 背景

按 macOS 26 / iOS 26 给 apple 配值（#407）时，审计里的几处差别在现有槽里没有位置：按钮圆角只有一个 `shape.corners.button`（apple 每个尺寸都被拉成胶囊），被选中的控件只能填实心 `accent`（Apple 用 12% 的品牌色洗面、品牌色墨），secondary 与 destructive 按钮的面、墨、边、影写死在组件里，日历的今天只能是灰盘，滑块旋钮只能是圆，spinner 只能是一段转弧。每一处在别的平台也有值（material 的胶囊、winui 的 4 点角），不是 apple 独有的风味。

## 决定

1. 契约第 11 节新增 18 个槽（7 组），每套主题都有值，base 默认取今天的外观，所以 nsh-gallery、shadcn、solid-glass、material、winui 的像素不变：

   | 槽                                                               | base 默认                                                                                       | apple                                       |
   | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------- |
   | `button.corner.sm` / `.md` / `.lg`                               | `control`（= `shape.corners.button`）                                                           | 5 / 6 / `full`                              |
   | `button.selected.face` / `.ink`                                  | `finish:accent` / `color:primaryForeground`                                                     | `tint:brand` / `color:brand`                |
   | `button.secondary.face` / `.ink` / `.edge` / `.shade` / `.hover` | `finish:raised` / `color:foreground` / `finish:raised:border-color` / `raised` / `finish:hover` | 边 `none`、hover `color:muted`，其余同 base |
   | `button.destructive.face` / `.ink` / `.edge` / `.shade`          | `tint:destructive` / `color:destructive` / `color:destructive@0.32` / `raised`                  | 边 `none`、影 `none`                        |
   | `calendar.today.face` / `.ink`                                   | `color:foreground@0.08` / `foreground`                                                          | `none` / `brand`                            |
   | `slider.knob.height`                                             | 等于旋钮宽（14 / touch 20，圆）                                                                 | 16（touch 24），旋钮是椭圆                  |
   | `spinner.spokes`                                                 | `false`（转弧）                                                                                 | `true`（八根渐隐射线）                      |

2. `shape.corners.button` 留下，只管按钮之外的按钮类控件（图标按钮、分页项、日历日格）；apple 把它从 `full` 改成 `{dimension.radius.control}`（8 点），macOS 这些控件是圆角方块，不是胶囊。

## 理由

- 都是数值、颜色角色或一个布尔，退化值照 0013 表达形态（`none` = 没有边 / 没有面），不引入枚举、不加主题分支。
- `spinner.spokes` 是布尔不是“几根”：系统活动指示器 macOS 画 8 根，没有第二套主题要别的根数；真有了再把它改成数。
- 默认值等于今天的外观，其他主题零像素变化，风险只在 apple。

## 不采纳

- **secondary 按钮的灰面单独成槽**（macOS `.gray` 是 fill-3 的实心灰）：apple 的 `raised` 只画 hairline 环与轻影，眼下 secondary 是“只有细边”的样子；要灰面得把 `finish:raised` 拆开，另开 issue。
- **只在 apple 的 token 里加键**：0004 第 3 条禁止为一套主题加键。
- **在组件里按主题写常量**：回到 0013 删掉的平台配方。
