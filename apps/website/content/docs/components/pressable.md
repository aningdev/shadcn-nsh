---
title: Pressable
description: A region that takes presses and adds only their feedback.
component: true
demo: pressable
---

## Installation

```npm
npx shadcn-nsh@latest add pressable
```

## Usage

```tsx
import { Pressable } from "@/components/ui/pressable";
```

```tsx
<Pressable onPress={open}>Open the note</Pressable>
```

## Examples

### Disabled

```tsx
<Pressable disabled onPress={open}>
  Open the note
</Pressable>
```

### A region with its own look

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

### A picture

```tsx
<Pressable accessibilityLabel="Photo of the launch site" onPress={enlarge}>
  <Image src={photo} style={{ width: "100%", height: 132, objectFit: "cover" }} />
</Pressable>
```

### A stretch of text

A string child is plain text, and its text is the region's name for screen readers unless `accessibilityLabel` says otherwise. Children drawn as given are named by the texts inside them; one that draws no text needs an `accessibilityLabel` (the icon-only case is an `IconButton`, where it is required).

```tsx
<Pressable onPress={read}>A whole paragraph can be the region.</Pressable>
```

### The role it reads as

A region says what it is with `role` (`role="button"` is the default, `role="link"`, `role="tab"`, …): that is NSH's own name for it, and React Native's `accessibilityRole` is not it. What a region _is_ — a link, a key in a toolbar — is the `role`; its state is `selected` and `disabled`, the base button's own props, which screen readers say. There is no `accessibilityState` prop: React Native's state names are not NSH's.

A pressable is not an on / off control, and it has no `checked`: no prop makes one a switch, and a region that looks like one still reads as a button. For a setting, use `Switch`, which owns the switch role and its value for screen readers — either the whole row (the switch's children are its label, so a tap anywhere toggles it) or shadcn's `Field` with the switch at the end of the row. See [`Switch`](./switch).

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

### Press scale

A press sinks a pressable to 98%. `scale` is that much and nothing else: `0.8` for a dot that gives under a thumb, `1` for a row that should not move. Nothing sinks with reduced motion, or in a theme that draws no press (`press.scale` of 1).

```tsx
<Pressable scale={0.8} hitSlop={30} accessibilityLabel="Tiny dot" onPress={tap} />
<Pressable scale={1} onPress={open}>
  A row that stays put
</Pressable>
```

### The look alone

The look is a function, for a `nsh/base` control of your own. Its `radius.control` corners shape the focus ring; a `style` with its own radius moves the ring with it.

```tsx
<Button {...pressableLook()}>Open the note</Button>
<Button {...pressableLook({ style: { padding: 12 } })}>Open the note</Button>
```

## Differences from shadcn/ui

- shadcn's `Button` has no press motion; `scale` is NSH's (`Press`'s own prop), and the sink is
  98% unless it says otherwise (`pressSink`).
- A hint beside the name (shadcn's `aria-describedby`) has no prop here: `nsh/base`'s Button takes
  no `accessibilityHint` (its `ButtonProps` has `accessibility_label`, `role`, `hit_slop`,
  `disabled`, `selected` — `nsh-base/src/button.rs`), so `Pressable` cannot pass one on. A row
  that needs a hint is a `View` with `accessible`, `role="button"`, `accessibilityLabel`,
  `accessibilityHint` and the look spread on it:

  ```tsx
  <View
    accessible
    role="button"
    accessibilityLabel={item.label}
    accessibilityHint={item.hint}
    onPress={open}
    {...pressableLook()}
  >
    <Row>…</Row>
  </View>
  ```

  The hint is the base's gap to close, not the look's.

## API

Every prop of [`nsh/base` Button](https://nsh.dev/elements/button) passes through (`onPress`, `disabled`, `selected`, `role`, `hitSlop`, …). `style`, `hoverStyle`, `activeStyle` and `focusVisibleStyle` go over the look's. `scale` is the sink of a press.

| Part        | Props                                | Description                                                                       |
| ----------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| `Pressable` | `children` (`string \| JSX.Element`) | One look — the hover, the sink and the ring — and its appearance is its content's |

There is no axis: a pressable has one look — the hover, the sink and the ring — and its appearance is its content's. `pressableLook` takes `disabled` (no hover or press feedback), `scale` (how far a press sinks it) and `style` (geometry over the look's), and is what the reference page spreads on `nsh/base`'s Button.
