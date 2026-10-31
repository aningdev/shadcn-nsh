---
layout: ../../../layouts/Docs.astro
title: Sheet
description: Styled sheet wrapping nsh/base Sheet.
component: true
demo: sheet
demoHeight: 420
---

Styled edge panel on `nsh/base` Sheet with fixed card chrome; defaults to `side="bottom"`. Single root like Dialog — compose title/body/actions yourself.

## Install

```sh
shadcn-nsh add sheet
# monorepo:
shadcn-nsh add sheet -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { Sheet } from "@workspace/ui/components/ui/sheet";
import { Text } from "nsh";

<Sheet open onOpenChange={(e) => console.log(e.open)}>
  <Text>Sheet body</Text>
  <Button onPress={() => {}}>Dismiss</Button>
</Sheet>;
```

## Composition

```
Sheet
└─ children (body — you own header / footer)
```

Unlike shadcn’s `SheetTrigger` / `SheetContent` / `SheetHeader` tree, this wrapper is one `Sheet` root. Open state and trigger live in your app.

## Examples

### Controlled open

```tsx
const [open, setOpen] = createSignal(false);

<Button onPress={() => setOpen(true)}>Open sheet</Button>
<Sheet open={open()} onOpenChange={(e) => setOpen(e.open)} side="bottom">
  <Text>Bottom sheet</Text>
  <Button variant="secondary" onPress={() => setOpen(false)}>
    Dismiss
  </Button>
</Sheet>
```

### Side placement

```tsx
<Sheet open side="right" onOpenChange={(e) => console.log(e.open)}>
  <Text>Anchored to the right</Text>
</Sheet>
```

### Swipe to close

```tsx
<Sheet open closeOnSwipe onClose={() => {}}>
  <Text>Swipe dismiss when supported</Text>
</Sheet>
```

## API

| Prop           | Type                                                 | Default    | Notes                    |
| -------------- | ---------------------------------------------------- | ---------- | ------------------------ |
| `open`         | `boolean \| null`                                    | —          | Controlled open          |
| `defaultOpen`  | `boolean`                                            | —          |                          |
| `side`         | `Placement`                                          | `"bottom"` | Edge / placement         |
| `closeOnSwipe` | `boolean`                                            | —          | Forwarded from base      |
| `children`     | `JSX.Element`                                        | —          | Body content             |
| `onOpenChange` | `(event: { open: boolean; reason: string }) => void` | —          |                          |
| `onOpen`       | `() => void`                                         | —          |                          |
| `onClose`      | `() => void`                                         | —          |                          |

`Placement` is the nsh placement type (same family as tooltip placement).

## Differences

| Topic       | shadcn                                                         | This package                                              |
| ----------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| Parts       | `Sheet` / `Trigger` / `Content` / `Header` / `Title` / …       | single `Sheet`; compose children yourself                 |
| Trigger     | `SheetTrigger` inside the tree                                 | app-owned control + `open` / `onOpenChange`               |
| Side        | often `side` on content                                        | `side` on the root (default `"bottom"`)                   |
| Close UI    | built-in close on content                                      | none — add your own `Button` / handle `onClose`           |
| Presentation| Radix dialog-style drawer                                      | nsh Sheet + fixed backdrop/panel styles from the wrapper  |

## Not forwarded

From `nsh/base` Sheet: style/backdrop overrides (`backdropStyle`, `popupStyle`, …). Presentation and card chrome are fixed by this wrapper (`side` defaults to `"bottom"` when omitted).
