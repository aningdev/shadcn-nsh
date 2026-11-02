---
layout: ../../../layouts/Docs.astro
title: Tabs
description: Styled tabs wrapping nsh/base Tabs / Tab — theme tokens + List / Trigger / Content; full base prop pass-through.
component: true
demo: tabs
demoHeight: 320
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, keyboard activation (including arrow keys in a list), the disabled state, and the tab / tablist roles for screen readers — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` tree, muted pill or line chrome, and theme tokens, the same role a community library plays above `nsh/base`. [`Tabs`](https://nsh.dev/elements/tabs) switch between sections of one place; the list holds no value — each tab is told `selected` and reports `onPress`. The composition root holds the string value for you (shadcn-like); under the hood `TabsList` is `nsh/base` `Tabs` and `TabsTrigger` is `Tab`. Store CLI `nsh` 0.3.0 has no list `indicatorClass` / `indicatorStyle`; selected fill (or line underline) is applied on the trigger via `selectedStyle`.

## Install

```bash
npx shadcn-nsh@latest add tabs
bunx shadcn-nsh@latest add tabs
pnx shadcn-nsh@latest add tabs
yarn dlx shadcn-nsh@latest add tabs
```

## Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/ui/tabs";

<Tabs value={tab()} onValueChange={tab.set}>
  <TabsList>
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>
  <TabsContent value="one">Panel one</TabsContent>
  <TabsContent value="two">Panel two</TabsContent>
</Tabs>;
```

## Composition

```
Tabs
├── TabsList (nsh/base Tabs)
│   └── TabsTrigger* (nsh/base Tab; alias path: Tab)
└── TabsContent* (app panel; not a base part)
```

## Controlled

```tsx
const [section, setSection] = createSignal("overview");

<Tabs value={section()} onValueChange={setSection}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <Text>Visitors and conversion.</Text>
  </TabsContent>
  <TabsContent value="activity">
    <Text>Deploys and members.</Text>
  </TabsContent>
</Tabs>;
```

## Line

```tsx
<Tabs defaultValue="one">
  <TabsList variant="line">
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>
  <TabsContent value="one">Line panel</TabsContent>
  <TabsContent value="two">Other</TabsContent>
</Tabs>
```

## Disabled

```tsx
<TabsTrigger value="billing" disabled>
  Billing
</TabsTrigger>
```

## Style override

Wrapper token chrome, then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set. Selected look merges under `selectedStyle` (store CLI 0.3.0 has no list indicator hooks).

```tsx
<Tabs value={tab()} onValueChange={tab.set} style={{ gap: 16 }}>
  <TabsList style={{ gap: 8 }}>
    <TabsTrigger
      value="one"
      style={{ paddingHorizontal: 16 }}
      focusStyle={{ borderColor: colors.primary }}
    >
      Spaced
    </TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>
  <TabsContent value="one">
    <Text>Merged</Text>
  </TabsContent>
</Tabs>
```

## API

### `Tabs` Props

| Prop           | Type                         | Default        | Notes                                                                |
| -------------- | ---------------------------- | -------------- | -------------------------------------------------------------------- |
| `value`        | `string`                     | —              | Controlled selected value (composition root; not on `nsh/base` Tabs) |
| `defaultValue` | `string`                     | `""`           | Uncontrolled initial value                                           |
| `orientation`  | `"horizontal" \| "vertical"` | `"horizontal"` | Root flex axis; list follows (row vs column)                         |
| `children`     | `JSX.Element`                | —              | Usually `TabsList` + `TabsContent`                                   |
| `class`        | `string`                     | —              | On the root `View`; concatenated after any wrapper class             |
| `style`        | `StyleProp<ViewStyle>`       | —              | Merged over root chrome (`flexDirection` / `gap`)                    |

### Events

| Event           | Notes                                 |
| --------------- | ------------------------------------- |
| `onValueChange` | `(value: string) => void` on the root |

### `TabsList` Props

| Prop            | Type                   | Default     | Notes                                              |
| --------------- | ---------------------- | ----------- | -------------------------------------------------- |
| `variant`       | `"default" \| "line"`  | `"default"` | Wrapper-only; mirrors shadcn `bases/base` TabsList |
| `children`      | `JSX.Element`          | —           | Usually `TabsTrigger` children                     |
| `class`         | `string`               | —           | Forwarded; concatenated after any wrapper class    |
| `style`         | `StyleProp<ViewStyle>` | —           | Merged over list chrome (muted pill or line rail)  |
| `hoverStyle`    | `StyleProp<ViewStyle>` | —           | Forwarded / merge                                  |
| `activeStyle`   | `StyleProp<ViewStyle>` | —           | Forwarded / merge                                  |
| `focusStyle`    | `StyleProp<ViewStyle>` | —           | Forwarded / merge                                  |
| `disabledStyle` | `StyleProp<ViewStyle>` | —           | Forwarded / merge                                  |
| `classList`     | object                 | —           | Forwarded                                          |
| `testID`        | string                 | —           | Forwarded                                          |
| `tooltip`       | string                 | —           | Forwarded                                          |
| `onLayout`      | function               | —           | Forwarded                                          |
| `ref`           | ref                    | —           | Forwarded                                          |

