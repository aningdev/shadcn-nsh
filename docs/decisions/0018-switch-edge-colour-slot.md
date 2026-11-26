# 0018 `switch.edge.colour` 槽

- 日期：2026-11-25
- 状态：已采纳（2026-11-25）
- 依据：[0013](0013-one-contract-value-slots.md) 第 3 条（加槽要对每套主题都有意义、nsh-gallery 有值）；[0004](0004-theme-contract-freeze.md)（契约变化要有决策记录）；[0017](0017-button-outline-edge-slot.md)

## 背景

此前 `switch.tsx` 的关闭态轨道边框色借用了文本输入框的 `finish.inset.borderColor`。在不同设计体系下，文本输入框与开关轨道的边框语义并不相同：

- **WinUI 3**：`finish.inset` 侧面只有 5.9% 黑 / 7.1% 白（底边斜面才是 44.7% / 54.5%），导致 `ToggleSwitch` 关闭态几乎看不见外框，而 WinUI 3 官方 `ToggleSwitchStrokeOff` 使用 `ControlStrongStrokeColorDefault`（`color:input`）。
- **Material 3**：`finish.inset` 是 `muted-foreground`（`onSurfaceVariant`），而 M3 官方 `SwitchTokens.UnselectedTrackOutlineColor` 为 `outline`（`color:border`）。
- **shadcn/ui**：官方 `Switch` 为无边胶囊（`border-transparent`）。

## 决定

在契约第 11 节新增 `switch.edge.colour` 槽（`face`）：

- **base 默认值**：`color:border`（`nsh-gallery`、`solid-glass` 保持原有 `border` 描边）。
- **shadcn**：`none`（配合 `switch.edge.off/on: 0`，无边框）。
- **apple**：`none`（配合 `switch.edge.off/on: 0`，无边框）。
- **material**：`color:border`（M3 `outline`，`SwitchTokens.UnselectedTrackOutlineColor`）。
- **winui**：`color:input`（WinUI 3 `ControlStrongStrokeColorDefault`，`ToggleSwitchStrokeOff`）。

## 理由

- 让开关轨道边框色独立于文本输入框 `finish.inset`，零主题分支（0013）。
- 与已有的 `slider.edge.colour`、`progress.edge.colour`、`choice.edge.colour` 命名与结构保持一致。
