---
title: Pagination
description: Page numbers and chevrons with the current page lit primary.
component: true
demo: pagination
---

## Installation

```npm
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

### A jump menu

`renderItem` draws every item, the ellipsis included, and an ellipsis is handed the run it hides:
`start`, the first page left out, and `end`, the page after the last. Drawing that item as a `Menu`
is what makes a ten-thousand-page archive navigable — the pages of the run nearest the one shown,
a First page and a Last page, the rest through the arrows. `disabled` (an offline archive) makes
every item inert, the ellipsis with them.

```tsx
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/ui/menu";

const ARCHIVE = 10000;

/** The 25 pages of a run at the end nearest the page shown. */
const nearPages = (start: number, end: number, current: number) => {
  const [from, to] =
    end - start <= 25 ? [start, end] : start > current ? [start, start + 25] : [end - 25, end];
  return Array.from({ length: to - from }, (_, i) => from + i);
};

<Pagination
  page={current()}
  totalPages={ARCHIVE}
  visiblePages={7}
  accessibilityLabel="Archive pages"
  onChange={({ page }) => setCurrent(page)}
  renderItem={(item) => {
    if (item.kind !== "ellipsis") return paginationArrows(item);
    const start = item.start ?? 1;
    const end = item.end ?? start + 1;
    return (
      <Menu>
        <MenuTrigger>
          <View
            accessibilityLabel={`Pages ${start} to ${end - 1}`}
            style={{ flex: 1, alignItems: "center" }}
          >
            <Text>…</Text>
          </View>
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>{`Pages ${start}–${end - 1}`}</MenuLabel>
          {nearPages(start, end, current()).map((at) => (
            <MenuItem onSelect={() => setCurrent(at)}>{at}</MenuItem>
          ))}
        </MenuContent>
      </Menu>
    );
  }}
/>;
```

## API

Uses `paginationItemClass` and `paginationArrows` by default. Every prop of [`nsh/base` Pagination](https://nsh.dev/elements/pagination) passes through.

| Part         | Props                                                                                                                                                          | Description                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Pagination` | `variant` (`PaginationVariant`; `default`, or `outline` on the ends), `compact` (`boolean`; label slot between ends), `page` (`number`; current page, 1-based) | Uses `paginationItemClass` and `paginationArrows` by default; `renderItem` draws every item, an ellipsis' `start` and `end` the run it hides |

`PaginationVariant` is `"default" | "outline"`; `paginationItemClass` takes the same word, as
`PaginationItemClassOptions`' `variant`.
