---
title: Alert
description: A notice of the whole page or form, read out when it appears.
component: true
demo: alert
---

## Installation

```npm
npx shadcn-nsh@latest add alert
```

## Usage

```tsx
import { AlertCircle } from "lucide";

import { Alert, ALERT_ICON, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icon } from "@/lib/ui/icons";
import { colors } from "@/lib/ui/theme";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<Alert>
  <Icon icon={AlertCircle} size={ALERT_ICON} tint={colors.foreground} />
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>You can add components to your app with the CLI.</AlertDescription>
</Alert>
```

## Composition

Use the following composition to build an `Alert`:

```text
Alert
├── AlertTitle
└── AlertDescription
```

## Examples

### With an icon and a note

The icon comes first, drawn at `ALERT_ICON` (16 points) in the notice's ink — the terminal draws
no icons, and there the notice is its text. The title and the note line up in the column beside
it, the note a step quieter than the title.

```tsx
<Alert>
  <Icon icon={CheckCircle2} size={ALERT_ICON} tint={colors.foreground} />
  <AlertTitle>Changes saved</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>
```

### A title and no note

An icon and a title are a notice of one line.

```tsx
<Alert>
  <Icon icon={CheckCircle2} size={ALERT_ICON} tint={colors.foreground} />
  <AlertTitle>A title and an icon, and no note at all.</AlertTitle>
</Alert>
```

### Destructive

`variant="destructive"` puts the whole notice in the danger tone: the title and the icon on it,
the note at nine tenths. The parts under the root wear it without being told — the root hands the
variant down.

```tsx
<Alert variant="destructive">
  <Icon icon={AlertCircle} size={ALERT_ICON} tint={colors.destructive} />
  <AlertTitle>Unable to process your payment.</AlertTitle>
  <AlertDescription>Please verify your billing information and try again.</AlertDescription>
</Alert>
```

### A note and no title

The note has a column and no row of its own: with no title it sits beside the icon,
and a long sentence wraps there. Put an error that needs more than one line in the note, not in
the title, which keeps to one line.

```tsx
<Alert variant="destructive">
  <Icon icon={AlertCircle} size={ALERT_ICON} tint={colors.destructive} />
  <AlertDescription>
    The connection was lost before the reply finished. Check the network and try again.
  </AlertDescription>
</Alert>
```

### A note of the app's own

`AlertDescription` is a frame, not a sentence: a string is drawn in the note's type and ink, and
anything else is laid out as given — a column of lines, a link, a row of buttons. What the app puts
there carries its own ink.

```tsx
<Alert>
  <Icon icon={AlertCircle} size={ALERT_ICON} tint={colors.foreground} />
  <AlertTitle>Three checks failed</AlertTitle>
  <AlertDescription>
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.mutedForeground }}>· The card's number is not valid</Text>
      <Text style={{ color: colors.mutedForeground }}>· The card has expired</Text>
    </View>
  </AlertDescription>
</Alert>
```

### The icon's column

A view has no selector for its children, and a child cannot be asked what it is, so the text keeps
that gutter either way: an alert without an icon starts 12 points in from its padding. Write the
icon first — it is what takes the leading column.

### How it differs from the other alerts

Three things are called an alert here, and this is the quiet one:

- **this `Alert`** is a notice drawn on the page or in a form, in the app's own surface, read out by
  its `role="alert"`. It takes no presses and asks nothing: the page stays usable under it.
- **`nsh/base`'s `AlertDialog`** is the platform's own alert or action sheet
  (`AlertDialog.show(options)`): a system box over the app that asks for an answer and resolves with
  the action chosen. It looks like the operating system, not like the app.
- **this library's `alert-dialog`** is the same question in shadcn's parts: `Trigger`, `Title`,
  `Description`, `Footer` and `Action` fill in that system box, so it is the platform's — its look
  is the operating system's and its content is strings. A confirmation card the app draws itself,
  with the app's look and content of its own, is [`dialog`](./dialog).

So: a notice that can wait belongs here; a question that must be answered before anything else is
an `alert-dialog` (or `dialog`, when the box needs content of the app's own).

## Differences from shadcn/ui

- shadcn moves the text into the icon's column only when there is an icon (`has-[>svg]`); here the
  text keeps that gutter either way, with or without an icon.

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `Alert` and
`AlertDescription`, and every prop of [`nsh` Text](https://nsh.dev/elements/text) on `AlertTitle`;
`style` goes over the look's on each. The root is `role="alert"`, so a notice is read out when it
appears.

| Part               | Props                                                         | Description                                                                                          |
| ------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Alert`            | `variant`: `"default" \| "destructive"` (default `"default"`) | The notice's surface: `alertLook().root()`.                                                          |
| `AlertTitle`       | —                                                             | The title, a `Text` in `alertLook().title(variant)`.                                                 |
| `AlertDescription` | —                                                             | The note: `alertLook().descriptionFrame()`, its string child `alertLook().descriptionText(variant)`. |

| Prop      | Type                         | Default   |
| --------- | ---------------------------- | --------- |
| `variant` | `"default" \| "destructive"` | `default` |

The surface is the card's, with one hairline edge and the theme's inset corners, padded 16 by 12;
the icon's column is as wide as the icon, the text's takes the rest, a gap of 12 between them.
`alertLook()` is exported for a notice the app draws itself, and `ALERT_ICON` is the size its icon
is drawn at.
