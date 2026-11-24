# 移植一个组件

新增或修改组件、演示、文档页时照这里做。分层与规则（P1–P6、归属）见 [`ARCHITECTURE.md`](ARCHITECTURE.md)，词汇见 [`GLOSSARY.md`](GLOSSARY.md)，CLI 与基线见 [`toolchain.md`](toolchain.md)。

## 流程

```sh
bun run port:new <id> --from <上游文件> [--symbols a,b,c] [--base <nsh/base 符号>] [--family]
bun run port:new <id> --view [--family]
# 例：bun run port:new toggle --from look/tool.ts --symbols toggleLook,toggleLabel,toggleGlyph,toggleSizes --base Toggle
# 例：bun run port:new popover --from look/overlay.ts --symbols popoverLook,PopoverLookOptions --base Popover --family
# 例：bun run port:new separator --view
# 例：bun run port:new alert --view --family
```

脚手架依次：在 `port-map.json` 加路由（已有路由时报错）→ 建 `packages/ui/<id>.tsx`（文件头含致谢行、外壳骨架；`--family` 生成 Root / Trigger / Content / Close 与 `use<Id>()`）→ `port:vendor <id>` 把文件里还缺的上游声明填成初稿（已有的一律不动）并列出缺的 import → 建 `demos/<id>.tsx` 与 `<id>.ref.tsx` → 建文档页骨架 → 加 registry 条目 → 在 `packages/ui/index.ts` 导出它 → 重新生成 `demos/catalog.generated.ts`。

组件 id 不手写：脚本从 `registry.json` 经 `scripts/catalog.ts` 取集合，NSH 运行时从 `demos/catalog.generated.ts` 取。`render-cases.ts` 只写这个组件需要时的 `steps` / `pointerSteps` / `selfReference` 覆盖（`selfReference` 是判断，不是开关：参照页画的就是组件本身时才写，并写明为什么比不了；`pointerSteps` 只在指针那一半跑，给触屏那一半到不了或不能要的状态——`select` 与 `combobox` 用它把弹层打开后落在字段里的光标停住）；`App.tsx` 不再列 id。

**没有上游声明的组件**（本库自己的，如 `pressable`）不给 `--from`：

```sh
bun run port:new pressable --base Button
```

它不写 `port-map.json`、不跑 `port:vendor`，`packages/ui/<id>.tsx` 从 `templates/own.tsx.tmpl` 起步：整份归本库，文件头也就没有致谢行。它不声明 `selfReference`（参照页必须由演示与 `<id>.ref.tsx` 的 look 展开画出同样的像素），其余流程、演示、文档页、registry 与上面一样。

**外观只在演示里时**：初稿也可以抽自 `references/nsh/examples/gallery/demos/<file>.tsx` 里的一段（`port-map.json` 不登记这类路由）。`combobox` 的 chip 就这样抽自 `Controls.tsx` 的 `Chip`，搬进来的代码照常归本库、可以直接改。

**只排版和上色的组件**（本库自己的，`nsh/base` 里没有对应的控件：分隔线、占位块、按键示意）用 `--view`：外壳画在 `nsh` 自己的 `View` / `Text` 上，`--base` 与 `--from` 都不给。

```sh
bun run port:new separator --view
bun run port:new alert --view --family   # 有零件（Title / Description…）时
```

