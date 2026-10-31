---
layout: ../../../layouts/Docs.astro
title: Table
description: Styled table wrapping nsh/base Table.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Table](https://nsh.dev/elements/table).

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
      <TableHead><Text>Name</Text></TableHead>
      <TableHead><Text>Role</Text></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell><Text>Ada</Text></TableCell>
      <TableCell><Text>Engineer</Text></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Source

Authoring: `packages/ui/table.tsx`. Registry: `table` (depends on `theme`).
