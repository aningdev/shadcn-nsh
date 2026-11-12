---
layout: ../../../layouts/Docs.astro
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

## Examples

### Tabs

`defaultLayout` is the data; `renderTab` and `renderPanel` draw each tab and panel.

```tsx
const layout: DockAreaLayout = {
  center: { type: "tabs", panels: ["readme", "preview"], activeIndex: 0 },
};

<DockArea
  defaultLayout={layout}
  renderTab={(tab) => <DockTab title={tab.panel} active={tab.active} />}
  renderPanel={(panel) => <Text>{panel.id}</Text>}
/>;
```

### Default chrome

Leave the render props out and the area uses `DockTab` and `DockDragPreview`; `dockClasses` is the chrome of every part.

```tsx
<DockArea defaultLayout={layout} style={{ height: 240 }} />
```

## API

`DockArea` spreads `dockClasses` and default tab/panel renderers. Every prop of [`nsh/base` DockArea](https://nsh.dev/elements/dock-area) passes through.
