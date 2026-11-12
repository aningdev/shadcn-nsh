---
layout: ../../../layouts/Docs.astro
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

## Examples

### Controlled

`value` is the open items; `onChange` reports the next list.

```tsx
<Accordion value={open()} onChange={({ value }) => open.set(value)}>
  <AccordionItem value="shipping">
    <AccordionHeader>
      <AccordionTrigger first>How long does shipping take?</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>
      Orders leave within a day and arrive in two to five working days.
    </AccordionPanel>
  </AccordionItem>
</Accordion>
```

### Disabled row

```tsx
<AccordionItem value="gift" disabled>
  <AccordionHeader>
    <AccordionTrigger>Can I send it as a gift?</AccordionTrigger>
  </AccordionHeader>
  <AccordionPanel>Gift wrapping opens with the holiday season.</AccordionPanel>
</AccordionItem>
```

### Revealed panel

`reveal` defaults on; `start` lines the panel up past a leading icon in the trigger.

```tsx
<AccordionPanel reveal start={24} gap={8}>
  <Text>Within 30 days, unused and in its box.</Text>
</AccordionPanel>
```

## API

Uses `disclosureTriggerLook`, `DisclosureChevron`, and `disclosurePanel`. Every prop of [`nsh/base` Accordion](https://nsh.dev/elements/accordion) parts passes through.

| Prop (on `AccordionTrigger`) | Type      | Default |
| ---------------------------- | --------- | ------- |
| `first`                      | `boolean` |         |
| `start`                      | `number`  |         |
