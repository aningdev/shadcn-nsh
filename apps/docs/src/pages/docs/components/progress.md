---
layout: ../../../layouts/Docs.astro
title: Progress
description: Styled progress wrapping nsh/base Progress — sunk rail, gliding fill.
component: true
demo: progress
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns the progressbar role, the 0–100 range, and the determinate indicator width — unstyled on every platform. This package paints the rail and the run. A determinate fill is the whole track, slid by what is left (`translate`), so a new value glides. An indeterminate bar is a third of the track sweeping end to end.

## Install

```npx tabs
npx shadcn-nsh@latest add progress
```

```bunx tabs
bunx shadcn-nsh@latest add progress
```

```pnx tabs
pnx shadcn-nsh@latest add progress
```

```yarn tabs
yarn dlx shadcn-nsh@latest add progress
```

## Usage

```tsx
import { Progress } from "@workspace/ui/components/ui/progress";

<Progress value={56} accessibilityLabel="Upload" />;
```

## Indeterminate

The sweep keeps moving when the user asks for less motion: the motion is the “still working” signal. The 180 ms glide does not (`motion-reduce` drops it).

```tsx
<Progress indeterminate accessibilityLabel="Connecting" />
```

## Label

Children sit under the rail (the root is a column with an 8-point gap).

```tsx
<Progress value={56} accessibilityLabel="Upload">
  <Text>56%</Text>
</Progress>
```

## API

### Props

| Prop                 | Type                   | Default | Notes                                                               |
| -------------------- | ---------------------- | ------- | ------------------------------------------------------------------- |
| `value`              | `number`               | —       | Determinate percent, 0 to 100 (from base). The fill glides there    |
| `indeterminate`      | `boolean`              | —       | Unknown extent. The indicator is a third of the track and sweeps    |
| `accessibilityLabel` | `string`               | —       | Forwarded                                                           |
| `class` / `style`    |                        | —       | Root. Default style is a stretching column, `gap: 8`                |
| `trackClass`         | `string`               | —       | Forwarded                                                           |
| `trackStyle`         | `StyleProp<ViewStyle>` | —       | Merged over the 6-point sunk rail                                   |
| `indicatorClass`     | `string`               | —       | Appended after the glide class, or after `w-1/3` when indeterminate |
| `indicatorStyle`     | `StyleProp<ViewStyle>` | —       | Merged over the primary run                                         |
| `children`           | `JSX.Element`          | —       | After the rail                                                      |
| `onLayout`           | function               | —       | Called after the sweep measures the rail                            |

`progressVariants({ value, indeterminate })` returns the same chrome. Call it where those values are read.

### Events

| Event      | Notes                                      |
| ---------- | ------------------------------------------ |
| `onLayout` | `{ bounds }` — also feeds the sweep travel |

## Differences

| Topic         | Reference (`look/meter.ts`)                                    | This package                                                                                |
| ------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Rail          | `colors.track`, `finish.track`                                 | `muted`, an inset `border`, `finish.control.pressed`                                        |
| Run           | Citrus gradient (`finish.fill`), optional tone                 | `primary` with `finish.filled`. No `up` / `warn` / `danger` — neutral has no status scale   |
| Determinate   | `w-full` plus `translate`, 180 ms `cubic-bezier(0.2, 0, 0, 1)` | The same. Base's own width is overridden by `w-full` so the glide is the translate          |
| Indeterminate | Rests in the middle when motion is reduced                     | Keeps sweeping (`ignoreReduceMotion`). The loop is 800 ms, alternate, the reference's curve |
| Height        | 6, or 4 for a thin bar                                         | 6. A fixed stroke (the fill's percentage height needs it). Override `trackStyle.height`     |
| shadcn        | —                                                              | No `variant` / `size`, same as `bases/base` Progress                                        |

## Not forwarded

None — every `nsh/base` Progress prop passes through. The wrapper only adds chrome.
