---
layout: ../../../layouts/Docs.astro
title: Tree
description: Styled tree wrapping nsh/base Tree — theme tokens + depth, chevron, and selection.
component: true
demo: tree
demoHeight: 360
---

Items that hold items, on `nsh/base` Tree. Expansion, selection, typeahead, and virtualization stay in base. This package paints the frame and the default row: a chevron, the label indented by depth, selection and disabled styles.

## Install

```sh
shadcn-nsh add tree
# monorepo:
shadcn-nsh add tree -c apps/web
```

## Usage

```tsx
import { Tree } from "@workspace/ui/components/ui/tree";

const files = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "src/main.rs", label: "main.rs" },
      { id: "src/skip.rs", label: "skip.rs", disabled: true },
    ],
  },
  { id: "Cargo.toml", label: "Cargo.toml" },
];

<Tree
  items={files}
  defaultExpanded={["src"]}
  accessibilityLabel="Files"
  style={{ width: 280, height: 240 }}
  onAction={({ id }) => openFile(id)}
/>;
```

## API

### `Tree`

| Prop                           | Type                                | Default         | Notes                                                          |
| ------------------------------ | ----------------------------------- | --------------- | -------------------------------------------------------------- |
| `items`                        | `TreeItem[]`                        | `[]`            | `children` makes a folder. Ids are unique                      |
| `expanded` / `defaultExpanded` | `string[]`                          | —               | Controlled list is `expanded` + `onExpandedChange`             |
| `selected` / `defaultSelected` | `string \| null`                    | —               | `onSelectedChange` reports the next id                         |
| `disabled`                     | `boolean`                           | `false`         | No presses, no keyboard stop, every row dimmed                 |
| `reveal`                       | `boolean`                           | `true`          | Base defaults off. Reduced motion turns the spring off         |
| `accessibilityLabel`           | `string`                            | —               | What screen readers call the tree                              |
| `renderItem`                   | `(entry: TreeEntry) => JSX.Element` | chevron + label | `entry.depth` / `entry.folder`. `null` uses base's plain label |
| `onExpand` / `onCollapse`      | `({ id }) => void`                  | —               | After `onExpandedChange`                                       |
| `onAction`                     | `({ id }) => void`                  | —               | Return on a selected leaf, or a double press. Not selection    |

`style`, `listClass`, `listStyle`, `itemClass`, and `itemStyle` merge over the frame. The tree does not pick a height: set `height` or `flex-1` in a sized parent so only rows in view are built. `treeVariants()` returns the chrome; read it inside `computed`.

## Differences

| Topic           | shadcn                                                | This package / `nsh/base`                                                                                                                                                          |
| --------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape           | No tree in the standard registry (or a composed list) | One `Tree`. Rows are `items`, not `TreeItem` child components                                                                                                                      |
| Chevron / icons | Consumer                                              | A `›` that rotates 90° with `group-aria-expanded`. No folder or file icons                                                                                                         |
| Indent          | Consumer padding                                      | 14 points per `depth`                                                                                                                                                              |
| Selection       | Item state                                            | `selected:` / `focus:` / `disabled:` on `itemClass`. Base draws each row once                                                                                                      |
| Reveal          | CSS height                                            | Base `reveal`, default on here (base's own default is off), off with reduced motion                                                                                                |
| Right key       | —                                                     | Store 0.4.0 expands the selected folder and leaves the selection there. The element doc also describes moving into the first child on that same key; that move did not happen here |
| Colors          | —                                                     | `accent` selection, `ring` edge and focus outline. Disabled is 0.5, not the reference's 0.4                                                                                        |
| Terminal rows   | —                                                     | Not ported                                                                                                                                                                         |

## Accessibility

The tree is one tab stop. Arrows move the selection among visible rows and skip disabled ones. Right expands a folder, Left collapses it. Return or Space toggles a folder; Return on a leaf fires `onAction`. Open a file from `onAction`, not `onSelectedChange`. Set `accessibilityLabel`.
