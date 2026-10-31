---
layout: ../../../layouts/Docs.astro
title: Accordion
description: Styled accordion wrapping nsh/base Accordion.
component: true
demo: accordion
---

Styled accordion on `nsh/base`. Part names match base (`AccordionPanel`, not shadcn’s `AccordionContent`). Open sections are a `string[]` on the root.

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

<Accordion value={["shipping"]} onChange={(e) => console.log(e.value)}>
  <AccordionItem value="shipping">
    <AccordionHeader>
      <AccordionTrigger>
        <Text>Shipping</Text>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>
      <Text>Orders leave the same day before 2 pm.</Text>
    </AccordionPanel>
  </AccordionItem>
</Accordion>;
```

## Composition

```
Accordion
├── AccordionItem
│   ├── AccordionHeader
│   │   └── AccordionTrigger
│   └── AccordionPanel
```

## Examples

### Multiple open

```tsx
<Accordion multiple value={["a", "b"]} onChange={(e) => {}}>
  <AccordionItem value="a">
    <AccordionHeader>
      <AccordionTrigger>
        <Text>A</Text>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>
      <Text>Panel A</Text>
    </AccordionPanel>
  </AccordionItem>
  <AccordionItem value="b">
    <AccordionHeader>
      <AccordionTrigger>
        <Text>B</Text>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>
      <Text>Panel B</Text>
    </AccordionPanel>
  </AccordionItem>
</Accordion>
```

### Disabled item

```tsx
<AccordionItem value="locked" disabled>
  <AccordionHeader>
    <AccordionTrigger>
      <Text>Locked</Text>
    </AccordionTrigger>
  </AccordionHeader>
  <AccordionPanel>
    <Text>Unavailable</Text>
  </AccordionPanel>
</AccordionItem>
```

### Keep panel mounted

```tsx
<AccordionPanel keepMounted>
  <Text>Stays in the tree when closed</Text>
</AccordionPanel>
```

## API

### `Accordion`

| Prop       | Type                                       | Default | Notes                    |
| ---------- | ------------------------------------------ | ------- | ------------------------ |
| `value`    | `string[]`                                 | —       | Open item values         |
| `multiple` | `boolean`                                  | —       | Allow several open items |
| `disabled` | `boolean`                                  | —       | Disables the whole root  |
| `children` | `JSX.Element`                              | —       | `AccordionItem` tree     |
| `onChange` | `(event: { value: string[] }) => void`     | —       |                          |

### `AccordionItem`

| Prop       | Type          | Default | Notes              |
| ---------- | ------------- | ------- | ------------------ |
| `value`    | `string`      | —       | Required item id   |
| `disabled` | `boolean`     | —       |                    |
| `children` | `JSX.Element` | —       | Header + panel     |

### `AccordionHeader`

| Prop       | Type          | Default | Notes        |
| ---------- | ------------- | ------- | ------------ |
| `level`    | `number`      | —       | Heading level |
| `children` | `JSX.Element` | —       | Trigger      |

### `AccordionTrigger`

| Prop                 | Type                 | Default | Notes                                      |
| -------------------- | -------------------- | ------- | ------------------------------------------ |
| `accessibilityLabel` | `string \| null`     | —       |                                            |
| `children`           | `JSX.Element`        | —       | Defaults to a `"Section"` `Text` if omitted |

### `AccordionPanel`

| Prop                 | Type             | Default | Notes                |
| -------------------- | ---------------- | ------- | -------------------- |
| `reveal`             | `boolean`        | `true`  |                      |
| `keepMounted`        | `boolean`        | —       |                      |
| `accessibilityLabel` | `string \| null` | —       |                      |
| `children`           | `JSX.Element`    | —       | Panel body           |

## Differences

| Topic        | shadcn                                              | This package                                           |
| ------------ | --------------------------------------------------- | ------------------------------------------------------ |
| Panel part   | `AccordionContent`                                  | `AccordionPanel`                                       |
| Open state   | `type` / `value` / `defaultValue` (often single)    | `value: string[]` + `multiple` + `onChange`            |
| Trigger API  | `AccordionTrigger` with chevron slot conventions    | styled trigger; children or default `"Section"` label  |
| Class hooks  | `className` / CVA                                   | theme tokens + locked styles inside the wrapper        |

## Not forwarded

From `nsh/base` Accordion parts: root/item/trigger/panel style hooks (`style`, `focusStyle`, …). The wrapper sets disabled opacity on the root, item borders, trigger row chrome, and defaults `reveal` to `true` on the panel. Extend the copied source if you need base knobs.
