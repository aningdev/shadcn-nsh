---
layout: ../../../layouts/Docs.astro
title: Context Menu
description: Styled context menu wrapping nsh/base ContextMenu — theme tokens + Trigger / Content / Item; full base prop pass-through.
component: true
demo: context-menu
demoHeight: 480
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns open state, secondary-click / long-press open, focus, Escape / press-outside / backdrop dismiss, desktop popup vs phone sheet presentation, cascading `Submenu`, and the popup / backdrop hosts — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `ContextMenu` / `ContextMenuTrigger` / `ContextMenuContent` tree (plus Item / CheckboxItem / RadioItem / Group / Label / Separator / Shortcut / Sub), the same row look as `menu`, and theme tokens. A [`ContextMenu`](https://nsh.dev/elements/menu) is the menu that opens about its trigger — right-click at the pointer on desktop, or a held finger as a sheet on touch. Checkbox and radio items are the menu parts, re-exported.

## Install

```npx tabs
npx shadcn-nsh@latest add context-menu
```

```bunx tabs
bunx shadcn-nsh@latest add context-menu
```

```pnx tabs
pnx shadcn-nsh@latest add context-menu
```

```yarn tabs
yarn dlx shadcn-nsh@latest add context-menu
```

## Usage

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@workspace/ui/components/ui/context-menu";

<ContextMenu>
  <ContextMenuTrigger>
    <View>Right-click me</View>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => {}}>Copy</ContextMenuItem>
    <ContextMenuItem onSelect={() => {}}>Paste</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>;
```

## Composition

```
ContextMenu
├── ContextMenuTrigger
└── ContextMenuContent (nsh/base ContextMenu)
    ├── ContextMenuLabel (app)
    ├── ContextMenuGroup (app)
    │   ├── ContextMenuItem / CheckboxItem / RadioItem
    │   └── ContextMenuShortcut (app)
    ├── ContextMenuSeparator (nsh/base MenuSeparator)
    └── ContextMenuSub
        ├── ContextMenuSubTrigger
        └── ContextMenuSubContent (nsh/base Submenu)
```

Item / CheckboxItem / RadioItem / Group / Label / Separator / Shortcut / Sub parts are the same implementations as Menu (re-exported aliases).

## Controlled

```tsx
const open = signal(false);

<ContextMenu open={open()} onOpenChange={(next) => open.set(next)}>
  <ContextMenuTrigger>
    <View>Right-click me</View>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => {}}>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>;
```

## Offset

Desktops: gap between the pointer and the popup. Default `4`.

```tsx
<ContextMenuContent offset={8}>
  <ContextMenuItem onSelect={() => {}}>Copy</ContextMenuItem>
</ContextMenuContent>
```

## Checkbox item

Prefer `closeOnSelect={false}` on checkable items so the menu stays open while the value flips.

```tsx
const sidebar = signal(true);

<ContextMenuCheckboxItem
  checked={sidebar()}
  closeOnSelect={false}
  onSelect={() => sidebar.set(!sidebar())}
>
  <Text>Show sidebar</Text>
</ContextMenuCheckboxItem>;
```

## Style override

Wrapper popup chrome (`popupSurface` + min width) and backdrop tint, then consumer styles shallow-merge on top (consumer wins per key). `class` / `popupClass` / `backdropClass` concatenate when both are set. Host and item style hooks also merge.

```tsx
<ContextMenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
  <ContextMenuItem style={{ height: 36 }} onSelect={() => {}}>
    <Text>Merged</Text>
  </ContextMenuItem>
