---
title: Resizable
description: Resize handles with a quiet hairline and a growing thumb.
component: true
demo: resizable
---

## Installation

```npm
npx shadcn-nsh@latest add resizable
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { ResizablePanelGroup } from "shadcn-nsh/resizable";
```

## Usage

```tsx
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
```

```tsx
<ResizablePanelGroup style={{ height: 200 }}>
  <ResizablePanel size={160} minSize={100}>
    Sidebar
  </ResizablePanel>
  <ResizablePanel>Main</ResizablePanel>
</ResizablePanelGroup>
```

## Composition

Use the following composition to build a `ResizablePanelGroup`:

```text
ResizablePanelGroup
└── ResizablePanel
```

## Examples

### A sidebar

`size` is the panel's current width; `onResize` reports the drag.

```tsx
<ResizablePanelGroup style={{ height: 120 }} handleAccessibilityLabel="Resize the sidebar">
  <ResizablePanel
    size={sidebar()}
    minSize={100}
    maxSize={240}
    onResize={({ size }) => sidebar.set(Math.round(size))}
  >
    <Text>Files</Text>
  </ResizablePanel>
  <ResizablePanel>
    <Text>Editor</Text>
  </ResizablePanel>
</ResizablePanelGroup>
```

### Vertical

`axis="vertical"` stacks the panels, with the handle's hairline along the column.

```tsx
<ResizablePanelGroup axis="vertical" style={{ height: 240 }}>
  <ResizablePanel size={120}>
    <Text>Top</Text>
  </ResizablePanel>
  <ResizablePanel>
    <Text>Bottom</Text>
  </ResizablePanel>
</ResizablePanelGroup>
```

## API

`ResizablePanelGroup` spreads `resizableHandleLook` for the axis. Every prop of [`nsh/base` ResizablePanelGroup](https://nsh.dev/elements/resizable) passes through.

Also export `resizableHandleLook` and `handleThumb` for a handle the app lays out itself.

| Part                  | Props | Description                                              |
| --------------------- | ----- | -------------------------------------------------------- |
| `ResizablePanelGroup` |       | Spreads `resizableHandleLook` for the axis               |
| `ResizablePanel`      |       | `size` is its current width; `onResize` reports the drag |
