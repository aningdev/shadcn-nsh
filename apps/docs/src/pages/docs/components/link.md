---
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

## API

Uses `linkLook` and `LinkText`. Every prop of [`nsh/base` Link](https://nsh.dev/elements/link) passes through.

| Prop      | Type      | Notes              |
| --------- | --------- | ------------------ |
| `quiet`   | `boolean` | Muted footer style |
| `current` | `boolean` | Current page       |
| `visited` | `boolean` | Violet once opened |
| `inline`  | `boolean` | In a paragraph     |
| `icon`    | `boolean` | External arrow     |
