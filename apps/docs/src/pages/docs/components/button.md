---
layout: ../../../layouts/Docs.astro
title: Button
description: Styled button wrapping nsh/base Button.
component: true
demo: button
---

Styled button on `nsh/base` Button. Variants: `default`, `secondary`, `outline`, `destructive`, `ghost`.

## Install

```sh
shadcn-nsh add button
# monorepo:
shadcn-nsh add button -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";

<Button onPress={() => {}}>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
<Button disabled>Disabled</Button>
```

## Source

Authoring: `packages/ui/button.tsx`. Registry: `button` (depends on `theme`).
