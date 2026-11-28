# Breadcrumb (/docs/components/breadcrumb)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add breadcrumb
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Breadcrumb } from "shadcn-nsh/breadcrumb";
```

## Usage [#usage]

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
```

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink onPress={() => navigate("/")}>Home</BreadcrumbLink>
      <BreadcrumbSeparator />
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Composition [#composition]

Use the following composition to build a `Breadcrumb`:

```text
Breadcrumb
└── BreadcrumbList
    ├── BreadcrumbItem
    │   ├── BreadcrumbLink
    │   └── BreadcrumbPage
    ├── BreadcrumbSeparator
    └── BreadcrumbEllipsis
```

## Examples [#examples]

### A trail [#a-trail]

The steps are a row that wraps when the window is narrow; the page the trail ends at is
`BreadcrumbPage`, in the page's text color, and is announced as the current page.

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink onPress={() => navigate("/")}>Home</BreadcrumbLink>
      <BreadcrumbSeparator />
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbLink onPress={() => navigate("/components")}>Components</BreadcrumbLink>
      <BreadcrumbSeparator />
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Steps left out [#steps-left-out]

`BreadcrumbEllipsis` stands for the steps a long trail leaves out. It is named `"More"`, so a
screen reader says the trail skipped some rather than jumping from one name to the next; give it
`onPress` and `role="button"` when it opens a menu.

```tsx
<BreadcrumbItem>
  <BreadcrumbEllipsis onPress={() => openMenu()} role="button" />
  <BreadcrumbSeparator />
</BreadcrumbItem>
```

### A separator of your own [#a-separator-of-your-own]

A separator is a chevron; its children replace it (a slash, a dot, a small icon).

```tsx
<BreadcrumbSeparator>
  <Text style={{ color: colors.mutedForeground }}>/</Text>
</BreadcrumbSeparator>
```

### A step with a destination [#a-step-with-a-destination]

A step is [`nsh/base`'s Link](https://nsh.dev/elements/link), so `href` and `openWith` work as they
do everywhere else: `"system"` opens the URL outside the app, `"app"` hands it to `onOpen`.

```tsx
<BreadcrumbLink href="/components" openWith="app" onOpen={({ href }) => navigate(href)}>
  Components
</BreadcrumbLink>
```

## API [#api]

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `Breadcrumb`,
`BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbSeparator` and `BreadcrumbEllipsis`, and every prop
of [`nsh` Text](https://nsh.dev/elements/text) on `BreadcrumbPage`; `BreadcrumbLink` is
[`nsh/base`'s Link](https://nsh.dev/elements/link) with all its props (`href`, `openWith`, `onOpen`,
`onPress`, `disabled`, `hitSlop`, …). Style props go over the look's.

The trail is a `navigation` landmark named `"Breadcrumb"`; the rows under it carry no role. `nsh`
has no `listitem` role, so `BreadcrumbList` is not a `list` either: a list whose children are not
its items reads worse than a plain row, and `ItemGroup` makes the same call.

| Part                  | Props                                  | Description                                                                                                   |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `Breadcrumb`          | `accessibilityLabel`                   | The trail from where the app starts to the page it shows: `breadcrumbLook().root`.                            |
| `BreadcrumbList`      | every `nsh` view prop                  | The steps as a row that wraps when the window is narrow: `breadcrumbLook().list`.                             |
| `BreadcrumbItem`      | —                                      | One step: `breadcrumbLook().item`.                                                                            |
| `BreadcrumbLink`      | `children`, every `nsh/base` Link prop | A step with a destination: `breadcrumbLook().link`, `.linkClass`.                                             |
| `BreadcrumbPage`      | —                                      | The step the trail ends at, in the page's text color and current for screen readers: `breadcrumbLook().page`. |
| `BreadcrumbSeparator` | `children`                             | The mark between steps, a chevron unless given children: `breadcrumbLook().separator`.                        |
| `BreadcrumbEllipsis`  | `accessibilityLabel`                   | The steps a long trail leaves out, named `"More"`: `breadcrumbLook().ellipsis`.                               |

| Prop                 | On                    | Type                    | Default        |
| -------------------- | --------------------- | ----------------------- | -------------- |
| `accessibilityLabel` | `Breadcrumb`          | `string`                | `"Breadcrumb"` |
| `children`           | `BreadcrumbLink`      | `string \| JSX.Element` |                |
| `children`           | `BreadcrumbSeparator` | `JSX.Element`           | a chevron      |
| `accessibilityLabel` | `BreadcrumbEllipsis`  | `string`                | `"More"`       |

The trail is small type in the muted ink, 6 points between steps (10 on a touch screen); a step's
link takes the text color while the pointer rests on it and the theme's focus ring with the keyboard
on it. `BreadcrumbPage` sets `accessibilityState.current` to `"page"`; pass your own
`accessibilityState` to say something else. The separator is hidden from screen readers. In a
terminal, which draws no icons, the separator is `›` and the ellipsis `…`. `breadcrumbLook()` is
exported for a trail an app draws itself.