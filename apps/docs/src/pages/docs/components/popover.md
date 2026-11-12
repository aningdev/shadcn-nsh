---
title: Popover
description: A popup panel that grows from its trigger, on the shared menu surface.
component: true
demo: popover
---

## Installation

```sh
npx shadcn-nsh@latest add popover
```

## Usage

```tsx
import { Popover } from "@/components/ui/popover";
```

```tsx
<Popover trigger={<Button>Order 1024</Button>} width={260}>
  Shipped yesterday
</Popover>
```

## Examples

### Compact

```tsx
<Popover compact trigger={<Button>Note</Button>}>
  A small note
</Popover>
```

### The look alone

```tsx
<Popover trigger={<Button>Open</Button>}>
  <PopIn side="bottom" style={popoverLook({ width: 260 })}>
    …
  </PopIn>
</Popover>
```

## API

Every prop of [`nsh/base` Popover](https://nsh.dev/elements/popover) passes through. The shell wraps children in `PopIn` with `popoverLook`.

| Prop      | Type      | Default |
| --------- | --------- | ------- |
| `compact` | `boolean` |         |
| `width`   | `number`  |         |
