---
layout: ../../../layouts/Docs.astro
title: DiffView
description: Up and down tints for additions and deletions, with hunk actions.
component: true
demo: diff-view
---

## Installation

```sh
npx shadcn-nsh@latest add diff-view
```

## Usage

```tsx
import { DiffView, diffViewStyles, DiffHunkActions, diffHunkTone } from "@/components/ui/diff-view";
```

```tsx
<DiffView
  oldValue={before}
  newValue={after}
  layout="unified"
  renderHunkActions={(hunk) => (
    <DiffHunkActions
      index={hunk.index}
      tone={diffHunkTone(hunk, "unified")}
      onRevert={() => ref?.revertHunk(hunk.index)}
      onKeep={() => ref?.acceptHunk(hunk.index)}
    />
  )}
/>
```

`DiffView` defaults `styles` to `diffViewStyles()`.

## Examples

### Unified

```tsx
<DiffView
  layout="unified"
  oldValue={'fn main() {\n    println!("alpha");\n}'}
  newValue={'fn main() {\n    println!("gamma");\n}'}
  language="rust"
/>
```

### Side by side

`layout="split"` puts the old text on the left and the new on the right.

```tsx
<DiffView layout="split" oldValue={before} newValue={after} language="rust" />
```

### Actions on a change

`renderHunkActions` drops `DiffHunkActions` onto each change; `diffHunkTone` picks the tint its backing needs.

```tsx
<DiffView
  oldValue={before}
  newValue={after}
  renderHunkActions={(hunk) => (
    <DiffHunkActions
      index={hunk.index}
      tone={diffHunkTone(hunk, "unified")}
      onRevert={() => ref?.revertHunk(hunk.index)}
      onKeep={() => ref?.acceptHunk(hunk.index)}
    />
  )}
/>
```

### Theme colors

`DiffView` defaults `styles` to `diffViewStyles()`; pass your own to change only the parts you name.

```tsx
<DiffView oldValue={before} newValue={after} styles={diffViewStyles()} />
```

## API

Every prop of [`nsh/base` DiffView](https://nsh.dev/elements/diff-view) passes through.
