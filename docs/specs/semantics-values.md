# 每套主题解析后的值

> 本页由 `bun run docs:semantics` 生成，请勿手改：修改 `packages/theme/themes/` 源码或生成器 `scripts/theme/semantics-table.ts` 后重新生成。`bun run check` 中的 `docs:semantics --check` 会校验一致性。

本页列出 Theme v5（`docs/decisions/0020-theme-v5.md`）下五套基准主题解析后的全部语义字段。颜色角标及结构设计含义见 [`theme-roles.md`](theme-roles.md)，控件槽位说明见 [`theme-slots.md`](theme-slots.md)，主题设计指南见 [`../theme-design.md`](../theme-design.md)。

- **两值折叠**：`a / b` 表示两组取值不同（颜色与 `surfaces`/`elevation` 为 `light / dark`，`metrics` 为 `pointer / touch`）；一致时仅写一项。
- **缺省标记**：`—` 表示该字段未设置或为 `null`。

## 1 颜色角色（`theme.json`）

`theme.json` 的 `cssVars`：21 个亮暗角色与 3 个外观无关角色（`scrim`、`media`、`on-media`）。省略的 `brand` 在导出层设为 `var(--primary)`。

| 角色 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `background` | 页面画布的底 | `oklch(0.97399 0.00397 286.326)` / `oklch(0.21297 0.01273 264.257)` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.96257 0.00665 286.274)` / `oklch(0 0 0)` | `oklch(0.98379 0.01284 321.894)` / `oklch(0.18738 0.01241 300.422)` | `oklch(0.96415 0 0)` / `oklch(0.24353 0 0)` |
| `card` | 卡片与面板的底 | `oklch(1 0 0)` / `oklch(0.25145 0.01219 264.328)` | `oklch(1 0 0)` / `oklch(0.205 0 0)` | `oklch(1 0 0)` / `oklch(0.22728 0.00382 286.092)` | `oklch(0.96728 0.01181 313.217)` / `oklch(0.22652 0.00999 303.714)` | `oklch(0.98809 0 0)` / `oklch(0.28908 0 0)` |
| `popover` | 浮层与菜单的底 | `oklch(0.97997 0.00397 286.326)` / `oklch(0.25145 0.01219 264.328)` | `oklch(1 0 0)` / `oklch(0.205 0 0)` | `oklch(1 0 0)` / `oklch(0.2939 0.00358 286.177)` | `oklch(0.95363 0.01471 312.243)` / `oklch(0.24451 0.01344 298.463)` | `oklch(0.98212 0 0)` / `oklch(0.29313 0 0)` |
| `muted` | 弱化容器的底与浅底 | `oklch(0.95222 0.00415 271.369)` / `oklch(0.29661 0.01168 264.381)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.93459 0.00268 286.348)` / `oklch(0.31868 0.00703 285.994)` | `oklch(0.91401 0.01366 314.754)` / `oklch(0.32979 0.01247 298.761)` | `oklch(0.94912 0 0)` / `oklch(0.22645 0 0)` |
| `surface` | 卡片上凸起的控件面底 | `oklch(0.96724 0.00414 271.369)` / `oklch(0.32935 0.01092 271.072)` | `var(--secondary)` | `oklch(0.95241 0.00133 286.375)` / `oklch(0.31868 0.00703 285.994)` | `oklch(0.96728 0.01181 313.217)` / `oklch(0.22652 0.00999 303.714)` | `oklch(0.98809 0 0)` / `oklch(0.29716 0 0)` |
| `foreground` | 页面与各类面上的默认正文及图标墨色 | `oklch(0.18636 0.01318 264.182)` / `oklch(0.95193 0.00289 264.542)` | `oklch(0.145 0 0)` / `oklch(0.985 0 0)` | `oklch(0 0 0)` / `oklch(1 0 0)` | `oklch(0.22652 0.00999 303.714)` / `oklch(0.91401 0.01366 314.754)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `muted-foreground` | 次要文字与图标 | `oklch(0.49859 0.01219 261.766)` / `oklch(0.69819 0.01118 261.782)` | `oklch(0.556 0 0)` / `oklch(0.708 0 0)` | `oklch(0.6347 0.0059 286.23)` / `oklch(0.68188 0.01016 286.127)` | `oklch(0.39805 0.01736 303.721)` / `oklch(0.82875 0.01776 308.223)` | `oklch(0.47478 0 0)` / `oklch(0.84522 0 0)` |
| `faint` | 更弱的字：占位、单位、次要标记 | `oklch(0.69542 0.00939 264.505)` / `oklch(0.54061 0.01194 261.771)` | `oklch(0.708 0 0)` | `oklch(0.82403 0.00276 286.339)` / `oklch(0.46933 0.00797 286.089)` | `oklch(0.56675 0.01627 308.142)` / `oklch(0.65664 0.01531 304.011)` | `oklch(0.62006 0 0)` / `oklch(0.67312 0 0)` |
| `primary` | 主操作的强调色填充 | `oklch(0.89637 0.16627 124.031)` / `oklch(0.88837 0.16324 123.959)` | `oklch(0.205 0 0)` / `oklch(0.922 0 0)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `oklch(0.49552 0.13046 293.709)` / `oklch(0.83493 0.09457 298.018)` | `oklch(0.49147 0.15959 254.594)` / `oklch(0.80403 0.12199 230.822)` |
| `primary-foreground` | 主操作填充上的字与图标 | `oklch(0.19339 0.0197 121.819)` | `oklch(0.985 0 0)` / `oklch(0.205 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` / `oklch(0.3251 0.13529 291.152)` | `oklch(1 0 0)` / `oklch(0 0 0)` |
| `secondary` | 次操作控件的填充 | `var(--surface)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.95241 0.00133 286.375)` / `oklch(0.31868 0.00703 285.994)` | `oklch(0.91633 0.03651 303.106)` / `oklch(0.40052 0.034 298.591)` | `oklch(0.98809 0 0)` / `oklch(0.29716 0 0)` |
| `accent` | 悬停与选中项的浅高亮底 | `oklch(0.93609 0.00346 247.86)` / `oklch(0.32053 0.01145 264.401)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.93459 0.00268 286.348)` / `oklch(0.31868 0.00703 285.994)` | `oklch(0.91633 0.03651 303.106)` / `oklch(0.40052 0.034 298.591)` | `oklch(0.93705 0 0)` / `oklch(0.31714 0 0)` |
| `brand` | 强调色作前景：链接、指示条、选中标记 | `oklch(0.55192 0.15368 133.676)` / `oklch(0.90469 0.16668 124.297)` | `var(--primary)` | `var(--primary)` | `var(--primary)` | `oklch(0.38687 0.14996 259)` / `oklch(0.8943 0.08425 214.859)` |
| `border` | 容器与控件的常规发丝线 | `oklch(0.84192 0.00298 264.54)` / `oklch(0.32447 0.01141 264.404)` | `oklch(0.922 0 0)` / `oklch(1 0 0 / 0.1)` | `oklch(0.89478 0.00135 286.373)` / `oklch(0.3301 0.00522 286.11)` | `oklch(0.82875 0.01776 308.223)` / `oklch(0.39805 0.01736 303.721)` | `oklch(0.92191 0 0)` / `oklch(0.30919 0 0)` |
| `line` | 井内与内容区的分隔发丝线 | `oklch(0.91973 0.00403 286.32)` / `oklch(0.30863 0.01156 264.391)` | `oklch(0.922 0 0)` / `oklch(1 0 0 / 0.1)` | `oklch(0.89478 0.00135 286.373)` / `oklch(0.3301 0.00522 286.11)` | `oklch(0.82875 0.01776 308.223)` / `oklch(0.39805 0.01736 303.721)` | `oklch(0.92191 0 0)` / `oklch(0.31714 0 0)` |
| `input` | 表单字段与控件边的线 | `oklch(0.81386 0.003 264.54)` / `oklch(0.3556 0.01115 264.424)` | `oklch(0.922 0 0)` / `oklch(1 0 0 / 0.15)` | `oklch(0.82715 0.00276 286.339)` / `oklch(0.36496 0.00509 286.145)` | `oklch(0.56675 0.01627 308.142)` / `oklch(0.65664 0.01531 304.011)` | `oklch(0.62006 0 0)` / `oklch(0.68622 0 0)` |
| `ring` | 焦点环的线 | `oklch(0.7307 0.01549 264.473)` / `oklch(0.49837 0.01905 262.684)` | `oklch(0.708 0 0)` / `oklch(0.556 0 0)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `oklch(0.48593 0.03575 299.615)` / `oklch(0.83027 0.03743 303.029)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `info` | 提示状态的语义色 | `oklch(0.53418 0.17531 266.181)` / `oklch(0.7377 0.13479 263.817)` | `oklch(0.546 0.245 262.881)` / `oklch(0.707 0.165 254.624)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `oklch(0.525 0.185 260)` / `oklch(0.76 0.118 258)` | `oklch(0.56769 0.16654 251.313)` / `oklch(0.80403 0.12199 230.822)` |
| `success` | 成功与增长（上涨）的语义色 | `oklch(0.56078 0.1232 159.355)` / `oklch(0.77932 0.14805 162.141)` | `oklch(0.508 0.118 165.612)` / `oklch(0.765 0.177 163.223)` | `oklch(0.55845 0.14614 147.502)` / `oklch(0.75555 0.20825 146.984)` | `oklch(0.56078 0.1232 159.355)` / `oklch(0.77932 0.14805 162.141)` | `oklch(0.50725 0.16489 142.658)` / `oklch(0.75934 0.17155 141.348)` |
| `warning` | 警告状态的语义色 | `oklch(0.5909 0.13245 65.117)` / `oklch(0.82449 0.14865 73.346)` | `oklch(0.555 0.163 48.998)` / `oklch(0.828 0.189 84.429)` | `oklch(0.54737 0.14708 48.886)` / `oklch(0.78237 0.17106 67.223)` | `oklch(0.5909 0.13245 65.117)` / `oklch(0.82449 0.14865 73.346)` | `oklch(0.53885 0.12069 65.216)` / `oklch(0.90397 0.18827 100.526)` |
| `destructive` | 危险操作与错误的语义色 | `oklch(0.58301 0.18974 19.874)` / `oklch(0.70034 0.19197 18.007)` | `oklch(0.577 0.245 27.325)` / `oklch(0.704 0.191 22.216)` | `oklch(0.65421 0.23214 28.659)` / `oklch(0.6633 0.22361 28.292)` | `oklch(0.50128 0.17832 28.705)` / `oklch(0.83449 0.06771 22.012)` | `oklch(0.53615 0.19119 30.071)` / `oklch(0.79111 0.12251 13.299)` |
| `scrim` | 模态与抽屉背后的遮罩 | `oklch(0 0 0 / 0.45)` | `oklch(0 0 0 / 0.5)` | `oklch(0 0 0 / 0.4)` | `oklch(0 0 0 / 0.32)` | `oklch(0 0 0 / 0.302)` |
| `media` | 照片与媒体的底，不随外观翻转 | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` |
| `on-media` | 媒体面上的浅色字，不随外观翻转 | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` |

