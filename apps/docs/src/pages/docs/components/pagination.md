---
layout: ../../../layouts/Docs.astro
title: Pagination
description: Page numbers and chevrons with the current page lit primary.
component: true
demo: pagination
---

## Installation

```sh
npx shadcn-nsh@latest add pagination
```

## Usage

```tsx
import { Pagination } from "@/components/ui/pagination";
```

```tsx
<Pagination page={page()} totalPages={pages()} onChange={({ page }) => page.set(page)} />
```

## Examples

### Compact

A `compact` pager keeps Previous, a child label, and Next on one row.

```tsx
<Pagination compact variant="outline" page={chapter()} totalPages={12}>
  <Text>Chapter {chapter()} of 12</Text>
</Pagination>
```

### Custom items

```tsx
import { paginationArrows, paginationItemClass } from "@/components/ui/pagination";

<Pagination
  itemClass={paginationItemClass({ variant: "outline" })}
  renderItem={paginationArrows}
/>;
```

## API

Uses `paginationItemClass` and `paginationArrows` by default. Every prop of [`nsh/base` Pagination](https://nsh.dev/elements/pagination) passes through.

| Prop      | Type                | Notes                               |
| --------- | ------------------- | ----------------------------------- |
| `variant` | `PaginationVariant` | `default`, or `outline` on the ends |
| `compact` | `boolean`           | Label slot between ends             |
| `page`    | `number`            | Current page (1-based)              |

`PaginationVariant` is `"default" | "outline"`; `paginationItemClass` takes the same word (`{ variant }`).
