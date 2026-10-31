---
layout: ../../../layouts/Docs.astro
title: Popover
description: Styled popover wrapping nsh/base Popover.
component: true
demo: popover
demoHeight: 360
---

Styled popover on `nsh/base` Popover with fixed surface padding and offset.

## Install

```sh
shadcn-nsh add popover
# monorepo:
shadcn-nsh add popover -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { Popover } from "@workspace/ui/components/ui/popover";
import { Text } from "nsh";

<Popover trigger={<Button onPress={() => {}}>Open</Button>}>
  <Text>Popover content</Text>
</Popover>;
```

## API

| Prop           | Type                                                 | Notes |
| -------------- | ---------------------------------------------------- | ----- |
| `open`         | `boolean \| null`                                    |       |
| `defaultOpen`  | `boolean`                                            |       |
| `trigger`      | `JSX.Element`                                        |       |
| `children`     | `JSX.Element`                                        |       |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` |       |
| `onOpen`       | `() => void`                                         |       |
| `onClose`      | `() => void`                                         |       |

<div class="callout">

**Not forwarded:** `offset` (fixed to `4`) and `popupStyle`.

</div>
