# WinUI 3

Windows 的平台主题（`id: "winui"`，标签 WinUI 3）。`nativeTheme()` 在 `platform.os` 为 `windows` 时返回它。依据是 Fluent 2 / WinUI 3：`ControlCornerRadius` 4、`OverlayCornerRadius` 8、Accent 蓝、Acrylic，以及无过冲的减速动效。控件资源见 WinUI 3 的 `*_themeresources.xaml` 与 [Windows 应用设计](https://learn.microsoft.com/windows/apps/design/)。

## 核心实现映射

**色彩。** 亮色 `background` `#F3F3F3`（`oklch(0.96415 0 0)`）。`primary` 与 `info` 同为 `#005FB8`（`oklch(0.49147 0.15959 254.594)`），`brand` `#003E92`（`oklch(0.38687 0.14996 259)`）。暗色 `primary` / `info` 为 `#60CDFF`（`oklch(0.80403 0.12199 230.822)`），`brand` 为 `oklch(0.8943 0.08425 214.859)`。`tints.info` 是浅蓝实色：亮 `#E5F1FB`（`oklch(0.9521 0.01859 242.967)`）、暗 `#1E3246`（`oklch(0.30996 0.04454 249.438)`）。`scrim` 为 `oklch(0 0 0 / 0.302)`。`chart` 为 `primary`、`success`、`warning`、`destructive`、`input`。

**Surface、Acrylic 与阴影。** 组件材质是 in-app Acrylic（`winuiAcrylic`：`kind: "acrylic"` + `acrylic-noise`），不是窗口级 Mica。真 Mica 是应用壳的 `window.backdrop`，本库用 Acrylic 或不透明底降级。高光亮色 `oklch(1 0 0 / 0.6)`、暗色 `/ 0.09`。`raised` 用半透明上下边做斜面，无投影。

| 角色      | Acrylic                                                              | 噪声  | 填充                    |
| --------- | -------------------------------------------------------------------- | ----- | ----------------------- |
| `overlay` | blur 30，saturate 1.25，minOpacity 0.85；投影 `lg`                   | 0.04  | `popover` α 0.85 / 0.9  |
| `modal`   | blur 24，saturate 1.15，minOpacity 0.9；边 `oklch(0.5624 0 0 / 0.4)` | 0.025 | `background` α 0.94     |
| `inverse` | blur 24，saturate 1.2，minOpacity 0.85；投影 `md`                    | 0.03  | `popover` α 0.88 / 0.92 |
| `glass`   | blur 32，saturate 1.3，minOpacity 0.78；清空基线 `blur(20px)`        | 0.045 | `popover` α 0.8 / 0.86  |

`card` 边为半透明黑（亮 0.059 / 暗 0.102），无投影。`elevation.sm` 为空；`md` / `lg` / `xl` 是环境阴影。

**圆角与曲线。** `control` / `container` / `modal` 为 4 / 8 / 8，`curve: "circular"`。不要改成 `continuous`。

**密度。** 指针档是 WinUI Standard：高 24 / 32 / 40，`density` pad 12、gap 8，行 inset 4、pad 11，控件 padding 6、gap 8（`Button_themeresources.xaml` 与 `MenuFlyoutItemThemePadding`，记在 `meta.scaleCitations`）。触屏是本库加一档：高 32 / 40 / 48，pad 16、gap 12，行 inset 8、pad 12。字重只有 400 与 600；`label` 为 400。不设平台字号。

**Motion。** 83 / 167 / 250 / 333 ms（`decelerate`，`fast` 为 `point-to-point`）。弹簧注释要求阻尼比 ≥ 1、无过冲：`500/46`，`snappy` `650/52`，`smooth` `420/42`，`bouncy` `360/40`。`popoverEnter` 自 0.98 / −6；`dialogEnter` 自 1.05 / 0。没有按下弹簧。`themeSwitch` 为 `fade` 167 ms。悬停是换色，不是 overlay。按下 `scale` 1，强调面另有按下的背景与前景。焦点 `double`，宽 2、偏移 0；内线亮白、暗 `oklch(0.14479 0 0)`。禁用内容透明度 0.36，`replaceFace`。

## 关键控件与有意取舍

| 控件     | 本主题怎么画                                                                              | 为什么这样做 / 不做什么                       |
| -------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| Button   | 轮廓边走 `raised` 的斜面。破坏性无边                                                      | 圆角留在 `control` 4，不改成胶囊。按下是换色  |
| Field    | 底 `surface`，四边 `line`，底边 `input`；焦点线宽 2、色 `brand`                           | WinUI 的浅盒加深底边（`ControlStrongStroke`） |
| Choice   | 20 / 24 方，角 4 / 6，边宽 1、色 `input`。选中面与 radio 选中面都是 `primary`。勾 12 / 14 | 勾选与单选都填 Accent，不把 radio 留空        |
| Switch   | 轨道 40×20 / 44×22。关态边 1、开态边 0。旋钮 12 / 14，按下 17×14 / 19×16（变宽）          | 按下只拉宽旋钮。不另做拖拽透镜                |
| Slider   | 轨 4 / 6，带宽 32 / 36，面 `input`。旋钮 18 / 24，按下 18 / 36。内点 `mark` 12 / 16       | 轨道用 `input`，不是品牌填充                  |
| Progress | 高 3，面 `input`                                                                          | 与滑块轨道同一角色，比 M3 更细                |
| Tabs     | 轨道有 `line` 边，角 `control`                                                            | 分段条带边，不是无边色板                      |
| Menubar  | `bar: "none"`                                                                             | 菜单条不另加底                                |
| Mica     | 不作为 `material.kind`                                                                    | 窗口级 Mica 属于应用壳。浮层用上表的 Acrylic  |

对比度豁免：按下强调面的前景对背景（`TextOnAccentFillColorSecondary` on `AccentFillColorTertiary`）。

## 验证

`bun run theme:contrast`、`bun run port:render:theme --theme winui`。不要用 `continuous` 取代 `circular`。数值以 `packages/theme/themes/winui/index.ts` 为准。契约见 [`docs/theme.md`](../../../../docs/theme.md)。
