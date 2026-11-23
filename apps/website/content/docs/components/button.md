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
import { Icon } from "@/lib/ui/icons";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

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

### With an icon

`icon` takes a lucide node and draws it before the label, sized and tinted by the variant, the size and the state (a disabled filled button's icon goes muted with its label). The terminal draws no icons, so there it is the label alone.

```tsx
import { Plus } from "lucide";

<Button variant="secondary" icon={Plus} onPress={add}>
  New file
</Button>;
```

### Busy

A spinner in the icon's place (before the label when there is no icon), and no second press. A new icon, or the spinner, grows in on `motion.control`; with reduced motion it switches at once. The width follows the label at once: a layout animation would move every frame of the update, app-wide.

```tsx
<Button icon={Save} busy={saving()} onPress={save}>
  {saving() ? "Saving…" : "Save"}
</Button>
```

### Any content

A string is the label, and a child that changes (`{count()}` beside other children) is followed the same way. Anything else is drawn as given; `buttonLabel` and `buttonGlyph` give it the button's type and icon size.

```tsx
<Button variant="secondary">
  <Badge>3</Badge>
  <Text style={buttonLabel("secondary")}>Updates</Text>
</Button>
```

### Names for screen readers

A string child is also the button's name for screen readers — they read the text it draws — so `<Button onPress={retry}>Retry</Button>` needs nothing else: a test finds it as `role:button[Retry]`. `accessibilityLabel` still wins when the name should differ from the visible text. Children drawn as given are named by the texts inside them; a button that draws no text needs the `accessibilityLabel` yourself, and an `IconButton` or `RoundButton` (an icon and no text) will not compile without one.

```tsx
<Button onPress={retry}>Retry</Button>
<IconButton accessibilityLabel="Retry the upload" icon={RotateCw} onPress={retry} />
```

### Icon button

A square icon-only button; `size` takes four: `xs` 20 points across with a pointer (32 on a touch
screen), `sm` 24 (36), `default` 28 (40) and `lg` 32 (44), where a hit slop makes the target 44
points and the icon grows with the square. `lg` is upstream's 32 pt tool square, for a rich text
toolbar; `xs` is a tab's close × beside a document's name. `selected` (a base prop) shows it as
chosen.

`icon` draws a lucide node in the look's size and tint: the accent while selected, the danger tone as
`destructive`; in the terminal, which draws no icons, the `accessibilityLabel` is its text. For an
icon of your own, pass it as `children` and spread `iconButtonGlyph` on it. `iconButtonSizes` is the
table, for geometry that has to match a square. A ghost icon button keeps the scale's metrics (28
points with 12 of padding at `default`, 32 and 16 at `lg`), so a bare square is `IconButton` with
`size="xs"`; a bare text button — a Dock header's Hide — is `size="sm"`; there is no separate bare
variant.

```tsx
<IconButton accessibilityLabel="Star" icon={Star} selected={starred()} onPress={toggle} />
<IconButton accessibilityLabel="Delete" icon={Trash} variant="destructive" onPress={remove} />
```

A tool in a rich text toolbar, at upstream's 32 pt:

```tsx
<IconButton accessibilityLabel="Bold" icon={Bold} size="lg" onPress={bold} />
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

A ghost button's label that should line up with a card's edge is the same `View` with the look's
padding on its leading side: the look carries `buttonSizes[size].pad` (12 at `default`, 16 at
`lg`), so a `View` with `paddingLeft: buttonSizes.default.pad` around a ghost `Button` moves the
label to the edge and keeps the hover fill the width of the button. The library ships no helper for
it: the padding is the look's own.

## API

| Part                 | Props                                                                       | Description                                                                     |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Button`             | `variant`, `size`, `icon`, `busy`, `accessibilityLabel`, `children`         | A press that acts; a string child is the label and its name for screen readers. |
| `IconButton`         | `variant`, `size`, `icon`, `accessibilityLabel`, `children`                 | A square icon-only button; it will not compile without an `accessibilityLabel`. |
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
| `icon`               | `IconNode` (lucide)                                    |             |
| `busy`               | `boolean`                                              | `false`     |
| `accessibilityLabel` | `string`                                               |             |
| `children`           | `string \| JSX.Element`                                |             |

### IconButton

| Prop                 | Type                                       | Default     |
| -------------------- | ------------------------------------------ | ----------- |
| `variant`            | `"ghost" \| "secondary" \| "destructive"`  | `"ghost"`   |
| `size`               | `"xs" \| "sm" \| "default" \| "lg"`        | `"default"` |
| `icon`               | `IconNode` (lucide)                        |             |
| `accessibilityLabel` | `string` (required: an icon names nothing) |
| `children`           | `JSX.Element`                              |             |

`selected` (a base prop) shows it as chosen. `iconButtonSizes` is the table: `side`, the square's
side in points, and `glyph`, the icon's size.

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
