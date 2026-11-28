---
title: Accordion
description: List rows that reveal panels with a turning chevron.
component: true
demo: accordion
---

## Installation

```npm
npx shadcn-nsh@latest add accordion
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Accordion } from "shadcn-nsh/accordion";
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

## Composition

Use the following composition to build an `Accordion`:

```text
Accordion
├── AccordionItem
│   ├── AccordionHeader
│   │   └── AccordionTrigger
│   └── AccordionPanel
```

## Examples

### Disabled row

```tsx
<AccordionItem value="gift" disabled>
  <AccordionHeader>
    <AccordionTrigger>Can I send it as a gift?</AccordionTrigger>
  </AccordionHeader>
  <AccordionPanel>Gift wrapping opens with the holiday season.</AccordionPanel>
</AccordionItem>
```

### A trigger of its own

The trigger takes more than one child: what you draw is laid out in the row before the chevron, in
one line, and the chevron stays at the end (it is the part that turns as the item opens).

```tsx
<AccordionTrigger>
  <Icon icon={Package} {...menuItemGlyph()} />
  <RowLabel label="Shipping" strong />
</AccordionTrigger>
```

`disabled` on the trigger takes the row's presses itself — for a row that is not an item's own (an
item's `disabled` already does that for the header's trigger).

```tsx
<AccordionTrigger disabled>Can I change my address?</AccordionTrigger>
```

### Revealed panel

`reveal` defaults on; `start` lines the panel up past a leading icon in the trigger, and `end` keeps the same room after the content.

```tsx
<AccordionPanel reveal start={24} gap={8}>
  <Text>Within 30 days, unused and in its box.</Text>
</AccordionPanel>
```

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

## API

Uses `disclosureTriggerLook`, `DisclosureChevron`, and `disclosurePanel`. Every prop of [`nsh/base` Accordion](https://nsh.dev/elements/accordion) parts passes through.

| Part               | Props                                           | Description                                                 |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| `Accordion`        | —                                               | The stack of items.                                         |
| `AccordionHeader`  | —                                               | The heading around the trigger.                             |
| `AccordionItem`    | —                                               | One section.                                                |
| `AccordionPanel`   | `reveal` (on by default), `start`, `end`, `gap` | Revealed content, in `disclosurePanel` padding.             |
| `AccordionTrigger` | `first`, `start`, `disabled`                    | The title row, with a chevron that turns as the item opens. |
