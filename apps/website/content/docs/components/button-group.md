---
title: Button group
description: Buttons joined into one control, in a row or a column.
component: true
demo: button-group
---

## Installation

```npm
npx shadcn-nsh@latest add button-group
```

## Usage

```tsx
import { ButtonGroup, buttonGroupLook } from "@/components/ui/button-group";
```

```tsx
<ButtonGroup>
  <Button style={buttonGroupLook().item("horizontal", "first")}>Back</Button>
  <Button style={buttonGroupLook().item("horizontal", "middle")}>Archive</Button>
  <Button style={buttonGroupLook().item("horizontal", "last")}>Next</Button>
</ButtonGroup>
```

## Composition

Use the following composition to build a `ButtonGroup`:

```text
ButtonGroup
├── ButtonGroupText
└── ButtonGroupSeparator
```

## Examples

### The join

A view styles itself and not its children, so each button wears its own place in the group:
`item(orientation, position)` squares the sides that touch and keeps one edge per join (the one
before it), the outer sides keeping the corners and the edge the button came with. `first` at the leading edge, `last` at the
trailing one, `middle` between two others.

```tsx
<ButtonGroup>
  <Button variant="secondary" style={buttonGroupLook().item("horizontal", "first")}>
    Back
  </Button>
  <Button variant="secondary" style={buttonGroupLook().item("horizontal", "last")}>
    Next
  </Button>
</ButtonGroup>
```

The group is `role="group"`, so a reader hears the buttons as one set.

### A column

`orientation="vertical"` stacks them: the corners at the top and the bottom of the column keep the
corners, the sides between them are squared, and one hairline is left between two buttons. A button
below another also drops the raised face's lit top edge, which would read as a white seam.

```tsx
<ButtonGroup orientation="vertical">
  <Button style={buttonGroupLook().item("vertical", "first")}>Copy the path</Button>
  <Button style={buttonGroupLook().item("vertical", "middle")}>Open in a new window</Button>
  <Button style={buttonGroupLook().item("vertical", "last")}>Reveal in the file manager</Button>
</ButtonGroup>
```

### A word and a divider

`ButtonGroupText` is a word inside the group on the muted fill — a path, a unit, a count — and
`ButtonGroupSeparator` is the hairline between it and what follows. The separator turns with the
group: down a row, across a column. Join the word as a button would be joined; the separator needs
no join, and is hidden from a reader (it is the group's own hairline).

```tsx
<ButtonGroup>
  <ButtonGroupText style={buttonGroupLook().item("horizontal", "first")}>Path</ButtonGroupText>
  <ButtonGroupSeparator />
  <Button variant="secondary" style={buttonGroupLook().item("horizontal", "last")}>
    Copy
  </Button>
</ButtonGroup>
```

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on all three parts;
`style` goes over the look's on each.

| Part                   | Props                                                                | Description                                                                                                  |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ButtonGroup`          | `orientation`: `"horizontal" \| "vertical"` (default `"horizontal"`) | Buttons joined into one control, in a row or a column: `buttonGroupLook().root(orientation)`.                |
| `ButtonGroupText`      | —                                                                    | A word inside the group on the muted fill, joined as a button would be joined: `.textFrame()` and `.text()`. |
| `ButtonGroupSeparator` | —                                                                    | The separator's own, turned to the group's orientation; hidden from a reader.                                |

| Prop          | Type                         | Default      |
| ------------- | ---------------------------- | ------------ |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` |

`buttonGroupLook()` is exported for a group the app lays out itself: `root(orientation)` the group,
`item(orientation, position)` the join each button wears, `textFrame()` and `text()` the word's box
and its type.
