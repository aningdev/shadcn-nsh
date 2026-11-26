# Button group (/docs/components/button-group)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add button-group
```

## Usage [#usage]

```tsx
import { ButtonGroup, buttonGroupLook } from "@/components/ui/button-group";
```

```tsx
<ButtonGroup>
  <Button variant="outline" style={buttonGroupLook().item("horizontal", "first")}>
    Back
  </Button>
  <Button variant="outline" style={buttonGroupLook().item("horizontal", "middle")}>
    Archive
  </Button>
  <Button variant="outline" style={buttonGroupLook().item("horizontal", "last")}>
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
`item(orientation, position)` squares the sides that touch and keeps one edge per join (the one
before it), the outer sides keeping the corners and the edge the button came with. `first` at the
leading edge, `last` at the trailing one, `middle` between two others. Pair `variant="outline"`
buttons when joining bordered actions directly.

```tsx
<ButtonGroup>
  <Button variant="outline" style={buttonGroupLook().item("horizontal", "first")}>
    Back
  </Button>
  <Button variant="outline" style={buttonGroupLook().item("horizontal", "last")}>
    Next
  </Button>
</ButtonGroup>
```

The group is `role="group"`, so a reader hears the buttons as one set.

### A column [#a-column]

`orientation="vertical"` stacks them: the top and bottom corners are clamped to `shape.container`
so capsule buttons stay tidy in a column, the touching sides are squared, and one hairline is left
between adjacent items. Shadows are dropped inside the stack so seams stay clean.

```tsx
<ButtonGroup orientation="vertical">
  <Button variant="outline" style={buttonGroupLook().item("vertical", "first")}>
    Copy the path
  </Button>
  <Button variant="outline" style={buttonGroupLook().item("vertical", "middle")}>
    Open in a new window
  </Button>
  <Button variant="outline" style={buttonGroupLook().item("vertical", "last")}>
    Reveal in the file manager
  </Button>
</ButtonGroup>
```

### With a separator [#with-a-separator]

`ButtonGroupSeparator` puts a hairline between borderless filled buttons (`secondary` or
`default`). The separator turns with the group — vertical down a row, horizontal across a column —
and is hidden from screen readers.

```tsx
<ButtonGroup>
  <Button variant="secondary" style={buttonGroupLook().item("horizontal", "first")}>
    Cut
  </Button>
  <ButtonGroupSeparator />
  <Button variant="secondary" style={buttonGroupLook().item("horizontal", "last")}>
    Copy
  </Button>
</ButtonGroup>
```

### With a text addon [#with-a-text-addon]

`ButtonGroupText` sits on the muted fill with the same outline edge (`button.outline.edge`) and
height (`controlHeight.md`) as an outline button, so it joins directly with `item(...)` and shares
one clean border.

```tsx
<ButtonGroup>
  <ButtonGroupText style={buttonGroupLook().item("horizontal", "first")}>Path</ButtonGroupText>
  <Button variant="outline" style={buttonGroupLook().item("horizontal", "last")}>
    Copy
  </Button>
</ButtonGroup>
```

## API [#api]

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on all three parts;
`style` goes over the look's on each.

| Part                   | Props                                                                | Description                                                                                                  |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ButtonGroup`          | `orientation`: `"horizontal" \| "vertical"` (default `"horizontal"`) | Buttons joined into one control, in a row or a column: `buttonGroupLook().root(orientation)`.                |
| `ButtonGroupText`      | —                                                                    | A word inside the group on the muted fill, joined as a button would be joined: `.textFrame()` and `.text()`. |
| `ButtonGroupSeparator` | —                                                                    | The separator's own hairline (`.separator()`), turned to the group's orientation; hidden from a reader.      |

| Prop          | Type                         | Default      |
| ------------- | ---------------------------- | ------------ |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` |

`buttonGroupLook()` is exported for a group the app lays out itself: `root(orientation)` the group,
`item(orientation, position)` the join each button wears, `textFrame()` and `text()` the word's box
and its type, and `separator()` the divider's hairline.