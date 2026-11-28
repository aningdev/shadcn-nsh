# Editor (/dev/docs/components/editor)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add editor
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Editor } from "shadcn-nsh/editor";
```

## Usage [#usage]

```tsx
import { Editor } from "@/components/ui/editor";
```

```tsx
<Editor defaultValue={source} language="typescript" style={{ height: 240 }} />
```

Every prop of [`nsh/base` Editor](https://nsh.dev/elements/editor) passes through: the text (`value` / `defaultValue`, `onChange`), the language and its highlighting, folding, soft wrap, search, the editing keys and the diagnostics. The shell adds the look of the editor's parts and the field's well.

## Composition [#composition]

Use the following composition to build an `Editor`:

```text
Editor
└── EditorFindBar
```

## Examples [#examples]

### Languages [#languages]

`language` takes a name, an extension or a file name; the editor highlights it and follows its editing rules (comments, brackets, indentation).

```tsx
<Editor defaultValue={json} language="json" style={{ height: 200 }} />
<Editor defaultValue={css} language="css.example" style={{ height: 200 }} />
```

### Diagnostics [#diagnostics]

Ranges the app marks, carried through edits until it sets new ones: an error is underlined in the theme's `destructive`, a warning in `warn`, information in `info`, a hint in `muted-foreground`.

```tsx
<Editor
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

### Find and replace [#find-and-replace]

`search` is what the editor finds and highlights; `onSearchChange` says what it found — how many
matches, which of them the selection is on, or why a pattern is not a regular expression. The editor
never sets the search itself (`EditorRef` replaces a match, it does not find one), so the bar that
edits it is a part: `EditorFindBar` takes the editor's `ref`, **the same object the app hands the
editor's `search`**, and the `result` the editor reported. What is typed into the bar goes back
through `onSearchChange`; its buttons run the editor's own `findNext`, `findPrevious`, `replace` and
`replaceAll` (and the bar says how many a Replace all rewrote for a moment).

Where the bar is and whether it is open are the app's: it sits beside the editor in the same `View`
rather than inside it, since a part cannot leave the tree. The keys are the app's too — Escape and
`mod+f` belong to its `keymap`, as a part that captured them would take them from the editor while
the bar is closed. Because the search is one object, a query the app sets — from
`onFindWithSelection`, or from a keybinding — reads in the bar, and the bar's edits move the
editor's matches as it types.

```tsx
import { keymap, signal, View } from "nsh";

import {
  Editor,
  EditorFindBar,
  type EditorRef,
  type EditorSearch,
  type EditorSearchResult,
} from "@/components/ui/editor";

const search = signal<EditorSearch>({ query: "" });
const found = signal<EditorSearchResult | null>(null);
// The editor's ref, in a signal: the bar takes it as a prop, so it arrives with the editor.
const editor = signal<EditorRef | null>(null);
const finding = signal(false);
keymap.bind("mod+f", () => finding.set(true));

<View style={{ height: 280 }}>
  <Editor
    ref={(node) => editor.set(node)}
    defaultValue={source}
    language="typescript"
    search={finding() ? search() : null}
    onSearchChange={({ result }) => found.set(result)}
    style={{ flex: 1 }}
  />
  {finding() && editor() ? (
    <EditorFindBar
      editor={editor()}
      search={search()}
      onSearchChange={(next) => search.set(next)}
      result={found()}
      onClose={() => finding.set(false)}
      style={{ position: "absolute", top: 8, end: 8, width: 400 }}
    />
  ) : null}
</View>;
```

### Parts [#parts]

`classes` goes over the shell's classes part by part (an app's classes come after the shell's; `null` drops the shell's), and `style` over the field's well. The font is set with `fontFamily`, `fontSize` and `lineHeight`, which the editor measures its rows in.

```tsx
<Editor
  defaultValue={source}
  language="typescript"
  classes={{ gutter: null, selection: "bg-brand/40" }}
  style={{ height: 240 }}
/>
```

### Hover and quick fixes [#hover-and-quick-fixes]

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

<Editor
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
                color: diagnostic.severity === "warning" ? colors.warning : colors.destructive,
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

### Controlled text [#controlled-text]

Pass `value` and set it again in `onChange`; the app owns the file, as a formatter's output or a loaded file replaces it.

```tsx
import { signal } from "nsh";

const source = signal(SAMPLE);

<Editor value={source()} onChange={({ value }) => source.set(value)} language="typescript" />;
```

## API [#api]

| Part                 | Props                                                           | Description                                                                  |
| -------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Editor`             | every [`nsh/base` Editor](https://nsh.dev/elements/editor) prop | Themed `nsh/base` Editor on the field's well.                                |
| `EditorProps`        | —                                                               | `nsh/base`'s `EditorProps`, unchanged.                                       |
| `EditorFindBar`      | `EditorFindBarProps`                                            | The find bar: the query with its count, its modes, and replace.              |
| `EditorFindBarProps` | —                                                               | `editor`, `search`, `onSearchChange`, `result`, `onClose`, `class`, `style`. |

The session types the props name are re-exported from this file, so an app does not import them from `nsh/base`: `EditorRef`, `EditorDecoration`, `EditorDiagnostic`, `EditorPosition`, `EditorRange`, `EditorSelection`, `EditorSearchResult`, `EditorCommand`, `EditorCompletionItem`, and the rest of the editor's value types.