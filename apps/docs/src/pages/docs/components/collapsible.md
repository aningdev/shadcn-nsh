---
layout: ../../../layouts/Docs.astro
title: Collapsible
description: A disclosure row that reveals a panel beneath it.
component: true
demo: collapsible
---

## Installation

```sh
npx shadcn-nsh@latest add collapsible
```

## Usage

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
```

```tsx
<Collapsible defaultOpen>
  <CollapsibleTrigger first>Title</CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>
```

## Examples

### Open by default

```tsx
<Collapsible defaultOpen>
  <CollapsibleTrigger first>Shipping details</CollapsibleTrigger>
  <CollapsibleContent>Orders leave within a day.</CollapsibleContent>
</Collapsible>
```

### Closed

```tsx
<Collapsible>
  <CollapsibleTrigger>Returns</CollapsibleTrigger>
  <CollapsibleContent>Within 30 days, unused and in its box.</CollapsibleContent>
</Collapsible>
```

`first` drops the row's top divider; `start` lines the trigger and the panel up past a leading icon.

## API

Uses `disclosureTriggerLook`, `DisclosureChevron`, and `disclosurePanel` from accordion. Composition: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`.

| Prop (on `CollapsibleTrigger`) | Type      | Default |
| ------------------------------ | --------- | ------- |
| `first`                        | `boolean` |         |
| `start`                        | `number`  |         |
