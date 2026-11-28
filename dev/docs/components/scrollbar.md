# Scrollbar (/dev/docs/components/scrollbar)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add scrollbar
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Scrollbar } from "shadcn-nsh/scrollbar";
```

## Usage [#usage]

```tsx
import { Scrollbar } from "@/components/ui/scrollbar";
```

```tsx
<Scroll name="inbox" scrollbar={false} />
<Scrollbar scroll="inbox" />
```

## Examples [#examples]

### A list [#a-list]

`Scroll` hides its platform bar; `Scrollbar` draws the theme's bar for it.

```tsx
<Scroll ref={inbox} scrollbar={false} style={{ flex: 1 }}>
  …
</Scroll>
<Scrollbar scroll={inbox} accessibilityLabel="Inbox scroll" />
```

### Every scroll view [#every-scroll-view]

`Scrollbar.setTheme()` installs the same look on every view that still uses the platform indicator; `null` gives the platform's back.

```tsx
Scrollbar.setTheme();
```

## API [#api]

Uses `scrollbarTheme` by default. Call `Scrollbar.setTheme()` to install it on every scroll view. Every prop of [`nsh/base` Scrollbar](https://nsh.dev/elements/scrollbar) passes through.

| Part        | Props | Description                                                                     |
| ----------- | ----- | ------------------------------------------------------------------------------- |
| `Scrollbar` |       | Uses `scrollbarTheme` by default; `setTheme()` installs it on every scroll view |