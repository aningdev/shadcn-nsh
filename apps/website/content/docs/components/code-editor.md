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

### Hover and quick fixes

`onHover` reports where the pointer rests: the character, the word it is in, **the word's box on the
page** (`pageBounds`, what a popup is placed against) and the diagnostics there; `onHoverEnd` says
it left. The app answers with an `Overlay` anchored to that box, so the card follows the word as the
text scrolls and flips below it where there is no room. A card that carries buttons is kept alive
while the pointer is over it — `onMouseEnter` / `onMouseLeave` on the card, a timer that closes it a
moment after the pointer leaves — or it vanishes under the pointer on the way to them. A fix
rewrites the file, which the app owns (`value` / `onChange`).

```tsx
const source = signal(LINTED);
const card = signal<{ anchor: Bounds; diagnostics: EditorDiagnostic[] } | null>(null);
let overCard = false;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
const closeSoon = () => {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    if (!overCard) card.set(null);
  }, 250);
};
cleanup(() => clearTimeout(closeTimer));

<CodeEditor
  value={source()}
  onChange={({ value }) => source.set(value)}
  language="typescript"
  diagnostics={LINT}
  onHover={(event) => {
    clearTimeout(closeTimer);
    if (event.diagnostics.length === 0) {
      if (!overCard) card.set(null);
      return;
    }
    card.set({ anchor: event.pageBounds, diagnostics: event.diagnostics });
  }}
  onHoverEnd={closeSoon}
  style={{ height: 200 }}
/>;

{
  card() ? (
    <Overlay anchor={card()!.anchor} placement="top" align="start" offset={4} margin={8}>
      <View
        onMouseEnter={() => {
          overCard = true;
          clearTimeout(closeTimer);
        }}
        onMouseLeave={() => {
          overCard = false;
          closeSoon();
        }}
        style={{ ...popoverLook({ compact: true }), maxWidth: 300, gap: 10 }}
      >
        {card()!.diagnostics.map((diagnostic) => (
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontSize: 12,
                color: diagnostic.severity === "warning" ? colors.warn : colors.danger,
              }}
            >
              {`${diagnostic.severity ?? "error"}: ${diagnostic.message}`}
            </Text>
            {fixesOf(diagnostic).map((fix) => (
              <Button
                variant="secondary"
                size="sm"
                style={{ alignSelf: "flex-start" }}
                onPress={() => source.set(fix.apply(source()))}
              >
                {fix.title}
              </Button>
            ))}
          </View>
        ))}
      </View>
    </Overlay>
  ) : null;
}
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
