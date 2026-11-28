# Sheet (/docs/components/sheet)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add sheet
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Sheet } from "shadcn-nsh/sheet";
```

## Usage [#usage]

```tsx
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
```

```tsx
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Sort, price and availability.</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <SheetClose>Done</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## Composition [#composition]

Use the following composition to build a `Sheet`:

```text
Sheet
├── SheetTrigger
└── SheetContent
    ├── SheetHeader
    │   ├── SheetTitle
    │   └── SheetDescription
    ├── SheetClose
    └── SheetFooter
```

## Examples [#examples]

### Side [#side]

```tsx
<SheetContent side="bottom">…</SheetContent>
<SheetContent side="right">…</SheetContent>
```

### Grabber [#grabber]

A bottom sheet has a grabber at its top: `nsh/base`'s own handle, which screen readers adjust to
change the detent and which moves to the next larger one when pressed. It is the handle itself,
not a picture of one, so a sheet never shows two. `grabber`
off shows it; `grabberAccessibilityLabel` names it ("Sheet" by default).

```tsx
<SheetContent side="bottom" grabberAccessibilityLabel="Resize comments">
  …
</SheetContent>
```

The panel's look is `sheetPanel(side)`.

### Detents [#detents]

A bottom sheet can rest at heights instead of fitting its content: `detents` names them (`"medium"`
is half the screen, `"large"` its room), and a drag or a press on the grabber moves between them. Pass
`detent` and `onDetentChange` to own which one it rests at, and leave `closeOnSwipe` on to let a
downward swipe below the smallest close it.

```tsx
const detent = signal<"medium" | "large">("medium");

<SheetContent
  side="bottom"
  detents={["medium", "large"]}
  detent={detent()}
  onDetentChange={({ detent: next }) => detent.set(next === "large" ? "large" : "medium")}
  closeOnSwipe
  footer={
    <SheetFooter>
      <Input
        value={comment()}
        onChange={({ value }) => comment.set(value)}
        placeholder="Add a comment"
        returnKeyType="send"
        onSubmit={send}
        style={{ flex: 1 }}
      />
      <Button variant="default" onPress={send}>
        Send
      </Button>
    </SheetFooter>
  }
  footerStyle={{ borderTopWidth: 1, borderColor: colors.line, paddingTop: 10 }}
>
  {/* the thread: a Scroll that shrinks */}
</SheetContent>;
```

The `footer` stays at the bottom of the part of the panel that shows, at every detent; the smallest
one has to be tall enough to show it. A `Scroll` above it takes what room is left, so the thread
moves under a thumb while the field and its send button stay put.

### A draft the footer applies [#a-draft-the-footer-applies]

A sheet of filters edits a draft, and the footer decides whether the page sees it. Copy the applied
filters in when the sheet opens, keep the draft in the content, and write it back only in the
footer's button; closing any other way throws the draft away.

```tsx
const open = signal(false);
const applied = signal(NONE);
const draft = signal(NONE);

const openFilters = () => {
  draft.set(applied());
  open.set(true);
};

const apply = () => {
  applied.set(draft());
  open.set(false);
};

<Sheet open={open()} onOpenChange={({ open: next }) => open.set(next)}>
  <SheetContent
    side={wide() ? "right" : "bottom"}
    closeOnSwipe
    footer={
      <SheetFooter>
        <Button variant="ghost" disabled={isNone(draft())} onPress={() => draft.set(NONE)}>
          Reset
        </Button>
        <View style={{ flex: 1 }} />
        <Button variant="default" onPress={apply}>
          {`Show ${results(draft())} results`}
        </Button>
      </SheetFooter>
    }
  >
    {/* sort, price and the toggles, each writing the draft */}
  </SheetContent>
</Sheet>;
```

The count in the apply button follows the draft while the page's own count still follows `applied`,
so the difference between "what I am choosing" and "what is on" is visible at every press. `Reset`
clears the draft only; the footer's other button is still what applies it.

## API [#api]

Every prop of [`nsh/base` Sheet](https://nsh.dev/elements/sheet) passes through on `SheetContent`. `popupStyle` and `backdropStyle` go over the look's.

| Part               | Props                                                                                                                                                                                                                  | Description                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SheetHeader`      | `style`                                                                                                                                                                                                                | The heading block: a title and its description, 2 points apart                                                                                                   |
| `SheetFooter`      | `style`                                                                                                                                                                                                                | The actions, in a row 8 points apart                                                                                                                             |
| `SheetTitle`       | `children`, `style`                                                                                                                                                                                                    | The title in `DialogTitle`'s type; a string also names the sheet's dialog for screen readers, unless `SheetContent`'s `accessibilityLabel` says otherwise        |
| `SheetDescription` | `children`, `style`                                                                                                                                                                                                    | The description in `DialogDescription`'s type. `nsh/base`'s sheet has no description prop, so it is read as content                                              |
| `SheetContent`     | `side` (`"bottom" \| "top" \| "left" \| "right"`, default `"bottom"`), `grabber` (on for `side="bottom"`), `grabberAccessibilityLabel`, `detents`, `detent`, `onDetentChange`, `closeOnSwipe`, `footer`, `footerStyle` | Every prop of `nsh/base` Sheet passes through; `popupStyle` and `backdropStyle` go over the look's. `footer` stays at the visible panel's bottom at every detent |