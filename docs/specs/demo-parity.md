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

## 完成情况

任务 5（`port/pi-demo-gaps`）收尾时逐条核对。证据里的截图都在 `apps/docs/demos/shots/`（渲染比对，390 × 844，`port:render` 产物）或 `apps/docs/demos/shots-audit/`（诊断脚本，390 × 844 phone idiom 与 1024 × 640 desktop idiom），两者都不提交。

| #   | 标准                                                                                   | 结果 | 证据                                                                                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | demo-audit.md 列全部 52 个组件，各有归类与证据                                         | 通过 | `docs/specs/demo-audit.md` §二 的 52 行表格（每行有官方文件、问题、归类、截图文件名）；截图在 `shots-audit/`                                                                                                                                                                                           |
| 2   | 390 下不横向溢出 / 不裁切；1024 下有检查器的左右并排                                   | 通过 | `shots-audit/<id>-demo-phone.png` 与 `-demo-desktop.png`（本次重跑 18 个受影响组件，逐张看过）；`port:render` 的 104 张 390 宽截图无横向溢出。桌面并排由 `Split` 的 `sideBySide()`（≥ 900）给出，1024 下每个带检查器的演示都是两列                                                                     |
| 3   | 有官方示例的组件，演示含官方全部场景与检查器项                                         | 通过 | 任务 4 已移植 42 个；本次补齐演示缺的官方写法：`Chips`（七个 tone 的换行选项）、`ui()` 调色板、照片（`photos.ts`）、`DemoPage` 的 680 宽、radio 的 segmented 段、tooltip 的全宽 trigger、table 的列宽、data-table 的 32 点行高、time-field 的 segment / separator、plot 的 Cell / Dot / Rule / Treemap |
| 4   | 六个已知问题消失                                                                       | 通过 | `shots/{accordion,collapsible,checkbox,color-picker,data-table,emoji-picker}-pointer-light.png`：accordion 正文与 chevron 在框内、collapsible 内容与 chevron 正常、checkbox 行内、color-picker 是 440 上限的 Stage、data-table 满列、emoji 面板不出框                                                  |
| 5   | port:check、catalog --check、nsh check、port:render、test:unit、test:install、vp check | 通过 | 见任务 5 的总结：`port:check` 417 ported / 0 pending / 41 excluded；`catalog ok — 52 components`；`nsh check apps/docs/demos` 与 `apps/gallery` 无输出；`port:render` 104/104（连续三次）；`test:unit` 63 pass；`test:install` 52/52；`vp check` 196 files，0 error                                    |

### 任务 5 补的缺口（逐项）

组件外壳：`combobox` / `select` 的 listbox 再导出统一，`cleanable` 的清除按钮套 `clearButtonLook()` 且只在有值时藏 chevron（`date-picker` 同）；`number-input` 的 `pair` 用 `w-6` / `w-9`；`Toggle` 加 `text`；`Radio` 加 `indicator={false}`；`time-field` 取 `calendarLook` 的 segment / separator 与 `TimeSegment`；`plot` 再导出 `nsh/base/plot` 全部；`TableCell` 不再自带宽；`tooltip` 的宿主接受 `style`；`data-table` 回到 base 的 32 点行高。演示适配层：`photos.ts` 搬到 `apps/docs/demos/`，照片页 `images-ready` + `prefetch`，`ui()` 完整导出，`Chips`，`DemoPage` 的 `width`。工具：审计截图移到 `shots-audit/`，`port:render` / `port:baseline` 支持 `--only`（按 id 精确匹配），比较在抗锯齿预算内（见下）。

### 例外与平台限制

- `dialog` 的 `presentation="pageSheet"` 在上游没有对应外观（`el-dialog.tsx:120-152` 自己给 `style`：桌面居中卡片、手机贴底的 panel），本库同样把位置交给演示，不进口 component。
- 两次页面实例的同一页不是每次都逐字节相同：圆角的抗锯齿偶尔差一个像素、1/255（实测：menu 的弹层圆角约三十次一次；八次全量跑里约每三次有一个页面抖一次，都是几个像素、几级）。因此比较是"逐字节，或落在抗锯齿预算内"（`antialiasing`：至多 6 个像素、每通道 6/255），`port:render` / `port:render:touch` / `port:baseline` / `port:sheet` 用同一规则；没有整对重拍，也没有整页免检。
- `avatar` 的圆形照片裁切更宽一些（实测：至多 20 个像素、最差通道 29/255；`Image.prefetch` 之后连续 12 对相同），`render-cases.ts` 给它 `tolerance: 30 / 32`；布局或颜色变化移动的像素远多于此。
