---
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
