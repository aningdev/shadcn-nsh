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

## API

| Part               | Notes                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Accordion`        | `value: string[]`, `multiple`, `onChange({ value })`. Other base props pass through.                                                                                                                                         |
| `AccordionItem`    | One section, with a hairline under it. `value` is required.                                                                                                                                                                  |
| `AccordionHeader`  | The heading. `level` and the rest pass through.                                                                                                                                                                              |
| `AccordionTrigger` | String children are the title. A chevron is always drawn; `group` plus `group-aria-expanded` turns it (`duration-200`). Hover is `colors.accent`; the press sinks. Disabled is `disabledOpacity()` (0.5). Style hooks merge. |
| `AccordionPanel`   | `reveal` defaults on (base defaults off). Bottom padding (12 with a pointer, 14 on touch) sits on an inner view, so a closed panel stays zero-high.                                                                          |

## Differences

| Topic      | shadcn                   | This package                                                                 |
| ---------- | ------------------------ | ---------------------------------------------------------------------------- |
| Panel name | AccordionContent         | `AccordionPanel` (`nsh/base` symbol)                                         |
| Value      | string / string[] + type | always `string[]`; `multiple` flag                                           |
| Header     | often omitted            | keep `AccordionHeader` for nsh a11y                                          |
| Chevron    | icon, often optional     | always drawn; turns with `group-aria-expanded` (no icon set in this package) |
| Reveal     | CSS height               | `reveal` defaults on; pass `reveal={false}` for an instant swap              |
| Disabled   | opacity utility          | the theme's one disabled opacity (0.5), not the reference's 0.4              |

## Not forwarded

None. Base props pass through, and style hooks merge over the row. The chevron is part of the trigger, not a separate public part.
