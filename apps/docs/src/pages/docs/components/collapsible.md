---
layout: ../../../layouts/Docs.astro
title: Collapsible
description: Styled collapsible wrapping nsh/base Collapsible — theme tokens + Trigger / Content; full base prop pass-through.
component: true
demo: collapsible
demoHeight: 300
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns expand / collapse of the `content` slot and leaves the trigger and look to the app — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` tree, region chrome, and theme tokens, the same role a community library plays above `nsh/base`. A [`Collapsible`](https://nsh.dev/elements/collapsible) shows its content after the trigger while open. Store CLI `nsh` 0.3.0 has no `reveal` spring (website docs may show it) — open / close is instant.

## Install

```bash
npx shadcn-nsh@latest add collapsible
bunx shadcn-nsh@latest add collapsible
pnx shadcn-nsh@latest add collapsible
yarn dlx shadcn-nsh@latest add collapsible
```

## Usage

```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/ui/collapsible";

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>
    <Text>Hidden until open.</Text>
  </CollapsibleContent>
</Collapsible>;
```

## Composition

```
Collapsible
├── CollapsibleTrigger
└── CollapsibleContent (nsh/base Collapsible)
```

## Controlled

```tsx
const open = signal(false);

<Collapsible open={open()} onOpenChange={(next) => open.set(next)}>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>
    <Text>Controlled panel</Text>
  </CollapsibleContent>
</Collapsible>;
```

## Style override

Wrapper region chrome (`gap: 8`), then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set. Host style hooks on Content also merge.

```tsx
<CollapsibleContent style={{ gap: 12 }} class="my-collapsible">
  <Text>Merged</Text>
</CollapsibleContent>
```

## Legacy content

```tsx
<Collapsible open={open()} content={<Text>Body in the content slot</Text>} style={{ gap: 12 }}>
  <Button onPress={() => open.set(!open())}>Toggle</Button>
</Collapsible>
```

## API

### `Collapsible` Props

| Prop            | Type                   | Default | Notes                                                                                 |
| --------------- | ---------------------- | ------- | ------------------------------------------------------------------------------------- |
| `open`          | `boolean`              | —       | Controlled open (composition root or legacy single-root)                              |
| `defaultOpen`   | `boolean`              | `false` | Uncontrolled initial open (composition invents this — not on base)                    |
| `content`       | `JSX.Element`          | —       | **Deprecated** legacy single-root; prefer `CollapsibleTrigger` + `CollapsibleContent` |
| `children`      | `JSX.Element`          | —       | Composition parts, or trigger children when `content` is set                          |
| `class`         | `string`               | —       | Host class; concatenated (legacy)                                                     |
| `style`         | `StyleProp<ViewStyle>` | —       | Host style merge over region chrome (legacy)                                          |
| `hoverStyle`    | `StyleProp<ViewStyle>` | —       | Forwarded / merge (legacy)                                                            |
| `activeStyle`   | `StyleProp<ViewStyle>` | —       | Forwarded / merge (legacy)                                                            |
| `focusStyle`    | `StyleProp<ViewStyle>` | —       | Forwarded / merge (legacy)                                                            |
| `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge (legacy)                                                            |

Remaining `CollapsibleProps` / `ComponentHostProps` from `nsh/base` also pass through on the legacy single-root.

### Events

| Event          | Notes                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `onOpenChange` | `(open: boolean) => void` — composition invents this (base has no collapsible events); matches shadcn |

### `CollapsibleTrigger` Props

| Prop       | Type                    | Default | Notes                                                                |
| ---------- | ----------------------- | ------- | -------------------------------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | String → themed `Button`; else pressable `View` with `role="button"` |
| `disabled` | `boolean`               | —       | Blocks toggle                                                        |
| `class`    | `string`                | —       | On the pressable `View` (non-string children)                        |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over `{ alignSelf, opacity }` when disabled                   |

### `CollapsibleContent` Props

| Prop            | Type                   | Default | Notes                                     |
| --------------- | ---------------------- | ------- | ----------------------------------------- |
| `children`      | `JSX.Element`          | —       | Becomes base `content` (shown while open) |
| `class`         | `string`               | —       | Host class; concatenated                  |
| `style`         | `StyleProp<ViewStyle>` | —       | Merged over region chrome (`gap: 8`)      |
| `hoverStyle`    | `StyleProp<ViewStyle>` | —       | Forwarded / merge                         |
| `activeStyle`   | `StyleProp<ViewStyle>` | —       | Forwarded / merge                         |
| `focusStyle`    | `StyleProp<ViewStyle>` | —       | Forwarded / merge                         |
| `disabledStyle` | `StyleProp<ViewStyle>` | —       | Forwarded / merge                         |
| `classList`     | object                 | —       | Forwarded                                 |
| `testID`        | string                 | —       | Forwarded                                 |
| `tooltip`       | string                 | —       | Forwarded                                 |
| `onLayout`      | function               | —       | Forwarded                                 |
| `ref`           | ref                    | —       | Forwarded                                 |

Remaining presentation `CollapsibleProps` / `ComponentHostProps` from `nsh/base` also pass through. Open / trigger come from the `Collapsible` context.

## Differences

| Topic       | shadcn (`bases/base`)                             | This package                                                                                          |
| ----------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Parts       | Root / Trigger / Content (Panel)                  | same names; Content is `nsh/base` `Collapsible`                                                       |
| Open state  | Root owns `open` / `defaultOpen` / `onOpenChange` | same on composition root; base itself has no events — wrapper invents `defaultOpen` / `onOpenChange`  |
| Trigger     | Base UI Trigger (`render` / asChild)              | string → `Button`; else pressable `View` with `accessibilityState.expanded`                           |
| Reveal      | CSS height / data-state animate                   | store `nsh` 0.3.0 has **no** `reveal`; open / close is instant (newer website docs may show `reveal`) |
| Legacy      | —                                                 | deprecated `content` prop still mounts a single-root `Collapsible`                                    |
| Class hooks | `className` / `cn-collapsible*`                   | `class` + token `style`; consumer styles merge over defaults                                          |

## Not forwarded

None for store CLI `nsh` 0.3.0 `Collapsible` props — all are forwarded on Content (and on the legacy single-root). The wrapper only applies region chrome (`gap: 8`), composition open state / Trigger, and merges defaults under consumer style hooks (`class` concatenates). Newer `nsh` website `reveal` is absent from 0.3.0 and therefore not part of this surface.
