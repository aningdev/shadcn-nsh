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

### Tone

```tsx
<Status label="Idle" tone="neutral" />
<Status label="Syncing" tone="accent" />
<Status label="Update available" tone="info" />
<Status label="Degraded" tone="warn" />
<Status label="Offline" tone="danger" />
<Status label="Online" tone="up" />
<Status label="Down" tone="down" />
```

## API

Gallery atom: no `nsh/base` counterpart.

| Prop    | Type                   | Default    |
| ------- | ---------------------- | ---------- |
| `label` | `string`               | (required) |
| `tone`  | `Tone \| (() => Tone)` |            |
