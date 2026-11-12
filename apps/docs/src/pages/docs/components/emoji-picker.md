---
title: Emoji picker
description: Tabs, search, skin tones and grid styled for nsh/base EmojiPicker.
component: true
demo: emoji-picker
---

## Installation

```sh
npx shadcn-nsh@latest add emoji-picker
```

## Usage

```tsx
import { EmojiPanel } from "@/components/ui/emoji-picker";
```

```tsx
<EmojiPanel onSelect={({ emoji }) => send(emoji)} />
```

## Examples

### Recent emoji

```tsx
<EmojiPanel recent={["👍", "🎉"]} onSelect={onPick} />
```

## API

`EmojiPanel` wraps [`nsh/base` EmojiPicker](https://nsh.dev/elements/emoji-picker) with gallery classes and chrome. Pass through any base picker prop via extending the shell later; today only the upstream panel props are supported.

| Prop       | Type                                   | Default |
| ---------- | -------------------------------------- | ------- |
| `onSelect` | `(e: { emoji: string; base: string })` | (req.)  |
| `onCancel` | `() => void`                           |         |
| `recent`   | `string[]`                             | `[]`    |
| `fill`     | `boolean`                              |         |
| `class`    | `string`                               |         |

Also exports `emojiGroups`, `emojiGroupLabels`, `emojiPickerClasses`, `EmojiHeading`, `EmojiTabs`, `EmojiTones`, and `EmojiPreview` for custom layouts.
