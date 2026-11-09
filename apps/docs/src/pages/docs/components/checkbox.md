---
layout: ../../../layouts/Docs.astro
title: Checkbox
description: Styled checkbox wrapping nsh/base Checkbox — theme tokens + default mark; full base prop pass-through.
component: true
demo: checkbox
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, keyboard activation, the disabled state, and the checkbox role and value for screen readers — unstyled on every platform. This package is the styled layer on top: indicator chrome, a default check / dash mark, and theme tokens, the same role a community library plays above `nsh/base`. [`Checkbox`](https://nsh.dev/elements/checkbox) is a checked / unchecked / indeterminate control whose look comes from those tokens; behavior and style hooks stay on base and are forwarded. shadcn `bases/base` Checkbox has no `variant` / `size`; this wrapper adds theme defaults only.

## Install

```npx tabs
npx shadcn-nsh@latest add checkbox
```

```bunx tabs
bunx shadcn-nsh@latest add checkbox
```

```pnx tabs
pnx shadcn-nsh@latest add checkbox
```

```yarn tabs
yarn dlx shadcn-nsh@latest add checkbox
```

## Usage

```tsx
import { Checkbox } from "@workspace/ui/components/ui/checkbox";
import { Text } from "nsh";

<Checkbox checked onChange={(checked) => console.log(checked)}>
  <Text>Accept terms</Text>
</Checkbox>;
```

## Controlled

```tsx
const [checked, setChecked] = createSignal(false);

<Checkbox checked={checked()} onChange={(v) => setChecked(v)}>
  <Text>Accept terms</Text>
</Checkbox>;
```

## Indeterminate

```tsx
const selected = signal<string[]>([]);
const all = () => selected().length === items.length;
const some = () => selected().length > 0 && !all();

<Checkbox
  checked={all()}
  indeterminate={some()}
  onChange={(checked) => selected.set(checked ? items.map((i) => i.id) : [])}
>
  <Text>Select all</Text>
</Checkbox>;
```

## Disabled

```tsx
<Checkbox disabled checked>
  <Text>Disabled</Text>
</Checkbox>
```

## Style override

Wrapper token chrome and default mark, then consumer styles shallow-merge on top (consumer wins per key). `class` / `indicatorClass` concatenate when both are set. Pass `indicator` to replace the default check / dash.

```tsx
<Checkbox
  checked={on()}
  onChange={setOn}
  style={{ gap: 12 }}
  indicatorStyle={{ width: 20, height: 20 }}
  focusStyle={{ borderColor: colors.primary }}
>
  <Text>Larger box</Text>
</Checkbox>
```

## API

### Props

| Prop                 | Type                   | Default | Notes                                                              |
| -------------------- | ---------------------- | ------- | ------------------------------------------------------------------ |
| `checked`            | `boolean`              | —       | Controlled value (from base)                                       |
| `indeterminate`      | `boolean`              | —       | Mixed state; wins over `checked` while set (from base)             |
| `disabled`           | `boolean`              | —       | Forwarded; wrapper merges `{ opacity: 0.5 }` under `disabledStyle` |
| `accessibilityLabel` | `string \| null`       | —       | Forwarded                                                          |
| `role`               | `AccessibilityRole`    | —       | Forwarded (default `"checkbox"`)                                   |
| `children`           | `JSX.Element`          | —       | Label / adjacent content after the indicator                       |
| `indicator`          | `JSX.Element`          | —       | Mark inside the box; wrapper default check / dash when omitted     |
| `indicatorClass`     | `string`               | —       | Forwarded; concatenated after any wrapper class                    |
| `indicatorStyle`     | `StyleProp<ViewStyle>` | —       | Merged over token indicator chrome (consumer wins per key)         |
| `class`              | `string`               | —       | Forwarded; concatenated after any wrapper class                    |
| `style`              | `StyleProp<ViewStyle>` | —       | Merged over row chrome (`flexDirection` / `gap`)                   |
| `hoverStyle`         | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                  |
| `activeStyle`        | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                  |
| `focusStyle`         | `StyleProp<ViewStyle>` | —       | Merged over theme focus ring                                       |
| `disabledStyle`      | `StyleProp<ViewStyle>` | —       | Merged over wrapper `{ opacity: 0.5 }`                             |
| `checkedStyle`       | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                  |
| `indeterminateStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                  |
| `classList`          | object                 | —       | Forwarded                                                          |
| `testID`             | string                 | —       | Forwarded                                                          |
| `tooltip`            | string                 | —       | Forwarded                                                          |
| `onLayout`           | function               | —       | Forwarded                                                          |
| `ref`                | ref                    | —       | Forwarded                                                          |

Remaining `CheckboxProps` / `ComponentHostProps` from `nsh/base` also pass through.

### Events

| Event      | Notes                                                               |
| ---------- | ------------------------------------------------------------------- |
| `onChange` | `(checked: boolean) => void` — store CLI `nsh` 0.4.0 base signature |

## Differences

| Topic        | shadcn (`bases/base`)                       | This package                                                                                    |
| ------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Root         | `@base-ui/react/checkbox` Root + Indicator  | `nsh/base` `Checkbox` + theme tokens; single export                                             |
| Label        | sibling `Label` / `FieldLabel` + `htmlFor`  | put label `Text` in `children`                                                                  |
| Change event | `onCheckedChange`                           | `onChange(checked: boolean)` (store `nsh` 0.4.0; newer nsh website docs may show `{ checked }`) |
| Variants     | none on `bases/base` Checkbox               | none — token chrome + default mark only                                                         |
| Class hooks  | `className` / `cn-checkbox`                 | `class` + token `style` / `indicatorStyle`; consumer styles merge over defaults                 |
| Indicator    | always `CheckboxPrimitive.Indicator` + icon | default check / dash; override with `indicator`                                                 |

## Not forwarded

None — all `nsh/base` Checkbox props are forwarded. The wrapper only applies token chrome, a default mark when `indicator` is omitted, and merges its defaults under consumer style hooks (`class` / `indicatorClass` concatenate).
