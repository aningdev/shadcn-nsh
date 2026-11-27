# Badge (/dev/docs/components/badge)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add badge
```

## Usage [#usage]

```tsx
import { Badge } from "@/components/ui/badge";
```

```tsx
<Badge tone="accent">Beta</Badge>
```

## Examples [#examples]

### Tone [#tone]

`tone` is the theme's `Tone`; a function is read where the badge is drawn, so a value the app changes follows.

```tsx
<Badge tone="neutral">Neutral</Badge>
<Badge tone="accent">Accent</Badge>
<Badge tone="info">Info</Badge>
<Badge tone="warn">Warn</Badge>
<Badge tone="destructive">Danger</Badge>
<Badge tone="up">Up</Badge>
<Badge tone="down">Down</Badge>
```

### Variant [#variant]

`default` fills the capsule with the tone's tint; `outline` draws its edge in the tone's color instead.

```tsx
<Badge variant="outline">Draft</Badge>
<Badge tone="destructive" variant="outline">
  Failed
</Badge>
```

### Size [#size]

`default` is 20 points tall; `sm` is 18, for a chip beside a smaller row — a tool card's 32 pt tile, a list's second line. The label's size and the padding follow the height.

```tsx
<Badge size="sm" tone="info">
  Running
</Badge>
<Badge tone="info">Running</Badge>
```

## API [#api]

Gallery atom: no `nsh/base` counterpart. The children are the label, and the variant/tone/size axes follow the library's unified component conventions.

| Part    | Props                                                                                                                                                                                                    | Description                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `Badge` | `children` (a string, required); `tone`: `Tone \| (() => Tone)` (default `"neutral"`); `variant`: `BadgeVariant` (default `"default"`); `size`: `BadgeSize` (default `"default"`); every `nsh` view prop | A small capsule label in a neutral, toned, or outline style. |

The view props (`style`, `class`, `testID`, `role`, the accessibility ones) are spread on the capsule after the badge's own, so an app can name it to a screen reader or take it out of the layout without a wrapper.

`BadgeVariant` is `"default" | "outline"`: the two the capsule's look has. `BadgeSize` is `"sm" | "default"`: 18 points tall, or 20.