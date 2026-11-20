---
title: Carousel
description: Snapping slides with round arrows and a traveling dot pill.
component: true
demo: carousel
---

## Installation

```npm
npx shadcn-nsh@latest add carousel
```

## Usage

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPrevious,
} from "@/components/ui/carousel";
```

```tsx
<Carousel>
  <CarouselContent>
    <CarouselItem>…</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

## Examples

### Slides

```tsx
<Carousel index={index()} onChange={({ index }) => setIndex(index)} accessibilityLabel="Photos">
  <CarouselContent style={{ height: 120 }}>
    <CarouselItem>
      <Text>Harbor</Text>
    </CarouselItem>
    <CarouselItem>
      <Text>Dunes</Text>
    </CarouselItem>
    <CarouselItem>
      <Text>Glacier</Text>
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

### Caption over a photo

A slide that holds a photograph draws its caption itself: the theme has no text role that reads
over an arbitrary picture, so the ink is `on-media` (white in every theme, both appearances) and
the veil behind it is `scrim`. A text role such as `foreground` flips with the appearance and
leaves the caption unreadable in one of them.

```tsx
<View style={{ backgroundImage: `url(${photo})`, justifyContent: "flex-end" }}>
  <View
    style={{
      backgroundImage: `linear-gradient(to top, ${alpha(token("scrim"), 0.9)}, transparent)`,
    }}
  >
    <Text style={{ color: colors.onMedia, fontWeight: "700" }}>{title}</Text>
  </View>
</View>
```

### Arrows

`CarouselPrevious` and `CarouselNext` draw their own icon and size; `side` and `glass` change the chrome.

```tsx
<CarouselPrevious accessibilityLabel="Previous slide" />
<CarouselNext accessibilityLabel="Next slide" />
```

### Pagination

The indicator travels to `index`; each item shows the `CarouselDot` you give it. The carousel keeps
the slide shown to itself (`nsh/base` only reports it through `onChange`), so an item with no child
draws nothing: pass the dot, and tell it which slide it is on.

```tsx
<CarouselPagination accessibilityLabel="Choose a slide">
  {SLIDES.map((_, i) => (
    <CarouselPaginationItem index={i} accessibilityLabel={`Slide ${i + 1}`}>
      <CarouselDot selected={index() === i} />
    </CarouselPaginationItem>
  ))}
</CarouselPagination>
```

## API

Uses `carouselArrowLook`, `carouselPaginationLook`, `carouselDotItemLook`, and `CarouselDot`. Every prop of [`nsh/base` Carousel](https://nsh.dev/elements/carousel) parts passes through.

| Part                     | Props                                             | Description                                                                                  |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Carousel`               | —                                                 | The carousel over [`nsh/base` Carousel](https://nsh.dev/elements/carousel).                  |
| `CarouselContent`        | —                                                 | The snap viewport the slides scroll in.                                                      |
| `CarouselItem`           | —                                                 | One slide: one per view unless the app gives it a width.                                     |
| `CarouselPrevious`       | `glass`, `side`                                   | The arrow back: `glass` and `side` shape its look, an arrow unless given a child.            |
| `CarouselNext`           | `glass`, `side`                                   | The arrow forward, as the previous one.                                                      |
| `CarouselPagination`     | —                                                 | The dot row, with the pill that travels to the slide shown.                                  |
| `CarouselPaginationItem` | `children` (a `CarouselDot`; nothing without one) | One slide's dot, named `Slide 1`, `Slide 2`, …                                               |
| `CarouselDot`            | `selected`                                        | A quiet circle that brightens under the pointer and hides under the pill on the slide shown. |