Remaining `TabsProps` / `ComponentHostProps` from `nsh/base` (the tablist) also pass through. Store CLI `nsh` 0.3.0 does not export list `indicatorClass` / `indicatorStyle`.

### `TabsTrigger` / `Tab` Props

| Prop                 | Type                    | Default | Notes                                                              |
| -------------------- | ----------------------- | ------- | ------------------------------------------------------------------ |
| `value`              | `string`                | —       | Required on `TabsTrigger`; selects via the `Tabs` context          |
| `selected`           | `boolean`               | —       | On `Tab` only — `TabsTrigger` derives this from context            |
| `disabled`           | `boolean`               | —       | Forwarded; wrapper merges `{ opacity: 0.5 }` under `disabledStyle` |
| `accessibilityLabel` | `string \| null`        | —       | Forwarded; string children default the label on `TabsTrigger`      |
| `children`           | `string \| JSX.Element` | —       | Label; string children wrap in `Text` on `TabsTrigger`             |
| `class`              | `string`                | —       | Forwarded; concatenated after any wrapper class                    |
| `style`              | `StyleProp<ViewStyle>`  | —       | Merged over trigger chrome                                         |
| `hoverStyle`         | `StyleProp<ViewStyle>`  | —       | Forwarded / merge                                                  |
| `activeStyle`        | `StyleProp<ViewStyle>`  | —       | Forwarded / merge                                                  |
| `focusStyle`         | `StyleProp<ViewStyle>`  | —       | Merged over theme focus ring                                       |
| `disabledStyle`      | `StyleProp<ViewStyle>`  | —       | Merged over wrapper `{ opacity: 0.5 }`                             |
| `selectedStyle`      | `StyleProp<ViewStyle>`  | —       | Merged over pill fill or line underline                            |
| `classList`          | object                  | —       | Forwarded                                                          |
| `testID`             | string                  | —       | Forwarded                                                          |
| `tooltip`            | string                  | —       | Forwarded                                                          |
| `onLayout`           | function                | —       | Forwarded                                                          |
| `ref`                | ref                     | —       | Forwarded                                                          |

Remaining `TabProps` / `ComponentHostProps` from `nsh/base` also pass through. `Tab` is the nsh-aligned / legacy export (prefer `TabsTrigger`).

### Events

| Event     | Notes                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------- |
| `onPress` | `() => void` on the tab — store CLI `nsh` 0.3.0; `TabsTrigger` also updates the composition value |

### `TabsContent` Props

| Prop       | Type                   | Default | Notes                                              |
| ---------- | ---------------------- | ------- | -------------------------------------------------- |
| `value`    | `string`               | —       | Shown while it matches the `Tabs` context value    |
| `children` | `JSX.Element`          | —       | Panel body                                         |
| `class`    | `string`               | —       | On the panel `View`                                |
| `style`    | `StyleProp<ViewStyle>` | —       | Merged over panel chrome (`flex` / display toggle) |

### Variants (`TabsList`)

| Variant   | Notes                                                                |
| --------- | -------------------------------------------------------------------- |
| `default` | Muted pill rail; selected trigger gets background fill               |
| `line`    | Transparent rail with border; selected trigger gets bottom underline |

## Differences

| Topic        | shadcn (`bases/base`)                   | This package                                                                                 |
| ------------ | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Value API    | `Tabs` root `value` / `onValueChange`   | same on the composition root; `nsh/base` list still holds none                               |
| Parts        | `Tabs` / `List` / `Trigger` / `Content` | same names; `Tab` alias for direct base use; `TabsContent` is app `View` (base has no panel) |
| List vs root | Base UI Root + List                     | root is our context `View`; list is `nsh/base` `Tabs`                                        |
| Indicator    | CSS `after:` / data-active fill         | store `nsh` 0.3.0 has no list indicator hooks — selected chrome via trigger `selectedStyle`  |
| Change event | string on the root                      | root `onValueChange`; each tab also has `onPress()` (nsh/base)                               |
| `variant`    | on `TabsList` (`default` / `line`)      | same wrapper-only prop                                                                       |
| Class hooks  | `className` / `cn-tabs*`                | `class` + token `style`; consumer styles merge over defaults                                 |

## Not forwarded

None for store CLI `nsh` 0.3.0 `Tabs` / `Tab` props — all are forwarded. The wrapper only applies token chrome, a composition value root, and merges defaults under consumer style hooks (`class` concatenates). Newer `nsh` main list `indicatorClass` / `indicatorStyle` are absent from 0.3.0 and therefore not part of this surface.
