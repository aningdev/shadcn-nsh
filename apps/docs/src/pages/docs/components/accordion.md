---
title: Accordion
description: List rows that reveal panels with a turning chevron.
component: true
demo: accordion
---

## Installation

```sh
npx shadcn-nsh@latest add accordion
```

## Usage

```tsx
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
```

```tsx
<Accordion>
  <AccordionItem value="a">
    <AccordionHeader>
      <AccordionTrigger first>Title</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>…</AccordionPanel>
  </AccordionItem>
</Accordion>
```

## API

Uses `disclosureTriggerLook`, `DisclosureChevron`, and `disclosurePanel`. Every prop of [`nsh/base` Accordion](https://nsh.dev/elements/accordion) parts passes through.

| Prop (on `AccordionTrigger`) | Type      | Default |
| ---------------------------- | --------- | ------- |
| `first`                      | `boolean` |         |
| `start`                      | `number`  |         |
