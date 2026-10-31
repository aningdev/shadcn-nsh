---
layout: ../../../layouts/Docs.astro
title: Pagination
description: Styled pagination wrapping nsh/base Pagination.
component: true
demo: pagination
---

Styled page control on `nsh/base` Pagination. Owns item rendering (‹ › … / page numbers); pass `page`, `totalPages`, and `onChange`.

## Install

```sh
shadcn-nsh add pagination
# monorepo:
shadcn-nsh add pagination -c apps/web
```

## Usage

```tsx
import { Pagination } from "@workspace/ui/components/ui/pagination";

<Pagination page={1} totalPages={8} onChange={(e) => console.log(e.page)} />;
```

## Examples

### Controlled page

```tsx
const [page, setPage] = createSignal(1);

<Pagination page={page()} totalPages={8} onChange={(e) => setPage(e.page)} />
```

### Compact / disabled

```tsx
<Pagination page={2} totalPages={5} compact disabled />
```

### Visible page window

```tsx
<Pagination page={4} totalPages={20} visiblePages={5} onChange={(e) => {}} />
```

## API

| Prop                 | Type                                    | Default | Notes                    |
| -------------------- | --------------------------------------- | ------- | ------------------------ |
| `page`               | `number`                                | —       | Current page (required)  |
| `totalPages`         | `number`                                | —       | Total pages (required)   |
| `visiblePages`       | `number`                                | —       | Window of numbered items |
| `compact`            | `boolean`                               | —       | Compact layout           |
| `disabled`           | `boolean`                               | —       |                          |
| `accessibilityLabel` | `string \| null`                        | —       |                          |
| `children`           | `JSX.Element`                           | —       | Optional slot            |
| `onChange`           | `(event: { page: number }) => void`     | —       |                          |

## Differences

| Topic       | shadcn                                                          | This package                                           |
| ----------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| Parts       | `Pagination` / `Content` / `Item` / `Link` / `Previous` / …     | single `Pagination` with built-in item render          |
| Navigation  | compose links yourself                                          | `page` + `totalPages` + `onChange`                     |
| Labels      | text / icons via children                                       | fixed ‹ › … / page number chrome                       |
| Class hooks | `className` / CVA                                               | theme tokens + locked item styles                      |

## Not forwarded

From `nsh/base` Pagination: `style`, `itemStyle`, `focusStyle`, and `renderItem`. The wrapper owns layout, item chrome, and previous/next/ellipsis glyphs. Extend the copied source if you need base knobs.
