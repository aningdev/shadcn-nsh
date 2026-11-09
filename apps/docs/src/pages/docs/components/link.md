---
layout: ../../../layouts/Docs.astro
title: Link
description: Styled link wrapping nsh/base Link — text-link look on theme tokens.
component: true
demo: link
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, keyboard activation, disabled, `href` opening, and the link role for screen readers. This package is the styled layer on top: a primary text-link look with theme tokens. [`Link`](https://nsh.dev/elements/link) navigates somewhere; for press targets that are not URLs use [`Button`](./button) — Button does **not** ship `variant="link"`.

## Install

```bash
npx shadcn-nsh@latest add link
bunx shadcn-nsh@latest add link
pnx shadcn-nsh@latest add link
yarn dlx shadcn-nsh@latest add link
```

## Usage

```tsx
import { Link, linkColor } from "@workspace/ui/components/ui/link";
import { Text } from "nsh";

<Link href="https://nsh.dev">Open nsh.dev</Link>;

<Link href="https://nsh.dev">
  <Text style={{ color: linkColor() }}>Custom label</Text>
</Link>;
```

## Text link

String children render as an underlined primary label. Prefer this for the default text-link look.

```tsx
<Link href="https://nsh.dev">Read the docs</Link>
```

## Current page

```tsx
<Link href="/docs" current>
  Docs
</Link>
```

## Disabled

```tsx
<Link href="https://nsh.dev" disabled>
  Unavailable
</Link>
```

## Open with + onOpen

```tsx
<Link href="https://nsh.dev" openWith="system" onOpen={(e) => console.log(e.href)}>
  External
</Link>
```

## API

### Props

| Prop                 | Type                    | Default | Notes                                          |
| -------------------- | ----------------------- | ------- | ---------------------------------------------- |
| `href`               | `string`                | —       | Destination                                    |
| `current`            | `boolean`               | —       | Current-page semantics (heavier label weight)  |
| `disabled`           | `boolean`               | —       | Forwarded                                      |
| `openWith`           | `"system" \| "app"`     | —       | How to open the href                           |
| `accessibilityLabel` | `string \| null`        | —       | Defaults to string `children` when omitted     |
| `children`           | `string \| JSX.Element` | —       | Strings get a themed underlined `Text` wrapper |

### Events

| Event     | Notes                               |
| --------- | ----------------------------------- |
| `onOpen`  | `(event: { href: string }) => void` |
| `onPress` | Press reported after / with opening |

### `linkColor`

| Export      | Type          | Notes                                    |
| ----------- | ------------- | ---------------------------------------- |
| `linkColor` | `() => color` | Theme `colors.primary` for custom `Text` |

## Differences

| Topic         | shadcn (`bases/base`)                        | This package                                                        |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| Link look     | Often `Button variant="link"` or `<a>` + CVA | Dedicated `Link` on `nsh/base` (nsh-only registry item)             |
| Button `link` | `variant="link"` on Button                   | **Not on Button** — use this component; see also [Button](./button) |
| Navigation    | App router / `<a href>`                      | `href` + `openWith` / `onOpen` from `nsh/base`                      |
| Class hooks   | `className`                                  | theme tokens + locked text-link styles inside the wrapper           |

## Not forwarded

From `nsh/base` Link: style hooks (`style` / `hoverStyle` / `activeStyle` / `focusStyle` / `disabledStyle`, `class`). The wrapper owns the text-link look (underline, primary color, hover opacity). Extend the copied source if you need those knobs.
