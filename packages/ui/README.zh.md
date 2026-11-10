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

## 新增组件

1. 确认导出存在于 **store** CLI 的 `nsh/base`（不只是 `references/nsh` main）。
2. 在 `packages/ui/<name>.tsx` 给 `nsh/base` 加样式（token 来自 `@shadcn-nsh/theme`）。
3. 从 `packages/ui/index.ts` 导出。
4. 写入 `registry.json`（`registryDependencies: ["theme"]`，`target: components/ui/<name>.tsx`）。
5. `bun run registry:build`。
6. Gallery（+ 可选 docs demo / 页面）。
7. 更新本 README 的状态列。
