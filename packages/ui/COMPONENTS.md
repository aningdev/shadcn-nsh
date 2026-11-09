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

This repo develops and deploys against the **published store CLI** (`curl …/install.sh | sh`, currently **0.4.0** / commit `e626a8d`). Phase-1 wraps `nsh/base` exports that release registers.

## Phase-1 status (store `nsh` 0.4.0 ∩ core parity)

| website                                                             | `nsh/base`            | registry       | shadcn         | Status |
| ------------------------------------------------------------------- | --------------------- | -------------- | -------------- | ------ |
| [button](../../references/nsh/website/elements/button.md)           | `Button`              | `button`       | `button`       | done   |
| [input](../../references/nsh/website/elements/input.md)             | `Input`               | `input`        | `input`        | done   |
| [checkbox](../../references/nsh/website/elements/checkbox.md)       | `Checkbox`            | `checkbox`     | `checkbox`     | done   |
| [radio](../../references/nsh/website/elements/radio.md)             | `RadioGroup`, `Radio` | `radio-group`  | `radio-group`  | done   |
| [switch](../../references/nsh/website/elements/switch.md)           | `Switch`              | `switch`       | `switch`       | done   |
| [progress](../../references/nsh/website/elements/progress.md)       | `Progress`            | `progress`     | `progress`     | done   |
| [tabs](../../references/nsh/website/elements/tabs.md)               | `Tabs`, `Tab`         | `tabs`         | `tabs`         | done   |
| [popover](../../references/nsh/website/elements/popover.md)         | `Popover`             | `popover`      | `popover`      | done   |
| [tooltip](../../references/nsh/website/elements/tooltip.md)         | `Tooltip`             | `tooltip`      | `tooltip`      | done   |
| [sheet](../../references/nsh/website/elements/sheet.md)             | `Sheet`               | `sheet`        | `sheet`        | done   |
| [dialog](../../references/nsh/website/elements/dialog.md)           | `Dialog`              | `dialog`       | `dialog`       | done   |
| [menu](../../references/nsh/website/elements/menu.md)               | `Menu`, …             | `menu`         | `menu`         | done   |
| [menu](../../references/nsh/website/elements/menu.md)               | `ContextMenu`, …      | `context-menu` | `context-menu` | done   |
| [collapsible](../../references/nsh/website/elements/collapsible.md) | `Collapsible`         | `collapsible`  | `collapsible`  | done   |
| [toast](../../references/nsh/website/elements/toast.md)             | `Toast`, `ToastStack` | `toast`        | sonner / toast | done   |
| [table](../../references/nsh/website/elements/table.md)             | `Table*`              | `table`        | `table`        | done   |
| [accordion](../../references/nsh/website/elements/accordion.md)   | `Accordion*`          | `accordion`    | `accordion`    | done   |
| [avatar](../../references/nsh/website/elements/avatar.md)         | `Avatar`, `AvatarGroup` | `avatar`     | `avatar`       | done   |
| [combobox](../../references/nsh/website/elements/combobox.md)     | `Combobox`            | `combobox`     | `combobox`     | done   |
| [link](../../references/nsh/website/elements/link.md)             | `Link`                | `link`         | `link`         | done   |
| [number-input](../../references/nsh/website/elements/number-input.md) | `NumberInput`     | `number-input` | `number-input` | done   |
| [otp-input](../../references/nsh/website/elements/otp-input.md)   | `OtpInput`            | `otp-input`    | `otp-input`    | done   |
| [pagination](../../references/nsh/website/elements/pagination.md) | `Pagination`          | `pagination`   | `pagination`   | done   |
| [select](../../references/nsh/website/elements/select.md)         | `Select`              | `select`       | `select`       | done   |
| [slider](../../references/nsh/website/elements/slider.md)         | `Slider`              | `slider`       | `slider`       | done   |
| [toggle](../../references/nsh/website/elements/toggle.md)         | `Toggle`              | `toggle`       | `toggle`       | done   |
| [toggle](../../references/nsh/website/elements/toggle.md)         | `ToggleGroup`         | `toggle-group` | `toggle-group` | done   |

Also: registry `theme` (`theme.json` + `lib/theme.ts`), `popup-surface`.

## Not in Phase-1 (still base / documented on main)

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

## Compound naming (nsh + composition roles)

Public names follow `nsh/base` symbols (`MenuTrigger`, not `DropdownMenuTrigger`). Composition roles are Trigger / Content / Item; roots hold open state only (**composition-only** — no consumer `trigger` on roots). Internals still wire `nsh/base` `trigger` on Content mounts.

| nsh / public family             | This package                                                                                                                           | `nsh/base` under the hood                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Dialog / Trigger / Content / …  | `Dialog` / `DialogTrigger` / `DialogContent` / Header / Title / Description / Footer / Close; full base prop + style-hook pass-through | single `Dialog`; Content owns the base root  |
| Sheet / Trigger / Content / …   | same pattern; full base prop + style-hook pass-through                                                                                 | single `Sheet`; Content owns the base root   |
| Menu\*                          | composition-only; Group / Label / Shortcut; full base pass-through on Content / Item / Sub                                             | `Menu` / `MenuItem` / `Submenu`              |
| ContextMenu\*                   | composition-only; Item/Sub/… re-export Menu parts                                                                                      | `ContextMenu`                                |
| Popover / Trigger / Content     | composition-only; Header / Title / Description; full base pass-through                                                                 | `Popover`                                    |
| Tooltip / Trigger / Content     | composition-only; standalone `TooltipContent` for host `tooltip={}`; Provider delay                                                    | `Tooltip` bubble                             |
| Tabs / List / Trigger / Content | `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (+ direct `Tab` export)                                                            | `Tabs` + `Tab`; panels are app/`TabsContent` |
| Collapsible / Trigger / Content | composition-only; optional base `reveal` on Content                                                                                   | `Collapsible`                                |
| Select / Trigger / Content      | composition-only; items register into base list                                                                                        | `Select`                                     |
| Combobox / Trigger / Content    | composition-only; multi-value                                                                                                          | `Combobox`                                   |
| Accordion / Item / Trigger      | composition-only (`AccordionPanel`)                                                                                                    | `Accordion*`                                 |
| Toast / sonner                  | `toast()` + `Toaster` (+ `Toast` / `ToastStack` / `ToastManager`); full base prop pass-through                                         | same                                         |
| Table\*                         | `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` / …                                                     | same                                         |
| RadioGroup / Item               | `RadioGroup` / `RadioGroupItem` (+ `Radio` alias)                                                                                      | `RadioGroup` + `Radio`                       |

## Adding a component

1. Confirm the export exists on the **store** CLI’s `nsh/base` (not only on `references/nsh` main).
2. Style `nsh/base` in `packages/ui/<name>.tsx` (tokens from `@shadcn-nsh/theme`).
3. Export from `packages/ui/index.ts`.
4. Register in `registry.json` (`registryDependencies: ["theme"]`, `target: components/ui/<name>.tsx`).
5. `bun run registry:build`.
6. Gallery (+ optional docs demo / page).
7. Update this file’s status column.