## 2 shape

圆角刻度与圆角曲率（`continuous` 或 `circular`）。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `shape.control` | 常规控件圆角 | 8 | 8 | 8 | 4 | 4 |
| `shape.container` | 卡片与面板容器圆角 | 12 | 12 | 12 | 12 | 8 |
| `shape.modal` | 浮层与模态框圆角 | 14 | 14 | 16 | 28 | 8 |
| `shape.curve` | 圆角曲率：连续曲线（Apple）还是圆弧 | `continuous` | `continuous` | `continuous` | `circular` | `circular` |

## 3 typography

7 个字阶角色的字重与字距（字号与行高共享于 `SHARED_TYPE_SCALE`）。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `typography.caption.fontWeight` | 小号说明的字重 | 400 | 400 | 400 | 500 | 400 |
| `typography.caption.letterSpacing` | 小号说明的字距 | 0 | 0 | 0 | 0.5 | 0 |
| `typography.detail.fontWeight` | 分组标题的字重 | 400 | 400 | 400 | 400 | 400 |
| `typography.detail.letterSpacing` | 分组标题的字距 | 0 | 0 | 0 | 0.4 | 0 |
| `typography.body.fontWeight` | 正文的字重 | 400 | 400 | 400 | 400 | 400 |
| `typography.body.letterSpacing` | 正文的字距 | 0 | 0 | 0 | 0.25 | 0 |
| `typography.label.fontWeight` | 控件标签的字重 | 500 | 500 | 500 | 500 | 400 |
| `typography.label.letterSpacing` | 控件标签的字距 | 0 | 0 | 0 | 0.1 | 0 |
| `typography.title.fontWeight` | 区块标题的字重 | 600 | 600 | 600 | 500 | 600 |
| `typography.title.letterSpacing` | 区块标题的字距 | 0 | 0 | 0 | 0.15 | 0 |
| `typography.headline.fontWeight` | 页面标题的字重 | 600 | 600 | 600 | 400 | 600 |
| `typography.headline.letterSpacing` | 页面标题的字距 | 0 | 0 | 0 | 0 | 0 |
| `typography.display.fontWeight` | 大号标题的字重 | 600 | 600 | 600 | 400 | 600 |
| `typography.display.letterSpacing` | 大号标题的字距 | 0 | 0 | 0 | 0 | 0 |

## 4 metrics

