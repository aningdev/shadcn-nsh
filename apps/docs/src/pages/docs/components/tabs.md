---
layout: ../../../layouts/Docs.astro
title: Tabs
description: Tabs with List / Trigger / Content composition.
component: true
demo: tabs
demoHeight: 300
---

## Install

```sh
shadcn-nsh add tabs
```

## Usage

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/ui/tabs";

<Tabs value={tab()} onValueChange={tab.set}>
  <TabsList>
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>
  <TabsContent value="one">Panel one</TabsContent>
  <TabsContent value="two">Panel two</TabsContent>
</Tabs>;
```

## Composition

```
Tabs
├── TabsList
│   └── TabsTrigger*
└── TabsContent*
```

## Differences

Legacy `Tab` + external `selected`/`onPress` still exported. Base indicator is hidden; selection is fill on the trigger.

## Not forwarded

`indicatorStyle` / base Tabs chrome beyond the muted list.
