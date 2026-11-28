# DockArea (/docs/components/dock-area)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add dock-area
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { DockArea } from "shadcn-nsh/dock-area";
```

## Usage [#usage]

```tsx
import { DockArea, DockDragPreview, DockTab, dockTabCloseClass } from "@/components/ui/dock-area";
```

```tsx
<DockArea defaultLayout={layout} style={{ height: 240 }} />
```

Use `DockTab`, `dockTabCloseClass`, and `DockDragPreview` in `renderTab` / `renderDragPreview`, or rely on the defaults.

## Examples [#examples]

### Tabs [#tabs]

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

### Default chrome [#default-chrome]

Leave the render props out and the area uses `DockTab` and `DockDragPreview`. The area's own classes are the chrome of every part, and a class you pass follows them.

```tsx
<DockArea defaultLayout={layout} style={{ height: 240 }} />
```

## API [#api]

| Part              | Props                                                                                                                               | Description                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `DockArea`        | every `nsh/base` DockArea prop; `renderTab`, `renderDragPreview`, `renderEmpty` and the part classes, the caller's after the area's | Tabs, splits and edge docks |
| `DockTab`         | `title`, `active`, `testID`, `children`                                                                                             | A tab's title and underline |
| `DockDragPreview` | `title`                                                                                                                             | A dragged tab's chip        |

`DockArea` applies its chrome classes and default tab, preview and empty renderers. Every prop of [`nsh/base` DockArea](https://nsh.dev/elements/dock) passes through, and so do the types those props, its ref and its callbacks name — a call site reads them from this file, not from `nsh/base`: `DockAreaProps`, `DockAreaRef`, `DockAreaLayout`, `DockRegion`, `DockNode`, `DockPlacement`, `DockPanel`, `DockPanelOptions`, `DockTarget`, `DockDropIndicator` and `DockInfo`.

`groupClass` is applied after the look's `flex-1 bg-muted`. A later background utility replaces the fill, so `groupClass="bg-card"` draws card-colored groups without `groupStyle`.

A tab as `renderTab` and `renderDragPreview` receive it is `DockTabValue`: `nsh/base`'s `DockTab`, named so here because `DockTab` is the component the tab is drawn with.

```tsx
import { DockTab, type DockTabValue } from "@/components/ui/dock-area";

const tab = (value: DockTabValue) => <DockTab title={value.panel} active={value.active} />;
```