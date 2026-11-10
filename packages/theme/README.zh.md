# @shadcn-nsh/theme

[English](./README.md)

styled / copy-into-app 层的品牌外观：颜色、半径、阴影、焦点环和唯一的 disabled 外观。这是**本包在 `nsh` 之上的增量**，不是 NSH 的设计 token，也不是 shadcn 默认脚手架。组件结构规则和动效见 [`@shadcn-nsh/ui` README](../ui)。

由 [`@shadcn-nsh/ui`](../ui) 消费，并以 registry `theme` 分发（`theme.json` + `lib/theme.ts`）。修改后在仓库根执行 `bun run registry:build`，并提交 `public/r`。

## 主题包含什么

| 内容                  | 位置                                                                      | 读取方式                                |
| --------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| 颜色（亮 / 暗）、半径 | `theme.json` 的 `cssVars`（`nsh.json` `theme`）                           | `colors.*`、`radius.control`、`token()` |
| 阴影颜色、遮罩        | `cssVars` 里的 `custom-shadow-ink`、`custom-highlight`、`custom-backdrop` | `finish.*`、`popupBackdrop()`           |
| 阴影形状              | `theme.ts`（`finish`）                                                    | `finish.*`                              |
| 焦点环                | `theme.ts`                                                                | `focusRing()`                           |
| disabled 外观         | `theme.ts`                                                                | `disabledOpacity()`                     |

`theme.json` 是标准的 shadcn `cssVars`，所有颜色都写成 oklch：NSH 会读取它、生成类型，并自动跟随外观。阴影在 NSH 里不是 token（它会把阴影从 `cssVars` 里丢掉），所以形状放在 `theme.ts`，颜色来自上面的 token。

**不在主题里：** 动效和过渡（`nsh` 自己的值，写在各组件里，多个组件共用时放进 `lib` 模块，见 UI README）、尺寸、字体刻度和各 variant 的透明度（组件的 `look()`）。原因：主题不是通用设计系统，这些值是 `nsh` 的或某个组件的内部细节，不是品牌。只有当某个组件用到时才新增 token；只有多个组件需要同一个值时才新增 helper。

**颜色。** 组件只读语义 token；原始 hex / `rgb` / 色板 class 属于评审问题。`alpha(colors.x, a)` 保留语义来源。

**复制进应用。** `theme.json` 安装在项目根目录。应用已有一份时，`init` 和 `add` 会合并进它缺少的键（`custom-shadow-ink`、`custom-highlight`、`custom-backdrop`），并保留它已有的所有值。如果应用用生成的主题整体替换了该文件，必须保留这三个 token，否则 finish 相关 helper 会返回 `undefined`。

## 官方的与我们的

`theme.json` 以 NSH 自己的默认主题为起点，即 shadcn 的 `neutral`（`nsh` 仓库里的 `crates/nsh-base/src/default-theme.json`）。**它的每一个键都在这里，值与官方一致**：`radius` 加每个外观 31 个颜色，全是 oklch。品牌覆盖就是原地改这些值。**我们自己的键只有下面这几个，且都带 `custom-` 前缀**，这样在文件里、`Tokens` 类型里、生成的主题里都能分清哪些是 NSH 的、哪些是我们的。

| 我们的              | 亮色                          | 暗色                 | 用途                                         |
| ------------------- | ----------------------------- | -------------------- | -------------------------------------------- |
| `custom-shadow-ink` | `oklch(0.1686 0.0226 263.69)` | `oklch(0 0 0)`       | 阴影色调；不透明，透明度由 `finish` 设定     |
| `custom-highlight`  | `oklch(1 0 0)`                | `oklch(1 0 0)`       | 内嵌高光色调；不透明，透明度由 `finish` 设定 |
| `custom-backdrop`   | `oklch(0 0 0 / 0.4)`          | `oklch(0 0 0 / 0.4)` | modal 背后的遮罩；透明度是值的一部分         |

`bun run test:unit` 会检查：官方的每个键都在且值一致，其余的键都以 `custom-` 开头，所有颜色都是 oklch，两个阴影色调保持不透明。

## Finish

表面深度，只有 `boxShadow`；填色仍然来自 `colors.*`。finish 按“表面是什么”选择，不按“哪个组件在画”，所以组件只写角色名，不自己写阴影。

| 角色              | 用途                                                             |
| ----------------- | ---------------------------------------------------------------- |
| `control.rest`    | 带边框控件的凸起边缘（secondary Button）                         |
| `control.flat`    | 带边框控件下方的细线（outline、destructive）                     |
| `control.pressed` | 按下的内陷                                                       |
| `control.on`      | 选中或开启的控件                                                 |
| `filled`          | 实心品牌填充上的控件                                             |
| `popup`           | 浮层家族 **一把** 软阴影（menu、popover、select、dialog、sheet） |

hover 没有对应条目：它保持 rest 的阴影，状态样式只改填充。浮层外观共用：`popupSurface()`、`popupBackdrop()`、`overlayShadow()`、`modalSurface()`（dialog / sheet 的卡片：圆角 16、padding 20）。

