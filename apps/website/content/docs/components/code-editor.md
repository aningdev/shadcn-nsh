---
title: Code Editor
description: A code editor on the field's well, with line numbers and diagnostics.
component: true
demo: code-editor
---

## Installation

```npm
npx shadcn-nsh@latest add code-editor
```

## Usage

```tsx
import { CodeEditor } from "@/components/ui/code-editor";
```

```tsx
<CodeEditor defaultValue={source} language="typescript" style={{ height: 240 }} />
```

Every prop of [`nsh/base` Editor](https://nsh.dev/elements/editor) passes through: the text (`value` / `defaultValue`, `onChange`), the language and its highlighting, folding, soft wrap, search, the editing keys and the diagnostics. The shell adds the look (`codeEditorClasses`) and the surface (`codeEditorFrame()`).

## Examples

### Languages

`language` takes a name, an extension or a file name; the editor highlights it and follows its editing rules (comments, brackets, indentation).

```tsx
<CodeEditor defaultValue={json} language="json" style={{ height: 200 }} />
<CodeEditor defaultValue={css} language="css.example" style={{ height: 200 }} />
```

### Diagnostics

Ranges the app marks, carried through edits until it sets new ones: an error is underlined in the theme's `destructive`, a warning in `warn`, information in `info`, a hint in `muted-foreground`.

```tsx
<CodeEditor
  defaultValue={source}
  language="typescript"
  diagnostics={[
    {
      range: { start: { line: 2, column: 6 }, end: { line: 2, column: 12 } },
      severity: "warning",
      message: "'unused' is declared but its value is never read.",
    },
  ]}
/>
```

### Parts

`classes` goes over `codeEditorClasses` part by part (an app's classes come after ours; `null` drops ours), and `style` over `codeEditorFrame()`. The font is set with `fontFamily`, `fontSize` and `lineHeight`, which the editor measures its rows in.

```tsx
<CodeEditor
  defaultValue={source}
  language="typescript"
  classes={{ gutter: null, selection: "bg-brand/40" }}
  style={{ height: 240 }}
/>
```

### Controlled text

Pass `value` and set it again in `onChange`; the app owns the file, as a formatter's output or a loaded file replaces it.

```tsx
import { signal } from "nsh";

const source = signal(SAMPLE);

<CodeEditor value={source()} onChange={({ value }) => source.set(value)} language="typescript" />;
```

## API

| Part                | Props                                                           | Description                                                      |
| ------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| `CodeEditor`        | every [`nsh/base` Editor](https://nsh.dev/elements/editor) prop | Themed `nsh/base` Editor on the field's well.                    |
| `CodeEditorProps`   | —                                                               | `nsh/base`'s `EditorProps`, unchanged.                           |
| `codeEditorClasses` | —                                                               | The look of the editor's parts (classes, by part).               |
| `codeEditorFrame`   | —                                                               | The surface's style: the field's fill, edge and control corners. |

The session types the props name are re-exported from this file, so an app does not import them from `nsh/base`: `EditorRef`, `EditorDecoration`, `EditorDiagnostic`, `EditorPosition`, `EditorRange`, `EditorSelection`, `EditorSearchResult`, `EditorCommand`, `EditorCompletionItem`, and the rest of the editor's value types.
