---
layout: ../../../layouts/Docs.astro
title: Toast
description: Styled toast wrapping nsh/base Toast / ToastStack — theme tokens + sonner-shaped toast() / Toaster; full base prop pass-through.
component: true
demo: toast
demoHeight: 480
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns toast lifecycle (`ToastManager`), stack layout / expand-on-hover (`ToastStack`), swipe-to-dismiss, Escape / back, and the alert role — unstyled on every platform. This package is the styled layer on top: card chrome, theme tokens, and a sonner-shaped `toast()` + `<Toaster />` convenience over those primitives, the same role a community library plays above `nsh/base`. A [`Toast`](https://nsh.dev/elements/toast) is a short message over the app; mount `<Toaster />` once and call `toast()` from anywhere. Store CLI `nsh` 0.4.0 `onExpandedChange` is `(expanded: boolean) => void` (newer website samples may show an object event).

## Install

```npx tabs
npx shadcn-nsh@latest add toast
```

```bunx tabs
bunx shadcn-nsh@latest add toast
```

```pnx tabs
pnx shadcn-nsh@latest add toast
```

```yarn tabs
yarn dlx shadcn-nsh@latest add toast
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { toast, Toaster } from "@workspace/ui/components/ui/toast";

<>
  <Button onPress={() => toast("Copied", { description: "Link on clipboard" })}>Show toast</Button>
  <Toaster placement="topRight" />
</>;
```

## Composition

```
Toaster (Overlay + default ToastManager)
└── ToastStack (nsh/base ToastStack)
    └── Toast* (nsh/base Toast)

Low-level: ToastManager + ToastStack + Toast for custom lifecycles.
Imperative: toast() / toast.dismiss(id?)
```

## Placement

```tsx
<Toaster placement="bottomCenter" />
```

## Dismiss

```tsx
const id = toast("Saving…", { timeout: Infinity });
// …
toast.dismiss(id);
toast.dismiss(); // all
```

## Style override

Wrapper toast card chrome (`padding`, border, radius, card fill) and stack chrome (`gap` / `maxWidth`), then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set. Host style hooks on `Toast` / `ToastStack` also merge. `Toaster` merges Overlay chrome via `style` / `class`, and stack chrome via `stackStyle` / `stackClass`.

```tsx
<Toast
  transitionStatus="present"
  title="Merged"
  style={{ padding: 16, minWidth: 280 }}
  class="my-toast"
/>

<Toaster stackStyle={{ maxWidth: 420 }} style={{ padding: 20 }} />
```

## Low-level stack

```tsx
import { Toast, ToastManager, ToastStack } from "@workspace/ui/components/ui/toast";

const manager = new ToastManager();
// push / visible / advance / dismiss — see nsh.dev/elements/toast

<ToastStack placement="topRight" onExpandedChange={(open) => paused.set(open)}>
  <Toast transitionStatus="present" title="Custom lifecycle" />
</ToastStack>;
```

## API

### `toast()` / `toast.dismiss`

| Call                    | Notes                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `toast(message, opts?)` | Pushes onto the default manager; returns `id`. `opts`: `id?`, `description?`, `timeout?` (ms, default `4000`; `null` / `Infinity`: stay) |
| `toast.dismiss(id?)`    | Dismiss one id, or every toast when omitted                                                                                              |

Requires `<Toaster />` mounted (starts the lifecycle tick).

### `Toaster` Props

| Prop                                                                              | Type                   | Default      | Notes                                       |
| --------------------------------------------------------------------------------- | ---------------------- | ------------ | ------------------------------------------- |
| `placement`                                                                       | `Anchor`               | `"topRight"` | Stack edge; Overlay alignment follows       |
| `motion`                                                                          | `ToastMotion`          | Sonner       | Forwarded to stack / manager defaults       |
| `closeOnEscape`                                                                   | `boolean`              | —            | Forwarded to `ToastStack`                   |
| `class`                                                                           | `string`               | —            | Overlay class; concatenated                 |
| `style`                                                                           | `StyleProp<ViewStyle>` | —            | Merged over Overlay edge / safe-area chrome |
| `stackClass`                                                                      | `string`               | —            | ToastStack class; concatenated              |
| `stackStyle`                                                                      | `StyleProp<ViewStyle>` | —            | Merged over stack chrome                    |
| `stackHoverStyle` / `stackActiveStyle` / `stackFocusStyle` / `stackDisabledStyle` | `StyleProp<ViewStyle>` | —            | Forwarded / merge on stack                  |

### Events

| Event              | Notes                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `onExpandedChange` | `(expanded: boolean) => void` — store CLI `nsh` 0.4.0 (pointer / finger expands the stack; pauses timeouts) |
| `onCancel`         | `() => void` — Escape / back; default dismisses the newest toast                                            |

### `Toast` Props

| Prop                                                          | Type                                  | Default                       | Notes                                                                                  |
| ------------------------------------------------------------- | ------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| `transitionStatus`                                            | `"starting" \| "present" \| "ending"` | —                             | Lifecycle phase from the manager                                                       |
| `title` / `description`                                       | `string`                              | —                             | Convenience text when `children` omitted                                               |
| `startingClass`                                               | `string \| null`                      | `opacity-0 translate-y-4`     | Replaces the default when set (`null` turns it off). No `startingStyle` on store 0.4.0 |
| `endingClass`                                                 | `string \| null`                      | `opacity-0 scale-95`          | Replaces the default when set                                                          |
| `swipingClass`                                                | `string \| null`                      | `transition-none`             | Replaces the default when set                                                          |
| `swipeDirection`                                              | `SwipeDirection \| null`              | —                             | Forwarded (`null` disables swipe)                                                      |
| `swipeThreshold`                                              | `number`                              | —                             | Forwarded                                                                              |
| `accessibilityLabel`                                          | `string \| null`                      | title + description           | Forwarded                                                                              |
| `class`                                                       | `string \| null`                      | `transition-all duration-200` | Replaces the motion class when set                                                     |
| `style`                                                       | `StyleProp<ViewStyle>`                | —                             | Merged over the raised row                                                             |
| `hoverStyle` / `activeStyle` / `focusStyle` / `disabledStyle` | `StyleProp<ViewStyle>`                | —                             | Forwarded / merge                                                                      |
| `children`                                                    | `JSX.Element`                         | —                             | Custom body (skips title / description chrome)                                         |
| `onDismissRequest`                                            | `() => void`                          | —                             | Swipe dismissed                                                                        |

Remaining `ToastProps` / `ComponentHostProps` from `nsh/base` also pass through.

### `ToastStack` Props

| Prop                                                          | Type                          | Default      | Notes                                         |
| ------------------------------------------------------------- | ----------------------------- | ------------ | --------------------------------------------- |
| `placement`                                                   | `Anchor`                      | `"topRight"` | Edge the stack lays out from                  |
| `motion`                                                      | `ToastMotion`                 | —            | Forwarded                                     |
| `closeOnEscape`                                               | `boolean`                     | —            | Forwarded                                     |
| `class`                                                       | `string`                      | —            | Concatenated                                  |
| `style`                                                       | `StyleProp<ViewStyle>`        | —            | Merged over stack chrome (`gap` / `maxWidth`) |
| `hoverStyle` / `activeStyle` / `focusStyle` / `disabledStyle` | `StyleProp<ViewStyle>`        | —            | Forwarded / merge                             |
| `children`                                                    | `JSX.Element`                 | —            | Toast items, oldest first                     |
| `onExpandedChange`                                            | `(expanded: boolean) => void` | —            | Store 0.4.0 signature                         |
| `onCancel`                                                    | `() => void`                  | —            | Escape / back                                 |

Remaining `ToastStackProps` / `ComponentHostProps` from `nsh/base` also pass through.

### `ToastManager`

Re-exported from `nsh/base` unchanged (`push` / `dismiss` / `dismissAll` / `advance` / `visible` / …).

## Differences

| Topic              | shadcn (`bases/base` toast / sonner)                            | This package                                                                                                |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Public surface     | Base UI `Toaster` + parts, or sonner `Toaster`                  | sonner-shaped `toast()` + `Toaster`; low-level `Toast` / `ToastStack` / `ToastManager`                      |
| Parts              | `Toast` / `ToastTitle` / `ToastDescription` / `ToastAction` / … | `ToastTitle` / `ToastDescription` / `ToastClose`, plus title / description props when `children` is omitted |
| Surface            | sonner card                                                     | raised row: card fill, `finish.control.rest`, border; close cross sinks to 90% (still when reduced)         |
| Manager            | `createToastManager` / sonner internals                         | `nsh/base` `ToastManager`                                                                                   |
| Placement          | CSS viewport / sonner `position`                                | `Anchor` on `ToastStack` / `Toaster` (`topRight`, `bottomCenter`, …)                                        |
| Expand             | Base UI data-expanded                                           | `ToastStack` expand-on-hover / finger; pause via `advance(expanded)`                                        |
| Class hooks        | `className` / `cn-toast*`                                       | `class` + token `style`; consumer styles merge over defaults                                                |
| `onExpandedChange` | —                                                               | store `nsh` 0.4.0 `(expanded: boolean)`; newer website samples may show `{ expanded }`                      |

## Not forwarded

None for store CLI `nsh` 0.4.0 `Toast` / `ToastStack` props — all are forwarded. The wrapper applies the raised row, stack width and overlay insets, sonner-shaped `toast()` + `Toaster`, convenience `title` / `description`, and toast.md's 200 ms classes while the consumer left that hook unset. Store 0.4.0 has no `startingStyle` / `endingStyle` on Toast, so the entrance is `startingClass` only. A set `class` replaces the motion class instead of being concatenated.
