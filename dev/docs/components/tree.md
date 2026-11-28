# Tree (/dev/docs/components/tree)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add tree
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Tree } from "shadcn-nsh/tree";
```

## Usage [#usage]

```tsx
import { Tree } from "@/components/ui/tree";
```

```tsx
<Tree items={items} defaultExpanded={["src"]} />
```

## Examples [#examples]

### Folders [#folders]

`items` nest; a folder opens with a press or its chevron.

```tsx
const items: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "app", label: "App.tsx" },
      { id: "kit", label: "kit.tsx" },
    ],
  },
  { id: "readme", label: "README.md" },
];

<Tree items={items} style={{ width: 280, maxHeight: 220 }} />;
```

### Expanded [#expanded]

`defaultExpanded` opens folders at first.

```tsx
<Tree items={items} defaultExpanded={["src"]} />
```

### Height [#height]

A row is `treeRowHeight` tall: 28 points with a pointer, 44 on a touch screen. A well that should be
as tall as its first rows, with the rest scrolling, sets its own height from it (`Tree`'s `style`),
plus the list's 6 points of padding on each side.

```tsx
import { treeRowHeight } from "@/components/ui/tree";

<Tree items={items} style={{ height: 8 * treeRowHeight + 12 }} />;
```

### A large tree [#a-large-tree]

A hundred folders of a hundred files: 10 100 items. The tree is virtualized, so only the rows in view are made; opening a folder adds its hundred rows without a stall. Give it a height (the tree scrolls inside it) and keep `expanded` and `selected` as signals if you read them.

```tsx
const logs: TreeItem[] = Array.from({ length: 100 }, (_, f) => ({
  id: `f${f}`,
  label: `Folder ${String(f + 1).padStart(3, "0")}`,
  children: Array.from({ length: 100 }, (_, i) => ({
    id: `f${f}/${i}`,
    label: `file-${f + 1}-${i + 1}.log`,
  })),
}));

<Tree
  items={logs}
  expanded={open()}
  selected={selected()}
  accessibilityLabel="Logs"
  style={{ height: 288 }}
  onExpandedChange={({ expanded }) => open.set(expanded)}
  onSelectedChange={({ selected }) => selected.set(selected)}
/>;
```

## API [#api]

Uses `TreeRow` by default. Every prop of [`nsh/base` Tree](https://nsh.dev/elements/tree) passes through.

| Part            | Props                                                                                | Description                                                     |
| --------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `Tree`          | `items`, `defaultExpanded`, `renderItem`, `onSelect`, and every `nsh/base` Tree prop | The virtualized list of rows, in a card, `TreeRow` by default   |
| `TreeRow`       | `entry`, `icon`, `tint`, `detail`                                                    | A row: its chevron, its icon, its label and a detail at the end |
| `treeRowHeight` | —                                                                                    | A row's height: 28 with a pointer, 44 on a touch screen         |