## 状态

- `focusRing()` —— 边框变为 `ring` 色，并在视图外围有一圈 3 点宽的 outline 光晕。带 `overflow: hidden` 的祖先会裁掉它；要留出空间，或把焦点画在控件内部。
- `disabledOpacity(disabled?)` —— 唯一的 disabled 外观，`0.5`。不传参数时是 `disabledStyle` 的值；传入标志时用于自己设置样式的部件的变暗。优先级由 base 保证：`disabled` 盖过所有其他状态，所以 disabled 控件不需要自己处理 hover 或 press。

## Helpers

```tsx
import { colors, disabledOpacity, finish, focusRing, radius } from "@shadcn-nsh/theme";
import { token } from "nsh";

const pad = radius.control;
const fg = colors.foreground;
const ring = focusRing();
// 或：token("primary")
```

- `token(name)` —— 响应式读取当前主题中的命名 token
- `colors.*` / `radius.control` —— `token()` 之上的薄 getter；`alpha(color, a)` —— 指定透明度的颜色
- `finish.control.*` / `finish.filled` / `finish.popup` —— 表面深度；`popupSurface()` / `modalSurface()` / `popupBackdrop()` / `overlayShadow()` —— 浮层外观
- `focusRing()`、`disabledOpacity()` —— 共用的状态外观

调整品牌就是改 `theme.json`（颜色、半径、阴影颜色）或 `theme.ts` 里的 `finish`（阴影形状）。

## 被否决的方案

- 把 `--shadow-*` 放进 `theme.json` 的 `cssVars`：NSH 把阴影视为非 token 并丢弃。
- 用 MUI `shadows[0..24]` 或 MD3 elevation 等级作为公开 API：按压模型不对，也不适合内嵌的控件 finish。
- 阴影只放在组件文件里（原版 shadcn）：这里没有 CVA / className 分发，需要可复用的主题层。
- 一开始就复制 gallery 约 20 个 finish 键：组件用到时再加。
- 把动效、按压、密度、字体刻度或色调做成 token，或放进 `theme.json` 自造的 `brand` 段：它们不是品牌（见上文），而且这次尝试需要 JSON 导入、CLI 路径改写和合并步骤；生成器覆盖文件时还会丢掉未知的段。
- 以 CSS 为源，再用生成器写出 `theme.json`：NSH 读不了 CSS，需要写解析器（oklch、`color-mix`），还要多一道应用也得运行的构建；改了生成物就会和源漂移。以后可以加“CSS 转 `cssVars`”的导入命令。
- 每个组件的尺寸各做一个 token（`button-height-sm` 之类）：`Tokens` 会无限增长，而应用本来就会直接改复制出来的组件。

## 决策记录

- 2026-11-10 —— 四份 ADR 合并进两份 README；新决策写在这里，每条一行并附原因。
- 2026-11-10 —— 六个控件 finish 改为角色（`control` / `filled` / `popup`）。原因：只有 Button 用，并且逐 variant、逐状态写阴影；角色保留品牌深度，同时把这类配置从组件里拿走。
- 2026-11-10 —— 阴影颜色是 `cssVars` token（`custom-shadow-ink`、`custom-highlight`、`custom-backdrop`），形状留在 `theme.ts`。原因：颜色属于唯一的颜色文件，并免费跟随外观；偏移和模糊是结构。已在 `nsh` 0.4.0 上验证：`color-mix` 颜色可以在 `boxShadow` 里解析。
- 2026-11-10 —— 主题是颜色、半径、阴影、焦点环和唯一的 disabled 外观。动效、尺寸、字体刻度和色调曾在 `theme.json` 里做成 token，一天后撤回。原因：它们是 `nsh` 的值或某个组件的内部细节，而容纳它们需要 `brand` 段、JSON 导入和 CLI 改写。
- 2026-11-10 —— `init` / `add` 对已有的 `theme.json` 合并缺失的键而不是跳过。原因：`add theme` 以前会跳过已存在的文件，复制过去的 helper 就读不到自己的 token。
- 2026-11-10 —— disabled 透明度处处是 0.5（select 与 combobox 的选项原为 0.4）。原因：只有一种禁用外观。
- 2026-11-10 —— hover 只改填充并保持 rest 阴影；`finish.hover` 删除（它与 `raised` 相同）。原因：状态样式会合并到基础样式之上，重复写阴影是噪声。
- 2026-11-10 —— 我们自己的键带 `custom-` 前缀，所有颜色都用 oklch，`theme.json` 保留 NSH 默认主题的每个键及其官方值。原因：这个文件同时混着 NSH 的标准和我们的，JSON 没有注释，前缀加测试是唯一能区分它们的办法；oklch 是官方主题使用的格式。
- 2026-11-11 —— 加入 `modalSurface()`（圆角 16、padding 20、边、`card` 填充、popup 阴影），给 dialog 和 sheet。原因：modal 的圆角和内边距与 `popupSurface`（控件圆角、padding 4）不同；不新增 token，不新增 `overlayMotion`，sheet 的分边几何在组件里盖过圆角和 padding。
