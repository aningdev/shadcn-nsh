---
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

## API

Uses `disclosureTriggerLook`, `DisclosureChevron`, and `disclosurePanel` from accordion. Composition: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`.

| Prop (on `CollapsibleTrigger`) | Type      | Default |
| ------------------------------ | --------- | ------- |
| `first`                        | `boolean` |         |
| `start`                        | `number`  |         |
