---
layout: ../../../layouts/Docs.astro
title: Dropdown Menu
description: Styled menu wrapping nsh/base Menu — theme tokens + Trigger / Content / Item; full base prop pass-through.
component: true
demo: dropdown-menu
demoHeight: 480
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns open state, focus, Escape / press-outside / backdrop dismiss, desktop popup vs phone sheet presentation, cascading `Submenu`, and the popup / backdrop hosts — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` tree (plus Item / CheckboxItem / Group / Label / Separator / Shortcut / Sub), popup surface chrome, and theme tokens, the same role a community library plays above `nsh/base`. A [`Menu`](https://nsh.dev/elements/menu) is a list of actions its trigger opens. Store CLI `nsh` 0.3.0 MenuItem has no `checked` / `indicator` — the wrapper paints a leading mark when `checked` is set; newer website docs may show native checkable items.

## Install

```bash
npx shadcn-nsh@latest add dropdown-menu
bunx shadcn-nsh@latest add dropdown-menu
pnx shadcn-nsh@latest add dropdown-menu
yarn dlx shadcn-nsh@latest add dropdown-menu
```

## Usage

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={() => {}}>Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

## Composition

```
DropdownMenu
├── DropdownMenuTrigger
└── DropdownMenuContent (nsh/base Menu)
    ├── DropdownMenuLabel (app)
    ├── DropdownMenuGroup (app)
    │   ├── DropdownMenuItem / CheckboxItem
    │   └── DropdownMenuShortcut (app)
    ├── DropdownMenuSeparator (nsh/base MenuSeparator)
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent (nsh/base Submenu)
```

## Controlled

```tsx
const open = signal(false);

<DropdownMenu open={open()} onOpenChange={(next) => open.set(next)}>
  <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => {}}>Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

## Placement

```tsx
<DropdownMenuContent placement="top" align="end" offset={8}>
  <DropdownMenuItem onSelect={() => {}}>Above, end-aligned</DropdownMenuItem>
</DropdownMenuContent>
```

## Checkbox item

Store `nsh` 0.3.0 has no MenuItem `checked` — the wrapper paints a ✓ when `checked` is set. Prefer `closeOnSelect={false}` so the menu stays open while the value flips.

```tsx
const sidebar = signal(true);

<DropdownMenuCheckboxItem
  checked={sidebar()}
  closeOnSelect={false}
  onSelect={() => sidebar.set(!sidebar())}
>
  <Text>Show sidebar</Text>
</DropdownMenuCheckboxItem>;
```

## Style override

Wrapper popup chrome (`popupSurface` + min width) and backdrop tint, then consumer styles shallow-merge on top (consumer wins per key). `class` / `popupClass` / `backdropClass` concatenate when both are set. Host and item style hooks also merge.

```tsx
<DropdownMenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
  <DropdownMenuItem style={{ height: 36 }} onSelect={() => {}}>
    <Text>Merged</Text>
  </DropdownMenuItem>
</DropdownMenuContent>
```

## Legacy trigger

```tsx
<DropdownMenu trigger={<Button>Menu</Button>} defaultOpen={false}>
  <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
</DropdownMenu>
```

## API

### `DropdownMenu` Props

