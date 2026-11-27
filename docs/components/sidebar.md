# Sidebar (/docs/components/sidebar)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add sidebar
```

## Usage [#usage]

```tsx
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Icon } from "@/lib/ui/icons";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<SidebarProvider>
  <Sidebar>{/* a header, its groups, a footer */}</Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    {/* the page */}
  </SidebarInset>
</SidebarProvider>
```

## Composition [#composition]

Use the following composition to build a `Sidebar`:

```text
SidebarProvider
├── Sidebar
│   ├── SidebarHeader
│   │   ├── SidebarMenu
│   │   │   └── SidebarMenuItem
│   │   │       └── SidebarMenuButton
│   │   └── SidebarInput
│   ├── SidebarSeparator
│   ├── SidebarContent
│   │   └── SidebarGroup
│   │       ├── SidebarGroupLabel
│   │       ├── SidebarGroupAction
│   │       └── SidebarGroupContent
│   │           └── SidebarMenu
│   │               └── SidebarMenuItem
│   │                   ├── SidebarMenuButton
│   │                   ├── SidebarMenuAction
│   │                   ├── SidebarMenuBadge
│   │                   ├── SidebarMenuSkeleton
│   │                   └── SidebarMenuSub
│   │                       └── SidebarMenuSubItem
│   │                           └── SidebarMenuSubButton
│   ├── SidebarFooter
│   └── SidebarRail
└── SidebarInset
    └── SidebarTrigger
```

## Examples [#examples]

### The column [#the-column]

`Sidebar` is a column 256 points wide on the sidebar's fill,
its edge against the page, holding a `SidebarHeader`, the groups in a `SidebarContent` that scrolls
when they do not fit, and a `SidebarFooter`.

Three axes say how it meets the window:

- `side` — `left` (default) or `right`: which edge it stands on.
- `variant` — `sidebar` (default) its own edge against the page; `floating` a card standing in the
  window's air, 8 points of room around it; `inset` a card on the sidebar's ground, with the page's
  own card beside it on that same ground, 8 points from it and from the window's edges.
- `collapsible` — `offcanvas` (default) leaves the window when it closes; `icon` folds to a strip of
  icons (48 points); `none` never closes.

```tsx
<Sidebar side="right" variant="inset" collapsible="icon">
  …
</Sidebar>
```

Closing takes the room away at once: the platform transitions colors, opacity and transforms, not
layout, so there is no 200 ms width animation to land (and no `motion-reduce` to switch off) — the
column is either as wide as its state says, or gone.

### The page beside it [#the-page-beside-it]

`SidebarInset` is the page, filling what is left of the window: the page's own fill, or in the `inset`
variant a card with its corners 8 points from the column's card and from the window's edges. Room for
the header of the page is the app's: a row with the trigger, a `Separator` (`orientation="vertical"`,
16 high), where you are, and what it holds.

```tsx
<SidebarInset>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }}>
    <SidebarTrigger />
    <Separator orientation="vertical" style={{ height: 16 }} />
    <Text style={{ fontSize: 13 }}>Documents</Text>
  </View>
  {/* the page */}
</SidebarInset>
```

### The open state [#the-open-state]

`SidebarProvider` owns it: `open` (controlled) or `defaultOpen` (default `true`), reported by
`onOpenChange({ open, reason })` — `triggerPress`, `railPress` or `shortcut`. Nothing is written
down: storage is the app's, which usually keeps the state where it keeps the rest of its settings
and passes it back as `open`.

```tsx
const open = signal(stored("sidebar") ?? true);

<SidebarProvider
  open={open()}
  onOpenChange={({ open: next }) => {
    open.set(next);
    store("sidebar", next);
  }}
>
  …
</SidebarProvider>;
```

`useSidebar()` is what the parts read, and what an app reads inside the provider: `state`
(`"expanded"` or `"collapsed"`), `open`, `openMobile`, `isMobile`, `setOpen`, `setOpenMobile` and
`toggleSidebar`. Every value is live: read it in a JSX binding and it follows the provider.

⌘B on Apple platforms, Ctrl+B elsewhere, folds the column and opens it — `keymap.bind("mod+b")`,
made where the provider draws and gone with it. The rail at the column's inner edge takes a press
too: it is 8 points wide (16 wide to a press, past its bounds with `hitSlop`) and shows a hairline in
the sidebar's edge color while the pointer is over it. That hairline follows the pointer through the
class language (`group-hover:`), not a signal, so passing the cursor over the rail commits no frame;
the pointer has to be on the 8-point strip itself, not only in its `hitSlop` margin. `SidebarTrigger` is the button that usually
sits in the page's header.

### On a phone [#on-a-phone]

A touch screen, or a window narrower than 600 points, shows the column as a sheet instead — this
library's `Sheet`, 288 points wide from the side the column stands on, with the same trigger opening
it. The column's own state is left alone, so a window that widens again finds it as it was.

```tsx
const sidebar = useSidebar(); // in a view inside the provider