指针（左）与触屏（右）两档的尺寸、密度、命中范围、图标与线宽。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `metrics.height.sm` | 小档控件高度 | 24 / 32 | 24 / 32 | 24 / 32 | 24 / 32 | 24 / 32 |
| `metrics.height.md` | 中档控件高度 | 28 / 40 | 28 / 40 | 28 / 44 | 32 / 40 | 32 / 40 |
| `metrics.height.lg` | 大档控件与行高 | 32 / 48 | 32 / 48 | 32 / 56 | 40 / 56 | 40 / 48 |
| `metrics.icon.sm` | 小档图标尺寸 | 12 / 16 | 12 / 16 | 12 / 16 | 12 / 16 | 12 / 16 |
| `metrics.icon.md` | 中档图标尺寸 | 16 / 20 | 16 / 20 | 16 / 20 | 16 / 20 | 16 / 20 |
| `metrics.icon.lg` | 大档图标尺寸 | 20 / 24 | 20 / 24 | 20 / 24 | 20 / 24 | 20 / 24 |
| `metrics.density.pad` | 页面内边距 | 12 | 12 | 16 | 16 | 12 / 16 |
| `metrics.density.gap` | 页面区块间距 | 12 | 12 | 12 | 12 | 8 / 12 |
| `metrics.control.padding` | 控件水平内边距 | 8 | 8 | 8 | 8 | 6 / 8 |
| `metrics.control.gap` | 控件内图标与文字间距 | 8 | 8 | 8 | 8 | 8 / 12 |
| `metrics.item.inset` | 列表选中行相对容器边的缩进 | 4 / 8 | 4 / 8 | 4 / 0 | 0 | 4 / 8 |
| `metrics.item.pad` | 列表行内边距 | 8 | 8 | 8 / 16 | 12 | 11 / 12 |
| `metrics.hit` | 触控目标最小边长（0 表示不补范围） | 0 / 44 | 0 / 44 | 0 / 44 | 0 / 48 | 0 / 44 |
| `metrics.stroke.hairline` | 发丝线宽 | 1 | 1 | 0.5 | 1 | 1 |
| `metrics.stroke.control` | 控件描边线宽 | 1 | 1 | 1 | 1 | 1 |

## 5 feedback

