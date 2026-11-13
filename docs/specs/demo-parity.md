# 演示与官方示例对齐

## 目标

文档站每个组件的演示，在 Phone 与 Desktop 两种画布下都和 NSH 网站上对应的官方示例（`references/nsh/website/demos/el-<id>.tsx`）一样完整、一样自适应：同样的场景、同样的检查器（选项、当前值、事件日志），窄窗口上下堆叠，宽窗口左右并排。

## 现状的问题（2026-11-13 截图）

| 组件         | 现象                                                                |
| ------------ | ------------------------------------------------------------------- |
| accordion    | Phone 画布里行宽超出框、正文被截断，chevron 不见                    |
| collapsible  | "Default" 打开却不显示内容，"Closed" 却显示内容；chevron 贴在文字后 |
| checkbox     | 描述行带红色虚线框；尺寸一节的标签落在方框下方                      |
| color-picker | 只占左半边，色板行被拉开                                            |
| data-table   | 空白                                                                |
| emoji-picker | 只有两个 emoji；弹层越出卡片                                        |

## 两条排查线

- **画布 / 套件**：文档站的预览 iframe（`apps/docs/src/lib/demo*.{js,ts}`、`scripts/build-demos.ts`）在 Phone / Desktop 下给演示的窗口尺寸与 `platform.desktop` 是否和网站播放器一致；`apps/docs/demos/kit.tsx` 的 `DemoSection`（`flexDirection: row` + `alignItems: center`）是否让整宽控件缩成内容宽。
- **组件**：同一场景下 `<id>.ref.tsx`（look 展开在 `nsh/base` 上）若也错，是 look / 外壳的问题；ref 对、`<id>.tsx` 错，是外壳的问题；两者都对、官方示例不同，是演示写法的问题。

## 决定

- 官方示例的演示适配层（上游 `demo.ts` 的 `Stage`、`Inspector`、`Split`、`Panel`、`Log`、`Segmented`、`desktop`、`wide`）**进入 `apps/docs/demos`**，只供演示用，不进 registry、不进 `packages/ui`。这修改了 AGENTS.md "不搬 NSH 网站的 demo 适配" 一条：仍不进组件库，但演示可以用。
- `<id>.ref.tsx` 写官方示例的场景（look 在 `nsh/base` 上），`<id>.tsx` 写同一场景、换成本库组件；`port:render` 两者逐像素相同。

## 任务（按顺序，每项一个 pi worktree）

1. **诊断**：每个组件在两种画布下截图，与 ref、官方示例对照，归类到"画布 / 套件 / 外壳 / look / 演示写法"，写 `docs/specs/demo-audit.md`。不改代码。
2. **画布与套件**：修预览 iframe 的尺寸与平台；把演示适配层搬进 `apps/docs/demos`；改 AGENTS.md 那一条。
3. **组件修复**：按诊断表修外壳与 look 偏离（偏离上游时走 `port-map.json` 的 `replace` 并写 `why`）。
4. **官方示例移植**：每个有 `el-<id>.tsx` 的组件，`<id>.tsx` / `<id>.ref.tsx` 改写成官方场景；没有官方示例的组件用同一套适配层补齐检查器。按家族分批提交。

## 验收标准

1. `docs/specs/demo-audit.md` 列出全部 52 个组件，每个都有归类与证据（截图路径）。
2. 文档站 Phone 画布（390 宽）里，没有一个演示横向溢出或被截断；Desktop 画布（1024 宽）里，有检查器的演示左右并排。
3. 每个在 `references/nsh/website/demos` 有对应 `el-*` 的组件（含 `dock`→`dock-area`、`radio`→`radio-group`、`rich-editor`→`editor`、`plot-*`→`plot` 这类对应），演示包含官方示例的全部场景与检查器项。
4. 截图里列出的六个问题全部消失。
5. `port:check`、`catalog --check`、`nsh check apps/docs/demos`、`port:render`、`test:unit`、`test:install`、`vp check` 全部通过。

## 不做

- 改 `nsh` / `nsh/base` / `references`；手改 `// @port` 区域；把演示适配层放进 registry。
