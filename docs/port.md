# 移植一个组件

新增或修改组件、演示、文档页时照这里做。分层与规则（P1–P7、归属）见 [`ARCHITECTURE.md`](ARCHITECTURE.md)，词汇见 [`GLOSSARY.md`](GLOSSARY.md)，CLI 与基线见 [`toolchain.md`](toolchain.md)。

## 流程

```sh
bun run port:new <id> --from <上游文件> [--symbols a,b,c] [--base <nsh/base 符号>] [--family]
# 例：bun run port:new toggle --from look/tool.ts --symbols toggleLook,toggleLabel,toggleGlyph,toggleSizes --base Toggle
# 例：bun run port:new popover --from look/overlay.ts --symbols popoverLook,PopoverLookOptions --base Popover --family
```

脚手架依次：在 `port-map.json` 加路由（已有路由时报错）→ 建 `packages/ui/<id>.tsx`（文件头、空区域、外壳骨架；`--family` 生成 Root / Trigger / Content / Close 与 `use<Id>()`）→ `port:vendor` 填区域并列出缺的 import → 建 `demos/<id>.tsx` 与 `<id>.ref.tsx` → 建文档页骨架 → 加 registry 条目 → 在 `packages/ui/index.ts` 导出它 → 重新生成 `demos/catalog.generated.ts`。

组件 id 不手写：脚本从 `registry.json` 经 `scripts/catalog.ts` 取集合，NSH 运行时从 `demos/catalog.generated.ts` 取。`render-cases.ts` 只写这个组件需要时的 `steps` / `selfReference` 覆盖；`App.tsx` 不再列 id。

然后：

