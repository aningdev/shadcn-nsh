---
title: Menu
description: A menu of items, separators and submenus on the shared menu look.
component: true
demo: menu
---

## Installation

```npm
npx shadcn-nsh@latest add menu
```

## Usage

```tsx
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
```

```tsx
<Menu>
  <MenuTrigger>File ▾</MenuTrigger>
  <MenuContent>
    <MenuItem onSelect={() => {}}>New</MenuItem>
  </MenuContent>
</Menu>
```

## Examples

### Checkbox and radio

```tsx
<MenuCheckboxItem checked={on} closeOnSelect={false} onSelect={toggle}>
  Show sidebar
</MenuCheckboxItem>
<MenuLabel>Sort by</MenuLabel>
<MenuRadioItem checked={sort === "Name"} onSelect={() => setSort("Name")}>
  Name
</MenuRadioItem>
```

### A destructive item

`variant="destructive"` puts the danger tone on the row's label, its note and its icon; `default` is the row as it is.

```tsx
<MenuItem variant="default" onSelect={() => {}}>New</MenuItem>
<MenuItem variant="destructive" onSelect={() => remove()}>Delete</MenuItem>
```

`MenuItemVariant` is `"default" | "destructive"`, and `menuItemLabel`, `menuItemNote` and `menuItemGlyph` take the same word.

### Submenu

```tsx
<MenuSub>
  <MenuSubTrigger>Share</MenuSubTrigger>
  <MenuSubContent>
    <MenuItem onSelect={() => {}}>Mail</MenuItem>
  </MenuSubContent>
</MenuSub>
```

### Names for screen readers

A string child is the row's label and its name for screen readers; `accessibilityLabel` wins when it should differ. Children drawn as given are named by the texts inside them.

## Differences from shadcn/ui

- No portal part (`DropdownMenuPortal` in shadcn): `nsh/base` draws the popup.
- No radio group part (`DropdownMenuRadioGroup` in shadcn): `MenuGroup` holds the rows, and each `MenuRadioItem` carries its own `checked`.
- No `asChild`: a string child of `MenuTrigger` is a `Button` (`variant`, `secondary` by default), anything else a pressable view.
- `onOpenChange` reports `{ open, reason }`.

## API

Looks are `menuItemLook`, `menuPopup`, `menuSeparator`, `MenuLabel`, `SubmenuRow` and `SubmenuBack` from the upstream menu look. Every prop of [`nsh/base` Menu](https://nsh.dev/elements/menu) on `MenuContent` passes through except open state and `trigger`.

| Part               | Props                                                                                    | Description                                         |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `Menu`             | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `onOpen`, `onClose`, `onCancel` | Open state and the trigger slot                     |
| `MenuTrigger`      | `children`, `variant`, `disabled`, `style`                                               | Registers the trigger; a string child is a `Button` |
| `MenuContent`      | every `nsh/base` Menu prop but open state and `trigger`; defaults bottom / start / 4     | The popup or sheet                                  |
| `MenuItem`         | every `nsh/base` MenuItem prop; `variant`, `inset`; a string child is the label          | A row                                               |
| `MenuCheckboxItem` | as `MenuItem`, plus `checked`                                                            | A checkable row                                     |
| `MenuRadioItem`    | as `MenuItem`, plus `checked`                                                            | One of a group                                      |
| `MenuLabel`        | `children`, `inset`                                                                      | A group's title                                     |
| `MenuSeparator`    | every `nsh/base` MenuSeparator prop                                                      | A hairline                                          |
| `MenuShortcut`     | `children`, `style`                                                                      | A trailing note                                     |
| `MenuSub`          | `children`, `disabled`                                                                   | A nested menu's root                                |
| `MenuSubTrigger`   | `children`, `inset`, `disabled`, `style`                                                 | The row that opens a submenu                        |
| `MenuSubContent`   | every `nsh/base` Submenu prop but `trigger`; `back` on a touch screen                    | The nested menu's popup                             |
