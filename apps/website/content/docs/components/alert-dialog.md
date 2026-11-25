---
title: Alert Dialog
description: "A confirmation of the platform's own."
component: true
demo: alert-dialog
---

## Installation

```npm
npx shadcn-nsh@latest add alert-dialog
```

## Usage

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
```

```tsx
<AlertDialog onAction={({ action }) => console.log(action)}>
  <AlertDialogTrigger>Delete file</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete file?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction id="delete" role="destructive">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

The box is the platform's own (`nsh/base`'s `AlertDialog.show`): UIAlertController on iOS, NSAlert
on macOS, NSH's drawing of the same box on the web, the platform dialog on Android. The parts only
fill it in — they register a title, a message and buttons, and `AlertDialogContent` shows it when
the root is open. So the box **does not follow this library's theme**, what it shows is **text
only** (no views or icons; at most one text field, `input`, where the platform's alert has one), and an Android alert takes **at most three buttons**. The
platform shows one box at a time, so a process has one: two `AlertDialog`s opened together share
it, and the second is not stacked on the first.

## Composition

Use the following composition to build an `AlertDialog`:

```text
AlertDialog
├── AlertDialogTrigger
└── AlertDialogContent
    ├── AlertDialogHeader
    │   ├── AlertDialogTitle
    │   └── AlertDialogDescription
    └── AlertDialogFooter
        ├── AlertDialogCancel
        └── AlertDialogAction
```

## Examples

### Against `Dialog`

`AlertDialog` asks one question and waits for the answer; `Dialog` is the app's own card.

|                            | `AlertDialog`               | `Dialog`                                  |
| -------------------------- | --------------------------- | ----------------------------------------- |
| Who draws it               | the platform                | the app, with `dialogCard` and `backdrop` |
| What it holds              | a title, a message, buttons | any content (fields, lists, pictures)     |
| Does it follow the theme   | no                          | yes                                       |
| Escape, backdrop and swipe | off (`closeOn*` props)      | on                                        |

Use `Dialog` when the box needs content of the app's own or the app's look; use `AlertDialog` when
it is a yes/no question the system should ask.

### Roles

`role` is what each button means, and the platform places and draws it by that: `cancel` on its
own, `destructive` in red where the platform has red.

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

`AlertDialogCancel` is the same button with `role="cancel"`; its `id` is `"cancel"` unless named.

### The chosen action

`onAction` reports the `id` of the button pressed (the app's name for it, never the label), or
`null` when the box closed without one.

```tsx
<AlertDialog onAction={({ action }) => action === "delete" && remove()}>…</AlertDialog>
```

### A text field

`input` on `AlertDialogContent` adds one text field to an alert (not an action sheet) —
`defaultValue`, `placeholder`, `selectTextOnFocus`, `required` (no confirming an empty one).
`onAction` reports its text as `value` with the button chosen. Windows, Linux and the terminal
show no field there: `value` is `null`, so an app that must have the text uses a `Dialog` with
an `Input`.

```tsx
<AlertDialog onAction={({ action, value }) => action === "rename" && rename(value)}>
  <AlertDialogTrigger>Rename…</AlertDialogTrigger>
  <AlertDialogContent
    input={{ defaultValue: name(), placeholder: "Name", selectTextOnFocus: true }}
  >
    <AlertDialogHeader>
      <AlertDialogTitle>Rename the photo</AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction id="rename">Rename</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Awaiting the answer

An app that wants the choice before it draws anything else — `await`, then act — shows the same box
with `nsh/base`'s own `AlertDialog.show`, which resolves with `{ action, value }`. That is the app's call.
The parts above declare a box under a root of the page's, for an alert that is part of what the page
draws; the library has no imperative `show` of its own: a web alert is
always the app's own drawing, and a second way in would be two APIs for one box.

```tsx
import { AlertDialog } from "nsh/base";

const discard = async () => {
  const { action } = await AlertDialog.show({
    title: "Discard your changes?",
    description: "Your draft will be lost. This cannot be undone.",
    actions: [
      { id: "keep", label: "Keep editing", role: "cancel" },
      { id: "discard", label: "Discard", role: "destructive" },
    ],
  });
  if (action === "discard") pop();
};
```

### Action sheet

`presentation="actionSheet"` slides the box up from the bottom (a list on Android). Escape and a
press outside close it unless `closeOnEscape` / `closeOnBackdropPress` say otherwise; an alert
(`"alert"`, the default) waits for a button.

```tsx
<AlertDialogContent presentation="actionSheet">…</AlertDialogContent>
```

### Trigger

A string child is a `Button`; `variant` picks its look (`secondary` by default). Anything else is
drawn as given.

```tsx
<AlertDialogTrigger variant="destructive">Delete file…</AlertDialogTrigger>
```

### Controlled

`open` shows the box and `onOpenChange` reports every change of it — `reason` is `"triggerPress"`
when the trigger opened it, `"select"` when a button was chosen and `"cancel"` when it closed
without one.

```tsx
const open = signal(false);

<AlertDialog open={open()} onOpenChange={({ open: next }) => open.set(next)}>
  …
</AlertDialog>;
```

## API

`AlertDialog` owns the open state and the text its parts registered; `AlertDialogContent` calls
[`nsh/base` `AlertDialog.show`](https://nsh.dev/elements/alert-dialog) when it opens. The box stays
one while it is up: a part that renders again with the alert still open — a page whose layout
rebuilds its children does — stacks nothing, and the answer belongs to the app that asked.

| Part                     | Props                                                                                               | Description                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AlertDialog`            | `open`, `defaultOpen`, `onOpenChange({ open, reason })`, `onAction({ action, value })`              | The root: owns the open state and the text its parts registered.                                            |
| `AlertDialogTrigger`     | `Action`'s props — `children`, `variant`, `disabled`, and every view prop — without `onPress`       | The press that opens it; a string child is a `Button`, `variant` picking its look (`secondary` by default). |
| `AlertDialogContent`     | `presentation`, `closeOnEscape`, `closeOnBackdropPress`, `input` — the rest of `AlertDialogOptions` | The parts the box shows, and the `AlertDialog.show` call when the root opens.                               |
| `AlertDialogTitle`       | `children` (a string)                                                                               | The heading.                                                                                                |
| `AlertDialogDescription` | `children` (a string)                                                                               | The message.                                                                                                |
| `AlertDialogAction`      | `id`, `role`, `children` (a string; the `id` when left out)                                         | A choice; `role` is what it means and `onAction` reports its `id`.                                          |
| `AlertDialogCancel`      | `id` (default `"cancel"`), `children`                                                               | The same button with `role="cancel"`.                                                                       |
| `AlertDialogHeader`      | `children`                                                                                          | A group that draws nothing.                                                                                 |
| `AlertDialogFooter`      | `children`                                                                                          | A group that draws nothing; the buttons keep the order they are written in.                                 |
