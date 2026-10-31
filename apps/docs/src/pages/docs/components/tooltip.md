---
layout: ../../../layouts/Docs.astro
title: Tooltip
description: Styled tooltip wrapping nsh/base Tooltip.
component: true
demo: tooltip
demoHeight: 360
---

Styled hover/focus hint on `nsh/base` Tooltip. Prefer attaching it via a host element’s `tooltip={…}` prop (see source comment). The styled `Button` in this package does **not** forward `tooltip` — use an `nsh` / `nsh/base` host that accepts it.

## Install

```sh
shadcn-nsh add tooltip
# monorepo:
shadcn-nsh add tooltip -c apps/web
```

## Usage

```tsx
import { Tooltip } from "@workspace/ui/components/ui/tooltip";
import { Text } from "nsh";
import { Button as BaseButton } from "nsh/base";

<BaseButton
  tooltip={
    <Tooltip>
      <Text>Add item</Text>
    </Tooltip>
  }
  onPress={() => {}}
>
  <Text>Add</Text>
</BaseButton>;
```

## Examples

### Placement

```tsx
<BaseButton
  tooltip={
    <Tooltip placement="bottom">
      <Text>Below the control</Text>
    </Tooltip>
  }
  onPress={() => {}}
>
  <Text>Hover me</Text>
</BaseButton>
```

### Delay

```tsx
<BaseButton
  tooltip={
    <Tooltip delay={400}>
      <Text>Slightly delayed</Text>
    </Tooltip>
  }
  onPress={() => {}}
>
  <Text>Wait…</Text>
</BaseButton>
```

### Controlled open

```tsx
const [open, setOpen] = createSignal(false);

<Tooltip open={open()} onOpenChange={(e) => setOpen(e.open)}>
  <Text>Forced open state</Text>
</Tooltip>
```

## API

| Prop           | Type                                                 | Default | Notes              |
| -------------- | ---------------------------------------------------- | ------- | ------------------ |
| `open`         | `boolean \| null`                                    | —       | Controlled open    |
| `defaultOpen`  | `boolean`                                            | —       |                    |
| `placement`    | `Placement`                                          | `"top"` |                    |
| `delay`        | `number`                                             | —       |                    |
| `disabled`     | `boolean`                                            | —       |                    |
| `children`     | `JSX.Element`                                        | —       | Tip content        |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` | —       |                    |

`Placement` is the nsh placement type.

## Differences

| Topic       | shadcn                                                         | This package                                                                  |
| ----------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Parts       | `Tooltip` / `TooltipTrigger` / `TooltipContent` / `TooltipProvider` | single `Tooltip`; host via element `tooltip={…}` (or controlled `open`)  |
| Trigger     | wrap a trigger as a child                                      | typically assigned to another element’s `tooltip` prop                        |
| Provider    | `TooltipProvider` for shared delay                             | per-instance `delay` / `placement` on `Tooltip`                               |
| Presentation| Radix portal + content chrome                                  | nsh Tooltip + fixed padding/radius/foreground fill (`offset` locked to `6`)   |

## Not forwarded

From `nsh/base` Tooltip: `offset` (fixed to `6`) and `style` (padding, radius, foreground background). Presentation defaults `placement` to `"top"` when omitted.
