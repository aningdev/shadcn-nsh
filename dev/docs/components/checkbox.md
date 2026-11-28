# Checkbox (/dev/docs/components/checkbox)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add checkbox
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Checkbox } from "shadcn-nsh/checkbox";
```

## Usage [#usage]

```tsx
import { Checkbox } from "@/components/ui/checkbox";
```

```tsx
<Checkbox checked={on()} onChange={({ checked }) => on.set(checked)}>
  Photos
</Checkbox>
```

## Examples [#examples]

### Size [#size]

```tsx
<Checkbox size="sm">Small</Checkbox>
<Checkbox size="default">Regular</Checkbox>
<Checkbox size="lg">Large</Checkbox>
```

`size` multiplies the page's control size: `sm` 0.8, `default` 1, `lg` 1.25 (`ChoiceSize`).

### Disabled [#disabled]

```tsx
<Checkbox checked disabled>
  System settings
</Checkbox>
```

### Round [#round]

```tsx
<Checkbox round checked>
  Round
</Checkbox>
```

### Checked and indeterminate [#checked-and-indeterminate]

```tsx
<Checkbox checked={all()} indeterminate={some()} onChange={({ checked }) => selectAll(checked)}>
  Back up everything
</Checkbox>
```

### Names for screen readers [#names-for-screen-readers]

A string child is the row's label and its name for screen readers, so the box and its text are one control to a reader; `accessibilityLabel` wins when it should differ. Children drawn as given are named by the texts inside them.

## API [#api]

Every prop of [`nsh/base` Checkbox](https://nsh.dev/elements/checkbox) passes through. `indicatorClass` and `indicatorStyle` go over the look's. The row is the `group` the box sinks with while pressed.

| Part           | Props                                                                                                      | Description                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Checkbox`     | `size`: `ChoiceSize` (default `"default"`), `round` (default `false`), `children`: `string \| JSX.Element` | The box of the theme's choice recipe, filling as it is checked; the row is the group it sinks with. |
| `CheckboxMark` | `mark`: `"check" \| "dash" \| null`, `scale`, `round`                                                      | The check or the dash that springs in, drawn into the look's `indicator`.                           |

`ChoiceSize` is `"sm" | "default" | "lg"`: 0.8, 1 or 1.25 times the page's control size, shared with `Radio`. The table is `choiceScales` in `lib/choice`.