# Pressable (/dev/docs/components/pressable)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add pressable
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Pressable } from "shadcn-nsh/pressable";
```

## Usage [#usage]

```tsx
import { Pressable } from "@/components/ui/pressable";
```

```tsx
<Pressable onPress={open}>Open the note</Pressable>
```

## Examples [#examples]

### Disabled [#disabled]

```tsx
<Pressable disabled onPress={open}>
  Open the note
</Pressable>
```

### A region with its own look [#a-region-with-its-own-look]

`Pressable` draws nothing of its own: no fill, no padding, no height. It is its content, and a `style` adds whatever geometry the region needs. The theme's lightest hover fill, the press's sink and the keyboard's ring are the whole of its look.

```tsx
<Pressable
  accessibilityLabel="Comment from Ada"
  onPress={open}
  style={{ padding: 10, borderRadius: 10, backgroundColor: surface() }}
>
  <Item>…</Item>
</Pressable>
```

### A picture [#a-picture]

```tsx
<Pressable accessibilityLabel="Photo of the launch site" onPress={enlarge}>
  <Image src={photo} style={{ width: "100%", height: 132, objectFit: "cover" }} />
</Pressable>
```

### A stretch of text [#a-stretch-of-text]

A string child is plain text, and its text is the region's name for screen readers unless `accessibilityLabel` says otherwise. Children drawn as given are named by the texts inside them; one that draws no text needs an `accessibilityLabel` (the icon-only case is an `IconButton`, where it is required). `accessibilityHint` says what a press does, read after the name.

```tsx
<Pressable onPress={read}>A whole paragraph can be the region.</Pressable>
```

### The role it reads as [#the-role-it-reads-as]

A region says what it is with `role` (`role="button"` is the default, `role="link"`, `role="tab"`, …): that is NSH's own name for it, and React Native's `accessibilityRole` is not it. What a region _is_ — a link, a key in a toolbar — is the `role`; its state is `selected` and `disabled`, the base button's own props, which screen readers say. There is no `accessibilityState` prop: React Native's state names are not NSH's.

A pressable is not an on / off control: `role="switch"` does not make one a switch, and it has no
`checked` — its state is `selected`. For a setting, use `Switch`, which owns the switch role and
its value for screen readers — either the whole row (the switch's children are its label, so a tap
anywhere toggles it) or a `Field` with the switch at the end of the row. See [`Switch`](./switch).

```tsx
{
  /* Not this: a region that reads as a selected button, not as a switch. */
}
<Pressable selected={on()} onPress={toggle}>
  Extract text from images
</Pressable>;

{
  /* This: the control that is on or off, and its name. */
}
<Switch
  accessibilityLabel="Extract text from images"
  checked={on()}
  onChange={({ checked }) => on.set(checked)}
/>;
```

### Press scale [#press-scale]

A press sinks a pressable to 98%. `scale` is that much and nothing else: `0.8` for a dot that gives under a thumb, `1` for a row that should not move. Nothing sinks with reduced motion, or in a theme that draws no press (`press.scale` of 1).

```tsx
<Pressable scale={0.8} hitSlop={30} accessibilityLabel="Tiny dot" onPress={tap} />
<Pressable scale={1} onPress={open}>
  A row that stays put
</Pressable>
```

### The look alone [#the-look-alone]

The look is a function, for a `nsh/base` control of your own. Its `shape.control` corners shape the focus ring; a `style` with its own radius moves the ring with it.

```tsx
<Button {...pressableLook()}>Open the note</Button>
<Button {...pressableLook({ style: { padding: 12 } })}>Open the note</Button>
```

## API [#api]

Every prop of [`nsh/base` Button](https://nsh.dev/elements/button) passes through (`onPress`, `disabled`, `selected`, `role`, `hitSlop`, `accessibilityLabel`, `accessibilityHint`, …). `style`, `hoverStyle`, `activeStyle` and `focusVisibleStyle` go over the look's. `scale` is the sink of a press.

| Part        | Props                                | Description                                                                       |
| ----------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| `Pressable` | `children` (`string \| JSX.Element`) | One look — the hover, the sink and the ring — and its appearance is its content's |

There is no axis: a pressable has one look — the hover, the sink and the ring — and its appearance
is its content's. `pressableLook` takes `disabled` (no hover or press feedback), `scale` (how far a
press sinks it) and `style` (geometry over the look's), and is what the reference page spreads on
`nsh/base`'s Button.