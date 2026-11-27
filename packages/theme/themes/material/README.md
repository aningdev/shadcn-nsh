# Material

Android 的平台主题（`id: "material"`）。`nativeTheme()` 在 `platform.os` 为 `android` 时返回它。依据是 Material 3 Expressive（`material-web` v34.0.21 / Compose Material 3 1.5.0）：baseline 紫、Tonal Surface、State layer、圆形圆角。官方说明见 [m3.material.io](https://m3.material.io/)。

## 核心实现映射

**色彩。** 亮色 `background` `#FEF7FF`（`oklch(0.98379 0.01284 321.894)`），`primary` `#6750A4`（`oklch(0.49552 0.13046 293.709)`），`secondary` `#E8DEF8`（`oklch(0.91633 0.03651 303.106)`）。暗色 `primary` 为 `oklch(0.83493 0.09457 298.018)`。`scrim` 为 `oklch(0 0 0 / 0.32)`。`tints` 是实色 Tonal Container（`brand` / `info` / `success` / `warning` / `destructive` 各有亮暗），不是 `tintAlpha` 叠出来的。`chart` 第二色是 tertiary 粉（亮 `oklch(0.49039 0.06053 358.445)`）。调色板覆写后 `brand` 在 `theme.json` 里为 `var(--primary)`。

**Surface 与阴影。** 用色调表面台阶加 Material Web 双层阴影，不用 backdrop blur。`sm` 与 `md` 同级；`inset` 与边光为空。

| 角色                | 做法                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `card`              | 边透明，`elevation` 1                                                                             |
| `inset` / `channel` | 底 `popover`；`inset` 边 `muted-foreground`，`channel` 边 `line`                                  |
| `raised`            | `shadow: "sm"`，`elevation` 1，边全透明                                                           |
| `plate`             | 底 `secondary`，`elevation` 0                                                                     |
| `overlay`           | `elevation` 3                                                                                     |
| `modal`             | `elevation` 6；自有表面色，亮 `oklch(0.93251 0.01479 312.24)`、暗 `oklch(0.2859 0.01293 298.633)` |
| `inverse`           | 反色，`elevation` 6，`shadow: "xl"`                                                               |
| `glass`             | 无 `backdropFilter`，`elevation` 3，底 `popover`                                                  |
| `fill`              | 无阴影，底 `primary`                                                                              |

**圆角与曲线。** `control` / `container` / `modal` 为 4 / 12 / 28（Corner Extra Small / Medium / Extra Large），`curve: "circular"`。按钮与 `badge` 全档 `"full"`。

**密度。** M3 没有官方桌面密度。指针档是本库自己的一档：高 24 / 32 / 40，触屏 32 / 40 / 56（对齐 Button XSmall / Small / Medium）。`hit.touch` 为 48。`density` 两档 `pad` 16、`gap` 12。行 `inset` 0、`pad` 12。字重与字距贴近 M3；不设平台字号，字阶仍是共享的 `SHARED_TYPE_SCALE`。

**Motion。** `state` 100 ms，`fast` / `default` 150 / 250 ms `standard`，`slow` 400 ms `emphasized-decelerate`。弹簧 `380/32`；`snappy` `520/32`、`smooth` `360/38`、`bouncy` `320/22`。`popoverEnter` 自 0.96 / −4；`dialogEnter` 自 0.94 / 8，走 `slow` + `bouncy`。没有按下弹簧。`themeSwitch` 为 `radial-wipe` 320 ms。悬停 overlay `0.08`，按下 `scale` 1、overlay `0.1`。焦点 outline 宽 3、偏移 2。禁用内容透明度 0.38，`replaceFace`：面 `foreground/0.12`、墨 `/0.38`。

## 关键控件与有意取舍

| 控件        | 本主题怎么画                                                                                                                  | 为什么这样做 / 不做什么                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Button      | 全尺寸胶囊。次要面 `secondary`、无边。轮廓边 `input`。破坏性无边。`shade: "none"`                                             | 填充按钮走 M3 的 full 圆角。按下是 state layer，不是 Android ripple       |
| Field       | 底 `muted`，两侧无边，底边 `muted-foreground`；焦点下划线宽 2、色 `brand`                                                     | M3 filled field 的底边，不是四边盒                                        |
| Choice      | 盒 18 / 22，角 2 / 3，边宽 2。选中面 `primary`；radio 选中面 `none`。勾 10 / 12                                               | 方框勾选；radio 不填满盘面                                                |
| Switch      | 轨道 40×24 / 52×32。关态边 2、开态边 0。旋钮 16 / 20 → 开 20 / 24 → 按下 22 / 28（`expand`）。选中旋钮底 `primary-foreground` | M3 不给 Switch 单独密度，指针档是同一形状缩小一档。不画可选的 `thumbIcon` |
| Slider      | 轨 4 / 6，面 `secondary`，旋钮 16 / 20，触屏按下 32，底 `primary`                                                             | 把手是 Primary，未激活轨道是 SecondaryContainer 的角色                    |
| Progress    | 高 4，面 `secondary`                                                                                                          | 与滑块未激活轨道同一角色                                                  |
| Popup       | 角 `control`（4）                                                                                                             | 菜单与选择浮层用小圆角，不用 `container` 12                               |
| Tabs / Well | 轨道面 `none`；凹槽无边                                                                                                       | 分段轨道是表面本身，选中块贴平。不画 M3 相连单元格和前置勾                |

`meta.donts`：不要给 tonal container 加 blur 或边。

## 验证

`bun run theme:contrast`、`bun run theme:diff`。数值以 `packages/theme/themes/material/index.ts` 为准。契约见 [`docs/theme.md`](../../../../docs/theme.md)。
