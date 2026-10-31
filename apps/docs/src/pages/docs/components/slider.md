---
layout: ../../../layouts/Docs.astro
title: Slider
description: Styled slider wrapping nsh/base Slider.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Slider](https://nsh.dev/elements/slider).

## Install

```sh
shadcn-nsh add slider
# monorepo:
shadcn-nsh add slider -c apps/web
```

## Usage

```tsx
import { Slider } from "@workspace/ui/components/ui/slider";

<Slider defaultValue={40} min={0} max={100} onChange={(e) => console.log(e.value)} />
```

## Source

Authoring: `packages/ui/slider.tsx`. Registry: `slider` (depends on `theme`).
