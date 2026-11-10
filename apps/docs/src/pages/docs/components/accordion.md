---
layout: ../../../layouts/Docs.astro
title: Accordion
description: Accordion with Item / Trigger / Panel composition.
component: true
demo: accordion
demoHeight: 360
---

## Install

```sh
shadcn-nsh add accordion
```

## Usage

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
} from "@workspace/ui/components/ui/accordion";

<Accordion value={open()} onChange={({ value }) => open.set(value)}>
  <AccordionItem value="a">
    <AccordionHeader>
      <AccordionTrigger>Section A</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>Body</AccordionPanel>
  </AccordionItem>
</Accordion>;
```

## Composition

```
Accordion
└── AccordionItem
    ├── AccordionHeader
    │   └── AccordionTrigger
    └── AccordionPanel
```

## Differences

| Topic      | shadcn                   | This package                         |
| ---------- | ------------------------ | ------------------------------------ |
| Panel name | AccordionContent         | `AccordionPanel` (`nsh/base` symbol) |
| Value      | string / string[] + type | always `string[]`; `multiple` flag   |
| Header     | often omitted            | keep `AccordionHeader` for nsh a11y  |

## Not forwarded

Trigger / panel style overrides locked in the wrapper.
