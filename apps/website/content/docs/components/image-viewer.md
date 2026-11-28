---
title: ImageViewer
description: One image full screen over a dimmed ground, fitted, with pinch to zoom, drag to pan and swipe down to close.
component: true
demo: image-viewer
---

## Installation

```npm
npx shadcn-nsh@latest add image-viewer
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { ImageViewer } from "shadcn-nsh/image-viewer";
```

## Usage

```tsx
import { ImageViewer } from "@/components/ui/image-viewer";
```

```tsx
const image = signal<ImageViewerImage | null>(null);

<ImageViewer image={image()} onClose={() => image.set(null)} />;
```

The viewer is open while `image` is set; `onClose` is where it asks to close (the close button, Escape, the back button, a press on the ground, a swipe down), so set `image` back to `null` there. A pinch zooms to 4×, a double tap or click to 2.5× at the point, a drag pans the zoomed image, and at 1× a drag down closes it. The `alt` text is the caption and the image's name for screen readers.

## Examples

### An image viewer

A row of photographs, each a [`Pressable`](./pressable) that sets the image; one viewer serves them all.

```tsx
const image = signal<ImageViewerImage | null>(null);

<View style={{ flexDirection: "row", gap: 8 }}>
  <Each of={photos}>
    {(photo) => (
      <Pressable
        accessibilityLabel={photo().alt}
        onPress={() => image.set({ src: photo().large, alt: photo().alt })}
      >
        <Image src={photo().thumbnail} style={{ width: "100%", height: 96, objectFit: "cover" }} />
      </Pressable>
    )}
  </Each>
</View>
<ImageViewer image={image()} onClose={() => image.set(null)} />;
```

### From a text view

[`TextView`](./text-view) reports the image that was pressed (`onImagePress`) in the shape the viewer takes; see **Images that open** there.

## API

`ImageViewer` is a [`Dialog`](./dialog) as a page (`dialogPage`) with its body given whole (`scroll={false}`), so every prop of `DialogContent` passes through but `width`, `scroll` and `children`; `style` goes over the page's, and `animation` defaults to `fade`. Gestures are [`nsh` View](https://nsh.dev/elements/view)'s `pinch` and `pan`; behavior and accessibility are [`nsh/base` Dialog](https://nsh.dev/elements/dialog)'s.

| Part          | Props                                                                     | Description                                                                        |
| ------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ImageViewer` | `image`: `{ src: string; alt?: string } \| null`; `onClose`: `() => void` | The viewer, open while `image` is set. The image stays while the dialog fades out. |

There are no `ImageViewerClose` or `ImageViewerCaption` parts. The close button is always there and the caption is always the `alt`, so a part would only be a place to put what the viewer already draws. A gallery of several images in one viewer is the app's: set `image` to the next one.

The ink is `on-media` and the ground is the theme's `media`, the pair that stays dark in either appearance and in every theme; the caption strip and the close chip carry a wash of that ink so they read over any photograph.
