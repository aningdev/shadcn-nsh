---
title: DockArea
description: Dockable workspace chrome for tabs, splits, and edge docks.
component: true
demo: dock-area
---

## Installation

```sh
npx shadcn-nsh@latest add dock-area
```

## Usage

```tsx
import { DockArea, DockTab, dockClasses } from "@/components/ui/dock-area";
```

```tsx
<DockArea defaultLayout={layout} style={{ height: 240 }} />
```

Use `DockTab`, `dockTabCloseClass`, and `DockDragPreview` in `renderTab` / `renderDragPreview`, or rely on the defaults.

## API

`DockArea` spreads `dockClasses` and default tab/panel renderers. Every prop of [`nsh/base` DockArea](https://nsh.dev/elements/dock-area) passes through.
