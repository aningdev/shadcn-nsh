---
layout: ../../../layouts/Docs.astro
title: Tabs
description: Styled tabs wrapping nsh/base Tabs.
component: true
demo: tabs
---

Styled tabs on `nsh/base`. Root `Tabs` is a style shell; selection lives on each `Tab` via `selected` / `onPress` — not a `value` on the root.

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

const [tab, setTab] = createSignal("one");

<Tabs>
  <Tab selected={tab() === "one"} onPress={() => setTab("one")}>
    <Text>One</Text>
  </Tab>
  <Tab selected={tab() === "two"} onPress={() => setTab("two")}>
    <Text>Two</Text>
  </Tab>
</Tabs>;
```

## Composition

```
Tabs
└── Tab*
```

Own the selected panel outside this tree — there is no `TabsContent` export.

## Examples

### Three tabs

```tsx
const [tab, setTab] = createSignal("one");

<>
  <Tabs>
    <Tab selected={tab() === "one"} onPress={() => setTab("one")}>
      <Text>One</Text>
    </Tab>
    <Tab selected={tab() === "two"} onPress={() => setTab("two")}>
      <Text>Two</Text>
    </Tab>
    <Tab selected={tab() === "three"} onPress={() => setTab("three")}>
      <Text>Three</Text>
    </Tab>
  </Tabs>
  <Text>Panel: {tab()}</Text>
</>
```

### Disabled tab

```tsx
<Tabs>
  <Tab selected onPress={() => {}}>
    <Text>Active</Text>
  </Tab>
  <Tab disabled>
    <Text>Soon</Text>
  </Tab>
</Tabs>
```

## API

### `Tabs`

| Prop       | Type          | Default | Notes          |
| ---------- | ------------- | ------- | -------------- |
| `children` | `JSX.Element` | —       | `Tab` children |

### `Tab`

| Prop                 | Type             | Default | Notes              |
| -------------------- | ---------------- | ------- | ------------------ |
| `selected`           | `boolean`        | —       | Active look        |
| `disabled`           | `boolean`        | —       |                    |
| `accessibilityLabel` | `string \| null` | —       |                    |
| `children`           | `JSX.Element`    | —       | Label content      |
| `onPress`            | `() => void`     | —       | Selection handler  |

## Differences

| Topic       | shadcn                                              | This package                                           |
| ----------- | --------------------------------------------------- | ------------------------------------------------------ |
| Selection   | `value` / `onValueChange` on `Tabs`                 | `selected` / `onPress` on each `Tab`                   |
| Parts       | `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | `Tabs` + `Tab` only; panels are app-owned              |
| Indicator   | list underline / Radix                              | pill bar; base indicator hidden by the wrapper         |
| Class hooks | `className` / CVA                                   | theme tokens + locked styles                           |

## Not forwarded

From `nsh/base` Tabs / Tab: root `style` / `indicatorStyle` and tab `style` / `focusStyle`. The wrapper paints the muted pill bar, hides the base indicator, and styles the selected tab background. Extend the copied source if you need base knobs.
