# Link (/dev/docs/components/link)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add link
```

## Usage [#usage]

```tsx
import { Link } from "@/components/ui/link";
```

```tsx
<Link href="https://nsh.dev">Native Shell</Link>
```

## Examples [#examples]

### Quiet [#quiet]

A quiet link sits in a footer: muted, with no resting underline.

```tsx
<Link href="#docs" quiet>
  Documentation
</Link>
```

### Current [#current]

The page a link names is the one shown.

```tsx
<Link href="#here" current>
  Current page
</Link>
```

### External [#external]

`icon` adds the arrow a site outside the app gets.

```tsx
<Link href="https://example.com" icon>
  External
</Link>
```

### Names for screen readers [#names-for-screen-readers]

A string child is the link's name for screen readers too, so `<Link href="/docs">Documentation</Link>` needs nothing else; `accessibilityLabel` wins when the name should differ from the text. Children drawn as given are named by the texts inside them.

## API [#api]

| Part   | Props                                                                                                                                                                                                                        | Description                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `Link` | `quiet`: `boolean` (muted footer style), `current`: `boolean` (current page), `visited`: `boolean` (muted once opened), `inline`: `boolean` (in a paragraph), `icon`: `boolean` (external arrow); every `nsh/base` Link prop | A text link with the underline motion |

Every prop of [`nsh/base` Link](https://nsh.dev/elements/link) passes through.