---
layout: ../../../layouts/Docs.astro
title: NavStack
description: Styled navigation stack wrapping nsh/base NavStack and NavPage.
component: true
demo: nav-stack
demoHeight: 320
---

[`nsh/base`](https://nsh.dev/elements/nav-stack) owns the stack, the transitions and the system header on iOS and Android. This package paints the page fill, the system header's colors, and `NavHeader` for the desktops and the web, where base draws no bar.

## Install

```npx tabs
npx shadcn-nsh@latest add nav-stack
```

```bunx tabs
bunx shadcn-nsh@latest add nav-stack
```

```pnx tabs
pnx shadcn-nsh@latest add nav-stack
```

```yarn tabs
yarn dlx shadcn-nsh@latest add nav-stack
```

## Usage

```tsx
import {
  NavHeader,
  NavPage,
  NavStack,
  createNavStack,
} from "@workspace/ui/components/ui/nav-stack";

const nav = createNavStack<string>(["Inbox"]);

<NavStack state={nav} style={{ flex: 1 }}>
  {(page) => (
    <NavPage
      title={page}
      header={
        <NavHeader title={page} onBack={nav.routes().length > 1 ? () => nav.pop() : undefined} />
      }
    >
      {page === "Inbox" ? (
        <Button onPress={() => nav.push("Note")}>Open</Button>
      ) : (
        <Text>{page}</Text>
      )}
    </NavPage>
  )}
</NavStack>;
```

Create the state once, outside the component. `navStackVariants()` returns the fill, the system header colors and the desktop bar.

## Composition

| Part        | Role                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------- |
| `NavStack`  | The stack. `state` from `createNavStack`. Default style is `flex: 1` and `background`       |
| `NavPage`   | One route. `title` is the system header. `header` is the desktop and web slot               |
| `NavHeader` | A 44-point bar for that slot: card fill, a `border` hairline, and Back when `onBack` is set |

On iOS and Android the system header uses `headerStyle` (`card`, `foreground`, `primary` tint). `headerStyle` from the app is spread over those defaults. The system header ignores `header`.

## API

`createNavStack` is re-exported from `nsh/base`. `push`, `pop`, `popToRoot`, `replace`, `setRoutes` and `remove` are unchanged. A native back removes the route from that state; you do not have to drop it yourself.

## Differences

| Topic         | `nsh/base` 0.4.0                                   | This package                       |
| ------------- | -------------------------------------------------- | ---------------------------------- |
| Desktop bar   | Nothing. The `header` slot is the app's            | `NavHeader`. It is not a base part |
| System header | Unstyled until `headerStyle` / `headerClass`       | Theme colors, overridable per key  |
| `onChange`    | Documented on current main; not in the 0.4.0 types | Not wrapped. Read `state.routes()` |
| Disabled      | No such prop                                       | Not added                          |
| shadcn        | No equivalent                                      | Registry id `nav-stack`            |

## Accessibility

Back is a button labeled "Back". The system back button, swipe back and the desktop back keys pop the page whether or not you draw `NavHeader`. Set `popOnBack={false}` on the page when a back press must confirm before leaving; `onBackPress` still fires.
