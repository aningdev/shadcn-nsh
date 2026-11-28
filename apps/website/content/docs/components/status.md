---
title: Status
description: A dot and label for quiet state in rows or headers.
component: true
demo: status
---

## Installation

```npm
npx shadcn-nsh@latest add status
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Status } from "shadcn-nsh/status";
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
<Status label="Offline" tone="destructive" />
<Status label="Online" tone="up" />
<Status label="Down" tone="down" />
```

## API

Gallery atom: no `nsh/base` counterpart.

| Part     | Props           | Description                                                                       |
| -------- | --------------- | --------------------------------------------------------------------------------- |
| `Status` | `label`, `tone` | A dot and a word, 12 points; a tone that matters tints both, neutral stays quiet. |
