---
layout: ../../../layouts/Docs.astro
title: Tabs
description: Styled tabs wrapping nsh/base Tabs.
component: true
demo: tabs
---

Styled tabs on `nsh/base`. Root `Tabs` is a style shell; selection lives on each `Tab`.

## Install

```sh
shadcn-nsh add tabs
# monorepo:
shadcn-nsh add tabs -c apps/web
```

## Usage

```tsx
import { Tab, Tabs } from "@workspace/ui/components/ui/tabs";
import { Text } from "nsh";

<Tabs>
  <Tab selected onPress={() => {}}>
    <Text>Account</Text>
  </Tab>
  <Tab onPress={() => {}}>
    <Text>Password</Text>
  </Tab>
</Tabs>;
```

## Composition

```
Tabs
└─ Tab (selected / onPress per tab)
```

## API

**`Tabs`** — `children?` only (indicator chrome hidden by the wrapper).

**`Tab`**

| Prop                 | Type             | Notes |
| -------------------- | ---------------- | ----- |
| `selected`           | `boolean`        |       |
| `disabled`           | `boolean`        |       |
| `accessibilityLabel` | `string \| null` |       |
| `children`           | `JSX.Element`    |       |
| `onPress`            | `() => void`     |       |

<div class="callout">

**Not forwarded** on `Tabs`: value/orientation and indicator style knobs from base — this root only lays out children. Drive selection via each `Tab`’s `selected` / `onPress`.

</div>
