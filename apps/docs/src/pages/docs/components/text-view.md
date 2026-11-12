---
title: TextView
description: Brand-colored links and a pulsing streaming caret.
component: true
demo: text-view
---

## Installation

```sh
npx shadcn-nsh@latest add text-view
```

## Usage

```tsx
import { TextView, textViewCaretClass, textViewLinkClasses } from "@/components/ui/text-view";
```

```tsx
<TextView markdown={doc} />

<TextView
  markdown={streamingDoc}
  streamingCaret={<View class={textViewCaretClass} />}
/>
```

`TextView` merges `textViewLinkClasses` into `classes` by default.

## API

`TextView.parse`, `parseHtml`, and `plainText` are re-exported from base. Every prop of [`nsh/base` TextView](https://nsh.dev/elements/text-view) passes through.
