---
layout: ../../../layouts/Docs.astro
title: Dialog
description: Styled dialog wrapping nsh/base Dialog — theme tokens + Trigger / Content; full base prop pass-through.
component: true
demo: dialog
demoHeight: 480
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns open state, backdrop dismiss, Escape / back, optional swipe-to-close on sheet presentations, and the popup / backdrop hosts — unstyled on every platform. This package is the styled layer on top: a shadcn-shaped `Dialog` / `DialogTrigger` / `DialogContent` tree (plus Header / Footer / Title / Description / Close), centered card chrome, and theme tokens, the same role a community library plays above `nsh/base`. A [`Dialog`](https://nsh.dev/elements/dialog) presents content over the rest of the app in its own native window layer. Store CLI `nsh` 0.3.0 styles the popup with `class` / `style` and the backdrop with `backdropClass` / `backdropStyle` (no separate Overlay / Portal exports).

## Install

```bash
npx shadcn-nsh@latest add dialog
bunx shadcn-nsh@latest add dialog
pnx shadcn-nsh@latest add dialog
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

`animation` on `DialogContent` (or a default on `Dialog`) — `"slide"` | `"fade"` | `"none"`. Content wins when both are set. Wrapper default is `"fade"` (centered card); nsh/base defaults to `"slide"`.

```tsx
<Dialog>
  <DialogTrigger>Slide</DialogTrigger>
  <DialogContent animation="slide">
    <DialogTitle>Slides in</DialogTitle>
  </DialogContent>
</Dialog>
```

## Presentation

`presentation` on Content (or root default) — `"fullScreen"` | `"pageSheet"` | `"formSheet"`. iOS sheet forms keep what is behind visible; on other platforms the dialog is a transparent layer and app chrome (popup + backdrop) is what shows.

```tsx
<Dialog>
  <DialogTrigger>Page sheet</DialogTrigger>
  <DialogContent presentation="pageSheet">
    <DialogTitle>System sheet on iOS</DialogTitle>
  </DialogContent>
</Dialog>
```

## Style override

Wrapper popup chrome (card fill, border, radius, padding / max width) and backdrop tint, then consumer styles shallow-merge on top (consumer wins per key). `class` / `backdropClass` concatenate when both are set.

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

| Prop                   | Type                                         | Default | Notes                                              |
| ---------------------- | -------------------------------------------- | ------- | -------------------------------------------------- |
| `open`                 | `boolean \| null`                            | —       | Controlled open                                    |
| `defaultOpen`          | `boolean`                                    | `false` | Uncontrolled initial open                          |
| `animation`            | `"slide" \| "fade" \| "none"`                | —       | Default for Content when Content omits `animation` |
| `presentation`         | `"fullScreen" \| "pageSheet" \| "formSheet"` | —       | Default for Content when omitted                   |
| `closeOnEscape`        | `boolean`                                    | —       | Default for Content when omitted                   |
| `closeOnBackdropPress` | `boolean`                                    | —       | Default for Content when omitted                   |
| `closeOnSwipe`         | `boolean`                                    | —       | Default for Content when omitted                   |
| `children`             | `JSX.Element`                                | —       | Composition parts                                  |

### Events

| Event          | Notes                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `onOpenChange` | `(open: boolean, reason: DialogChangeReason) => void` — store CLI `nsh` 0.3.0 (not `{ open, reason }`) |
| `onOpen`       | `() => void` when the dialog has come in                                                               |
| `onClose`      | `() => void` when gone                                                                                 |
| `onCancel`     | `() => void` when the user tries to dismiss (Escape / backdrop / swipe), whether or not it closed      |

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
| `animation`            | `"slide" \| "fade" \| "none"`                | `"fade"` | Overrides root default; nsh/base alone defaults to `"slide"`  |
| `presentation`         | `"fullScreen" \| "pageSheet" \| "formSheet"` | —        | Forwarded; falls back to root default                         |
| `closeOnEscape`        | `boolean`                                    | —        | Forwarded; falls back to root default                         |
| `closeOnBackdropPress` | `boolean`                                    | —        | Forwarded; falls back to root default                         |
| `closeOnSwipe`         | `boolean`                                    | —        | Forwarded; falls back to root default                         |
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
| Change event      | Root `onOpenChange`                           | `(open, reason)` per store `nsh` 0.3.0; newer website docs may show `{ open, reason }`  |
| Class hooks       | `className` / `cn-dialog*`                    | `class` + `backdropClass` / token styles; consumer merges over defaults                 |
| Native sheet      | —                                             | set `presentation="pageSheet"` / `"formSheet"` on Content (iOS); or use Sheet for edges |

## Not forwarded

None for store CLI `nsh` 0.3.0 `Dialog` props — all are forwarded on Content (open / lifecycle owned by the composition root). The wrapper only applies popup + backdrop chrome, composition open state, and merges defaults under consumer style hooks (`class` / `backdropClass` concatenate). Newer website docs may show object-shaped `onOpenChange` events; this surface matches store 0.3.0 `(open, reason)`.
