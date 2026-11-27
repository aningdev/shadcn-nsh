# Apple

iOS 与 macOS 的平台主题（`id: "apple"`）。`nativeTheme()` 在 `platform.os` 为 `ios` 或 `macos` 时返回它。依据是 Apple Human Interface Guidelines 与 UIKit 系统色：`systemBackground`、`systemBlue`、`secondaryLabel`、连续曲率圆角，以及 iOS 26 / macOS 26 的 Liquid Glass。

## 核心实现映射

**色彩。** 亮色 `background` / `card` / `popover` 为白 `#FFFFFF`，`foreground` 为黑；`primary` / `ring` / `info` 为 systemBlue `#007AFF`（`oklch(0.60276 0.21771 257.424)`）。暗色背景为黑，`primary` 为 `oklch(0.62425 0.20558 255.486)`。`inset` 亮色 `#F2F2F7`（`oklch(0.96257 0.00665 286.274)`），暗色 `oklch(0.29471 0.00718 285.951)`。调色板覆写不继承基线的 `brand`，`theme.json` 的 `brand` 编译成 `var(--primary)`。`tintAlpha` 为 `0.12`。`scrim` 为 `oklch(0 0 0 / 0.4)`。`chart` 五色按系统色写明，不走缺省的 `[brand, info, success, warning, destructive]`。

**Surface 与材质。** `appleGlass()` 故意省略 `macos.backdrop`：macOS 26+ 走原生 `NSGlassEffectView`（`glassEffect` + `glassTintColor`），更早的 macOS 与 web 回退 `backdropFilter`。高光亮色 `oklch(1 0 0 / 0.55)`、暗色 `/ 0.16`。光学 `liquid-glass` 只铺在 `overlay` / `modal` / `inverse` / `glass`。

| 角色      | 玻璃    | 模糊 / 饱和 / 最低不透明度                       | iOS backdrop | `liquid-glass` |
| --------- | ------- | ------------------------------------------------ | ------------ | -------------- |
| `raised`  | regular | 24 / 1.8 / 0.68，填充 α 0.72                     | thin         | —              |
| `overlay` | regular | 30 / 1.9 / 0.64，填充 α 0.68 / 0.7               | regular      | 0.42           |
| `modal`   | regular | 36 / 1.8 / 0.72，填充 α 0.78                     | thick        | 0.3            |
| `inverse` | regular | 28 / 1.8 / 0.68，填充 α 0.7                      | regular      | 0.36           |
| `glass`   | clear   | 26 / 2 / 0.58，填充 α 0.6；清空基线 `blur(20px)` | ultraThin    | 0.5            |

阴影是 0.5px 发丝描边加投影（`lg` / `xl`）。`card` 无投影。

**圆角与曲线。** `control` / `container` / `modal` 为 8 / 12 / 16，`curve: "continuous"`。按钮角：指针档 `sm` / `md` / `lg` 为 5 / 6 / 8 pt，触屏档为 `"full"`。`badge` 为胶囊。发丝 `stroke.hairline` 为 0.5，控件描边为 1。

**密度。** 指针高度继承 NSH Gallery 的 24 / 28 / 32；触屏覆写为 32 / 44 / 56。`density` 两档 `pad` 16、`gap` 12。触屏行 `inset` 0、`pad` 16。命中区继承指针 0、触屏 44。

**Motion。** 时长继承基线 120 / 150 / 250 / 350 ms、`out-cubic`。弹簧 `360/30/1`；`snappy` `520/34`、`smooth` `340/34`、`bouncy` `380/26`。`popoverEnter` 自 0.94 / −4，`dialogEnter` 自 0.94 / 8（`bouncy`）。按下用 `snappy`。`themeSwitch` 为 `dissolve` 240 ms。悬停叠 6% `foreground`；按下 `scale` 0.97，强调面透明度 0.72；禁用内容透明度 0.4。

## 关键控件与有意取舍

| 控件           | 本主题怎么画                                                                                                                           | 为什么这样做 / 不做什么                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Button         | 指针档小圆角 5 / 6 / 8；触屏才是胶囊。选中面是 12% `brand` 色晕、墨为 `brand`。次要面 `surface`、无自有边。破坏性无边。`shade: "none"` | 桌面不是一律胶囊。跨端仍是同一套 `controls.button` 槽，不按 `theme.id` 分支                             |
| Field          | 亮色底 `card`、暗色底 `surface`；焦点色 `ring`                                                                                         | 四边沿用基线的 `input` 边，不改成下划线                                                                 |
| Choice         | 指针角 4、触屏角 7；面为 `card` / `surface`                                                                                            | 方圆角勾选，不是圆形 radio 盘                                                                           |
| Switch         | 轨道指针 54×24、触屏 63×28；旋钮 31×20 / 37×24，按下 36×20 / 43×24（变宽）。边宽 0。关态轨道接近 `inset`                               | 按下只改变旋钮几何（`stretch`）。没有拖拽透镜或折射槽；光学折射只在玻璃 surface。透镜待底座有对应槽再做 |
| Slider         | 轨 4 / 6，带宽 24 / 32。旋钮指针 20×16（按下不变），触屏 37×24 → 按下 49×32。面为白，边为 `border`                                     | 同上：按下是几何，不是透镜                                                                              |
| Spinner        | `trackOpacity: 0`                                                                                                                      | 不画轨道环                                                                                              |
| Tabs           | 轨道为自定义浅灰 / 暗色 `inset`                                                                                                        | 分段轨道用系统分组底，不是 `channel` 默认                                                               |
| Menubar / Well | `bar: "none"`，`edge: "none"`                                                                                                          | 菜单条与凹槽不另加边                                                                                    |
| AlertDialog    | 全平台调用 `nsh/base` 的 `AlertDialog.show`，不绘制本库 `modal`                                                                        | 桌面与移动都是系统对话框。本主题的 Liquid Glass modal 不套到警告框上                                    |

对比度豁免：`muted-foreground` 对 `background` / `muted` / `card` / `surface`（`secondaryLabel` `#3C3C43` at 60%）、白字 on systemBlue、`brand` on `background`。

## 验证

`bun run theme:contrast`、`bun run theme:diff`。不要用粗边或 `circular` 取代 0.5px 连续角。数值以 `packages/theme/themes/apple/index.ts` 为准；改后跑 `bun run theme:build`。契约见 [`docs/theme.md`](../../../../docs/theme.md)。
