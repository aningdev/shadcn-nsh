---
title: Marker
description: "A line in a conversation that is not a message: a status, a note, a labeled separator."
component: true
demo: marker
---

## Installation

```npm
npx shadcn-nsh@latest add marker
```

## Usage

```tsx
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
```

```tsx
<Marker>
  <MarkerIcon icon={Search} />
  <MarkerContent>Explored 4 files</MarkerContent>
</Marker>
```

## Composition

Use the following composition to build a `Marker`:

```text
Marker
├── MarkerIcon
└── MarkerContent
```

## Examples

### Inline

`Marker` is one muted line at the body's size, at least 16 points tall, an icon 8 points before
the text. `MarkerIcon` takes a lucide node (`icon`) or a part of its own as children — a `Spinner`,
for a status.

```tsx
<Marker>
  <MarkerIcon icon={GitBranch} />
  <MarkerContent>Switched to a new branch</MarkerContent>
</Marker>
```

### Separator

`variant="separator"` centers the label between two hairlines, each taking the room left on its
side. Use it for a date, a compaction, or the start of a section.

```tsx
<Marker variant="separator">
  <MarkerContent>Today</MarkerContent>
</Marker>
```

### Border

`variant="border"` keeps the inline layout and closes the line with a hairline 8 points under it,
for a row that separates what follows.

```tsx
<Marker variant="border">
  <MarkerIcon icon={FileText} />
  <MarkerContent>Opened implementation notes</MarkerContent>
</Marker>
```

### Status

A marker that is still going takes a `Spinner` in `MarkerIcon`. NSH has no `status` role and no
live-region prop, so a marker whose change must be announced takes `role="alert"`, the one it has
for this.

```tsx
<Marker role="alert">
  <MarkerIcon>
    <Spinner size={12} tint={colors.mutedForeground} />
  </MarkerIcon>
  <MarkerContent>Thinking…</MarkerContent>
</Marker>
```

### A marker that acts

Give the marker `onPress` and `role="button"`: its line is underlined and the pointer over it is a
hand.

```tsx
<Marker role="button" onPress={() => open("https://github.com/…/pull/1")}>
  <MarkerIcon icon={ExternalLink} />
  <MarkerContent>View the pull request</MarkerContent>
</Marker>
```

## API

| Part            | Props                                                                   | Description                                    |
| --------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| `Marker`        | `variant`; every `nsh` View prop; look `markerLook().root(variant)`     | A line in a conversation that is not a message |
| `MarkerIcon`    | `icon`, `children`; every `nsh` View prop; look `markerLook().icon`     | The icon beside the line                       |
| `MarkerContent` | `children`; every `nsh` Text prop; look `markerLook().content(variant)` | The line's words                               |

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `Marker` and
`MarkerIcon` (`role`, `onPress`, `accessibilityLabel`, …), and every prop of
[`nsh` Text](https://nsh.dev/elements/text) on `MarkerContent`. Style props go over the look's:
`style` on a `View` or `Text` part.

| Prop       | On              | Type                                   | Default   |
| ---------- | --------------- | -------------------------------------- | --------- |
| `variant`  | `Marker`        | `"default" \| "border" \| "separator"` | `default` |
| `icon`     | `MarkerIcon`    | `IconNode` (from `lucide`)             |           |
| `children` | `MarkerContent` | `string \| JSX.Element`                |           |

The line is in the muted ink at the body's size (13 points with a pointer, 15 on a touch screen),
its icon 16 points in the same ink; a marker's icon box is never shrunk by a tight row. In a
terminal the icon is drawn as NSH draws icons there (a check is `✓`, the others show nothing) and
the rules are hairlines. `markerLook()` is exported for a line an app draws itself.
