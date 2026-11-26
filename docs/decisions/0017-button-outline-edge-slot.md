# 0017 `button.outline.edge` 槽

- 日期：2026-11-25
- 状态：已采纳（2026-11-25）
- 依据：[0013](0013-one-contract-value-slots.md) 第 3 条（加槽要对每套主题都有意义、nsh-gallery 有值）；[0004](0004-theme-contract-freeze.md)（契约变化要有决策记录）；[0016](0016-apple-button-calendar-spinner-slots.md)

## 背景

`Button` 与 `IconButton` 新增 `outline` 变体时，描边直接读取了 `colors.border`。在 WinUI 3 中，`border` 对应输入框与选择框使用的强描边 `ControlStrongStrokeColorDefault`（亮 `#868686` / 暗 `#9a9a9a`），而在按钮上显得过重——WinUI 3 按钮轮廓描边应使用 `ControlStrokeColorDefault`（即 `finish.raised` 的 `borderColor`）。

## 决定

在契约第 11 节新增 `button.outline.edge` 槽（`face`）：

- **base 默认值**：`color:border`（`nsh-gallery`、`shadcn`、`solid-glass`、`apple`、`material` 保持各自 `border` 描边不变）。
- **WinUI 3**：`finish:raised:border-color`（`ControlStrokeColorDefault`）。

## 理由

- 用现成的值槽机制表达 WinUI 按钮描边，不在组件里写主题分支（0013）。
- 默认值即原行为，其余五套主题零变化。
