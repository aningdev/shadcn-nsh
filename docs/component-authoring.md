# 组件编写

动手前读 [`ARCHITECTURE.md`](ARCHITECTURE.md)（目录、分层、规则、词汇）和 [`theme.md`](theme.md)。本文写脚手架、文件怎么排、外壳与演示怎么写、文档页的章节，以及提交前要跑的检查。

## 新增组件

```sh
bun run new:component <id> --base <Symbol> [--family]
bun run new:component <id> --view [--family]
```

`--base <Symbol>` 是该控件在 `nsh/base` 上的符号（`Button`、`Popover`）。`--view` 只排版上色，画在 `nsh` 的 `View` / `Text` 上，不配 `--base`。`--family` 生成 Root / Trigger / Content 这一组零件；`--view --family` 生成 Root / Title / Description。

脚手架写入 `packages/ui/<id>.tsx`、`apps/website/demos/<id>.tsx`、`apps/website/content/docs/components/<id>.md`，在 `registry.json` 加条目，在 `packages/ui/index.ts` 加导出，然后格式化这些文件。组件 id 用 kebab-case。已有同名条目或文件时脚本退出，不覆盖。

然后补外观、演示和文档，再跑文末的检查。`bun run catalog` 会重写 `catalog.generated.ts`；`catalog --check` 会在它过期时失败。

## 文件从上到下

一个组件一个文件。第一屏是对外的部件，往下才是不导出的 look。

1. **用途**。顶部一两行：这文件画出什么。起源于 NSH gallery 的，下一行是 Credit Line：`Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.` 本库自己的组件没有这一行。不写搬运史。
2. **Imports**，按组、组内排序：`../theme`（`lib/` 里是 `../../theme`）、`nsh` / `nsh/base`、`./lib/*`、同级组件。基础图标从 `./lib/icons` 来。
3. **Public Types**。`Variant` / `Size` / `Props`。基于 `nsh/base` 的用 `Omit<BaseProps, …>` 接上事件与无障碍，再加自己的轴。每个导出的类型、prop、函数上方有 `/** … */`。
4. **Public Component(s)**。`split(props, […])` 分开自有 props 与 `{...rest}`。根节点透传 `class`、`classList`、`style`。自带 `class` 写成 `joinClass(own, props.class)`，调用方的 class 在后。
5. **Private Helpers & Looks**。不导出的 `*Look` / `*Sizes` / 几何放下半区。终端形态集中在文件底部的 `// Terminal` 区块。

## 三条原则

**默认私有 Look。** `*Look`、`*Sizes` 和内部几何函数不导出。跨组件复用的样式函数放进 `packages/ui/lib/`，或留在白名单里。组件文件不重新导出 `lib/` 的声明。

**文件拆分。** 基础组件目标单文件 250–350 行。独立控制族拆成自己的文件。跨至少两个组件复用的原语归入 `packages/ui/lib/`。`lib/` 不 import 任何 `packages/ui/<component>`。

**TUI 尺寸下沉主题。** 行高和内边距从 `../theme` 读：`controlHeight`、`metrics.height`、`metrics.control`。终端里高度三档都是 `TERMINAL_ROW`（16），`metrics.control` 的 `padding` 与 `gap` 都是 `TERMINAL_COLUMN`（8）。组件主干不写满屏 `terminal ? TERMINAL_ROW : …`。例外：`controlSize`（`lib/surface.tsx`）在终端里 padding 仍是 `0`、gap 仍是一列、行高仍是一行。`control(name)` 是配方（`control("field")`），不是 `metrics.control`。

## 外壳写法

样板：单部件 `packages/ui/button.tsx`，复合 `packages/ui/dialog.tsx`。

