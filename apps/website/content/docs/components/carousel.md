---
title: Carousel
description: Snapping slides with arrows and a traveling dot pill.
component: true
demo: carousel
---

## Installation

```npm
npx shadcn-nsh@latest add carousel
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Carousel } from "shadcn-nsh/carousel";
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

## Composition

Use the following composition to build a `Carousel`:

```text
Carousel
├── CarouselContent
│   └── CarouselItem
├── CarouselPrevious
├── CarouselPagination
│   └── CarouselPaginationItem
│       └── CarouselDot
└── CarouselNext
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

`CarouselPrevious` and `CarouselNext` draw their own icon and size; `side` and `glass` change the
chrome. Under every theme they are the same floating pill beside the dots; `carouselArrowLook()`
has no per-theme form to follow.

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

### Autoplay

The carousel holds no timer: a slide that moves on by itself is the app's — a controlled `index` a
timer advances, around the ends. Hold it while the user is at the carousel: the pointer over a
`View` around it (`onMouseEnter` / `onMouseLeave`), the keyboard focus in it (`onFocus` /
`onBlur`) and a drag (`onDragStart` / `onDragEnd`), and leave it off with `reduceMotion()`. Key the
effect on the index, so every change — a timer's, an arrow's, a dot's, the rotation control's —
starts a whole interval, or a press would be cut short by the turn already under way. The rotation
control comes first in the row, beside the dots, and names itself `Pause announcements` or
`Play announcements`.

```tsx
import { Pause, Play } from "lucide";
import { cleanup, effect, reduceMotion, signal } from "nsh";

import { IconButton } from "@/components/ui/button";

function rotation(count: number, ms: number) {
  const index = signal(0);
  const playing = signal(true);
  const hovered = signal(false);
  const focused = signal(false);
  const dragging = signal(false);
  const held = () => hovered() || focused() || dragging();
  const running = () => playing() && !held() && !reduceMotion();
  effect(() => {
    index();
    if (!running()) return;
    const timer = setInterval(() => index.set((index() + 1) % count), ms);
    cleanup(() => clearInterval(timer));
  });
  return {
    index,
    playing,
    // The pointer's half: a view of the app's around the carousel.
    hover: {
      onMouseEnter: () => hovered.set(true),
      onMouseLeave: () => hovered.set(false),
    },
    // The carousel's half: its keyboard focus and its drags.
    carousel: {
      onFocus: () => focused.set(true),
      onBlur: () => focused.set(false),
      onDragStart: () => dragging.set(true),
      onDragEnd: () => dragging.set(false),
    },
  };
}

const roll = rotation(3, 4000);

<View {...roll.hover}>
  <Carousel
    looping
    index={roll.index()}
    accessibilityLabel="Announcements"
    onChange={({ index }) => roll.index.set(index)}
    {...roll.carousel}
  >
    <CarouselContent>{/* the announcements */}</CarouselContent>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <IconButton
        accessibilityLabel={roll.playing() ? "Pause announcements" : "Play announcements"}
        onPress={() => roll.playing.set(!roll.playing())}
      >
        <Icon icon={roll.playing() ? Pause : Play} size={14} />
      </IconButton>
      <CarouselPagination accessibilityLabel="Choose an announcement">
        {/* one CarouselPaginationItem and CarouselDot per announcement */}
      </CarouselPagination>
    </View>
  </Carousel>
</View>;
```

## API

Uses `carouselArrowLook`, `carouselPaginationLook`, `carouselDotItemLook`, and `CarouselDot`. `carouselArrowLook()`'s `icon` is the glyph an arrow draws and its `style` / `hoverStyle` / `activeStyle` / `focusVisibleStyle` are the arrow's chrome. Every prop of [`nsh/base` Carousel](https://nsh.dev/elements/carousel) parts passes through.

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
