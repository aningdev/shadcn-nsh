---
title: Button
description: A button, an icon button, a round button, and a split button.
component: true
demo: button
---

## Installation

```npm
npx shadcn-nsh@latest add button
```

## Usage

```tsx
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
```

The examples draw icons with `Icon` from `lib/icons`; see [Icons](../icons) for adding it and picking a size and color.

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

### Disabled

```tsx
<Button disabled>Save</Button>
```

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

### With an icon, or any content

A string is the label. Anything else is drawn as given; `buttonLabel` and `buttonGlyph` give it the button's type and icon size.

```tsx
<Button variant="secondary">
  <Icon icon={Plus} {...buttonGlyph("secondary")} />
  <Text style={buttonLabel("secondary")}>New file</Text>
</Button>
```

### Names for screen readers

A string child is also the button's name for screen readers — they read the text it draws — so `<Button onPress={retry}>Retry</Button>` needs nothing else: a test finds it as `role:button[Retry]`. `accessibilityLabel` still wins when the name should differ from the visible text. Children drawn as given are named by the texts inside them; a button that draws no text needs the `accessibilityLabel` yourself, and an `IconButton` or `RoundButton` (an icon and no text) will not compile without one.

```tsx
<Button onPress={retry}>Retry</Button>
<Button accessibilityLabel="Retry the upload" onPress={retry}>
  <Icon icon={RotateCw} {...buttonGlyph("secondary")} />
</Button>
```

### Icon button

A square icon-only button, 28 points across with a pointer (40 on a touch screen); `size` takes the button's three sizes. `selected` (a base prop) shows it as chosen.

```tsx
<IconButton accessibilityLabel="Star" selected={starred()} onPress={toggle}>
  <Icon icon={Star} {...iconButtonGlyph({ selected: starred() })} />
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

## Differences from shadcn/ui

- shadcn's `outline` and `link` are not looks of this library yet, so they are not values: a button
  is filled, raised, bare or destructive.

## API

| Part                 | Props                                                                       | Description                                                                     |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Button`             | `variant`, `size`, `busy`, `accessibilityLabel`, `children`                 | A press that acts; a string child is the label and its name for screen readers. |
| `IconButton`         | `variant`, `size`, `accessibilityLabel`, `children`                         | A square icon-only button; it will not compile without an `accessibilityLabel`. |
| `RoundButton`        | `variant`, `size`, `side`, `accessibilityLabel`, `children`                 | A round icon-only button; `side` is an exact diameter where the scale is off.   |
| `SplitButton`        | `variant`, `size`                                                           | A main action and a menu half in one silhouette.                                |
| `SplitButtonSegment` | every [`nsh/base` Button](https://nsh.dev/elements/button) prop; `children` | One half; a string child is the label and its name for screen readers.          |
| `SplitButtonDivider` | `style`                                                                     | The hairline between the main action and the menu half.                         |

### Button

Every prop of [`nsh/base` Button](https://nsh.dev/elements/button) passes through. `style`, `hoverStyle`, `activeStyle`, `focusVisibleStyle` and `disabledStyle` go over the look's.

| Prop                 | Type                                                   | Default     |
| -------------------- | ------------------------------------------------------ | ----------- |
| `variant`            | `"default" \| "secondary" \| "ghost" \| "destructive"` | `"default"` |
| `size`               | `"sm" \| "default" \| "lg"`                            | `"default"` |
| `busy`               | `boolean`                                              | `false`     |
| `accessibilityLabel` | `string`                                               |             |
| `children`           | `string \| JSX.Element`                                |             |

### IconButton

| Prop                 | Type                                       | Default     |
| -------------------- | ------------------------------------------ | ----------- |
| `variant`            | `"ghost" \| "secondary" \| "destructive"`  | `"ghost"`   |
| `size`               | `"sm" \| "default" \| "lg"`                | `"default"` |
| `accessibilityLabel` | `string` (required: an icon names nothing) |
| `children`           | `JSX.Element`                              |             |

`selected` (a base prop) shows it as chosen.

### RoundButton

| Prop                 | Type                                       | Default     |
| -------------------- | ------------------------------------------ | ----------- |
| `variant`            | `"default" \| "secondary"`                 | `"default"` |
| `size`               | `"sm" \| "default" \| "lg"`                | `"default"` |
| `side`               | `number`                                   |             |
| `accessibilityLabel` | `string` (required: an icon names nothing) |
| `children`           | `JSX.Element`                              |             |

### SplitButton

| Prop      | Type                                                   | Default     |
| --------- | ------------------------------------------------------ | ----------- |
| `variant` | `"default" \| "secondary" \| "ghost" \| "destructive"` | `"default"` |
| `size`    | `"sm" \| "default" \| "lg"`                            | `"default"` |

`SplitButtonSegment` takes every prop of [`nsh/base` Button](https://nsh.dev/elements/button); a string child is the label, and its name for screen readers.
