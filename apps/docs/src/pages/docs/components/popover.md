---
layout: ../../../layouts/Docs.astro
title: Popover
description: Styled popover wrapping nsh/base Popover.
component: true
demo: popover
demoHeight: 360
---

Styled anchored surface on `nsh/base` Popover with fixed surface padding and offset. Single root — pass the open control via `trigger`, compose body as `children`.

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

## Composition

```
Popover
├─ trigger (prop)
└─ children (body — you own layout)
```

Unlike shadcn’s `PopoverTrigger` / `PopoverContent` tree, this wrapper is one `Popover` root.

## Examples

### Controlled open

```tsx
const [open, setOpen] = createSignal(false);

<Popover
  open={open()}
  onOpenChange={(e) => setOpen(e.open)}
  trigger={<Button onPress={() => setOpen(true)}>Open popover</Button>}
>
  <Text>Quick tip</Text>
  <Button variant="outline" onPress={() => setOpen(false)}>
    Close
  </Button>
</Popover>
```

### Uncontrolled

```tsx
<Popover defaultOpen={false} trigger={<Button onPress={() => {}}>Info</Button>}>
  <Text>Default open state via defaultOpen</Text>
</Popover>
```

## API

| Prop           | Type                                                 | Notes           |
| -------------- | ---------------------------------------------------- | --------------- |
| `open`         | `boolean \| null`                                    | Controlled open |
| `defaultOpen`  | `boolean`                                            |                 |
| `trigger`      | `JSX.Element`                                        | Open control    |
| `children`     | `JSX.Element`                                        | Body content    |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` |                 |
| `onOpen`       | `() => void`                                         |                 |
| `onClose`      | `() => void`                                         |                 |

## Differences

| Topic       | shadcn                                              | This package                                              |
| ----------- | --------------------------------------------------- | --------------------------------------------------------- |
| Parts       | `Popover` / `Trigger` / `Content` / `Anchor` / …    | single `Popover`; compose children yourself               |
| Trigger     | `PopoverTrigger` inside the tree                    | `trigger` prop on the root                                |
| Close UI    | app-built inside content                            | same — no built-in close control                          |
| Presentation| Radix portal + content chrome                       | nsh Popover + fixed surface styles (`offset` locked to 4) |

## Not forwarded

From `nsh/base` Popover: `offset` (fixed to `4`) and `popupStyle`. This wrapper does not set `backdropStyle` (unlike menu / select). Surface chrome is owned by the wrapper.
