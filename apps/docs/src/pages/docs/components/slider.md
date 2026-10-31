---
layout: ../../../layouts/Docs.astro
title: Slider
description: Styled slider wrapping nsh/base Slider.
component: true
demo: slider
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add slider
# monorepo:
shadcn-nsh add slider -c apps/web
```

## Usage

```tsx
import { Slider } from "@workspace/ui/components/ui/slider";

<Slider defaultValue={40} min={0} max={100} onChange={(e) => console.log(e.value)} />;
```
