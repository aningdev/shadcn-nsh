---
title: Toolbar
description: An inset track of tools, with groups and hairline separators.
component: true
demo: toolbar
---

## Installation

```npm
npx shadcn-nsh@latest add toolbar
```

## Usage

```tsx
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
```

```tsx
<Toolbar accessibilityLabel="Formatting">
  <ToolbarGroup>
    <Toggle pressed={bold()}>B</Toggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <Toggle pressed={align() === "left"}>L</Toggle>
  </ToolbarGroup>
</Toolbar>
```

## Composition

Use the following composition to build a `Toolbar`:

```text
Toolbar
├── ToolbarGroup
└── ToolbarSeparator
```

## Examples

### Disabled

`disabled` on a `Toolbar` locks the whole bar: no item takes a press, the arrows skip it and it is
one disabled toolbar to screen readers. `disabled` on a `ToolbarGroup` locks that run alone, the
rest of the bar still reached. Every item the bar knows locks — a `Button`, a `Toggle`, a `Link`,
a menu's or popover's trigger — because the base bar hands its lock down to each
(`nsh-base/src/toolbar.rs`, "items"). A control that is not a bar item keeps its own `disabled`
and its own behavior inside a locked bar: a `Command` palette, a text field.

```tsx
<Toolbar accessibilityLabel="Formatting" disabled>
  <ToolbarGroup>
    <Toggle pressed={bold()}>B</Toggle>
    <Toggle pressed={italic()}>I</Toggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <Button variant="ghost">Undo</Button>
</Toolbar>
```

### Vertical

```tsx
<Toolbar axis="vertical" accessibilityLabel="Tools">
  <Toggle pressed={tool() === "pen"}>✎</Toggle>
</Toolbar>
```

### The look alone

```tsx
import { Toolbar, ToolbarSeparator, toolbarRule } from "@/components/ui/toolbar";
import { toolbarTrack } from "@/lib/tool";

<Toolbar style={toolbarTrack()}>
  <ToolbarSeparator style={toolbarRule()} />
</Toolbar>;
```

### A formatting bar

The bar a text editor puts over the text it formats: history, the block, the marks, the alignment,
a hairline between the runs. Undo and Redo are `Button`s that gray out at the ends of the history;
the marks a `ToggleGroup`; the alignment `Toggle`s that only ever set. The block is a `Menu` whose
**trigger is one of the bar's items** — a `View` inside `MenuTrigger`, which `nsh/base` hands the
press, the focus and the expanded state, so the arrow keys reach it like any other tool and Space or
Return opens it. Give that view `role="button"`, a name and `accessibilityState` and it reads like
the menu button it is. The menu's rows are `MenuRadioItem`s: one block is chosen at a time.

```tsx
const doc = signal({ marks: ["bold"], align: "left", block: "Paragraph" });
const past = signal([]);
const future = signal([]);
const commit = (next, what) => {
  past.set([...past(), doc()].slice(-20));
  future.set([]);
  doc.set({ ...doc(), ...next });
};

<Toolbar accessibilityLabel="Formatting" style={toolbarTrack()}>
  <ToolbarGroup accessibilityLabel="History">
    <Button variant="ghost" accessibilityLabel="Undo" disabled={past().length === 0} onPress={undo}>
      <Icon icon={Undo2} />
    </Button>
    <Button
      variant="ghost"
      accessibilityLabel="Redo"
      disabled={future().length === 0}
      onPress={redo}
    >
      <Icon icon={Redo2} />
    </Button>
  </ToolbarGroup>
  <ToolbarSeparator style={toolbarRule()} />
  <Menu>
    <MenuTrigger>
      <View
        role="button"
        accessibilityLabel={`Block: ${doc().block}`}
        accessibilityState={{ expanded: open() }}
        {...toggleLook({ on: open, text: true })}
      >
        <Text style={toggleLabel(open)}>{doc().block}</Text>
        <Text>▾</Text>
      </View>
    </MenuTrigger>
    <MenuContent>
      {BLOCKS.map((block) => (
        <MenuRadioItem checked={doc().block === block} onSelect={() => commit({ block })}>
          {block}
        </MenuRadioItem>
      ))}
    </MenuContent>
  </Menu>
  <ToolbarSeparator style={toolbarRule()} />
  <ToggleGroup inset={false}>
    {MARKS.map((mark) => (
      <Toggle
        pressed={doc().marks.includes(mark)}
        accessibilityLabel={mark}
        onChange={({ pressed }) => commit({ marks: withMark(mark, pressed) })}
      >
        {mark}
      </Toggle>
    ))}
  </ToggleGroup>
  <ToolbarSeparator style={toolbarRule()} />
  <ToolbarGroup accessibilityLabel="Alignment" style={{ gap: 2 }}>
    {ALIGNS.map((align) => (
      <Toggle
        pressed={doc().align === align}
        accessibilityLabel={align}
        onChange={({ pressed }) => {
          if (pressed) commit({ align });
        }}
      >
        {align}
      </Toggle>
    ))}
  </ToolbarGroup>
</Toolbar>;
```

## API

Every prop of [`nsh/base` Toolbar](https://nsh.dev/elements/toolbar), `ToolbarGroup` and `ToolbarSeparator` passes through. `style` goes over the look's. Items keep their own look (`Button`, `Toggle`, …).

| Part               | Props                                     | Description                                                                    |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `Toolbar`          | `axis`, and every `nsh/base` Toolbar prop | The bar: one toolbar for screen readers, arrow keys along `axis`, on the track |
| `ToolbarGroup`     | every `nsh/base` ToolbarGroup prop        | A named run of items; its direction follows the bar                            |
| `ToolbarSeparator` | every `nsh/base` ToolbarSeparator prop    | The hairline between runs, never a tab stop                                    |

`toolbarTrack({ vertical })` (`@/lib/tool`) and `toolbarRule(vertical)` are the look, for a bar of your own.
