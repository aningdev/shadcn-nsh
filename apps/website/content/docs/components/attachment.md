---
title: Attachment
description: "A file, a picture or a link carried by a message: its media, its name, how it is doing, and what can be done to it."
component: true
demo: attachment
---

## Installation

```npm
npx shadcn-nsh@latest add attachment
```

## Usage

```tsx
import { FileText } from "lucide";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  attachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Icon } from "@/lib/ui/icons";
import { colors } from "@/lib/ui/theme";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<Attachment state="done">
  <AttachmentMedia>
    <Icon
      icon={FileText}
      size={attachmentGlyph("default", "horizontal")}
      tint={colors.mutedForeground}
    />
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>build.log</AttachmentTitle>
    <AttachmentDescription>124 KB · 2 min ago</AttachmentDescription>
  </AttachmentContent>
</Attachment>
```

## Composition

Use the following composition to build an `Attachment`:

```text
Attachment
├── AttachmentMedia
├── AttachmentContent
│   ├── AttachmentTitle
│   └── AttachmentDescription
├── AttachmentActions
│   └── AttachmentAction
└── AttachmentTrigger
```

## Examples

### Size

`size` is `default` (40-point media, the body's type), `sm` (32, the note's) or `xs` (28, the
note's, in a chip's corners).

```tsx
<Attachment size="sm">
  <AttachmentMedia>
    <Icon
      icon={FileText}
      size={attachmentGlyph("sm", "horizontal")}
      tint={colors.mutedForeground}
    />
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>changelog.md</AttachmentTitle>
    <AttachmentDescription>8 KB</AttachmentDescription>
  </AttachmentContent>
</Attachment>
```

### States

`state` says how the attachment is doing: `idle` (not sent yet, its edge dashed), `uploading`,
`processing`, `done`, and `error` (the danger tone through the frame, the media and the
description). Put a `Spinner` in the media while it travels.

```tsx
<Attachment state="uploading">
  <AttachmentMedia>
    <Spinner size="default" tint={colors.mutedForeground} />
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>registry.zip</AttachmentTitle>
    <AttachmentDescription>Uploading · 42%</AttachmentDescription>
  </AttachmentContent>
</Attachment>
```

### Pictures

`orientation="vertical"` puts the media above the text, 120 points wide, for a strip of pictures.
`AttachmentMedia` takes a picture drawn inside it: give it `variant="image"` and it fades the media
until the attachment is done or idle.

```tsx
<Attachment orientation="vertical">
  <AttachmentMedia variant="image">
    <Image src={shot} style={{ width: "100%", height: "100%" }} />
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>dark mode.png</AttachmentTitle>
    <AttachmentDescription>PNG · 840 KB</AttachmentDescription>
  </AttachmentContent>
</Attachment>
```

### Actions

`AttachmentActions` holds what can be done to the file — a remove, a retry — beside the text, or
in the corner of a vertical attachment. `AttachmentAction` is this library's `Button`, ghost and
small, for a labeled action such as Retry. Remove is an `IconButton` in that row; there is no `onRemove`. Give the icon button a square `style` (`width` and
`height` 28) so it sits in the chip; the ghost button's own padding reads as a separate pill.

```tsx
<AttachmentActions>
  <AttachmentAction accessibilityLabel="Retry" onPress={retry}>
    Retry
  </AttachmentAction>
  <IconButton variant="ghost" size="sm" accessibilityLabel="Remove" onPress={remove}>
    <Icon icon={X} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
  </IconButton>
</AttachmentActions>
```

### A frame that opens

`AttachmentTrigger` is a pressable over the whole frame, above the media and below the actions:
pressing the file opens it, and under the pointer it shows its own wash. Name it for screen readers.

```tsx
<Attachment>
  <AttachmentMedia>…</AttachmentMedia>
  <AttachmentContent>…</AttachmentContent>
  <AttachmentTrigger accessibilityLabel="Open README.md" onPress={open} />
</Attachment>
```

### Group

`AttachmentGroup` is a row of attachments 12 points apart that scrolls sideways when they do not
fit — the files under a message, the pictures in a composer. The row takes the platform's own feel:
no snapping, and no scrollbar.

```tsx
<AttachmentGroup>
  <Attachment>…</Attachment>
  <Attachment>…</Attachment>
</AttachmentGroup>
```

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on every part;
`AttachmentAction` takes this library's [`Button`](https://nsh.dev/elements/button) props,
`AttachmentTrigger` the view's (`onPress`, `accessibilityLabel`, `disabled`, …), and
`AttachmentTitle`/`AttachmentDescription` the text's. A title or a description is one line,
truncated.

| Part                    | Props                          | Description                                                                                            |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `Attachment`            | `state`, `size`, `orientation` | The frame that carries one file: `attachmentLook().root(state, size, orientation)`.                    |
| `AttachmentGroup`       | —                              | A row 12 points apart that scrolls sideways when the files do not fit: `.group`, `.groupContent`.      |
| `AttachmentMedia`       | `variant`                      | The file's icon or picture: `attachmentLook().media(size, orientation, variant, state)`.               |
| `AttachmentContent`     | —                              | The text beside the media: `attachmentLook().content(orientation)`.                                    |
| `AttachmentTitle`       | —                              | The file's name, one line, truncated: `attachmentLook().title(size)`.                                  |
| `AttachmentDescription` | —                              | How the file is doing, one line: `attachmentLook().description(state)`.                                |
| `AttachmentActions`     | —                              | What can be done to it: `attachmentLook().actions(orientation)`.                                       |
| `AttachmentTrigger`     | —                              | A pressable over the whole frame: press it to open the file.                                           |
| `AttachmentAction`      | —                              | An action on the file, this library's `Button` ghost and small: `buttonLook("ghost", { size: "sm" })`. |

| Prop          | On                | Type                                                         | Default      |
| ------------- | ----------------- | ------------------------------------------------------------ | ------------ |
| `state`       | `Attachment`      | `"idle" \| "uploading" \| "processing" \| "error" \| "done"` | `done`       |
| `size`        | `Attachment`      | `"default" \| "sm" \| "xs"`                                  | `default`    |
| `orientation` | `Attachment`      | `"horizontal" \| "vertical"`                                 | `horizontal` |
| `variant`     | `AttachmentMedia` | `"icon" \| "image"`                                          | `icon`       |

The frame is as wide as what it holds (`default` 160 points wide at least, 120 when vertical), in
the card's fill with a hairline edge and the card's corners (`inset`'s at `xs`), 10 / 8 / 6 points
in from its edge and 8 / 6 / 4 above and below; the title is medium in the page's ink and the
description the note's size in the muted ink. The frame always pads as if it holds text, so a
media on its own sits in that padding. `attachmentLook()` and
`attachmentGlyph(size, orientation)` are exported for a frame an app draws itself.
