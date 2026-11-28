# TitleBar (/docs/components/title-bar)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add title-bar
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { TitleBar } from "shadcn-nsh/title-bar";
```

## Usage [#usage]

```tsx
import { Text } from "nsh";

import {
  TITLE_BAR_HEIGHT,
  TitleBar,
  WindowControls,
  WindowResizeEdges,
} from "@/components/ui/title-bar";
```

A desktop window with `titleBar: { style: "hidden" }` keeps the system's window buttons and leaves
the rest of the bar to the app: `TitleBar` builds on `nsh/base`'s `TitleBar` to draw the bar, drag
the window, double click to zoom or maximize, and keep its children clear of the system buttons
automatically across split panes and full-screen transitions.

```tsx
<TitleBar>
  {/* the app's own: a logo, the document's name, a search field, a button */}
  <Text style={{ flex: 1 }}>Notes.nsh</Text>
</TitleBar>
```

`TitleBar` draws nothing where the app has no window of its own — a browser page, a phone — and
`WindowControls` are inert there: the bar is a window's, and there is none.

## Composition [#composition]

Use the following composition to build a `TitleBar`:

```text
TitleBar
├── WindowControls
└── WindowResizeEdges
```

## Examples [#examples]

### Traffic lights [#traffic-lights]

A window with `frame: "none"` has no title bar and no border: the app draws the bar, the lights
and the edges itself. `WindowControls` puts the platform's three buttons at the leading end, the
app's own content after them.

```tsx
<View style={{ flex: 1 }}>
  <TitleBar>
    <WindowControls />
    <Text style={{ flex: 1 }}>Time sheet.nsh</Text>
  </TitleBar>
  <View style={{ flex: 1 }}>{document}</View>
  <WindowResizeEdges />
</View>
```

The glyphs are drawn while the pointer is over the lights, as the system draws them, and the
lights turn grey while the window is in the background.

### Caption buttons [#caption-buttons]

Windows' and Linux's buttons are cells at the trailing end of the bar, filling its height.
They sit flush against the window's corner, so the inner content row's trailing padding goes to
zero while keeping `TitleBar`'s own automatic window-control inset intact:

```tsx
<TitleBar contentStyle={{ paddingEnd: 0 }}>
  <Text style={{ flex: 1 }}>Notes.nsh</Text>
  <WindowControls variant="caption" />
</TitleBar>
```

### Your own window controls [#your-own-window-controls]

The three parts are the shapes the platforms draw; an app that wants its own draws the same
`desktop` views itself, and the platform still carries out the press. A round close button
(`Icon` from `lib/ui/icons`, `X` from `lucide`; the traffic lights keep macOS's own hues
whatever the theme, so the disc's colour is written out rather than read from a role, and the
glyph on a light is black at half):

```tsx
<View
  desktop={{ windowControl: "close" }}
  role="button"
  accessibilityLabel="Close"
  style={{
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  }}
  hoverStyle={{ backgroundColor: "#FF5F57" }}
>
  <Icon icon={X} size={12} />
</View>
```

A bar of the app's own takes `desktop={{ windowDrag: true }}` to drag the window, and pads by
`titleBar().left` and `titleBar().right` so its content clears the system's buttons.

## API [#api]

| Part                | Props                                                                                                                               | Description                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `TitleBar`          | every [`nsh/base` TitleBar](https://nsh.dev/elements/title-bar) prop; `style` over the outer bar; `contentStyle` over the inner row | The bar that drags the window               |
| `WindowControls`    | `variant`; every `nsh` View prop; `style` over the controls                                                                         | The window's own buttons                    |
| `WindowResizeEdges` |                                                                                                                                     | The edges and corners of a frameless window |

`TitleBar` wraps [`nsh/base` TitleBar](https://nsh.dev/elements/title-bar); pass inner padding on `contentStyle` rather than `style` so the automatic window-control padding is preserved. Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `WindowControls` and `WindowResizeEdges`, and `style` goes over the look's on `WindowControls`.

| Prop           | Type                            | Default          |
| -------------- | ------------------------------- | ---------------- |
| `contentStyle` | `StyleProp<ViewStyle>`          | `undefined`      |
| `variant`      | `"traffic-lights" \| "caption"` | `traffic-lights` |

`TitleBar` is at least `TITLE_BAR_HEIGHT` (40 points) tall, or the height the system's title bar has, on
the inset fill with a hairline under it; its children start `12` points after the system's buttons.
A traffic light is `TRAFFIC_LIGHT` (12 points) wide, in macOS's own close, minimize and zoom hues wherever the theme goes, with glyphs in black at half and a hairline of black at an eighth around the disc, and `CAPTION_BUTTON` (46) is a caption cell's width; the close cell
washes the destructive tint while the pointer is on it. `WindowResizeEdges` draws eight strips —
`5` points along the edges, `12` at the corners — as the last child of the window's root.
A bar the app lays out itself takes `desktop={{ windowDrag: true }}` and pads by `titleBar().left` and `titleBar().right`.