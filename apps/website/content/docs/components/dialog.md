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

On iOS, `presentation` shows a system sheet instead of a card.

```tsx
<DialogContent presentation="pageSheet">…</DialogContent>
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
- Adds `width`, `animation` and `presentation` on `DialogContent`.
- No `asChild`: a string child of `DialogTrigger` or `DialogClose` is a `Button` (`variant`, `secondary` by default).
- `onOpenChange` reports `{ open, reason }`.

## API

`Dialog` owns the open state. `DialogContent` mounts [`nsh/base` Dialog](https://nsh.dev/elements/dialog); every base prop passes through it, and base owns the backdrop, the popup host and Escape, back and swipe.

| Part                | Props                                                                                            | Description                          |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `Dialog`            | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `onOpen`, `onClose`, `onCancel`         | Open state                           |
| `DialogTrigger`     | `children`, `variant`, `disabled`, `style`                                                       | What opens the dialog                |
| `DialogContent`     | `width`, every `nsh/base` Dialog prop; `style` over `dialogCard`, `backdropStyle` over the scrim | The card                             |
| `DialogTitle`       | `children`; a string takes `dialogTitle`                                                         | The card's title                     |
| `DialogDescription` | `children`; a string takes `dialogText`                                                          | The muted line under the title       |
| `DialogFooter`      | `children`, `style`                                                                              | The row of actions at the card's end |
| `DialogClose`       | As `DialogTrigger`, plus `onPress` before it closes                                              | What closes the dialog               |

A string child of `DialogTrigger` or `DialogClose` is a `Button`; `variant` picks its look (`secondary` by default). Anything else is drawn as given.