1. 填完所有 `TODO(port)`（`port:check` 在移植目录里见到它就报错）
2. 核对 registry 条目
3. 跑[检查](#检查)；指针与触屏各亮 / 暗两张截图（`port:sheet` 拼成一页）人眼看过：无裁切、错位、看不清的文字
4. 改了截图就 `bun run port:baseline --update`，与改动一起提交
5. `bun run registry:build`

一个家族一个 commit。

## 外壳写法

样板：单部件 `packages/ui/button.tsx`、`switch.tsx`；复合 `packages/ui/dialog.tsx`。

- 不解构 props：`split(props, [...])` 取走外壳处理的键，其余 `{...rest}` 透传
- look 的选项传读取函数（`size: () => props.size`），外观随 props 变化
- 样式类 props 写成数组，使用者在后：`style={[look.style, props.style ?? null]}`；`hoverStyle`、`activeStyle`、`focusVisibleStyle`、`disabledStyle` 同理
- 字符串 children 渲染成带 look 字体的 `Text`，其他原样渲染
- 轴的 prop 名用 shadcn 的（`variant`、`size`），取值与默认值用上游组件的
- 复合控件（**Composition Facade**）：Root 只持有开关状态（`createOpenState`）与生命周期回调；Content 持有 `nsh/base` 根并透传它的全部 props；Trigger / Close 对字符串 child 渲染 `Button`
- 文件头三行写明来源与许可；每个导出的类型、prop 和组件都有 doc comment

## 演示

演示是官方的场景（`references/nsh/website/demos/el-<id>.tsx`），不是变体矩阵：主体放进 `Split`，它的 `inspector` 里放状态（`Panel`：当前值、开关）和事件（`Log`：`onChange` 收到什么）。组件声明的每个轴取值（`variant`、`size`、`kind`、`tone`）与共享 `Tone` 仍要出现（`port:coverage` 判定）；场景里放不下时，用检查器的 `Segmented` 或第二个 `DemoCard` 列出。参照页与演示是同一页面，只把组件换成 look 展开在 `nsh/base` 上。

| 用什么                     | 是什么                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Split`                    | 主体与检查器：窗口 ≥ 900 并排，否则上下堆叠；宽度变化只改样式，状态不丢                                                                                                              |
| `Stage`                    | 居中一块的宽窗口外框（上限 440），官方示例的“主体居中”                                                                                                                               |
| `Inspector`                | 检查器一列（300 宽，并排时）                                                                                                                                                         |
| `Panel`                    | 检查器里的一组状态：小标题 + `insetSurface` 的框                                                                                                                                     |
| `Log`                      | 事件日志，最新在上（`minHeight`、`grow`）                                                                                                                                            |
| `Segmented`                | 检查器里的选项（`multiple`、展示方式、视图种类），选项数组 + 当前值 + `onChange`                                                                                                     |
| `Chips`                    | 同上，但**换行**：选项多到一条轨道放不下时（七个 tone），一个选项一个小块                                                                                                            |
| `desktop` / `wide`         | 指针与键盘（文案用 “Click”，密度用桌面）；窗口够宽（≥ 700）时才能用桌面布局                                                                                                          |
| `ui()`                     | 演示自己的调色板（`page`、`text`、`muted`、`faint`、`border`、`line`、`accent`、`up` / `down` / `info` / `warn` / `danger`、`card`、`inset`、`raised`、`primary`），取自本库主题角色 |
| `DemoSection`（`kit.tsx`） | 小控件（按钮、徽标、开关）的换行行（默认 `inline`）；整宽控件（accordion、table、slider）用 `axis="block"`                                                                           |
| `DemoPage`（`kit.tsx`）    | 页面外框；`width` 把整页在一个列宽里居中（text-view 的 680）                                                                                                                         |

`Log` 的 `grow` 默认 `sideBySide()`：并排时它吃掉检查器剩下的高度；页面级的一条日志（toast）在窄窗口不伸、在宽窗口跟着长，与官方的 `Log` 一致。

**照片页**：演示里的图来自上游的 `photos.ts`（搬到 `apps/docs/demos/photos.ts`，**演示内容，不进 registry**）与 `avatarPortrait`。页面先 `Image.prefetch` 再交给 `Image`，全部到位后画 `testID="images-ready"` 的标记；`render-cases.ts` 的 `photos: true` 让 `port:render` 用活网络打开它、等这个标记与淡入结束。圆角裁切的边缘在两次运行间会差 1/255 的页面（目前只有 avatar 的圆形头像）在 `render-cases.ts` 记 `byEye` 并写明原因与实测数字。

它们都在 `apps/docs/demos/stage.tsx`，从上游 `demo.ts` 搬来（`port-map.json` 的 `symbols` 路由，`// @port` 区域由 `port:vendor` 写入），外观取 `@shadcn-nsh/theme` 与 `packages/ui/lib/surface`，**不进 `packages/ui`、不进 registry**。适配层新增、重命名时：改 `port-map.json` 的 `symbols` 与目标文件的 `// @port demo.ts` 区域，再 `bun run port:vendor`。

演示页自己的外壳（标题、卡片、小节）仍用 `kit.tsx` 的 `DemoPage` / `DemoCard` / `DemoSection`。页面内容高于窗口时滚动（手机 844、桌面 900）。

页面看到的窗口与官方一致：Phone 是 390 × 844 的 phone idiom（`platform.desktop` 为假），Desktop 是 1024 宽的 desktop idiom（列宽不够时取列宽，不缩放）；切换布局重载 frame（idiom 启动时定下），主题变化发给运行中的应用（详见 `apps/docs/scripts/player-options.ts`）。

## 文档页

照 shadcn 的篇幅，章节固定为 Installation、Usage、Examples、API。Usage 只放 import 和一行最简用法；Examples 一个轴一小节；API 只列外壳自己加的 props，其余一句话指向 `nsh/base`。

## 检查

| 命令                        | 判定                                                                                                                                                                                                                                                                                                                                                                              | 何时跑                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `bun run port:check`        | P1–P3：清单完整、区域与上游一致（格式化后比较）、安装的 CLI 与基线不同时警告；`--status` 列出待办                                                                                                                                                                                                                                                                                 | 每次                          |
| `nsh check apps/docs/demos` | 组件与演示的类型；`props.test-d.ts` 断言外壳 props 是 base props 的超集（P5）                                                                                                                                                                                                                                                                                                     | 每次                          |
| `bun run port:coverage`     | 演示覆盖组件声明的每个轴取值与共享 `Tone`；`selfReference` 只在没有外壳的组件上                                                                                                                                                                                                                                                                                                   | 每次                          |
| `bun run catalog --check`   | 组件集合：每个 `registry:ui` 都有演示、参照页、文档页并从 `packages/ui/index.ts` 导出；没有未登记的演示或页；`render-cases.ts` 的覆盖都指向目录里的 id；`catalog.generated.ts` 最新                                                                                                                                                                                               | 每次                          |
| `bun run port:render`       | P4 的指针一半：web，亮 / 暗；每对逐字节比较；跑完与 `apps/docs/demos/baseline/` 逐字节比较（仅 macOS；CI 加 `--no-baseline`）；`--only <id,...>` 按 id 精确只跑这几个。**唯一的例外**：`render-cases.ts` 里写了 `tolerance` 的页（目前只有 `avatar`，圆形照片的边缘）由 `render.ts` 按"至多 30 个像素、每个通道至多 32/255"比较，布局变化仍必失败，数字与实测写在该 case 的注释里 | 提交前、CI                    |
| `bun run port:render:touch` | P4 的触屏一半：iOS 模拟器，亮 / 暗（同样由 `render-touch.ts` 按字节或抗锯齿预算比较）；之后跑外观切换检查                                                                                                                                                                                                                                                                         | 提交前（本地）                |
| `bun run registry:build`    | P6：依赖等于 import，相对 import 都有条目分发                                                                                                                                                                                                                                                                                                                                     | 改组件后                      |
| `bun run test:unit`         | CLI 与主题；`ui-guards.test.ts` 扫 Port Region 之外的颜色字面量（P7）                                                                                                                                                                                                                                                                                                             | 每次                          |
| `bun run test:gallery`      | 原生行为：按键、取值、禁用                                                                                                                                                                                                                                                                                                                                                        | 改行为后                      |
| `vp check`                  | 格式、lint、工具面类型                                                                                                                                                                                                                                                                                                                                                            | 每次                          |
| `bun run check`             | `vp check --fix` → `catalog --check` → `port:check` → `port:coverage` → demos 与 gallery 类型 → 文档页 → docs（会改文件）                                                                                                                                                                                                                                                         | 每次                          |
| `bun run test:install`      | 复制即用：`public/r` 与重新构建的结果逐字节相同；`init` + `add` 进新的 NSH app，逐个 `registry:ui` 条目 `nsh check`，全量一次再 `nsh test`                                                                                                                                                                                                                                        | 改 CLI、registry 或组件依赖后 |

两种渲染比对的实现细节（CPU 光栅化、定身等待、基线）见 [`toolchain.md`](toolchain.md#渲染比对的两半)。

`port:baseline --update [--only <id,...>]` 只重录这几个 id 的图（其余不动）；不带 `--only` 时全量替换。审计脚本的截图在 `apps/docs/demos/shots-audit/`，`port:render` 清自己的 `shots/` 时不动它。

`port:check` 比较的是格式化后的文本，只要 `vp fmt` 的行为不变就稳定；它不看区域之外，那由 P7 负责。

## 待定

- **上游按"行"设计的缺口**：单独一个开关没有焦点环和禁用外观（上游由 `listRow` 提供）。现状是与上游一致、不补。
