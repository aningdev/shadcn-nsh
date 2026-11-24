---
title: CodeBlock
description: Code, a command's output or a log in a block, with a title, a copy button, line numbers and a footer.
component: true
demo: code-block
---

## Installation

```npm
npx shadcn-nsh@latest add code-block
```

## Usage

```tsx
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
```

```tsx
<CodeBlock>
  <CodeBlockHeader>
    <CodeBlockTitle>Terminal</CodeBlockTitle>
    <CodeBlockActions>
      <CodeBlockCopyButton value={output} />
    </CodeBlockActions>
  </CodeBlockHeader>
  <CodeBlockContent>{output}</CodeBlockContent>
</CodeBlock>
```

The code is one color in the theme's monospaced family: there is no syntax highlighting. For
highlighted, editable code, use [`Editor`](./editor), which is `nsh/base`'s.

## Composition

Use the following composition to build a `CodeBlock`:

```text
CodeBlock
├── CodeBlockHeader
│   ├── CodeBlockTitle
│   └── CodeBlockActions
│       └── CodeBlockCopyButton
├── CodeBlockContent
│   └── CodeBlockLine
└── CodeBlockFooter
```

## Examples

### Variant

`variant="destructive"` puts the block in the danger tone: the edge, the title and the code. Use it for errors and failed output.

```tsx
<CodeBlock variant="destructive">
  <CodeBlockHeader>
    <CodeBlockTitle>Build failed</CodeBlockTitle>
    <CodeBlockActions>
      <CodeBlockCopyButton value={log} />
    </CodeBlockActions>
  </CodeBlockHeader>
  <CodeBlockContent>{log}</CodeBlockContent>
</CodeBlock>
```

### Size

`size="sm"` has tighter padding and smaller code, for the output of a tool.

```tsx
<CodeBlock size="sm">
  <CodeBlockContent wrap>{output}</CodeBlockContent>
</CodeBlock>
```

### Header and copy

`CodeBlockHeader` holds a `CodeBlockTitle`, which keeps to one line, and `CodeBlockActions`, which
sits at the end. `CodeBlockCopyButton` is a ghost `IconButton`: a press writes `value` to the system
clipboard and turns the icon into a check for two seconds. Its `accessibilityLabel` reads "Copy",
then "Copied". Put other buttons in `CodeBlockActions` beside it; a wrap toggle is the app's state,
passed to `wrap`. There is no floating placement: the actions belong in a `CodeBlockHeader`.

```tsx
<CodeBlock>
  <CodeBlockHeader>
    <CodeBlockTitle>app/api/chat/route.ts</CodeBlockTitle>
    <CodeBlockActions>
      <CodeBlockCopyButton value={code} />
    </CodeBlockActions>
  </CodeBlockHeader>
  <CodeBlockContent>{code}</CodeBlockContent>
</CodeBlock>
```

### Line numbers

`lineNumbers` numbers each line of a string child; `startLine` numbers from a given line, for a snippet from the middle of a file. The gutter is not selected with the code. One trailing newline does not make a line.

```tsx
<CodeBlockContent lineNumbers startLine={12}>
  {code}
</CodeBlockContent>
```

### Lines of your own

`CodeBlockLine` is a line you draw yourself, with a `variant`: `highlighted` calls it out, `added` and `removed` mark a diff, each with a `+` or `−` that is not selected either. With `lineNumbers` the lines take their numbers in the order they are drawn. A block that shows a whole diff is [`DiffView`](./diff-view).

```tsx
<CodeBlockContent lineNumbers>
  <CodeBlockLine>{"function greet(name: string) {"}</CodeBlockLine>
  <CodeBlockLine variant="removed">{'  return "Hello " + name;'}</CodeBlockLine>
  <CodeBlockLine variant="added">{"  return `Hello, ${name}!`;"}</CodeBlockLine>
  <CodeBlockLine variant="highlighted">{"}"}</CodeBlockLine>
</CodeBlockContent>
```

