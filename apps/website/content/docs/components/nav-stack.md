---
title: NavStack
description: Pages pushed on a stack — the system header on a phone, the app's own themed header on a desktop.
component: true
demo: nav-stack
---

## Installation

```npm
npx shadcn-nsh@latest add nav-stack
```

## Usage

```tsx
import { createNavStack, NavPage, NavStack } from "@/components/ui/nav-stack";
```

```tsx
type Route = { id: "settings" } | { id: "general" };

const nav = createNavStack<Route>([{ id: "settings" }]);

<NavStack state={nav}>
  {(route) => (
    <NavPage title={route.id === "settings" ? "Settings" : "General"}>{/* the page */}</NavPage>
  )}
</NavStack>;
```

## Composition

Use the following composition to build a `NavStack`:

```text
NavStack
└── NavPage
```

## Examples

shadcn/ui has no navigation stack, and no page of its own; the behavior is NSH's
[`NavStack`](https://nsh.dev/elements/nav-stack) — the pages, the transitions, the back gestures
and the pages kept mounted with their state. This component is that stack and its pages, plus the
header a page shows on the desktops and the web, where NSH draws none.

### The stack and its routes

`createNavStack` is `nsh/base`'s, re-exported so a page's navigation is one import; the routes are
its state, and `routes` is an accessor, so what reads it follows a push or a pop.

```tsx
const nav = createNavStack<Route>([{ id: "settings" }]);

nav.push({ id: "general" }); // a page on top of the one shown
nav.pop(); // and back; the first page stays
nav.popToRoot(); // to the bottom in one step
nav.replace({ id: "general" }); // the top page becomes another

<Text>{() => `depth ${nav.routes().length}`}</Text>;
```

`setRoutes` swaps the whole list — a route that stays keeps its page and its state — and `remove`
takes the topmost page of a route out. `onChange` reports the routes after a page is added.

### The header on a desktop

A page's `title` is the system header's on iOS and Android, and on the desktops and the web — which
have no system header — it is the one `NavPage` draws: 48 points with a pointer (52 on a touch
screen), on the page's fill, a hairline under it, the title `navPageSize.title` points semibold and
the room between the back button and the trailing slot. It takes the roles the theme keeps for a
header wherever it comes from (`header.headerStyle`: the page's fill, the text color, the accent for
the back button's tint).

```tsx
<NavPage
  title="General"
  headerRight={
    <Button variant="ghost" size="sm" onPress={reset}>
      Reset
    </Button>
  }
>
  {/* the page */}
</NavPage>
```

`headerRight` is the system header's trailing item, and this header's: on a desktop it is where the
page's own action goes, drawn as given. A page with nothing to put in the header — its stack's first
one, no title, no trailing action — shows none, and its content starts at the top.

### The back button

The header's back button appears while there is a page below it, on the leading edge: this library's
ghost `IconButton` with a `ChevronLeft`, named "Back". It does what a platform's back does — calls
`onBackPress`, then pops unless `popOnBack` is `false`:

```tsx
<NavPage
  title="Appearance"
  popOnBack={false}
  onBackPress={askToDiscard} // the press is reported either way
>
  {/* … */}
</NavPage>
```

The platform's own back works beside it: Escape, Alt+Left, the mouse's back button and the browser's
back on the desktops, the swipe on iOS and predictive back on Android. `nsh/base` takes those, calls
`onBackPress`, and removes the route from the stack's state, so `routes()` follows without the app
doing anything.

### Your own header

`header` is `nsh/base`'s slot: give one and `NavPage` draws that instead, as wide as the page and as
tall as it lays out, with the content below it. `navPageLook()` has the words to build one that
matches — `header()`, `title()`, `backGlyph()` and `page()`.

```tsx
<NavPage title="General" header={(page) => <MyTitleBar page={page} title="General" />}>
  {/* the page */}
</NavPage>
```

A header of the app's own still answers Back, and knows where in the stack it is: `header` takes a
function of the page, which is handed the slot the drawn header reads. `back()` is what that header's
back button does — `onBackPress`, then `pop()` unless `popOnBack` is `false`; `pages()` is how many
routes the stack holds, so a header can show a back button only when there is one to go to.

```tsx
import type { NavPageSlot } from "@/components/ui/nav-stack";

function MyTitleBar(props: { page: NavPageSlot; title: string }) {
  const page = props.page;
  return (
    <View style={navPageLook().header()}>
      <If when={page.pages() > 1}>
        <IconButton accessibilityLabel="Back" onPress={() => page.back()}>
          <Icon icon={ChevronLeft} {...navPageLook().backGlyph()} />
        </IconButton>
      </If>
      <Text style={navPageLook().title()}>{props.title}</Text>
    </View>
  );
}
```

It is a function, not a bare element, because `nsh/base` mounts the header in the page's own header
host: what the page provides around its content does not reach there, so an element passed as
`header` could not read the page it heads.

### On a phone

iOS shows `UINavigationController`'s header and Android its toolbar, with the system's transitions,
the swipe back and predictive back; this component draws nothing of the header there, and `title`,
`headerLeft`, `headerRight`, `headerStyle`, `headerLargeTitle`, `hidesBottomBarWhenPushed` and
`statusBar` are the platform's. The header does not follow the theme unless the app says so: pass
`headerStyle={header.headerStyle}` from `@shadcn-nsh/theme` for the page's fill, the text color and
the accent, which is what the desktop header wears already.

### A large title

On iOS `headerLargeTitle` is the platform's: a large title in the content that shrinks into the bar
as the page scrolls. The desktops and the web have no such header, so the page draws one: the large
title is the first thing in the `Scroll`, and a header of the app's own keeps the small title in the
bar once the large one has scrolled past.

```tsx
const offset = signal(0);

<NavPage
  title="Library"
  header={() => (
    <View style={navPageLook().header()}>
      <IconButton accessibilityLabel="Back" onPress={() => nav.pop()}>
        <Icon icon={ChevronLeft} {...navPageLook().backGlyph()} />
      </IconButton>
      <Text style={navPageLook().title()}>{() => (offset() > 40 ? "Library" : "")}</Text>
    </View>
  )}
>
  <Scroll onScroll={(event) => offset.set(Math.round(event.offset.y))}>
    <Text style={{ fontSize: 34, fontWeight: "700" }}>Library</Text>
    <Text style={{ color: colors.mutedForeground }}>24 titles · synced today</Text>
    {/* the list */}
  </Scroll>
</NavPage>;
```

The header keeps its height and only its title changes, so the content starts under the bar at every
offset — which is what the platform's large title does there too. The header is a function so the
page closes its own offset over it, and the title's child is an accessor, so the title re-reads the
offset as the page moves.

### Asking before leaving

`popOnBack` says whether the back button pops; `onBackPress` hears every back — the header's button
and the platform's (Escape, Alt+Left, the mouse's back button, the swipe). A page with unsaved text
turns the first off, asks in an alert, and pops only when the answer discards:

```tsx
const draft = signal("");
const ask = signal(false);

<NavPage
  title="A draft"
  popOnBack={draft().length === 0}
  onBackPress={() => {
    if (draft().length > 0) ask.set(true);
  }}
>
  <Input value={draft()} onChange={({ value }) => draft.set(value)} />
</NavPage>;

<AlertDialog
  open={ask()}
  onOpenChange={({ open }) => ask.set(open)}
  onAction={({ action }) => {
    ask.set(false);
    if (action === "discard") nav.pop();
  }}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
      <AlertDialogDescription>The draft is not saved.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction id="keep" role="cancel">
        Keep editing
      </AlertDialogAction>
      <AlertDialogAction id="discard" role="destructive">
        Discard
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

With nothing to lose (`popOnBack` true) the same back press pops without the alert, so the guard
disappears the moment the text does.

## API

`NavStack` and `NavPage` take every prop of
[`nsh/base`'s NavStack and NavPage](https://nsh.dev/elements/nav-stack); `style` goes over the look's. `createNavStack`,
`NavStackState` and `NavStackChangeEvent` are `nsh/base`'s, re-exported.

| Part             | Props                                                                  | Description                                                                          |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `NavStack`       | `state`, `children`, `onChange`                                        | `state` from `createNavStack`; `children(route, index)`; `onChange({ routes })`      |
| `NavPage`        | `title`, `headerRight`, `header`, `onBackPress`, `popOnBack`           | The page's header on the desktops and the web; `header` takes a function of the page |
| `createNavStack` | `routes`, `push`, `pop`, `popToRoot`, `replace`, `setRoutes`, `remove` | `nsh/base`'s, re-exported                                                            |

The looks — spread them on the views they name, or read their words for content of your own:
`navStackLook()` (`root`) and `navPageLook()` (`page`, `header`, `title`, `backGlyph`).
`navPageSize` has the header's numbers.