统一的交互反馈原语：hover、press、focus、disabled、passive。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `feedback.hover.overlay` | 悬停状态的墨色叠层透明度（0 不叠层） | 0 | 0 | 0 | 0.08 | 0 |
| `feedback.hover.fill` | 通用悬停底色 | `foreground/5` | `accent` | `foreground/6` | `foreground/8` | `oklch(0.97315 0 0)` / `oklch(0.31714 0 0)` |
| `feedback.hover.surface.foreground` | 悬停表面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `feedback.hover.surface.shadow` | 悬停表面的投影 | `["edgeSurface","sm"]` | `sm` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.12)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.2)` | `sm` | — |
| `feedback.hover.surface.background` | 悬停表面的底 | `popover` / `input` | `accent` | `foreground/6` | `surface` | `oklch(0.97315 0 0)` / `oklch(0.31714 0 0)` |
| `feedback.hover.surface.border` | 悬停表面的边 | `border` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0 0 0 / 0.059)` / `oklch(1 0 0 / 0.071)` |
| `feedback.hover.surface.borderTop` | 悬停表面的上边 | `border` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0 0 0 / 0.059)` / `oklch(1 0 0 / 0.094)` |
| `feedback.hover.surface.borderBottom` | 悬停表面的下边 | `border` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0 0 0 / 0.161)` / `oklch(1 0 0 / 0.071)` |
| `feedback.press.scale` | 按下缩放倍数（1 不缩放） | 0.97 | 1 | 0.97 | 1 | 1 |
| `feedback.press.translateY` | 按下垂直位移（pt） | 0 | 0 | 0 | 0 | 0 |
| `feedback.press.overlay` | 按下状态的墨色叠层透明度 | 0 | 0 | 0 | 0.1 | 0 |
| `feedback.press.surface.foreground` | 按下表面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `muted-foreground` |
| `feedback.press.surface.shadow` | 按下表面的投影 | `inset` | — | — | `sm` | — |
| `feedback.press.surface.background` | 按下表面的底 | `muted` / `line` | `border` / `oklch(0.34846 0 0)` | `foreground/16` / `foreground/20` | `surface` | `muted` |
| `feedback.press.surface.border` | 按下表面的边 | `input` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `line` |
| `feedback.press.accent.opacity` | 强调面按下时的不透明度 | 0.88 | 0.88 | 0.72 | 1 | 1 |
| `feedback.focus.style` | 焦点环画法：halo / outline / double | `halo` | `halo` | `halo` | `outline` | `double` |
| `feedback.focus.width` | 焦点环线宽 | 3 | 3 | 3 | 3 | 2 |
| `feedback.focus.offset` | 焦点环外扩偏移 | 0 | 0 | 0 | 2 | 0 |
| `feedback.focus.innerColor` | double 焦点环的内分隔线颜色 | `card` | `card` | `card` | `card` | `oklch(1 0 0)` / `oklch(0.14479 0 0)` |
| `feedback.disabled.contentOpacity` | 禁用态内容透明度 | 0.5 | 0.5 | 0.4 | 0.38 | 0.36 |
| `feedback.disabled.replaceFace` | 禁用时是否整面替换为 disabled.surface | false | false | false | true | true |
| `feedback.disabled.surface.background` | 禁用表面的底 | `surface` | `surface` | `surface` | `foreground/12` | `oklch(0.97015 0 0)` / `oklch(0.28502 0 0)` |
| `feedback.disabled.surface.foreground` | 禁用表面的前景色 | `foreground` | `foreground` | `foreground` | `foreground/38` | `oklch(0.68949 0 0)` / `oklch(0.54863 0 0)` |
| `feedback.disabled.surface.shadow` | 禁用表面的投影 | `["edgeSurface","sm"]` | `["edgeSurface","sm"]` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.12)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.2)` | — | — |
| `feedback.disabled.surface.border` | 禁用表面的边 | `border` | `border` | `border` | `transparent` | `oklch(0 0 0 / 0.059)` / `oklch(1 0 0 / 0.071)` |
| `feedback.passive.restOpacity` | 非交互指示器（如滚动条滑块）静止透明度 | 0.5 | 0.5 | 0.5 | 0.38 | 0.5 |
| `feedback.passive.pressedOpacity` | 非交互指示器按下透明度 | 0.7 | 0.7 | 0.7 | 1 | 1 |
| `feedback.hover.surface.elevation` | 悬停表面的平台阴影高度（dp） | — | — | — | 1 | — |
| `feedback.press.surface.elevation` | 按下表面的平台阴影高度（dp） | — | — | — | 1 | — |
| `feedback.press.accent.background` | 强调面按下时换的底色 | — | — | — | — | `{"light":"oklch(0.5773 0.13223 250.006)","dark":"oklch(0.70029 0.10192 230.522)"}` |
| `feedback.press.accent.foreground` | 强调面按下时换的前景色 | — | — | — | — | `{"light":"oklch(0.87245 0.03754 247.003)","dark":"oklch(0.42706 0.05878 229.834)"}` |

## 6 motion

过渡时长与缓动、默认弹簧与 snappy / smooth / bouncy 分档，以及入场、指示器、展开和按压预设。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `motion.state.duration` | 状态淡变的时长（ms） | 120 | 120 | 120 | 100 | 83 |
| `motion.state.easing` | 状态淡变的缓动曲线 | `out-cubic` | `out-cubic` | `out-cubic` | `standard` | `decelerate` |
| `motion.fast.duration` | 微交互的时长（ms） | 150 | 150 | 150 | 150 | 167 |
| `motion.fast.easing` | 微交互的缓动曲线 | `out-cubic` | `out-cubic` | `out-cubic` | `standard` | `point-to-point` |
| `motion.default.duration` | 日常反馈的时长（ms） | 250 | 250 | 250 | 250 | 250 |
| `motion.default.easing` | 日常反馈的缓动曲线 | `out-cubic` | `out-cubic` | `out-cubic` | `standard` | `decelerate` |
| `motion.slow.duration` | 大面过渡的时长（ms） | 350 | 350 | 350 | 400 | 333 |
| `motion.slow.easing` | 大面过渡的缓动曲线 | `out-cubic` | `out-cubic` | `out-cubic` | `emphasized-decelerate` | `decelerate` |
| `motion.presets.popoverEnter.fromScale` | 弹出层入场初始缩放 | 0.96 | 0.96 | 0.94 | 0.96 | 0.98 |
| `motion.presets.popoverEnter.fromY` | 弹出层入场初始 Y 偏移 | 0 | 0 | -4 | -4 | -6 |
| `motion.presets.popoverEnter.timing` | 弹出层入场使用的时序档位 | `fast` | `fast` | `fast` | `fast` | `fast` |
| `motion.presets.dialogEnter.fromScale` | 对话框入场初始缩放 | 0.96 | 0.96 | 0.94 | 0.94 | 1.05 |
| `motion.presets.dialogEnter.fromY` | 对话框入场初始 Y 偏移 | 0 | 0 | 8 | 8 | 0 |
| `motion.presets.dialogEnter.timing` | 对话框入场使用的时序档位 | `default` | `default` | `default` | `slow` | `default` |
| `motion.presets.indicatorGlide.timing` | 指示器/滑块滑动使用的时序档位 | `fast` | `fast` | `fast` | `fast` | `fast` |
| `motion.presets.themeSwitch.kind` | 运行时切换主题的屏幕过渡方式 | `fade` | `none` | `dissolve` | `radial-wipe` | `fade` |
| `motion.presets.themeSwitch.duration` | 运行时切换主题过渡时长 | 200 | 0 | 240 | 320 | 167 |
| `motion.presets.popoverEnter.spring` | 弹出层入场弹簧：true 用默认弹簧，或 snappy / smooth / bouncy | — | — | `smooth` | `smooth` | `smooth` |
| `motion.presets.dialogEnter.spring` | 对话框入场弹簧：true 用默认弹簧，或 snappy / smooth / bouncy | — | — | `bouncy` | `bouncy` | `bouncy` |
| `motion.presets.indicatorGlide.spring` | 指示器滑动弹簧：true 用默认弹簧，或 snappy / smooth / bouncy | — | — | `snappy` | `snappy` | `snappy` |
| `motion.presets.reveal.spring` | 展开面板的弹簧：true 用默认弹簧，或 snappy / smooth / bouncy | — | — | `smooth` | `smooth` | `smooth` |
| `motion.presets.press.spring` | 按压过渡的弹簧：true 用默认弹簧，或 snappy / smooth / bouncy | — | — | `snappy` | — | — |
| `motion.spring.stiffness` | 物理弹性刚度 | — | — | 360 | 380 | 500 |
| `motion.spring.damping` | 物理弹性阻尼 | — | — | 30 | 32 | 46 |
| `motion.spring.mass` | 物理弹性质量 | — | — | 1 | 1 | 1 |
| `motion.springs.snappy.stiffness` | 灵敏弹簧刚度 | — | — | 520 | 520 | 650 |
| `motion.springs.snappy.damping` | 灵敏弹簧阻尼 | — | — | 34 | 32 | 52 |
| `motion.springs.snappy.mass` | 灵敏弹簧质量 | — | — | 1 | 1 | 1 |
| `motion.springs.smooth.stiffness` | 顺滑弹簧刚度 | — | — | 340 | 360 | 420 |
| `motion.springs.smooth.damping` | 顺滑弹簧阻尼 | — | — | 34 | 38 | 42 |
| `motion.springs.smooth.mass` | 顺滑弹簧质量 | — | — | 1 | 1 | 1 |
| `motion.springs.bouncy.stiffness` | 回弹弹簧刚度 | — | — | 380 | 320 | 360 |
| `motion.springs.bouncy.damping` | 回弹弹簧阻尼 | — | — | 26 | 22 | 40 |
| `motion.springs.bouncy.mass` | 回弹弹簧质量 | — | — | 1 | 1 | 1 |

## 7 surfaces

11 个纯结构表面角色（`card`、`raised`、`inset`、`channel`、`plate`、`overlay`、`modal`、`inverse`、`glass`、`accent`、`fill`），亮暗差异折在一格。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `surfaces.card.background` | 卡片面的底 | `card` | `card` | `card` | `card` | `card` |
| `surfaces.card.foreground` | 卡片面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.card.border` | 卡片面的边 | `border` | `border` | `border` | `transparent` | `oklch(0 0 0 / 0.059)` / `oklch(0 0 0 / 0.102)` |
| `surfaces.card.shadow` | 卡片面的投影 | `md` | `md` | — | `md` | — |
| `surfaces.inset.foreground` | 凹槽井面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.inset.border` | 凹槽井面的边 | `border` | `border` | `input` | `muted-foreground` | `oklch(0 0 0 / 0.059)` / `oklch(1 0 0 / 0.071)` |
| `surfaces.inset.shadow` | 凹槽井面的投影 | `inset` | `inset` | — | — | — |
| `surfaces.inset.background` | 凹槽井面的底 | `oklch(0.96124 0.00414 271.369)` / `oklch(0.23027 0.01247 264.293)` | `muted` | `oklch(0.96743 0.00133 286.375)` / `oklch(0.29471 0.00718 285.951)` | `oklch(0.96124 0.00414 271.369)` / `oklch(0.23027 0.01247 264.293)` | `oklch(0.94611 0 0)` / `oklch(0.23075 0 0)` |
| `surfaces.channel.foreground` | 分段轨道面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.channel.border` | 分段轨道面的边 | `border` | `border` | `transparent` | `line` | `line` |
| `surfaces.channel.shadow` | 分段轨道面的投影 | `inset` | `inset` | — | — | — |
| `surfaces.channel.background` | 分段轨道面的底 | `oklch(0.96124 0.00414 271.369)` / `oklch(0.23027 0.01247 264.293)` | `muted` | `surface` / `oklch(0.29471 0.00718 285.951)` | `oklch(0.96124 0.00414 271.369)` / `oklch(0.23027 0.01247 264.293)` | `oklch(0.94611 0 0)` / `oklch(0.23075 0 0)` |
| `surfaces.raised.background` | 凸起控件面的底 | `surface` | `surface` | `surface/72` | `surface` | `surface` |
| `surfaces.raised.foreground` | 凸起控件面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.raised.shadow` | 凸起控件面的投影 | `["edgeSurface","sm"]` | `sm` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.12)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.2)` | `sm` | — |
| `surfaces.raised.border` | 凸起控件面的边 | `border` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0 0 0 / 0.059)` / `oklch(1 0 0 / 0.071)` |
| `surfaces.raised.borderTop` | 凸起控件面的上边 | `border` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0 0 0 / 0.059)` / `oklch(1 0 0 / 0.094)` |
| `surfaces.raised.borderBottom` | 凸起控件面的下边 | `border` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0 0 0 / 0.161)` / `oklch(1 0 0 / 0.071)` |
| `surfaces.plate.foreground` | 井内选中滑块面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.plate.shadow` | 井内选中滑块面的投影 | `["edgeSurface","sm"]` | `sm` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.12)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.2)` | — | — |
| `surfaces.plate.background` | 井内选中滑块面的底 | `card` / `surface` | `card` / `input/30` | `card` / `surface` | `secondary` | `card` |
| `surfaces.plate.border` | 井内选中滑块面的边 | `border` / `oklch(0 0 0 / 0.5)` | `transparent` / `input` | `transparent` | `transparent` | `transparent` |
| `surfaces.overlay.background` | 菜单与浮层面的底 | `popover` | `card` | `popover/68` / `popover/70` | `popover` | `popover/85` / `popover/90` |
| `surfaces.overlay.foreground` | 菜单与浮层面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.overlay.border` | 菜单与浮层面的边 | `border` | `border` | `transparent` | `transparent` | `oklch(0 0 0 / 0.059)` / `oklch(0 0 0 / 0.2)` |
| `surfaces.overlay.shadow` | 菜单与浮层面的投影 | `lg` | `lg` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 24px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 24px oklch(0 0 0 / 0.38)` | `lg` | `lg` |
| `surfaces.modal.background` | 对话框与抽屉面的底 | `card` | `card` | `card/78` / `popover/78` | `oklch(0.93251 0.01479 312.24)` / `oklch(0.2859 0.01293 298.633)` | `background/94` |
| `surfaces.modal.foreground` | 对话框与抽屉面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.modal.border` | 对话框与抽屉面的边 | `border` | `border` | `transparent` | `transparent` | `oklch(0.5624 0 0 / 0.4)` |
| `surfaces.modal.shadow` | 对话框与抽屉面的投影 | `xl` | `xl` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 18px 48px oklch(0 0 0 / 0.2)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 18px 48px oklch(0 0 0 / 0.5)` | `xl` | `xl` |
| `surfaces.inverse.background` | 反色面的底 | `card` | `foreground` | `popover/70` | `oklch(0.31066 0.01135 308.056)` / `oklch(0.91401 0.01366 314.754)` | `popover/88` / `popover/92` |
| `surfaces.inverse.foreground` | 反色面的前景色 | `foreground` | `background` | `foreground` | `oklch(0.95906 0.01235 317.742)` / `oklch(0.31066 0.01135 308.056)` | `foreground` |
| `surfaces.inverse.border` | 反色面的边 | `border` | `transparent` | `transparent` | `transparent` | `line` |
| `surfaces.inverse.shadow` | 反色面的投影 | `lg` | `none` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 24px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 24px oklch(0 0 0 / 0.38)` | `xl` | `md` |
| `surfaces.glass.foreground` | 玻璃面的前景色 | `foreground` | `foreground` | `foreground` | `foreground` | `foreground` |
| `surfaces.glass.border` | 玻璃面的边 | `border` | `border` | `border` | `transparent` | `line` |
| `surfaces.glass.shadow` | 玻璃面的投影 | `["edgeSurface","sm"]` | `sm` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.12)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.2)` | `lg` | — |
| `surfaces.glass.backdropFilter` | 玻璃面的背景模糊 | `blur(20px)` | `blur(20px)` | — | — | — |
| `surfaces.glass.background` | 玻璃面的底 | `popover/80` / `card/78` | `card/80` | `popover/60` | `popover` | `popover/80` / `popover/86` |
| `surfaces.accent.background` | 强调填充面的底 | `primary` | `primary` | `primary` | `primary` | `primary` |
| `surfaces.accent.foreground` | 强调填充面的前景色 | `primary-foreground` | `primary-foreground` | `primary-foreground` | `primary-foreground` | `primary-foreground` |
| `surfaces.accent.shadow` | 强调填充面的投影 | `edgeAccent` | — | — | — | — |
| `surfaces.accent.border` | 强调填充面的边 | `color-mix(in srgb, {primary} 78%, oklch(0 0 0))` / `color-mix(in srgb, {primary} 45%, oklch(0 0 0))` | `transparent` | `transparent` | `transparent` | `oklch(0.52768 0.14982 252.341)` / `oklch(0.81732 0.11439 230)` |
| `surfaces.accent.borderBottom` | 强调填充面的下边 | `color-mix(in srgb, {primary} 78%, oklch(0 0 0))` / `color-mix(in srgb, {primary} 45%, oklch(0 0 0))` | `transparent` | `transparent` | `transparent` | `oklch(0.34485 0.10621 252.962)` / `oklch(0.7208 0.10826 230.667)` |
| `surfaces.fill.foreground` | 进度与选中填充面的前景色 | `primary-foreground` | `primary-foreground` | `primary-foreground` | `primary-foreground` | `primary-foreground` |
| `surfaces.fill.shadow` | 进度与选中填充面的投影 | `edgeAccent` | — | — | — | — |
| `surfaces.fill.background` | 进度与选中填充面的底 | `oklch(0.75073 0.18465 126.794)` / `oklch(0.83973 0.16469 124.137)` | `primary` | `primary` | `primary` | `primary` |
| `surfaces.fill.gradient` | 进度与选中填充面的渐变 | `linear-gradient(180deg, oklch(0.80472 0.1815 126.061) 0%, oklch(0.75073 0.18465 126.794) 100%)` / `linear-gradient(180deg, oklch(0.88348 0.15928 123.937) 0%, oklch(0.83973 0.16469 124.137) 100%)` | — | — | — | — |
| `surfaces.fill.border` | 进度与选中填充面的边 | `oklch(0.69169 0.17204 126.956)` / `oklch(0.71963 0.15821 125.456)` | `transparent` | `transparent` | `transparent` | `oklch(0.52768 0.14982 252.341)` / `oklch(0.81732 0.11439 230)` |
| `surfaces.raised.material` | 凸起控件面的材质 | — | — | `{"kind":"glass","glass":"regular","blur":24,"saturate":1.8,"minOpacity":0.68,"ios":"thin","specular":"oklch(1 0 0 / 0.55)"}` / `{"kind":"glass","glass":"regular","blur":24,"saturate":1.8,"minOpacity":0.68,"ios":"thin","specular":"oklch(1 0 0 / 0.16)"}` | — | — |
| `surfaces.overlay.effect` | 菜单与浮层面的GPU 表面着色 | — | — | `{"kind":"liquid-glass","intensity":0.42}` | — | `{"kind":"acrylic-noise","intensity":0.04}` |
| `surfaces.overlay.material` | 菜单与浮层面的材质 | — | — | `{"kind":"glass","glass":"regular","blur":30,"saturate":1.9,"minOpacity":0.64,"ios":"regular","specular":"oklch(1 0 0 / 0.55)"}` / `{"kind":"glass","glass":"regular","blur":30,"saturate":1.9,"minOpacity":0.64,"ios":"regular","specular":"oklch(1 0 0 / 0.16)"}` | — | `{"kind":"acrylic","blur":30,"saturate":1.25,"minOpacity":0.85,"specular":"oklch(1 0 0 / 0.6)"}` / `{"kind":"acrylic","blur":30,"saturate":1.25,"minOpacity":0.85,"specular":"oklch(1 0 0 / 0.09)"}` |
| `surfaces.modal.effect` | 对话框与抽屉面的GPU 表面着色 | — | — | `{"kind":"liquid-glass","intensity":0.3}` | — | `{"kind":"acrylic-noise","intensity":0.025}` |
| `surfaces.modal.material` | 对话框与抽屉面的材质 | — | — | `{"kind":"glass","glass":"regular","blur":36,"saturate":1.8,"minOpacity":0.72,"ios":"thick","specular":"oklch(1 0 0 / 0.55)"}` / `{"kind":"glass","glass":"regular","blur":36,"saturate":1.8,"minOpacity":0.72,"ios":"thick","specular":"oklch(1 0 0 / 0.16)"}` | — | `{"kind":"acrylic","blur":24,"saturate":1.15,"minOpacity":0.9,"specular":"oklch(1 0 0 / 0.6)"}` / `{"kind":"acrylic","blur":24,"saturate":1.15,"minOpacity":0.9,"specular":"oklch(1 0 0 / 0.09)"}` |
| `surfaces.inverse.effect` | 反色面的GPU 表面着色 | — | — | `{"kind":"liquid-glass","intensity":0.36}` | — | `{"kind":"acrylic-noise","intensity":0.03}` |
| `surfaces.inverse.material` | 反色面的材质 | — | — | `{"kind":"glass","glass":"regular","blur":28,"saturate":1.8,"minOpacity":0.68,"ios":"regular","specular":"oklch(1 0 0 / 0.55)"}` / `{"kind":"glass","glass":"regular","blur":28,"saturate":1.8,"minOpacity":0.68,"ios":"regular","specular":"oklch(1 0 0 / 0.16)"}` | — | `{"kind":"acrylic","blur":24,"saturate":1.2,"minOpacity":0.85,"specular":"oklch(1 0 0 / 0.6)"}` / `{"kind":"acrylic","blur":24,"saturate":1.2,"minOpacity":0.85,"specular":"oklch(1 0 0 / 0.09)"}` |
| `surfaces.glass.effect` | 玻璃面的GPU 表面着色 | — | — | `{"kind":"liquid-glass","intensity":0.5}` | — | `{"kind":"acrylic-noise","intensity":0.045}` |
| `surfaces.glass.material` | 玻璃面的材质 | — | — | `{"kind":"glass","glass":"clear","blur":26,"saturate":2,"minOpacity":0.58,"ios":"ultraThin","specular":"oklch(1 0 0 / 0.55)"}` / `{"kind":"glass","glass":"clear","blur":26,"saturate":2,"minOpacity":0.58,"ios":"ultraThin","specular":"oklch(1 0 0 / 0.16)"}` | — | `{"kind":"acrylic","blur":32,"saturate":1.3,"minOpacity":0.78,"specular":"oklch(1 0 0 / 0.6)"}` / `{"kind":"acrylic","blur":32,"saturate":1.3,"minOpacity":0.78,"specular":"oklch(1 0 0 / 0.09)"}` |
| `surfaces.card.elevation` | 卡片面的平台阴影高度（dp） | — | — | — | 1 | — |
| `surfaces.raised.elevation` | 凸起控件面的平台阴影高度（dp） | — | — | — | 1 | — |
| `surfaces.plate.elevation` | 井内选中滑块面的平台阴影高度（dp） | — | — | — | 0 | — |
| `surfaces.overlay.elevation` | 菜单与浮层面的平台阴影高度（dp） | — | — | — | 3 | — |
| `surfaces.modal.elevation` | 对话框与抽屉面的平台阴影高度（dp） | — | — | — | 6 | — |
| `surfaces.inverse.elevation` | 反色面的平台阴影高度（dp） | — | — | — | 6 | — |
| `surfaces.glass.elevation` | 玻璃面的平台阴影高度（dp） | — | — | — | 3 | — |
| `surfaces.inset.borderBottom` | 凹槽井面的下边 | — | — | — | — | `oklch(0 0 0 / 0.447)` / `oklch(1 0 0 / 0.545)` |

## 8 elevation

亮暗两套投影刻度与硬边高光。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `elevation.sm` | 控件投影 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 1px 2px oklch(0 0 0 / 0.12)` / `0 1px 2px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | — |
| `elevation.md` | 卡片投影 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04)` / `0 1px 0 oklch(0 0 0 / 0.35)` | `0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)` | — | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `0 0 2px oklch(0 0 0 / 0.12), 0 4px 8px oklch(0 0 0 / 0.14)` / `0 0 2px oklch(0 0 0 / 0.24), 0 4px 8px oklch(0 0 0 / 0.28)` |
| `elevation.lg` | 浮层投影 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04), 0 12px 28px -10px oklch(0.1686 0.02256 263.693 / 0.22)` / `0 1px 0 oklch(0 0 0 / 0.4), 0 16px 32px -10px oklch(0 0 0 / 0.6)` | `0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 24px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 24px oklch(0 0 0 / 0.38)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 2px 6px 2px oklch(0 0 0 / 0.15)` | `0 0 8px oklch(0 0 0 / 0.12), 0 16px 32px oklch(0 0 0 / 0.14)` / `0 0 8px oklch(0 0 0 / 0.4), 0 16px 32px oklch(0 0 0 / 0.48)` |
| `elevation.xl` | 模态框投影 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04), 0 12px 28px -10px oklch(0.1686 0.02256 263.693 / 0.22)` / `0 1px 0 oklch(0 0 0 / 0.4), 0 16px 32px -10px oklch(0 0 0 / 0.6)` | `0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 18px 48px oklch(0 0 0 / 0.2)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 18px 48px oklch(0 0 0 / 0.5)` | `0 1px 3px oklch(0 0 0 / 0.3), 0 4px 8px 3px oklch(0 0 0 / 0.15)` | `0 0 8px oklch(0 0 0 / 0.12), 0 64px 128px oklch(0 0 0 / 0.14)` / `0 0 8px oklch(0 0 0 / 0.4), 0 64px 128px oklch(0 0 0 / 0.48)` |
| `elevation.inset` | 凹槽内阴影 | `inset 0 1px 1px oklch(0.1686 0.02256 263.693 / 0.06)` / `inset 0 1px 1px oklch(0 0 0 / 0.2)` | — | — | — | — |
| `elevation.edgeSurface` | 凸起表面的高光硬边 | `inset 0 1px 0 oklch(1 0 0), inset 0 2px 0 oklch(1 0 0 / 0.6)` / `inset 0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 1px oklch(1 0 0 / 0.08)` | — | `0 0 0 0.5px oklch(0 0 0 / 0.08)` / `0 0 0 0.5px oklch(1 0 0 / 0.1)` | — | — |
| `elevation.edgeAccent` | 强调面的高光与投影边 | `inset 0 1px 0 oklch(1 0 0 / 0.55), inset 0 -1px 0 oklch(0.42761 0.11265 128.534 / 0.12), 0 1px 0 oklch(0.42761 0.11265 128.534 / 0.14)` / `inset 0 0 0 1px oklch(1 0 0 / 0.22), inset 0 1px 1px oklch(1 0 0 / 0.35), 0 1px 1px oklch(0 0 0 / 0.12)` | — | — | — | — |