</ContextMenuContent>
```

## API

### `ContextMenu` Props

| Prop       | Type              | Default | Notes                                                        |
| ---------- | ----------------- | ------- | ------------------------------------------------------------ |
| `open`     | `boolean \| null` | —       | Controlled open state                                        |
| `disabled` | `boolean`         | —       | Secondary click / long-press do nothing                      |
| `children` | `JSX.Element`     | —       | `ContextMenuTrigger`, `ContextMenuContent`, and nested items |

Offset, popup chrome, and backdrop props belong on `ContextMenuContent`, not the root. Store 0.4.0 has no `defaultOpen` / `placement` / `align` on ContextMenu (pointer-anchored).

### Events

| Event          | Notes                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------ |
| `onOpenChange` | `(event: { open: boolean; reason: OpenChangeReason }) => void`                             |
| `onOpen`       | `() => void` when shown                                                                    |
| `onClose`      | `() => void` when gone                                                                     |
| `onCancel`     | `() => void` when the user tries to dismiss without choosing (Escape / outside / backdrop) |

### `ContextMenuTrigger` Props

| Prop       | Type                   | Default | Notes                                              |
| ---------- | ---------------------- | ------- | -------------------------------------------------- |
| `children` | `JSX.Element`          | —       | The surface that receives secondary click / hold   |
| `class`    | `string`               | —       | Optional wrap `View` when set with / without style |
| `style`    | `StyleProp<ViewStyle>` | —       | Optional wrap `View` when set with / without class |

### `ContextMenuContent` Props

| Prop            | Type                   | Default | Notes                                                  |
| --------------- | ---------------------- | ------- | ------------------------------------------------------ |
| `offset`        | `number`               | `4`     | Desktop gap from the pointer                           |
| `margin`        | `number`               | —       | Forwarded                                              |
| `popupClass`    | `string`               | —       | Concatenated after any wrapper class                   |
| `popupStyle`    | `StyleProp<ViewStyle>` | —       | Merged over surface chrome (`minWidth` / border / pad) |
| `backdropClass` | `string`               | —       | Concatenated (phone sheet backdrop)                    |
| `backdropStyle` | `StyleProp<ViewStyle>` | —       | Merged over `popupBackdrop()`                          |
| `children`      | `JSX.Element`          | —       | Menu items                                             |
| `class`         | `string`               | —       | Host class; concatenated                               |
| `style`         | `StyleProp<ViewStyle>` | —       | Host style merge                                       |
| `hoverStyle`    | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                      |
| `activeStyle`   | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                      |
| `focusStyle`    | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                      |
| `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                      |
| `classList`     | object                 | —       | Forwarded                                              |
| `testID`        | string                 | —       | Forwarded                                              |
| `tooltip`       | string                 | —       | Forwarded                                              |
| `onLayout`      | function               | —       | Forwarded                                              |
| `ref`           | ref                    | —       | Forwarded                                              |

Remaining presentation `ContextMenuProps` / `ComponentHostProps` from `nsh/base` also pass through. Open / `trigger` / `disabled` / lifecycle events come from the `ContextMenu` context.

### `ContextMenuItem` / `ContextMenuCheckboxItem` Props

Same as Menu Item / CheckboxItem / RadioItem — the row look (accent hover and keyboard highlight, deeper press, 0.5 disabled), a check or a dot, and style-hook merge.

### `ContextMenuGroup` / `ContextMenuLabel` / `ContextMenuShortcut` / `ContextMenuSeparator` / `ContextMenuSub*` Props

Same as the Menu aliases — see Menu API. Separator forwards all `MenuSeparatorProps`; Sub / SubContent forward `SubmenuProps` with style merge.

## Differences

| Topic               | shadcn (`bases/base`)                             | This package                                                                                      |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Parts               | Root / Trigger / Content / Item / Sub / Group / … | same names; Content is `nsh/base` `ContextMenu`; SubContent is `Submenu`                          |
| Portal / Positioner | Base UI Portal + Positioner                       | base places the popup / sheet; no separate Portal export                                          |
| Positioning         | `side` / `sideOffset` / `align` / `alignOffset`   | store 0.4.0 ContextMenu is pointer-anchored — only `offset` / `margin` (no `placement` / `align`) |
| Radio items         | `ContextMenuRadioGroup` / `RadioItem`             | `ContextMenuRadioItem` — the menu's dot row; no group part                                        |
| Checkable items     | Radix CheckboxItem subtree                        | same check mark as `MenuCheckboxItem`                                                             |
| Row focus           | `focus:bg-accent`                                 | the menu row's `accent` fill, not `focusRing()`                                                   |
| Touch surface       | sheet                                             | the menu's card sheet, not `popupSurface()`                                                       |
| Change event        | Root `onOpenChange`                               | `{ open, reason }` object events per store `nsh` 0.4.0                                            |
| Enter / exit        | CSS animate classes                               | the menu's 100 ms fade and 4-point rise; `null` turns a phase off                                 |
| Shared parts        | separate file, shared look                        | Item / RadioItem / Label / Separator / Sub / Group / Shortcut re-export Menu                      |
| Composition-only    | optional single-root in some shadcn ports         | root holds open state only — use `ContextMenuTrigger` + `ContextMenuContent`                      |
| Class hooks         | `className` / `cn-context-menu*`                  | `class` + `popupClass` / `backdropClass` / token styles; consumer merges over defaults            |

## Not forwarded

None for store CLI `nsh` 0.4.0 `ContextMenu` / `MenuItem` / `MenuSeparator` / `Submenu` props — all are forwarded on Content / Item / Separator / Sub (open / lifecycle / `disabled` owned by the composition root). The wrapper only applies popup + backdrop chrome, item look, composition open state, and merges defaults under consumer style hooks (`class` / `popupClass` / `backdropClass` concatenate). Enter/exit animation hooks pass through on `ContextMenuContent` when set; this wrapper only supplies default popup chrome.