| Prop            | Type                   | Default | Notes                                                                                   |
| --------------- | ---------------------- | ------- | --------------------------------------------------------------------------------------- |
| `open`          | `boolean \| null`      | —       | Controlled open (composition root or legacy single-root)                                |
| `defaultOpen`   | `boolean`              | `false` | Uncontrolled initial open                                                               |
| `trigger`       | `JSX.Element`          | —       | **Deprecated** legacy single-root; prefer `DropdownMenuTrigger` + `DropdownMenuContent` |
| `children`      | `JSX.Element`          | —       | Composition parts, or items when `trigger` is set                                       |
| `placement`     | `Placement`            | —       | Legacy path only — composition puts this on Content (default there `"bottom"`)          |
| `align`         | `Align`                | —       | Legacy path only — composition default on Content is `"start"`                          |
| `offset`        | `number`               | —       | Legacy path only — composition default on Content is `4`                                |
| `margin`        | `number`               | —       | Forwarded (legacy)                                                                      |
| `popupClass`    | `string`               | —       | Forwarded / merge (legacy)                                                              |
| `popupStyle`    | `StyleProp<ViewStyle>` | —       | Merged over popup chrome (legacy)                                                       |
| `backdropClass` | `string`               | —       | Forwarded / merge (legacy)                                                              |
| `backdropStyle` | `StyleProp<ViewStyle>` | —       | Merged over `popupBackdrop()` (legacy)                                                  |
| `class`         | `string`               | —       | Host class; concatenated (legacy)                                                       |
| `style`         | `StyleProp<ViewStyle>` | —       | Host style merge (legacy)                                                               |

Remaining `MenuProps` / `ComponentHostProps` from `nsh/base` also pass through on the legacy single-root.

### Events

| Event          | Notes                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `onOpenChange` | `(open: boolean, reason: OpenChangeReason) => void` — store CLI `nsh` 0.3.0 (not `{ open, reason }`) |
| `onOpen`       | `() => void` when shown                                                                              |
| `onClose`      | `() => void` when gone                                                                               |
| `onCancel`     | `() => void` when the user tries to dismiss without choosing (Escape / outside / backdrop)           |

### `DropdownMenuTrigger` Props

| Prop       | Type                    | Default | Notes                                           |
| ---------- | ----------------------- | ------- | ----------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | String → themed `Button`; else pressable `View` |
| `disabled` | `boolean`               | —       | Blocks open                                     |
| `class`    | `string`                | —       | On the pressable `View` (non-string children)   |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over `{ opacity }` when disabled         |

### `DropdownMenuContent` Props

| Prop            | Type                   | Default    | Notes                                                     |
| --------------- | ---------------------- | ---------- | --------------------------------------------------------- |
| `placement`     | `Placement`            | `"bottom"` | shadcn `side`                                             |
| `align`         | `Align`                | `"start"`  | shadcn default `align="start"` (Menu base also `"start"`) |
| `offset`        | `number`               | `4`        | shadcn `sideOffset`                                       |
| `margin`        | `number`               | —          | Forwarded                                                 |
| `popupClass`    | `string`               | —          | Concatenated after any wrapper class                      |
| `popupStyle`    | `StyleProp<ViewStyle>` | —          | Merged over surface chrome (`minWidth` / border / pad)    |
| `backdropClass` | `string`               | —          | Concatenated (phone sheet backdrop)                       |
| `backdropStyle` | `StyleProp<ViewStyle>` | —          | Merged over `popupBackdrop()`                             |
| `children`      | `JSX.Element`          | —          | Menu items                                                |
| `class`         | `string`               | —          | Host class; concatenated                                  |
| `style`         | `StyleProp<ViewStyle>` | —          | Host style merge                                          |
| `hoverStyle`    | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                         |
| `activeStyle`   | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                         |
| `focusStyle`    | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                         |
| `disabledStyle` | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                         |
| `classList`     | object                 | —          | Forwarded                                                 |
| `testID`        | string                 | —          | Forwarded                                                 |
| `tooltip`       | string                 | —          | Forwarded                                                 |
| `onLayout`      | function               | —          | Forwarded                                                 |
| `ref`           | ref                    | —          | Forwarded                                                 |

Remaining presentation `MenuProps` / `ComponentHostProps` from `nsh/base` also pass through. Open / `trigger` / lifecycle events come from the `DropdownMenu` context.

### `DropdownMenuItem` / `DropdownMenuCheckboxItem` Props

