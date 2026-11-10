---
layout: ../../../layouts/Docs.astro
title: Dialog
description: Styled dialog wrapping nsh/base Dialog — theme tokens + Trigger / Content; full base prop pass-through.
component: true
demo: dialog
demoHeight: 480
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns open state, backdrop dismiss, Escape / back, optional swipe-to-close on sheet presentations, and the popup / backdrop hosts — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `Dialog` / `DialogTrigger` / `DialogContent` tree (plus Header / Footer / Title / Description / Close), centered card chrome, and theme tokens, the same role a community library plays above `nsh/base`. A [`Dialog`](https://nsh.dev/elements/dialog) presents content over the rest of the app in its own native window layer. Store CLI `nsh` 0.4.0 styles the popup with `class` / `style` and the backdrop with `backdropClass` / `backdropStyle` (no separate Overlay / Portal exports).

## Install

```npx tabs
npx shadcn-nsh@latest add dialog
```

```bunx tabs
bunx shadcn-nsh@latest add dialog
```

```pnx tabs
pnx shadcn-nsh@latest add dialog
```

```yarn tabs
yarn dlx shadcn-nsh@latest add dialog
```

## Usage

```tsx
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
      <DialogClose variant="default">Continue</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

## Composition

```
Dialog
├── DialogTrigger
└── DialogContent (nsh/base Dialog)
    ├── DialogHeader (app)
    │   ├── DialogTitle (app)
    │   └── DialogDescription (app)
    ├── children
    └── DialogFooter (app)
        └── DialogClose
```

## Controlled

```tsx
const open = signal(false);

<Dialog open={open()} onOpenChange={(next) => open.set(next)}>
  <DialogTrigger>Open dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm</DialogTitle>
      <DialogDescription>Backdrop, Escape, or Close dismisses.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose>Done</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

## Animation

`animation` on `DialogContent` — `"slide"` | `"fade"` | `"none"`. The root does not take it. Wrapper default is `"fade"` (centered card); nsh/base defaults to `"slide"`. Modal motion stays on base.

```tsx
<Dialog>
  <DialogTrigger>Slide</DialogTrigger>
  <DialogContent animation="slide">
    <DialogTitle>Slides in</DialogTitle>
  </DialogContent>
</Dialog>
```

## Presentation

`presentation` on `DialogContent` — `"fullScreen"` | `"pageSheet"` | `"formSheet"`. iOS sheet forms keep what is behind visible; on other platforms the dialog is a transparent layer and app chrome (popup + backdrop) is what shows.

```tsx
<Dialog>
  <DialogTrigger>Page sheet</DialogTrigger>
  <DialogContent presentation="pageSheet">
    <DialogTitle>System sheet on iOS</DialogTitle>
  </DialogContent>
</Dialog>
```

## Style override

Card chrome is `modalSurface()` (16-point corners, 20 points of padding, the popup shadow) at 90% of the window, then consumer `style` wins per key. The backdrop is `popupBackdrop()`. `class` / `backdropClass` pass through; there is no wrapper class to concatenate.

```tsx
<DialogContent
  style={{ padding: 32, maxWidth: 480 }}
  backdropStyle={{ backgroundColor: "color-mix(in srgb, black 50%, transparent)" }}
>
  <DialogTitle style={{ fontSize: 18 }}>Merged chrome</DialogTitle>
</DialogContent>
```

## API

### `Dialog` Props

| Prop          | Type              | Default | Notes                     |
| ------------- | ----------------- | ------- | ------------------------- |
| `open`        | `boolean \| null` | —       | Controlled open           |
| `defaultOpen` | `boolean`         | `false` | Uncontrolled initial open |
| `children`    | `JSX.Element`     | —       | Composition parts         |

`animation`, `presentation`, `closeOnEscape`, `closeOnBackdropPress` and `closeOnSwipe` are not root props. Set them on `DialogContent`.

### Events

| Event          | Notes                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `onOpenChange` | `(event: { open: boolean; reason: DialogChangeReason }) => void`                                  |
| `onOpen`       | `() => void` when the dialog has come in                                                          |
| `onClose`      | `() => void` when gone                                                                            |
| `onCancel`     | `() => void` when the user tries to dismiss (Escape / backdrop / swipe), whether or not it closed |

### `DialogTrigger` Props

| Prop       | Type                    | Default | Notes                                           |
| ---------- | ----------------------- | ------- | ----------------------------------------------- |
| `children` | `string \| JSX.Element` | —       | String → themed `Button`; else pressable `View` |
| `disabled` | `boolean`               | —       | Blocks open                                     |
| `class`    | `string`                | —       | On the pressable `View` (non-string children)   |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over `{ opacity }` when disabled         |

### `DialogClose` Props

| Prop       | Type                    | Default     | Notes                                           |
| ---------- | ----------------------- | ----------- | ----------------------------------------------- |
| `children` | `string \| JSX.Element` | `"Close"`   | String → themed `Button`; else pressable `View` |
| `variant`  | `ButtonVariant`         | `"outline"` | Button look when children is a string           |
| `disabled` | `boolean`               | —           | Blocks close                                    |
| `class`    | `string`                | —           | On the pressable `View` (non-string children)   |
| `style`    | `StyleProp<ViewStyle>`  | —           | Merged when non-string children                 |

### `DialogContent` Props

| Prop                   | Type                                         | Default  | Notes                                                         |
| ---------------------- | -------------------------------------------- | -------- | ------------------------------------------------------------- |
| `animation`            | `"slide" \| "fade" \| "none"`                | `"fade"` | Centered card; nsh/base alone defaults to `"slide"`           |
| `presentation`         | `"fullScreen" \| "pageSheet" \| "formSheet"` | —        | Forwarded                                                     |
| `closeOnEscape`        | `boolean`                                    | —        | Forwarded                                                     |
| `closeOnBackdropPress` | `boolean`                                    | —        | Forwarded                                                     |
| `closeOnSwipe`         | `boolean`                                    | —        | Forwarded                                                     |
| `statusBar`            | `StatusBar`                                  | —        | Forwarded                                                     |
| `ios` / `android`      | platform bags                                | —        | Forwarded                                                     |
| `class`                | `string`                                     | —        | Popup class; concatenated                                     |
| `style`                | `StyleProp<ViewStyle>`                       | —        | Merged over card chrome (Dialog styles the popup via `style`) |
| `backdropClass`        | `string`                                     | —        | Concatenated                                                  |
| `backdropStyle`        | `StyleProp<ViewStyle>`                       | —        | Merged over `popupBackdrop()`                                 |
| `backdropTestID`       | string                                       | —        | Forwarded                                                     |
| `testID`               | string                                       | —        | Forwarded                                                     |
| `children`             | `JSX.Element`                                | —        | Panel body                                                    |

Remaining `DialogProps` from `nsh/base` also pass through. Open / lifecycle events come from the `Dialog` context.

### `DialogHeader` / `DialogFooter` / `DialogTitle` / `DialogDescription` Props

| Prop       | Type                    | Default | Notes                                      |
| ---------- | ----------------------- | ------- | ------------------------------------------ |
| `children` | `string \| JSX.Element` | —       | Title / Description wrap strings in `Text` |
| `class`    | `string`                | —       | Concatenated                               |
| `style`    | `StyleProp<ViewStyle>`  | —       | Merged over token chrome                   |

## Differences

| Topic             | shadcn (`bases/base`)                         | This package                                                                            |
| ----------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Parts             | Root / Trigger / Content / Close / Header / … | same names; Content is `nsh/base` `Dialog`                                              |
| Overlay / Portal  | Base UI Backdrop + Portal                     | base owns backdrop; no separate Portal / Overlay exports                                |
| Close control     | auto X via `showCloseButton`                  | explicit `DialogClose`; no `showCloseButton`                                            |
| Default animation | CSS fade / zoom                               | wrapper `"fade"` for card chrome; nsh/base alone defaults `"slide"`                     |
| Change event      | Root `onOpenChange`                           | `{ open, reason }` object events per store `nsh` 0.4.0                                  |
| Class hooks       | `className` / `cn-dialog*`                    | `class` + `backdropClass` / token styles; consumer `style` merges over `modalSurface()` |
| Root props        | Root holds open state and content flags       | open state only; `animation` / `presentation` / `closeOn*` live on Content, no alias    |
| Density           | one type size                                 | title 17 / 20 and text 13 / 15, pointer / touch                                         |
| Native sheet      | —                                             | set `presentation="pageSheet"` / `"formSheet"` on Content (iOS); or use Sheet for edges |

## Not forwarded

None for store CLI `nsh` 0.4.0 `Dialog` props — all are forwarded on Content (open / lifecycle owned by the composition root). The wrapper only applies popup + backdrop chrome, composition open state, and merges defaults under consumer style hooks (`class` / `backdropClass` concatenate). Newer website docs may show object-shaped `onOpenChange` events; this surface matches store 0.4.0 `(open, reason)`.
