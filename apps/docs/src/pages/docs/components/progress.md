---
layout: ../../../layouts/Docs.astro
title: Progress
description: Styled progress wrapping nsh/base Progress.
component: true
demo: progress
---

Styled progress bar on `nsh/base` Progress. Determinate fill from `value` (0–100); set `indeterminate` for a fixed-width busy indicator.

## Install

```sh
shadcn-nsh add progress
# monorepo:
shadcn-nsh add progress -c apps/web
```

## Usage

```tsx
import { Progress } from "@workspace/ui/components/ui/progress";

<Progress value={55} />
```

## Examples

### Determinate

```tsx
<Progress value={volume()} />
```

### Indeterminate

```tsx
<Progress indeterminate />
```

### With label children

```tsx
<Progress value={55}>
  <Text>Uploading…</Text>
</Progress>
```

## API

| Prop                 | Type              | Default | Notes                                           |
| -------------------- | ----------------- | ------- | ----------------------------------------------- |
| `value`              | `number`          | —       | Clamped to 0–100 for indicator width            |
| `indeterminate`      | `boolean`         | —       | Uses a fixed ~33% indicator instead of `value`  |
| `accessibilityLabel` | `string \| null`  | —       |                                                 |
| `children`           | `JSX.Element`     | —       | Optional adjacent content                       |

## Differences

| Topic       | shadcn                                      | This package                                           |
| ----------- | ------------------------------------------- | ------------------------------------------------------ |
| Parts       | `Progress` + `ProgressIndicator`            | single `Progress`; track/indicator chrome built in     |
| Value scale | often 0–100 via Radix                       | `value` number; wrapper clamps for width               |
| Busy state  | custom animation / omit value               | `indeterminate` prop                                   |
| Class hooks | `className`                                 | theme tokens + locked track/indicator styles           |

## Not forwarded

From `nsh/base` Progress: `style`, `trackStyle`, and `indicatorStyle`. The wrapper owns the muted track and primary fill (including indeterminate width).
