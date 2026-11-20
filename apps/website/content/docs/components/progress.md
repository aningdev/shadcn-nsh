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
import { Progress } from "@/components/ui/progress";
```

```tsx
<Progress value={35} />
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

## API

Uses `progressLook`. Every prop of [`nsh/base` Progress](https://nsh.dev/elements/progress) passes through.

| Part       | Props                                                                                                                                       | Description                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `Progress` | `height` (`number`, default `6`), `tone` (`Tone \| (() => Tone)`, default citrus), `sweep` (`ProgressSweep`), `marker` (`number`, 0 to 100) | Uses `progressLook`; `marker` stands a hairline at the limit |
