---
layout: ../../../layouts/Docs.astro
title: Link
description: A text link with underline motion, on the shared nav look.
component: true
demo: link
---

## Installation

```sh
npx shadcn-nsh@latest add link
```

## Usage

```tsx
import { Link } from "@/components/ui/link";
```

```tsx
<Link href="https://nsh.dev">Native Shell</Link>
```

## Examples

### Quiet

A quiet link sits in a footer: muted, with no resting underline.

```tsx
<Link href="#docs" quiet>
  Documentation
</Link>
```

### Current

The page a link names is the one shown.

```tsx
<Link href="#here" current>
  Current page
</Link>
```

### External

`icon` adds the arrow a site outside the app gets.

```tsx
<Link href="https://example.com" icon>
  External
</Link>
```

## API

Uses `linkLook` and `LinkText`. Every prop of [`nsh/base` Link](https://nsh.dev/elements/link) passes through.

| Prop      | Type      | Notes              |
| --------- | --------- | ------------------ |
| `quiet`   | `boolean` | Muted footer style |
| `current` | `boolean` | Current page       |
| `visited` | `boolean` | Violet once opened |
| `inline`  | `boolean` | In a paragraph     |
| `icon`    | `boolean` | External arrow     |
