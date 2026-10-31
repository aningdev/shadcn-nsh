---
layout: ../../../layouts/Docs.astro
title: Accordion
description: Styled accordion wrapping nsh/base Accordion.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Accordion](https://nsh.dev/elements/accordion).

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
      <AccordionTrigger><Text>Section one</Text></AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel><Text>Panel content</Text></AccordionPanel>
  </AccordionItem>
</Accordion>
```

## Source

Authoring: `packages/ui/accordion.tsx`. Registry: `accordion` (depends on `theme`).
