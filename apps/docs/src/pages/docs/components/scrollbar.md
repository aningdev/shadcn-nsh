---
layout: ../../../layouts/Docs.astro
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

## Examples

### A list

`Scroll` hides its platform bar; `Scrollbar` draws the theme's bar for it.

```tsx
<Scroll ref={inbox} scrollbar={false} style={{ flex: 1 }}>
  …
</Scroll>
<Scrollbar scroll={inbox} accessibilityLabel="Inbox scroll" />
```

### Every scroll view

`Scrollbar.setTheme()` installs the same look on every view that still uses the platform indicator; `null` gives the platform's back.

```tsx
Scrollbar.setTheme();
```

## API

Uses `scrollbarTheme` by default. Call `Scrollbar.setTheme()` to install it on every scroll view. Every prop of [`nsh/base` Scrollbar](https://nsh.dev/elements/scrollbar) passes through.