<Text>{() => `open ${sidebar.openMobile}, sheet ${sidebar.isMobile}`}</Text>;
```

### A row [#a-row]

`SidebarMenuButton` is a row of `SidebarMenu`, inside a `SidebarGroupContent` of a `SidebarGroup`
that a `SidebarGroupLabel` names: the theme's row high (`controlSize.row`), its label the `body`
type role, the pointer's fill under it, the `sidebarAccent` fill when `isActive` (the page the app
is on), the keyboard's ring, and 50% while `disabled`. It takes a press (`onPress`), or it is a
row of its own; no `href`, as a navigation menu's link has none.

`size` is the row's step — `default` the theme's row, `sm` the height step under it, `lg` a team's
switcher or a user's row, 48 points where the row is a pointer's (a touch screen's row is already a
finger's height) — and `variant` is its look: `default`, bare until the pointer is over it, or
`outline`, a card of its own on the column.

A string child is the row's name. Anything else is drawn as given, which is how an icon leads a name:
the look has the words for it.

```tsx
const row = sidebarMenuButtonLook({ size: () => "sm" });

<SidebarMenuButton size="sm" tooltip={project.name} isActive={project.isActive}>
  <Icon icon={project.icon} size={row.glyph.size} tint={row.glyph.tint} />
  <Text style={row.label}>{project.name}</Text>
</SidebarMenuButton>;
```

Folded to icons, the row is a square the height of a row with its icon, and
`tooltip` names it on a desktop: a
string is the name, or the tooltip's own props (`placement`, `delay`, …). It also names the row for
screen readers when nothing else does — and it replaces `nsh/base`'s element `tooltip`, which is what
this prop is.

A row keeps its name only while the column is open: nothing else moves, so a look is written once
where the row draws. A row the app draws hands its look the column's fold — `open` and `collapsible`,
the app's own signals — and its name goes; a look given no fold options draws the open row, and an
action or a badge inside a folded item leaves the tree.

### An action, a badge [#an-action-a-badge]

`SidebarMenuAction` is a 20-point square at the row's trailing edge, in `SidebarMenuItem`, and
`SidebarMenuBadge` a pill there — a count, a short word, its numbers tabular. The item keeps the room
they need, so the row's name stops short of them; both on one row, the action steps in by the
badge's width rather than drawing over it.

```tsx
<SidebarMenuItem>
  <SidebarMenuButton size="sm" tooltip={project.name}>
    {project.name}
  </SidebarMenuButton>
  <SidebarMenuBadge>{project.unread}</SidebarMenuBadge>
  <SidebarMenuAction accessibilityLabel={`More about ${project.name}`} onPress={more}>
    <Icon icon={Ellipsis} size={16} />
  </SidebarMenuAction>
</SidebarMenuItem>
```

An action is always there: hover alone is something a touch screen has no way to do.

### A sub menu [#a-sub-menu]

`SidebarMenuSub` holds the rows under a row that opens them — `SidebarMenuSubItem` and its
`SidebarMenuSubButton`, the height step under the row (`controlHeight.md`). It is 14 points in from
the row above it, with a hairline down its start in the sidebar's edge color, and it hides while the
column is folded.

The row above it opens it. `nsh/base`'s `Collapsible` does the reveal — not this library's
`Collapsible`, which draws a disclosure row of its own (a settings list wants that; a sidebar row
wants the row it already has):

```tsx
const open = signal(false);

<SidebarMenuItem>
  <Collapsible
    open={open()}
    reveal
    content={
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton onPress={() => go("history")}>History</SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    }
  >
    <SidebarMenuButton onPress={() => open.set(!open())}>
      <Text style={row.label}>Playground</Text>
    </SidebarMenuButton>
  </Collapsible>
