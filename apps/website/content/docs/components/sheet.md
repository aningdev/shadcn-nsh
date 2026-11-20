---
title: Sheet
description: A panel that slides in from an edge of the screen over a scrim.
component: true
demo: sheet
---

## Installation

```npm
npx shadcn-nsh@latest add sheet
```

## Usage

```tsx
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
```

```tsx
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="bottom">
    Filters
    <SheetClose>Done</SheetClose>
  </SheetContent>
</Sheet>
```

## Examples

### Side

```tsx
<SheetContent side="bottom">…</SheetContent>
<SheetContent side="right">…</SheetContent>
```

### Grabber

A bottom sheet has a grabber at its top: `nsh/base`'s own handle, which screen readers adjust to
change the detent and which moves to the next larger one when pressed, drawn in the theme's look
(`sheetGrabber`). It is the handle itself, not a picture of one, so a sheet never shows two. `grabber`
off shows it; `grabberAccessibilityLabel` names it ("Sheet" by default).

```tsx
<SheetContent side="bottom" grabberAccessibilityLabel="Resize comments">
  …
</SheetContent>
```

The look alone is `sheetPanel(side)` and `sheetGrabber()`.

## API

Every prop of [`nsh/base` Sheet](https://nsh.dev/elements/sheet) passes through on `SheetContent`. `popupStyle` and `backdropStyle` go over the look's.

| Part           | Props                                                                                                                                  | Description                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `SheetContent` | `side` (`"bottom" \| "top" \| "left" \| "right"`, default `"bottom"`), `grabber` (on for `side="bottom"`), `grabberAccessibilityLabel` | Every prop of `nsh/base` Sheet passes through. `popupStyle` and `backdropStyle` go over the look's |
