---
title: Collapsible
description: A disclosure row that reveals a panel beneath it.
component: true
demo: collapsible
---

## Installation

```npm
npx shadcn-nsh@latest add collapsible
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Collapsible } from "shadcn-nsh/collapsible";
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

## Composition

Use the following composition to build a `Collapsible`:

```text
Collapsible
├── CollapsibleTrigger
└── CollapsibleContent
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
  <CollapsibleTrigger first>Returns</CollapsibleTrigger>
  <CollapsibleContent>Within 30 days, unused and in its box.</CollapsibleContent>
</Collapsible>
```

### A chevron that turns over

`chevron="down"` points the chevron down and turns it over as the row opens, the way an accordion's
turns, for a collapsible that reads as a section of one; `along` (the default) points it along the
row, the way a folder's does. The row takes more than one child, drawn in one line before the chevron.

```tsx
<CollapsibleTrigger chevron="down" first>
  Shipping details
</CollapsibleTrigger>
```

Every trigger but the `first` draws a divider above it, inside its row, so the hover fill meets the line; `start` lines the trigger and the panel up past a leading icon. A row in the panel (`listRow`) reaches past the content, and the revealed region clips it, so give the panel room on both sides: `panel={{ start: 12, end: 12 }}`.

## API

Uses `disclosureTriggerLook`, `DisclosureChevron`, and `disclosurePanel` from accordion. Composition: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`.

| Part                 | Props                                                                                   | Description                                                                         |
| -------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Collapsible`        | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `children`                     | A disclosure row that reveals a panel beneath it.                                   |
| `CollapsibleTrigger` | `children`, `first`, `start`, `chevron` (`"along"` by default, or `"down"`), `disabled` | The title row; `first` drops its top divider, `start` lines it past a leading icon. |
| `CollapsibleContent` | `children`, `panel` (`start`, `end`, `gap`)                                             | The panel beneath, in `disclosurePanel` padding.                                    |