### Footer

`CodeBlockFooter` is a row under the code, below a hairline: a tool's result and how long it took, or a "Show more" button. A string child is a note in the muted ink; other children keep the ink the app gives them.

```tsx
<CodeBlock size="sm">
  <CodeBlockContent wrap>{output}</CodeBlockContent>
  <CodeBlockFooter>
    Output
    <Text style={{ flexGrow: 1, fontFamily: "monospace", color: colors.up }}>2 pass, 0 fail</Text>
    <Text style={{ color: colors.faint }}>exit 0 · 12 ms</Text>
  </CodeBlockFooter>
</CodeBlock>
```

### Height

Cap the height with `maxHeight` in `style` on `CodeBlockContent`; the code scrolls inside the block. `wrap` wraps long lines instead of scrolling them sideways, and suits output and errors.

```tsx
<CodeBlockContent wrap style={{ maxHeight: 256 }}>
  {output}
</CodeBlockContent>
```

### Show more

Show more is the app's state: cap the content while it is collapsed and put a ghost `Button` in the footer.

```tsx
const expanded = signal(false);

<CodeBlockContent style={expanded() ? undefined : { maxHeight: 256 }}>{code}</CodeBlockContent>
<CodeBlockFooter>
  <Button variant="ghost" size="sm" onPress={() => expanded.set(!expanded())}>
    {expanded() ? "Show less" : "Show more"}
  </Button>
</CodeBlockFooter>
```

### In a tool call

A `CodeBlock` in a card flush against its edges takes its surface off with `style`: the block's edge and corners go, a hairline stays above.

```tsx
<CodeBlock style={{ borderWidth: 0, borderTopWidth: 1, borderRadius: 0 }}>
  <CodeBlockContent wrap>{code}</CodeBlockContent>
</CodeBlock>
```

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on every part but `CodeBlockTitle` (a [`nsh` Text](https://nsh.dev/elements/text)), `CodeBlockCopyButton` (an [`IconButton`](./button)) and `CodeBlockContent` (a [`nsh` Scroll](https://nsh.dev/elements/scroll)); `style` goes over the look's. The text of the code is selectable.

| Part                  | Props                                                                                                                                                     | Description                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `CodeBlock`           | `variant`: `"default" \| "destructive"` (default `"default"`); `size`: `"default" \| "sm"` (default `"default"`)                                          | The surface the other parts sit in; hands its variant and size down.                            |
| `CodeBlockHeader`     | —                                                                                                                                                         | A row above the code for a title and its actions, under a hairline.                             |
| `CodeBlockTitle`      | —                                                                                                                                                         | A filename or a label, one line, cut with an ellipsis.                                          |
| `CodeBlockActions`    | —                                                                                                                                                         | Buttons at the end of the header.                                                               |
| `CodeBlockCopyButton` | `value`: `string` (required); `size`: `IconButtonSize` (default `"sm"`); `onPress` is called before the copy                                              | A ghost icon button that copies `value` and shows a check for two seconds ("Copy" → "Copied").  |
| `CodeBlockContent`    | `children`: `string \| JSX.Element`; `lineNumbers`: `boolean` (default `false`); `startLine`: `number` (default `1`); `wrap`: `boolean` (default `false`) | The code: a string split at its newlines, or `CodeBlockLine`s. Scrolls sideways, without a bar. |
| `CodeBlockLine`       | `variant`: `"default" \| "highlighted" \| "added" \| "removed"` (default `"default"`); `lineNumber`: `number` (over the order the lines are drawn in)     | One line of code you draw yourself.                                                             |
| `CodeBlockFooter`     | —                                                                                                                                                         | A row below the code under a hairline: a result, a button. A string child is a muted note.      |

`codeBlockLook()` is exported for a block the app draws itself: its parts as the styles they wear (`root`, `header`, `title`, `actions`, `content`, `code`, `line`, `gutter`, `marker`, `footer`, `footerText`).
