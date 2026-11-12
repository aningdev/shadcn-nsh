---
layout: ../../../layouts/Docs.astro
title: Alert Dialog
description: A confirmation card that waits for an action, on the shared dialog look.
component: true
demo: alert-dialog
---

## Installation

```sh
npx shadcn-nsh@latest add alert-dialog
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
} from "@/components/ui/alert-dialog";
```

```tsx
<AlertDialog onAction={(event) => console.log(event.action)}>
  <AlertDialogTrigger>Delete file</AlertDialogTrigger>
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
</AlertDialog>
```

## Examples

### Roles

`role` picks the action's button: `cancel` is secondary, `destructive` danger, anything else primary.

```tsx
<AlertDialogFooter>
  <AlertDialogAction id="cancel" role="cancel">
    Cancel
  </AlertDialogAction>
  <AlertDialogAction id="delete" role="destructive">
    Delete
  </AlertDialogAction>
</AlertDialogFooter>
```

### The chosen action

`onAction` reports the `id` of the action pressed, or `null` when the card closed without one.

```tsx
<AlertDialog onAction={({ action }) => remove(action)}>…</AlertDialog>
```

### Trigger

A string child is a `Button`; `variant` picks its kind.

```tsx
<AlertDialogTrigger variant="danger">Delete file…</AlertDialogTrigger>
```

### Dismissal

Escape, backdrop and swipe close are off by default; `onOpenChange` still reports every change.

```tsx
<AlertDialog onOpenChange={({ open, reason }) => log(open, reason)}>…</AlertDialog>
```

## API

The look is `dialogCard` / `dialogTitle` / `dialogText` from Dialog. Escape, backdrop and swipe close default to off; choosing an action reports its `id` via `onAction`, dismissing reports `null`.

| Part                     | Notes                                         |
| ------------------------ | --------------------------------------------- |
| `AlertDialog`            | Open state; `onAction`                        |
| `AlertDialogTrigger`     | Opens; string child → Button                  |
| `AlertDialogContent`     | Card on `nsh/base` Dialog                     |
| `AlertDialogAction`      | Closes and reports `id`; `role` → button kind |
| `AlertDialogHeader`      | Title + description chrome                    |
| `AlertDialogFooter`      | Action row                                    |
| `AlertDialogTitle`       | String takes `dialogTitle`                    |
| `AlertDialogDescription` | String takes `dialogText`                     |