## 9 controls

13 个控件组的稀疏配方，消除了布尔特征分支；零星保留项通过数值退化实现（如 `switch.knob.on` 与 `slider.mark`）。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `controls.button.corner.sm` | 小号按钮圆角策略 | `control` | `control` | 5 / `full` | `full` | `control` |
| `controls.button.corner.md` | 中号按钮圆角策略 | `control` | `control` | 6 / `full` | `full` | `control` |
| `controls.button.corner.lg` | 大号按钮圆角策略 | `control` | `control` | 8 / `full` | `full` | `control` |
| `controls.button.selected.face` | 选中按钮的底面 | `surface(accent)` | `input` | `tint(brand)` | `surface(accent)` | `surface(accent)` |
| `controls.button.selected.ink` | 选中按钮的前景色 | `primary-foreground` | `foreground` | `brand` | `primary-foreground` | `primary-foreground` |
| `controls.button.secondary.face` | 次要按钮的底面 | `surface(raised)` | `surface(raised)` | `surface` | `secondary` | `surface(raised)` |
| `controls.button.secondary.edge` | 次要按钮的描边 | `border` | `border` | `none` | `none` | `border` |
| `controls.button.outline.edge` | 描边按钮的边 | `border` | `border` | `border` | `input` | `surface(raised)` |
| `controls.button.destructive.edge` | 危险按钮的边 | `destructive/32` | `none` | `none` | `none` | `none` |
| `controls.button.shade` | 按钮使用的表面角色 | `raised` | `raised` | `none` | `none` | `raised` |
| `controls.badge.corner` | 徽章圆角策略 | `control` | `full` | `full` | `full` | `control` |
| `controls.field.ground` | 输入框底色 | `card` / `background` | `background` / `input/30` | `card` / `surface` | `muted` | `surface` |
| `controls.field.shade` | 输入框表面角色 | `inset` | `inset` | `inset` | `inset` | `inset` |
| `controls.field.edge.sides` | 输入框是否绘制左右与上边框 | true | true | true | false | true |
| `controls.field.edge.color` | 输入框四周边框色 | `input` | `input` | `input` | `input` | `line` |
| `controls.field.edge.bottom` | 输入框底边颜色 | `input` | `input` | `input` | `muted-foreground` | `input` |
| `controls.field.focus.line` | 输入框获焦时是否加粗底线 | false | false | false | true | true |
| `controls.field.focus.width` | 输入框获焦线宽 | 3 | 3 | 3 | 2 | 2 |
| `controls.field.focus.color` | 输入框获焦高亮角色 | `brand` | `ring` | `ring` | `brand` | `brand` |
| `controls.choice.size` | 选择控件命中或视觉方框外尺寸 | 16 / 22 | 16 / 22 | 16 / 22 | 20 / 24 | 20 / 24 |
| `controls.choice.box` | 选择控件框体尺寸 | 16 / 20 | 16 / 20 | 16 / 20 | 18 / 22 | 20 / 24 |
| `controls.choice.corner` | 复选框圆角策略 | 5 / 7 | 4 / 6 | 4 / 7 | 2 / 3 | 4 / 6 |
| `controls.choice.face` | 未选中选择框底色 | `card` / `input/30` | `card` / `input/30` | `card` / `surface` | `none` | `oklch(0.94611 0 0)` / `oklch(0.23075 0 0)` |
| `controls.choice.shade` | 选择框表面角色 | `inset` | `none` | `none` | `none` | `none` |
| `controls.choice.edge.width` | 选择框描边宽 | 1 | 1 | 1 | 2 | 1 |
| `controls.choice.edge.color` | 选择框默认描边色 | `input` / `foreground/20` | `input` / `foreground/20` | `input` / `foreground/20` | `muted-foreground` | `input` |
| `controls.choice.edge.disabled` | 选择框禁用态描边色 | `input` / `foreground/40` | `input` / `foreground/40` | `input` / `foreground/40` | `muted-foreground` | `input` |
| `controls.choice.checked.face` | 复选框选中底面 | `surface(accent)` | `surface(accent)` | `surface(accent)` | `primary` | `primary` |
| `controls.choice.radioChecked.face` | 单选框选中面 | `surface(accent)` | `none` | `surface(accent)` | `none` | `primary` |
| `controls.choice.mark` | 单选框内圆点尺寸 | 6 / 8 | 8 / 10 | 6 / 8 | 10 / 12 | 12 / 14 |
| `controls.switch.track` | 默认开关轨道宽高 `[w, h]` | `[36,20]` / `[44,24]` | `[32,18]` / `[44,24]` | `[54,24]` / `[63,28]` | `[40,24]` / `[52,32]` | `[40,20]` / `[44,22]` |
| `controls.switch.trackOffFace` | 开关关闭态轨道底色 | `oklch(0.96124 0.00414 271.369)` / `oklch(0.23027 0.01247 264.293)` | `input` / `oklch(0.28969 0 0)` | `oklch(0.96743 0.00133 286.375)` / `oklch(0.29471 0.00718 285.951)` | `muted` | `oklch(0.94611 0 0)` / `oklch(0.23075 0 0)` |
| `controls.switch.small.track` | 小号开关轨道宽高 `[w, h]` | `[28,16]` / `[36,20]` | `[24,14]` / `[36,20]` | `[40,18]` / `[48,22]` | `[32,20]` / `[40,24]` | `[32,16]` / `[36,18]` |
| `controls.switch.small.knob` | 小号开关滑块尺寸 | 12 / 16 | 12 / 16 | `[23,14]` / `[28,18]` | 12 / 16 | 10 / 12 |
| `controls.switch.edge.off` | 开关关闭态边框宽 | 1 | 0 | 0 | 2 | 1 |
| `controls.switch.edge.on` | 开关打开态边框宽 | 1 | 0 | 0 | 0 | 0 |
| `controls.switch.edge.color` | 开关边框色 | `border` | `none` | `none` | `input` | `input` |
| `controls.switch.knob.size` | 开关滑块常态尺寸 | `{"pointer":16,"touch":20}` | `{"pointer":16,"touch":20}` | `{"pointer":[31,20],"touch":[37,24]}` | `{"pointer":16,"touch":20}` | `{"pointer":12,"touch":14}` |
| `controls.switch.knob.on` | 开关滑块打开态尺寸（`same` 表示不变，Material 为放大） | `same` | `same` | `same` | `{"pointer":20,"touch":24}` | `same` |
| `controls.switch.knob.pressed` | 开关滑块按下态尺寸 | `same` | `same` | `{"pointer":[36,20],"touch":[43,24]}` | `{"pointer":22,"touch":28}` | `{"pointer":[17,14],"touch":[19,16]}` |
| `controls.switch.knob.background` | 开关滑块常态底色 | `{"light":"oklch(1 0 0)","dark":"oklch(0.92199 0.00419 271.367)"}` | `{"light":"background","dark":"foreground"}` | `primary-foreground` | `{"light":"muted-foreground","dark":"faint"}` | `{"light":"muted-foreground","dark":"muted-foreground"}` |
| `controls.switch.knob.gradient` | 开关滑块常态渐变 | `{"light":"linear-gradient(180deg, oklch(1 0 0) 0%, {surface} 100%)","dark":"linear-gradient(180deg, {foreground} 0%, oklch(0.88185 0.00589 264.53) 100%)"}` | — | — | — | — |
| `controls.switch.knob.border` | 开关滑块常态边色 | `{"light":"input","dark":"oklch(0.8324 0.00597 264.528)"}` | `transparent` | `transparent` | `transparent` | `transparent` |
| `controls.switch.knob.shadow` | 开关滑块投影 | `sm` | `sm` | `sm` | — | — |
| `controls.switch.knob.checkedBackground` | 开关滑块打开态底色 | `{"light":"oklch(1 0 0)","dark":"oklch(1 0 0)"}` | `{"light":"background","dark":"primary-foreground"}` | `primary-foreground` | `primary-foreground` | `primary-foreground` |
| `controls.switch.knob.checkedBorder` | 开关滑块打开态边色 | `{"light":"oklch(0.72099 0.15728 124.776)","dark":"oklch(0.71963 0.15821 125.456)"}` | `transparent` | `transparent` | `transparent` | `transparent` |
| `controls.slider.rail` | 滑杆轨道粗细 | 6 / 8 | 6 / 8 | 4 / 6 | 4 / 6 | 4 / 6 |
| `controls.slider.band` | 滑杆容器高度 | 20 / 32 | 20 / 32 | 24 / 32 | 20 / 32 | 32 / 36 |
| `controls.slider.face` | 滑杆未选轨道底色 | `oklch(0.93714 0.00417 271.368)` / `oklch(0.33232 0.01134 264.409)` | `muted` | `muted` / `oklch(0.34609 0.00689 286.034)` | `secondary` | `input` |
| `controls.slider.shade` | 滑杆轨道表面角色 | `inset` | `none` | `none` | `none` | `none` |
| `controls.slider.edge.color` | 滑杆轨道边色 | `border` | `none` | `border` | `none` | `none` |
| `controls.slider.edge.width` | 滑杆轨道边宽 | 1 | 0 | 0 | 0 | 0 |
| `controls.slider.knob.size` | 滑杆手柄尺寸 | `{"pointer":14,"touch":20}` | `{"pointer":16,"touch":20}` | `{"pointer":[20,16],"touch":[37,24]}` | `{"pointer":16,"touch":20}` | `{"pointer":18,"touch":24}` |
| `controls.slider.knob.pressed` | 滑杆手柄按下尺寸 | `{"pointer":14,"touch":32}` | `{"pointer":16,"touch":32}` | `{"pointer":[20,16],"touch":[49,32]}` | `{"pointer":16,"touch":32}` | `{"pointer":18,"touch":36}` |
| `controls.slider.knob.background` | 滑杆手柄底色 | `{"light":"oklch(1 0 0)","dark":"oklch(0.92199 0.00419 271.367)"}` | `{"light":"background","dark":"foreground"}` | `primary-foreground` | `primary` | `{"light":"muted-foreground","dark":"muted-foreground"}` |
| `controls.slider.knob.gradient` | 滑杆手柄渐变 | `{"light":"linear-gradient(180deg, oklch(1 0 0) 0%, {surface} 100%)","dark":"linear-gradient(180deg, {foreground} 0%, oklch(0.88185 0.00589 264.53) 100%)"}` | — | — | — | — |
| `controls.slider.knob.border` | 滑杆手柄边色 | `{"light":"input","dark":"oklch(0.8324 0.00597 264.528)"}` | `primary` | `border` | `transparent` | `transparent` |
| `controls.slider.knob.shadow` | 滑杆手柄投影 | `sm` | `sm` | `sm` | — | — |
| `controls.slider.mark` | 滑杆手柄中心色点直径（WinUI 专用，其余为 0） | 0 | 0 | 0 | 0 | 12 / 16 |
| `controls.progress.height` | 进度条高度 | 6 | 6 | 6 | 4 | 3 |
| `controls.progress.face` | 进度条未填轨道底色 | `oklch(0.93714 0.00417 271.368)` / `oklch(0.33232 0.01134 264.409)` | `oklch(0.93714 0.00417 271.368)` / `oklch(0.33232 0.01134 264.409)` | `oklch(0.93714 0.00417 271.368)` / `oklch(0.33232 0.01134 264.409)` | `secondary` | `input` |
| `controls.progress.shade` | 进度条轨道表面角色 | `inset` | `inset` | `inset` | `none` | `none` |
| `controls.progress.edge.color` | 进度条轨道边色 | `border` | `border` | `border` | `none` | `none` |
| `controls.progress.edge.width` | 进度条轨道边宽 | 1 | 1 | 1 | 0 | 0 |
| `controls.spinner.trackOpacity` | 环形加载器底环透明度 | 0.25 | 0.25 | 0 | 0 | 0 |
| `controls.popup.corner` | 弹出层圆角策略 | `container` | `control` | `container` | `control` | `container` |
| `controls.list.item.highlight` | 列表选中/聚焦项高亮底色 | `tint(brand)` | `accent` | `tint(brand)` | `accent` | `accent` |
| `controls.list.item.edge` | 列表高亮项描边色 | `brand/30` | `none` | `none` | `none` | `none` |
| `controls.tabs.track.face` | 标签栏轨道底色 | `oklch(0.96124 0.00414 271.369)` / `oklch(0.23027 0.01247 264.293)` | `muted` | `oklch(0.96743 0.00133 286.375)` / `oklch(0.29471 0.00718 285.951)` | `none` | `oklch(0.94611 0 0)` / `oklch(0.23075 0 0)` |
| `controls.tabs.track.edge` | 标签栏轨道边色 | `border` | `none` | `border` | `border` | `line` |
| `controls.tabs.track.corner` | 标签栏轨道圆角策略 | `full` | `control` | `full` | `full` | `control` |
| `controls.menubar.bar` | 菜单栏底面样式 | `card` | `card` | `none` | `card` | `none` |
| `controls.well.edge` | 输入井（Well）边框色 | `border` | `border` | `none` | `none` | `border` |
