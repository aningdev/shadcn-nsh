---
layout: ../../../layouts/Docs.astro
title: Toast
description: A raised banner with a title, optional description, action and close.
component: true
demo: toast
---

## Installation

```sh
npx shadcn-nsh@latest add toast
```

## Usage

```tsx
import { Toast } from "@/components/ui/toast";
```

```tsx
<Toast title="Copied" description="The link is on the clipboard." />
```

## Examples

### Action

```tsx
<Toast>
  <Text style={toastTitle()}>Deleted</Text>
  <Button {...toastActionLook()}>
    <Text style={toastActionLabel()}>Undo</Text>
  </Button>
</Toast>
```

## API

Every prop of [`nsh/base` Toast](https://nsh.dev/elements/toast) passes through. `style` goes over `toastLook`.

| Prop          | Type     | Default |
| ------------- | -------- | ------- |
| `title`       | `string` |         |
| `description` | `string` |         |
