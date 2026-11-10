---
layout: ../../../layouts/Docs.astro
title: Scrollbar
description: Styled scrollbar wrapping nsh/base Scrollbar.
component: true
demo: scrollbar
demoHeight: 320
---

[`nsh/base`](https://nsh.dev/elements/scrollbar) owns the thumb's length and place, dragging, track presses, and the fade. This package paints the track and the thumb. Turn the scroll view's own indicator off with `scrollbar={false}`.

## Install

```npx tabs
npx shadcn-nsh@latest add scrollbar
```

```bunx tabs
bunx shadcn-nsh@latest add scrollbar
```

```pnx tabs
pnx shadcn-nsh@latest add scrollbar
```

```yarn tabs
yarn dlx shadcn-nsh@latest add scrollbar
```

## Usage

```tsx
import { Scrollbar, scrollbarTheme } from "@workspace/ui/components/ui/scrollbar";

// Once, at startup: every scroll view whose `scrollbar` is still `true`.
Scrollbar.setTheme(scrollbarTheme());

// Or one bar, placed by the app.
<View style={{ width: 280, height: 180, position: "relative" }}>
  <Scroll ref={inbox} scrollbar={false} style={{ width: 280, height: 180 }}>
    {rows}
  </Scroll>
  <Scrollbar scroll={inbox} accessibilityLabel="Messages" />
</View>;
```

`setTheme()` with no argument installs this look. `Scrollbar.setTheme(null)` gives the views the platform indicator back.

## API

The placed bar defaults to `mode="hover"` and the motion below. A consumer value replaces the default; `null` is passed through.

| Piece        | Default                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Track        | 16 points on the trailing or bottom edge, padded 4 (2 on a touch screen). `minWidth` or `minHeight` 16          |
| Thumb        | `muted-foreground` at 60% opacity. 6 points at rest (3 on a touch screen), 8 under the pointer or while dragged |
| `mode`       | `"hover"` (base's default is `"scrolling"`)                                                                     |
| `motion`     | Idle 2000 ms, enter 300 ms, exit 500 ms, fade in, slide-and-fade when the pointer finds a hidden thumb          |
| Thumb motion | `transition-all` `duration-300`, cancelled by `motion-reduce`                                                   |

`scrollbarVariants({ axis })` returns that chrome. `scrollbarTheme()` is the vertical and horizontal pair for `Scrollbar.setTheme`.

The thumb color is a style, so a `hover:` background on `thumbClass` does not replace it. Widen or recolor by passing `thumbStyle`.

## Differences

| Topic          | Reference (`scrollbar-theme.ts`)                        | This package                                                                                            |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Thumb color    | Opaque `scrollbar-thumb` mixed into the page            | `muted-foreground` at 60%. That gallery token is not in this theme, and no `custom-*` key is added      |
| Hover color    | A darker thumb token                                    | Opacity rises to 90%. The fill stays `muted-foreground`, because an inline color outranks a hover class |
| `mode`         | `"hover"`                                               | Same. Pass `"scrolling"` or `"always"` to match base or to keep the bar up                              |
| Exit           | 500 ms                                                  | Kept. It is scrollbar.md's native fade, not a CSS `duration-*`                                          |
| Reduced motion | Base skips the fade for `always` and for reduced motion | The thumb's width transition also sets `motion-reduce:transition-none`                                  |
| shadcn         | `ScrollArea` is a different primitive                   | There is no `scroll-area` registry id. This is `Scrollbar`                                              |

## Accessibility

The bar's role is `scrollbar`. Set `accessibilityLabel` to what it moves ("Messages"), not the word "scrollbar". The track takes presses; the thumb is the indicator inside that 16-point band, including on a touch screen, where the thumb itself is 3 points. Hidden, the bar takes no presses.
