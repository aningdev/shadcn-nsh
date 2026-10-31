---
layout: ../../../layouts/Docs.astro
title: Dialog
description: Styled dialog wrapping nsh/base Dialog.
component: true
---

Styled modal surface on `nsh/base` Dialog with fixed chrome (backdrop + card padding).

## Install

```sh
shadcn-nsh add dialog
# monorepo:
shadcn-nsh add dialog -c apps/web
```

## Usage

```tsx
import { Dialog } from "@workspace/ui/components/ui/dialog";
import { Text } from "nsh";

<Dialog open onOpenChange={(e) => console.log(e.open)}>
  <Text>Dialog body</Text>
</Dialog>;
```

## API

| Prop           | Type                                                 | Default  | Notes           |
| -------------- | ---------------------------------------------------- | -------- | --------------- |
| `open`         | `boolean`                                            | —        | Controlled open |
| `animation`    | `"slide" \| "fade" \| "none"`                        | `"fade"` |                 |
| `children`     | `JSX.Element`                                        | —        | Body content    |
| `onOpen`       | `() => void`                                         | —        |                 |
| `onClose`      | `() => void`                                         | —        |                 |
| `onCancel`     | `() => void`                                         | —        |                 |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` | —        |                 |

<div class="callout">

**Not forwarded** from `nsh/base` Dialog: `presentation`, `closeOn*` dismiss knobs, and style/backdrop overrides (`style`, `backdropStyle`, …). Presentation and chrome are fixed by this wrapper.

</div>
