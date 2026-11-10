---
layout: ../../../layouts/Docs.astro
title: Time Field
description: Styled time field wrapping nsh/base TimeField — theme tokens for the well and the segments.
component: true
demo: time-field
demoHeight: 200
---

A time of day edited one segment at a time. The keyboard and the segments stay in `nsh/base` TimeField. This package paints the field well and the focused segment.

## Install

```sh
shadcn-nsh add time-field
# monorepo:
shadcn-nsh add time-field -c apps/web
```

## Usage

```tsx
import { TimeField } from "@workspace/ui/components/ui/time-field";

<TimeField value={time()} onChange={({ value }) => time.set(value)} />;
```

## API

### `TimeField`

| Prop                     | Type                       | Notes                                                                             |
| ------------------------ | -------------------------- | --------------------------------------------------------------------------------- |
| `value` / `defaultValue` | `string`                   | `"HH:MM"` or `"HH:MM:SS"`. The clock is 24-hour even when the field shows AM / PM |
| `precision`              | `"minute"` \| `"second"`   | `"minute"` is the default                                                         |
| `hourCycle`              | `"h23"` \| `"h12"`         | `"h12"` adds an AM / PM segment                                                   |
| `disabled`               | `boolean`                  | No focus and no editing                                                           |
| `renderSegment`          | `(segment) => JSX.Element` | Replaces the digits. `undefined` keeps them; the consumer owns them whole         |
| `onChange`               | `({ value }) => void`      | Each edit. A `value` the app sets is not reported                                 |

`class`, `style`, `hoverStyle`, `segmentClass`, `segmentStyle`, and `separatorStyle` merge over the chrome. `timeFieldVariants()` returns the well (minimum height 32 pointer, 44 touch); read it inside `computed`.

## Differences

| Topic    | shadcn                            | This package / `nsh/base`                                                                                                        |
| -------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Shape    | Often an input with a time picker | Segments inside a field well. There is no popover                                                                                |
| Focus    | Outline on the input              | The segment fills with `primary` and the digits use `primary-foreground`. The well keeps the field hover edge, not a second ring |
| Well     | —                                 | `background` plus `finish.control.pressed` (the reference's `finish.field`). Radius is `radius.control`                          |
| Disabled | opacity                           | The theme's 0.5                                                                                                                  |

## Accessibility

The field is one control named by `accessibilityLabel`. Digits, Up and Down, and `a` / `p` edit the selected segment. Left and Right move between segments. A press selects a segment.