| Prop                            | Type              | Default | Notes                                                                               |
| ------------------------------- | ----------------- | ------- | ----------------------------------------------------------------------------------- |
| `disabled`                      | `boolean`         | —       | Forwarded                                                                           |
| `checked`                       | `boolean \| null` | —       | App-layer mark (store 0.3.0 has no MenuItem `checked`); CheckboxItem defaults false |
| `closeOnSelect`                 | `boolean`         | —       | Forwarded (base default `true`)                                                     |
| `accessibilityLabel`            | `string \| null`  | —       | Forwarded                                                                           |
| `onSelect`                      | `() => void`      | —       | Forwarded                                                                           |
| `children`                      | `JSX.Element`     | —       | Item content                                                                        |
| `class` / `style` / style hooks | —                 | —       | Merged over item chrome + `focusRing()` / accent hover                              |

### `DropdownMenuGroup` / `DropdownMenuLabel` / `DropdownMenuShortcut` Props

| Prop       | Type                    | Default | Notes                                   |
| ---------- | ----------------------- | ------- | --------------------------------------- |
| `children` | `string \| JSX.Element` | —       | Label / Shortcut wrap strings in `Text` |
| `class`    | `string`                | —       | Concatenated                            |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over token chrome                |

### `DropdownMenuSeparator` Props

All `MenuSeparatorProps` / `ComponentHostProps` from `nsh/base` — `class` / `style` merge over hairline chrome.

### `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` Props

| Prop        | Type          | Default | Notes                                                             |
| ----------- | ------------- | ------- | ----------------------------------------------------------------- |
| `trigger`   | `JSX.Element` | —       | **Deprecated** on Sub — prefer SubTrigger + SubContent            |
| `disabled`  | `boolean`     | —       | Forwarded on Sub / SubContent                                     |
| `back`      | `JSX.Element` | —       | Phone sheet “back” row — forwarded on Sub (legacy) / SubContent   |
| `children`  | `JSX.Element` | —       | Sub parts or nested items                                         |
| style hooks | —             | —       | Merged on Submenu host (`minWidth` default) and SubTrigger chrome |

## Differences

| Topic               | shadcn (`bases/base`)                             | This package                                                                             |
| ------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Parts               | Root / Trigger / Content / Item / Sub / Group / … | same names; Content is `nsh/base` `Menu`; SubContent is `Submenu`                        |
| Portal / Positioner | Base UI Portal + Positioner                       | base places the popup / sheet; no separate Portal export                                 |
| Positioning         | `side` / `sideOffset` / `align` / `alignOffset`   | base `placement` / `offset` / `align` (no `alignOffset` on store 0.3.0)                  |
| Radio items         | `DropdownMenuRadioGroup` / `RadioItem`            | no store radio role — use `checked` on Item / CheckboxItem (painted mark)                |
| Checkable items     | Base UI CheckboxItem indicator                    | store 0.3.0 MenuItem has no `checked` / `indicator`; wrapper paints ✓ when `checked` set |
| Change event        | Root `onOpenChange`                               | `(open, reason)` per store `nsh` 0.3.0; newer website docs may show `{ open, reason }`   |
| Enter / exit        | CSS animate classes                               | store 0.3.0 has no `popupStarting*` / `popupEnding*` / `onPosition`                      |
| Legacy              | —                                                 | deprecated `trigger` prop still mounts a single-root `Menu`                              |
| Class hooks         | `className` / `cn-dropdown-menu*`                 | `class` + `popupClass` / `backdropClass` / token styles; consumer merges over defaults   |

## Not forwarded

None for store CLI `nsh` 0.3.0 `Menu` / `MenuItem` / `MenuSeparator` / `Submenu` props — all are forwarded on Content / Item / Separator / Sub (open / lifecycle owned by the composition root). The wrapper only applies popup + backdrop chrome, item look, composition open state, and merges defaults under consumer style hooks (`class` / `popupClass` / `backdropClass` concatenate). App-layer `checked` on Item / CheckboxItem is not a base 0.3.0 prop (painted mark). Newer `nsh` main enter/exit / `onPosition` / native checkable MenuItem hooks are absent from 0.3.0 and therefore not part of this surface.
