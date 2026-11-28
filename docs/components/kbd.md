# Kbd (/docs/components/kbd)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add kbd
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Kbd } from "shadcn-nsh/kbd";
```

## Usage [#usage]

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd";
```

```tsx
<Kbd>⌘</Kbd>
```

## Composition [#composition]

Use the following composition to build a `Kbd`:

```text
Kbd

KbdGroup
├── Kbd
└── Kbd
```

## Examples [#examples]

### A group of keys [#a-group-of-keys]

`KbdGroup` puts keys side by side, a small gap apart; `Kbd` is one cap — a modifier, a letter, a
word (`Esc`, `Ctrl`).

```tsx
<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>⇧</Kbd>
  <Kbd>⌥</Kbd>
  <Kbd>⌃</Kbd>
</KbdGroup>
```

### In a sentence [#in-a-sentence]

A cap is a view, not a span of a paragraph: in running text the sentence is a row of `Text` and
`KbdGroup`, wrapping together.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
  <Text>Press</Text>
  <KbdGroup>
    <Kbd>Ctrl</Kbd>
    <Kbd>B</Kbd>
  </KbdGroup>
  <Text>to open the sidebar.</Text>
</View>
```

### Beside a button's label [#beside-a-buttons-label]

A key cap in a button says what its shortcut is; the label is the button's own type
(`buttonLabel`), the caps are the keys.

```tsx
<Button variant="secondary">
  <Text style={buttonLabel("secondary")}>Search</Text>
  <KbdGroup>
    <Kbd>⌘</Kbd>
    <Kbd>K</Kbd>
  </KbdGroup>
</Button>
```

### The terminal [#the-terminal]

A terminal draws no cap: a key is its name in the monospaced face, one Cell row high, with no fill
and no edge.

```tsx
<Kbd>Esc</Kbd>
```

## API [#api]

| Part       | Props                                                      | Description         |
| ---------- | ---------------------------------------------------------- | ------------------- |
| `Kbd`      | `children`: `string \| JSX.Element`; every `nsh` View prop | A key of a shortcut |
| `KbdGroup` | every `nsh` View prop                                      | Keys side by side   |

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on both parts (`style`, `accessibilityLabel`, …); `style` goes over the look's.

| Prop       | Type                    | Default |
| ---------- | ----------------------- | ------- |
| `children` | `string \| JSX.Element` |         |

A `Kbd` is one line high with a minimum width (20 points with a pointer, one Cell row in the
terminal), a hairline edge and the `muted` fill; its name is small type in the muted ink. There is
no axis. A key is one cap; a group is those caps in a row.