---
title: Emoji picker
description: Tabs, search, skin tones and grid styled for nsh/base EmojiPicker.
component: true
demo: emoji-picker
---

## Installation

```npm
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

| Part           | Props                                                                                                                                                           | Description                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `EmojiPanel`   | `onSelect` (required, `(e: { emoji: string; base: string })`), `onCancel`, `recent` (`string[]`, default `[]`), `fill`, `class`, `testID`, `accessibilityLabel` | The whole picker: tabs, search, skin tones, grid and preview |
| `EmojiHeading` | `group`                                                                                                                                                         | A group's heading                                            |
| `EmojiTabs`    | `group`, `groups`, `onPress`                                                                                                                                    | The group tabs                                               |
| `EmojiTones`   | `tone`, `onChange`                                                                                                                                              | The skin tone hand beside the search field                   |
| `EmojiPreview` | `entry`, `hint`                                                                                                                                                 | The emoji under the pointer, named                           |

`EmojiPanel` wraps [`nsh/base` EmojiPicker](https://nsh.dev/elements/emoji-picker) with gallery classes and chrome. Pass through any base picker prop via extending the shell later; today only the upstream panel props are supported.

Also exports `emojiGroups`, `emojiGroupLabels` and `emojiPickerClasses` for custom layouts.
