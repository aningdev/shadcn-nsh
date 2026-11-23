---
title: Progress
description: A determinate or indeterminate progress bar.
component: true
demo: progress
---

## Installation

```npm
npx shadcn-nsh@latest add progress
```

## Usage

```tsx
import { Progress, ProgressStep, ProgressSteps } from "@/components/ui/progress";
```

```tsx
<Progress value={35} />
```

## Composition

Use the following composition to build a `Progress` with steps:

```text
Progress
└── ProgressSteps
    └── ProgressStep
```

## Examples

### Tone

```tsx
<Progress value={72} tone="neutral" />
<Progress value={72} tone="accent" />
<Progress value={72} tone="info" />
<Progress value={72} tone="warn" />
<Progress value={72} tone="destructive" />
<Progress value={72} tone="up" />
<Progress value={72} tone="down" />
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

### Marker

`marker` is where a limit stands, a percentage along the bar: a hairline crossing the rail and
standing past it. The hairline is drawn on the bar's own frame, so the rail comes first in the
bar's row and a label goes after it.

```tsx
<Progress value={83} marker={90} />
<Progress value={92} marker={85} tone="warn" />
```

### Steps

`ProgressSteps` draws step marks on the bar, a `ProgressStep` each, with `state` `done`, `current` or `upcoming`. The bar runs from the first mark's middle to the last's, so the row hangs half a mark (`progressStepSize()`) past each end: give the `Progress` that room at its sides. `value` stays the app's (0 at the first step, 100 at the last), as do Back and Next. A done step shows a check that pops in; the current one a ring and a dot; reduced motion lands each at once. A string child is the label under the mark and, with the state, its name for screen readers. Middle labels are centred under their marks; the first starts at its mark's outer edge and the last ends at its, so no label hangs past the half mark. The row is laid out left to right whatever the reading direction, as the bar fills.

```tsx
<View style={{ paddingHorizontal: progressStepSize() / 2 }}>
  <Progress value={(step() / 3) * 100} height={4} accessibilityLabel="Setup">
    <ProgressSteps>
      <ProgressStep state="done">Account</ProgressStep>
      <ProgressStep state="current">Profile</ProgressStep>
      <ProgressStep state="upcoming">Team</ProgressStep>
      <ProgressStep state="upcoming">Review</ProgressStep>
    </ProgressSteps>
  </Progress>
</View>
```

## API

Uses `progressLook`. Every prop of [`nsh/base` Progress](https://nsh.dev/elements/progress) passes through.

| Part            | Props                                                                                                                                       | Description                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `Progress`      | `height` (`number`, default `6`), `tone` (`Tone \| (() => Tone)`, default citrus), `sweep` (`ProgressSweep`), `marker` (`number`, 0 to 100) | Uses `progressLook`; `marker` stands a hairline at the limit        |
| `ProgressSteps` | every `nsh` View prop                                                                                                                       | The row of marks over the bar, centred on it; a child of `Progress` |
| `ProgressStep`  | `state` (`"done" \| "current" \| "upcoming"`, default `upcoming`), `children` (a string is the label)                                       | One mark, its label under it                                        |

`progressStepsLook()`, `ProgressStepMark` and `progressStepSize()` are the look's parts, for a row of your own.
