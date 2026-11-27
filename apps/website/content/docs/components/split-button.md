---
title: Split Button
description: A main action and the menu of its variants in one silhouette.
component: true
demo: split-button
---

## Installation

```npm
npx shadcn-nsh@latest add split-button
```

## Usage

```tsx
import { buttonGlyph } from "@/components/ui/button";
import { SplitButton, SplitButtonDivider, SplitButtonSegment } from "@/components/ui/split-button";
import { Icon } from "@/lib/ui/icons";
```

```tsx
<SplitButton>
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More save options" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("default")} />
  </SplitButtonSegment>
</SplitButton>
```

## Composition

Use the following composition to build a split button:

```text
SplitButton
├── SplitButtonSegment
├── SplitButtonDivider
└── SplitButtonSegment
```

## Examples

### Variant

The pair wears one variant. A half has no fill of its own: the pointer lays a whisper of the label color over the shared face.

```tsx
<SplitButton variant="default">
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("default")} />
  </SplitButtonSegment>
</SplitButton>
<SplitButton variant="secondary">
  <SplitButtonSegment onPress={exportFile}>Export</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More export options" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("secondary")} />
  </SplitButtonSegment>
</SplitButton>
<SplitButton variant="outline">
  <SplitButtonSegment onPress={share}>Share</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More share options" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("outline")} />
  </SplitButtonSegment>
</SplitButton>
<SplitButton variant="ghost">
  <SplitButtonSegment onPress={skip}>Skip</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("ghost")} />
  </SplitButtonSegment>
</SplitButton>
<SplitButton variant="destructive">
  <SplitButtonSegment onPress={remove}>Delete</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More delete options" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("destructive")} />
  </SplitButtonSegment>
</SplitButton>
```

### Size

```tsx
<SplitButton size="sm">
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("default", { size: "sm" })} />
  </SplitButtonSegment>
</SplitButton>
<SplitButton size="lg">
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("default", { size: "lg" })} />
  </SplitButtonSegment>
</SplitButton>
```

### Disabled

A disabled frame dims both halves. A disabled half dims on its own and takes no press.

```tsx
<SplitButton disabled>
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("default", { disabled: true })} />
  </SplitButtonSegment>
</SplitButton>
```

### Menu open

`selected` on the menu half shades it while what it opens is open.

```tsx
<SplitButton>
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" selected={open()} onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("default", { selected: open() })} />
  </SplitButtonSegment>
</SplitButton>
```

## API

| Part                 | Props                                                                       | Description                                                            |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `SplitButton`        | `variant`, `size`, `disabled`, `style`                                      | The frame that clips the two halves into one silhouette.               |
| `SplitButtonSegment` | every [`nsh/base` Button](https://nsh.dev/elements/button) prop; `children` | One half. A string child is the label and its name for screen readers. |
| `SplitButtonDivider` | `style`                                                                     | The hairline between the halves.                                       |

### SplitButton

| Prop       | Type                                                                | Default     |
| ---------- | ------------------------------------------------------------------- | ----------- |
| `variant`  | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` |
| `size`     | `"sm" \| "default" \| "lg"`                                         | `"default"` |
| `disabled` | `boolean`                                                           | `false`     |
| `style`    | `StyleProp<ViewStyle>`                                              |             |

`SplitButtonSegment` takes every prop of [`nsh/base` Button](https://nsh.dev/elements/button). A string child is the label. The menu half draws its icon with `buttonGlyph` from [Button](./button).
