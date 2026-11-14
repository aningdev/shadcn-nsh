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
<Button variant="default">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
<Button variant="destructive">Delete</Button>
```

### Size

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

A size is compact with a pointer (24 / 28 / 34 points) and roomier on a touch screen (36 / 40 / 48), where a hit slop makes the target 44 points. `sm`, `default` and `lg` are the only values: a pixel size is a geometry prop (`width`, `side`), not a scale.

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
  <Icon icon={Plus} {...buttonGlyph("secondary")} />
  <Text style={buttonLabel("secondary")}>New file</Text>
</Button>
```

### Icon button

A square icon-only button, 28 points across with a pointer (40 on a touch screen); `size` takes the button's three sizes. `selected` (a base prop) shows it as chosen.

```tsx
<IconButton accessibilityLabel="Star" selected={starred()} onPress={toggle}>
  <Icon icon={Star} {...iconButtonGlyph({ on: starred })} />
</IconButton>
<IconButton
  accessibilityLabel="Delete"
  variant="destructive"
  onPress={remove}
>
  <Icon icon={Trash} {...iconButtonGlyph({ variant: "destructive" })} />
</IconButton>
```

### Round button

`size` is the scale (28 points at `default` with a pointer, 40 on a touch screen); `side` is an exact diameter where the scale is off.

```tsx
<RoundButton accessibilityLabel="Play" onPress={play}>
  <Icon icon={Play} fill {...roundButtonGlyph("default")} />
</RoundButton>
```

### Split button

A main action and a menu half in one silhouette.

```tsx
<SplitButton variant="default">
  <SplitButtonSegment onPress={save}>Save</SplitButtonSegment>
  <SplitButtonDivider />
  <SplitButtonSegment accessibilityLabel="More" onPress={openMenu}>
    <Icon icon={ChevronDown} {...buttonGlyph("default")} />
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

| Prop       | Type                                                   | Default     |
| ---------- | ------------------------------------------------------ | ----------- |
| `variant`  | `"default" \| "secondary" \| "ghost" \| "destructive"` | `"default"` |
| `size`     | `"sm" \| "default" \| "lg"`                            | `"default"` |
| `busy`     | `boolean`                                              | `false`     |
| `children` | `string \| JSX.Element`                                |             |

shadcn's `outline` and `link` are not looks of this library yet, so they are not values: a button is filled, raised, bare or destructive.

### IconButton

| Prop       | Type                                      | Default     |
| ---------- | ----------------------------------------- | ----------- |
| `variant`  | `"ghost" \| "secondary" \| "destructive"` | `"ghost"`   |
| `size`     | `"sm" \| "default" \| "lg"`               | `"default"` |
| `children` | `JSX.Element`                             |             |

`selected` (a base prop) shows it as chosen.

### RoundButton

| Prop       | Type                        | Default     |
| ---------- | --------------------------- | ----------- |
| `variant`  | `"default" \| "secondary"`  | `"default"` |
| `size`     | `"sm" \| "default" \| "lg"` | `"default"` |
| `side`     | `number`                    |             |
| `children` | `JSX.Element`               |             |

### SplitButton

| Prop      | Type                                                   | Default     |
| --------- | ------------------------------------------------------ | ----------- |
| `variant` | `"default" \| "secondary" \| "ghost" \| "destructive"` | `"default"` |
| `size`    | `"sm" \| "default" \| "lg"`                            | `"default"` |

`SplitButtonSegment` takes every prop of [`nsh/base` Button](https://nsh.dev/elements/button); a string child is the label.
