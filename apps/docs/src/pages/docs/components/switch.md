---
layout: ../../../layouts/Docs.astro
title: Switch
description: Styled switch wrapping nsh/base Switch.
component: true
demo: switch
---

Styled on/off switch on `nsh/base` Switch. Track and thumb chrome are fixed; put an optional label in `children`.

## Install

```sh
shadcn-nsh add switch
# monorepo:
shadcn-nsh add switch -c apps/web
```

## Usage

```tsx
import { Switch } from "@workspace/ui/components/ui/switch";
import { Text } from "nsh";

<Switch checked={on()} onChange={({ checked }) => setOn(checked)}>
  <Text>Notifications</Text>
</Switch>
```

## Examples

### Controlled

```tsx
const [on, setOn] = createSignal(true);

<Switch checked={on()} onChange={({ checked: v }) => setOn(v)}>
  <Text>Notifications</Text>
</Switch>
```

### Disabled

```tsx
<Switch disabled checked={false}>
  <Text>Disabled off</Text>
</Switch>
```

## API

| Prop                 | Type                                      | Default | Notes                |
| -------------------- | ----------------------------------------- | ------- | -------------------- |
| `checked`            | `boolean`                                 | —       |                      |
| `disabled`           | `boolean`                                 | —       |                      |
| `accessibilityLabel` | `string \| null`                          | —       |                      |
| `children`           | `JSX.Element`                             | —       | Optional label       |
| `onChange`           | `(event: { checked: boolean }) => void`   | —       |                      |

## Differences

| Topic       | shadcn                                      | This package                                           |
| ----------- | ------------------------------------------- | ------------------------------------------------------ |
| Change API  | `onCheckedChange`                           | `onChange({ checked })`                                |
| Label       | often sibling `Label`                       | optional label via `children`                          |
| Thumb/track | style via `className`                       | locked track / thumb styles in the wrapper             |
| Size        | size variants common                        | fixed dimensions                                       |

## Not forwarded

From `nsh/base` Switch: `focusStyle`, `style`, `trackStyle`, `thumbClass`, and `thumbStyle`. The wrapper owns the focus ring, primary/input track colors, and thumb translation.
