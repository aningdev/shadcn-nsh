---
title: Drawer
description: A panel from the bottom edge, with a grabber, that a swipe closes.
component: true
demo: drawer
---

## Installation

```npm
npx shadcn-nsh@latest add drawer
```

## Usage

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
```

```tsx
<Drawer>
  <DrawerTrigger>Share…</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Share this photo</DrawerTitle>
      <DrawerDescription>Anyone with the link can view it.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <DrawerClose>Cancel</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## Composition

Use the following composition to build a `Drawer`:

```text
Drawer
├── DrawerTrigger
└── DrawerContent
    ├── DrawerHeader
    │   ├── DrawerTitle
    │   └── DrawerDescription
    └── DrawerFooter
        └── DrawerClose
```

## Examples

### A swipe closes it

`closeOnSwipe` is on by default — unlike [`Sheet`](./sheet), which does not follow a drag: the drawer is
a phone's panel, so dragging its top edge down past a third of its height (or 800 points a second)
closes it, and a scroll inside it hands the drag over at its top. Escape, Android's back and a press
on the scrim close it too; all of them are `nsh/base`'s, and `closeOnEscape` /
`closeOnBackdropPress` / `closeOnSwipe` turn each one off.

```tsx
<DrawerContent closeOnSwipe={false}>…</DrawerContent>
```

### The grabber

The pill at the top edge is the drawer's (`drawerGrabber`: 100 by 8 points, fully round, in the muted
fill) and it shows on a bottom drawer only, the one it can be dragged from. `sheetGrabber` is the
sheet's narrower pill; a drawer that should not be dragged takes `DrawerContent` without the look —
the grabber is drawn by the component, not by the app.

### Another edge

`side` takes any edge of the panel (`"bottom"` unless set). A drawer from the left or the right keeps
the panel's full height and its inner corners on the card's radius.

```tsx
<DrawerContent side="right">…</DrawerContent>
```

### A list of actions

A drawer's actions stack — that is what a finger reaches on a phone — so `DrawerFooter` is a column
and each action is as wide as the drawer. A row of destinations is a `DrawerClose` each, so tapping
one closes the drawer after its `onPress`.

```tsx
<DrawerFooter>
  <DrawerClose variant="default">Copy link</DrawerClose>
  <DrawerClose>Cancel</DrawerClose>
</DrawerFooter>
```

### Against `Sheet`

Opening from the bottom by default, the grabber, the swipe, and the four parts around the panel
(`DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`). The panel, the scrim and the
title's type are shared: `sheetPanel(side)`, `backdrop()`, `dialogTitle()` and `dialogText()`, so a
drawer and the rest of the library wear one surface.

## Differences from shadcn/ui

- No `DrawerPortal` or `DrawerOverlay`: the panel is over the screen and the scrim is behind it in `nsh/base`'s Sheet, which this is; `popupStyle` and `backdropStyle` style both.
- The grabber is drawn by the component (`drawerGrabber`), not by the app.

## API

| Part                | Props                                                                                                         | Description                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Drawer`            | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `onOpen`, `onClose`, `onCancel`                      | Open state and lifecycle                                       |
| `DrawerTrigger`     | `children`, `variant`, `disabled`, `style`                                                                    | A `Button` for a string child, else a pressable of its own     |
| `DrawerContent`     | `side`, every `nsh/base` Sheet prop but open state and the lifecycle callbacks; `popupStyle`, `backdropStyle` | The panel                                                      |
| `DrawerHeader`      | `children`, `style`                                                                                           | A column holding the title and its description, 2 points apart |
| `DrawerTitle`       | `children`, `style`                                                                                           | The panel's title                                              |
| `DrawerDescription` | `children`, `style`                                                                                           | The muted line under it                                        |
| `DrawerFooter`      | `children`, `style`                                                                                           | The actions, stacked, each as wide as the drawer               |
| `DrawerClose`       | As `DrawerTrigger`, plus `onPress`                                                                            | Closes it after its own `onPress`                              |

Every prop of [`nsh/base` Sheet](https://nsh.dev/elements/sheet) passes through on `DrawerContent`
except open state and the lifecycle callbacks, which the root owns. `popupStyle` and `backdropStyle`
go over the look's. Defaults: `side` `"bottom"`, `closeOnSwipe` `true`.
