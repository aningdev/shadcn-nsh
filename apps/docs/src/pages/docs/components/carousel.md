---
layout: ../../../layouts/Docs.astro
title: Carousel
description: Snapping slides with round arrows and a traveling dot pill.
component: true
demo: carousel
---

## Installation

```sh
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

### Arrows

`CarouselPrevious` and `CarouselNext` draw their own icon and size; `side` and `glass` change the chrome.

```tsx
<CarouselPrevious accessibilityLabel="Previous slide" />
<CarouselNext accessibilityLabel="Next slide" />
```

### Pagination

The indicator travels to `index`; each item shows a `CarouselDot`.

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

| Prop (on arrows) | Type      | Default |
| ---------------- | --------- | ------- |
| `glass`          | `boolean` |         |
| `side`           | `number`  |         |
