---
title: Resizable
description: Resize handles with a quiet hairline and a growing thumb.
component: true
demo: resizable
---

## Installation

```sh
npx shadcn-nsh@latest add resizable
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

## API

`ResizablePanelGroup` spreads `resizableHandleLook` for the axis. Every prop of [`nsh/base` ResizablePanelGroup](https://nsh.dev/elements/resizable-panel-group) passes through.

Also export `resizableHandleLook`, `resizableHandle`, and `handleThumb` for custom layouts.
