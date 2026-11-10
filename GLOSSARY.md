# shadcn-nsh

NSH 上的 styled、copy-into-app 组件层：在 `nsh/base` 的行为与无障碍之上提供品牌外观，并通过 registry / CLI 分发进应用。

## Language

**Styled Component**:
以 Copy-into-app 交付的、对应某个 store 已导出 `nsh/base` 控件的源码单元；通常带品牌默认样式，并在单根复合控件上可选提供 Composition Facade。
_Avoid_: 包裹（口语可保留，书面用本词）, wrapper library, behavior reimplementation

**Composition Facade**:
把 `nsh/base` 的单根复合控件拆成可组合零件树（`Trigger` / `Content` / `Item` 等角色）；仅当 base 本身是复合形状时使用。零件**家族名跟 nsh/base**（如 `MenuTrigger`），不是 shadcn 的 `DropdownMenu*` 前缀。行为仍在 base。
_Avoid_: Radix port, new primitive layer, fake parts for parity, DropdownMenu* as public names

**Copy-into-app**:
通过 registry + CLI 把 Styled Component 源码拷进消费方仓库（通常落在 `@workspace/ui`），应用可直接改源码。
_Avoid_: npm component library（指消费主力路径）, black-box dependency

**Author Package**:
本仓 workspace 内的 `@shadcn-nsh/ui`：作者验真与 registry 源码宿主，不是终端应用的默认依赖方式。

**Registry Completeness**:
目标 store 的 `nsh/base` 导出应能在 registry 中 `add`；允许薄透传条目，不因「几乎无品牌决策」而空缺。薄条目仍须至少一处 theme / `token()` 默认挂钩，禁止纯 re-export。
_Avoid_: shadcn catalog parity（去留不靠 shadcn 有无对照）, bare re-export

**Behavior Authority**:
控件行为、a11y 与可转发能力以 `nsh/base` 为准。Composition Facade 只改组合形状与命名；抹不平的差异写进 Differences，不发明 base 没有的行为。
_Avoid_: shadcn-behavior port, hidden divergence

**Phase Queue**:
硬约束是当前 store 已导出；在该集合内按应用高频与 gallery 验真路径优先。shadcn 熟悉度可参考，不作准入门禁。

**Registry Name**:
`add` 名、落盘路径、文档导航与公开导出符号均由 `nsh/base` 符号推导（符号 → kebab 作 registry id；家族名用于 Composition 零件）。例：`Menu` → `menu` / `MenuTrigger`；`ContextMenu` → `context-menu`。旧 shadcn 形 id（如 `dropdown-menu`）硬断删除，不提供 alias。
_Avoid_: shadcn registry id（如 `dropdown-menu`）, mixed add-menu/import-DropdownMenu, permanent/temporary registry aliases

**Composition-only**:
复合 Styled Component 只提供 Composition Facade；Author Package、registry、gallery、docs 同步删除 legacy `trigger` / 旧 prop 双路径，不设长期 deprecated 窗。
_Avoid_: long-term dual API, legacy trigger path, staggered freeze-only

**Recipe**:
组件必须满足的结构与依赖规则集，分 leaf（单部件，模板 `button`）与 family（Composition Facade，模板 `popover`）两种；只约束结构，外观归 theme，行为归 `nsh/base`。见 [`packages/ui/README.zh.md`](packages/ui/README.zh.md) 的“配方”。
_Avoid_: 新增共享抽象层, 骨架 helper

**Theme Source**:
品牌色、半径、间距等默认的真源是 `theme.json`（经 `token()`）；组件文件只组合与合并，不另立并行真源。

**Reference Look**:
`references/nsh/examples/nsh-gallery-ui/look/*`：NSH 自己的共享视觉与状态设计（上游自述为内部层，不作为应用 API 发布）。本库把它**规范化移植**——取状态设计与几何，颜色换成 shadcn neutral，去掉外部耦合——并在文件头记录来源与基线提交（`64ab8a1d`）。
_Avoid_: 照搬品牌色, 自动同步上游, 把它当作 API 契约

**Extension**:
shadcn 有、但无对应 `nsh/base` 导出的零件（如 badge、card、label）；因无 base 导出而不进入 Registry Completeness。
_Avoid_: styled primitive, gallery demo chrome
