# Button group (/docs/components/button-group)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add button-group
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { ButtonGroup } from "shadcn-nsh/button-group";
```

## Usage [#usage]

```tsx
import { ButtonGroup, buttonGroupItem } from "@/components/ui/button-group";
```

```tsx
<ButtonGroup>
  <Button variant="outline" style={buttonGroupItem("first")}>
    Back
  </Button>
  <Button variant="outline" style={buttonGroupItem("middle")}>
    Archive
  </Button>
  <Button variant="outline" style={buttonGroupItem("last")}>
    Next
  </Button>
</ButtonGroup>
```

## Composition [#composition]

Use the following composition to build a `ButtonGroup`:

```text
ButtonGroup
├── ButtonGroupText
└── ButtonGroupSeparator
```

## Examples [#examples]

### The join [#the-join]

A view styles itself and not its children, so each button wears its own place in the group:
`buttonGroupItem(position)` squares the sides that touch and keeps one edge per join (the one
before it), the outer sides keeping the corners and the edge the button came with. `first` at the
leading edge, `last` at the trailing one, `middle` between two others. The orientation is the
group's, so a row does not pass it. Pair `variant="outline"` buttons when joining bordered
actions directly.

```tsx
<ButtonGroup>
  <Button variant="outline" style={buttonGroupItem("first")}>
    Back
  </Button>
  <Button variant="outline" style={buttonGroupItem("last")}>
    Next
  </Button>
</ButtonGroup>
```

The group is `role="group"`, so a reader hears the buttons as one set.

### A column [#a-column]

`orientation="vertical"` stacks them. `buttonGroupItem` reads that orientation from the group:
the top and bottom corners are clamped to `shape.container` so capsule buttons stay tidy in a
column, the touching sides are squared, and one hairline is left between adjacent items. Shadows
are dropped inside the stack so seams stay clean.

```tsx
<ButtonGroup orientation="vertical">
  <Button variant="outline" style={buttonGroupItem("first")}>
    Copy the path
  </Button>
  <Button variant="outline" style={buttonGroupItem("middle")}>
    Open in a new window
  </Button>
  <Button variant="outline" style={buttonGroupItem("last")}>
    Reveal in the file manager
  </Button>
</ButtonGroup>
```

### With a separator [#with-a-separator]

`ButtonGroupSeparator` puts a hairline between borderless filled buttons (`secondary` or
`default`). The separator turns with the group — vertical down a row, horizontal across a column —
and is hidden from screen readers. Pass `orientation` to draw the line the other way.

```tsx
<ButtonGroup>
  <Button variant="secondary" style={buttonGroupItem("first")}>
    Cut
  </Button>
  <ButtonGroupSeparator />
  <Button variant="secondary" style={buttonGroupItem("last")}>
    Copy
  </Button>
</ButtonGroup>
```

### With a text addon [#with-a-text-addon]

`ButtonGroupText` sits on the muted fill with the same outline edge (`button.outline.edge`) and
height (`controlHeight.md`) as an outline button, so it joins directly with `buttonGroupItem` and
shares one clean border.

```tsx
<ButtonGroup>
  <ButtonGroupText style={buttonGroupItem("first")}>Path</ButtonGroupText>
  <Button variant="outline" style={buttonGroupItem("last")}>
    Copy
  </Button>
</ButtonGroup>
```

### Split button [#split-button]

A main action and the button that opens its menu are one group. Filled buttons (`default`,
`secondary`) take a `ButtonGroupSeparator` so the seam stays a hairline on the accent face. Outline
buttons join on their own edge, the same way shadcn's dropdown split does.

```tsx
<ButtonGroup>
  <Button variant="default" style={buttonGroupItem("first")}>
    Save
  </Button>
  <ButtonGroupSeparator />
  <Button variant="default" accessibilityLabel="More save options" style={buttonGroupItem("last")}>
    <Icon icon={ChevronDown} {...buttonGlyph("default")} />
  </Button>
</ButtonGroup>
```

```tsx
<ButtonGroup>
  <Button variant="outline" style={buttonGroupItem("first")}>
    Follow
  </Button>
  <Button
    variant="outline"
    accessibilityLabel="More follow options"
    style={buttonGroupItem("last")}
  >
    <Icon icon={ChevronDown} {...buttonGlyph("outline")} />
  </Button>
</ButtonGroup>
```

## API [#api]

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on all three parts,
including `class` and `classList`. `style` goes over the part's own.

| Part                   | Props                                                                | Description                                                                                        |
| ---------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `ButtonGroup`          | `orientation`: `"horizontal" \| "vertical"` (default `"horizontal"`) | Buttons joined into one control, in a row or a column.                                             |
| `ButtonGroupText`      | —                                                                    | A word inside the group on the muted fill, joined with `buttonGroupItem`.                          |
| `ButtonGroupSeparator` | `orientation`: `"horizontal" \| "vertical"`                          | A hairline. Unset, perpendicular to the group (down a row, across a column). Hidden from a reader. |

| Prop          | Type                         | Default                                                   |
| ------------- | ---------------------------- | --------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` on the group; perpendicular on the separator |

`buttonGroupItem(position, orientation?)` is the join each button or text addon wears.
`position` is `"first"`, `"middle"`, or `"last"`. Leave `orientation` unset inside a
`ButtonGroup` and it follows the group; pass it when the control is joined outside one.
A column clamps its outer corners to `shape.container` and drops the stack's shadow.