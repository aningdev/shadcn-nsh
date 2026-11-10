---
layout: ../../../layouts/Docs.astro
title: TextView
description: Styled document view wrapping nsh/base TextView.
component: true
demo: text-view
demoHeight: 280
---

[`nsh/base`](https://nsh.dev/elements/text-view) parses Markdown and HTML and keeps the reading measure. This package points the text, links, code and alerts at the theme. The syntax colors inside code blocks stay base's.

## Install

```npx tabs
npx shadcn-nsh@latest add text-view
```

```bunx tabs
bunx shadcn-nsh@latest add text-view
```

```pnx tabs
pnx shadcn-nsh@latest add text-view
```

```yarn tabs
yarn dlx shadcn-nsh@latest add text-view
```

## Usage

```tsx
import { TextView } from "@workspace/ui/components/ui/text-view";

<TextView
  markdown={"See the [guide](https://example.com).\n\n> [!WARNING]\n> Careful"}
  onLinkPress={(event) => open(event.url)}
/>;

const doc = TextView.parse("## Title");
TextView.plainText(doc);
```

`textViewVariants()` returns the part classes and styles. A key set to `null` in `classes` or `styles` drops that default.

## API

| Part                           | Default                                             |
| ------------------------------ | --------------------------------------------------- |
| Root                           | `foreground`, `font-sans`                           |
| Link                           | `primary`, underlined                               |
| `code`, `keyboard`, code block | `muted` fill, `border`, control radius, `font-mono` |
| Quote, rule, table cells       | `border`                                            |
| Note, tip, important           | `primary` at 12%                                    |
| Warning, caution               | `destructive` at 12%                                |

`parse`, `parseHtml` and `plainText` are the base helpers, on `TextView`.

## Differences

| Topic     | `nsh/base`                                              | This package                                                                |
| --------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Measure   | 15-point text on 25.5-point lines, semibold headings    | Kept. This package does not restyle headings                                |
| Alerts    | GitHub's note, tip, important, warning and caution hues | Collapsed to `primary` and `destructive`. The theme has no info/warn tokens |
| Syntax    | Allsum's code palette                                   | Kept. There is no per-token style hook in 0.4.0                             |
| Disabled  | No such prop                                            | Not added                                                                   |
| Link open | `"report"` by default; nothing opens                    | Same. Set `links="open"` to follow base's outside-app open                  |
| shadcn    | No equivalent                                           | Registry id `text-view`                                                     |

## Accessibility

Links report `onLinkPress` and do not open unless `links` is `"open"`. Set `selectable` when the text should be copied. A custom node still needs `renderCustom`; without it, base shows the node's content.
