---
layout: ../../../layouts/Docs.astro
title: Dialog
description: A card dialog with a trigger, content, title, description, footer and close.
component: true
demo: dialog
demoHeight: 480
---

## Installation

```sh
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
  <DialogTrigger variant="primary">Delete item…</DialogTrigger>
  <DialogContent>
    <DialogTitle>Delete this item?</DialogTitle>
    <DialogDescription>A press on the dimmed backdrop closes it.</DialogDescription>
    <DialogFooter>
      <DialogClose>Keep</DialogClose>
      <DialogClose variant="danger" onPress={remove}>
        Delete
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Examples

### Controlled

`open` owns the state; `onOpenChange` reports the next one and why.

```tsx
<Dialog open={open()} onOpenChange={({ open: next }) => setOpen(next)}>
  …
</Dialog>
```

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
  backdropStyle={{ backgroundColor: alpha(colors.text, 0.4) }}
>
  …
</DialogContent>
```

## API

`Dialog` owns the open state. `DialogContent` mounts [`nsh/base` Dialog](https://nsh.dev/elements/dialog); every base prop passes through it, and base owns the backdrop, the popup host and Escape, back and swipe.

| Part                | Props                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `Dialog`            | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `onOpen`, `onClose`, `onCancel`         |
| `DialogTrigger`     | `children`, `variant`, `disabled`, `style`                                                       |
| `DialogContent`     | `width`, every `nsh/base` Dialog prop; `style` over `dialogCard`, `backdropStyle` over the scrim |
| `DialogTitle`       | `children`; a string takes `dialogTitle`                                                         |
| `DialogDescription` | `children`; a string takes `dialogText`                                                          |
| `DialogFooter`      | `children`, `style`                                                                              |
| `DialogClose`       | As `DialogTrigger`, plus `onPress` before it closes                                              |

A string child of `DialogTrigger` or `DialogClose` is a `Button`; `variant` picks its kind (`secondary` by default). Anything else is drawn as given.
