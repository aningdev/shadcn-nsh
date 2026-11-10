---
layout: ../../../layouts/Docs.astro
title: Resizable
description: Styled resizable panels wrapping nsh/base ResizablePanelGroup / ResizablePanel.
component: true
demo: resizable
demoHeight: 220
---

[`nsh/base`](https://nsh.dev/elements/resizable) owns the drag, the panels' limits, the resize cursor and the handle's adjustable role. This package paints the hairline, the thumb and the panel surface.

## Install

```npx tabs
npx shadcn-nsh@latest add resizable
```

```bunx tabs
bunx shadcn-nsh@latest add resizable
```

```pnx tabs
pnx shadcn-nsh@latest add resizable
```

```yarn tabs
yarn dlx shadcn-nsh@latest add resizable
```

## Usage

```tsx
import { ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/ui/resizable";

<ResizablePanelGroup handleAccessibilityLabel="Resize the sidebar">
  <ResizablePanel size={240} minSize={160} maxSize={480}>
    <Text>Files</Text>
  </ResizablePanel>
  <ResizablePanel>
    <Text>Editor</Text>
  </ResizablePanel>
</ResizablePanelGroup>;
```

`visible={false}` collapses a panel: it takes no space, and the others share it. Pass `onResize` sizes back as each panel's `size` to keep a drag.

## API

`ResizablePanelGroup` and `ResizablePanel` pass every base prop through. Defaults:

| Piece  | Default                                                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Handle | 1-point `border` line. `ring` under the pointer or when focused, `primary` while pressed or dragged                                     |
| Thumb  | `muted-foreground` pill, hidden at rest, short at 40% opacity on hover, full while active. `duration-150`, cancelled by `motion-reduce` |
| Panel  | `muted` surface, 8 points of padding                                                                                                    |
| Label  | `"Resize"` when `handleAccessibilityLabel` is omitted                                                                                   |

`resizableVariants({ axis })` returns that chrome, including `hover`, `drag` and `focus` grips for a still shot. The live handle uses the classes; base does not expose a per-state style.

There is no `ResizableHandle` part. Base draws the handle. Style it with `handleClass`, `handleThumbClass` or `renderHandle`.

## Differences

| Topic       | Reference (`look/workspace.tsx`)       | This package                                                                                                                     |
| ----------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Thumb color | `muted-foreground`                     | Same, as a class, so hover and active can recolor the line                                                                       |
| Line        | `bg-border`, per axis                  | Same. `group-hover` / `group-active` / `group-focus` recolor it. An inline color would win, so the line color stays on the class |
| Focus       | Not drawn                              | `group-focus:` on the line and the thumb. Base has no `focusStyle` for a handle                                                  |
| Panel       | The app's own surface                  | `muted`, the neutral stand-in for gallery inset                                                                                  |
| Terminal    | No separate handle                     | Dropped, with the rest of the terminal look                                                                                      |
| shadcn      | `ResizableHandle` is its own component | Not exported. The handle is the group's                                                                                          |

Collapsed is base `visible={false}`, not a second component.

## Accessibility

Each handle is an adjustable element named by `handleAccessibilityLabel` (default "Resize"). Say what it resizes ("Resize the sidebar"). A hidden panel is not in the layout; do not leave its only label on a handle that is gone.
