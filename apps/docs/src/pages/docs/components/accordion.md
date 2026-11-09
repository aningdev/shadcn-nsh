---
layout: ../../../layouts/Docs.astro
title: Accordion
description: Accordion with Item / Trigger / Content (Panel) composition.
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
  AccordionContent,
} from "@workspace/ui/components/ui/accordion";

<Accordion value={open()} onChange={({ value }) => open.set(value)}>
  <AccordionItem value="a">
    <AccordionHeader>
      <AccordionTrigger>Section A</AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>Body</AccordionContent>
  </AccordionItem>
</Accordion>;
```

## Composition

```
Accordion
└── AccordionItem
    ├── AccordionHeader
    │   └── AccordionTrigger
    └── AccordionContent  (= AccordionPanel)
```

## Differences

| Topic        | shadcn                   | This package                                |
| ------------ | ------------------------ | ------------------------------------------- |
| Content name | AccordionContent         | `AccordionContent` alias + `AccordionPanel` |
| Value        | string / string[] + type | always `string[]`; `multiple` flag          |
| Header       | often omitted            | keep `AccordionHeader` for nsh a11y         |

## Not forwarded

Trigger / panel style overrides locked in the wrapper.
