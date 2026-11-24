# 0010 删掉按压水波与动效弹簧

- 日期：2026-11-24
- 状态：已采纳（2026-11-24）
- 实现：#340
- 关联：[0004](0004-theme-contract-freeze.md)（契约冻结前要做的四件之一）、[0007](0007-theme-customization-scope.md) 第 1 条“动效”一行

## 背景

契约里有两处只服务于一个平台的东西：

- **`state.ripple`**：一个布尔，只有 material 开。开了以后，按钮、开关、标签页等十来个组件各自挂一个 `android.ripple`，颜色按各自表面的墨色算（`pressRipple` / `pressHostProps`）。只有 Android 画得出来，其余平台这条路径是空的。
- **动效弹簧**：`motion.fast / default / slow` 每档可以是 `{ stiffness, damping }` 弹簧，也可以是 `{ duration, timingFunction }` 时序。default 与 apple 用弹簧，winui 用时序，material 用 M3 的 spatial 弹簧。每个读动效的地方（`animate`、`follow`、`Roll`、`cssMotion`）都要先判断是哪一种（`isTiming`），CSS 过渡又只能表达时序，弹簧在那里要换算成近似的时长。

两者都是为迁就某一套主题长出来的分支。契约要在 #293 P6 与 #357、#358 之后冻结（0004），冻结前要把它们清掉。

## 决定

- **删 `state.ripple`。** 按压画的状态层与别的主题一样（`state.overlay.pressed`）。组件不再设 `android` 的 ripple 属性，`pressRipple`、`pressHostProps` 与各组件的 `android` 字段一并删掉；`finishes` 的 `material.android` 只剩 `elevation`。
- **删弹簧。** 动效只有 `duration` + `timingFunction`：`Spring` 类型、`isTiming`、`resolveMotion` 的弹簧分支、生成器与 lint 里的弹簧规则、`animate` 的 `springExtra` 都删掉。`motion.fast / default / slow` 三档都是时序，`motion.state` 原本就是。
- **各主题取最近的时序值：**

  | 主题                | fast               | default             | slow                           |
  | ------------------- | ------------------ | ------------------- | ------------------------------ |
  | default、apple      | 150 ms `out-cubic` | 250 ms `out-cubic`  | 350 ms `out-cubic`             |
  | material            | 150 ms `standard`  | 250 ms `standard`   | 400 ms `emphasized-decelerate` |
  | shadcn、solid-glass | 同 default         | 同 default          | 同 default                     |
  | winui               | 83 ms `decelerate` | 167 ms `decelerate` | 250 ms `decelerate`（不变）    |

  default 与 apple 的时长取三档弹簧大致的落定时间（150、250、350 ms）；material 取 M3 的 `short3`（150）、`medium1`（250）与 `medium4`（400），曲线用它自己的 `standard` 与 `emphasized-decelerate`。

- **依赖速度的“弹出”改为显式的先设后动。** 进度步骤与按钮演示里的弹出原来靠弹簧的初速度，现在是 `set(1.08)` 再 `animate(…, 1, motion.default)`；减弱动画时直接返回。

## 理由

- **一个平台、一种写法。** 水波只有 Android 能画，而 Android 的 state layer 已经由 `overlay` 表达（M3 自己的规范也是 state layer，水波是它的装饰）。删掉后“按压的外观”在六套主题里是同一条路径。
- **弹簧无法进 CSS，也无法进 DESIGN.md。** 过渡要按时序表达，弹簧只能换算成近似值；DESIGN.md 与设计工具没有弹簧对应字段，只能写进正文。时序是 DTCG 的标准 `transition` 类型。
- **契约只减不增。** 每个读动效的地方少一个分支，生成器、lint、schema 与文档各少一类取值。
- **体感差别很小。** 欠阻尼弹簧的过冲在 150 ms 档上几乎看不出来；真正依赖弹簧的物理手势（拖动后释放）本来就不走主题动效，仍直接用 NSH 的 `spring`。

## 不采纳的方案

- **只删 ripple，留弹簧。** 弹簧仍让每个动效调用点多一个分支，也仍然进不了 CSS 与 DESIGN.md。
- **留弹簧，只让 material 用时序。** 变成“哪个主题能用哪种”的又一张表，正是 0007 想关掉的口子。
- **把 ripple 留在 material 的 `finishes` 里。** 它不是 finish 的属性，是按压反馈；留着仍需要每个可按的组件认识它。
