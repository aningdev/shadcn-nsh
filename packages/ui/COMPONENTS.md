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

This repo develops and deploys against the **published store CLI** (`curl …/install.sh | sh`, currently **0.3.0** / commit `76fa8a7`). Phase-1 only wraps `nsh/base` exports that release registers. Newer base components that exist on `nsh` main (Accordion, Select, Link, …) are **out of Phase-1** until a store release ships them — do not require `install.sh --source`.

## Phase-1 status (store `nsh` 0.3.0 ∩ core parity)

| website                                                             | `nsh/base`            | registry        | shadcn          | Status |
| ------------------------------------------------------------------- | --------------------- | --------------- | --------------- | ------ |
| [button](../../references/nsh/website/elements/button.md)           | `Button`              | `button`        | `button`        | done   |
| [input](../../references/nsh/website/elements/input.md)             | `Input`               | `input`         | `input`         | done   |
| [checkbox](../../references/nsh/website/elements/checkbox.md)       | `Checkbox`            | `checkbox`      | `checkbox`      | done   |
| [radio](../../references/nsh/website/elements/radio.md)             | `RadioGroup`, `Radio` | `radio-group`   | `radio-group`   | done   |
| [switch](../../references/nsh/website/elements/switch.md)           | `Switch`              | `switch`        | `switch`        | done   |
| [progress](../../references/nsh/website/elements/progress.md)       | `Progress`            | `progress`      | `progress`      | done   |
| [tabs](../../references/nsh/website/elements/tabs.md)               | `Tabs`, `Tab`         | `tabs`          | `tabs`          | done   |
| [popover](../../references/nsh/website/elements/popover.md)         | `Popover`             | `popover`       | `popover`       | done   |
| [tooltip](../../references/nsh/website/elements/tooltip.md)         | `Tooltip`             | `tooltip`       | `tooltip`       | done   |
| [sheet](../../references/nsh/website/elements/sheet.md)             | `Sheet`               | `sheet`         | `sheet`         | done   |
| [dialog](../../references/nsh/website/elements/dialog.md)           | `Dialog`              | `dialog`        | `dialog`        | done   |
| [menu](../../references/nsh/website/elements/menu.md)               | `Menu`, …             | `dropdown-menu` | `dropdown-menu` | done   |
| [menu](../../references/nsh/website/elements/menu.md)               | `ContextMenu`, …      | `context-menu`  | `context-menu`  | done   |
| [collapsible](../../references/nsh/website/elements/collapsible.md) | `Collapsible`         | `collapsible`   | `collapsible`   | done   |
| [toast](../../references/nsh/website/elements/toast.md)             | `Toast`, `ToastStack` | `toast`         | sonner / toast  | done   |
| [table](../../references/nsh/website/elements/table.md)             | `Table*`              | `table`         | `table`         | done   |

Also: registry `theme` (`theme.json` + `lib/theme.ts`), `popup-surface`.

## Requires newer store `nsh` (dropped from Phase-1)

Present on `nsh` **main** / website, **absent** from store CLI `0.3.0` `nsh/base` registry — removed from `@shadcn-nsh/ui`, registry, docs, demos, and gallery until a store release exports them:

| website / base      | Was registry   | Notes                                       |
| ------------------- | -------------- | ------------------------------------------- |
| Accordion\*         | `accordion`    | Missing on 0.3.0                            |
| Avatar, AvatarGroup | `avatar`       | Missing on 0.3.0                            |
| Combobox            | `combobox`     | Missing on 0.3.0                            |
| Link                | `link`         | Missing on 0.3.0 (overlaps prior Button PR) |
| NumberInput         | `number-input` | Missing on 0.3.0                            |
| OtpInput            | `otp-input`    | Missing on 0.3.0                            |
| Pagination          | `pagination`   | Missing on 0.3.0                            |
| Select              | `select`       | Missing on 0.3.0                            |
| Slider              | `slider`       | Missing on 0.3.0                            |
| Toggle              | `toggle`       | Missing on 0.3.0                            |
| ToggleGroup         | `toggle-group` | Missing on 0.3.0                            |

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

## Compound naming (shadcn-shaped facades)

Public Usage trees prefer shadcn part names. Internals still call `nsh/base` (items registries, `trigger` props, etc.).

| shadcn                          | This package                                                                                 | `nsh/base` under the hood                    |
| ------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Dialog / Trigger / Content / …  | `Dialog` / `DialogTrigger` / `DialogContent` / Header / Title / Description / Footer / Close | single `Dialog`; Content owns the base root  |
| Sheet / Trigger / Content / …   | same pattern                                                                                 | single `Sheet`                               |
| DropdownMenu\*                  | `DropdownMenu` / Trigger / Content / Item / Sub / …                                          | `Menu` / `MenuItem` / `Submenu`              |
| ContextMenu\*                   | same                                                                                         | `ContextMenu`                                |
| Popover / Trigger / Content     | composition; Header / Title / Description; legacy `trigger` kept; full base pass-through     | `Popover`                                    |
| Tooltip / Trigger / Content     | composition **or** string bubble for host `tooltip={}`                                       | `Tooltip` bubble                             |
| Tabs / List / Trigger / Content | `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (+ legacy `Tab`)                         | `Tabs` + `Tab`; panels are app/`TabsContent` |
| Collapsible / Trigger / Content | composition; legacy `content` prop kept                                                      | `Collapsible`                                |
| Toast / sonner                  | `toast()` + `Toaster` (+ `Toast` / `ToastStack` / `ToastManager`)                            | same                                         |
| Table\*                         | `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` / …           | same                                         |

## Adding a component

1. Confirm the export exists on the **store** CLI’s `nsh/base` (not only on `references/nsh` main).
2. Style `nsh/base` in `packages/ui/<name>.tsx` (tokens from `@shadcn-nsh/theme`).
3. Export from `packages/ui/index.ts`.
4. Register in `registry.json` (`registryDependencies: ["theme"]`, `target: components/ui/<name>.tsx`).
5. `bun run registry:build`.
6. Gallery (+ optional docs demo / page).
7. Update this file’s status column.
