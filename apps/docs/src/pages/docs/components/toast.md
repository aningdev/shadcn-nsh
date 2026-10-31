---
layout: ../../../layouts/Docs.astro
title: Toast
description: Styled toast wrapping nsh/base Toast.
component: true
demo: toast
demoHeight: 360
---

Styled toast stack on `nsh/base` `Toast` / `ToastStack`.

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
└─ Toast
```

## API

**`ToastStack`**

| Prop               | Type                                     | Default      | Notes |
| ------------------ | ---------------------------------------- | ------------ | ----- |
| `placement`        | `Anchor`                                 | `"topRight"` |       |
| `motion`           | `ToastMotion`                            | —            |       |
| `children`         | `JSX.Element`                            | —            |       |
| `onExpandedChange` | `(event: { expanded: boolean }) => void` | —            |       |
| `onCancel`         | `() => void`                             | —            |       |

**`Toast`**

| Prop                 | Type                    | Notes                              |
| -------------------- | ----------------------- | ---------------------------------- |
| `transitionStatus`   | `ToastTransitionStatus` |                                    |
| `title`              | `string`                | Used when `children` omitted       |
| `description`        | `string`                |                                    |
| `accessibilityLabel` | `string \| null`        | Defaults to `title`                |
| `children`           | `JSX.Element`           | Overrides title/description layout |
| `onDismissRequest`   | `() => void`            |                                    |
