# RefreshIndicator (/dev/docs/components/refresh-indicator)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add refresh-indicator
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { RefreshIndicator } from "shadcn-nsh/refresh-indicator";
```

## Usage [#usage]

```tsx
import { RefreshIndicator } from "@/components/ui/refresh-indicator";
```

```tsx
const pull = createAnimatedValue(0);

<View style={{ flex: 1 }}>
  <Scroll
    refreshing={refreshing()}
    onRefresh={refresh}
    pullValue={pull}
    refreshIndicator={{ height: 72 }}
  >
    {rows}
  </Scroll>
  <RefreshIndicator pull={pull} refreshing={refreshing()} />
</View>;
```

The scroll view (or `List`) keeps `onRefresh`, `refreshing`, `pullValue` and `refreshIndicator`: `refreshIndicator` hides the system's spinner, makes a pull refresh once it reaches `height`, and keeps `height` above the content while refreshing; `pullValue` is the animated value it feeds with how far it is pulled. `RefreshIndicator` only draws that value, over the top of the scroll view: its opacity, travel and scale follow `pull` on the UI thread, with no JS per frame. The arrow turns over once the pull is past half of `height`; while `refreshing` it gives way to a ring that spins. The strip takes no presses, so it sits above the scroll view without blocking it. Pass the same `height` to both.

## Examples [#examples]

### Pull to refresh [#pull-to-refresh]

A list that reloads when it is pulled. `refreshing` is the app's: it is set in `onRefresh` and cleared when the reload ends, and the indicator draws it.

```tsx
const refreshing = signal(false);
const pull = createAnimatedValue(0);
const refresh = () => {
  refreshing.set(true);
  reload().then(() => refreshing.set(false));
};

<View style={{ flex: 1 }}>
  <Scroll
    style={{ flex: 1 }}
    refreshing={refreshing()}
    onRefresh={refresh}
    pullValue={pull}
    refreshIndicator={{ height: 72 }}
  >
    <ItemGroup>
      <Each of={rows}>{(row) => <Item>…</Item>}</Each>
    </ItemGroup>
  </Scroll>
  <RefreshIndicator pull={pull} refreshing={refreshing()} />
</View>;
```

### The system spinner [#the-system-spinner]

Leave `refreshIndicator` and `pullValue` off and the platform draws its own spinner; there is nothing to mount. Use this when the platform's look is what you want.

```tsx
<Scroll refreshing={refreshing()} onRefresh={refresh}>
  {rows}
</Scroll>
```

## API [#api]

`RefreshIndicator` is a [`nsh` View](https://nsh.dev/elements/view) in the library's look; every prop of View passes through but `children`, and `style` goes over the look's. The pull itself (`refreshIndicator`, `pullValue`, `onRefresh`, `refreshing`) is [`nsh` Scroll](https://nsh.dev/elements/scroll)'s. There is no pull on the web, so the chip stays hidden there.

| Part               | Props                                                                                                 | Description                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `RefreshIndicator` | `pull`: `AnimatedValue`; `refreshing`: `boolean`; `height`: `number` (72, `REFRESH_INDICATOR_HEIGHT`) | The chip over the top of a scroll view. `height` is the scroll view's `refreshIndicator` height, read once at make time. |

`refreshIndicatorLook()` is exported for an indicator the app draws itself: its parts as the styles they wear (`root`, `chip`, `arrow`, `ring`, `glyph`, `tint`). Reduced motion stops the ring's spin; the pull still moves the chip, since it is the user's own hand.

shadcn/ui has no counterpart (the web has no pull), so there is nothing to compare; the name follows the `refreshIndicator` prop it is drawn for.