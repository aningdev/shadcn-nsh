---
layout: ../../../layouts/Docs.astro
title: Carousel
description: Styled carousel wrapping nsh/base Carousel and its parts.
component: true
demo: carousel
demoHeight: 280
---

[`nsh/base`](https://nsh.dev/elements/carousel) owns which slide shows, swipes, snapping, looping, the previous and next controls, pagination and the arrow keys. This package paints the slides, the arrows and the dots.

## Install

```npx tabs
npx shadcn-nsh@latest add carousel
```

```bunx tabs
bunx shadcn-nsh@latest add carousel
```

```pnx tabs
pnx shadcn-nsh@latest add carousel
```

```yarn tabs
yarn dlx shadcn-nsh@latest add carousel
```

## Usage

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPaginationItem,
  CarouselPrevious,
} from "@workspace/ui/components/ui/carousel";

<Carousel index={index()} onChange={(event) => index.set(event.index)} accessibilityLabel="Photos">
  <CarouselContent style={{ height: 180 }}>
    {names.map((name, i) => (
      <CarouselItem accessibilityLabel={`${i + 1} of ${names.length}: ${name}`}>
        <Text>{name}</Text>
      </CarouselItem>
    ))}
  </CarouselContent>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
    <CarouselPrevious accessibilityLabel="Previous photo" />
    <CarouselPagination>
      {names.map((_, i) => (
        <CarouselPaginationItem index={i} accessibilityLabel={`Photo ${i + 1}`} />
      ))}
    </CarouselPagination>
    <CarouselNext accessibilityLabel="Next photo" />
  </View>
</Carousel>;
```

Previous is disabled on the first slide, and next on the last, unless `looping` is set. Looping is read when the carousel is created. Place one pagination item per slide; the pill springs onto the item of the slide that shows.

## Composition

| Part                               | Base                     | Role                                                    |
| ---------------------------------- | ------------------------ | ------------------------------------------------------- |
| `Carousel`                         | `Carousel`               | Holds `index` and lays out the content and the controls |
| `CarouselContent`                  | `CarouselContent`        | Snap viewport                                           |
| `CarouselItem`                     | `CarouselItem`           | One slide. Default class `w-full`                       |
| `CarouselPrevious`, `CarouselNext` | the same                 | Round secondary icon buttons. Glyphs `‹` and `›`        |
| `CarouselPagination`               | `CarouselPagination`     | The dot row and the traveling pill                      |
| `CarouselPaginationItem`           | `CarouselPaginationItem` | One dot. `index` is required                            |

## API

Every base prop passes through. Defaults:

| Piece          | Default                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Root           | 8 points between the viewport and the controls                                                                           |
| Content        | `minHeight` 48. Set the height you want                                                                                  |
| Item           | `muted` fill, control radius, `w-full`                                                                                   |
| Arrow          | `buttonVariants({ variant: "secondary", size: "icon-sm" })`, corner radius 999. Labels "Previous slide" and "Next slide" |
| Disabled arrow | The button's opacity, 0.5                                                                                                |
| Dots           | 7 points with a pointer, 8 on a touch screen, in a 15 / 22 hit box. `foreground` at 24%                                  |
| Indicator      | `primary` pill, inset to the dot. Always on unless you replace `indicatorStyle`                                          |
| Focus          | The button ring on an arrow, `focusRing()` on a dot                                                                      |

`carouselVariants()` returns that chrome, including `dotSize` and `arrowMin`.

## Differences

| Topic     | Reference (`look/nav.tsx`)                                         | This package                                                                                                                            |
| --------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow     | A fixed circle, 30 with a pointer and 38 on touch, raised or glass | `button` secondary `icon-sm` (minimum 28 / 36) made round. No glass variant. The control is already a button, so `Button` is not nested |
| Disabled  | Opacity 0.3                                                        | 0.5, the theme's only disabled look                                                                                                     |
| Press     | Scale to 92%, none with reduced motion                             | The button's press sink, which drops the scale the same way                                                                             |
| Indicator | Citrus `accentFill`                                                | `primary`                                                                                                                               |
| Dot       | `alpha(colors.text, 0.24)`, hidden under the pill when selected    | `alpha(colors.foreground, 0.24)` and `group-selected:opacity-0`                                                                         |
| Terminal  | Glyphs `●` / `○`, no pill                                          | Dropped                                                                                                                                 |
| Hit slop  | A larger touch box                                                 | `CarouselPrevious` / `CarouselNext` have no `hitSlop` in store 0.4.0. The touch minimum is the button's 36                              |
| shadcn    | Embla and a `CarouselApi`                                          | No API object. `index` and `onChange` are the value. Pagination is a base part, not an app-built row of buttons                         |

A row of cards is the item's width (`basis-1/3`), not a prop of this package. A vertical carousel needs `axis="vertical"` and a height on each item; `w-full` only sizes the cross axis.

## Accessibility

Set `accessibilityLabel` on the carousel to what the slides are ("Photos"), and on each item to its place ("2 of 3: Dunes"). The default arrow labels are "Previous slide" and "Next slide"; replace them when the slides are a specific thing. Dots default to "Slide N". Previous and next announce disabled at the ends. Home and End, and the arrow keys, are base's.
