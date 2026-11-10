---
layout: ../../../layouts/Docs.astro
title: Calendar
description: Styled calendar wrapping nsh/base Calendar — theme tokens for days, range, today, and month toggles.
component: true
demo: calendar
demoHeight: 420
---

A month of days on `nsh/base` Calendar. Selection, the keyboard, and the month and year views stay in base. This package paints the days.

## Install

```sh
shadcn-nsh add calendar
# monorepo:
shadcn-nsh add calendar -c apps/web
```

## Usage

```tsx
import { Calendar } from "@workspace/ui/components/ui/calendar";

<Calendar value={day()} onChange={({ value }) => day.set(value)} />;
```

## API

### `Calendar`

| Prop                     | Type                                   | Notes                                                                      |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------------------- |
| `value` / `defaultValue` | `CalendarValue`                        | An ISO date, a `[start, end]` range, or `null`                             |
| `range`                  | `boolean`                              | The first press starts the range, the second ends it                       |
| `numberOfMonths`         | `number`                               | Months side by side. Each month's title replaces the toggles               |
| `firstDayOfWeek`         | `number`                               | `0` Sunday through `6` Saturday                                            |
| `disabledMatcher`        | `DateMatcher`                          | Dates that cannot be picked                                                |
| `yearRange`              | `[number, number]`                     | The year view's `[start, end)`                                             |
| `renderItem`             | `(item: CalendarEntry) => JSX.Element` | Replaces the default day. `undefined` keeps it; the consumer owns it whole |
| `onChange`               | `({ value }) => void`                  | A complete day or a completed range                                        |

`headerStyle`, `bodyStyle`, `itemClass`, and `style` merge over the chrome. `calendarVariants()` returns the cell size (`30` pointer, `42` touch) and that chrome; read it inside `computed`.

Month and weekday names are English. Pass `renderItem` for another language. Base leaves those names to the app.

## Differences

| Topic                   | shadcn                                   | This package / `nsh/base`                                                                                          |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Shape                   | `DayPicker` plus caption and nav buttons | One `Calendar`. Items are drawn from `CalendarEntry`, not child components                                         |
| Today                   | `bg-accent`                              | `accent`, the quiet fill. The reference's brand tint has no token                                                  |
| Selected / range ends   | `bg-primary`                             | `primary` with `primary-foreground`                                                                                |
| Range middle            | `bg-accent`                              | An `accent` band. Ends stay `primary` circles                                                                      |
| Other months / disabled | muted                                    | `muted-foreground`. Disabled is 0.5, not the reference's 0.3 on arrows                                             |
| Keyboard day            | ring                                     | A `ring` edge on the day circle (`group-focus:`). Base draws each item once, so the ring cannot be an inline color |
| Press                   | —                                        | `active:opacity-70`. A press sink needs a per-item style, which base does not have                                 |
| Locale                  | `date-fns` locale                        | No locale prop in base 0.4.0. Names are English unless `renderItem` replaces them                                  |

## Accessibility

The days are one tab stop. Arrows move a day, Home and End a week, Page Up and Page Down a month, Return and Space pick. Previous and Next are named "Previous month" and "Next month" unless those labels are set. Disabled days are skipped and announced dimmed.
