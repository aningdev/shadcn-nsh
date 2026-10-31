---
layout: ../../../layouts/Docs.astro
title: Sheet
description: Styled sheet wrapping nsh/base Sheet.
component: true
---

Styled sheet on `nsh/base` Sheet with fixed card chrome; defaults to `side="bottom"`.

## Install

```sh
shadcn-nsh add sheet
# monorepo:
shadcn-nsh add sheet -c apps/web
```

## Usage

```tsx
import { Sheet } from "@workspace/ui/components/ui/sheet";
import { Text } from "nsh";

<Sheet open onOpenChange={(e) => console.log(e.open)}>
  <Text>Sheet body</Text>
</Sheet>;
```

## API

| Prop           | Type                                                 | Default    | Notes     |
| -------------- | ---------------------------------------------------- | ---------- | --------- |
| `open`         | `boolean \| null`                                    | —          |           |
| `defaultOpen`  | `boolean`                                            | —          |           |
| `side`         | `Placement`                                          | `"bottom"` |           |
| `closeOnSwipe` | `boolean`                                            | —          | Forwarded |
| `children`     | `JSX.Element`                                        | —          |           |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` | —          |           |
| `onOpen`       | `() => void`                                         | —          |           |
| `onClose`      | `() => void`                                         | —          |           |

<div class="callout">

**Not forwarded:** `popupStyle` / `backdropStyle` and other surface chrome. Side default is owned here (`"bottom"`).

</div>
