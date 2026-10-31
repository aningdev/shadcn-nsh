---
layout: ../../../layouts/Docs.astro
title: Tooltip
description: Styled tooltip wrapping nsh/base Tooltip.
component: true
---

Styled tooltip on `nsh/base` Tooltip. Pass the element as another control’s `tooltip={…}` prop.

## Install

```sh
shadcn-nsh add tooltip
# monorepo:
shadcn-nsh add tooltip -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { Tooltip } from "@workspace/ui/components/ui/tooltip";
import { Text } from "nsh";

<Button
  tooltip={
    <Tooltip>
      <Text>Add item</Text>
    </Tooltip>
  }
  onPress={() => {}}
>
  Add
</Button>;
```

## API

| Prop           | Type                                                 | Default | Notes |
| -------------- | ---------------------------------------------------- | ------- | ----- |
| `open`         | `boolean \| null`                                    | —       |       |
| `defaultOpen`  | `boolean`                                            | —       |       |
| `placement`    | `Placement`                                          | `"top"` |       |
| `delay`        | `number`                                             | —       |       |
| `disabled`     | `boolean`                                            | —       |       |
| `children`     | `JSX.Element`                                        | —       |       |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` | —       |       |

<div class="callout">

**Not forwarded:** `offset` (fixed to `6`) and tooltip `style` chrome.

</div>
