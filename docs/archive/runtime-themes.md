# 多主题与运行时切换（#20b）

> **已完成，留作记录（最后编辑 2026-11-18）：`AppTheme`、`selectTheme` 与 `themes/<name>/` 随 `0.5.0` 发布。**
> 现行说明见 [`packages/theme/README.md`](../../packages/theme/README.md) 与
> [themes](https://shadcn-nsh.aning.dev/docs/themes)。

## 目标

issue #20 的第 2 条：一个应用同时带两套以上主题，运行时切换后所有已渲染组件跟着变，无需重启；配色方案（亮 / 暗 / 系统）与主题互相独立。应用（如 MyAid 的「通用 → 颜色」）能列出可选主题并让用户切换；持久化由应用负责。

同时去掉 `theme-shadcn.md` 限制清单里影响 neutral 观感的几条（第 2、5、6、9 条），让 shadcn 主题在本库组件上更像 shadcn。

## 依据（2026-11-15 读代码与 NSH 文档）

| 部分                      | 现状                                        | 运行时切换                                                                                                                                             |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 颜色、圆角、焦点环、悬停  | `theme.ts` 经 `token()` 读                  | 可以：`nsh` 的 `setTheme(theme)` 换掉整套 token，读 token 的组件随下一帧重绘，亮暗两套都跟着走                                                         |
| finish（`finishes.json`） | `theme.ts` 模块 import，`themed()` 按亮暗取 | 不行：import 是构建输入；NSH 的 token 不收阴影（文档："Values of no kind a token has, such as shadows, are left out"），所以也不能把 finish 改成 token |
| 亮 / 暗                   | `colorScheme()`                             | 与主题无关，不用动                                                                                                                                     |

## 决定

| 项            | 决定                                                                                                                                                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 一套主题      | `AppTheme = { id, label, theme, finishes }`：`theme` 是 `theme.json` 的内容（`setTheme` 的格式），`finishes` 是 `finishes.json` 的内容                                                                                                                                                         |
| finish 可切换 | `theme.ts` 里 finish 经一个信号读：`themed()` 的 getter 读「当前主题的 finishes」再按亮暗取；初值是构建时 import 的那份。读 finish 的组件因此随切换重绘（规则：look 在 JSX 里读）                                                                                                              |
| 切换入口      | `theme.ts` 导出 `selectTheme(t: AppTheme \| null)`：先 `setTheme(t.theme)`（抛错则什么都不变），再换 finish 的信号；`null` 回到构建时的主题。导出 `currentTheme()`（响应式，返回当前 `id`；还在构建时主题上时为 `null`，因为运行时读不到 `nsh-ui.json`）                                       |
| 安装形态      | 每个主题条目除了现有三个文件，还装 `themes/<id>/index.ts`（`theme.json`、`finishes.json` 同目录），导出这一套 `AppTheme`。应用自己写清单：`const themes = [citrus, neutral]`。CLI 不生成也不改写应用的清单文件                                                                                 |
| 构建时主题    | 仍是 `nsh.json` 指的 `theme.json` 与 `lib/finishes.json`，由 `init --theme` 定；`add theme-<x>` 改为**多装一套**（写 `themes/<x>/`），不再替换构建时主题。要换构建时主题用 `init --theme <x> --overwrite`（沿用现有语义）                                                                      |
| 持久化        | 应用负责（存 `id`，启动时 `selectTheme(themes.find(…))`）；文档给一段示例                                                                                                                                                                                                                      |
| 限制清单      | 一起做第 2 条（按下缩进 finish：`finishes` 加 `press.scale`，默认主题 0.97 等现值、shadcn 主题 1）、第 5/6 条（`fill` 回落 `backgroundColor`、轨道描边拼接前判空）、第 9 条（写死的圆角改用 `radius.*`，弹层不够用时加 `radius-popover` token，两套主题都写）。第 7/8 条（固定透明度）另开一批 |
| 基线          | 默认主题保持字节基线；shadcn 主题加一组「能渲染、与 ref 一致」的检查，不进字节基线；gallery 测试证明切换                                                                                                                                                                                       |

## 不做

- 改 `nsh` / `nsh/base`、`references`。
- 文档站在线切换与调色（路线图阶段 2 的另一半，另起）。
- 限制清单第 7、8、10–14 条。
- 应用的持久化存储。

## 验收标准

1. `selectTheme(neutral)` 后，已渲染的组件（含按钮的 finish、阴影、圆角、焦点环）在下一帧换成 neutral；`selectTheme(null)` 回到构建时主题；亮 / 暗切换在两套主题下都照常。gallery 测试覆盖：切换前后读同一组件的背景、阴影、圆角与按下缩放。
2. `setTheme` 拒绝的主题（坏颜色）`selectTheme` 抛错且 finish 不变。
3. 一个新 NSH 应用里 `shadcn-nsh init` 再 `add theme-shadcn`：构建时主题不变，多出 `themes/shadcn/`；应用写两项清单、调用 `selectTheme`，`nsh check` 通过。`test:install` 覆盖。
4. shadcn 主题下按下不缩放；默认主题按下缩放与现在一致（默认主题字节基线不变，除非第 9 条圆角本来就是同值）。
5. `port:check`、`catalog --check`、`nsh check` 两处、`vp check`、`test:unit`、`test:gallery`、`test:install`、`port:render`、`port:render:touch` 通过。
6. 文档：`packages/theme/README*.md` 写清列出可选主题、切换、持久化；CLI README 写 `add theme-<x>` 的新语义；CHANGELOG 未发布段写迁移（`add theme-shadcn` 不再替换构建时主题）；`theme-shadcn.md` 限制清单标注已解决的条目；`ARCHITECTURE.md` 的主题部分更新。
