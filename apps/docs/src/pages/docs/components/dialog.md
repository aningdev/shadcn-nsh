---
layout: ../../../layouts/Docs.astro
title: Dialog
description: Styled dialog with shadcn-shaped Trigger / Content composition over nsh/base.
component: true
demo: dialog
demoHeight: 420
---

Modal surface on `nsh/base` Dialog. Public API matches shadcn Usage (Trigger / Content / Header / …); the Content part owns the base dialog.

## Install

```sh
shadcn-nsh add dialog
# monorepo:
shadcn-nsh add dialog -c apps/web
```

## Usage

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@workspace/ui/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
      <DialogClose variant="default">Continue</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

## Composition

```
Dialog
├── DialogTrigger
└── DialogContent
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    └── DialogFooter
        └── DialogClose
```

## Examples

### Controlled open

```tsx
const [open, setOpen] = createSignal(false);

<Dialog open={open()} onOpenChange={(e) => setOpen(e.open)}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogTitle>Controlled</DialogTitle>
  </DialogContent>
</Dialog>;
```

### Animation

```tsx
<Dialog animation="slide">
  <DialogTrigger>Slide</DialogTrigger>
  <DialogContent>
    <DialogTitle>Slides in</DialogTitle>
  </DialogContent>
</Dialog>
```

## API

### `Dialog`

| Prop                              | Type                                                 | Default  | Notes              |
| --------------------------------- | ---------------------------------------------------- | -------- | ------------------ |
| `open`                            | `boolean`                                            | —        | Controlled open    |
| `defaultOpen`                     | `boolean`                                            | —        | Uncontrolled start |
| `animation`                       | `"slide" \| "fade" \| "none"`                        | `"fade"` | Applied on Content |
| `onOpenChange`                    | `(event: { open: boolean; reason: string }) => void` | —        |                    |
| `onOpen` / `onClose` / `onCancel` | `() => void`                                         | —        | Forwarded to base  |

### Parts

`DialogTrigger` (string → `Button`, else pressable wrap), `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`.

## Differences

| Topic     | shadcn                    | This package                                                |
| --------- | ------------------------- | ----------------------------------------------------------- |
| Events    | `onClick`                 | `onPress`                                                   |
| `asChild` | Trigger merges into child | string → Button; element children wrapped in pressable View |
| Close UI  | optional built-in X       | use `DialogClose` / your own control                        |
| Portal    | Radix portal              | nsh Dialog presentation + fixed chrome                      |

## Not forwarded

From `nsh/base` Dialog: `presentation`, `closeOn*` dismiss knobs, and style/backdrop overrides (`style`, `backdropStyle`, …). Chrome is fixed by `DialogContent`.