- 不解构 props。`split(props, […])` 取走外壳处理的键，其余 `{...rest}` 透传。look 的选项传读取函数（`size: () => props.size`）。
- 样式类 props 写成数组，调用方在后：`style={[look.style, props.style ?? null]}`。`hoverStyle`、`activeStyle`、`focusVisibleStyle`、`disabledStyle` 同理。
- 状态的静态外观进对应的 state 样式，不在 `style` 里按 `disabled`、`open`、`selected` 再算一遍。用平台 class 表达状态时，该行写 `// state:`。
- 字符串 children 渲染成带 look 字体的 `Text`，其余原样。函数 child（`<View>{() => …}</View>`）是一次响应式插入，只重跑它读到的值。需要自己的状态或 cleanup 的部分写成组件。读 `props.children` 的函数 child 只有门户的内容构建函数，并带 `children-lint: <原因>`。
- **主题在绘制时读。** 模块顶层不读主题。look 的成员写成 getter，或直接在 JSX / `style` 里读。组件体里的 `const h = controlHeight.md` 只读一次，换主题后留在旧值。
- **几何走刻度。** 行高 `controlHeight.*`，图标 `iconSize.*`，边宽 `stroke.*`，圆角 `rounded()`，字号与字重走字体角色。控件外观从主题槽经 `lib` 解开（`fieldLook()`、`choiceLook()`、`switchLook()` 等）。不按主题名分支。刻度上没有的数字就地注释来源。
- **时长走 `motion.*`。** 状态过渡用 `motion.state`，浮层用 `motion.enter`。循环动画留常量并注释原因。
- 每个导出部件透传它所画节点的 props。不画自己视图的根在 doc comment 里说明 props 去了哪。`class` 用 `joinClass`，不写 `props.class ? …` 或 `props.class ?? …`。
- 等宽字体读 `font.mono`（或 class `font-mono`），界面字体读 `font.sans`。不写 `fontFamily: "…"`；例外标 `// font: <原因>`。
- 定时器、订阅、快捷键在 `cleanup` 里释放（样板 `lib/state.ts` 的 `useCopied`）。同一段形状出现在两个组件里，就搬进 `lib/`，不复制第二份。
- 轴的 prop 名用 `variant`、`size`、`tone`。复合控件的 Root 只持有 `createOpenState()` 与生命周期回调；Content 持有 `nsh/base` 根并透传它的全部 props；Trigger / Close 对字符串 child 渲染 `Button`。
- 一个状态的外观实在进不了 state 样式（边画在触发器上、状态在列表里）时，在那一行注释为什么。元素已经 `disabled` 时，不必再用 JS 关掉 `hoverStyle` / `activeStyle`。
- `classList` 的值与 NSH 的 View 相同：`boolean | null | undefined`，`null` 关掉该类。

**Provider 的 children 在 Provider 里求值。** 子元素要看见 Provider 的值，所以只在它内部求值：就地执行的 `(() => …)()` 既在孩子们建出来的位置读，又只读一次。`props.children` 每读一次都会把子元素重新建一遍。字符串 child 就地交给 `AsText`（`lib/utils.tsx`）。

## 响应式

和规则同一套检查，写的时候守这几条：

- 颜色与 `surface()` / `control()` 在 JSX 或 getter 里读，不在模块顶层或组件体里存一次。
- 不写 `theme.id` 分支，不与主题名比较。
- `children` 只读一次，读在画它的 JSX 里。
- 不对称的左右用 `start` / `end`。同一对象里左右同值的对称对可以留 `left` / `right`。
- 每个导出都有 `/** … */`。`registryDependencies` 等于实际 import。

## 安全区

纯 `padding*` / `margin*` 写 `"env(safe-area-inset-*)"` 或 `"calc(env(safe-area-inset-*) + …)"`，Tailwind 写成 `pt-[env(safe-area-inset-top)]`。只有拿数值做算术或定位时才读 `safeArea()`。

## 演示与窄屏

演示是一个场景，不是变体矩阵。主体放进 `Split`，`inspector` 里放状态（`Panel`）和事件（`Log`）。组件声明的每个 `variant`、`size`、`tone` 以及共享 `Tone` 都要在 `apps/website/demos/<id>.tsx` 里出现（`bun run check:demos`）。场景里放不下时，用 `Segmented` 或 `Chips`。

| 用什么                                  | 是什么                                                 |
| --------------------------------------- | ------------------------------------------------------ |
| `Split`                                 | 主体与检查器：窗口 ≥ 900 并排，否则上下堆叠            |
| `Stage`                                 | 居中一块的宽窗口外框（上限 440）                       |
| `Panel`                                 | 检查器里的一组状态                                     |
| `Log`                                   | 事件日志，最新在上                                     |
| `Segmented`                             | 检查器里的单行选项                                     |
| `Chips`                                 | 选项多到一条轨道放不下时，换行的小块                   |
| `DemoPage` / `DemoSection`（`kit.tsx`） | 页面外框；小控件用 `inline`，整宽控件用 `axis="block"` |

