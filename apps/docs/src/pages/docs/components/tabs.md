---
title: Tabs
description: A pill track or underlined row with a traveling indicator.
component: true
demo: tabs
---

## Installation

```sh
npx shadcn-nsh@latest add tabs
```

## Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
</Tabs>
```

## Examples

### Underline

```tsx
<TabsList variant="line">
  <TabsTrigger value="inbox">Inbox</TabsTrigger>
</TabsList>
```

## API

Uses `tabsLook` / `underlineTabsLook` and `TabTitle`. Composition: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Tab`. Every prop of [`nsh/base` Tabs](https://nsh.dev/elements/tabs) / [`Tab`](https://nsh.dev/elements/tab) passes through on the list and triggers.

| Prop (on `TabsList`) | Type                  | Default   |
| -------------------- | --------------------- | --------- |
| `variant`            | `"default" \| "line"` | `default` |
