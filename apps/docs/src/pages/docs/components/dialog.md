---
layout: ../../../layouts/Docs.astro
title: Dialog
description: Styled dialog wrapping nsh/base Dialog.
component: true
demo: dialog
demoHeight: 420
---

Styled modal surface on `nsh/base` Dialog with fixed chrome (backdrop + card padding). Single root — compose title/body/actions yourself with `Text` / `Button`.

## Install

```sh
shadcn-nsh add dialog
# monorepo:
shadcn-nsh add dialog -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { Dialog } from "@workspace/ui/components/ui/dialog";
import { Text } from "nsh";

<Dialog open onOpenChange={(e) => console.log(e.open)}>
  <Text>Are you sure?</Text>
  <Button onPress={() => {}}>Confirm</Button>
</Dialog>;
```

## Composition

```
Dialog
└─ children (body — you own header / footer)
```

Unlike shadcn’s `DialogTrigger` / `DialogContent` / `DialogHeader` tree, this wrapper is one `Dialog` root. Open state and trigger live in your app.

## Examples

### Controlled open

```tsx
const [open, setOpen] = createSignal(false);

<Button onPress={() => setOpen(true)}>Open</Button>
<Dialog open={open()} onOpenChange={(e) => setOpen(e.open)}>
  <Text>Dialog body</Text>
</Dialog>
```

### Animation

```tsx
<Dialog open animation="slide" onClose={() => {}}>
  <Text>Slides in</Text>
</Dialog>
```

## API

| Prop           | Type                                                 | Default  | Notes           |
| -------------- | ---------------------------------------------------- | -------- | --------------- |
| `open`         | `boolean`                                            | —        | Controlled open |
| `animation`    | `"slide" \| "fade" \| "none"`                        | `"fade"` |                 |
| `children`     | `JSX.Element`                                        | —        | Body content    |
| `onOpen`       | `() => void`                                         | —        |                 |
| `onClose`      | `() => void`                                         | —        |                 |
| `onCancel`     | `() => void`                                         | —        |                 |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` | —        |                 |

## Differences

| Topic       | shadcn                                                         | This package                                              |
| ----------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| Parts       | `Dialog` / `Trigger` / `Content` / `Header` / `Title` / …      | single `Dialog`; compose children yourself                |
| Trigger     | `DialogTrigger` inside the tree                                | app-owned control + `open` / `onOpenChange`               |
| Close UI    | built-in close button on content                               | none — add your own `Button` / handle `onCancel`          |
| Presentation| Radix portal + overlay                                         | nsh `Dialog` + fixed backdrop/card styles from the wrapper|

## Not forwarded

From `nsh/base` Dialog: `presentation`, `closeOn*` dismiss knobs, and style/backdrop overrides (`style`, `backdropStyle`, …). Presentation and chrome are fixed by this wrapper.
