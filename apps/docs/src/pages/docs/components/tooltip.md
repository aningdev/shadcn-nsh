---
title: Tooltip
description: A popover-coloured hint bubble on any element's `tooltip` prop.
component: true
demo: tooltip
---

## Installation

```sh
npx shadcn-nsh@latest add tooltip
```

## Usage

```tsx
import { Tooltip } from "@/components/ui/tooltip";
```

```tsx
<Button tooltip={<Tooltip>Add to favorites</Tooltip>}>Star</Button>
```

## Examples

### Placement

```tsx
<Button tooltip={<Tooltip placement="top">Hint</Tooltip>}>Top</Button>
<Button tooltip={<Tooltip placement="bottom">Hint</Tooltip>}>Bottom</Button>
```

### Rich

```tsx
<Tooltip rich>
  <Text class={tooltipText}>Delete forever</Text>
  <Text class={tooltipNote}>⌘⌫</Text>
</Tooltip>
```

### The look alone

```tsx
<Tooltip class={tooltipLook().class}>
  <Text class={tooltipText}>Hint</Text>
</Tooltip>
```

## API

Every prop of [`nsh/base` Tooltip](https://nsh.dev/elements/tooltip) passes through. `class` goes over the look's. Pass the bubble as any element's `tooltip={…}` prop.

| Prop       | Type                    | Default |
| ---------- | ----------------------- | ------- |
| `rich`     | `boolean`               |         |
| `children` | `string \| JSX.Element` |         |
