---
layout: ../../../layouts/Docs.astro
title: Menu
description: Styled menu wrapping nsh/base Menu — theme tokens + Trigger / Content / Item; composition-only.
component: true
demo: menu
demoHeight: 480
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns open state, focus, Escape / press-outside / backdrop dismiss, desktop popup vs phone sheet presentation, cascading `Submenu`, and the popup / backdrop hosts — unstyled on every platform. This package is the styled layer: `Menu` / `MenuTrigger` / `MenuContent` (plus Item / CheckboxItem / RadioItem / Group / Label / Separator / Shortcut / Sub), popup surface chrome, and theme tokens. A [`Menu`](https://nsh.dev/elements/menu) is a list of actions its trigger opens. Rows are 26 points with a pointer and 46 on a touch screen; hover and the keyboard share the `accent` fill. Store `nsh` 0.4.0 `MenuItem` forwards `checked` / `indicator` / `role` to base; `MenuCheckboxItem` shows a check and `MenuRadioItem` a dot when no `indicator` is passed.

## Install

```npx tabs
npx shadcn-nsh@latest add menu
```

```bunx tabs
bunx shadcn-nsh@latest add menu
```

```pnx tabs
pnx shadcn-nsh@latest add menu
```

```yarn tabs
yarn dlx shadcn-nsh@latest add menu
```

## Usage

```tsx
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@workspace/ui/components/ui/menu";

<Menu>
  <MenuTrigger>Menu</MenuTrigger>
  <MenuContent>
    <MenuItem onSelect={() => {}}>Profile</MenuItem>
    <MenuSeparator />
    <MenuItem onSelect={() => {}}>Log out</MenuItem>
  </MenuContent>
</Menu>;
```

## Composition

```
Menu
├── MenuTrigger
└── MenuContent (nsh/base Menu)
    ├── MenuLabel (app)
    ├── MenuGroup (app)
    │   ├── MenuItem / CheckboxItem / RadioItem
    │   └── MenuShortcut (app)
    ├── MenuSeparator (nsh/base MenuSeparator)
    └── MenuSub
        ├── MenuSubTrigger
        └── MenuSubContent (nsh/base Submenu)
```

## Controlled

```tsx
const open = signal(false);

<Menu open={open()} onOpenChange={(next) => open.set(next)}>
  <MenuTrigger>Open menu</MenuTrigger>
  <MenuContent>
    <MenuItem onSelect={() => {}}>Profile</MenuItem>
    <MenuItem onSelect={() => {}}>Log out</MenuItem>
  </MenuContent>
</Menu>;
```

## Placement

```tsx
<MenuContent placement="top" align="end" offset={8}>
  <MenuItem onSelect={() => {}}>Above, end-aligned</MenuItem>
</MenuContent>
```

## Checkbox item

Prefer `closeOnSelect={false}` on checkable items so the menu stays open while the value flips.

```tsx
const sidebar = signal(true);

<MenuCheckboxItem
  checked={sidebar()}
  closeOnSelect={false}
  onSelect={() => sidebar.set(!sidebar())}
>
  <Text>Show sidebar</Text>
</MenuCheckboxItem>;
```

## Radio item

There is no radio-group part. The app checks one `MenuRadioItem` at a time; each uses `role="menuitemradio"` and a dot in the same slot as the check.

```tsx
<MenuRadioItem checked={sort() === "name"} onSelect={() => sort.set("name")}>
  <Text>Name</Text>
</MenuRadioItem>
```

## Style override

Wrapper popup chrome (the shared popup surface, at least 200 wide, or the touch sheet) and backdrop tint, then consumer styles shallow-merge on top (consumer wins per key). `class` / `popupClass` / `backdropClass` concatenate when both are set. Host and item style hooks also merge.

```tsx
<MenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
  <MenuItem style={{ height: 36 }} onSelect={() => {}}>
    <Text>Merged</Text>
  </MenuItem>
</MenuContent>
```

## API

### `Menu` Props

| Prop          | Type              | Default | Notes                                          |
| ------------- | ----------------- | ------- | ---------------------------------------------- |
| `open`        | `boolean \| null` | —       | Controlled open state                          |
| `defaultOpen` | `boolean`         | `false` | Uncontrolled initial open                      |
| `children`    | `JSX.Element`     | —       | `MenuTrigger`, `MenuContent`, and nested items |

Placement, popup chrome, and presentation props belong on `MenuContent`, not the root.

### Events

| Event          | Notes                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------ |
| `onOpenChange` | `(event: { open: boolean; reason: OpenChangeReason }) => void`                             |
| `onOpen`       | `() => void` when shown                                                                    |
| `onClose`      | `() => void` when gone                                                                     |
| `onCancel`     | `() => void` when the user tries to dismiss without choosing (Escape / outside / backdrop) |

### `MenuTrigger` Props

| Prop       | Type                    | Default | Notes                                                                  |
| ---------- | ----------------------- | ------- | ---------------------------------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | String → themed `Button`; else a focusable `View` with `role="button"` |
| `disabled` | `boolean`               | —       | Blocks open; follows later changes                                     |
| `class`    | `string`                | —       | On the `Button` (string) or the `View` (other children)                |
| `style`    | `StyleProp<ViewStyle>`  | —       | On the `Button` or the `View`; merged over `{ opacity }` when disabled |

### `MenuContent` Props

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

Remaining presentation `MenuProps` / `ComponentHostProps` from `nsh/base` also pass through. Open / `trigger` / lifecycle events come from the `Menu` context.

### `MenuItem` / `MenuCheckboxItem` / `MenuRadioItem` Props

| Prop                            | Type                | Default | Notes                                                                                           |
| ------------------------------- | ------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `disabled`                      | `boolean`           | —       | Forwarded                                                                                       |
| `checked`                       | `boolean \| null`   | —       | Forwarded to base `MenuItem`; CheckboxItem and RadioItem default false when omitted             |
| `role`                          | `AccessibilityRole` | —       | RadioItem sets `"menuitemradio"`; otherwise forwarded                                           |
| `closeOnSelect`                 | `boolean`           | —       | Forwarded (base default `true`)                                                                 |
| `accessibilityLabel`            | `string \| null`    | —       | Forwarded                                                                                       |
| `onSelect`                      | `() => void`        | —       | Forwarded                                                                                       |
| `children`                      | `JSX.Element`       | —       | Item content; text styles (13 / 16, one line) are inherited from the row                        |
| `class` / `style` / style hooks | —                   | —       | Merged over the row. Hover and keyboard use `accent`; pressed is a deeper fill; disabled is 0.5 |

### `MenuGroup` / `MenuLabel` / `MenuShortcut` Props

| Prop       | Type                    | Default | Notes                                                                         |
| ---------- | ----------------------- | ------- | ----------------------------------------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | Label / Shortcut wrap strings in `Text`                                       |
| `class`    | `string`                | —       | Concatenated                                                                  |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over the section label (11 / 13, semibold) or the shortcut (11.5 / 14) |

### `MenuSeparator` Props

All `MenuSeparatorProps` / `ComponentHostProps` from `nsh/base` — `class` / `style` merge over hairline chrome.

### `MenuSub` / `MenuSubTrigger` / `MenuSubContent` Props

| Prop        | Type          | Default | Notes                                                                                                    |
| ----------- | ------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `disabled`  | `boolean`     | —       | Forwarded on Sub / SubContent                                                                            |
| `back`      | `JSX.Element` | —       | Touch sheet back row. A string `MenuSubTrigger` supplies one when `back` is omitted; `null` turns it off |
| `children`  | `JSX.Element` | —       | Sub parts or nested items                                                                                |
| style hooks | —             | —       | SubTrigger uses the row chrome and a trailing chevron; the submenu popup inherits the menu's             |

## Differences

| Topic               | shadcn (`bases/base`)                             | This package                                                                                          |
| ------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Parts               | Root / Trigger / Content / Item / Sub / Group / … | same names; Content is `nsh/base` `Menu`; SubContent is `Submenu`                                     |
| Portal / Positioner | Base UI Portal + Positioner                       | base places the popup / sheet; no separate Portal export                                              |
| Positioning         | `side` / `sideOffset` / `align` / `alignOffset`   | base `placement` / `offset` / `align` (no `alignOffset` on store 0.4.0)                               |
| Radio items         | `MenuRadioGroup` / `RadioItem`                    | `MenuRadioItem` sets `role="menuitemradio"` and a dot; no group part — the app checks one             |
| Checkable items     | Radix CheckboxItem subtree                        | base `MenuItem` `checked` + `indicator`; default check or dot springs in when omitted                 |
| Row focus           | `focus:bg-accent`                                 | the same `accent` fill as hover, not `focusRing()` (a halo is clipped by the popup)                   |
| Disabled            | opacity utilities                                 | the theme's 0.5 on foreground text, not the reference's 0.35 and not a faint glyph under that opacity |
| Separator           | hairline                                          | `border` hairline; no groove — the theme has no `finish.groove`                                       |
| Touch surface       | sheet                                             | card fill, 20-point top corners; `popupSurface()` stays the pointer popup                             |
| Change event        | Root `onOpenChange`                               | `{ open, reason }` object events per store `nsh` 0.4.0                                                |
| Enter / exit        | CSS animate classes                               | 100 ms fade and a 4-point rise (`menu.md`); `null` turns a phase off. Not the reference 150 ms scale  |
| Composition-only    | optional single-root in some shadcn ports         | root holds open state only — use `MenuTrigger` + `MenuContent`                                        |
| Class hooks         | `className` / `cn-menu*`                          | `class` + `popupClass` / `backdropClass` / token styles; consumer merges over defaults                |

## Not forwarded

None for store CLI `nsh` 0.4.0 `Menu` / `MenuItem` / `MenuSeparator` / `Submenu` props — all are forwarded on Content / Item / Separator / Sub (open / lifecycle owned by the composition root). The wrapper only applies popup + backdrop chrome, item look, composition open state, and merges defaults under consumer style hooks (`class` / `popupClass` / `backdropClass` concatenate). Enter/exit animation hooks (`popupStarting*`, `onPosition`, …) pass through on `MenuContent` when set; this wrapper only supplies default popup chrome.
