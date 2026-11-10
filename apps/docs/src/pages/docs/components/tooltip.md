---
layout: ../../../layouts/Docs.astro
title: Tooltip
description: Styled tooltip wrapping nsh/base Tooltip — theme tokens + Trigger / Content; full base prop pass-through.
component: true
demo: tooltip
demoHeight: 420
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns hover delay, open state, placement against the host, and pointer-passthrough so the trigger keeps working — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `Tooltip` / `TooltipTrigger` / `TooltipContent` tree (plus `TooltipProvider` for a shared delay), bubble chrome, and theme tokens, the same role a community library plays above `nsh/base`. A [`Tooltip`](https://nsh.dev/elements/tooltip) is the hint bubble given as a host's `tooltip={…}` prop. Store CLI `nsh` 0.4.0 has no enter/exit class hooks (`startingClass` / `endingClass` land in newer docs) — surface look is `class` / `style` only.

## Install

```npx tabs
npx shadcn-nsh@latest add tooltip
```

```bunx tabs
bunx shadcn-nsh@latest add tooltip
```

```pnx tabs
pnx shadcn-nsh@latest add tooltip
```

```yarn tabs
yarn dlx shadcn-nsh@latest add tooltip
```

## Usage

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>Add item</TooltipContent>
</Tooltip>;
```

## Composition

```
TooltipProvider (optional delay)
└── Tooltip
    ├── TooltipTrigger
    └── TooltipContent (nsh/base Tooltip bubble)
```

Use standalone `TooltipContent` for host `tooltip={…}`; the composition root is `TooltipTrigger` + `TooltipContent` only.

## Controlled

```tsx
const open = signal(false);

<Tooltip open={open()} onOpenChange={(next) => open.set(next)}>
  <TooltipTrigger>Pinned tip</TooltipTrigger>
  <TooltipContent>Open from the app (needed on touch)</TooltipContent>
</Tooltip>;
```

## Placement

```tsx
<Tooltip>
  <TooltipTrigger>Bottom</TooltipTrigger>
  <TooltipContent placement="bottom" align="start" offset={8}>
    Below, start-aligned
  </TooltipContent>
</Tooltip>
```

## Delay

```tsx
<TooltipProvider delay={0}>
  <Tooltip>
    <TooltipTrigger>Instant</TooltipTrigger>
    <TooltipContent>Shows at once</TooltipContent>
  </Tooltip>
</TooltipProvider>

<Tooltip>
  <TooltipTrigger>Slow</TooltipTrigger>
  <TooltipContent delay={1000}>After a second</TooltipContent>
</Tooltip>
```

## Style override

Wrapper bubble chrome (`foreground` fill, padding, radius), then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set. Host style hooks on Content also merge.

```tsx
<TooltipContent style={{ paddingHorizontal: 14, maxWidth: 320 }}>Merged chrome</TooltipContent>
```

## Host `tooltip`

```tsx
<View tooltip={<TooltipContent>Add item</TooltipContent>}>
  <Text>Icon</Text>
</View>

<View tooltip={<TooltipContent placement="bottom">Save</TooltipContent>}>
  <Text>💾</Text>
</View>
```

## API

### `Tooltip` Props

| Prop          | Type              | Default | Notes                                                    |
| ------------- | ----------------- | ------- | -------------------------------------------------------- |
| `open`        | `boolean \| null` | —       | Controlled open state                                    |
| `defaultOpen` | `boolean`         | `false` | Uncontrolled initial open                                |
| `children`    | `JSX.Element`     | —       | `TooltipTrigger` + `TooltipContent`                      |
| `placement`   | `Placement`       | —       | Default for Content when Content omits it (`"top"`)      |
| `align`       | `Align`           | —       | Default for Content when omitted (`"center"`)            |
| `offset`      | `number`          | —       | Default for Content when omitted (`4`)                   |
| `margin`      | `number`          | —       | Default for Content when omitted                         |
| `delay`       | `number`          | —       | Ms before show; default for Content (base default `500`) |
| `disabled`    | `boolean`         | —       | Never shows; blocks Trigger                              |

Bubble chrome, placement overrides, and host props belong on `TooltipContent` (including standalone `tooltip={…}` hosts).

### Events

| Event          | Notes                                                          |
| -------------- | -------------------------------------------------------------- |
| `onOpenChange` | `(event: { open: boolean; reason: OpenChangeReason }) => void` |
| `onOpen`       | `() => void` when shown                                        |
| `onClose`      | `() => void` when gone                                         |

### `TooltipTrigger` Props

| Prop       | Type                    | Default | Notes                                                                  |
| ---------- | ----------------------- | ------- | ---------------------------------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | String → themed `Button`; else wrapped `View`                          |
| `disabled` | `boolean`               | —       | Visual disable; Root `disabled` also blocks                            |
| `class`    | `string`                | —       | On the `Button` (string) or the wrapper `View`                         |
| `style`    | `StyleProp<ViewStyle>`  | —       | On the `Button` or the `View`; merged over `{ opacity }` when disabled |

### `TooltipContent` Props

| Prop            | Type                    | Default    | Notes                                          |
| --------------- | ----------------------- | ---------- | ---------------------------------------------- |
| `placement`     | `Placement`             | `"top"`    | shadcn `side`                                  |
| `align`         | `Align`                 | `"center"` | Same name as base / shadcn                     |
| `offset`        | `number`                | `4`        | shadcn `sideOffset`                            |
| `margin`        | `number`                | —          | Forwarded                                      |
| `delay`         | `number`                | —          | Overrides Provider / Root; base default `500`  |
| `disabled`      | `boolean`               | —          | Forwarded                                      |
| `open`          | `boolean \| null`       | —          | Standalone host bubble (composition uses Root) |
| `defaultOpen`   | `boolean`               | —          | Standalone host bubble                         |
| `children`      | `string \| JSX.Element` | —          | String → themed label `Text`                   |
| `class`         | `string`                | —          | Concatenated after any wrapper class           |
| `style`         | `StyleProp<ViewStyle>`  | —          | Merged over bubble chrome                      |
| `hoverStyle`    | `StyleProp<ViewStyle>`  | —          | Forwarded / merge                              |
| `activeStyle`   | `StyleProp<ViewStyle>`  | —          | Forwarded / merge                              |
| `focusStyle`    | `StyleProp<ViewStyle>`  | —          | Forwarded / merge                              |
| `disabledStyle` | `StyleProp<ViewStyle>`  | —          | Forwarded / merge                              |
| `classList`     | object                  | —          | Forwarded                                      |
| `testID`        | string                  | —          | Forwarded                                      |
| `tooltip`       | string                  | —          | Forwarded (host prop on the bubble itself)     |
| `onLayout`      | function                | —          | Forwarded                                      |
| `ref`           | ref                     | —          | Forwarded                                      |

Remaining presentation `TooltipProps` / `ComponentHostProps` from `nsh/base` also pass through. In composition, open / lifecycle events come from the `Tooltip` context (Content may still add its own handlers).

### `TooltipProvider` Props

| Prop       | Type                   | Default | Notes                                      |
| ---------- | ---------------------- | ------- | ------------------------------------------ |
| `delay`    | `number`               | —       | Default delay for nested Content / bubbles |
| `children` | `JSX.Element`          | —       | Subtree                                    |
| `class`    | `string`               | —       | On the wrapping `View`                     |
| `style`    | `StyleProp<ViewStyle>` | —       | On the wrapping `View`                     |

## Differences

| Topic        | shadcn (`bases/base`)                           | This package                                                                                          |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Parts        | Provider / Root / Trigger / Content (+ Arrow)   | same names without Arrow; Content is the `nsh/base` `Tooltip` bubble                                  |
| Attachment   | Trigger wraps the host                          | composition mounts a host `View` with `tooltip={TooltipContent}`; host bubbles use Content standalone |
| Positioning  | `side` / `sideOffset` / `align` / `alignOffset` | base `placement` / `offset` / `align` (no `alignOffset` on store 0.4.0)                               |
| Portal       | Base UI Portal + Positioner                     | base places the hint overlay; no separate Portal export                                               |
| Change event | Root `onOpenChange`                             | `{ open, reason }` object events per store `nsh` 0.4.0                                                |
| Enter / exit | CSS animate classes                             | store 0.4.0 has no `startingClass` / `endingClass` / `startingStyle` / `endingStyle`                  |
| Provider     | delay (+ skipDelayDuration etc.)                | `delay` only                                                                                          |
| Class hooks  | `className` / `cn-tooltip*`                     | `class` + token `style`; consumer styles merge over defaults                                          |

## Not forwarded

None for store CLI `nsh` 0.4.0 `Tooltip` props — all are forwarded on Content (open / lifecycle owned by the composition root when nested). The wrapper only applies bubble chrome, composition open state / host `tooltip` wiring, and merges defaults under consumer style hooks (`class` concatenates). Newer `nsh` main enter/exit hooks are absent from 0.4.0 and therefore not part of this surface.
