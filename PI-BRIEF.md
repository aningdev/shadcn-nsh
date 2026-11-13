# PI-BRIEF：补齐外壳与共享层缺口（demo-parity 任务 5）

你在 git worktree `/Users/zhuxining/Code/shadcn-nsh.worktrees/demo-gaps`（分支 `port/pi-demo-gaps`）。**你自己完成全部工作，不得再委派给其他 agent / 子代理。**

## 背景

先读：`AGENTS.md`、`docs/ARCHITECTURE.md`（P1–P7）、`docs/port.md`（外壳写法、演示）、`docs/specs/demo-parity.md`、`docs/specs/demo-audit.md`。

任务 4 已把 52 个演示改写为官方场景（`apps/docs/demos/<id>.tsx` / `.ref.tsx`）。四个移植组在做的时候被禁止改共享文件和组件，于是留下了下面这些缺口，导致少数演示与官方不一致或需要绕路。本任务把它们补上，并把演示里的绕路改回正路。

## 缺口清单（逐项处理；每项先核对上游 `references/nsh/examples/nsh-gallery-ui` 与官方 `references/nsh/website/demos/el-*.tsx` 的真实做法，以上游为准）

### A. 组件外壳（`packages/ui/*.tsx` 的手写部分；`// @port` 区域只能经 `port-map.json` 的 `replace` + `why` 偏离，再 `port:vendor`）

1. `combobox.tsx` 与 `select.tsx` 转出的 listbox 名字不一致（`ListboxHeader` / `listboxFooter` / `clearButtonLook` 等）：统一。
2. Select / Combobox 的 `cleanable` 清除按钮没有套 `clearButtonLook()`（Picker 还会因此藏起 chevron）：外壳默认套上，与官方一致。
3. `number-input.tsx`：步进器宽度写死 `w-8`/`w-11`，上游 `steps="pair"` 是 `w-6`/`w-9`（比官方宽 2pt）：按上游。
4. `toggle.tsx`：只按"字符串 children"推断文字内边距；官方星标 toggle（图标 + 文字）取不到：加显式 `text?: boolean`（或上游等价口径）。
5. `radio-group.tsx`：总画 `RadioRing`，无法表达官方"radio 当 segment"的周期选择：照上游看是否有对应写法，提供入口（如 `indicator={false}`）。
6. `time-field.tsx`：没有 segment / separator 样式钩子，与 date-picker 的时间行不同源：照上游补齐。
7. `plot.tsx`：只再导出 Arc/Area/Bar/Grid/Line/Pie/Plot/PlotAxis；官方七例还用 Cell、Dot、Rule、Treemap（及 PlotLabel、Sankey、RadialLine 等）：补齐再导出，plot 演示改为全部从 `@/packages/ui/plot` 取。
8. `table.tsx`：`TableCell` 带 `flex-1`、`TableHead` 不带，表头与表体列错位：修外壳，演示去掉补丁 class。
9. `tooltip.tsx`：宿主 View 固定 `alignSelf: "flex-start"`，全宽 / 居中的 trigger 做不到：加 style / align 入口。
10. `dialog.tsx`：`presentation="pageSheet"` 没有面板外观；查上游是否有对应 sheet 外观，有就接上，没有就在总结里说明并保留演示的应用样式。
11. `data-table.tsx`：触屏行高 44，而官方在 phone idiom 下约 32（一屏 9 行 vs 6 行）：核对上游 `size.rowSm` 的口径，按上游。
12. `input` 演示的 Sign in 按钮被拉满宽，官方是内容宽：查是外壳还是演示，按官方。

### B. 演示共享层（`apps/docs/demos/stage.tsx`、`kit.tsx`、`render-cases.ts`、`scripts/port/*`）

13. **照片**：上游 `examples/nsh-gallery-ui/photos.ts` 在 `port-map.json` 里是 `exclude`。改为路由到 `apps/docs/demos/photos.ts`（演示内容，不进 registry），avatar、color-picker、carousel 演示改用官方照片（`photoUrl`），与官方一致。`port:render` 必须等图片解码完成再截图（给 render-cases 加每个 id 的等待 / settle 条件，或在截图前统一等所有 `<img>` / Image 加载），demo 与 ref 稳定逐像素相同；连续跑 3 次 `port:render` 都绿才算过。
14. `stage.tsx` 的 `Segmented` 放不下长选项（7 值 tone）：照上游看有无换行版本；没有就加可换行的选项控件（适配层内，颜色取主题），badge / status 演示去掉各自手搭的 Toggle chip。
15. `kit.tsx` 的 `DemoPage` 没有列宽上限：加 `width`（或等价）参数，text-view 演示去掉自己包的那层。
16. `stage.tsx` 的 `ui()` 未导出且角色不全（官方场景读 inset / raised / up / down / card / faint）：照上游 palette 导出补全（取本库主题角色，不写颜色字面量），演示里直读 theme 的地方改回 `ui()`。
17. `stage.tsx` 的 `Log`：`grow` 默认 `sideBySide()`，页面级日志（toast）不合适：给显式默认或注释，与官方一致。
18. `port:render` 会 `rm -rf apps/docs/demos/shots`（连带删掉 `shots/audit`），`port:baseline --update` 全量替换：审计截图改放 `apps/docs/demos/shots-audit/`（同样 gitignore）或让 render 只清自己的文件；`port:render` / `port:baseline` 支持 `--only <id,...>`。
19. menu（pointer, light）偶发 1px 抖动：在 steps 之后多等一帧（或统一 settle），连续 3 次 render 不抖。

### C. 收尾

20. `docs/specs/demo-parity.md` 的验收标准逐条核对，在文件末尾加一节"完成情况"（每条：通过 / 证据）。`docs/specs/demo-audit.md` §3.2 "无组件改动"的结论加注：任务 4 移植时发现的外壳缺口及本任务的处理。
21. 相关文档（`docs/port.md`、`docs/ARCHITECTURE.md`、`GLOSSARY.md`）随改动更新。

## 验收标准

1. 上面 1–19 每项：已修（commit）或给出"上游即如此 / 平台限制"的证据（文件:行），总结里逐项列出。
2. 受影响的演示（至少 avatar、carousel、color-picker、plot、table、data-table、tooltip、number-input、toggle、radio-group、select、combobox、time-field、badge、status、text-view、toast、input）在 390 / 1024 下与官方截图对照一致；截图路径写进总结。
3. 外壳改动后 `bun run registry:build`，`public/r` 同步；`test:install` 通过（复制进应用后仍类型正确）。
4. `bun run port:check`、`bun run catalog --check`、`nsh check apps/docs/demos`、`bun run port:render`（连续 3 次全绿）、`bun run test:unit`、`bun run test:install`、`bun run build:docs`、`vp check` 全部通过；基线变动逐张人眼看过并说明。
5. 外壳与适配层无颜色字面量；`// @port` 区域只由 `port:vendor` 写入；偏离上游都在 `port-map.json` 的 `replace` 里写了 `why`。
6. 一个缺口（或紧密相关的一组）一个 commit，conventional commit 格式。

## 边界

- 不改 `nsh` / `nsh/base` / `references/**`；不编译 NSH；不搬上游声音；不 push、不开 PR。
- 可用技能：codebase-lang、codebase-verify、codebase-debug、codebase-design。

完成后在终端最后输出总结：commit 列表、1–19 逐项处理结果、验收 1–6 的证据。
