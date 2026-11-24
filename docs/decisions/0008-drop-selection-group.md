# 0008 删掉 `selection` 与 `group` 两个控件维度

- 日期：2026-11-24
- 状态：已采纳（2026-11-24）
- 落实：[0007](0007-theme-customization-scope.md) 第 3 节（#380）
- 规范：[`docs/specs/theme-contract-v2.md`](../specs/theme-contract-v2.md) 第 11 节、[`docs/specs/native-themes.md`](../specs/native-themes.md) 第 3.6 节

## 背景

0007 第 3 节把 `tabs`、`segmented`、`sidebar` 归入“降级到全局风格”：平台主题不为它们写配方，与原生的差别记进差异表。可契约里还留着 `dimension.control.selection`（`pill` / `plate` / `underline` / `bar`）与 `dimension.control.group`（`track` / `capsule` / `cells`）——这两个维度只服务这三个组件，六个维度里它们占了一半的取值。

契约留着，就会有人来用：`material` 写了 `selection: underline`、`group: cells`，`winui` 写了 `selection: bar`，`apple` 写了 `selection: plate`、`group: capsule`，`shadcn` 与 `solid-glass` 各写了 `selection: plate`。三个组件因此在每套主题下画两种到四种形态：标签页是胶囊或下划线，分段控件是沟槽、胶囊套胶囊或 M3 连格，侧栏选中是填充或左侧竖条。读起来不像同一套组件，也让 0007 的“降级”落不下去——维度还在，降级只是没人写值而已。

## 决定

**删掉 `dimension.control.selection` 与 `dimension.control.group`，连同它们的取值；控件维度只剩四个：`field`、`choice`、`track`、`handle`。标签页、分段控件与侧栏各画一种形态，就是 `default` 现在画的那一种。**

| 组件       | 删掉后画的形态                                                        | 读的全局角色                                                           |
| ---------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 标签页     | 标签行是一条 `channel` 沟槽，选中项是 `plate` 面，外圆角 = 行高的一半 | `finish.channel`、`finish.plate`、`stroke.control`、`controlSize.tabs` |
| 分段控件   | 同上：沟槽轨道 + `plate` 滑块，滑块与格同尺寸                         | `finish.channel`、`finish.plate`、`stroke.control`                     |
| 侧栏选中项 | 整行铺 `sidebar-accent`，栏线（`SidebarRail`）2 点宽                  | `sidebarAccent`、`stroke.control`                                      |

- `TabsList` 的 `variant="line"` 留下：它不是主题维度，是应用可以自己点的第二种外观，几何写死在 `underlineTabsLook()`（2 点宽品牌色下划线、`shape.control` 圆角），与上游 `nsh-gallery-ui` 的同名 look 一致。
- 分段控件的 `check`、`selectedStyle` 与 `segment(state, first)` 的第二个参数一并删掉：它们只服务 `cells` 形态。
- 各平台主题里删掉 `selection` / `group` 的覆写，`material`、`winui` 的控件维度收成四档（`material`：`underline` / `outline` / `tint` / `circle`；`winui`：`box-underline` / `inset` / `hairline` / `ring`）。
- 差异表（`native-themes.md` 第 3.6 节）新增七行，记下这三处降级：material 的标签页、分段控件、侧栏选中项，winui 的三处，apple 的分段控件。

## 后果

- `default` 的渲染逐像素不变（三个组件本来画的就是这一种形态）。
- 其余五套主题在这三个组件上各只画一种形态；`shadcn`、`solid-glass` 与 `default` 从此在控件维度上完全一致。
- 契约少两个键、七个取值；`theme` 包的 `Selection`、`Group` 类型与 `CONTROL_DIMENSIONS` 相应收成四个，`packages/ui/lib/look.ts` 少两个 look 工厂（`selectionLook`、`groupLook`）和四个形状类型。
- 主题再想要“平台自己的标签页”，只能先改 0007 与本文——不会因为在维度里选一档就悄悄长出来。

## 不采纳的方案

- **把这两个维度改名成 `indicator` / `joined`，只给关键组件用。** 问题是同一个：只服务三个已经决定降级的组件，改名只是把代价推到下次讨论。
- **保留维度、只让平台主题不写值。** 契约里留着可选值，就等于承诺支持；`material` 的 `cells` 已经写进文档与演示，留着就得继续维护两条绘制路径。
- **在维度里再分一层“只对 `default` 生效的形态”。** 主题不该有“基础套专用”的键；`default` 的形态就是全局风格下该长得的样子，写进组件自己的 look 即可。
- **一次性删掉 `TabsList` 的 `variant`。** 上游与 shadcn 都有下划线标签页（`underlineTabsLook`、`TabsList variant="line"`），它不依赖主题，删掉是另一件事。
