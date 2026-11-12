---
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

## API

Uses `carouselArrowLook`, `carouselPaginationLook`, `carouselDotItemLook`, and `CarouselDot`. Every prop of [`nsh/base` Carousel](https://nsh.dev/elements/carousel) parts passes through.

| Prop (on arrows) | Type      | Default |
| ---------------- | --------- | ------- |
| `glass`          | `boolean` |         |
| `side`           | `number`  |         |
