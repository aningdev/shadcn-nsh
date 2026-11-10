---
layout: ../../../layouts/Docs.astro
title: DiffView
description: Styled diff wrapping nsh/base DiffView.
component: true
demo: diff-view
demoHeight: 280
---

[`nsh/base`](https://nsh.dev/elements/diff-view) owns the diff, the hunks and the scrolling. This package paints the frame and the added and deleted lines. Set a height; the frame's minimum is only a floor.

## Install

```npx tabs
npx shadcn-nsh@latest add diff-view
```

```bunx tabs
bunx shadcn-nsh@latest add diff-view
```

```pnx tabs
pnx shadcn-nsh@latest add diff-view
```

```yarn tabs
yarn dlx shadcn-nsh@latest add diff-view
```

## Usage

```tsx
import { DiffView } from "@workspace/ui/components/ui/diff-view";

<DiffView
  layout="unified"
  oldValue={before()}
  newValue={after()}
  style={{ height: 320 }}
  onStatsChange={(event) => stats.set(event.stats)}
/>;
```

`diffViewVariants()` returns the part chrome. A `classes` or `styles` value of `null` drops that part's default.

## API

| Part                      | Default                                             |
| ------------------------- | --------------------------------------------------- |
| Frame                     | `background`, `border`, control radius, `font-mono` |
| Gutter                    | `muted` fill, `muted-foreground` numbers            |
| Added line, number, bar   | `primary` (line 14%, word 32%)                      |
| Deleted line, number, bar | `destructive` (line 14%, word 32%)                  |
| Selected lines            | `primary` at 18%                                    |
| Separator, filler         | `muted`                                             |
| File header               | `secondary`                                         |

`color` and `backgroundColor` are both set on the indicators, so a bar and a classic `+` / `−` pick up the same hue.

## Differences

| Topic    | `nsh/base`                        | This package                                                    |
| -------- | --------------------------------- | --------------------------------------------------------------- |
| Added    | Green                             | `primary`. The theme has no up/down tokens, and none were added |
| Deleted  | Red                               | `destructive`                                                   |
| Syntax   | The editor's palette inside lines | Kept                                                            |
| Disabled | No such prop                      | Not added. The view is not an editor                            |
| shadcn   | No equivalent                     | Registry id `diff-view`                                         |

## Accessibility

Line numbers stay pressable (`onLineNumberPress`) and selectable (`onLineSelectionChange`). A file header the app draws should be a button that calls the ref's `toggleFile`. This package does not replace `renderFileHeader`.
