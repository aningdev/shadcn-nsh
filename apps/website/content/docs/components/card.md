---
title: Card
description: "A flat surface that groups related content: a header with its action, a body and a footer."
component: true
demo: card
---

## Installation

```npm
npx shadcn-nsh@latest add card
```

## Usage

```tsx
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
```

```tsx
<Card>
  <CardHeader>
    <CardTitle>Login to your account</CardTitle>
    <CardDescription>Enter your email below to login to your account.</CardDescription>
    <CardAction>
      <Button variant="ghost">Sign up</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <Input placeholder="m@example.com" />
  </CardContent>
  <CardFooter>
    <Button>Login</Button>
  </CardFooter>
</Card>
```

## Composition

Use the following composition to build a `Card`:

```text
Card
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter
```

## Examples

### With a form

`CardContent` pads its sides and nothing else: space the fields the way the form needs.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Payment method</CardTitle>
    <CardDescription>All transactions are secure and encrypted.</CardDescription>
  </CardHeader>
  <CardContent>
    <View style={{ gap: 10 }}>
      <Field>
        <FieldLabel>Name on card</FieldLabel>
        <Input placeholder="Evil Rabbit" />
      </Field>
      <Field>
        <FieldLabel>Card number</FieldLabel>
        <Input placeholder="1234 5678 9012 3456" />
      </Field>
    </View>
  </CardContent>
  <CardFooter>
    <Button>Pay</Button>
  </CardFooter>
</Card>
```

### Two side by side

A card takes the width its style gives it; `flexGrow` with `flexBasis` puts two across a window
and one across a phone.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
  <Card style={{ flexGrow: 1, flexBasis: 300 }}>…</Card>
  <Card style={{ flexGrow: 1, flexBasis: 300 }}>…</Card>
</View>
```

### A footer that wraps

`CardFooter` is a row that wraps: a long pair of buttons goes to two lines on a phone rather than
squeezing both.

```tsx
<CardFooter>
  <Button style={{ flexGrow: 1 }}>Login</Button>
  <Button variant="secondary" style={{ flexGrow: 1 }}>
    Google
  </Button>
</CardFooter>
```

### Flush

`flush` on `CardContent` drops the side padding and pulls the body through the card's bottom padding, so a picture meets the rim. The card's `overflow: hidden` clips it to the radius. The header stays padded. Off in the terminal.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Cover</CardTitle>
  </CardHeader>
  <CardContent flush>
    <View style={{ height: 160, backgroundColor: "var(--inset)" }} />
  </CardContent>
</Card>
```

## API

Each part is the `nsh` element it is drawn with, wearing the look `cardLook()` gives it. Every
view prop passes through; `style` goes over the look's.

| Part              | Props   | Description                                                                             |
| ----------------- | ------- | --------------------------------------------------------------------------------------- |
| `Card`            | —       | The flat surface holding related content: `cardLook().card`.                            |
| `CardHeader`      | —       | Title over description in the first column, the action at the trailing edge: `.header`. |
| `CardTitle`       | —       | A step larger than body, semibold, the text colour: `.title`.                           |
| `CardDescription` | —       | Body size in the muted colour: `.description`.                                          |
| `CardAction`      | —       | The control at the trailing edge, beside title and description: `.action`.              |
| `CardContent`     | `flush` | What the card is about. `flush` meets the card's side and bottom edges: `.content`.     |
| `CardFooter`      | —       | A wrapping row, centred, 8 apart: `.footer`.                                            |

`CardTitle` and `CardDescription` are `Text`, so they take text props (`numberOfLines`, `role`).
`CardHeader` is a grid of two columns: the title over the description in the first and the action
at the trailing edge of the first row, whichever order the three are written in.
`cardLook()` is exported for a card the app draws itself.
