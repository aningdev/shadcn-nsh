---
layout: ../../../layouts/Docs.astro
title: Link
description: Styled link wrapping nsh/base Link.
component: true
demo: link
---

Styled navigation link on `nsh/base` Link. nsh-only — not part of the shadcn/Radix set. Use `linkColor()` for a primary-colored label.

## Install

```sh
shadcn-nsh add link
# monorepo:
shadcn-nsh add link -c apps/web
```

## Usage

```tsx
import { Link, linkColor } from "@workspace/ui/components/ui/link";
import { Text } from "nsh";

<Link href="https://nsh.dev" onPress={() => {}}>
  <Text style={{ color: linkColor() }}>Open nsh.dev</Text>
</Link>;
```

## Examples

### Current page

```tsx
<Link href="/docs" current onPress={() => {}}>
  <Text style={{ color: linkColor(), fontWeight: "600" }}>Docs</Text>
</Link>
```

### Disabled

```tsx
<Link href="https://nsh.dev" disabled>
  <Text>Unavailable</Text>
</Link>
```

### Open with + onOpen

```tsx
<Link href="https://nsh.dev" openWith="system" onOpen={(e) => console.log(e.href)}>
  <Text style={{ color: linkColor() }}>External</Text>
</Link>
```

## API

### `Link`

| Prop                 | Type                                | Default | Notes                  |
| -------------------- | ----------------------------------- | ------- | ---------------------- |
| `href`               | `string`                            | —       | Destination            |
| `current`            | `boolean`                           | —       | Current-page semantics |
| `disabled`           | `boolean`                           | —       |                        |
| `openWith`           | `"system" \| "app"`                 | —       | How to open the href   |
| `accessibilityLabel` | `string \| null`                    | —       |                        |
| `children`           | `JSX.Element`                       | —       | Label content          |
| `onOpen`             | `(event: { href: string }) => void` | —       |                        |
| `onPress`            | `() => void`                        | —       |                        |

### `linkColor`

| Export      | Type          | Notes                          |
| ----------- | ------------- | ------------------------------ |
| `linkColor` | `() => color` | Returns theme `colors.primary` |

## Differences

nsh-only — no shadcn/Radix counterpart in the usual registry set. Closest shadcn pattern is `Button variant="link"` or a plain `<a>`; this package exposes a real `Link` on `nsh/base` with `href` / `openWith` / `current`.

## Not forwarded

From `nsh/base` Link: style hooks (`style`, `hoverStyle`, `focusStyle`, …). Disabled opacity and hover fade are fixed by this wrapper. Extend the copied source if you need base knobs.
