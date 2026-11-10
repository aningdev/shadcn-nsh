---
layout: ../../../layouts/Docs.astro
title: Editor
description: Styled code editor wrapping nsh/base Editor.
component: true
demo: editor
demoHeight: 280
---

[`nsh/base`](https://nsh.dev/elements/editor) owns editing, folding, search and the syntax colors. This package paints the field well, the gutter, the selection and the completion menu. Give the editor a height, or `minRows` / `maxRows`.

## Install

```npx tabs
npx shadcn-nsh@latest add editor
```

```bunx tabs
bunx shadcn-nsh@latest add editor
```

```pnx tabs
pnx shadcn-nsh@latest add editor
```

```yarn tabs
yarn dlx shadcn-nsh@latest add editor
```

## Usage

```tsx
import { Editor } from "@workspace/ui/components/ui/editor";

<Editor
  accessibilityLabel="Source"
  language="typescript"
  value={source()}
  onChange={(event) => source.set(event.value)}
  style={{ height: 240 }}
/>;
```

`editorVariants({ readOnly })` returns the chrome. A `classes` or `styles` value of `null` drops that part's default.

## API

The frame is the Input well: sunk while editable, flat while `readOnly`, with a 2-point `ring` edge on focus. The caret row is a 4% wash of `foreground` (a `muted` fill disappears on a light page). Selection is `primary` at 24%. The gutter is `muted`. Search matches use `primary`, not amber. The completion menu uses the popup surface.

The host class includes `font-mono`. Base still measures the text with its own `fontFamily` (the theme's `font-mono`, unless you set the prop). This theme file has no font token, so the package does not pass `fontFamily`.

## Differences

| Topic    | `nsh/base`                                      | This package                                                                         |
| -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Syntax   | Allsum's palette                                | Kept. 0.4.0 has no per-token style hook; `decorations` can still restyle ranges      |
| Search   | Translucent amber                               | `primary` at 20% and 35%. The theme has no amber token                               |
| Warning  | Amber underline                                 | `destructive`, same as an error. Info uses `primary`; a hint uses `muted-foreground` |
| Disabled | No such prop. `readOnly` still allows selection | Same. Read-only drops the focus edge and flattens the well                           |
| shadcn   | No equivalent                                   | Registry id `editor`                                                                 |

## Accessibility

Set `accessibilityLabel` to what the buffer is ("Source"), not "editor". Line numbers stay a press target for breakpoints (`onLineNumberPress`). Read-only text can still be selected and copied.
