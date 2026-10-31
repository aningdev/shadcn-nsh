---
layout: ../../../layouts/Docs.astro
title: Collapsible
description: Styled collapsible wrapping nsh/base Collapsible.
component: true
demo: collapsible
---

Styled collapsible on `nsh/base`. Trigger is `children`; panel is the `content` prop.

## Install

```sh
shadcn-nsh add collapsible
# monorepo:
shadcn-nsh add collapsible -c apps/web
```

## Usage

```tsx
import { Collapsible } from "@workspace/ui/components/ui/collapsible";
import { Text } from "nsh";

<Collapsible open content={<Text>Hidden until open</Text>}>
  <Text>Trigger</Text>
</Collapsible>;
```

## Composition

```
Collapsible
├─ children → trigger
└─ content  → panel
```

## API

| Prop       | Type          | Default | Notes             |
| ---------- | ------------- | ------- | ----------------- |
| `open`     | `boolean`     | —       |                   |
| `reveal`   | `boolean`     | `true`  |                   |
| `content`  | `JSX.Element` | —       | Collapsible panel |
| `children` | `JSX.Element` | —       | Trigger           |
