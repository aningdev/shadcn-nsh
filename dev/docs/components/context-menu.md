# Context Menu (/dev/docs/components/context-menu)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add context-menu
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { ContextMenu } from "shadcn-nsh/context-menu";
```

## Usage [#usage]

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
```

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <View>Right click here</View>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => {}}>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Composition [#composition]

Use the following composition to build a `ContextMenu`:

```text
ContextMenu
├── ContextMenuTrigger
└── ContextMenuContent
    ├── ContextMenuGroup
    │   ├── ContextMenuLabel
    │   ├── ContextMenuItem
    │   │   └── ContextMenuShortcut
    │   ├── ContextMenuCheckboxItem
    │   └── ContextMenuRadioItem
    ├── ContextMenuSeparator
    └── ContextMenuSub
        ├── ContextMenuSubTrigger
        └── ContextMenuSubContent
```

## Examples [#examples]

### A surface [#a-surface]

Any view can be the trigger; the menu opens at the pointer on a secondary click or a long press.

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <View style={{ height: 150 }}>Right click or hold</View>
  </ContextMenuTrigger>
  <ContextMenuContent margin={8}>
    <ContextMenuItem onSelect={() => copy()}>Copy</ContextMenuItem>
    <ContextMenuItem onSelect={() => paste()}>Paste</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Separator and a destructive item [#separator-and-a-destructive-item]

```tsx
<ContextMenuItem onSelect={() => cut()}>Cut</ContextMenuItem>
<ContextMenuSeparator />
<ContextMenuItem variant="destructive" onSelect={() => remove()}>
  Delete
</ContextMenuItem>
```

### Keep it open [#keep-it-open]

`closeOnSelect={false}` leaves the menu up for a toggle inside it.

```tsx
<ContextMenuItem closeOnSelect={false} onSelect={() => setPinned(!pinned())}>
  <Text style={menuItemLabel()}>{() => (pinned() ? "Unpin" : "Pin")}</Text>
</ContextMenuItem>
```

### A checkable row and its neighbours [#a-checkable-row-and-its-neighbours]

A checkable row keeps its mark's room whether it is checked or not, so its label stays put as it
is toggled. `inset` gives the plain rows of the same menu that room too, and their labels line up
with it. `ContextMenuLabel` and `ContextMenuSubTrigger` take it as well.

```tsx
<ContextMenuItem checked={pinned()} closeOnSelect={false} onSelect={() => setPinned(!pinned())}>
  Pin
</ContextMenuItem>
<ContextMenuItem inset onSelect={() => cut()}>Cut</ContextMenuItem>
<ContextMenuItem inset onSelect={() => copy()}>Copy</ContextMenuItem>
```

### Open change [#open-change]

```tsx
<ContextMenu onOpenChange={({ open, reason }) => log(open, reason)}>…</ContextMenu>
```

## API [#api]

Row and popup looks come from Menu. Items, separators, labels and submenus are re-exported as `ContextMenu*` parts. There is no radio-group part: a `ContextMenuGroup` holds the rows, and each `ContextMenuRadioItem` carries its own `checked`.

| Part                 | Props                                                                                                                                                    | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `ContextMenu`        | `open`, `defaultOpen`, `disabled`, `onOpenChange({ open, reason })`, `onOpen`, `onClose`, `onCancel`                                                     | Open state and the trigger slot                                                        |
| `ContextMenuTrigger` | `children`, `style`                                                                                                                                      | Secondary click or long press; wraps its children, in a `View` when it takes a `style` |
| `ContextMenuContent` | every `nsh/base` ContextMenu prop but open state, `disabled`, `trigger` and the lifecycle callbacks; `offset` (default 4), `popupStyle`, `backdropStyle` | The popup or sheet                                                                     |
| `ContextMenuItem` …  | as the Menu counterparts                                                                                                                                 | Rows, labels, separators and submenus                                                  |