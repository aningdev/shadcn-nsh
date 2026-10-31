---
layout: ../../../layouts/Docs.astro
title: Checkbox
description: Styled checkbox wrapping nsh/base Checkbox.
component: true
demo: checkbox
---

Styled checkbox on `nsh/base` Checkbox. Built-in check / dash indicators; put the label in `children`.

## Install

```sh
shadcn-nsh add checkbox
# monorepo:
shadcn-nsh add checkbox -c apps/web
```

## Usage

```tsx
import { Checkbox } from "@workspace/ui/components/ui/checkbox";
import { Text } from "nsh";

<Checkbox checked onChange={({ checked }) => console.log(checked)}>
  <Text>Accept terms</Text>
</Checkbox>
```

## Examples

### Controlled

```tsx
const [checked, setChecked] = createSignal(false);

<Checkbox checked={checked()} onChange={({ checked: v }) => setChecked(v)}>
  <Text>Accept terms</Text>
</Checkbox>
```

### Indeterminate

```tsx
<Checkbox indeterminate checked={false} onChange={({ checked }) => {}}>
  <Text>Select all</Text>
</Checkbox>
```

### Disabled

```tsx
<Checkbox disabled checked>
  <Text>Disabled</Text>
</Checkbox>
```

## API

| Prop                 | Type                                         | Default | Notes                          |
| -------------------- | -------------------------------------------- | ------- | ------------------------------ |
| `checked`            | `boolean`                                    | —       |                                |
| `indeterminate`      | `boolean`                                    | —       | Shows dash indicator           |
| `disabled`           | `boolean`                                    | —       |                                |
| `accessibilityLabel` | `string \| null`                             | —       |                                |
| `children`           | `JSX.Element`                                | —       | Label / adjacent content       |
| `onChange`           | `(event: { checked: boolean }) => void`      | —       |                                |

## Differences

| Topic       | shadcn                                      | This package                                           |
| ----------- | ------------------------------------------- | ------------------------------------------------------ |
| Parts       | `Checkbox` root + indicator slot            | single `Checkbox`; indicator is built in               |
| Label       | often sibling `Label` + `htmlFor`           | put label `Text` in `children`                         |
| Change API  | `checked` / `onCheckedChange`               | `checked` / `onChange({ checked })`                    |
| Class hooks | `className` / CVA                           | theme tokens + locked styles inside the wrapper        |

## Not forwarded

From `nsh/base` Checkbox: `focusStyle`, `style`, `indicatorStyle`, and `indicator`. The wrapper owns the focus ring, box chrome, and checkmark / dash marks.
