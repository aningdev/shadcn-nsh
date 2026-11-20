---
title: Dialog
description: A card dialog with a trigger, content, title, description, footer and close.
component: true
demo: dialog
demoHeight: 480
---

## Installation

```npm
npx shadcn-nsh@latest add dialog
```

## Usage

```tsx
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
```

```tsx
<Dialog>
  <DialogTrigger variant="default">Delete item…</DialogTrigger>
  <DialogContent>
    <DialogTitle>Delete this item?</DialogTitle>
    <DialogDescription>A press on the dimmed backdrop closes it.</DialogDescription>
    <DialogFooter>
      <DialogClose>Keep</DialogClose>
      <DialogClose variant="destructive" onPress={remove}>
        Delete
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Composition

Use the following composition to build a `Dialog`:

```text
Dialog
├── DialogTrigger
└── DialogContent
    ├── DialogTitle
    ├── DialogDescription
    └── DialogFooter
        └── DialogClose
```

## Examples

### Width

The card is 360 points with a pointer and 320 on a touch screen; `width` sets another, never past 90% of the window.

```tsx
<DialogContent width={480}>…</DialogContent>
```

### Motion

`animation` is `fade` (the card's default), `slide`, or `none`.

```tsx
<DialogContent animation="slide">…</DialogContent>
```

### Presentation

`presentation` hands the dialog to the system: `fullScreen` comes up over the window, `pageSheet` and `formSheet` come up as the system's sheet, with what is behind them still in sight (iOS). The system draws the card there — its edge, its radius, its shadow, its place and its height — so the content wears no card, and the app's `style` starts from a page (`dialogPage`) instead. Desktops and the web ignore `presentation`: there the card stands.

```tsx
<DialogContent presentation="fullScreen">…</DialogContent>
```

### Scrolling

The card is never taller than the window holds inside the safe areas, 24 points clear of either edge, and its body scrolls under that cap. `DialogFooter` is drawn under the scrolling body, so the actions stay put; `DialogTitle` and `DialogDescription` are in the body and scroll with it (put them in their own block if the title has to stay).

```tsx
<DialogContent>
  <DialogTitle>Order ticket</DialogTitle>
  <View style={{ gap: 12 }}>{fields}</View>
  <DialogFooter>
    <DialogClose>Cancel</DialogClose>
    <DialogClose variant="default">Place order</DialogClose>
  </DialogFooter>
</DialogContent>
```

`scroll={false}` draws the children as given, with no scroll of the shell's: for a body that takes gestures of its own.

```tsx
<DialogContent scroll={false}>…</DialogContent>
```

### A page of its own

A dialog the app fills the window with — a lightbox, an editor — passes `dialogPage()` as `style`: it takes the card's edge, radius, shadow, padding, width and height cap off and fills what the dialog gives it.

```tsx
import { DialogContent, dialogPage } from "@/components/ui/dialog";

<DialogContent style={dialogPage()} scroll={false} animation="fade">
  {image}
</DialogContent>;
```

### Closing

Escape, a backdrop press and a downward swipe close the dialog; turn any of them off on the content.

```tsx
<DialogContent closeOnEscape={false} closeOnBackdropPress={false} closeOnSwipe={false}>
  …
</DialogContent>
```

### Card and backdrop

`style` goes over the card's chrome, `backdropStyle` over the scrim.

```tsx
<DialogContent
  style={{ padding: 32, maxWidth: 480 }}
  backdropStyle={{ backgroundColor: alpha(colors.foreground, 0.4) }}
>
  …
</DialogContent>
```

### Controlled

`open` owns the state; `onOpenChange` reports the next one and why.

```tsx
<Dialog open={open()} onOpenChange={({ open: next }) => setOpen(next)}>
  …
</Dialog>
```

## Differences from shadcn/ui

- No `DialogPortal` or `DialogOverlay`: `nsh/base` hosts the popup and draws the backdrop, and `backdropStyle` styles the scrim.
- No `DialogHeader`: `DialogTitle` and `DialogDescription` are separate parts, and the block that holds them is the app's.
- No built-in close button: `DialogClose` is the one the app places.
- Adds `width`, `scroll`, `animation` and `presentation` on `DialogContent`, and `dialogPage` and `dialogCard` for an app's own surface.
- The body scrolls under a height cap and `DialogFooter` stays at the card's end; shadcn leaves both to the app.
- No `asChild`: a string child of `DialogTrigger` or `DialogClose` is a `Button` (`variant`, `secondary` by default).
- `onOpenChange` reports `{ open, reason }`.

## API

`Dialog` owns the open state. `DialogContent` mounts [`nsh/base` Dialog](https://nsh.dev/elements/dialog); every base prop passes through it, and base owns the backdrop, the popup host and Escape, back and swipe.

| Part                | Props                                                                                                                                                                     | Description                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Dialog`            | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `onOpen`, `onClose`, `onCancel`                                                                                  | Open state                                                     |
| `DialogTrigger`     | `children`, `variant`, `disabled`, `style`                                                                                                                                | What opens the dialog                                          |
| `DialogContent`     | `width`, `scroll`, every `nsh/base` Dialog prop (`presentation`); `style` over `dialogCard` (or `dialogPage` when the system presents it), `backdropStyle` over the scrim | The card                                                       |
| `DialogTitle`       | `children`; a string takes `dialogTitle`                                                                                                                                  | The card's title                                               |
| `DialogDescription` | `children`; a string takes `dialogText`                                                                                                                                   | The muted line under the title                                 |
| `DialogFooter`      | `children`, `style`                                                                                                                                                       | The row of actions at the card's end, under the scrolling body |
| `DialogClose`       | As `DialogTrigger`, plus `onPress` before it closes                                                                                                                       | What closes the dialog                                         |

A string child of `DialogTrigger` or `DialogClose` is a `Button`; `variant` picks its look (`secondary` by default). Anything else is drawn as given.