它同样不写 `port-map.json`、不跑 `port:vendor`，组件从 `templates/view.tsx.tmpl`（单部件）或 `templates/view.family.tsx.tmpl`（零件家族）起步，演示与参照页分别取 `view` 版模板，文档页的“透传”一句写的是 `nsh` 的 View 而不是某个 `nsh/base` 控件。其余与上面一样。

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
- 状态的外观进对应的 state 样式（`hoverStyle`、`activeStyle`、`focusVisibleStyle`、`disabledStyle`、`selectedStyle`、`expandedStyle`…），不在 `style` 里按 `disabled`、`open`、`selected` 再算一遍；哪些状态留给 JS 见 [`ARCHITECTURE.md`](ARCHITECTURE.md#rules) 的“状态的外观进 state 样式”
- 状态的外观交给平台的 class 语言（`hover:bg-foreground/8`、`group-hover:opacity-100`）只在它比 state 样式更合适时才用，并在那一行写明理由：`sidebar.tsx` 的 `SidebarRail` 的发丝线用 `opacity-0 group-hover:opacity-100` 跟着指针（class 由平台的合成器追踪 hover，换成一个 signal 会在光标每次掠过时提交一帧），同一个文件其余地方仍用 `hovered()`
- 字符串 children 渲染成带 look 字体的 `Text`，其他原样渲染
- **函数 child 是一次响应式插入**：`<View>{() => …}</View>` 里的函数由 NSH 当作动态 child，在它自己的 render effect 里调用，只重跑它读到的那些值，兄弟节点不动（`crates/nsh-js/src/dom.rs` 的 `insert_value` → `insert_effect`，`JSX.Element` 里 `() => Element` 就是一员）。用在“先算出几个值、再交回一个元素”的地方：`combobox.tsx` 的 `ComboboxContent`（look、chrome、空表与 chips 都按这次绘制读一遍，再交给 `BaseCombobox`）、`date-picker.tsx` 的 `DatePickerContent`、`color-picker.tsx` 的 `ColorFields` 的字段行（换格式就换一组字段）。需要自己的状态、`cleanup` 或 context 的部分仍写成组件；它不能用来推迟读 children——读 `props.children` 的函数 child 只有门户的内容构建函数一个（`nsh/base` 每次打开才建它，带 `children-lint: <原因>` 注释）
- **主题值在绘制时读**：模块作用域不读主题值；look 的成员写成 getter（`get height() { return controlHeight.md; }`，样板 `lib/surface.tsx`）或直接在 JSX / `style` 里读。组件体里的 `const h = controlHeight.md` 只读一次，换主题后留在旧值
- **几何走刻度**：行高 `controlHeight.*`、图标 `iconSize.*`、边宽 `stroke.hairline` / `stroke.control`、圆角 `rounded()`、字重 `font.weight(<角色>)`、字号走字体角色；控件维度（`selection`、`field`、`choice`、`track`、`handle`、`group`）的形态从 `control()` 取值、交给 `lib/look.ts`，组件里不按主题名比较、不留按主题的表。刻度上没有的数字就地写一行注释说明它是哪来的
- **时长走 `motion.*`**：状态过渡用 `motion.state`，浮层出现用 `motion.enter`，其余按快慢取 `motion.fast` / `motion.default` / `motion.slow`；只有循环动画留常量，并注释为什么
- **JS 里的状态要写理由**：一个状态的外观实在进不了 state 样式（例如边画在触发器上、状态在列表里），就在那一行注释为什么
- **每个导出部件都透传**：部件的 props 是它所画节点的 props 加自己的轴，`{...rest}` 落在那个节点上；不画自己视图的根（如 `Menu`）在 doc comment 里说明 props 去了哪
- `class` 合并用 `lib/class-names.ts` 的 `joinClass`，不手拼模板字符串
- 定时器、订阅、快捷键绑定在 `cleanup` 里释放（样板 `lib/copied.ts`）
- 同一段形状在两个组件里出现，就搬进 `lib/` 共用（样板 `button.tsx` 的 `Action`、`lib/copied.ts`），不复制第二份
- 轴的 prop 名用 shadcn 的（`variant`、`size`），取值与默认值用上游组件的
- 复合控件（**Composition Facade**）：Root 只持有开关状态（`createOpenState`）与生命周期回调；Content 持有 `nsh/base` 根并透传它的全部 props；Trigger / Close 对字符串 child 渲染 `Button`
- 文件头两行：一句说它是什么、做什么；起源于上游的，第二行是致谢行（本库自己的没有这一行）——读它的是复制文件的应用，不是维护者，所以不写搬运史、理由和 `port:vendor` 这类本库工具。代码里不放任何来源标记：来源只在致谢行，去向只在 `port-map.json`。每个导出的类型、prop 和组件都有 doc comment

## 演示

演示是官方的场景（`references/nsh/website/demos/el-<id>.tsx`），不是变体矩阵：主体放进 `Split`，它的 `inspector` 里放状态（`Panel`：当前值、开关）和事件（`Log`：`onChange` 收到什么）。组件声明的每个轴取值（`variant`、`size`、`kind`、`tone`）与共享 `Tone` 仍要出现（`port:coverage` 判定）；场景里放不下时，用检查器的 `Segmented` 或第二个 `DemoCard` 列出。参照页与演示是同一页面，只把组件换成 look 展开在 `nsh/base` 上。

| 用什么                     | 是什么                                                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Split`                    | 主体与检查器：窗口 ≥ 900 并排，否则上下堆叠；宽度变化只改样式，状态不丢                                                                                                                  |
| `Stage`                    | 居中一块的宽窗口外框（上限 440），官方示例的“主体居中”                                                                                                                                   |
| `Inspector`                | 检查器一列（300 宽，并排时）                                                                                                                                                             |
| `Panel`                    | 检查器里的一组状态：小标题 + `insetSurface` 的框                                                                                                                                         |
| `Log`                      | 事件日志，最新在上（`minHeight`、`grow`）                                                                                                                                                |
| `Segmented`                | 检查器里的选项（`multiple`、展示方式、视图种类），选项数组 + 当前值 + `onChange`                                                                                                         |
| `Chips`                    | 同上，但**换行**：选项多到一条轨道放不下时（七个 tone），一个选项一个小块                                                                                                                |
| `desktop` / `wide`         | 指针与键盘（文案用 “Click”，密度用桌面）；窗口够宽（≥ 700）时才能用桌面布局                                                                                                              |
| `ui()`                     | 演示自己的调色板（`page`、`text`、`muted`、`faint`、`border`、`line`、`accent`、`up` / `down` / `info` / `warn` / `danger`、`card`、`inset`、`raised`、`primary`），取自本库主题的 token |
| `DemoSection`（`kit.tsx`） | 小控件（按钮、徽标、开关）的换行行（默认 `inline`）；整宽控件（accordion、table、slider）用 `axis="block"`                                                                               |
| `DemoPage`（`kit.tsx`）    | 页面外框；`width` 把整页在一个列宽里居中（text-view 的 680）                                                                                                                             |

`Log` 的 `grow` 默认 `sideBySide()`：并排时它吃掉检查器剩下的高度；页面级的一条日志（toast）在窄窗口不伸、在宽窗口跟着长，与官方的 `Log` 一致。

**照片页**：演示里的图来自上游的 `photos.ts`（搬到 `apps/website/demos/photos.ts`，**演示内容，不进 registry**）与 `apps/website/demos/avatar-data.ts` 的 `avatarPortrait`（同样只供演示）。页面先 `Image.prefetch` 再交给 `Image`，全部到位后画 `testID="images-ready"` 的标记；`render-cases.ts` 的 `photos: true` 让 `port:render` 用活网络打开它、等这个标记与淡入结束。圆角裁切的边缘在两次运行间偶尔差 1/255：所有页按抗锯齿预算比较（`render-cases.ts` 的 `antialiasing`），avatar 的圆形头像另有更宽的 `tolerance`，数字与实测写在那里。

它们都在 `apps/website/demos/stage.tsx`，从上游 `demo.ts` 搬来（`port-map.json` 的 `symbols` 路由）。初稿由 `port:vendor` 填进来；填过来就是我们的代码，改它不需要登记。外观取 `@shadcn-nsh/theme` 与 `packages/ui/lib/surface`，**不进 `packages/ui`、不进 registry**。适配层新增、重命名时：改 `port-map.json` 的 `symbols`；目标文件里对应的初稿照常由 `port:vendor` 补齐。

演示页自己的外壳（标题、卡片、小节）仍用 `kit.tsx` 的 `DemoPage` / `DemoCard` / `DemoSection`。页面内容高于窗口时滚动：预览框固定为手机 390 × 640、桌面 1024 × 640（列宽不够时只收窄宽度），不随内容伸缩。

页面看到的窗口与官方一致：Phone 是 390 × 640 的 phone idiom（`platform.desktop` 为假），Desktop 是 1024 宽的 desktop idiom（列宽不够时取列宽，不缩放）；切换布局重载 frame（idiom 启动时定下），主题变化发给运行中的应用（详见 `apps/website/scripts/player-options.ts`）。

**窄屏**：每个演示放得进 320 宽的手机（iPhone SE），不越出卡片、不伸进页边。`bun run check:narrow` 在 320 × 2000 下截每页的首帧，页面右边 16 点必须是空白页面，否则点名。写演示时：

- 固定宽度（骨架线、卡片、一行几格）同时写 `maxWidth: "100%"`，窄时随父级收窄；
- 行里的文字列（图标 + 两行字、标签 + 输入）写 `flexShrink: 1, minWidth: 0`，让它换行而不是撑宽一行；
- 一行放不下的几个块（三格表面、两个按钮）用 `flexWrap: "wrap"` 或改成 `axis="block"`。

占满整屏、自带边距的演示（`nav-stack`）在 `scripts/port/narrow.ts` 的 `FILLS_THE_SCREEN` 里登记并写明理由。参照页跟着同样改，`port:render` 才对得上。

## 文档页

照 shadcn 的篇幅与顺序。页面外壳由 `apps/website/src/routes/docs/$.tsx` 生成：标题、描述，一排徽章（Copy Markdown、`NSH ↗`、`shadcn/ui ↗`，有对应才出现），然后是 Preview 面板。行为、键盘与无障碍、完整的无样式 API 都在 NSH 页上，本页不重复，也不列源码路径。

`.md` 里的 `##` 章节按此顺序，除标为可选的以外都要有，不加别的：

| 章节              | 内容                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `## Installation` | 一个标成 `npm` 的代码块：`npx shadcn-nsh@latest add <id>`（Fumadocs 画成 npm / pnpm / bun 三个标签，不手写三条）                                                                                                                 |
| `## Usage`        | import 和一段最简用法                                                                                                                                                                                                            |
| `## Composition`  | 可选：多部件的组件一节零件树。一行 "Use the following composition to build a `Dialog`:"，再一个标成 `text` 的代码块，用 `├──` / `└──` / `│` 画出真实的嵌套。树里的每个名字都必须是 `packages/ui/<id>.tsx` 导出的；单部件的页不写 |
| `## Examples`     | 每个轴一个 `###`，只写代码（顶部的 Preview 已是整个演示，示例不各配预览）                                                                                                                                                        |
| `## API`          | 第一张表是零件表，表头固定 `\| Part \| Props \| Description \|`；只列外壳自己加的 props，其余一句话指向 `nsh/base`                                                                                                               |

`## Examples` 的 `###` 按这个次序排，同一档内自由：

1. 变体：`Variant`、`Tone`（单数）
2. 尺寸：`Size`（单数）
3. 状态：`Disabled`、`Invalid`、`Read-only`、`Loading` 开头的小节
4. 组合：其余小节（带图标、带表单、自定义触发器……）
5. 受控：`Controlled`、`Uncontrolled`

与 shadcn 的比较不写在页面上：本库自己决定外观与 API，页面只陈述本库自己的事实；与本库另一个组件的比较（"Against `Dialog`"）是组合档的一个小节。无障碍说明（屏幕阅读器读到的名字）写进对应示例或 API，不另起 `##`。`bun run check:pages` 检查章节与次序（Composition 只在 Usage 与 Examples 之间）、Composition 的一行引言、`text` 代码块与树里的导出名、`###` 档次与 API 表头。

## 主题文件

`default` 主题的源码真源已迁至 `packages/theme/tokens/`（DTCG 2025.10），改后运行 `bun run tokens:build` 编译生成 `packages/theme/{theme,semantics}.json` 与 `packages/theme/themes/default/{theme,semantics}.json`（`port-map.json` 写的是 `"owned": "<路径>"`，起点是上游那两个文件，此后在这里改，不再从上游拷）。

- `port:vendor` 跳过它们（不带 id 时打印一行 `own  …`）；`port:check` 不比对内容，也不要求它们是模块。
- 颜色一律 `oklch()`：token、渐变的每一站、阴影、`color-mix()` 里的颜色，透明度写成 `oklch(… / a)`；`transparent` 与 `var(--x)` 原样保留。
- 数值格式固定（L、C 五位小数，H 三位，alpha 三位）：`oklch()` 与 sRGB 互为逆运算，8-bit 通道完全落回，所以换存储不动一个像素。`scripts/theme/oklch.test.ts` 扫 8-bit 立方体验证这点；`scripts/theme/themes.test.ts` 断言每个主题文件里没有 hex、`rgb()`、`hsl()`。
- `themes/<name>/`（`default` 以外）：真源是 `packages/theme/tokens/themes/<name>/`（DTCG 2025.10），改后跑 `bun run tokens:build`。五套主题（`shadcn`、`solid-glass`、`apple`、`material`、`winui`）由 `scripts/theme/generate-<name>.ts` 重写源码：各主题文件只写自己的颜色、样式与控件预置，十五个 finish（十二个层加三种状态，`knob` 另带选中态字段 `checked-*`）与影子刻度的数据在 `scripts/theme/finishes/<name>.ts`（`finishes` 与 `shadows` 两个对象，`shared` 加稀疏 `light`/`dark`），`scripts/theme/dtcg.ts` 的 `themeSourceDocs()` 把它们编码成 DTCG 文档、`emitDtcgTheme()` 写盘并执行 `bun run tokens:build`。生成结果与提交的源码逐字节相同，`scripts/theme/generators.test.ts` 逐套断言这点：改生成器或数据后先跑它，`git status` 应只剩预期文件。`default` 与 `themes/native/` 是手写源码。
- 要重新对齐上游时，比对 `references/nsh/examples/nsh-gallery-ui/{theme,finishes}.json` 的差异，按需改 `packages/theme/tokens/` 并跑 `bun run tokens:build`；`owned` 标记不动。

### 主题改动的验收

先按改动落在哪一类选检查。`theme:diff` 读编译后的值，不看文件名，所以同一个源文件里的颜色与尺寸会分别归类：

| 改动                                                                              | 渲染                             | 闸门                                                                       |
| --------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| 组件代码、`packages/ui/lib`、演示                                                 | 受影响的 id（import 图，同今天） | 同今天                                                                     |
| 主题契约：`tokens/base/`、`packages/theme` 的代码（`*.ts`）、构建、键的新增或删除 | 每个 id、每套主题                | 全量，CI 分片                                                              |
| 主题的尺寸 / 字体 / 阴影 / 材质 / 状态 / 动效                                     | 每个 id，只画改动到的主题        | 截图                                                                       |
| 只有主题的颜色值                                                                  | 不画                             | `tokens:build --check`、`check:theme`、`theme:contrast`、`theme:diff` 报告 |

`theme:diff` 为每套主题的每个改动键给出 `colour` / `value` / `contract`；`--changed` 用同一分类挑页与主题，`--list` 只打印会画什么、为什么（三个 render 脚本都支持）。`default` 是 `port:render` 与 `port:render:touch` 的主题：它的值没变，这两个脚本就不画。

改完主题再按三层验收，全量截图只跑一次：

| 层             | 证明什么                                                                                                                                                                                         | 命令                                                                                                                                                                     | 耗时   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| ① 值           | 每套主题、亮暗两种外观下，每个颜色角色与 finish 字段解析出的值（`var(--x)`、`{x}` 与 `oklch(from {x} …)` 都展开）与 `origin/main` 相同；删掉的角色列出与它处处相等的键，即读者可以无损改读的去向 | `bun run theme:diff [<ref>] [--same] [--gate]`；`--same` 在已有的键值变化时以非零退出，`--gate` 在契约改动没有决策记录时以非零退出                                       | 秒级   |
| ② 定向前后比对 | 改过读法的组件，在五套主题下与改动前逐像素相同（成对比较抓不到这一点：组件页与参照页一起变时仍然成对）                                                                                           | 改动前：`bun run port:render:theme --only <ids>`，把 `apps/website/demos/shots-theme/` 复制出去；改动后：`bun run port:render:theme --only <ids> --against <复制的目录>` | 几分钟 |
| ③ 全量         | 没有漏掉的页                                                                                                                                                                                     | 开 PR 前跑一次 `bun run port:render` 与 `bun run port:render:theme`                                                                                                      | 一次   |

- `<ids>` 是读到被改角色、finish 或预设的组件，以及引用它们的演示。`--only <ids>` 精确选页；`--changed [<ref>]` 按分类自动选页与主题；`--theme <id,...>` 收窄到指定主题；三者取交集。
- 只改颜色值时没有截图可看：`bun run theme:contrast` 列出每套主题、亮暗两种外观下 WCAG 2 AA 不达标的角色对与 finish（阈值与理由写在 `scripts/theme/contrast.ts`）。它在 `bun run check` 里：不达标即失败；原生主题照平台保留的不达标对（如 apple 的 secondaryLabel、白字在 systemBlue 上）列在脚本的 `platform` 里并注明出处，某对不再不达标时也会报错，提醒删掉这条例外。`disabled-foreground`（WCAG 豁免不可用控件）与 `chart-foreground`（数据色上的标签）不查。
- 预期不变像素的重构（例如删除纯 alias 角色）要求 ① 用 `--same` 通过，② 没有差异。预期有可见变化的改动用 ② 的截图逐页审阅，变化写进 PR。
- 第 ③ 层只用来兜底：在 ② 没覆盖的页上出现差异，说明 `<ids>` 选漏了，要补进 ② 再查。

## 上游变化

上游是参考规范，不是必须逐字照搬的源头（P2）。`port-map.json` 的 `upstream.reviewed` 记着我们审阅到哪个上游提交：

1. `bun run port:bump`（不带参数时用它打印的提交）把 `references/nsh` 与 `upstream.commit` 移到新基线，并列出自 `reviewed` 以来**我们有去向的**声明哪些新增、改动、删除，以及文件的新增与删除。它**不改**任何文件的内容，也不提交。
2. 逐条看：想采纳就改代码（look 与外壳都可以直接改），不想采纳就保持我们的样子。原文在 `git -C references/nsh diff <reviewed>..<commit> -- examples/nsh-gallery-ui`。
3. 清单处理完（新增的声明有去向、删除的声明去掉路由，`port:check` 不再报清单缺口）：`bun run port:review` 把 `upstream.reviewed` 推到基线，它只改这一行。
4. `bun run port:check && bun run port:render`；截图有变化就 `port:sheet` 看过，`port:baseline --update`。
5. 子模块指针、`port-map.json` 与代码同一个 commit。

`port:check` 因此只回答两件事：清单完整（P1），以及 `reviewed` 之后上游有没有动到我们有去向的声明（P2）。它**不**比较我们的代码与上游的文字。

## 检查

| 命令                           | 判定                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 何时跑                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `bun run port:check`           | P1–P2：清单完整（每个声明有去向或理由，路由指向的文件存在）、`upstream.reviewed` 之后上游有去向的声明没有未审阅的改动、`owned` 的文件（主题的两个 JSON）不在范围、安装的 CLI 与基线不同时警告；`--status` 列出待办                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 每次                           |
| `bun run port:review`          | P2：列出待审阅的上游改动；清单完整后把 `upstream.reviewed` 推到基线（只改这一行，不改代码）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 审阅完上游变化后               |
| `nsh check apps/website/demos` | 组件与演示的类型；`props.test-d.ts` 断言外壳 props 是 base props 的超集（P5）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 每次                           |
| `bun run port:coverage`        | 演示覆盖组件声明的每个轴取值与共享 `Tone`；`selfReference` 与参照页一致（画了组件本身的必须声明，声明了的不许有自己能重建的组件）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 每次                           |
| `bun run check:children`       | 每个控件只读一次 `props.children`（每次读都会重新建一遍子树）：扫 `packages/ui` 与 `packages/ui/lib` 下每个 `.tsx`，清单来自目录，新组件自动纳入；每个组件最多读一次 `props.children`，读写在它自己的主体里、或就地执行的 `(() => …)()` 里（存下来以后再调用的函数每次都会再读一遍），字符串 child 就地交给 `AsText`（`lib/as-text.tsx`，一个组件）画成 `Text`——`<AsText …>{props.children}</AsText>` 的 child 位置就是那次读，look 写进 `style` 即可（组件的 props 是 getter，在应用处求值）；读函数 child 的地方直接画它，renderer 会跟着它读的 signal 更新。唯一的例外是门户的内容构建函数（`nsh/base` 每次打开才建它，关着建就是白建）：那一个读带 `children-lint: <原因>` 注释，并且仍然算这个组件的那一次读（#55、#67） | 每次                           |
| `bun run check:rtl`            | P7：`packages/ui` 里不对称的 left/right 侧向属性用 `start`/`end`，`direction: "rtl"` 才镜像；同一对象里两侧同值的对称对与标了 `// physical: <原因>` 的对象例外                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 每次                           |
| `bun run check:ui`             | P8：`packages/ui` 不点名主题（`Record<Controls>`、`controls()`、主题名比较），颜色与状态外观只经主题角色，例外标 `// color: <原因>` / `// state: <原因>`；P9：import 方向（`lib` 不 import 组件，`packages/ui` 只 import `packages/ui` 内的相对路径、`nsh` / `nsh/base`、`@shadcn-nsh/theme` 的入口与 `lucide`）与每个导出上方的 `/** … */`，例外写进 `scripts/ui-rules/rules.ts` 的 `allowlist`（失效的条目也失败）                                                                                                                                                                                                                                                                                                          | 每次                           |
| `bun run catalog --check`      | 组件集合：每个 `registry:ui` 都有演示、参照页、文档页并从 `packages/ui/index.ts` 导出；没有未登记的演示或页；`render-cases.ts` 的覆盖都指向目录里的 id；`catalog.generated.ts` 最新                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 每次                           |
| `bun run port:render`          | P4 的指针一半：web，亮 / 暗；每对逐字节比较；跑完与 `apps/website/demos/baseline/` 逐字节比较（仅 macOS；CI 加 `--no-baseline`）；`--only <id,...>` 按 id 精确只跑这几个；`--changed [<ref>]`（默认 `origin/main`）只跑这次的 diff 能走到的 id，列出每个文件与原因，与 `--only` 取交集；`--jobs <n>` 同时开几个 `nsh test` 进程（默认 CPU 核数的一半、至多 6，`--jobs 1` 是逐页串行）。**唯一的例外**：`render-cases.ts` 里写了 `tolerance` 的页（目前只有 `avatar`，圆形照片的边缘）由 `render.ts` 按"至多 30 个像素、每个通道至多 32/255"比较，布局变化仍必失败，数字与实测写在该 case 的注释里                                                                                                                             | 提交前、CI                     |
| `bun run port:render:touch`    | P4 的触屏一半：iOS 模拟器，亮 / 暗（同样由 `render-touch.ts` 按字节或抗锯齿预算比较）；之后跑外观切换检查                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 提交前（本地）                 |
| `bun run port:render:theme`    | 主题下的渲染：每页在 `mount` 之前从 storage 读到主题的 palette（`apply-palette.ts`，与站上的切换器同一路），组件与参照页按同样的预算比较，覆盖 `default` 以外的五套主题（shadcn、solid-glass、apple、material、winui），亮暗各一对；**不进基线**——截图留在 `apps/website/demos/shots-theme/`，`port:sheet` 有图时多出两列；`--only`、`--changed`、`--jobs` 同 `port:render`；`--code-only` 让 `--changed` 只取改动代码触及的页（主题改动不扩到全页：PR 上这样跑，合进 `main` 后的那次再按主题全画）；`--theme <id,...>` 只画指定主题；`--list` 只打印页 × 主题与原因；`--against <dir>` 只画组件页（不画参照页），再把每张图与先前一次的截图逐张比较（见[主题改动的验收](#主题改动的验收)）                                   | 改主题数据后                   |
| `bun run theme:diff`           | 主题的值：每套主题、亮暗两种外观下，每个角色与 finish 字段解析后的值与 `<ref>`（默认 `origin/main`）比较，列出删除、新增、改变的键，并把每个键归为 `colour` / `value` / `contract`，为删掉的角色列出处处相等的键；`--same` 在有改变的值时以非零退出，`--json` 输出机读结果，`--gate` 在契约（键增删、共用源）改动没有同一分支的 `docs/decisions/` 记录时以非零退出                                                                                                                                                                                                                                                                                                                                                            | 改主题数据后                   |
| `bun run theme:contrast`       | WCAG 2 AA 对比度：每套主题、亮暗两种外观下，每个 `<x>-foreground` 与 `<x>`、`foreground` 与 `background`、`muted-foreground` 与 `background` / `muted`、每个 finish 的 ink 与 fill 的比值；body 4.5、图标与大字 3，透明 fill 先合成到页面上；`--themes <id,...>` 收窄主题。失败项是主题的决定，不是组件的问题                                                                                                                                                                                                                                                                                                                                                                                                                 | 改颜色值后；`bun run check` 里 |
| `bun run check:narrow`         | 每个演示的首帧放得进 320 宽：页面右边距是空白页面（`scripts/port/narrow.ts`，`--only` 同 `port:render`）；整屏演示的豁免带理由登记在脚本里                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 改演示布局后、发版前           |
| `bun run registry:build`       | P6：依赖等于 import，相对 import 都有条目分发                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 改组件后                       |
| `bun run test:unit`            | CLI 与主题；`ui-guards.test.ts` 扫 `packages/ui`、`lib`、主题读取层、`apps/website/demos` 全集的颜色字面量（P3，look 与外壳同等）；有理由的豁免写在测试里                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 每次                           |
| `bun run test:gallery`         | 原生行为：按键、取值、禁用                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 改行为后                       |
| `vp check`                     | 格式、lint、工具面类型                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 每次                           |
| `bun run check`                | `vp check --fix` → `catalog --check` → `check:theme` → `check:children` → `check:rtl` → `check:ui` → `registry:build --check` → `port:check` → `port:coverage` → demos 与 gallery 类型 → 文档页 → docs（会改文件）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 每次                           |
| `bun run test:install`         | 复制即用：`public/r` 与重新构建的结果逐字节相同；`init` + `add` 进新的 NSH app，逐个 `registry:ui` 条目 `nsh check`，全量一次再 `nsh test`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 改 CLI、registry 或组件依赖后  |

两种渲染比对的实现细节（CPU 光栅化、定身等待、基线）见 [`toolchain.md`](toolchain.md#渲染比对的两半)。

迭代时用 `--changed`（不知道哪个 id 会动）或 `--only <id,...>`（知道），只跑受影响的页；开 PR 前跑一次全量，因为 `--changed` 只回答"这次的 diff 动了哪些页"，回答不了"有没有我没想到的页"。

`port:baseline --update [--only <id,...>]` 只重录这几个 id 的图（其余不动）；不带 `--only` 时全量替换。

## 待定

- **上游按"行"设计的缺口**：单独一个开关没有焦点环和禁用外观（上游由 `listRow` 提供）。现状是与上游一致、不补。
