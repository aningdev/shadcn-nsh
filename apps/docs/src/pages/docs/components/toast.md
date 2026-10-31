---
layout: ../../../layouts/Docs.astro
title: Toast
description: Styled toast wrapping nsh/base Toast.
component: true
demo: toast
demoHeight: 360
---

Styled notification stack on `nsh/base` `ToastStack` / `Toast`. Host toasts under `ToastStack`; each `Toast` takes `title` / `description` (or custom `children`).

## Install

```sh
shadcn-nsh add toast
# monorepo:
shadcn-nsh add toast -c apps/web
```

## Usage

```tsx
import { Toast, ToastStack } from "@workspace/ui/components/ui/toast";

<ToastStack>
  <Toast title="Saved" description="Your changes were saved." />
</ToastStack>;
```

## Composition

```
ToastStack
└─ Toast*
   └─ children OR (title + description Text)
```

## Examples

### Stack with placement

```tsx
<ToastStack placement="topRight">
  <Toast title="Saved" description="Your changes were saved." />
  <Toast title="Heads up" description="A second toast in the stack." />
</ToastStack>
```

### Custom children

```tsx
import { Text } from "nsh";

<ToastStack>
  <Toast accessibilityLabel="Custom">
    <Text>Fully custom body</Text>
  </Toast>
</ToastStack>
```

### Dismiss request

```tsx
<ToastStack>
  <Toast
    title="Undo?"
    description="Deleted draft"
    onDismissRequest={() => {}}
  />
</ToastStack>
```

## API

**`ToastStack`**

| Prop               | Type                                     | Default      | Notes              |
| ------------------ | ---------------------------------------- | ------------ | ------------------ |
| `placement`        | `Anchor`                                 | `"topRight"` | Stack anchor       |
| `motion`           | `ToastMotion`                            | —            | From `nsh/base`    |
| `children`         | `JSX.Element`                            | —            | `Toast` children   |
| `onExpandedChange` | `(event: { expanded: boolean }) => void` | —            |                    |
| `onCancel`         | `() => void`                             | —            |                    |

**`Toast`**

| Prop                 | Type                    | Notes                                        |
| -------------------- | ----------------------- | -------------------------------------------- |
| `transitionStatus`   | `ToastTransitionStatus` | From `nsh/base`                              |
| `title`              | `string`                | Used when `children` omitted                 |
| `description`        | `string`                | Used when `children` omitted                 |
| `accessibilityLabel` | `string \| null`        | Defaults to `title`                          |
| `children`           | `JSX.Element`           | Overrides title/description default layout   |
| `onDismissRequest`   | `() => void`            |                                              |

`Anchor`, `ToastMotion`, and `ToastTransitionStatus` are imported from `nsh/base` inside the wrapper and are **not** re-exported.

## Differences

| Topic       | shadcn / sonner                                              | This package                                                          |
| ----------- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| API shape   | `toast()` / `Toaster` imperative helpers (sonner)            | declarative `ToastStack` + `Toast` children                           |
| Content     | message string or rich JSX via toast APIs                    | wrapper `title` / `description` props, or `children`                  |
| Placement   | toaster position props                                       | `ToastStack` `placement` (`Anchor`, default `"topRight"`)             |
| Parts       | often a single toaster host                                  | explicit stack + item exports                                         |
| Presentation| library-owned toaster chrome                                 | nsh Toast / ToastStack + fixed card styles from the wrapper           |

## Not forwarded

From `nsh/base` ToastStack / Toast: stack `style` (gap/padding/`maxWidth`); toast `style` (card chrome). `title` / `description` are wrapper-only — rendered as default children, not passed through as base props. `accessibilityLabel` defaults to `title` when omitted.
