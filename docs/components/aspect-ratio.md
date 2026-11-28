# Aspect ratio (/docs/components/aspect-ratio)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add aspect-ratio
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { AspectRatio } from "shadcn-nsh/aspect-ratio";
```

## Usage [#usage]

```tsx
import { AspectRatio } from "@/components/ui/aspect-ratio";
```

```tsx
<AspectRatio ratio={16 / 9}>
  <Image src={cover} style={{ width: "100%", height: "100%" }} />
</AspectRatio>
```

## Examples [#examples]

### A picture that keeps its shape [#a-picture-that-keeps-its-shape]

The box takes its column's width and the ratio's height; its content fills it.

```tsx
<AspectRatio ratio={16 / 9}>
  <Image src={cover} style={{ width: "100%", height: "100%" }} />
</AspectRatio>
```

### A square [#a-square]

`ratio={1}` is a square: an avatar, a swatch, a cover cut to the same width and height.

```tsx
<AspectRatio ratio={1} style={{ width: 72 }}>
  <Image src={avatar} style={{ width: "100%", height: "100%" }} />
</AspectRatio>
```

### A ratio written as CSS does [#a-ratio-written-as-css-does]

A number (`16 / 9`) or CSS's own ratio (`"16 / 9"`) say the same; `"auto"` lets the height follow
the content instead.

```tsx
<AspectRatio ratio="4 / 3">…</AspectRatio>
```

### A color block [#a-color-block]

The content is anything: a chart, a placeholder, a block's fill with its label centered. A `style`
of your own goes over the look's, so the fill and the corners are the caller's.

```tsx
<AspectRatio
  ratio={16 / 9}
  style={{ backgroundColor: token("muted"), borderRadius: shape.control }}
>
  <Text style={{ color: colors.mutedForeground }}>Weekly review</Text>
</AspectRatio>
```

## API [#api]

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through (`style`, `accessibilityLabel`, `onPress`, …); `style` goes over the look's, so a caller's own width, corners or fill replace the look's and the box keeps its ratio inside them.

| Part          | Props                                                                                               | Description                                                |
| ------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `AspectRatio` | `ratio`: `number`, a ratio string (`"16 / 9"`) or `"auto"` (default `1`); `children`: `JSX.Element` | A box as wide as its column and as tall as its ratio says. |

The box is as wide as its column (`width: "100%"`) and its height is that width over the ratio; its
content is clipped to it (`overflow: "hidden"`), so a picture fills the box rather than spilling out
of it.