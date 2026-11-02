---
layout: ../../../layouts/Docs.astro
title: Table
description: Styled table wrapping nsh/base Table parts — theme tokens + full base prop pass-through.
component: true
demo: table
demoHeight: 360
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns table semantics (table / rowgroup / row / columnheader / cell roles) and the unstyled part tree — no colors, borders, or paddings of its own. This package is the styled layer on top: bordered card chrome, muted header / footer bands, row hover, and cell padding via theme tokens, the same role a community library plays above `nsh/base`. A [`Table`](https://nsh.dev/elements/table) lays out a few app-authored rows; for many rows, sorting, or selection use DataTable on nsh (out of Phase-1).

## Install

```bash
npx shadcn-nsh@latest add table
bunx shadcn-nsh@latest add table
pnx shadcn-nsh@latest add table
yarn dlx shadcn-nsh@latest add table
```

## Usage

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/ui/table";
import { Text } from "nsh";

<Table accessibilityLabel="Team roster">
  <TableHeader>
    <TableRow>
      <TableHead>
        <Text>Name</Text>
      </TableHead>
      <TableHead>
        <Text>Role</Text>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <Text>Ada</Text>
      </TableCell>
      <TableCell>
        <Text>Engineer</Text>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

## Composition

```
Table
├── TableHeader
│   └── TableRow → TableHead*
├── TableBody
│   └── TableRow → TableCell*
├── TableFooter
│   └── TableRow → TableCell*
└── TableCaption
```

Parts match shadcn `bases/base` and store `nsh/base` exports (`Table` / `Header` / `Body` / `Footer` / `Row` / `Head` / `Cell` / `Caption`).

## Caption + footer

```tsx
<Table accessibilityLabel="Inventory">
  <TableHeader>
    <TableRow>
      <TableHead>
        <Text>Item</Text>
      </TableHead>
      <TableHead>
        <Text>Qty</Text>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <Text>Widgets</Text>
      </TableCell>
      <TableCell>
        <Text>12</Text>
      </TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell>
        <Text>Total</Text>
      </TableCell>
      <TableCell>
        <Text>12</Text>
      </TableCell>
    </TableRow>
  </TableFooter>
  <TableCaption>
    <Text>Inventory snapshot</Text>
  </TableCaption>
</Table>
```

## Style override

Wrapper chrome (outer border / radius, muted header / footer, row border + hover, cell padding), then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set. Host style hooks on every part also merge.

```tsx
<Table style={{ borderRadius: 12 }} class="my-table">
  <TableHeader style={{ backgroundColor: "transparent" }}>
    <TableRow>
      <TableHead style={{ flex: 2, paddingHorizontal: 16 }}>
        <Text>Name</Text>
      </TableHead>
      <TableHead>
        <Text>Role</Text>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow hoverStyle={{ backgroundColor: "transparent" }}>
      <TableCell style={{ flex: 2 }}>
        <Text>Ada</Text>
      </TableCell>
      <TableCell>
        <Text>Engineer</Text>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## API

### `Table` Props

| Prop                                                          | Type                   | Default | Notes                                      |
| ------------------------------------------------------------- | ---------------------- | ------- | ------------------------------------------ |
| `accessibilityLabel`                                          | `string \| null`       | —       | What screen readers call the table         |
| `class`                                                       | `string`               | —       | Concatenated                               |
| `style`                                                       | `StyleProp<ViewStyle>` | —       | Merged over outer border / radius chrome   |
| `hoverStyle` / `activeStyle` / `focusStyle` / `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge                          |
| `children`                                                    | `JSX.Element`          | —       | Header / body / footer / caption (or rows) |

Remaining `TableProps` / `ComponentHostProps` from `nsh/base` also pass through (`classList`, `testID`, `tooltip`, `onLayout`, `ref`, …).

### Events

None on store CLI `nsh` 0.3.0 Table parts — layout / a11y only.

### `TableHeader` / `TableBody` / `TableFooter` Props

| Prop                                                          | Type                   | Default | Notes                                                                  |
| ------------------------------------------------------------- | ---------------------- | ------- | ---------------------------------------------------------------------- |
| `class`                                                       | `string`               | —       | Concatenated                                                           |
| `style`                                                       | `StyleProp<ViewStyle>` | —       | Header / footer merge over muted band chrome; body has no style chrome |
| `hoverStyle` / `activeStyle` / `focusStyle` / `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                      |
| `children`                                                    | `JSX.Element`          | —       | Rows                                                                   |

### `TableRow` Props

| Prop                                           | Type                   | Default | Notes                                       |
| ---------------------------------------------- | ---------------------- | ------- | ------------------------------------------- |
| `class`                                        | `string`               | —       | Concatenated                                |
| `style`                                        | `StyleProp<ViewStyle>` | —       | Merged over bottom-border chrome            |
| `hoverStyle`                                   | `StyleProp<ViewStyle>` | —       | Merged over muted/50 hover (shadcn-aligned) |
| `activeStyle` / `focusStyle` / `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge                           |
| `children`                                     | `JSX.Element`          | —       | `TableHead` / `TableCell`                   |

Base already lays the row out as a flex row; remaining `TableRowProps` / `ComponentHostProps` pass through.

### `TableHead` / `TableCell` Props

| Prop                                                          | Type                   | Default | Notes                                       |
| ------------------------------------------------------------- | ---------------------- | ------- | ------------------------------------------- |
| `class`                                                       | `string`               | —       | Concatenated                                |
| `style`                                                       | `StyleProp<ViewStyle>` | —       | Merged over `flex: 1` + padding cell chrome |
| `hoverStyle` / `activeStyle` / `focusStyle` / `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge                           |
| `children`                                                    | `JSX.Element`          | —       | Cell content (often `Text`)                 |

### `TableCaption` Props

| Prop                                                          | Type                   | Default | Notes                        |
| ------------------------------------------------------------- | ---------------------- | ------- | ---------------------------- |
| `class`                                                       | `string`               | —       | Concatenated                 |
| `style`                                                       | `StyleProp<ViewStyle>` | —       | Merged over caption padding  |
| `hoverStyle` / `activeStyle` / `focusStyle` / `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge            |
| `children`                                                    | `JSX.Element`          | —       | Visible note about the table |

## Differences

| Topic      | shadcn (`bases/base` table)                         | This package                                                       |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| Parts      | `Table` / `Header` / `Body` / `Footer` / `Row` / …  | same names on `nsh/base` wrappers                                  |
| Container  | outer `div` (`cn-table-container`) + HTML `<table>` | single `Table` host (border / overflow / width chrome on the root) |
| Styling    | `className` + CSS (`cn-table*`)                     | token `style` + `class`; consumer styles merge over defaults       |
| Semantics  | HTML table in the browser                           | nsh table primitives (cross-platform roles)                        |
| Cell width | CSS / `className`                                   | app sets `style` widths / `flex` (defaults `flex: 1`)              |
| DataTable  | separate / app                                      | nsh `DataTable` exists; **out of Phase-1** (heavy)                 |

## Not forwarded

None for store CLI `nsh` 0.3.0 Table part props — all are forwarded. The wrapper only applies theme chrome (border / muted bands / row hover / cell padding) and merges defaults under consumer style hooks (`class` concatenates).
