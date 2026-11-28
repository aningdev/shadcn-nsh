# Toolbar (/docs/components/toolbar)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add toolbar
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Toolbar } from "shadcn-nsh/toolbar";
```

## Usage [#usage]

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

## Composition [#composition]

Use the following composition to build a `Toolbar`:

```text
Toolbar
├── ToolbarGroup
│   └── ToolbarButton
├── ToolbarButton
├── ToolbarSeparator
└── ToolbarOverflow
```

## Examples [#examples]

### Disabled [#disabled]

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

### Vertical [#vertical]

```tsx
<Toolbar axis="vertical" accessibilityLabel="Tools">
  <Toggle pressed={tool() === "pen"}>✎</Toggle>
</Toolbar>
```

### The look alone [#the-look-alone]

```tsx
import { Toolbar, ToolbarSeparator, toolbarRule } from "@/components/ui/toolbar";
import { toolbarTrack } from "@/lib/ui/tool";

<Toolbar style={toolbarTrack()}>
  <ToolbarSeparator style={toolbarRule()} />
</Toolbar>;
```

### A formatting bar [#a-formatting-bar]

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
    <Button
      variant="ghost"
      icon={Undo2}
      accessibilityLabel="Undo"
      disabled={past().length === 0}
      onPress={undo}
    />
    <Button
      variant="ghost"
      icon={Redo2}
      accessibilityLabel="Redo"
      disabled={future().length === 0}
      onPress={redo}
    />
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
        <Text style={toggleLabel(open)}>▾</Text>
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

### Overflow [#overflow]

Add `ToolbarOverflow` and wrap foldable tools in `ToolbarButton` so the bar measures each item with
`onLayout` and folds lower-priority tools into the `"⋯"` menu as the bar narrows. Give a
`ToolbarGroup` `fold="unit"` (the default) to fold the whole group together under its
`accessibilityLabel`, or `fold="none"` to let its `ToolbarButton`s fold individually by their own
`priority`. The bar draws the hairline rules between visible units and hides until its initial
measurements arrive.

```tsx
import { MenuCheckboxItem, MenuItem, MenuRadioItem } from "@/components/ui/menu";
import { Toolbar, ToolbarGroup, ToolbarButton, ToolbarOverflow } from "@/components/ui/toolbar";

<Toolbar accessibilityLabel="Formatting" style={{ alignSelf: "stretch" }}>
  <ToolbarGroup accessibilityLabel="History" fold="none">
    <ToolbarButton
      priority={4}
      menu={
        <MenuItem disabled={past().length === 0} onSelect={undo}>
          Undo
        </MenuItem>
      }
    >
      <Button
        variant="ghost"
        icon={Undo2}
        accessibilityLabel="Undo"
        disabled={past().length === 0}
        onPress={undo}
      />
    </ToolbarButton>
    <ToolbarButton
      priority={3}
      menu={
        <MenuItem disabled={future().length === 0} onSelect={redo}>
          Redo
        </MenuItem>
      }
    >
      <Button
        variant="ghost"
        icon={Redo2}
        accessibilityLabel="Redo"
        disabled={future().length === 0}
        onPress={redo}
      />
    </ToolbarButton>
  </ToolbarGroup>
  <ToolbarGroup accessibilityLabel="Marks" fold="none">
    {MARKS.map((mark) => (
      <ToolbarButton
        foldable={mark !== "bold"}
        priority={mark === "italic" ? 5 : 1}
        menu={
          <MenuCheckboxItem checked={has(mark)} onSelect={() => toggle(mark)}>
            {mark}
          </MenuCheckboxItem>
        }
      >
        <Toggle pressed={has(mark)} accessibilityLabel={mark} onChange={() => toggle(mark)}>
          {mark}
        </Toggle>
      </ToolbarButton>
    ))}
  </ToolbarGroup>
  <ToolbarGroup accessibilityLabel="Alignment" priority={2} fold="unit">
    {ALIGNS.map((align) => (
      <ToolbarButton
        menu={
          <MenuRadioItem checked={doc().align === align} onSelect={() => setAlign(align)}>
            {align}
          </MenuRadioItem>
        }
      >
        <Toggle
          pressed={doc().align === align}
          accessibilityLabel={align}
          onChange={() => setAlign(align)}
        >
          {align}
        </Toggle>
      </ToolbarButton>
    ))}
  </ToolbarGroup>
  <ToolbarOverflow accessibilityLabel="More formatting">
    <MenuItem onSelect={clear}>Clear formatting</MenuItem>
  </ToolbarOverflow>
</Toolbar>;
```

## API [#api]

Every prop of [`nsh/base` Toolbar](https://nsh.dev/elements/toolbar), `ToolbarGroup` and `ToolbarSeparator` passes through. `style` goes over the look's. Items keep their own look (`Button`, `Toggle`, …).

| Part               | Props                                                                                                                                         | Description                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Toolbar`          | `axis`, and every `nsh/base` Toolbar prop                                                                                                     | The bar: one toolbar for screen readers, arrow keys along `axis`, on the track                                                                 |
| `ToolbarGroup`     | `priority`, `fold` (`"unit" \| "none"`), and every `nsh/base` ToolbarGroup prop                                                               | A named run of items; its direction follows the bar, and with `ToolbarOverflow` it folds as one unit or per item                               |
| `ToolbarSeparator` | every `nsh/base` ToolbarSeparator prop                                                                                                        | The hairline between runs, never a tab stop (omitted when `ToolbarOverflow` manages the rules between visible units)                           |
| `ToolbarButton`    | `menu`, `priority`, `foldable`, `class`, `style`                                                                                              | Wraps one tool so a bar with `ToolbarOverflow` can measure its width and fold it into `"⋯"` when space runs out                                |
| `ToolbarOverflow`  | `accessibilityLabel`, `label`, `open`, `defaultOpen`, `onOpenChange`, `tooltip`, `disabled`, `align`, `offset`, `margin`, `style`, `children` | The `"⋯"` trigger and menu showing folded tools in bar order (grouped under each `ToolbarGroup`'s `accessibilityLabel`), before any `children` |

A bar without `ToolbarOverflow` behaves identically to a static bar. In a bar with `ToolbarOverflow`
on a horizontal non-terminal surface, unmeasured items stay visible rather than blocking folding.
Because `nsh/base`'s `Button`, `Toggle` and `Link` do not forward `onFocus`/`onBlur`, `Toolbar` does
not expose `onFocusIn`/`onFocusOut`, and `nsh/base`'s roving focus marks non-stop items
`focusable={false}` (`roving.rs`), focus cannot automatically move to `"⋯"` when a focused tool
folds while an earlier tool remains visible.

`toolbarTrack({ vertical })` (`@/lib/ui/tool`) and `toolbarRule(vertical)` are the look, for a bar of your own.