---
layout: ../../../layouts/Docs.astro
title: Progress
description: A determinate or indeterminate bar on the shared meter rail.
component: true
demo: progress
---

## Installation

```sh
npx shadcn-nsh@latest add progress
```

## Usage

```tsx
import { Progress } from "@/components/ui/progress";
```

```tsx
<Progress value={35} />
```

## Examples

### Tone

```tsx
<Progress value={100} tone="up" />
```

### Thin rail

```tsx
<Progress value={60} height={4} style={{ width: 240 }} />
```

### Indeterminate

Pass a shared `progressSweep()` from the look and set `indeterminate`.

```tsx
const sweep = progressSweep();
<Progress indeterminate sweep={sweep} style={{ width: 240 }} />;
```

## API

Uses `progressLook`. Every prop of [`nsh/base` Progress](https://nsh.dev/elements/progress) passes through.

| Prop     | Type            | Default |
| -------- | --------------- | ------- |
| `height` | `number`        | `6`     |
| `tone`   | `Tone`          | citrus  |
| `sweep`  | `ProgressSweep` |         |
