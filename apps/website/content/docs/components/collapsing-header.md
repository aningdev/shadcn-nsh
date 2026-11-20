---
title: CollapsingHeader
description: A page's header that shrinks into a bar as the page scrolls, its picture sliding under the title.
component: true
demo: collapsing-header
---

## Installation

```npm
npx shadcn-nsh@latest add collapsing-header
```

## Usage

```tsx
import { createAnimatedValue } from "nsh";

import {
  CollapsingHeader,
  CollapsingHeaderBackdrop,
  CollapsingHeaderBar,
  CollapsingHeaderDescription,
  CollapsingHeaderTitle,
} from "@/components/ui/collapsing-header";
```

```tsx
const scroll = createAnimatedValue(0);

<Scroll scrollValue={scroll} style={{ flex: 1 }}>
  <CollapsingHeader scroll={scroll} expandedHeight={220} collapsedHeight={56}>
    <CollapsingHeaderBackdrop>{picture}</CollapsingHeaderBackdrop>
    <CollapsingHeaderDescription>160 entries, by week</CollapsingHeaderDescription>
    <CollapsingHeaderBar>
      <CollapsingHeaderTitle>Recent</CollapsingHeaderTitle>
    </CollapsingHeaderBar>
  </CollapsingHeader>
  {rows}
</Scroll>;
```

The header is the top of the page it stands in: at `expandedHeight` while the page is at its top,
down to `collapsedHeight` once the page has scrolled `expandedHeight - collapsedHeight`. Everything
follows `scroll` — the scroll view's `scrollValue` — in interpolated styles, so the collapse runs on
the UI thread with no JS per frame. The picture travels at half the scroll and stretches when the
page is pulled past its top, a cover in the header's fill fades over it, the title shrinks into the
bar and the description fades out above it. The header sticks to the top of the scroll view it is
the first child of, so it holds there once collapsed.

## Composition

Use the following composition to build a `CollapsingHeader`:

```text
CollapsingHeader
├── CollapsingHeaderBackdrop
├── CollapsingHeaderDescription
└── CollapsingHeaderBar
    └── CollapsingHeaderTitle
```

## Examples

### A week's page

The scene of the demo: a header over a list whose week headings stick under the bar. The bar's
height is `collapsingHeaderLook().heights(expandedHeight, collapsedHeight).bar` — the height the
header draws, whole rows in a terminal — so `stickyHeaderOffset` takes it rather than the number
passed in.

```tsx
const OPEN = desktop ? 168 : 220;
const BAR = desktop ? 44 : 56;
const bar = collapsingHeaderLook().heights(OPEN, BAR).bar;

const scroll = createAnimatedValue(0);

<Scroll scrollValue={scroll} style={{ flex: 1 }}>
  <CollapsingHeader scroll={scroll} expandedHeight={OPEN} collapsedHeight={BAR}>
    <CollapsingHeaderBackdrop>
      <Each of={[1, 2, 3, 4]}>
        {(n) => <View style={ring(n())} />}
      </Each>
    </CollapsingHeaderBackdrop>
    <CollapsingHeaderDescription>18 entries, by week</CollapsingHeaderDescription>
    <CollapsingHeaderBar>
      <CollapsingHeaderTitle>Recent</CollapsingHeaderTitle>
    </CollapsingHeaderBar>
  </CollapsingHeader>
  <List
    viewport="parent"
    each={rows}
    estimatedItemSize={density.row}
    stickyHeaderIndices={weeks}
    stickyHeaderOffset={bar}
  >
    {(row) => (row().week ? <Heading … /> : <Row … />)}
  </List>
</Scroll>;
```

### An action in the bar

The bar is a row, so what it holds can act: the title takes the room it needs and a button comes
after it, in reach at every height the header has.

```tsx
const starred = signal(false);

<CollapsingHeader scroll={scroll} expandedHeight={168} collapsedHeight={BAR}>
  <CollapsingHeaderBar>
    <CollapsingHeaderTitle>Inbox</CollapsingHeaderTitle>
    <Button
      size="sm"
      variant={starred() ? "default" : "secondary"}
      onPress={() => starred.set(!starred())}
    >
      {starred() ? "Starred" : "Star"}
    </Button>
  </CollapsingHeaderBar>
</CollapsingHeader>;
```

### A header with no picture

Leave `CollapsingHeaderBackdrop` out: the header is its fill, the description and the title, and
still collapses. A terminal draws no picture either way.

```tsx
<CollapsingHeader scroll={scroll} expandedHeight={96} collapsedHeight={44}>
  <CollapsingHeaderDescription>12 drafts, waiting</CollapsingHeaderDescription>
  <CollapsingHeaderBar>
    <CollapsingHeaderTitle>Drafts</CollapsingHeaderTitle>
  </CollapsingHeaderBar>
</CollapsingHeader>
```

## Differences from shadcn/ui

- **There is no counterpart, and it is a component rather than a recipe.** On the web a collapsing
  header is the app's own: `position: sticky` plus a scroll listener, or `animation-timeline:
  scroll()`, written per page. NSH's `scrollValue` feeds an animated value natively, so the look is
  repeatable here, and the app passes one value instead of writing the animation.
- **Heights are points, and a terminal counts rows.** shadcn's header heights would be CSS lengths;
  `expandedHeight` and `collapsedHeight` are numbers, snapped to whole rows where the character grid
  is the unit.
- **The title scales, it does not change size.** NSH animates a transform, not a font size, so the
  title is drawn at the display role and scales down to the label's size — the same ratio shadcn's
  `font-size` transition would give, on the UI thread.

## API

`CollapsingHeader` is a [`nsh` View](https://nsh.dev/elements/view) in the library's look; every
prop of View passes through, and `style` goes over the look's. `CollapsingHeaderBackdrop`,
`CollapsingHeaderDescription` and `CollapsingHeaderBar` take a View's too, and
`CollapsingHeaderTitle` a [`nsh` Text](https://nsh.dev/elements/text)'s; a string child of
`CollapsingHeaderDescription` is drawn as its text.

| Part                          | Props                                                                              | Description                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `CollapsingHeader`            | `scroll`: `AnimatedValue`; `expandedHeight`: `number`; `collapsedHeight`: `number` | The page's header: sticks to the top of the scroll view, `expandedHeight` tall at the page's top, `collapsedHeight` once scrolled. |
| `CollapsingHeaderBackdrop`    | —                                                                                  | The picture, travelling at half the scroll and stretching on over-scroll, behind a cover that fades over it. `null` in a terminal. |
| `CollapsingHeaderDescription` | `children`                                                                         | The line above the title, gone by half the collapse.                                                                               |
| `CollapsingHeaderBar`         | —                                                                                  | The strip at the header's bottom, `collapsedHeight` tall: a row, so it holds actions beside the title.                             |
| `CollapsingHeaderTitle`       | —                                                                                  | The page's title, shrinking into the bar's type as the header collapses.                                                           |

The fill is `finish.light` on the primary color with `primary-foreground` for its ink, edged in the
hairline's `brand-edge`; the title is the display role open and the label role's size collapsed; the
description is the detail's size; the bar's room either side is `density.pad` and its gap
`density.gap`. In a terminal the heights snap to whole rows and the title does not scale. Reduced
motion drops the picture's travel and its stretch; the cover, the title and the description still
follow the scroll, since they are the collapse itself.

`collapsingHeaderLook()` is exported for a header an app draws itself: the heights as it draws them
(`heights`), the parts as the styles they wear (`root`, `backdrop`, `cover`, `description`,
`descriptionText`, `bar`, `title`, `titleClass`) and the ink the picture is drawn in (`ink`).
