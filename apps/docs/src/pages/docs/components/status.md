---
layout: ../../../layouts/Docs.astro
title: Status
description: A dot and label for quiet state in rows or headers.
component: true
demo: status
---

## Installation

```sh
npx shadcn-nsh@latest add status
```

## Usage

```tsx
import { Status } from "@/components/ui/status";
```

```tsx
<Status label="Online" tone="up" />
```

## Examples

### Neutral

```tsx
<Status label="Idle" />
```

## API

Gallery atom: no `nsh/base` counterpart.

| Prop    | Type     | Default    |
| ------- | -------- | ---------- |
| `label` | `string` | (required) |
| `tone`  | `Tone`   |            |
