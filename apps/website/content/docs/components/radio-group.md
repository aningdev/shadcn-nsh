---
title: Radio
description: A sunk ring that fills in citrus, with a dot growing in — alone or as a choice tile.
component: true
demo: radio-group
---

## Installation

```npm
npx shadcn-nsh@latest add radio-group
```

## Usage

```tsx
import { Radio, RadioGroup } from "@/components/ui/radio-group";
```

```tsx
<RadioGroup>
  <Radio checked={plan() === "pro"} onChange={() => plan.set("pro")}>
    Pro
  </Radio>
</RadioGroup>
```

## Composition

Use the following composition to build a `RadioGroup`:

```text
RadioGroup
└── Radio
    └── RadioRing
```

## Examples

### Size

```tsx
<Radio size="sm">Small</Radio>
<Radio size="default">Regular</Radio>
<Radio size="lg">Large</Radio>
```

`size` is `ChoiceSize` (`"sm" | "default" | "lg"`: 0.8, 1 or 1.25 times the page's control size), shared with `Checkbox`.

### Disabled

```tsx
<Radio checked disabled>
  Team
</Radio>
```

### Tile

```tsx
<Radio variant="tile" checked={on()} onChange={() => on.set(true)}>
  Option A
</Radio>
```

### The look alone

`choiceTileLook` is shared by the tile radio and the checkbox. Import it from
`@/components/ui/lib/choice`.

```tsx
import { choiceTileLook } from "@/components/ui/lib/choice";

<Radio class="group" checked={on()} {...choiceTileLook(() => on())}>
  <RadioRing on={on()} />
  Option A
</Radio>;
```

### Names for screen readers

A string child is the row's label and its name for screen readers; `accessibilityLabel` wins when it should differ. Children drawn as given are named by the texts inside them.

## API

Every prop of [`nsh/base` Radio](https://nsh.dev/elements/radio) and [`RadioGroup`](https://nsh.dev/elements/radio) passes through. Style props go over the look's. The row is the `group` the ring sinks with while pressed. `RadioGroupItem` is an alias of `Radio`.

| Part             | Props                                                                                                                                                                      | Description                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `Radio`          | `variant` (`RadioVariant`, default `"default"`), `indicator` (`boolean`, default `true`), `size` (`ChoiceSize`, default `"default"`), `children` (`string \| JSX.Element`) | The ring of the theme's choice recipe, or a choice tile |
| `RadioGroup`     |                                                                                                                                                                            | Every prop of `nsh/base` RadioGroup passes through      |
| `RadioGroupItem` |                                                                                                                                                                            | An alias of `Radio`                                     |

`RadioVariant` is `"default"` (the sunk ring) or `"tile"` (the whole surface is the control, this library's own value).
