# 决定台账

本库已经定下的事（**Settled**）与记录在案、暂不做的（**Known and open**）。一行一条，各自带出处：ADR、`docs/specs/` 的某一节、PR、或 `AGENTS.md`。这是给 review 与代理读的清单，不是规范；理由长的两条在 [0001 主题契约 v2](0001-theme-contract-v2.md) 与 [0002 圆角按层](0002-radius-roles-by-layer.md)，机制与流程见 [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)、[`docs/port.md`](../port.md)，术语见 [`docs/GLOSSARY.md`](../GLOSSARY.md)。

- 审阅者与代理**不再把 Settled 里的条目当问题提出来**。提之前先看这张表；表里没有、也确实没定过的，才提。
- 一个 PR 定下一件事，就在对应分组里加一行，并更新文末的 `Last reviewed`。
- 表里的出处优先指规范与 PR，不指实现：代码会改，定下的事不会跟着改。

## Settled

### 分发与命名

- 一个组件一个文件，经 registry 复制进应用，复制后归应用所有；**不把组件作为 npm 包发布**。 — [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)「分发」；[`docs/specs/positioning.md`](../specs/positioning.md) §已有资产
- **不为旧 registry id 提供别名**：改名就是改名，旧→新只写在 `CHANGELOG.md` 的迁移说明里。 — [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)「分发」（_Avoid_: aliases for old registry ids）；[`CHANGELOG.md`](../../CHANGELOG.md) 的破坏性条目（[#126](https://github.com/aningdev/shadcn-nsh/pull/126) `editor`→`rich-editor`、[#138](https://github.com/aningdev/shadcn-nsh/pull/138) 删除 `textarea`、[#137](https://github.com/aningdev/shadcn-nsh/pull/137) `ToggleGroup` 并进 `toggle`）
- **不留兼容层**：旧 union 值直接删，交给编译期报错，不写运行时警告、过渡变量或旧格式分支。 — [`0001`](0001-theme-contract-v2.md)「后果」；[`api-unify.md` §6.2](../specs/api-unify.md)；[`design-tokens.md` §11](../specs/design-tokens.md) 第 3 条
- **部件名照 shadcn**（`Trigger` / `Content` / `Item` / `TabsTrigger` / `ToolbarButton` …），词表由测试固定。 — [#314](https://github.com/aningdev/shadcn-nsh/pull/314)；[`positioning.md`](../specs/positioning.md) §已有资产「API 一致」
- 外观轴用 shadcn 的名字与取值：`variant` / `size` / `tone`；**没有 `kind`**，像素尺寸叫 `side` / `width` / `height`。 — [`api-unify.md`](../specs/api-unify.md) §1–§4、§7
- **没有 `render` / `as` prop**：Trigger 收一个字符串（用本库 `Button`）或一个元素，作为触发器本身交给 `nsh/base`（它的 press / focus / open 状态落在该元素上，中间不加一层 view）；动作用 `onPress` + `role`，没有单独的动作 prop。 — [`packages/ui/popover.tsx`](../../packages/ui/popover.tsx):86,154；[`packages/ui/marker.tsx`](../../packages/ui/marker.tsx):111,138-144；[`packages/ui/bubble.tsx`](../../packages/ui/bubble.tsx):281
- 不给已有组件补 shadcn 有、本库没定的外观：Button 没有加 `outline` / `link`，新外观要新开参照页。 — [`api-unify.md` §7](../specs/api-unify.md) 第 2 条
- `variant="accent"` 删除（与 `default` 像素相同），`Badge` 的 `label` 改成 `children`，都不留旧名。 — [`api-unify.md` §7](../specs/api-unify.md) 第 1、8 条
- `size` 只表示刻度（`sm | default | lg`），不表示像素；`RoundButton` 同时收刻度和 `side` 的精确覆盖。 — [`api-unify.md` §7](../specs/api-unify.md) 第 6、7 条

### 主题

- **颜色只来自主题角色**：组件、`lib/`、演示适配层里不写字面量；例外只在行上写 `// color: <原因>`，由 `check:ui` 拦下。 — [`AGENTS.md`](../../AGENTS.md)「不做」；[`ARCHITECTURE.md` P3](../ARCHITECTURE.md)；[#313](https://github.com/aningdev/shadcn-nsh/pull/313)
- 角色按**层与语义**命名，不按组件命名；纯 alias 删除，按主题不同的选择移进该主题的 finish 或组件的行为维度。 — [`0001`](0001-theme-contract-v2.md) 决定 1
- NSH / shadcn 的 **31 个 A 层槽**（含 `sidebar-*`、`radius`）作为对外格式全部保留，源码里写成 alias，本库组件不读。 — [`0001`](0001-theme-contract-v2.md) 决定 2；[`theme-contract-v2.md` §10](../specs/theme-contract-v2.md) D1
- 平台固定的身份色（macOS 红绿灯）属于组件，这是 P3 的**唯一**例外。 — [`0001`](0001-theme-contract-v2.md) 决定 3
- 圆角收为 `control` / `container` / `modal` 三个层角色，另加按钮胶囊开关 `shape.corners.button`；内层圆角用 `rounded(outer, inset)` 同心推出，不设 inset 角色。 — [`0002`](0002-radius-roles-by-layer.md)；[#253](https://github.com/aningdev/shadcn-nsh/pull/253)、[#269](https://github.com/aningdev/shadcn-nsh/pull/269)
- **控件形态由组件画，主题只给六个按行为命名的维度** `dimension.control`（`selection` / `field` / `choice` / `track` / `handle` / `group`）；没有 `controls` 枚举，也没有组件预设表。 — [`theme-contract-v2.md` §11.1](../specs/theme-contract-v2.md)；[#293](https://github.com/aningdev/shadcn-nsh/issues/293)、[#313](https://github.com/aningdev/shadcn-nsh/pull/313)
- finish 收为 9 层 + 3 状态；阴影是每种外观最多 4 档的 elevation 刻度，平涂主题的渐变写 `null`。 — [`0001`](0001-theme-contract-v2.md) 决定 7；[`theme-contract-v2.md` §10](../specs/theme-contract-v2.md) D7
- 材质是 finish 上的枚举 `none | glass | acrylic`，配方集中在 `packages/theme`，每个配方都自带 fallback。 — [`0001`](0001-theme-contract-v2.md) 决定 8；[#267](https://github.com/aningdev/shadcn-nsh/pull/267)
- 主题例外写在各主题 `theme.tokens.json` 的 `$extensions` 里，脚本不按主题 id 分支；finish 字段要么都写、要么都不写。 — [#317](https://github.com/aningdev/shadcn-nsh/pull/317)
- **组件不点名主题**：没有 `Record<Controls>`、没有 `controls()`，不跟 `material` / `winui` / `apple` / `shadcn` / `solid-glass` 比较。 — [`ARCHITECTURE.md` P8](../ARCHITECTURE.md)；[#313](https://github.com/aningdev/shadcn-nsh/pull/313)
- 禁用与按下的强调色用透明度（`state`）推出，不新增 token。 — [`native-themes.md` §6](../specs/native-themes.md) 已决定 2
- 原生主题也进 registry（`theme-apple` / `theme-material` / `theme-winui`），复制后归应用所有。 — [`native-themes.md` §6](../specs/native-themes.md) 已决定 6
- 语义运行时产物不留旧格式兼容分支，`theme-merge` 直接按新结构合并。 — [`design-tokens.md` §11](../specs/design-tokens.md) 第 3 条

### 组件几何

- Switch 圆形档：knob 边长 = `icon.md`（`sm` 用 `icon.sm`），轨道 = knob + 4（`packages/ui/switch.tsx` 的 `CIRCLE_ROOM`）。 — [#319](https://github.com/aningdev/shadcn-nsh/pull/319)；[`theme-contract-v2.md` §12 M1](../specs/theme-contract-v2.md)；[`packages/ui/switch.tsx`](../../packages/ui/switch.tsx):46,164-165
- Calendar 日格边长 = `controlHeight.md`，方形日格与控件行一样高。 — [#319](https://github.com/aningdev/shadcn-nsh/pull/319)；[`theme-contract-v2.md` §12 M5](../specs/theme-contract-v2.md)；[`packages/ui/calendar.tsx`](../../packages/ui/calendar.tsx):55-60
- **Tabs 的侧内边距固定 8**（`TAB_PAD`），不读 `size.control.padding`（否则 winui 会是 6，标签挤）。 — [`theme-contract-v2.md` §12 M7、§19](../specs/theme-contract-v2.md) 第 3 条；[`packages/ui/tabs.tsx`](../../packages/ui/tabs.tsx):124-125
- Segmented 轨道高度读 `controlHeight` 档（`sm` 读 `height.sm`），像素由主题的 pointer / touch 档给。 — [#319](https://github.com/aningdev/shadcn-nsh/pull/319)；[`theme-contract-v2.md` §12 M3](../specs/theme-contract-v2.md)；[`packages/ui/segmented.tsx`](../../packages/ui/segmented.tsx):100
- 高度与图标各 3 档，间距在 4 的网格上，字阶不倒挂、行高为整数 px，弹簧 3 个；平台确有的例外要写出处。 — [`0001`](0001-theme-contract-v2.md) 决定 5；[#266](https://github.com/aningdev/shadcn-nsh/pull/266)
- Slider、Progress、Checkbox、Radio 在 `base` 档与参照逐像素一致，不设主题维度。 — [`theme-contract-v2.md` §12](../specs/theme-contract-v2.md) M2 / M4 / M6 / M8
- Switch 的 knob、Radio 的圆点、滚动条 thumb 缩放用 transform，不改几何。 — [#291](https://github.com/aningdev/shadcn-nsh/pull/291)；[`CHANGELOG.md`](../../CHANGELOG.md)
- 日历的 `today` / `cellShape` 不再给维度，回到 `base`，`mark` 删除。 — [`theme-contract-v2.md` §19](../specs/theme-contract-v2.md) 第 2 条
- 弹窗列表共用一组间距角色 `dimension.size.item.{pointer,touch}.{inset,pad}`（`lib/popup`）。 — [#282](https://github.com/aningdev/shadcn-nsh/pull/282)；[`CHANGELOG.md`](../../CHANGELOG.md)
- 触屏的最小点按区是 `dimension.size.hit.touch`，不小于 44（winui 的 40 在 `$extensions` 里写出处）；指针档为 0，即不因命中区外扩。 — [`theme-contract-v2.md` §15](../specs/theme-contract-v2.md)；[`theme-roles.md` §2b](../specs/theme-roles.md)；[`packages/theme/theme.ts`](../../packages/theme/theme.ts):928-929；[#266](https://github.com/aningdev/shadcn-nsh/pull/266)

### 流程

- 组件由本库**抽取并拥有**：上游 `nsh-gallery-ui` 是外观的参考规范与起点，`nsh/base` 管行为与无障碍（不改），shadcn 是分发与 API 命名的参照。 — [`AGENTS.md`](../../AGENTS.md)「各方角色」；[`positioning.md`](../specs/positioning.md) §定位
- `main` 受保护：一个改动一个分支（`<type>/<短描述>`）一个 PR，squash 合并，PR 标题即提交信息；bug 与新组件先有 issue，正文写 `Closes #N`。 — [`AGENTS.md`](../../AGENTS.md)「工作约定」；[`CONTRIBUTING.md`](../../CONTRIBUTING.md) §分支与 PR
- 一个家族一个 PR。 — [`AGENTS.md`](../../AGENTS.md)「工作约定」
- 开 PR 前 `port:check`、`nsh check apps/website/demos`、`port:render`、`vp check` 全部通过，四张截图人眼看过。 — [`AGENTS.md`](../../AGENTS.md)「工作约定」
- 新组件用 `bun run port:new` 起步，不从空文件或旧组件复制；`port:vendor` 只在新增组件时抽取初稿，不覆盖已有代码。 — [`AGENTS.md`](../../AGENTS.md)「工作约定」「常用命令」
- 上游变化由 `port:check` 提醒，审阅后 `port:review` 记录采纳或忽略；基线跟安装的 CLI 走，换版本用 `port:bump`。 — [`AGENTS.md`](../../AGENTS.md)「工作约定」；[`docs/toolchain.md`](../toolchain.md)
- 改 `registry.json` 或组件文件后运行 `bun run registry:build` 更新 `public/r`。 — [`AGENTS.md`](../../AGENTS.md)「工作约定」
- 演示适配层（`Stage` / `Split` / `Inspector` / `Panel` / `Log` / `Segmented`）只在 `apps/website/demos`，不进组件库，也不进 registry。 — [`AGENTS.md`](../../AGENTS.md)「不做」
- 不改 `nsh` / `nsh/base`；默认不在 submodule 内改代码或向上游提 PR（除非维护者明确要求），`references/**` 只读。 — [`AGENTS.md`](../../AGENTS.md)「不做」「References」
- 面向用户的改动在同一 PR 写进 `CHANGELOG.md` 的 `Unreleased`；只改内部工具、CI、测试的不用写。 — [`AGENTS.md`](../../AGENTS.md)「工作约定」；[`CONTRIBUTING.md`](../../CONTRIBUTING.md) §分支与 PR
- 起源于上游的文件在文件头一行致谢，代码本身归本库、可以直接改；来源只记在 `port-map.json`。 — [`AGENTS.md`](../../AGENTS.md)「各方角色」；[#290](https://github.com/aningdev/shadcn-nsh/pull/290)

## Known and open

记录在案，不在计划里；提的时候说清是这一条，不要当成新发现。

- **Agent bridge**：代理通过组件 API 读并驱动 UI，而不是看截图，带 confirm / secret 标注，照 Vercel UI SDK 的 `packages/core/src/page/agent` 那套。它属于 `nsh/base`，不属于本库；记录在案，不在计划里，最多作为上游建议。 — 只读参考里的 `references/ui-sdk/packages/core/src/page/agent`（`agent.ts` 与 `data-agent-confirm` / `data-agent-secret` 标注）
- `check:ui` 还应管住 import 方向与导出组件的 JSDoc，目前两条只靠 review 守。 — [#321](https://github.com/aningdev/shadcn-nsh/issues/321)
- #293 的六维方案已由 #313 落地，issue 本身还没关（记账，不是待办）。 — [#293](https://github.com/aningdev/shadcn-nsh/issues/293)
- 文档站：release 文档放根，`main` 放 `/dev`，用户读的版本和装的包对上。 — [#283](https://github.com/aningdev/shadcn-nsh/issues/283)
- `winui` 与 `material` 的 **class-B 缺口**：颜色、形状、焦点、动效已跟官方，部分组件仍是跨主题的同一套结构。 — [#235](https://github.com/aningdev/shadcn-nsh/issues/235)、[#233](https://github.com/aningdev/shadcn-nsh/issues/233)
- 上游提案 C1（系统强调色）与 C2（减透明度 / 提对比度）已写好，维护者决定前不发；原生主题的强调色先写死，等 C1。 — [#205](https://github.com/aningdev/shadcn-nsh/issues/205)；[`native-themes.md` §6](../specs/native-themes.md) 已决定 7
- `Pressable` 没有 `accessibilityHint`，按下缩放固定 0.98（上游 `nsh/base`）。 — [#122](https://github.com/aningdev/shadcn-nsh/issues/122)
- Combobox 的上游限制：没有单值模式；macOS 上点字段不开列表。 — [#87](https://github.com/aningdev/shadcn-nsh/issues/87)
- 尺寸与面不能分开选（只换尺寸不换面），暂按"一个主题是一套整体"处理。 — [`native-themes.md` §6](../specs/native-themes.md) 已决定 8

---

Last reviewed: PRs 108 to 319 (2026-11-20 to 2026-11-24), plus the ADRs, `docs/specs/` and `AGENTS.md` as of this commit. 更早的历史由 ADR、spec 与 `CHANGELOG.md` 覆盖。