这些适配层都在 `apps/website/demos/stage.tsx`，外观取 `@shadcn-nsh/theme` 与 `packages/ui/lib/surface`，不进 `packages/ui`，不进 registry。`desktop` / `wide` 表示指针与键盘（文案用 “Click”）；窗口 ≥ 700 才用桌面布局。`ui()` 是演示自己的调色板，角色来自主题 token。

`Log` 的 `grow` 默认在并排时吃掉检查器剩下的高度。页面级的一条日志在窄窗口不伸、在宽窗口跟着长。页面内容高于窗口时滚动。预览框固定为手机 390 × 640、桌面 1024 × 640（列宽不够时只收窄），不随内容伸缩。切换布局会重载 frame（idiom 在启动时定下）；主题变化发给运行中的应用（`apps/website/scripts/player-options.ts`）。

照片在 `photos.ts` 与 `avatar-data.ts`，只供演示。页面先 `Image.prefetch`，全部到位后再画。

**窄屏。** `bun run check:narrow` 在 320 × 2000 下截每页首帧到 `shots/narrow/<id>.png`，页面右边 16 点必须是空白。写演示时：固定宽度同时写 `maxWidth: "100%"`；行里的文字列写 `flexShrink: 1, minWidth: 0`；一行放不下的块用 `flexWrap: "wrap"` 或 `axis="block"`。占满整屏、自带边距的演示登记在 `scripts/lint/narrow.ts` 的 `FILLS_THE_SCREEN`，并写明理由。

照片类演示（`avatar`、`carousel`、`image-viewer`、`pressable`、`text-view`）用活网络打开，等图片到位再截。

## 文档页

`apps/website/content/docs/components/<id>.md` 的 `##` 按此顺序，除可选节外都要有，不加别的：

| 章节              | 内容                                                                                                                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `## Installation` | 先一个 `npm` 代码块 `npx shadcn-nsh@latest add <id>`；再一行 `As a TSX module, added once per app — nothing is copied into it:`，一个 `sh` 代码块 `nsh add github:aningdev/shadcn-nsh`，一个 `tsx` 代码块 `import { <Name> } from "shadcn-nsh/<id>";` |
| `## Usage`        | import 和一段最简用法                                                                                                                                                                                                                                 |
| `## Composition`  | 可选。一行 `Use the following composition to build a …:`，再一个 `text` 代码块，用 `├──` / `└──` 画出零件。每个名字都必须是该文件导出的                                                                                                               |
| `## Examples`     | 每个轴一个 `###`，只写代码                                                                                                                                                                                                                            |
| `## API`          | 第一张表的表头是 `\| Part \| Props \| Description \|`。只列外壳自己加的 props，其余指向 `nsh/base`                                                                                                                                                    |

`## Examples` 的 `###` 按这个次序：变体（`Variant`、`Tone`）、尺寸（`Size`）、状态（`Disabled`、`Invalid`、`Read-only`、`Loading`）、其余组合、受控（`Controlled`、`Uncontrolled`）。`bun run check:pages` 检查章节、Composition 的引言与树、示例档次和 API 表头。

对得上某个官方组件时，在 `apps/website/src/lib/official.ts` 登记。分类由 `kinds.ts` 推出，页面不手写。

## 提交前

```sh
bun run check
```

它覆盖格式、catalog、主题导出与契约、对比度、语义表、children、RTL、UI 规则、registry、演示轴覆盖、demos / gallery / showcase 的类型、文档页与文档站。按改动再补：

- 改了演示布局：`bun run check:narrow`
- 改了行为：`bun run test:gallery`；改了展示壳：`nsh test apps/showcase`
- 改了主题数据：`bun run theme:build`，然后 `check:theme` 与 `theme:diff`（颜色变化不另画截图；尺寸、材质、状态、动效看受影响的演示）
- 改了 `registry.json` 或组件文件：`bun run registry:build`，把 `public/r` 一起提交
- 改了 registry 条目或 CLI：`bun run test:install`

用的人能感知到的改动，在同一个 PR 里写入 `CHANGELOG.md` 的 `## Unreleased`。
