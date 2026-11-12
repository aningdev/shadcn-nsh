---
layout: ../../../layouts/Docs.astro
title: Button
description: A button, an icon button, a round button, and a split button.
component: true
demo: button
---

## Installation

```sh
npx shadcn-nsh@latest add button
```

## Usage

```tsx
import { Button } from "@/components/ui/button";
```

```tsx
<Button onPress={save}>Save</Button>
```

## Examples

### Variant

```tsx
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
<Button variant="danger">Delete</Button>
```

### Size

```tsx
<Button size="small">Small</Button>
<Button size="regular">Regular</Button>
<Button size="large">Large</Button>
```

A size is compact with a pointer (24 / 28 / 34 points) and roomier on a touch screen (36 / 40 / 48), where a hit slop makes the target 44 points.

### Selected

```tsx
<Button variant="secondary" selected={open()} onPress={toggle}>
  Filters
</Button>
```

### Busy

A spinner before the label, and no second press.

```tsx
<Button busy={saving()} onPress={save}>
  Save
</Button>
```

### Disabled

```tsx
<Button disabled>Save</Button>
```

### With an icon, or any content

A string is the label. Anything else is drawn as given; `buttonLabel` and `buttonGlyph` give it the button's type and icon size.

```tsx
<Button variant="secondary">
  <Icon name="plus" {...buttonGlyph("secondary")} />
  <Text style={buttonLabel("secondary")}>New file</Text>
</Button>
```

### Icon button

A square icon-only button. `on` shows it as chosen.

```tsx
<IconButton accessibilityLabel="Star" on={starred()} onPress={toggle}>
  <Icon name="star" {...iconButtonGlyph({ on: starred })} />
</IconButton>
```

### Round button

```tsx
<RoundButton accessibilityLabel="Play" onPress={play}>
  <Icon name="play" {...roundButtonGlyph("primary")} />
</RoundButton>
```

### Split button

A main action and a menu half in one silhouette.

```tsx
<SplitButton variant="primary">
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" onPress={openMenu}>
    <Icon name="chevron-down" {...buttonGlyph("primary")} />
  </SplitButtonSegment>
</SplitButton>
```

### The look alone

The look is a function, for a pressable of your own.

```tsx
<View onPress={open} {...buttonLook("ghost")}>
  <Text style={buttonLabel("ghost")}>Open</Text>
</View>
```

## API

### Button

Every prop of [`nsh/base` Button](https://nsh.dev/elements/button) passes through. `style`, `hoverStyle`, `activeStyle`, `focusVisibleStyle` and `disabledStyle` go over the look's.

| Prop       | Type                                                          | Default     |
| ---------- | ------------------------------------------------------------- | ----------- |
| `variant`  | `"primary" \| "secondary" \| "accent" \| "ghost" \| "danger"` | `"primary"` |
| `size`     | `"small" \| "regular" \| "large"`                             | `"regular"` |
| `busy`     | `boolean`                                                     | `false`     |
| `children` | `string \| JSX.Element`                                       |             |

### IconButton

| Prop       | Type                     | Default   |
| ---------- | ------------------------ | --------- |
| `variant`  | `"ghost" \| "secondary"` | `"ghost"` |
| `tone`     | `"danger"`               |           |
| `on`       | `boolean`                | `false`   |
| `children` | `JSX.Element`            |           |

### RoundButton

| Prop       | Type                       | Default     |
| ---------- | -------------------------- | ----------- |
| `variant`  | `"primary" \| "secondary"` | `"primary"` |
| `size`     | `number`                   | 28 / 40     |
| `children` | `JSX.Element`              |             |

### SplitButton

| Prop      | Type                                                          | Default     |
| --------- | ------------------------------------------------------------- | ----------- |
| `variant` | `"primary" \| "secondary" \| "accent" \| "ghost" \| "danger"` | `"primary"` |
| `size`    | `"small" \| "regular" \| "large"`                             | `"regular"` |

`SplitButtonSegment` takes every prop of [`nsh/base` Button](https://nsh.dev/elements/button); a string child is the label.
