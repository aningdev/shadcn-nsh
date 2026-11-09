---
layout: ../../../layouts/Docs.astro
title: Popover
description: Styled popover wrapping nsh/base Popover — theme tokens + Trigger / Content; full base prop pass-through.
component: true
demo: popover
demoHeight: 420
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns open state, focus, Escape / press-outside dismiss, placement against the trigger, and the expanded trigger for screen readers — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `Popover` / `PopoverTrigger` / `PopoverContent` tree (plus Header / Title / Description), popup surface chrome, and theme tokens, the same role a community library plays above `nsh/base`. A [`Popover`](https://nsh.dev/elements/popover) shows content next to its trigger on top of everything else. Store CLI `nsh` 0.4.0 has no popup enter/exit class hooks (`popupStartingStyle` / `onPosition` land in newer docs) — surface look is `popupClass` / `popupStyle` only.

## Install

```npx tabs
npx shadcn-nsh@latest add popover
```

```bunx tabs
bunx shadcn-nsh@latest add popover
```

```pnx tabs
pnx shadcn-nsh@latest add popover
```

```yarn tabs
yarn dlx shadcn-nsh@latest add popover
```

## Usage

```tsx
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/ui/popover";

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Tip</PopoverTitle>
      <PopoverDescription>Details next to the trigger.</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
</Popover>;
```

## Composition

```
Popover
├── PopoverTrigger
└── PopoverContent (nsh/base Popover)
    ├── PopoverHeader (app)
    │   ├── PopoverTitle (app)
    │   └── PopoverDescription (app)
    └── children
```

## Controlled

```tsx
const open = signal(false);

<Popover open={open()} onOpenChange={(next) => open.set(next)}>
  <PopoverTrigger>Open popover</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Quick tip</PopoverTitle>
      <PopoverDescription>Close from outside, Escape, or a button.</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
</Popover>;
```

## Placement

```tsx
<PopoverContent placement="top" align="start" offset={8}>
  <PopoverTitle>Above, start-aligned</PopoverTitle>
</PopoverContent>
```

## Style override

Wrapper popup chrome (`popupSurface` + padding / min width), then consumer styles shallow-merge on top (consumer wins per key). `class` / `popupClass` concatenate when both are set. Host style hooks on Content also merge.

```tsx
<PopoverContent popupStyle={{ padding: 20, minWidth: 320 }} style={{ alignSelf: "flex-start" }}>
  <PopoverTitle style={{ fontSize: 16 }}>Merged</PopoverTitle>
</PopoverContent>
```

## API

### `Popover` Props

| Prop          | Type              | Default | Notes                                                    |
| ------------- | ----------------- | ------- | -------------------------------------------------------- |
| `open`        | `boolean \| null` | —       | Controlled open state                                    |
| `defaultOpen` | `boolean`         | `false` | Uncontrolled initial open                                |
| `children`    | `JSX.Element`     | —       | `PopoverTrigger`, `PopoverContent`, and nested chrome    |

Placement, popup chrome, and dismiss flags belong on `PopoverContent`, not the root.

### Events

| Event          | Notes                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `onOpenChange` | `(event: { open: boolean; reason: OpenChangeReason }) => void`    |
| `onOpen`       | `() => void` when shown                                                                                 |
| `onClose`      | `() => void` when gone                                                                                  |
| `onCancel`     | `() => void` when the user tries to dismiss (Escape / outside), whether or not close flags let it close |

### `PopoverTrigger` Props

| Prop       | Type                    | Default | Notes                                           |
| ---------- | ----------------------- | ------- | ----------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | String → themed `Button`; else pressable `View` |
| `disabled` | `boolean`               | —       | Blocks open                                     |
| `class`    | `string`                | —       | On the pressable `View` (non-string children)   |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over `{ opacity }` when disabled         |

### `PopoverContent` Props

| Prop                  | Type                   | Default    | Notes                                                        |
| --------------------- | ---------------------- | ---------- | ------------------------------------------------------------ |
| `placement`           | `Placement`            | `"bottom"` | shadcn `side`                                                |
| `align`               | `Align`                | `"center"` | Same name as base / shadcn                                   |
| `offset`              | `number`               | `4`        | shadcn `sideOffset`                                          |
| `margin`              | `number`               | —          | Forwarded                                                    |
| `closeOnEscape`       | `boolean`              | —          | Forwarded                                                    |
| `closeOnPressOutside` | `boolean`              | —          | Forwarded                                                    |
| `popupClass`          | `string`               | —          | Concatenated after any wrapper class                         |
| `popupStyle`          | `StyleProp<ViewStyle>` | —          | Merged over surface chrome (`padding` / `minWidth` / border) |
| `children`            | `JSX.Element`          | —          | Popup body                                                   |
| `class`               | `string`               | —          | Host class; concatenated                                     |
| `style`               | `StyleProp<ViewStyle>` | —          | Host style merge                                             |
| `hoverStyle`          | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                            |
| `activeStyle`         | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                            |
| `focusStyle`          | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                            |
| `disabledStyle`       | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                            |
| `classList`           | object                 | —          | Forwarded                                                    |
| `testID`              | string                 | —          | Forwarded                                                    |
| `tooltip`             | string                 | —          | Forwarded                                                    |
| `onLayout`            | function               | —          | Forwarded                                                    |
| `ref`                 | ref                    | —          | Forwarded                                                    |

Remaining presentation `PopoverProps` / `ComponentHostProps` from `nsh/base` also pass through. Open / `trigger` / lifecycle events come from the `Popover` context.

### `PopoverHeader` / `PopoverTitle` / `PopoverDescription` Props

| Prop       | Type                    | Default | Notes                                      |
| ---------- | ----------------------- | ------- | ------------------------------------------ |
| `children` | `string \| JSX.Element` | —       | Title / Description wrap strings in `Text` |
| `class`    | `string`                | —       | Concatenated                               |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over token chrome                   |

## Differences

| Topic        | shadcn (`bases/base`)                                   | This package                                                                           |
| ------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Parts        | Root / Trigger / Content / Header / Title / Description | same names; Content is `nsh/base` `Popover`                                            |
| Positioning  | `side` / `sideOffset` / `align` / `alignOffset`         | base `placement` / `offset` / `align` (no `alignOffset` on store 0.4.0)                |
| Portal       | Base UI Portal + Positioner                             | base places the popup; no separate Portal export                                       |
| Change event | Root `onOpenChange`                                     | `{ open, reason }` object events per store `nsh` 0.4.0 |
| Enter / exit | CSS animate classes                                     | store 0.4.0 has no `popupStarting*` / `popupEnding*` / `onPosition`                    |
| Composition-only | optional single-root in some shadcn ports             | root holds open state only — use `PopoverTrigger` + `PopoverContent`                   |
| Class hooks  | `className` / `cn-popover*`                             | `class` + `popupClass` / token `popupStyle`; consumer styles merge over defaults       |

## Not forwarded

None for store CLI `nsh` 0.4.0 `Popover` props — all are forwarded on Content (open / lifecycle owned by the composition root). The wrapper only applies popup surface chrome, composition open state, and merges defaults under consumer style hooks (`class` / `popupClass` concatenate). Newer `nsh` main enter/exit / `onPosition` hooks are absent from 0.4.0 and therefore not part of this surface.
