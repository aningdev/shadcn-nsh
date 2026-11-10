---
layout: ../../../layouts/Docs.astro
title: Sheet
description: Styled sheet wrapping nsh/base Sheet — theme tokens + Trigger / Content; full base prop pass-through.
component: true
demo: sheet
demoHeight: 480
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns open state, backdrop dismiss, Escape / back, optional swipe-to-close on the bottom edge, and the panel / backdrop hosts — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `Sheet` / `SheetTrigger` / `SheetContent` tree (plus Header / Footer / Title / Description / Close), edge chrome by `side`, and theme tokens, the same role a community library plays above `nsh/base`. A [`Sheet`](https://nsh.dev/elements/sheet) is a panel at an edge of the screen over a backdrop. Store CLI `nsh` 0.4.0 has no enter/exit class hooks — surface look is `popupClass` / `popupStyle` and `backdropClass` / `backdropStyle` only.

## Install

```npx tabs
npx shadcn-nsh@latest add sheet
```

```bunx tabs
bunx shadcn-nsh@latest add sheet
```

```pnx tabs
pnx shadcn-nsh@latest add sheet
```

```yarn tabs
yarn dlx shadcn-nsh@latest add sheet
```

## Usage

```tsx
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/ui/sheet";

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <SheetClose>Close</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>;
```

## Composition

```
Sheet
├── SheetTrigger
└── SheetContent (nsh/base Sheet)
    ├── SheetHeader (app)
    │   ├── SheetTitle (app)
    │   └── SheetDescription (app)
    ├── children
    └── SheetFooter (app)
        └── SheetClose
```

## Controlled

```tsx
const open = signal(false);

<Sheet open={open()} onOpenChange={(next) => open.set(next)}>
  <SheetTrigger>Open sheet</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Backdrop, Escape, or Close dismisses.</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <SheetClose>Done</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>;
```

## Side

`side` on `SheetContent` (or a default on `Sheet`) — `"top"` | `"right"` | `"bottom"` | `"left"`. Content wins when both are set. Default is `"bottom"` (nsh/base); shadcn `bases/base` defaults to `"right"`.

```tsx
<Sheet>
  <SheetTrigger>Right</SheetTrigger>
  <SheetContent side="right">
    <SheetTitle>Side drawer</SheetTitle>
  </SheetContent>
</Sheet>
```

## Swipe

Bottom sheets can follow a downward drag when `closeOnSwipe` is set (root default or on Content).

```tsx
<Sheet closeOnSwipe>
  <SheetTrigger>Swipeable</SheetTrigger>
  <SheetContent side="bottom">
    <SheetTitle>Drag down to dismiss</SheetTitle>
  </SheetContent>
</Sheet>
```

## Style override

Wrapper panel chrome (card fill, edge radius, padding / min size by `side`) and backdrop tint, then consumer styles shallow-merge on top (consumer wins per key). `class` / `popupClass` / `backdropClass` concatenate when both are set. Host style hooks on Content also merge.

```tsx
<SheetContent
  side="bottom"
  popupStyle={{ padding: 24, minHeight: 220 }}
  backdropStyle={{ backgroundColor: "color-mix(in srgb, black 50%, transparent)" }}
>
  <SheetTitle style={{ fontSize: 18 }}>Merged chrome</SheetTitle>
</SheetContent>
```

## API

### `Sheet` Props

| Prop           | Type              | Default | Notes                                                 |
| -------------- | ----------------- | ------- | ----------------------------------------------------- |
| `open`         | `boolean \| null` | —       | Controlled open                                       |
| `defaultOpen`  | `boolean`         | `false` | Uncontrolled initial open                             |
| `side`         | `Placement`       | —       | Default for Content when Content omits `side`         |
| `closeOnSwipe` | `boolean`         | —       | Default for Content when Content omits `closeOnSwipe` |
| `children`     | `JSX.Element`     | —       | Composition parts                                     |

### Events

| Event          | Notes                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `onOpenChange` | `(event: { open: boolean; reason: OpenChangeReason }) => void`                                    |
| `onOpen`       | `() => void` when the panel has come in                                                           |
| `onClose`      | `() => void` when gone                                                                            |
| `onCancel`     | `() => void` when the user tries to dismiss (Escape / backdrop / swipe), whether or not it closed |

### `SheetTrigger` Props

| Prop       | Type                    | Default | Notes                                           |
| ---------- | ----------------------- | ------- | ----------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | String → themed `Button`; else pressable `View` |
| `disabled` | `boolean`               | —       | Blocks open                                     |
| `class`    | `string`                | —       | On the pressable `View` (non-string children)   |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over `{ opacity }` when disabled         |

### `SheetClose` Props

| Prop       | Type                    | Default     | Notes                                           |
| ---------- | ----------------------- | ----------- | ----------------------------------------------- |
| `children` | `string \| JSX.Element` | `"Close"`   | String → themed `Button`; else pressable `View` |
| `variant`  | `ButtonVariant`         | `"outline"` | Button look when children is a string           |
| `disabled` | `boolean`               | —           | Blocks close                                    |
| `class`    | `string`                | —           | On the pressable `View` (non-string children)   |
| `style`    | `StyleProp<ViewStyle>`  | —           | Merged when non-string children                 |

### `SheetContent` Props

| Prop                   | Type                   | Default    | Notes                                                      |
| ---------------------- | ---------------------- | ---------- | ---------------------------------------------------------- |
| `side`                 | `Placement`            | `"bottom"` | Edge; overrides root default (shadcn default is `"right"`) |
| `closeOnEscape`        | `boolean`              | —          | Forwarded                                                  |
| `closeOnBackdropPress` | `boolean`              | —          | Forwarded                                                  |
| `closeOnSwipe`         | `boolean`              | —          | Forwarded; falls back to root default                      |
| `popupClass`           | `string`               | —          | Concatenated after any wrapper class                       |
| `popupStyle`           | `StyleProp<ViewStyle>` | —          | Merged over edge chrome                                    |
| `backdropClass`        | `string`               | —          | Concatenated                                               |
| `backdropStyle`        | `StyleProp<ViewStyle>` | —          | Merged over `popupBackdrop()`                              |
| `children`             | `JSX.Element`          | —          | Panel body                                                 |
| `class`                | `string`               | —          | Host class; concatenated                                   |
| `style`                | `StyleProp<ViewStyle>` | —          | Host style merge                                           |
| `hoverStyle`           | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                          |
| `activeStyle`          | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                          |
| `focusStyle`           | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                          |
| `disabledStyle`        | `StyleProp<ViewStyle>` | —          | Forwarded / merge                                          |
| `classList`            | object                 | —          | Forwarded                                                  |
| `testID`               | string                 | —          | Forwarded                                                  |
| `tooltip`              | string                 | —          | Forwarded                                                  |
| `onLayout`             | function               | —          | Forwarded                                                  |
| `ref`                  | ref                    | —          | Forwarded                                                  |

Remaining presentation `SheetProps` / `ComponentHostProps` from `nsh/base` also pass through. Open / lifecycle events come from the `Sheet` context.

### `SheetHeader` / `SheetFooter` / `SheetTitle` / `SheetDescription` Props

| Prop       | Type                    | Default | Notes                                      |
| ---------- | ----------------------- | ------- | ------------------------------------------ |
| `children` | `string \| JSX.Element` | —       | Title / Description wrap strings in `Text` |
| `class`    | `string`                | —       | Concatenated                               |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over token chrome                   |

## Differences

| Topic            | shadcn (`bases/base`)                         | This package                                                                           |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Parts            | Root / Trigger / Content / Close / Header / … | same names; Content is `nsh/base` `Sheet`                                              |
| Default `side`   | `"right"`                                     | `"bottom"` (nsh/base); set `side="right"` for drawer look                              |
| Close control    | auto X via `showCloseButton`                  | explicit `SheetClose`; no `showCloseButton`                                            |
| Portal / Overlay | Base UI Portal + Backdrop                     | base owns backdrop; no separate Portal / Overlay exports                               |
| Change event     | Root `onOpenChange`                           | `{ open, reason }` object events per store `nsh` 0.4.0                                 |
| Enter / exit     | CSS animate classes                           | store 0.4.0 has no enter/exit class hooks on Sheet                                     |
| Native sheet     | —                                             | use Dialog `presentation="pageSheet"` (not this wrapper)                               |
| Class hooks      | `className` / `cn-sheet*`                     | `class` + `popupClass` / `backdropClass` / token styles; consumer merges over defaults |

## Not forwarded

None for store CLI `nsh` 0.4.0 `Sheet` props — all are forwarded on Content (open / lifecycle owned by the composition root). The wrapper only applies panel + backdrop chrome, composition open state, and merges defaults under consumer style hooks (`class` / `popupClass` / `backdropClass` concatenate). Newer website docs may show object-shaped `onOpenChange` events; this surface matches store 0.4.0 `(open, reason)`.
