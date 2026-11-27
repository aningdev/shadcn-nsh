# Radio (/dev/docs/components/radio-group)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add radio-group
```

## Usage [#usage]

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

## Composition [#composition]

Use the following composition to build a `RadioGroup`:

```text
RadioGroup
└── Radio
    └── RadioRing
```

## Examples [#examples]

### Size [#size]

```tsx
<Radio size="sm">Small</Radio>
<Radio size="default">Regular</Radio>
<Radio size="lg">Large</Radio>
```

`size` is `ChoiceSize` (`"sm" | "default" | "lg"`: 0.8, 1 or 1.25 times the page's control size), shared with `Checkbox`.

### Disabled [#disabled]

```tsx
<Radio checked disabled>
  Team
</Radio>
```

### Tile [#tile]

```tsx
<Radio variant="tile" checked={on()} onChange={() => on.set(true)}>
  Option A
</Radio>
```

### The look alone [#the-look-alone]

`choiceTileLook` is shared by the tile radio and the checkbox. Import it from
`@/components/ui/lib/choice`.

```tsx
import { choiceTileLook } from "@/components/ui/lib/choice";

<Radio class="group" checked={on()} {...choiceTileLook(() => on())}>
  <RadioRing on={on()} />
  Option A
</Radio>;
```

### Names for screen readers [#names-for-screen-readers]

A string child is the row's label and its name for screen readers; `accessibilityLabel` wins when it should differ. Children drawn as given are named by the texts inside them.

## API [#api]

Every prop of [`nsh/base` Radio](https://nsh.dev/elements/radio) and [`RadioGroup`](https://nsh.dev/elements/radio) passes through. Style props go over the look's. The row is the `group` the ring sinks with while pressed. `RadioGroupItem` is an alias of `Radio`.

| Part             | Props                                                                                                                                                                      | Description                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `Radio`          | `variant` (`RadioVariant`, default `"default"`), `indicator` (`boolean`, default `true`), `size` (`ChoiceSize`, default `"default"`), `children` (`string \| JSX.Element`) | The ring of the theme's choice recipe, or a choice tile |
| `RadioGroup`     |                                                                                                                                                                            | Every prop of `nsh/base` RadioGroup passes through      |
| `RadioGroupItem` |                                                                                                                                                                            | An alias of `Radio`                                     |

`RadioVariant` is `"default"` (the sunk ring) or `"tile"` (the whole surface is the control, this library's own value).