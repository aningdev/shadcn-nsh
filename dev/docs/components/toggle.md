# Toggle (/dev/docs/components/toggle)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add toggle
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Toggle } from "shadcn-nsh/toggle";
```

## Usage [#usage]

```tsx
import { Toggle, ToggleGroup } from "@/components/ui/toggle";
```

```tsx
<Toggle pressed={on()} onChange={({ pressed }) => on.set(pressed)}>
  Bold
</Toggle>
```

## Composition [#composition]

Use the following composition to build a `Toggle`:

```text
Toggle

ToggleGroup
└── Toggle
```

## Examples [#examples]

### Variant [#variant]

```tsx
<Toggle>Bold</Toggle>
<Toggle variant="outline">Bold</Toggle>
```

### Size [#size]

```tsx
<Toggle size="sm">Small</Toggle>
<Toggle size="default">Default</Toggle>
<Toggle size="lg">Large</Toggle>
```

A size is a step of the theme's own scales: its `side` the three heights (`dimension.size.height`),
its `icon` the three icons (`dimension.icon`), its label the `detail`, `body` and `label` type roles.
The NSH Gallery theme's heights are 24 / 28 / 32 points with a pointer and 32 / 40 / 48 on a touch
screen, where a hit slop makes the target 44 points.

### Disabled [#disabled]

`disabled` on a `Toggle` locks that one. `disabled` on a `ToggleGroup` locks every toggle in it —
the base bar hands its lock down, so no child needs its own `disabled`. A disabled toggle takes no
press, leaves the arrow keys' walk and reads as disabled to screen readers; it dims to 50%
(`disabledStyle`).

```tsx
<Toggle disabled>Bold</Toggle>
<ToggleGroup disabled>
  <Toggle pressed={bold()}>B</Toggle>
  <Toggle pressed={italic()}>I</Toggle>
</ToggleGroup>
```

### Group [#group]

A group is one toolbar for screen readers: one stop of the keyboard focus, arrow keys between its toggles. The default wears the inset track.

```tsx
<ToggleGroup>
  <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
    Bold
  </Toggle>
</ToggleGroup>
```

### Vertical [#vertical]

```tsx
<ToggleGroup vertical>
  <Toggle pressed={bold()}>Bold</Toggle>
</ToggleGroup>
```

### Inside a Toolbar [#inside-a-toolbar]

```tsx
import { Toolbar } from "@/components/ui/toolbar";

<Toolbar>
  <ToggleGroup inset={false}>
    <Toggle pressed={bold()}>B</Toggle>
  </ToggleGroup>
</Toolbar>;
```

`inset={false}` skips the track when a parent `Toolbar` already wears it.

### Chips [#chips]

A row of single-select capsules is a recipe, not a part. shadcn/ui has no capsule axis on `ToggleGroup`; where it wants one it puts `rounded-full` on the items. Here the same call-site `style` does it: `inset={false}` drops the track, `gap` spaces the chips, and `borderRadius: 999` makes the capsule. A capsule is geometry, not a theme role (`shape.control` is the corner of a badge), so the radius is the full one. The base group holds no value: the app presses the chip asked for and keeps the chosen one pressed. For a row that scrolls, put the group in a horizontal `Scroll`.

```tsx
<ToggleGroup inset={false} style={{ gap: 8, flexWrap: "wrap", maxWidth: "100%" }}>
  <Toggle
    variant="outline"
    size="lg"
    pressed={chip() === "Orbit"}
    style={{ borderRadius: 999 }}
    onChange={({ pressed }) => pressed && chip.set("Orbit")}
  >
    Orbit
  </Toggle>
</ToggleGroup>
```

### Pressed [#pressed]

```tsx
<Toggle pressed={on()} onChange={({ pressed }) => on.set(pressed)}>
  Bold
</Toggle>
```

### Names for screen readers [#names-for-screen-readers]

A string child is the toggle's name for screen readers, and `accessibilityLabel` wins when it should differ from the visible label. Children drawn as given (an icon and a label of your own) are named by the texts inside them.

### The look alone [#the-look-alone]

The look is a function, for a pressable of your own.

```tsx
<Toggle pressed={on()} {...toggleLook({ text: true })}>
  <Text style={toggleLabel(on, { text: true })}>Bold</Text>
</Toggle>
```

## API [#api]

Every prop of [`nsh/base` Toggle](https://nsh.dev/elements/toggle) and ToggleGroup passes through. `style`, `hoverStyle`, `activeStyle`, `focusVisibleStyle`, `pressedStyle` and `disabledStyle` go over the look's.

| Part          | Props                                                                                               | Description                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Toggle`      | `variant`, `size`, `children`, and every `nsh/base` Toggle prop (`pressed`, `onChange`, `disabled`) | A two-state button; a string child is its name for screen readers        |
| `ToggleGroup` | `vertical`, `inset`, and every `nsh/base` ToggleGroup prop                                          | The inset track of `toolbarTrack` holding a row (or column) of `Toggle`s |

`toggleLook`, `toggleLabel` and `toggleGlyph` are the look's parts, for a pressable of your own.
`toggleSizes` is the table a size reads — `side`, `icon` and `text` from the theme's height, icon and
type scales, its `pad` the toggle's own (compact with a pointer, roomier on a touch screen) — so a
bar's own geometry can match a tool's (`toggleSizes.default.side`).