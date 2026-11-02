---
layout: ../../../layouts/Docs.astro
title: Progress
description: Styled progress wrapping nsh/base Progress — theme tokens; full base prop pass-through.
component: true
demo: progress
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns the progressbar role, the 0–100 range and value for screen readers, and the determinate indicator width from `value` — unstyled on every platform. This package is the styled layer on top: muted track / primary indicator chrome and theme tokens, the same role a community library plays above `nsh/base`. [`Progress`](https://nsh.dev/elements/progress) reports how far a known task is, or an indeterminate busy state whose indicator width the app (or this wrapper’s default) supplies; behavior and style hooks stay on base and are forwarded. shadcn `bases/base` Progress has no `variant` / `size`; this wrapper adds theme defaults only.

## Install

```bash
npx shadcn-nsh@latest add progress
bunx shadcn-nsh@latest add progress
pnx shadcn-nsh@latest add progress
yarn dlx shadcn-nsh@latest add progress
```

## Usage

```tsx
import { Progress } from "@workspace/ui/components/ui/progress";

<Progress value={55} accessibilityLabel="Upload" />;
```

## Determinate

```tsx
const [sent, setSent] = createSignal(40);

<Progress value={sent()} accessibilityLabel="Uploading photos" />;
```

## Indeterminate

While the extent is unknown, set `indeterminate`. The wrapper defaults the indicator to `w-1/3`; override with `indicatorClass` / `indicatorStyle` (and motion) as needed.

```tsx
<Progress indeterminate accessibilityLabel="Connecting" />
```

## With label children

```tsx
<Progress value={56} accessibilityLabel="Upload progress">
  <Text>Upload progress · 56%</Text>
</Progress>
```

## Style override

Wrapper token chrome, then consumer styles shallow-merge on top (consumer wins per key). `class` / `trackClass` / `indicatorClass` concatenate when both are set. Determinate width stays on base — do not set `width` unless you intend to replace it (as for indeterminate).

```tsx
<Progress
  value={sent()}
  style={{ gap: 8 }}
  trackStyle={{ height: 8 }}
  indicatorStyle={{ backgroundColor: colors.destructive }}
  indicatorClass="rounded-sm"
>
  <Text>Thicker track</Text>
</Progress>
```

## API

### Props

| Prop                 | Type                   | Default | Notes                                                                                 |
| -------------------- | ---------------------- | ------- | ------------------------------------------------------------------------------------- |
| `value`              | `number`               | `0`     | 0–100 (clamped by base); drives determinate indicator width and screen-reader value   |
| `indeterminate`      | `boolean`              | —       | No `aria-valuenow`; wrapper defaults `indicatorClass` to `w-1/3` under consumer class |
| `accessibilityLabel` | `string \| null`       | —       | Forwarded                                                                             |
| `children`           | `JSX.Element`          | —       | Label / value text after the track                                                    |
| `trackClass`         | `string`               | —       | Forwarded; concatenated after any wrapper class                                       |
| `trackStyle`         | `StyleProp<ViewStyle>` | —       | Merged over token track chrome (consumer wins per key)                                |
| `indicatorClass`     | `string`               | —       | Merged after wrapper `w-1/3` while indeterminate; a `w-*` here replaces value width   |
| `indicatorStyle`     | `StyleProp<ViewStyle>` | —       | Merged over token indicator chrome (no default width while determinate)               |
| `class`              | `string`               | —       | Forwarded; concatenated after any wrapper class                                       |
| `style`              | `StyleProp<ViewStyle>` | —       | Merged over root chrome (`gap` / `alignItems`)                                        |
| `hoverStyle`         | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                                     |
| `activeStyle`        | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                                     |
| `focusStyle`         | `StyleProp<ViewStyle>` | —       | Forwarded / merge (progress is not focusable by default)                              |
| `disabledStyle`      | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                                     |
| `classList`          | object                 | —       | Forwarded                                                                             |
| `testID`             | string                 | —       | Forwarded                                                                             |
| `tooltip`            | string                 | —       | Forwarded                                                                             |
| `onLayout`           | function               | —       | Forwarded                                                                             |
| `ref`                | ref                    | —       | Forwarded                                                                             |

Remaining `ProgressProps` / `ComponentHostProps` from `nsh/base` also pass through.

### Events

None — Progress reports only; controls that start or stop the task are the app’s.

## Differences

| Topic           | shadcn (`bases/base`)                                  | This package                                                                                   |
| --------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Parts           | `Progress` + `Track` / `Indicator` / `Label` / `Value` | single `Progress`; track / indicator chrome via style hooks; label is `children`               |
| Value scale     | Base UI root `value`                                   | `nsh/base` `value` 0–100; base clamps and sets indicator width                                 |
| Busy state      | custom / omit value                                    | `indeterminate` + default `w-1/3` indicator class                                              |
| Class hooks     | `className` / `cn-progress*`                           | `class` + token `style` / `trackStyle` / `indicatorStyle`; consumer styles merge over defaults |
| Composition API | compound tree                                          | flat export (same as `nsh/base`); no fabricated Track/Indicator components                     |

## Not forwarded

None — all `nsh/base` Progress props are forwarded. The wrapper only applies token track / indicator chrome and a default indeterminate `w-1/3` indicator class, and merges its defaults under consumer style hooks (`class` / `trackClass` / `indicatorClass` concatenate).
