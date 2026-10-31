# Components

This package is the **styled copy-into-app layer** on top of [`nsh/base`](https://nsh.dev/elements): behavior and a11y stay in base; we only add brand look via `theme.json` / `token()` helpers.

Authoritative base inventory and API shapes: [`references/nsh/website/elements`](../../references/nsh/website/elements) (`group: base`) and live demos `website/demos/el-*.tsx`. Primitives (`group: primitives`: `View`, `Text`, `Scroll`, …) live in `nsh` and are **not** registry items here.

## Layers

| Layer        | Home             | Role                                                      |
| ------------ | ---------------- | --------------------------------------------------------- |
| Primitives   | `nsh`            | Layout / draw / host                                      |
| Base         | `nsh/base`       | Unstyled controls (press, focus, a11y, value)             |
| This package | `@shadcn-nsh/ui` | Styled wrappers + registry for `shadcn-nsh add`           |
| Extensions   | —                | **Out of scope** (shadcn-only pieces with no base export) |

## Toolchain

Official docs track **main**. The published CLI tag `v0.3.0` is older; this repo develops against an `nsh` built from [`references/nsh`](../../references/nsh) so types match `website/elements`. Consumers on store `v0.3.0` may lack newer base exports until they upgrade.

## Phase-1 status (website `group: base` ∩ core parity)

| website                                                               | `nsh/base`              | registry        | shadcn          | Status |
| --------------------------------------------------------------------- | ----------------------- | --------------- | --------------- | ------ |
| [button](../../references/nsh/website/elements/button.md)             | `Button`                | `button`        | `button`        | done   |
| [input](../../references/nsh/website/elements/input.md)               | `Input`                 | `input`         | `input`         | done   |
| [checkbox](../../references/nsh/website/elements/checkbox.md)         | `Checkbox`              | `checkbox`      | `checkbox`      | done   |
| [radio](../../references/nsh/website/elements/radio.md)               | `RadioGroup`, `Radio`   | `radio-group`   | `radio-group`   | done   |
| [switch](../../references/nsh/website/elements/switch.md)             | `Switch`                | `switch`        | `switch`        | done   |
| [slider](../../references/nsh/website/elements/slider.md)             | `Slider`                | `slider`        | `slider`        | done   |
| [progress](../../references/nsh/website/elements/progress.md)         | `Progress`              | `progress`      | `progress`      | done   |
| [select](../../references/nsh/website/elements/select.md)             | `Select`                | `select`        | `select`        | done   |
| [combobox](../../references/nsh/website/elements/combobox.md)         | `Combobox`              | `combobox`      | `combobox`      | done   |
| [number-input](../../references/nsh/website/elements/number-input.md) | `NumberInput`           | `number-input`  | —               | done   |
| [otp-input](../../references/nsh/website/elements/otp-input.md)       | `OtpInput`              | `otp-input`     | `input-otp`     | done   |
| [tabs](../../references/nsh/website/elements/tabs.md)                 | `Tabs`, `Tab`           | `tabs`          | `tabs`          | done   |
| [toggle](../../references/nsh/website/elements/toggle.md)             | `Toggle`                | `toggle`        | `toggle`        | done   |
| [toggle](../../references/nsh/website/elements/toggle.md)             | `ToggleGroup`           | `toggle-group`  | `toggle-group`  | done   |
| [link](../../references/nsh/website/elements/link.md)                 | `Link`                  | `link`          | —               | done   |
| [pagination](../../references/nsh/website/elements/pagination.md)     | `Pagination`            | `pagination`    | `pagination`    | done   |
| [popover](../../references/nsh/website/elements/popover.md)           | `Popover`               | `popover`       | `popover`       | done   |
| [tooltip](../../references/nsh/website/elements/tooltip.md)           | `Tooltip`               | `tooltip`       | `tooltip`       | done   |
| [sheet](../../references/nsh/website/elements/sheet.md)               | `Sheet`                 | `sheet`         | `sheet`         | done   |
| [dialog](../../references/nsh/website/elements/dialog.md)             | `Dialog`                | `dialog`        | `dialog`        | done   |
| [menu](../../references/nsh/website/elements/menu.md)                 | `Menu`, …               | `dropdown-menu` | `dropdown-menu` | done   |
| [menu](../../references/nsh/website/elements/menu.md)                 | `ContextMenu`, …        | `context-menu`  | `context-menu`  | done   |
| [collapsible](../../references/nsh/website/elements/collapsible.md)   | `Collapsible`           | `collapsible`   | `collapsible`   | done   |
| [accordion](../../references/nsh/website/elements/accordion.md)       | `Accordion*`            | `accordion`     | `accordion`     | done   |
| [toast](../../references/nsh/website/elements/toast.md)               | `Toast`, `ToastStack`   | `toast`         | sonner / toast  | done   |
| [avatar](../../references/nsh/website/elements/avatar.md)             | `Avatar`, `AvatarGroup` | `avatar`        | `avatar`        | done   |
| [table](../../references/nsh/website/elements/table.md)               | `Table*`                | `table`         | `table`         | done   |

Also: registry `theme` (`theme.json` + `lib/theme.ts`).

## Not in Phase-1 (still base / documented)

| Kind           | website / base                                                | Reason                    |
| -------------- | ------------------------------------------------------------- | ------------------------- |
| Dates / color  | Calendar, TimeField, DatePicker, ColorPicker                  | Phase-2                   |
| Layout         | Resizable, Scrollbar, Toolbar                                 | Phase-1.5 / later         |
| Shell / system | NavStack, AlertDialog                                         | App shell / native alerts |
| Heavy          | Editor, RichEditor, DiffView, TextView, DataTable, Dock, Plot | Separate milestones       |

## Extensions (intentionally not built)

shadcn has these; **no** matching `nsh/base` / website `group: base` export → we do **not** add them as registry UI:

`badge`, `card`, `label`, `separator`, `hover-card`, `skeleton`, `aspect-ratio`, …

Compose labels with `Text` + controls; separators with `View` borders if needed.

## Compound naming (shadcn-shaped facades)

Public Usage trees prefer shadcn part names. Internals still call `nsh/base` (items registries, `trigger` props, etc.).

| shadcn                                    | This package                                                                                 | `nsh/base` under the hood                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Dialog / Trigger / Content / …            | `Dialog` / `DialogTrigger` / `DialogContent` / Header / Title / Description / Footer / Close | single `Dialog`; Content owns the base root  |
| Sheet / Trigger / Content / …             | same pattern                                                                                 | single `Sheet`                               |
| Select / Trigger / Value / Content / Item | composition **or** data `items[]`                                                            | `Select` + `items` + `trigger`               |
| Combobox / …                              | same                                                                                         | `Combobox` + `items`                         |
| DropdownMenu\*                            | `DropdownMenu` / Trigger / Content / Item / Sub / …                                          | `Menu` / `MenuItem` / `Submenu`              |
| ContextMenu\*                             | same                                                                                         | `ContextMenu`                                |
| Popover / Trigger / Content               | composition; legacy `trigger` prop kept                                                      | `Popover`                                    |
| Tooltip / Trigger / Content               | composition **or** string bubble for host `tooltip={}`                                       | `Tooltip` bubble                             |
| Tabs / List / Trigger / Content           | `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (+ legacy `Tab`)                         | `Tabs` + `Tab`; panels are app/`TabsContent` |
| Accordion / Item / Trigger / Content      | `Accordion*` + `AccordionContent` (= `AccordionPanel`) + `AccordionHeader`                   | same parts                                   |
| Collapsible / Trigger / Content           | composition; legacy `content` prop kept                                                      | `Collapsible`                                |
| Toast / sonner                            | `toast()` + `Toaster` (+ `Toast` / `ToastStack` / `ToastManager`)                            | same                                         |
| Table\*                                   | `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` / …           | same                                         |

## Adding a component

1. Style `nsh/base` in `packages/ui/<name>.tsx` (tokens from `@shadcn-nsh/theme`).
2. Export from `packages/ui/index.ts`.
3. Register in `registry.json` (`registryDependencies: ["theme"]`, `target: components/ui/<name>.tsx`).
4. `bun run registry:build`.
5. Gallery (+ optional docs demo / page).
6. Update this file’s status column.
