---
layout: ../../../layouts/Docs.astro
title: Collapsible
description: Collapsible with Trigger / Content composition.
component: true
demo: collapsible
demoHeight: 300
---

## Install

```sh
shadcn-nsh add collapsible
```

## Usage

```tsx
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@workspace/ui/components/ui/collapsible";

<Collapsible open={open()} onOpenChange={({ open: v }) => open.set(v)}>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Hidden until open.</CollapsibleContent>
</Collapsible>;
```

## Composition

```
Collapsible
├── CollapsibleTrigger
└── CollapsibleContent
```

## Differences

Legacy `content` prop + trigger children still works.

## Not forwarded

Base style overrides.
