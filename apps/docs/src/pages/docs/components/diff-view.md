---
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

## API

Every prop of [`nsh/base` DiffView](https://nsh.dev/elements/diff-view) passes through.
