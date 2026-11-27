# Menubar (/dev/docs/components/menubar)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add menubar
```

## Usage [#usage]

```tsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
```

```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New document</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Close</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Composition [#composition]

Use the following composition to build a `Menubar`:

```text
Menubar
└── MenubarMenu
    ├── MenubarTrigger
    └── MenubarContent
        ├── MenubarGroup
        │   ├── MenubarLabel
        │   ├── MenubarItem
        │   │   └── MenubarShortcut
        │   ├── MenubarCheckboxItem
        │   └── MenubarRadioItem
        ├── MenubarSeparator
        └── MenubarSub
            ├── MenubarSubTrigger
            └── MenubarSubContent
```

## Examples [#examples]

### The bar [#the-bar]

`Menubar` is a row a step over its triggers — the theme's height step under a row, the room either
side of them and its own 1-point edge — inside a 1-point edge with the card's fill, its triggers 8
points either side. It places nothing itself: a `MenubarMenu` gives a trigger
and its popup, and the trigger stands in the bar, not in a box of its
own.

### The trigger that is open [#the-trigger-that-is-open]

The trigger of the menu that is open wears the neutral `accent` fill — the modal-less bar says which
menu it belongs to without the bar changing — and the pointer over another trigger whispers the same
fill. A press opens one menu and a press closes it; once one is open, the pointer moves between
menus. A disabled trigger takes no presses and dims to 50%; a string child is the trigger's name, in
the menu's type; anything else (an icon and a name) is drawn as given.

### A row with its key equivalent [#a-row-with-its-key-equivalent]

A string child is a row's label; a label and a note at the row's trailing edge (`MenubarShortcut`,
which is `MenuShortcut`) are written out — the note takes the rest of the row:

```tsx
import { menuItemLabel } from "@/components/ui/menu";

<MenubarItem>
  <>
    <Text style={menuItemLabel()}>New document</Text>
    <MenubarShortcut>⌘N</MenubarShortcut>
  </>
</MenubarItem>;
```

### The rows are the menu's [#the-rows-are-the-menus]

`MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioItem`, `MenubarLabel`, `MenubarSeparator`,
`MenubarShortcut`, `MenubarGroup` and `MenubarSub` / `MenubarSubTrigger` / `MenubarSubContent` are
[`Menu`](./menu)'s parts under the bar's names: a row of a bar wears what a row of a menu wears, down
to its danger tone, its check and its dot. `MenubarShortcut` is `MenuShortcut` (the row's trailing
note), and `MenubarLabel` is `MenuLabel`: its child is the title. There is no radio-group part:
`MenubarGroup` is a `View`, and each `MenubarRadioItem` carries its own `checked`.

```tsx
<MenubarMenu>
  <MenubarTrigger>View</MenubarTrigger>
  <MenubarContent>
    <MenubarCheckboxItem checked={sidebar()} closeOnSelect={false} onSelect={toggle}>
      Show sidebar
    </MenubarCheckboxItem>
    <MenubarSeparator />
    <MenubarLabel>Zoom</MenubarLabel>
    <MenubarRadioItem checked={zoom() === "125%"} onSelect={() => zoom.set("125%")}>
      125%
    </MenubarRadioItem>
  </MenubarContent>
</MenubarMenu>
```

## API [#api]

Every prop of [`nsh/base` Menu](https://nsh.dev/elements/menu) passes through on `MenubarContent`
except the trigger, the open state and the lifecycle callbacks, which the root owns. `popupStyle`,
`backdropStyle` and `popupStartingStyle` go over `menuPopup`'s. Defaults: `placement` `"bottom"`,
`align` `"start"`, `offset` `8` — a menu under the trigger it belongs to, whatever the bar's width.

| Part                  | Props                                         | Description                                            |
| --------------------- | --------------------------------------------- | ------------------------------------------------------ |
| `Menubar`             | every `nsh` view prop                         | The bar; a row holding its menus                       |
| `MenubarMenu`         | `onOpenChange`                                | Open state + lifecycle; reports `{ open, reason }`     |
| `MenubarTrigger`      | `children`, `disabled`; every `nsh` view prop | A string is the name; wears the chosen fill while open |
| `MenubarContent`      |                                               | The popup, over the menu surface                       |
| `MenubarItem`         | `variant`                                     | A row; `"destructive"` is the danger tone              |
| `MenubarCheckboxItem` | `closeOnSelect`                               | A row with a check; `false` to stay open               |
| `MenubarRadioItem`    |                                               | A row with a dot                                       |
| `MenubarLabel`        |                                               | A group's name (`text`)                                |
| `MenubarSeparator`    |                                               | A hairline between rows                                |
| `MenubarShortcut`     |                                               | The row's trailing note (a key equivalent)             |
| `MenubarGroup`        |                                               | A block grouping rows                                  |
| `MenubarSub`          |                                               | A submenu: `MenubarSubTrigger` and `MenubarSubContent` |
| `MenubarSubTrigger`   |                                               | The row that opens it (a chevron with a string)        |
| `MenubarSubContent`   |                                               | Its popup; a back row on a touch screen                |

The bar and its triggers spread the view props they are given on the row they draw, after the look
(`style` included), and merge a given `hoverStyle`, `activeStyle`, `expandedStyle` or `disabledStyle`
after the look's own. The rows, labels, notes and groups are `menu.tsx`'s, so they take what a menu's
parts take.