---
layout: ../../../layouts/Docs.astro
title: Table
description: Styled table wrapping nsh/base Table.
component: true
demo: table
---

Styled table primitives on `nsh/base` Table parts.

## Install

```sh
shadcn-nsh add table
# monorepo:
shadcn-nsh add table -c apps/web
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

<Table>
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
├─ TableHeader
│  └─ TableRow → TableHead*
├─ TableBody
│  └─ TableRow → TableCell*
├─ TableFooter (optional)
└─ TableCaption (optional)
```

## API

Parts take `children` (and `Table` also takes `accessibilityLabel?`). Styling is owned by the wrappers; no extra behavior props beyond base structure.
