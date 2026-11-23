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

## Composition

Use the following composition to build a `Menu`:

```text
Menu
├── MenuTrigger
└── MenuContent
    ├── MenuGroup
    │   ├── MenuLabel
    │   ├── MenuItem
    │   │   └── MenuShortcut
    │   ├── MenuCheckboxItem
    │   └── MenuRadioItem
    ├── MenuSeparator
    └── MenuSub
        ├── MenuSubTrigger
        └── MenuSubContent
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
  <MenuSubTrigger lead={<Icon icon={Share2} {...menuItemGlyph()} />}>Share</MenuSubTrigger>
  <MenuSubContent>
    <MenuItem onSelect={() => {}}>Mail</MenuItem>
  </MenuSubContent>
</MenuSub>
```

`lead` is what sits before the label — an icon, or a mark of the app's. A string child is the row's
label, and the label the touch sheet's back row shows above the nested menu; children drawn as given
are laid out between the lead and the chevron, which stays either way.

### The system's menu

`MenuButton` is the platform's pull-down menu — `UIContextMenu` on iOS, the context menu a pointer
opens on the desktops — with its items as data (`MenuButtonItem`: `id`, `label`, `icon`, `checked`,
`disabled`, `destructive`, `items`, `inline`). The app decides that is the better menu there; a phone
without one (Android) draws `Menu` instead. On the web a menu is always the app's own drawing, so
`Menu` and its parts are.

```tsx
<MenuButton
  title="Arrange"
  accessibilityLabel="Arrange"
  items={[
    {
      id: "sort",
      label: "Sort by",
      inline: true,
      items: [{ id: "name", label: "Name", checked: true }],
    },
    { id: "share", label: "Share", icon: "square.and.arrow.up" },
  ]}
  onSelect={({ id }) => choose(id)}
>
  Sorted by name
</MenuButton>
```

A string child is drawn as the button's label in the theme's look (`variant`, `ghost` by default;
`size` as `Button`'s). It is not a `Button` inside: `nsh/base` makes the button's own view the
pressable on the desktops, and a nested one would take the press. A single element child is the
trigger itself, with no wrapper: its look, `testID`, name, own press and hover styles stay, and
`nsh/base` adds the open state to it (`expandedStyle`, `expanded:` classes).

### Names for screen readers

A string child is the row's label and its name for screen readers; `accessibilityLabel` wins when it should differ. Children drawn as given are named by the texts inside them.

## API

Looks are `menuItemLook`, `menuItemLabel`, `menuItemNote`, `menuItemGlyph`, `menuPopup`, `menuSeparator` and `menuHighlight`; `SubmenuRow` and `SubmenuBack` draw a submenu's row and its touch back row. Every prop of [`nsh/base` Menu](https://nsh.dev/elements/menu) on `MenuContent` passes through except open state and `trigger`. There is no radio-group part: a `MenuGroup` holds the rows, and each `MenuRadioItem` carries its own `checked`.

| Part               | Props                                                                                                                        | Description                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `Menu`             | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `onOpen`, `onClose`, `onCancel`                                     | Open state and the trigger slot                                                |
| `MenuTrigger`      | `children`, `variant`, `disabled`, `style`                                                                                   | Registers the trigger; a string child is a `Button`, an element is the trigger |
| `MenuContent`      | every `nsh/base` Menu prop but open state and `trigger`; defaults bottom / start / 4                                         | The popup or sheet                                                             |
| `MenuItem`         | every `nsh/base` MenuItem prop; `variant`, `inset`; a string child is the label                                              | A row                                                                          |
| `MenuCheckboxItem` | as `MenuItem`, plus `checked`                                                                                                | A checkable row                                                                |
| `MenuRadioItem`    | as `MenuItem`, plus `checked`                                                                                                | One of a group                                                                 |
| `MenuLabel`        | `children`, `inset`                                                                                                          | A group's title                                                                |
| `MenuSeparator`    | every `nsh/base` MenuSeparator prop                                                                                          | A hairline                                                                     |
| `MenuShortcut`     | `children`, `style`                                                                                                          | A trailing note                                                                |
| `MenuSub`          | `children`, `disabled`                                                                                                       | A nested menu's root                                                           |
| `MenuSubTrigger`   | `children`, `lead`, `inset`, `disabled`, `style`                                                                             | The row that opens a submenu                                                   |
| `MenuSubContent`   | every `nsh/base` Submenu prop but `trigger`; `back` on a touch screen                                                        | The nested menu's popup                                                        |
| `MenuButton`       | `items`, `title`, `disabled`, `accessibilityLabel`, `onSelect({ id })`, `variant`, `size`; the rest of `nsh/base` MenuButton | The platform's pull-down menu; a string child is its label                     |
