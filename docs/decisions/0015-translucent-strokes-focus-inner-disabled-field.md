# 0015 半透明描边、焦点内环角色、禁用输入框底色

- 日期：2026-11-25
- 状态：已采纳（2026-11-25）
- 依据：[0013](0013-one-contract-value-slots.md) 第 3 条（加槽要对每套主题都有意义、nsh-gallery 有值）；[0004](0004-theme-contract-freeze.md)（契约变化要有决策记录）

## 背景

按 WinUI 3 的 XAML 资源给 winui 配值（#409）时，有三处在现有契约里没有位置：

1. WinUI 的描边是**半透明**画刷（如 `ControlStrokeColorDefault` #0F000000），叠在它所属的面上。主题以前把它们先混到窗口底色上写成不透明值，卡片、井、对话框上的线都差一档，暗色凸起面的上下两条边次序反了。
2. 双层焦点环的内圈（`FocusStrokeColorInner`）借用了 `card`，在 WinUI 里它是独立的画刷。
3. WinUI 的禁用输入框换成禁用画刷（ControlFillColorDisabled + TextFillColorDisabled），不是把正常的框淡化一半。

## 决定

1. **finish 的描边可以半透明**：winui 的 `card`、`plate`、`raised`、`hover`、`inset`、`overlay`、`modal`、`disabled` 的边色写 XAML 画刷本身的 alpha，由引擎叠在各自的面上。
2. **`inset` 增加 `border-top-color` / `border-bottom-color`**：井可以有上浅下深的边（WinUI TextBox 的 ControlStrongStroke 下边）。base 为 `none`；一套主题写 `none` 时 `finish.inset` 展开后**没有**这个键，输入框的边由 `field.edge.*` 槽画（`theme.ts` 按当前主题决定键集，而不是按构建时主题）。
3. **新颜色角色 `focus-inner`**：`focusRing` 的双层环读它。winui 亮 `#ffffff`、暗为 70% 黑叠在背景上；其他主题写 `{card}`，像素不变。
4. **新槽 `field.disabled.face`**（face，base `keep`）：winui 写 `finish:disabled`，禁用的 input / select / combobox / editor / otp-input / number-input 画成禁用面与它的墨色，不再降不透明度。

## 理由

- 都是值：半透明是颜色值本身的属性；`none` 表达"没有"，`keep` 表达"沿用控件自己的"，不引入枚举或主题分支（0013）。
- 默认值等于今天的外观：nsh-gallery、shadcn、solid-glass、apple、material 的关键页像素在抗锯齿误差内。

## 不采纳

- **继续预先混色**：混到窗口底色上的值放到卡片、弹层上就错一档，这正是要修的问题。
- **`focus-inner` 继续借 `card`**：WinUI 暗色里两者不同，借用会让内环和卡片绑死。
- **在组件里判断 winui 画禁用态**：回到 0013 删掉的平台配方。
