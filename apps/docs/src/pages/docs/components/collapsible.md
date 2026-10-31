---
layout: ../../../layouts/Docs.astro
title: Collapsible
description: Styled collapsible wrapping nsh/base Collapsible.
component: true
demo: collapsible
---

Styled collapsible on `nsh/base`. Trigger is `children`; panel is the `content` prop — one root, not a Trigger/Content tree.

## Install

```sh
shadcn-nsh add collapsible
# monorepo:
shadcn-nsh add collapsible -c apps/web
```

## Usage

```tsx
import { Collapsible } from "@workspace/ui/components/ui/collapsible";
import { Text } from "nsh";

<Collapsible
  content={<Text>Hidden until open — shipping leaves before 2 pm.</Text>}
>
  <Text>Shipping details</Text>
</Collapsible>;
```

## Examples

### Controlled open

```tsx
<Collapsible open content={<Text>Panel body</Text>}>
  <Text>Always showing when open</Text>
</Collapsible>
```

### Reveal off

```tsx
<Collapsible reveal={false} content={<Text>No reveal animation</Text>}>
  <Text>Details</Text>
</Collapsible>
```

## API

| Prop      | Type          | Default | Notes                         |
| --------- | ------------- | ------- | ----------------------------- |
| `open`    | `boolean`     | —       | Controlled open               |
| `reveal`  | `boolean`     | `true`  |                               |
| `content` | `JSX.Element` | —       | Collapsible panel             |
| `children`| `JSX.Element` | —       | Trigger / always-visible slot |

## Differences

| Topic       | shadcn                                              | This package                                      |
| ----------- | --------------------------------------------------- | ------------------------------------------------- |
| Parts       | `Collapsible` / `CollapsibleTrigger` / `Content`    | single `Collapsible`; `children` + `content`      |
| Trigger     | nested `CollapsibleTrigger`                         | `children` is the trigger                         |
| Panel       | `CollapsibleContent`                                | `content` prop                                    |
| Class hooks | `className` / CVA                                   | theme tokens + locked styles inside the wrapper   |

## Not forwarded

From `nsh/base` Collapsible: style hooks (`style`, …). The wrapper hardcodes `gap: 0` and defaults `reveal` to `true`. Extend the copied source if you need base knobs.
