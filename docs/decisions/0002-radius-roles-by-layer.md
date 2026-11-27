# 0002 圆角按层收为三个角色与按钮胶囊开关

- 日期：2026-11-23
- 状态：已采纳（2026-11-23）
- 规范：[`docs/specs/theme-contract-v2.md`](../specs/theme-contract-v2.md) 第 2 节（#253）

> **修订（2026-11-27）**：`cssVars.theme` 的三个层圆角键改为 `radius-md`（control）、`radius-lg`（container）、`radius-xl`（modal），与 Tailwind CSS v4 / shadcn/ui 对齐，不保留旧键。A 层 `radius` 仍由 control 派生，值等于 `radius-md`。`shape.control` / `shape.container` / `shape.modal` 的属性名不变。下文保留决定当时的键名。

## 背景

此前主题按组件族定义了 8 个圆角角色（`radius`、`card`、`control`、`field`、`chip`、`overlay`、`dialog`、`sheet`）及 `size.control.corner`（5 / 7），主题作者要填的键多且多处同值重复。同时 `control` 身兼两职：在 `apple` 与 `material` 里既表示"按钮是 999 胶囊"，又被输入框、列表行、标签与色区直接读取，导致 `Select` / `Combobox` 触发器、列表行与 `ColorPicker` 色区也变成药丸或半椭圆。

## 决定

1. **按层定 3 个圆角角色**：`control`（页内元素：字段、行、徽标、井、色区、按键）、`container`（容器与浮层：卡片、菜单、弹出层、富提示、列表面板、toast）、`modal`（模态面：对话框、抽屉、底部面板），并在 `theme.json` 中由 `radius-control` 派生 A 层 `radius` 槽。
2. **按钮胶囊开关**：新增 `shape.corners.button: "full" | "radius"` 与响应式 `shape.button`（`"full"` 时取 `999`，否则取 `shape.control`）。仅按钮类控件（`Button`、`IconButton`、`SplitButton`、`Toggle`、`ButtonGroup`、分页按钮、日历头部按钮）读取 `shape.button`，其余页内控件读 `shape.control`。
3. **同心推出，去掉 `inset` 与 `size.control.corner`**：嵌套表面经 `rounded(outer, inset)` 取同心圆角（`Math.max(outer - inset, 0)`），独立页内块读 `shape.control`，复选框小角收进组件预设 `checkboxPresets.corner`。

## 理由

- 同一层级的界面元素应当共享同一条圆角刻度，减少主题作者的决策负担并保持界面韵律统一。
- 胶囊按钮是 Apple HIG 与 Material 3 Expressive 针对按钮的形状选择，不是整套页内控件的圆角；把开关单独拆成 `shape.corners.button`，才能既保留胶囊按钮又让输入框、列表行与色区保持各自圆角。
- 内层圆角是外层圆角与内边距的同心几何关系，由 `rounded(outer, inset)` 计算即可，不必作为独立主题 token 维护。

## 不采纳的方案

- **保留 8 个按组件族命名的圆角角色。** 会让主题键名继续随新组件膨胀，且不拆 `control` 的两重语义仍无法解决列表行与色区变胶囊的问题。
- **收成 3 个角色但不加按钮胶囊开关。** 若 `control` 写 `999`，页内控件与色区仍会被拉成胶囊；若 `control` 写 `4` / `8`，`apple` 与 `material` 的按钮就失去了胶囊外观。
