# @shadcn-nsh/ui

[English](./README.md)

在 [`nsh/base`](https://nsh.dev/elements) 之上的 **styled copy-into-app 层**：行为与无障碍留在 base；本包通过 [`theme.json` / `token()`](../theme) 加品牌外观，并向 `shadcn-nsh add` 提供 registry 项。

- 主题：[`@shadcn-nsh/theme`](../theme)
- 原生验真：[`apps/gallery`](../../apps/gallery)
- 文档站：[`apps/docs`](../../apps/docs)

权威 base 清单与 API 形态见 [`references/nsh/website/elements`](../../references/nsh/website/elements)（`group: base`）及演示 `website/demos/el-*.tsx`。Primitives（`group: primitives`：`View`、`Text`、`Scroll` 等）在 `nsh` 中，**不是**本包 registry 项。

## 分层

| 层         | 所在             | 职责                                        |
| ---------- | ---------------- | ------------------------------------------- |
| Primitives | `nsh`            | 布局 / 绘制 / host                          |
| Base       | `nsh/base`       | Unstyled 控件（press、focus、a11y、value）  |
| 本包       | `@shadcn-nsh/ui` | Styled 包装 + `shadcn-nsh add` 的 registry  |
| Extensions | —                | **不做**（无 base 导出的 shadcn-only 零件） |

## 工具链

本仓开发与部署对齐 **已发布的 store CLI**（`curl …/install.sh | sh`，当前 **0.4.0** / commit `e626a8d`）。Phase-1 只包装该 release 已注册的 `nsh/base` 导出。

## Phase-1 状态（store `nsh` 0.4.0 ∩ core 对齐）

| website                                                               | `nsh/base`              | registry       | shadcn         | 状态 |
| --------------------------------------------------------------------- | ----------------------- | -------------- | -------------- | ---- |
| [button](../../references/nsh/website/elements/button.md)             | `Button`                | `button`       | `button`       | done |
| [input](../../references/nsh/website/elements/input.md)               | `Input`                 | `input`        | `input`        | done |
| [checkbox](../../references/nsh/website/elements/checkbox.md)         | `Checkbox`              | `checkbox`     | `checkbox`     | done |
| [radio](../../references/nsh/website/elements/radio.md)               | `RadioGroup`, `Radio`   | `radio-group`  | `radio-group`  | done |
| [switch](../../references/nsh/website/elements/switch.md)             | `Switch`                | `switch`       | `switch`       | done |
| [progress](../../references/nsh/website/elements/progress.md)         | `Progress`              | `progress`     | `progress`     | done |
| [tabs](../../references/nsh/website/elements/tabs.md)                 | `Tabs`, `Tab`           | `tabs`         | `tabs`         | done |
| [popover](../../references/nsh/website/elements/popover.md)           | `Popover`               | `popover`      | `popover`      | done |
| [tooltip](../../references/nsh/website/elements/tooltip.md)           | `Tooltip`               | `tooltip`      | `tooltip`      | done |
| [sheet](../../references/nsh/website/elements/sheet.md)               | `Sheet`                 | `sheet`        | `sheet`        | done |
| [dialog](../../references/nsh/website/elements/dialog.md)             | `Dialog`                | `dialog`       | `dialog`       | done |
| [menu](../../references/nsh/website/elements/menu.md)                 | `Menu`, …               | `menu`         | `menu`         | done |
| [menu](../../references/nsh/website/elements/menu.md)                 | `ContextMenu`, …        | `context-menu` | `context-menu` | done |
| [collapsible](../../references/nsh/website/elements/collapsible.md)   | `Collapsible`           | `collapsible`  | `collapsible`  | done |
| [toast](../../references/nsh/website/elements/toast.md)               | `Toast`, `ToastStack`   | `toast`        | sonner / toast | done |
| [table](../../references/nsh/website/elements/table.md)               | `Table*`                | `table`        | `table`        | done |
| [accordion](../../references/nsh/website/elements/accordion.md)       | `Accordion*`            | `accordion`    | `accordion`    | done |
| [avatar](../../references/nsh/website/elements/avatar.md)             | `Avatar`, `AvatarGroup` | `avatar`       | `avatar`       | done |
| [combobox](../../references/nsh/website/elements/combobox.md)         | `Combobox`              | `combobox`     | `combobox`     | done |
| [link](../../references/nsh/website/elements/link.md)                 | `Link`                  | `link`         | `link`         | done |
| [number-input](../../references/nsh/website/elements/number-input.md) | `NumberInput`           | `number-input` | `number-input` | done |
| [otp-input](../../references/nsh/website/elements/otp-input.md)       | `OtpInput`              | `otp-input`    | `otp-input`    | done |
| [pagination](../../references/nsh/website/elements/pagination.md)     | `Pagination`            | `pagination`   | `pagination`   | done |
| [select](../../references/nsh/website/elements/select.md)             | `Select`                | `select`       | `select`       | done |
| [slider](../../references/nsh/website/elements/slider.md)             | `Slider`                | `slider`       | `slider`       | done |
| [toggle](../../references/nsh/website/elements/toggle.md)             | `Toggle`                | `toggle`       | `toggle`       | done |
| [toggle](../../references/nsh/website/elements/toggle.md)             | `ToggleGroup`           | `toggle-group` | `toggle-group` | done |

另有：registry `theme`（`theme.json` + `lib/theme.ts` + 表面/动效 helper）与 `open-state`（组合状态辅助）。

## 不在 Phase-1（main 上仍有 base / 文档）

| 类别           | website / base                                                | 原因                    |
| -------------- | ------------------------------------------------------------- | ----------------------- |
| Dates / color  | Calendar, TimeField, DatePicker, ColorPicker                  | Phase-2                 |
| Layout         | Resizable, Scrollbar, Toolbar                                 | Phase-1.5 / later       |
| Shell / system | NavStack, AlertDialog                                         | App shell / 原生 alerts |
| Heavy          | Editor, RichEditor, DiffView, TextView, DataTable, Dock, Plot | 单独里程碑              |

## Extensions（故意不做）

shadcn 有这些；**没有**对应的 `nsh/base` / website `group: base` 导出 → **不**做成 registry UI：

`badge`、`card`、`label`、`separator`、`hover-card`、`skeleton`、`aspect-ratio`、…

标签用 `Text` + 控件组合；分隔线需要时用 `View` 边框。

## 复合命名（nsh + composition 角色）

公开名跟 `nsh/base` 符号（`MenuTrigger`，不是 `DropdownMenuTrigger`）。Composition 角色为 Trigger / Content / Item；根只持有 open 状态（**composition-only** — 根上不向消费者暴露 `trigger`）。内部仍在 Content 挂载时接线 `nsh/base` 的 `trigger`。

| nsh / 公开家族                  | 本包                                                                                                                           | 底层 `nsh/base`                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Dialog / Trigger / Content / …  | `Dialog` / `DialogTrigger` / `DialogContent` / Header / Title / Description / Footer / Close；完整 base prop + style-hook 透传 | 单个 `Dialog`；Content 持有 base 根      |
| Sheet / Trigger / Content / …   | 同模式；完整 base prop + style-hook 透传                                                                                       | 单个 `Sheet`；Content 持有 base 根       |
| Menu\*                          | composition-only；Group / Label / Shortcut；Content / Item / Sub 完整 base 透传                                                | `Menu` / `MenuItem` / `Submenu`          |
| ContextMenu\*                   | composition-only；Item/Sub/… 再导出 Menu 零件                                                                                  | `ContextMenu`                            |
| Popover / Trigger / Content     | composition-only；Header / Title / Description；完整 base 透传                                                                 | `Popover`                                |
| Tooltip / Trigger / Content     | composition-only；独立 `TooltipContent` 供 host `tooltip={}`；Provider delay                                                   | `Tooltip` bubble                         |
| Tabs / List / Trigger / Content | `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`（+ 直接导出 `Tab`）                                                        | `Tabs` + `Tab`；面板为应用/`TabsContent` |
| Collapsible / Trigger / Content | composition-only；Content 上可选 base `reveal`                                                                                 | `Collapsible`                            |
| Select / Trigger / Content      | composition-only；items 注册进 base 列表                                                                                       | `Select`                                 |
| Combobox / Trigger / Content    | composition-only；多值                                                                                                         | `Combobox`                               |
| Accordion / Item / Trigger      | composition-only（`AccordionPanel`）                                                                                           | `Accordion*`                             |
| Toast / sonner                  | `toast()` + `Toaster`（+ `Toast` / `ToastStack` / `ToastManager`）；完整 base prop 透传                                        | 同左                                     |
| Table\*                         | `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` / …                                             | 同左                                     |
| RadioGroup / Item               | `RadioGroup` / `RadioGroupItem`（+ `Radio` 别名）                                                                              | `RadioGroup` + `Radio`                   |

## 来源与同步

这些组件的视觉与状态设计来自 NSH 自己的共享 UI 层 `references/nsh/examples/nsh-gallery-ui`（上游称它是内部层，不作为应用 API 发布）。我们**按家族一次性**移植：取状态设计和几何，颜色通过 shadcn neutral 调色板表达（`colors.*`、`finish`、`alpha()`），不带走终端形态、声音和网站 playground 适配，并给组件加上 Composition Facade。

- **基线：** `64ab8a1d`，即 `references/nsh` 固定的提交（`examples/nsh-gallery-ui` 最后一次改动是 `d96fc35c`，2026-11-09）。
- **移植文件的文件头：** `// Source: examples/nsh-gallery-ui/look/<file> @ 64ab8a1d`，并指向 `NOTICE`。
- **store 与 main：** 本仓库按 store `nsh` 0.4.0 开发，参考实现跟随 `main`。以 store 的 `.nsh/types` 做类型检查；store 没有的 base 能力写进组件的 Differences，不移植。
- **许可：** 移植部分保持 Apache-2.0（Longbridge），见 `NOTICE`。
- **同步：** 手动。基线变动时，逐家族把该家族的 look 文件与文件头里的提交对照。没有自动同步。
- **计划与顺序：** [`docs/roadmap.md`](../../docs/roadmap.md)。

## 范围规则

| 规则                                                                                                                                             | 原因                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **Registry 完整性。** store CLI 上 `nsh/base` 的每个导出都在范围内；轻量条目也要接入主题（不做裸 re-export）。没有 base 导出的 Extensions 不做。 | `add` 的覆盖面跟着 base 走；不做 shadcn-only 零件。                             |
| **命名跟 `nsh/base` 符号**（`Menu` → `menu` / `MenuTrigger`），不用 shadcn id（`dropdown-menu`）。旧 id 直接删除，不留别名。                     | 只有一个真源；混用命名（`add menu` + `DropdownMenu`）会造成虚假的 shadcn 对齐。 |
| **复合控件只用 Composition**（`Root` / `Trigger` / `Content` / `Item`）。根上不暴露消费者 `trigger`，不保留旧的双路径。                          | 两套 API 就是两个真源。                                                         |
| **行为留在 `nsh/base`。** 无法抹平的差异写进组件文档的 Differences。                                                                             | 我们负责样式与组合，不重写行为。                                                |
| **外观来自 [`@shadcn-nsh/theme`](../theme)**，动效跟 nsh Animation，写在各组件里（见下文）。                                                     | 品牌只有一个来源；不另建动效系统。                                              |

## 组件包

一个组件不只是一个源码文件。随组件一起交付、一起变化的单元是六类产物（`<id>` 是 `nsh/base` 符号的 kebab-case）：

| #   | 产物          | 位置                                          | 约定                                                                                                                                                                   |
| --- | ------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 源码          | `packages/ui/<id>.tsx`                        | 一个家族一个文件。满足共享规则与 Leaf 或 Family 配方。文件内顺序见下文。                                                                                               |
| 2   | Registry 条目 | `registry.json`                               | `name` = `<id>`；`registryDependencies` 等于实际 import（`registry:build` 校验）；`theme` 是独立条目，不内联；`target: components/ui/<id>.tsx`。                       |
| 3   | 公开面        | `packages/ui/index.ts`                        | 只导出组件、`xVariants()` 辅助函数和 props 类型。`lib/*` 保持内部。                                                                                                    |
| 4   | 文档页        | `apps/docs/src/pages/docs/components/<id>.md` | 固定章节：Install、Usage、Composition（部件表）、API、Differences（对 shadcn 与对 `nsh/base` 的差异）、Accessibility。docs 只放 web 示意，以 gallery 的演示为准。      |
| 5   | 验证          | `apps/gallery` + `apps/gallery/tests`         | 原生 gallery 演示。Leaf 必须有 reactive 测试（挂载后改 prop 要能跟随）；Family 必须有行为测试（打开、关闭、键盘激活）。涉及减少动效的控件用 `reducedMotion: true` 测。 |
| 6   | 构建产物      | `public/r/<id>.json`                          | 由 `bun run registry:build` 从 1 和 2 生成，与源码同一个 commit 提交。手改后执行 `vp fmt public/r`。                                                                   |

复制之后代码归应用所有（copy, then own）。Registry 条目不带版本号，也不会自动更新；`add --overwrite` 会覆盖文件。破坏性变更记在组件的 Differences。

**新增组件：** 先确认该导出存在于 **store** CLI 的 `nsh/base`（不只是 `references/nsh` main）。然后产出上面六类产物，把 `theme` 加进 `registryDependencies`，并更新 Phase-1 表的状态列。

## 配方

配方（Recipe）是组件必须满足的规则集。它约束结构与依赖，不约束外观：外观归主题，动效归各组件，行为归 `nsh/base`。

### 共享规则

| #      | 规则                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 原因                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **R1** | **先自包含。** 组件只 import `theme`、`nsh`、`nsh/base`，以及 R2 登记的例外。只有当多个文件的行为必须一致时才新增共享 helper；重复八行不算。                                                                                                                                                                                                                                                                                                                              | 每个 import 都是应用要安装的 registry 依赖。                            |
| **R2** | **允许的横向 import：** 作为原语层的 `button`；同家族复用并 re-export（`context-menu` → `menu`，`toggle-group` → `toggle`）。其他情况需要先在此登记。                                                                                                                                                                                                                                                                                                                     | 保持依赖图浅。                                                          |
| **R3** | **不解构 props。** 在使用处读 `props.x`，其余用 `split(props, keys)` 透传，默认值写在 JSX 里（`props.x ?? d`），派生值用 `computed`。依赖 props 的样式包只算一次，不在每个调用处重算。                                                                                                                                                                                                                                                                                    | 解构出来的 prop 只读一次，不跟随变化（nsh `jsx-and-components`）。      |
| **R4** | **只在有默认值时合并。** 消费者的值原样透传。只有包装层有默认值时才写 `[default, consumer]`；禁止 `mergeClass(undefined, x)` 和 `mergeStyle(undefined, x)`。不设共享 merge helper：`theme` 不增加非 token 工具，`lib/` 也不增加。                                                                                                                                                                                                                                         | 恒等调用是噪声；共享 helper 会为几行代码引入 registry 依赖。            |
| **R5** | **外观来自主题，几何用最小值。** 颜色、圆角、阴影、焦点环和 disabled 外观只来自 `theme`。其余（几何、字号、variant 透明度、动效）都是字面量，集中在文件顶部的单个 `look` 函数里，写成 `minHeight` / `minWidth` 加 padding，不写固定 `height` / `width`。有意固定的几何（正方形图标按钮）要在注释里说明理由。不带外观含义的布局字面量（`borderWidth: 1`、为布局稳定的 `"transparent"` 边框）可以放进 `look` 并加注释。动效白名单（见下文）之外的时长或曲线不得写成字面量。 | NSH：控件框体随标签和用户字号增长；没有 spacing token（主题保持克制）。 |
| **R6** | **公开面。** `xVariants()` 辅助函数和组件类型是公开的。`lib/*` 是内部的，版本之间签名可以变化。                                                                                                                                                                                                                                                                                                                                                                           | 复制了 `lib/*` 的应用不应被一次改名破坏。                               |
| **R7** | **每个导出的 prop、类型和 `xVariants` 选项都要有 doc comment。**                                                                                                                                                                                                                                                                                                                                                                                                          | nsh Public API design。                                                 |
| **R8** | **variant 与 size 的取值沿用 shadcn 命名。** 新增取值要在组件的 Differences 里写明理由。                                                                                                                                                                                                                                                                                                                                                                                  | 对齐 shadcn 是产品目标；nsh 的“variant 要少”针对的是一次性页面需求。    |

### Leaf 配方（模板：`button`）

单部件组件，基于一个 `nsh/base` 控件。

- **必须：** props 类型为 `Omit<BaseProps, "children"> & { variant 轴; children?: string | JSX.Element }`。纯函数 `xVariants(options)` 返回 `style`、`label`、各状态样式（`hover` / `active` / `selected` / `disabled`）和 `hitSlop`。状态样式沿用 `nsh/base` 暴露的类型化名字（`checkedStyle`、`indeterminateStyle` 等），每个都是 `[default, consumer]`，消费者优先。非主部件的样式透传 `<part>Class` / `<part>Style`。默认带焦点环、从字符串 children 得到的无障碍标签（`nsh/base` 已推导的除外）和触屏 `hitSlop`。未知 variant 回退到 `default`。
- **禁止：** 重新实现 base 行为；import 另一个 leaf（`button` 除外，见 R2）；解构 props（R3）。
- **可以不同：** variant 轴、标签渲染、尺寸字面量。

### Family 配方（模板：`popover`）

Composition Facade，基于复合 `nsh/base` 控件（`Root` / `Trigger` / `Content` / `Item` 及装饰部件）。不弹出的多部件控件（`tabs`、`accordion`、`collapsible`、`table`、`toast`、`pagination`）也用它；下面的 popup 条款对它们不适用。

- **Root** 只持有 `createOpenState`，以及 base 有 `trigger` prop 时的 `createSlot`；生命周期回调放进 context；渲染 Provider 与 children，不携带 `Content` 的 props。context hook 抛出 `"X parts must be used within <X>"`。
- **Trigger** 填充 slot 并返回占位（base 没有 `trigger` prop 时直接渲染）。两条分支都透传 `disabled`、`class`、`style`。字符串 child 渲染 `Button`；非字符串 child 可聚焦、可用键盘触发并带 role。
- **Content** 去掉 Root 持有的 props，popup 用 `popupSurface()`、modal 用 `modalSurface()`，主题定义了的再配 `overlayMotion(kind)`；只有当消费者的 hook 为 `undefined` 时才应用默认值。
- **Item** 适配 base 的 item，带焦点环，除非自己有默认值，否则透传状态样式。
- **装饰部件**（`Title`、`Description`、`Label`、`Shortcut`、`Header`、`Footer`）是文本部件：字符串 child 渲染带主题的 `Text`，其他原样渲染。
- **禁止：** import 另一个家族（R2）；为单个部件发明 disabled 外观；增加隐藏 Root / Trigger / Content 骨架的 helper，因为差异（reason 类型、Sub 部件、内容 slot）正是 bug 的所在。
- **可以不同：** popup 类型、是否有 slot 或 items、动效类型。

随 Family 配方一起定下的决定（随 `dialog` 与 `sheet` 迁移时落地）：`modalSurface()` 与 `popupSurface()` 一起放进 `theme`，供 `Dialog` 和 `Sheet` 用（modal 的圆角和 padding 不同；不新增 `overlayMotion` 种类，modal 动效仍由 base 持有）。`Dialog` 与 `Sheet` 的 Root 不再携带 Content 的 props（`animation`、`presentation`、`closeOnEscape`、`closeOnBackdropPress`、`closeOnSwipe`），它们移到 `Content`，不留别名。`createTriggerSlot` 改名为 `createSlot`。

## 文件内顺序

源码文件自上而下顺序固定，评审者总能在同一位置找到同样的东西。

**Leaf**

1. imports
2. 公开类型（props、variant 联合类型；每个都有文档，R7）
3. 私有常量与 helper（`TOUCH_TARGET`、`touchHitSlop`、有默认值时文件内的 `mergeStyle`）
4. `look()` —— 所有几何字面量，R5
5. `xVariants()` —— 纯函数，公开
6. 组件

**Family**

1. imports
2. 类型
3. context 及其 hook
4. chrome / `look`（表面、尺寸）
5. Root
6. Trigger
7. Content
8. Item（及 Sub 部件）
9. 装饰部件

## 改造方法

一个家族一个 commit，按这个循环：

1. 先写或补测试，并看到它失败（Leaf：reactive；Family：行为）。
2. 按配方改源码，对照下面的完成标准。
3. 更新文档页（固定章节）、gallery 演示和 `index.ts`。
4. `bun run registry:build`、`bun run check`，`public/r` 与源码一起提交。
5. 把该组件从白名单中移除（检查脚本存在之后）。
6. commit message 写明它使哪些规则达标。

剩余顺序：`toggle` + `toggle-group` → `switch`、`checkbox`、`radio-group` → `input`、`number-input`、`otp-input`、`slider`、`progress`、`avatar`、`link` → `dialog` + `sheet` → `select` + `combobox` → `collapsible`、`accordion`、`tabs`、`table`、`pagination`、`toast`。脚手架 skill 等 Leaf 各组迁完再写，让它固化已验证有效的做法。

### 完成标准（Definition of Done）

- [ ] R1–R8 成立；Leaf 或 Family 配方成立
- [ ] 遵循文件内顺序
- [ ] 文档页章节齐全，Differences 已填写
- [ ] 存在 gallery 演示，并在亮色和暗色下检查过
- [ ] 存在测试（reactive 或行为；有减少动效行为的控件要测）
- [ ] `public/r/<id>.json` 已重建并提交

### 检查

现状：`registry:build` 校验 `registryDependencies`，`bun run test:unit` 覆盖 CLI 的导入改写与 `theme.json` 合并，`bun run test:gallery` 覆盖组件与主题 helper；评审用的 grep 有三项：`mergeClass(undefined` / `mergeStyle(undefined`、对 `props` 的 `const {`、主题白名单之外的字面量时长。

颜色守门检查（`packages/cli/src/ui-guards.test.ts`，属于 `test:unit`）：`packages/ui/*.tsx` 或 `packages/theme/theme.ts` 里出现颜色字面量就失败（hex、`rgb(`、`rgba(`、`hsl(`、`oklch(`、命名色；`"transparent"` 放行，R5）。`scripts/recipes-allowlist.json` 是按规则豁免组件的**唯一**清单，只减不增，某个条目对应的文件已经不再违规时测试会失败。现在它是空的。

`bun run check:recipes`（属于 `bun run check`）运行同一个文件，并按组件检查迁移清单里可以机械判断的部分：没有 `mergeClass(undefined` / `mergeStyle(undefined`（R4）、没有解构 props（R3）、没有 `nsh` 文档之外的时长、每个导出都有 doc comment（R7）、文档页有 Install、Usage、API 和 Differences、gallery 里有点名该组件的测试。仍然不满足某条规则的组件都在白名单里，已迁移的组件不允许在。

## 视觉核对

一个家族只有在亮色和暗色两种外观下都看过，才算完成。`apps/gallery/pilot.tsx` 是试点页面（button 和 switch 的所有种类、尺寸和状态）；每个家族在 gallery 里有自己的页面。

```sh
bun run shots apps/gallery/pilot.tsx /tmp/shots pilot   # 生成 pilot-light.png 和 pilot-dark.png
```

`scripts/shots.sh` 用 `nsh test <entry> --target macos` 加 `app.setColorScheme` 和 `app.screenshot` 实现，需要“屏幕录制”和“辅助功能”权限。gallery 页面共用 `apps/gallery/demo-kit.tsx`（`Page`、`Panel`、`Row`、`Flow`）。
把两张图放进 PR，并与参考实现里同一个控件对照。核对靠人眼；截图不在 CI 里运行。

## 规则的迁移状态

| 状态   | 组件                                                                                                                                                                                                                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 已迁移 | Family 配方：`popover`、`tooltip`、`menu`、`context-menu`、`tabs`、`accordion`、`collapsible`、`pagination`、`select`、`combobox`、`dialog`、`sheet`、`toast`、`table`。Leaf 配方（按参考实现移植）：`button`、`switch`、`toggle`、`toggle-group`、`checkbox`、`radio-group`、`link`、`input`、`number-input`、`otp-input`、`progress`、`slider`、`avatar` |
| 未迁移 | 其余所有组件                                                                                                                                                                                                                                                                                                                                               |

共享的 `lib` 模块，都是第二个组件需要时才加的（R1）：`follow`（switch、checkbox、radio，以及 select 与 combobox 的 chevron）、`press`（button、toggle，以及 checkbox 与 radio 的 group sink；家族 7 的按下也用它、toast 的关闭）、`density`（button、switch、toggle、checkbox、radio、input、number-input、otp-input、select、combobox，以及 tabs、accordion、collapsible、link、pagination 的指针 / 触屏尺寸、popover、dialog、sheet、toast、slider、avatar）、`field`（input、number-input、otp-input 共用的边、凹陷和焦点）、`listbox`（select 与 combobox 共用的 chevron、行、弹层和触屏 sheet）、`meter`（progress、slider 共用的凹陷轨道和填充）。

## 组件内的动效

动效是组件的事，不属于主题：数值来自 `nsh` 自己的文档，每个组件在自己的 `look()` 或弹层旁边写所需的几行。这里没有任何东西是 `theme.json` 里的 token。多个组件必须手感一致的动效放进 `lib` 模块（`press`：按下的下沉与缓动；`density`：指针 / 触屏尺寸；第二个组件需要时才加，R1）；只用一次的几行留在组件里。

**本库不增加动效系统。** `nsh` 已经拥有这些原语并写明了数值（[Animation](https://nsh.dev/docs/animation)、Design Guides 的 “Motion”、各元素文档）。组件做四件事：（1）为每个场景选定 `nsh` 的原语，（2）只用 `nsh` 已记载的数值，（3）注入按家族区分的默认值，（4）按下文处理减少动效。

### Animation 的工具箱，以及我们在哪里用

它们都在 UI 线程运行，每帧不回调 JS；只有无法预先描述的东西才用 `requestAnimationFrame`。

| 工具（Animation 文档）                                                 | 我们的用法                                                                                               | 减少动效（nsh）                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Transitions**（`transitionProperty` 等）                             | 控件状态：hover、pressed、checked、selected、open。弹层出现 / 消失与 `starting*` / `ending*` hook 配合。 | 按写的播放。由**我们**选择更平静的替代（见下）。      |
| **Motion**（`createMotion`、`motions.*` 预设）                         | 内容入场、列表交错、校验提示（`shake`）、循环。只能 opt-in。                                             | 自动：motion 直接落在终点，不移动。退出仍以隐藏结束。 |
| **Layout animations**（`LayoutAnimation`）                             | 列表插入 / 删除 / 重排（`easeInEaseOut`、`spring`）。不用于展开面板。                                    | 按写的播放：`reduceMotion()` 时不调用。               |
| **Animated values**、**Keyframe animations**                           | 只用于必须跟随手势的值，或预设里没有的循环。凡是 transition 能表达的状态变化，一律不用。                 | 按写的播放。                                          |
| base 持有（`reveal`、`Dialog.animation`、sheet 滑入、Tabs 指示器弹簧） | Accordion / Collapsible 的高度展开、modal。透传或开关，不在外面再包一层动画。                            | 由 base 处理。                                        |

**一个场景只用一种原语。** 混用机制是重复动画和闪烁的起点。

| 场景                                                                                          | 原语                                              |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 控件状态（hover / pressed / checked / selected / open）                                       | Transitions                                       |
| 弹层出现 / 消失（`Popover`、`Menu`、`ContextMenu`、`Select`、`Combobox`、`Tooltip`、`Toast`） | `starting*` / `ending*` hook + transitions        |
| Modal（`Dialog`、`AlertDialog`、`Sheet`）                                                     | base 持有（`animation`、sheet 滑入）              |
| 高度展开（`Accordion`、`Collapsible`、`Tree`）                                                | base 的 `reveal`                                  |
| 内容入场、交错、提示、循环                                                                    | `createMotion` / `motions.*` / `Animated.stagger` |
| 布局插入 / 删除 / 重排                                                                        | `LayoutAnimation`                                 |

### 数值

- **我们发布的默认值使用白名单**： 时长 `100` / `120` / `150` / `180` / `200` / `300` ms；曲线 `ease-out` 和 `cubic-bezier(0.2, 0, 0, 1)`；属性组 `transition-colors` / `-opacity` / `-transform` / `transition`（style 路径要写明属性）。`transition-all` 只用于元素文档写了它的地方。新增数值需要 `nsh` 的来源并记入决策记录。
- **预设是 `nsh` 自己的数值**，不需要白名单条目：直接按名字用 `motions.fadeInUp`、`shake` 等。自定义关键帧需要在组件 Differences 里写理由。
- **优先 class，部件只接受 style 时才用 style。** 弹层、toast、chevron 通过 class hook 逐字照搬元素文档；控件和 base API 只有 `ViewStyle` 的部件用等价的 style。两者是同一机制。

### 减少动效

用户要求减少动效时 `reduceMotion()` 为 true。`nsh` 的要求：把大幅移动换成淡入或即时变化。

- **按压。** `button.tsx` 里的按压 helper 去掉 scale（位移），保留 ≤ 150 ms 的颜色 / 阴影渐变。这是预期做法，不是缺陷。
- **样式过渡** 只有在产生位移时才读 `reduceMotion()`。颜色渐变不需要归零。
- **Motion** 我们无需处理。只有当某个 motion 承载用户需要的含义（进度 spinner）时，才传 `ignoreReduceMotion: true`。
- **弹层与 modal** 由 base 持有：base 会立即显示和隐藏；这里不读 `reduceMotion()`。
- 返回 style 的 helper 是快照。`buttonVariants()` 之类必须在 `computed`（或其他响应式作用域）里调用，才能跟随该设置的变化。

### 控件状态

- **Hover：** 轻微的指针反馈，不能是唯一线索。只改填充并保持 rest 阴影；无位移、无缩放。
- **Pressed：** 即时反馈。所有 variant 都用 `pressed-opacity` 加 `scale(0.97)`；secondary 另外用 `finish.control.pressed`。
- **按压缩放**（`button.tsx` 里的 helper，需要时复制到用到它的控件）用于 `Button`、`Toggle` 和可按压的行。`Switch`、`Checkbox`、`RadioGroup`、`Input` 只用 `transition-colors`。
- **焦点：** outline 光晕不在任何过渡列表里。`border-color` 保留在过渡列表里，所以边框随 hover 颜色渐变，不会跳变。
- **可按压控件的过渡属性：** `background-color`、`border-color`、`box-shadow`、`opacity`（加上 `pressTransition` 的 `transform`），150 ms `ease-out`。
- 布局变化不通过 transition 动画；确实需要时用 `LayoutAnimation`。

### 默认值要窄

默认只开启：出现 / 消失、展开 / 收起、按压。内容入场、校验提示和循环都是 opt-in，用 `motions.*`（或 gallery 的原生循环）编写，不写新的关键帧。

- **入场列表：** 延迟 `Math.min(index, 10) * 60` ms，这样很靠后追加的行不用等；一组用 `Animated.stagger`。
- **删除一行：** `await row.play("fadeOutLeft")`，然后 `LayoutAnimation.easeInEaseOut()`，再移除。
- **无效字段：** `shake`（opt-in，绝不作默认）。

### 弹层

| 家族 / 组件                      | 默认（来源）                                                                                                                                            | 位置                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `Popover`                        | 150 ms，从 `opacity-0 scale-95`（popover.md）                                                                                                           | 在 `popover.tsx` 内联                       |
| `Menu`、`ContextMenu`            | 100 ms，从 `opacity-0 -translate-y-1`（menu.md）                                                                                                        | 在 `menu.tsx` 与 `context-menu.tsx` 内联    |
| `Tooltip`                        | 100 ms 淡入（tooltip.md）                                                                                                                               | 在 `tooltip.tsx` 内联                       |
| `Toast`                          | 200 ms，`opacity-0 translate-y-4` → `opacity-0 scale-95`（toast.md）                                                                                    | `toast.tsx`                                 |
| `Dialog`、`AlertDialog`、`Sheet` | base 的 `animation` / sheet 滑入                                                                                                                        | 仅透传                                      |
| `Accordion`、`Collapsible`       | `reveal`；chevron 150–200 ms `transition-transform`                                                                                                     | 两者默认用 `reveal`                         |
| `Input`、`NumberInput`           | `transition-colors`，150 ms（步进按钮 100 ms）                                                                                                          | class（`field.ts`；`motion-reduce` 可取消） |
| `Select`、`Combobox`             | **无入场 / 退场**：base 只暴露 `popupClass` / `popupStyle`，触屏 sheet 用 base 的动效。chevron 用 `follow` 的 control 弹簧；行的高亮是 `duration-100`。 | `listbox.tsx`；Differences 里注明           |
| `Progress`                       | 180 ms `translate` 滑动，`cubic-bezier(0.2, 0, 0, 1)`；不确定态循环带 `ignoreReduceMotion`                                                              | `progress.tsx`                              |

每个弹层内容部件用几行显式代码持有 `{ style, startingStyle, endingStyle }`。

### 注入与覆盖

只有当消费者的 hook 为 `undefined` 时才应用默认值；`null` 关闭默认；消费者设置了某个阶段就完整接管它（不通过拼接 class 来改时长，因为后写的 `duration-*` 不能可靠覆盖先写的）。样式阶段按 key 合并为 `[default, consumer]`，且只在存在默认值时才写。中断与连续性（弹层在退场中途重新打开、关闭的弹层等退场结束再离开）归 base；本库不保留 `closing` 状态。

## 被否决的方案

- 把 `mergeClass` / `mergeStyle` 移进 `theme`，或新增 `lib/merge.ts`：要么用非 token 工具扩大公开 API，要么为几行代码给每个组件加一个 registry 依赖。真正的问题是那些恒等调用。
- 为 Family 骨架做 `createPopupRoot` helper：差异（是否有 slot、Sub 部件、reason 类型）会让它的接口比它省下的重复更重。
- 从 `button` 推出一个统一配方：单部件控件没有 Root、Trigger 或 Content。
- spacing / size / 字体刻度的 token 层，以及把动效、按压、透明度做成 token 或 `theme.json` 的 `brand` 段：主题不是通用设计系统。这些值要么是 `nsh` 自己的（动效），要么是单个组件的内部细节（尺寸、色调），都不属于品牌；这次尝试引入了 JSON 导入、CLI 路径改写和合并步骤，已撤回。
- 第三种“有状态 leaf”配方，以及兼容路径（shadcn id、旧 `trigger`、旧的 Dialog/Sheet Root props）：会产生两个真源。
- 只收录品牌化条目（跳过轻量条目）、长期双 API：`add` 的覆盖面必须跟着 base。

## 决策记录

- 2026-11-10 —— 四份 ADR 合并进本 README 与 theme README，ADR 目录已删除。以后的新决策写在这里，每条一行并附原因。
- 2026-11-10 —— R5 改为最小值加 padding，不用固定尺寸。原因：NSH Coding Guides（“让文本容器随文本增长”）。
- 2026-11-10 —— 新增 R7（doc comment）与 R8（沿用 shadcn 的 variant 命名）。
- 2026-11-10 —— 组件包（六类产物）是迁移的完成标准。
- 2026-11-10 —— 按压手感和密度在第二个组件需要时抽成共享的 `lib` 模块。原因：参考实现里它们被多个 look 共用（R1：多个文件行为必须一致）。这细化了之前的“没有共享动效 helper”；只用一次的仍留在组件里。
- 2026-11-10 —— 主题只保存颜色、半径、阴影、焦点环和唯一的 disabled 外观；动效、尺寸、字体刻度和 variant 透明度留在使用它们的组件里。原因：它们是 `nsh` 的值或某个组件的内部细节，不是品牌，把它们做成 token 需要 `brand` 段、JSON 导入和 CLI 改写。gallery 夹具需要一个指向 `theme.json` 的 `tests/nsh.json`，因为 `nsh test` 读取入口文件旁边的 `nsh.json`，而自定义颜色 token（`custom-shadow-ink`、`custom-highlight`、`custom-backdrop`）就在那里。
- 2026-11-10 —— 字段焦点是贴在边上的 2pt `colors.ring`（`outlineOffset: -1`），不用 `focusRing()` 的 3px 外晕。原因：参考要把焦点画在 border 上，外晕会被 `overflow: hidden` 裁掉。hover 边用 `muted-foreground` 代替参考的 `faint`；凹陷用 `finish.control.pressed` 代替 `finish.field`。步进按钮的 disabled 用主题的 0.5，不用参考的 0.35。
- 2026-11-10 —— 列表选择：参考的 raised 用 `secondary` + `finish.control.rest`，faint 边用 `muted-foreground`，危险用 `destructive`，焦点沿用字段的 2pt ring。行的高亮只能走 `itemClass`（base 每个条目只画一次，没有 item 的状态 style）。按下用 `pressSink`，不用参考的 70% 透明度。禁用和行的 disabled 用 0.5，不用 0.4 / 0.35。勾用 `foreground`，因为 `accent` 在这套主题里是填充不是墨色。chevron 用 `follow` 的 control 弹簧。触屏弹层是底部 sheet（上圆角 20，最高 70%），指针弹层用 `popupSurface`。combobox 的边用 `focus-within` class，因为内联 `borderColor` 会压过 class，而 base 没有 `focusWithinStyle`。
- 2026-11-10 —— 家族 7 不新增 token。轨道用 `colors.muted` + `finish.control.pressed` 代替 gallery 的 `finish.track`，滑块用 `colors.background` + `finish.control.rest` 代替 `finish.thumb`，下划线用 `colors.primary`（gallery 的 accent 在这里是品牌色）。禁用一律 `disabledOpacity()`（0.5），不用参考实现的 0.4 / 0.35。链接没有 visited：主题没有 violet。原因：颜色只来自现有主题。
- 2026-11-11 —— 浮层按 `overlay.ts` 移植：tooltip 用 popover 表面而不是反色；toast 的凸起用 `card` + `finish.control.rest`；sheet 抓手用 `muted`（5 点药丸放不下控件阴影）；dialog / sheet 的 Root 不再转发 Content 的开关。原因：neutral 亮色下 `card` 与 `background` 相同，层次靠边和阴影；参考的 `raised` / `faint` 没有对应 token。
- 2026-11-10 —— 进度条和滑杆共用凹陷轨道：`muted`、内描边 `border`、`finish.control.pressed`（参考的 `colors.track` / `finish.track`）；填充是 `primary` 加 `finish.filled`，不用柑橘渐变。滑杆禁用仍是 0.5，不是参考的 0.35。头像首字母落在 `muted` 上，字用 `foreground`，边用 `border`。参考的按名字取色是另一套色板，不算进组件，也不加 `custom-*` 身份色；同样不新增 `up` / `warn` / `danger`。不确定进度的循环带 `ignoreReduceMotion`（参考在减少动效时停在中间），因为这段运动本身就是“仍在进行”。
