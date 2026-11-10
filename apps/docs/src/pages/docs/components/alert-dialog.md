---
layout: ../../../layouts/Docs.astro
title: Alert Dialog
description: Styled confirmation card with an app-owned action id — theme tokens on nsh/base Dialog.
component: true
demo: alert-dialog
demoHeight: 420
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) `AlertDialog.show` is the platform alert (`UIAlertController`, Android `AlertDialog`). It takes no style hooks. This package is the styled confirmation: a shadcn-shaped `AlertDialog` / `AlertDialogTrigger` / `AlertDialogContent` tree on `nsh/base` `Dialog`, plus an action that reports the app's `id`. The card is `modalSurface()`. Cancel and backdrop do not dismiss unless you turn those flags on.

## Install

```npx tabs
npx shadcn-nsh@latest add alert-dialog
```

```bunx tabs
bunx shadcn-nsh@latest add alert-dialog
```

```pnx tabs
pnx shadcn-nsh@latest add alert-dialog
```

```yarn tabs
yarn dlx shadcn-nsh@latest add alert-dialog
```

## Usage

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/ui/alert-dialog";

<AlertDialog onAction={({ action }) => console.log(action)}>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete file?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction id="cancel" role="cancel">
        Cancel
      </AlertDialogAction>
      <AlertDialogAction id="delete" role="destructive">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

## Composition

```
AlertDialog
├── AlertDialogTrigger
└── AlertDialogContent (nsh/base Dialog)
    ├── AlertDialogHeader (app)
    │   ├── AlertDialogTitle (app)
    │   └── AlertDialogDescription (app)
    └── AlertDialogFooter (app)
        └── AlertDialogAction
```

## API

### `AlertDialog` Props

| Prop          | Type              | Default | Notes                                      |
| ------------- | ----------------- | ------- | ------------------------------------------ |
| `open`        | `boolean \| null` | —       | Controlled open                            |
| `defaultOpen` | `boolean`         | `false` | Uncontrolled initial open                  |
| `children`    | `JSX.Element`     | —       | Composition parts                          |
| `onAction`    | `(event) => void` | —       | `{ action }` is the chosen `id`, or `null` |

`animation` and `closeOn*` are not root props. Set them on `AlertDialogContent`.

### Events

| Event          | Notes                                                              |
| -------------- | ------------------------------------------------------------------ |
| `onOpenChange` | `(event: { open: boolean; reason: DialogChangeReason }) => void`   |
| `onOpen`       | The card has come in                                               |
| `onClose`      | The card is gone                                                   |
| `onCancel`     | The user tried to dismiss, whether or not a `closeOn*` flag let it |
| `onAction`     | Chosen `id`, or `null` when the card closed without one            |

### `AlertDialogAction` Props

| Prop       | Type                                     | Default     | Notes                                      |
| ---------- | ---------------------------------------- | ----------- | ------------------------------------------ |
| `id`       | `string`                                 | required    | What `onAction` reports. Not the label     |
| `role`     | `"default" \| "cancel" \| "destructive"` | `"default"` | Button look: default, outline, destructive |
| `children` | `string \| JSX.Element`                  | `"OK"`      | String → themed `Button`                   |
| `disabled` | `boolean`                                | —           | Blocks the choice                          |

### `AlertDialogContent` Props

| Prop                   | Type                          | Default  | Notes                                     |
| ---------------------- | ----------------------------- | -------- | ----------------------------------------- |
| `animation`            | `"slide" \| "fade" \| "none"` | `"fade"` | Base Dialog alone defaults to `"slide"`   |
| `closeOnEscape`        | `boolean`                     | `false`  | Base Dialog defaults to `true`            |
| `closeOnBackdropPress` | `boolean`                     | `false`  | Base Dialog defaults to `true`            |
| `closeOnSwipe`         | `boolean`                     | `false`  | Base Dialog defaults to `true`            |
| `style`                | `StyleProp<ViewStyle>`        | —        | Merged over `modalSurface()` at 90% / 400 |
| `backdropStyle`        | `StyleProp<ViewStyle>`        | —        | Merged over `popupBackdrop()`             |

Remaining Dialog props pass through. Open and lifecycle events come from the root.

## Differences

| Topic         | shadcn / `nsh/base` `AlertDialog.show`               | This package                                                           |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| What it is    | shadcn: a dialog composition. Base: the system alert | A Dialog card. The system `show()` is not re-exported (no style hook)  |
| Action result | Base resolves `{ action: id \| null }`               | `onAction` with the same `id`, or `null` on dismiss                    |
| `role`        | Platform places and tints the button                 | App order. `destructive` / `cancel` / `default` map to Button variants |
| Dismiss       | Alert: Escape and backdrop off unless set. Sheet: on | Both off, and swipe off. Pass `true` to match a loose dialog           |
| Action sheet  | `presentation: "actionSheet"` on `show`              | Not ported. Use `Sheet`                                                |
| Android limit | At most three actions on a system alert              | The card does not enforce that                                         |
| Close control | shadcn `AlertDialogCancel` + `Action`                | One `AlertDialogAction`; cancel is `role="cancel"`                     |

## Accessibility

The trigger is a button. The card is `nsh/base` Dialog (focus, Escape when `closeOnEscape`, the backdrop). Each action is a button named by its label. `id` is for the app, not for screen readers. A destructive role is a colored button, not a separate accessibility role.
