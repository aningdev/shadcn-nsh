---
layout: ../../../layouts/Docs.astro
title: Menu
description: A menu of items, separators and submenus on the shared menu look.
component: true
demo: menu
---

## Installation

```sh
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
<MenuLabel text="Sort by" />
<MenuRadioItem checked={sort === "Name"} onSelect={() => setSort("Name")}>
  Name
</MenuRadioItem>
```

### Submenu

```tsx
<MenuSub>
  <MenuSubTrigger>Share</MenuSubTrigger>
  <MenuSubContent>
    <MenuItem onSelect={() => {}}>Mail</MenuItem>
  </MenuSubContent>
</MenuSub>
```

## API

Looks are `menuItemLook`, `menuPopup`, `menuSeparator`, `MenuLabel`, `SubmenuRow` and `SubmenuBack` from the upstream menu look. Every prop of [`nsh/base` Menu](https://nsh.dev/elements/menu) on `MenuContent` passes through except open state and `trigger`.

| Part                          | Notes                                      |
| ----------------------------- | ------------------------------------------ |
| `Menu`                        | Open state + trigger slot                  |
| `MenuTrigger`                 | Registers the trigger; string → Button     |
| `MenuContent`                 | Popup / sheet; defaults bottom / start / 4 |
| `MenuItem`                    | String → `menuItemLabel`; `danger`         |
| `MenuCheckboxItem`            | Checkable row                              |
| `MenuRadioItem`               | One of a group                             |
| `MenuLabel`                   | Group title (`text`)                       |
| `MenuSeparator`               | Hairline                                   |
| `MenuShortcut`                | Trailing note                              |
| `MenuSub` / Trigger / Content | Nested submenu                             |
