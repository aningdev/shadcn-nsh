---
layout: ../../../layouts/Docs.astro
title: Popover
description: Popover with Trigger / Content composition over nsh/base.
component: true
demo: popover
demoHeight: 360
---

## Install

```sh
shadcn-nsh add popover
```

## Usage

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@workspace/ui/components/ui/popover";

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Tip</PopoverTitle>
      <PopoverDescription>Details</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
</Popover>;
```

## Composition

```
Popover
├── PopoverTrigger
└── PopoverContent
```

## Differences

Legacy `trigger` prop still works. No DOM `asChild`.

## Not forwarded

`popupStyle` / placement knobs beyond defaults.
