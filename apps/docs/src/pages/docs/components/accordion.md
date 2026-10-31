---
layout: ../../../layouts/Docs.astro
title: Accordion
description: Styled accordion wrapping nsh/base Accordion.
component: true
---

Styled accordion on `nsh/base`. Part names match base (`AccordionPanel`, not shadcn’s `AccordionContent`).

## Install

```sh
shadcn-nsh add accordion
# monorepo:
shadcn-nsh add accordion -c apps/web
```

## Usage

```tsx
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@workspace/ui/components/ui/accordion";
import { Text } from "nsh";

<Accordion>
  <AccordionItem value="one">
    <AccordionHeader>
      <AccordionTrigger>
        <Text>Section one</Text>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>
      <Text>Panel content</Text>
    </AccordionPanel>
  </AccordionItem>
</Accordion>;
```

## Composition

```
Accordion
└─ AccordionItem
   ├─ AccordionHeader
   │  └─ AccordionTrigger
   └─ AccordionPanel
```

## API

**`Accordion`**

| Prop       | Type                                   | Notes                 |
| ---------- | -------------------------------------- | --------------------- |
| `value`    | `string[]`                             | Controlled open items |
| `multiple` | `boolean`                              |                       |
| `disabled` | `boolean`                              |                       |
| `onChange` | `(event: { value: string[] }) => void` |                       |
| `children` | `JSX.Element`                          |                       |

**`AccordionItem`** — `value`, `disabled`, `children`

**`AccordionHeader`** — `level?`, `children`

**`AccordionTrigger`** — `accessibilityLabel?`, `children`

**`AccordionPanel`** — `reveal?` (default `true`), `keepMounted?`, `accessibilityLabel?`, `children`
