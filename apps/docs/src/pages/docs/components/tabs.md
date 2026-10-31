---
layout: ../../../layouts/Docs.astro
title: Tabs
description: Styled tabs wrapping nsh/base Tabs.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [Tabs](https://nsh.dev/elements/tabs).

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
  <Tab selected onPress={() => {}}><Text>Account</Text></Tab>
  <Tab onPress={() => {}}><Text>Password</Text></Tab>
</Tabs>
```

## Source

Authoring: `packages/ui/tabs.tsx`. Registry: `tabs` (depends on `theme`).
