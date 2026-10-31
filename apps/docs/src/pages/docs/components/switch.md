---
layout: ../../../layouts/Docs.astro
title: Switch
description: Styled switch wrapping nsh/base Switch.
component: true
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add switch
# monorepo:
shadcn-nsh add switch -c apps/web
```

## Usage

```tsx
import { Switch } from "@workspace/ui/components/ui/switch";
import { Text } from "nsh";

<Switch checked onChange={(e) => console.log(e.checked)}>
  <Text>Notifications</Text>
</Switch>;
```
