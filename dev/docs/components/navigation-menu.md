# Navigation Menu (/dev/docs/components/navigation-menu)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add navigation-menu
```

## Usage [#usage]

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
```

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="start">
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent width={320}>
        <NavigationMenuLink onPress={() => open("introduction")}>Introduction</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink active onPress={() => open("docs")}>
        Docs
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Composition [#composition]

Use the following composition to build a `NavigationMenu`:

```text
NavigationMenu
└── NavigationMenuList
    ├── NavigationMenuItem
    │   ├── NavigationMenuTrigger
    │   └── NavigationMenuContent
    │       └── NavigationMenuLink
    └── NavigationMenuItem
        └── NavigationMenuLink
```

## Examples [#examples]

### The bar [#the-bar]

`NavigationMenu` is a navigation landmark (`role="navigation"`, named `"Navigation"` unless
`accessibilityLabel` says otherwise) as wide as the app gives it, holding a `NavigationMenuList`: a
row of items 4 points apart with a pointer (6 on a touch screen), wrapping onto a second line when
the window is narrow. An item is its trigger, or a link of its own. A trigger is drawn by its
item's content, which is what places it in the bar: a `NavigationMenuTrigger` declared after its
`NavigationMenuContent` draws nothing.

A trigger is the theme's tallest height step high and 16 points in either side, its name in the
bar's type and a chevron after it — the theme's smallest icon, an indicator's.

### What a trigger opens [#what-a-trigger-opens]

A panel: `NavigationMenuContent` mounts [`nsh/base` Popover](https://nsh.dev/elements/popover) on the
shared popup surface (`popupSurface`: one edge, the menu tier's shadow, the theme's radius) 10 points
of room inside (12 on a touch screen), placed against its trigger — `bottom` and `start` unless
`placement`, `align` and `offset` say otherwise — so it takes that trigger's width unless `width`
names another. What goes in it is the app's: a grid of links, a card
with a description, a form.

```tsx
<NavigationMenuContent width={480}>
  <View style={{ flexDirection: "row", gap: 4 }}>{/* a card and three described links */}</View>
</NavigationMenuContent>
```

Only one panel is open at a time, and the root owns which: `value` (controlled) or `defaultValue`,
reported by `onValueChange({ value, reason })`. The open trigger wears the `accent` fill at half and
its chevron turns 180° — at once under reduced motion, in 200 ms otherwise.

A press opens and closes a panel (Return or Space with the keyboard on the trigger), and on a desktop
the pointer's rest opens one too: 200 ms on a trigger (`delayDuration`), and the panel closes 300 ms
after the pointer has left both the trigger and the panel (`closeDelay`) — time to cross from one to
the other, not to browse. `Infinity` turns that off: only presses and the keyboard, or only Escape and
a press outside. A touch screen has no pointer to rest, so a tap opens and closes there.

### A link in a panel [#a-link-in-a-panel]

`NavigationMenuLink` is [`nsh/base` Link](https://nsh.dev/elements/link) in the bar's look: a name 13
points medium (15 on a touch screen) and, under it, a description in the muted ink. `active` is the
page the app is on — the `accent` fill at half, and announced as the current page.

```tsx
const look = navigationMenuLook();

<NavigationMenuLink onPress={() => go("installation")}>
  <Text style={look.linkText}>Installation</Text>
  <Text style={look.linkHint}>How to add a component and what it needs.</Text>
</NavigationMenuLink>;
```

It goes somewhere with `href` and `openWith`, or reports a press — and on the web a link with an
`href` shows no hover of its own, so a navigation menu's links are usually `onPress`. A `style` goes
over the look's: the demo's leading card is one link on the inset surface of
`lib/ui/surface` (`insetSurface()`).

### A bar item that is a link [#a-bar-item-that-is-a-link]

The current page is often a plain link standing where a trigger would:

```tsx
const bar = navigationMenuTriggerLook();

<NavigationMenuLink active onPress={() => go("docs")} style={bar.style} hoverStyle={bar.hoverStyle}>
  Docs
</NavigationMenuLink>;
```

A `NavigationMenuTrigger` or `NavigationMenuLink` that is not a string is drawn as given, so an icon
can lead a name.

## API [#api]

The root owns the open item and the two delays; a panel mounts [`nsh/base` Popover](https://nsh.dev/elements/popover)
and every base prop passes through except the trigger, the open state and the lifecycle callbacks.

| Part                    | Props                                                                   | Description                                                               |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `NavigationMenu`        | `value`, `defaultValue`, `onValueChange`, `delayDuration`, `closeDelay` | `onValueChange` reports `{ value, reason }`                               |
| `NavigationMenuList`    |                                                                         | The wrapping row                                                          |
| `NavigationMenuItem`    | `value`; every `nsh` view prop                                          | `value` is what the root opens; a trigger and its content, or a link      |
| `NavigationMenuTrigger` | `disabled`; every `nsh` view prop                                       | A string is the name, a chevron follows it                                |
| `NavigationMenuContent` | `width`, `placement`, `align`, `offset`, `margin`, `closeOnEscape`      | The panel; `margin` and `closeOnEscape` are base's, and more pass through |
| `NavigationMenuLink`    | `href`, `openWith`, `onPress`, `active`, `disabled`, `style`            | A link                                                                    |

`NavigationMenuItem` and `NavigationMenuTrigger` spread the view props they are given on their own
view, after the look (`style` included), and merge a given `hoverStyle`, `activeStyle`,
`focusVisibleStyle` or `disabledStyle` after the look's own; the trigger keeps the pointer's enter
and leave, which drive the item's delays. `NavigationMenu` and `NavigationMenuList` do the same on the root and the
row.

The look is `navigationMenuLook()` — `root`, `list`, `item`, `panel`, `link`, `linkText`,
`linkHint` — and `navigationMenuTriggerLook({ open })` for a trigger. Spread them on the part they
name.