</SidebarMenuItem>;
```

### A group [#a-group]

`SidebarGroupLabel` names a group in 32 points of quiet type; folded to icons it takes no room and
draws nothing, and stays in the tree for a screen reader. `SidebarGroupAction` stands at its trailing
edge — a search, a settings — 20 points square. `SidebarGroupContent` takes the rows, as wide as the
group.

### A row that is still coming [#a-row-that-is-still-coming]

`SidebarMenuSkeleton` is the skeleton's blocks where an icon and a name will be: an icon's box when
`showIcon`, then a line of text as long as `width` says (70% when it says nothing). A length made up
per mount is a picture that changes between runs, so this one is told.

## API [#api]

The provider owns the state and lays the column and the page out; a column and its parts draw on
`nsh`'s `View` (`SidebarSeparator` wraps this library's `Separator`, and the phone's sheet is this
library's `Sheet`). Every `nsh` view prop passes through; a row is an `nsh/base` button's props too.

| Part                   | Props                                                                                                                           | Description                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `SidebarProvider`      | `open` / `defaultOpen`, `onOpenChange({ open, reason })`, `style`                                                               | Owns the state and the ⌘B / Ctrl+B binding, and lays the column and the page out                                                |
| `Sidebar`              | `side`, `variant`, `collapsible`                                                                                                | The column; on a phone it is this library's `Sheet`                                                                             |
| `SidebarTrigger`       | `children` (its icon), `accessibilityLabel` (default `"Toggle Sidebar"`), and an icon button's props                            | The button that opens and closes the column                                                                                     |
| `SidebarRail`          | `accessibilityLabel`                                                                                                            | A press at the column's inner edge                                                                                              |
| `SidebarInset`         | every `nsh` view prop                                                                                                           | The page beside the column                                                                                                      |
| `SidebarHeader`        | every `nsh` view prop                                                                                                           | The top: a stack of rows, 8 points apart, 8 of room                                                                             |
| `SidebarFooter`        | every `nsh` view prop                                                                                                           | The bottom, as the header                                                                                                       |
| `SidebarContent`       | every `nsh` view prop                                                                                                           | The scrolling middle                                                                                                            |
| `SidebarSeparator`     | `Separator`'s props                                                                                                             | A separator in the sidebar's edge color, 8 points inset from either side                                                        |
| `SidebarInput`         | `Input`'s props                                                                                                                 | An input as tall as a row, on the page's fill                                                                                   |
| `SidebarGroup`         | every `nsh` view prop                                                                                                           | A titled group, 8 points of room                                                                                                |
| `SidebarGroupLabel`    | `children`                                                                                                                      | A string is the name; folds away to nothing                                                                                     |
| `SidebarGroupAction`   | `accessibilityLabel`, `onPress`, and an `nsh/base` button's props                                                               | A 20-point square at the group's trailing edge                                                                                  |
| `SidebarGroupContent`  | every `nsh` view prop                                                                                                           | What the group holds                                                                                                            |
| `SidebarMenu`          | every `nsh` view prop                                                                                                           | The rows: a column of them 4 points apart                                                                                       |
| `SidebarMenuItem`      | every `nsh` view prop                                                                                                           | One row's box: its button, an action, a badge, a sub menu                                                                       |
| `SidebarMenuButton`    | `isActive`, `size`, `variant`, `tooltip`, `children`, `accessibilityLabel`, and an `nsh/base` button's `onPress`, `disabled`, … | A row of the menu                                                                                                               |
| `SidebarMenuAction`    | `accessibilityLabel`, `onPress`, and an `nsh/base` button's props                                                               | A 20-point square at the row's trailing edge                                                                                    |
| `SidebarMenuBadge`     | `children`                                                                                                                      | A count or a short word at the row's trailing edge                                                                              |
| `SidebarMenuSub`       | every `nsh` view prop                                                                                                           | The rows under a row that opens them                                                                                            |
| `SidebarMenuSubItem`   | every `nsh` view prop                                                                                                           | One of them                                                                                                                     |
| `SidebarMenuSubButton` | `isActive`, `size`, `children`, `accessibilityLabel`, and an `nsh/base` button's props                                          | A sub row; it takes a press                                                                                                     |
| `SidebarMenuSkeleton`  | `showIcon`, `width`                                                                                                             | The skeleton's blocks where an icon and a name will be                                                                          |
| `useSidebar()`         | —                                                                                                                               | What the parts read inside the provider: `state`, `open`, `openMobile`, `isMobile`, `setOpen`, `setOpenMobile`, `toggleSidebar` |

`sidebarMenuButtonLook({ size, variant, active, trailing })` is exported for a row the app draws
itself: its `label` and its `glyph` (`size`, `tint`). The other looks stay with the parts.