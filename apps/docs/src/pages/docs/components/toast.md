---
layout: ../../../layouts/Docs.astro
title: Toast
description: ToastStack / Toast plus sonner-shaped toast() + Toaster.
component: true
demo: toast
demoHeight: 360
---

Imperative API mirrors sonner: mount `<Toaster />`, call `toast()`.

## Install

```sh
shadcn-nsh add toast
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
Toaster
└── ToastStack
    └── Toast*
```

Low-level: `ToastManager`, `ToastStack`, `Toast` for custom lifecycles.

## Differences

| Topic           | shadcn sonner             | This package                              |
| --------------- | ------------------------- | ----------------------------------------- |
| API             | `toast()` + `<Toaster />` | same surface over `nsh/base` ToastManager |
| Rich JSX toasts | supported                 | title/description strings in the helper   |

## Not forwarded

Motion / stack style knobs beyond `placement` / `motion` on Toaster/Stack.
