---
layout: ../../../layouts/Docs.astro
title: Tooltip
description: Tooltip bubble and Trigger / Content composition.
component: true
demo: tooltip
demoHeight: 300
---

Two shapes: **string bubble** for host `tooltip={…}`, or **Trigger / Content** composition.

## Install

```sh
shadcn-nsh add tooltip
```

## Usage

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from "@workspace/ui/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>Add item</TooltipContent>
</Tooltip>;
```

### Host prop bubble

```tsx
<SomeHost tooltip={<Tooltip>Add item</Tooltip>} />
```

## Composition

```
Tooltip
├── TooltipTrigger
└── TooltipContent
```

(`TooltipProvider` is a passthrough for shadcn familiarity.)

## Differences

| Topic      | shadcn        | This package                                                                   |
| ---------- | ------------- | ------------------------------------------------------------------------------ |
| Attachment | wrap Trigger  | composition uses host `tooltip` under the hood; string `Tooltip` is the bubble |
| Provider   | delay context | passthrough                                                                    |

## Not forwarded

Bubble chrome locked; styled `Button` does not forward `tooltip` — use composition or a base host.
