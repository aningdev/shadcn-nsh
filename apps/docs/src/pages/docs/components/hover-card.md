---
title: Hover Card
description: A preview card that grows from its trigger, on the shared popover surface.
component: true
demo: hover-card
---

## Installation

```sh
npx shadcn-nsh@latest add hover-card
```

## Usage

```tsx
import { HoverCard } from "@/components/ui/hover-card";
```

```tsx
<HoverCard trigger={<Button>@nsh</Button>} width={240}>
  Native Shell
</HoverCard>
```

## API

Every prop of [`nsh/base` HoverCard](https://nsh.dev/elements/hover-card) passes through. The shell wraps children in `PopIn` with `popoverLook`.

| Prop      | Type      | Default |
| --------- | --------- | ------- |
| `compact` | `boolean` |         |
| `width`   | `number`  |         |
