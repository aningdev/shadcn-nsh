---
title: Scrollbar
description: A hover scroll bar in the shared gallery theme.
component: true
demo: scrollbar
---

## Installation

```sh
npx shadcn-nsh@latest add scrollbar
```

## Usage

```tsx
import { Scrollbar } from "@/components/ui/scrollbar";
```

```tsx
<Scroll name="inbox" scrollbar={false} />
<Scrollbar scroll="inbox" />
```

## API

Uses `scrollbarTheme` by default. Call `Scrollbar.setTheme()` to install it on every scroll view. Every prop of [`nsh/base` Scrollbar](https://nsh.dev/elements/scrollbar) passes through.
