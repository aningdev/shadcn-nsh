---
layout: ../../../layouts/Docs.astro
title: Sheet
description: Side/bottom sheet with Trigger / Content composition over nsh/base.
component: true
demo: sheet
demoHeight: 420
---

Sheet panel. `side` may be set on root or on `SheetContent` (Content wins).

## Install

```sh
shadcn-nsh add sheet
```

## Usage

```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@workspace/ui/components/ui/sheet";

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <SheetClose>Close</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>;
```

## Composition

```
Sheet
├── SheetTrigger
└── SheetContent
    ├── SheetHeader
    │   ├── SheetTitle
    │   └── SheetDescription
    └── SheetFooter
```

## Differences

| Topic             | shadcn     | This package                                   |
| ----------------- | ---------- | ---------------------------------------------- |
| `side`            | on Content | root or Content                                |
| Native page sheet | —          | use Dialog `presentation` (not forwarded here) |

## Not forwarded

Base `popupStyle` / `backdropStyle` / swipe knobs beyond `closeOnSwipe`.
