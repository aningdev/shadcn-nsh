---
layout: ../../../layouts/Docs.astro
title: Dock Area
description: Styled dock workspace wrapping nsh/base DockArea.
component: true
demo: dock-area
demoHeight: 280
---

[`nsh/base`](https://nsh.dev/elements/dock) owns tab drags, splits, dock resize, zoom and the lock. This package paints the tab bar, the tab title, the handles and the compact drawer and sheet.

## Install

```npx tabs
npx shadcn-nsh@latest add dock-area
```

```bunx tabs
bunx shadcn-nsh@latest add dock-area
```

```pnx tabs
pnx shadcn-nsh@latest add dock-area
```

```yarn tabs
yarn dlx shadcn-nsh@latest add dock-area
```

## Usage

```tsx
import { DockArea } from "@workspace/ui/components/ui/dock-area";
import type { DockAreaLayout } from "nsh/base";

const layout = signal<DockAreaLayout>({
  center: {
    type: "split",
    axis: "horizontal",
    children: [{ type: "tabs", panels: ["Readme", "Main"] }],
  },
  left: { layout: { type: "tabs", panels: ["Files", "Git"] }, size: 200 },
});

<DockArea
  style={{ height: 320 }}
  layout={layout()}
  onLayoutChange={(event) => layout.set(event.layout)}
/>;
```

Give the area a height. It fills that box. Omit `renderTab` to use the panel key, muted until hover, with a primary underline on the shown tab. Omit `renderPanel` to show the key in the panel.

A close button is yours. `renderTab` is inside the tab, and `tab.closable` says whether base would close it:

```tsx
<DockArea
  ref={area}
  renderTab={(tab) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }}>
      <Text>{tab.panel}</Text>
      {tab.closable ? (
        <Button
          accessibilityLabel={`Close ${tab.panel}`}
          onPress={() => area.closePanel(tab.panel)}
        >
          ×
        </Button>
      ) : null}
    </View>
  )}
/>
```

## API

`DockArea` passes every base prop through. Defaults apply when the matching prop is omitted:

| Piece          | Default                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------- |
| Group, dock    | `muted`                                                                                       |
| Tab bar        | Row, `border` hairline along the bottom                                                       |
| Tab            | `group`, so the title's `group-hover:` follows the pointer. Minimum height 36                 |
| Handle         | `border` hairline, `ring` on hover or focus, `primary` while dragged. Thumb matches Resizable |
| Drop target    | `primary` border, `accent` fill                                                               |
| Drawer / sheet | `card` with a `border` edge. The sheet's top radius is 16                                     |
| Backdrop       | `colors.backdrop`                                                                             |
| Empty center   | "No panels"                                                                                   |
| Drag preview   | Raised `card` chip with the panel key                                                         |
| Handle label   | `"Resize"`                                                                                    |

`dockAreaVariants()` returns those classes and styles.

## Differences

| Topic         | Reference (`look/workspace.tsx`)                  | This package                                                          |
| ------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| Underline     | Brand                                             | `primary`. This theme has no citrus accent                            |
| Drop target   | `border-brand` and `bg-brand-tint`                | `border-primary` and `bg-accent`                                      |
| Backdrop      | Gallery `scrim`                                   | The existing `custom-backdrop` token. No new token                    |
| Close button  | Reference `dockTabCloseClass`, fading in on hover | Not drawn. Closing is `ref.closePanel`, and the button is app content |
| Terminal tabs | A second close placement                          | Dropped                                                               |
| shadcn        | No dock                                           | No alias                                                              |

The center's root is a split in the layout base reports. A tabs node you pass as `center` is tidied by base. Compact drawers and the bottom sheet are base's presentation; this package only styles `drawerStyle` and `sheetStyle`.

## Accessibility

Tabs are tabs: base sets the role and the selected state. The default title is the panel key, so use a key a person can read, or replace `renderTab`. Handles use `handleAccessibilityLabel`. A locked area still selects tabs and still resizes.
