# Gallery gaps vs `references/nsh/examples/gallery`

对照参考侧栏 `groups`：下列项 **现在没有**（或不应有）本仓 gallery demo。  
原因分两类：**非本层**（primitives / 示例应用 / 平台示意）与 **UI 未包**（`nsh/base` 有、`@shadcn-nsh/ui` 尚未 styled；阶段见 [`packages/ui/COMPONENTS.md`](../../packages/ui/COMPONENTS.md)）。

UI 落地后：加 demo → 删本表对应行 → 更新 COMPONENTS.md。

## 状态：壳与 Phase-1 demos

| 项 | 状态 | 说明 |
| -- | ---- | ---- |
| Phone / Desktop 壳（nav、侧栏、DemoPage、lazy、rememberDemo） | **暂缓** | 目标见 [AGENTS.md](./AGENTS.md)；现为单页 `App.tsx` |
| Phase-1 `@shadcn-nsh/ui` 分屏 demos（约 27） | **暂缓** | Accordion…Tooltip；组件已有，缺 gallery 壳与拆页 |
| 本目录壳零件（Card / Appear / Press / 精简 Icon，不进 registry） | **暂缓** | 随壳一起做 |

## Apps（非本层）

| 参考 demo | 原因 |
| --------- | ---- |
| Stocks | 示例应用，非组件库验真 |
| AI Chat | 同上 |
| Photos | 同上（长列表基准） |

## Primitives（`nsh`，非 registry）

| 参考 demo | 原因 |
| --------- | ---- |
| Text | `nsh` 原语 |
| Image | 同上 |
| Scroll | 同上 |
| List | 同上 |
| Canvas | 同上 |
| Shader | 同上 |
| WebView and Video | 同上 |
| Overlay | 同上（overlay 原语；Popover/Sheet/Toast 等走 Components） |

## Components — UI 未包（后续补 `@shadcn-nsh/ui` 再开 demo）

| 参考 demo | 阻塞 | 计划阶段（COMPONENTS.md） |
| --------- | ---- | ------------------------- |
| ColorPicker | 无 `packages/ui` 导出 | Phase-2 |
| DatePicker（及 Calendar / TimeField） | 同上 | Phase-2 |
| DataTable | 同上 | Separate milestones |
| DiffView | 同上 | Separate milestones |
| Dock | 同上 | Separate milestones |
| Editor | 同上 | Separate milestones |
| NavStack | 壳用 `nsh/base`；不单独做 styled registry 项 | App shell |
| Plot | 同上 | Separate milestones |
| Resizable | 同上 | Phase-1.5 / later |
| RichEditor | 同上 | Separate milestones |
| TextView | 同上 | Separate milestones |
| Toolbar | 同上 | Phase-1.5 / later |

## Components — Phase-1 已有 UI、缺 gallery 拆页（随壳一起补）

Accordion, Avatar, Button, Checkbox, Collapsible, Combobox, Context menu, Dialog, Dropdown menu, Input, Link, NumberInput, OtpInput, Pagination, Popover, Progress, Radio, Select, Sheet, Slider, Switch, Table, Tabs, Toast, Toggle, ToggleGroup, Tooltip

（参考里 Menu 对应本库 `dropdown-menu` + `context-menu`。）

## Styling / Motion / Platform（非本层）

| 参考分组 | 参考 demo | 原因 |
| -------- | --------- | ---- |
| Styling | Styles, Tailwind, Patterns | 引擎 / 样式示意，非组件库契约 |
| Motion | Animations, Gestures, Physics, Collapsing header | 同上 |
| Platform | System, Storage, Standard APIs | 平台 API 示意；capabilities 演示非 UI 包职责 |

## 参考附属（不搬）

| 参考路径 | 原因 |
| -------- | ---- |
| `examples/nsh-gallery-ui` | 上游内部 styled 层；本仓用 `@shadcn-nsh/theme` + gallery 本地壳零件 |
| `gallery/tests`, `Bench.tsx`, `tools/`, `scripts/lucide.py` | 上游 QA / codegen；产品验真 gallery 后置或不需要 |
