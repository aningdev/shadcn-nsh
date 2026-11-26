# 控件槽规格（Theme v5 `controls`）

- 决策：[`../decisions/0020-theme-v5.md`](../decisions/0020-theme-v5.md)（Theme v5 架构与单主题孤立分支清理）
- 运行时读取：`control("<group>")`（来自 `packages/theme/theme.ts`），无中间 `./lib/look` 代理层

## 1 清理与保留原则

- **零主题名分支**：组件禁止 `theme.id === "..."`；所有外观差异通过数值/表达式退化表达。
- **删除单一主题组（4 组）**：`tooltip`（统一用 `surface("inverse")` + `popup.corner`）、`toast`（行动按钮直接复用 `button` 语义）、`calendar`（今日标记复用 `brand` / `accent`）、`disabled`（统一收归 `feedback.disabled`）。
- **删除/规则化冗余叶槽**：删除仅单主题使用的 14 个零散叶槽；保留具有真实平台差异的极少数结构位（如 Material `switch.knob.on` 选中放大、WinUI `slider.mark` 中心色点、无环退化的 `choice.radioChecked.face`）。

## 2 13 个控件组

| 控件组     | 核心槽位                                                                                                                                  | 退化规则与说明                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `button`   | `corner.{sm,md,lg}`、`selected.{face,ink}`、`secondary.{face,edge}`、`outline.edge`、`destructive.edge`、`shade`                          | 通用面与描边组合；选中态用于 Toggle / 激活项                                 |
| `badge`    | `corner`                                                                                                                                  | `"full"` / `"control"` / 数值                                                |
| `field`    | `ground`、`shade`、`edge.{sides,color,bottom}`、`focus.{line,width,color}`                                                                | 当 `edge.sides === false`（下划线输入模式）时，底部圆角自动归零              |
| `choice`   | `size`、`box`、`corner`、`face`、`shade`、`edge.{width,color,disabled}`、`checked.face`、`radioChecked.face`、`mark`                      | 当 `radioChecked.face === "none"` 时退化为描边环模式（高亮边框 = `primary`） |
| `switch`   | `track`、`trackOffFace`、`small.{track,knob}`、`edge.{off,on,color}`、`knob.{size,on,pressed,background,gradient,border,shadow,checked*}` | `knob.on === "same"` 时沿用静止尺寸；Material 可单独放大                     |
| `slider`   | `rail`、`band`、`face`、`shade`、`edge.{color,width}`、`knob.{size,pressed,background,gradient,border,shadow}`、`mark`                    | `mark === 0` 时不渲染手柄中心色点；WinUI 配置内点直径                        |
| `progress` | `height`、`face`、`shade`、`edge.{color,width}`                                                                                           | 轨道与填充高度共用 `height`                                                  |
| `spinner`  | `trackOpacity`                                                                                                                            | 0 为纯弧线，非 0 绘制背景圆环                                                |
| `popup`    | `corner`                                                                                                                                  | `"control"` / `"container"` / `"full"` / 数值                                |
| `list`     | `item.{highlight,edge}`                                                                                                                   | `list.highlightClass()` 输出高亮与可选描边 class                             |
| `tabs`     | `track.{face,edge,corner}`                                                                                                                | 轨道面、描边与圆角                                                           |
| `menubar`  | `bar`                                                                                                                                     | `"card"` / `"none"`                                                          |
| `well`     | `edge`                                                                                                                                    | `"none"` 或边框色                                                            |

各主题在每个槽位上的当前解析值见 [`semantics-values.md`](semantics-values.md) §9。
