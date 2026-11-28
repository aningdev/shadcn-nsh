# Separator (/dev/docs/components/separator)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add separator
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Separator } from "shadcn-nsh/separator";
```

## Usage [#usage]

```tsx
import { Separator } from "@/components/ui/separator";
```

```tsx
<Separator />
```

## Examples [#examples]

### Orientation [#orientation]

`horizontal` (the default) runs across its container, one point thick; `vertical` runs down it and
is as tall as its row, so the row has to have a height (its own, or one its content gives it).

```tsx
<Separator orientation="horizontal" />
<View style={{ flexDirection: "row", alignItems: "center", gap: 12, height: 20 }}>
  <Text>Blog</Text>
  <Separator orientation="vertical" />
  <Text>Docs</Text>
</View>
```

### Space around it [#space-around-it]

The separator is the line and nothing else: the room above and below it is the caller's.

```tsx
<Separator style={{ marginVertical: 12 }} />
```

### Decorative or not [#decorative-or-not]

A separator is usually a line of the layout: `decorative` is `true` by default, and a screen reader
walks from one group of content to the next without stopping on it. `decorative={false}` keeps it
in the accessibility tree, as a `role="group"` (`nsh` has no `separator` role — the nearest is a
boundary between groups); give it an `accessibilityLabel` saying what it divides.

```tsx
<Separator decorative={false} accessibilityLabel="End of the account settings" />
```

## API [#api]

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through (`style`, `role`,
`accessibilityLabel`, …); `style` goes over the look's.

| Part        | Props                                                                                                          | Description                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `Separator` | `orientation` (`"horizontal" \| "vertical"`, default `"horizontal"`), `decorative` (`boolean`, default `true`) | The line is one point of the theme's edge color |

The line is one point of the theme's edge color (`colors.border`, `theme.json`'s `border`), with
no other look: a corner is the caller's `style`, and so is its room.