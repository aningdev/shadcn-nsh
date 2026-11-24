// The official editor scene (`references/nsh/website/demos/el-editor.tsx`) with this library's
// `Editor`: a file per language, a linter's marks, the caret moved, the text reported, and an
// inspector beside it that follows both.
import { type Bounds, cleanup, keymap, mount, Overlay, signal, Text, View } from "nsh";
import type { EditorDiagnostic, EditorRange } from "nsh/base";

import { Button } from "@/packages/ui/button";
import {
  Editor,
  EditorFindBar,
  type EditorRef,
  type EditorSearch,
  type EditorSearchResult,
} from "@/packages/ui/editor";
import { popoverLook } from "@/packages/ui/popover";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui, wide } from "./stage";

const SAMPLES = {
  typescript: `type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.r ** 2;
    case "square":
      return shape.side ** 2;
  }
}

const unused = "never read";
console.log(area({ kind: "circle", r: 2 }));
`,
  json: `{
  "name": "my-app",
  "entry": "App.tsx",
  "capabilities": ["network"]
}
`,
  css: `.card {
  display: grid;
  gap: 12px;
  padding: 16px;
  colour: red;
}
`,
} as const;

type Language = keyof typeof SAMPLES;

// What a linter would report: an unused variable in the TypeScript file and a misspelled
// property in the stylesheet.
const PROBLEMS: Record<Language, EditorDiagnostic[]> = {
  typescript: [
    {
      range: { start: { line: 12, column: 6 }, end: { line: 12, column: 12 } },
      severity: "warning",
      message: "'unused' is declared but its value is never read.",
    },
  ],
  json: [],
  css: [
    {
      range: { start: { line: 4, column: 2 }, end: { line: 4, column: 8 } },
      severity: "error",
      message: "Unknown property 'colour'.",
    },
  ],
};

/** The file the hover card looks at: two problems, each with the fix that clears it. */
const LINTED = `const items = [4, 9, 12];
const price = 3;

const total = items.length * prcie;

console.log(total, price);
`;

/** A fix: how the file reads once it is applied. */
type Fix = { title: string; apply: (text: string) => string };

/** What a linter would report of that file. */
const LINT: { range: EditorRange; severity: "error" | "warning"; message: string; fixes: Fix[] }[] =
  [
    {
      range: { start: { line: 3, column: 29 }, end: { line: 3, column: 34 } },
      severity: "error",
      message: "Unknown name 'prcie'. Did you mean 'price'?",
      fixes: [{ title: "Rename to 'price'", apply: (text) => text.replaceAll("prcie", "price") }],
    },
    {
      range: { start: { line: 5, column: 0 }, end: { line: 5, column: 7 } },
      severity: "warning",
      message: "'console' is not available in this runtime.",
      fixes: [
        {
          title: "Remove the line",
          apply: (text) => text.replace("console.log(total, price);\n", ""),
        },
      ],
    },
  ];

function App() {
  const language = signal<Language>("typescript");
  const sources = signal<Record<Language, string>>({ ...SAMPLES });
  // The hover card over the linted file: the word's box on the page, and what the linter says there.
  const linted = signal(LINTED);
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
  const fixesFor = (message: string) =>
    LINT.find((problem) => problem.message === message)?.fixes ?? [];

  const caret = signal("1:1");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

  // The find bar's editor, which the app holds a ref to: the bar steps through the matches with it.
  const findEditor = signal<EditorRef | null>(null);
  const finding = signal(true);
  const search = signal<EditorSearch>({ query: "circle" });
  const found = signal<EditorSearchResult | null>(null);
  const searched = signal<string>(SAMPLES.typescript);
  keymap.bind("mod+f", () => finding.set(true));

  return (
    <DemoPage title="Editor">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click into the code and type; switching the language keeps each file's text"
          : "Tap into the code and type; switching the language keeps each file's text"}
      </Text>

      <Split
        grow
        width={640}
        inspector={
          <>
            <Segmented
              label="language"
              options={["typescript", "json", "css"] as const}
              value={language()}
              onChange={(value) => language.set(value)}
            />
            <Panel title="caret">
              <Text style={{ fontSize: 13, fontVariant: ["tabular-nums"], color: ui().text }}>
                {`${caret()} · ${sources()[language()].length} characters`}
              </Text>
            </Panel>
            <Panel title="diagnostics">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {PROBLEMS[language()].length === 0
                  ? "none"
                  : PROBLEMS[language()]
                      .map((problem) => `${problem.severity}: ${problem.message}`)
                      .join("\n")}
              </Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={96} />
          </>
        }
      >
        <View style={{ height: wide() ? 380 : 300, overflow: "hidden" }}>
          {() => {
            const lang = language();
            return (
              <Editor
                value={sources()[lang]}
                onChange={({ value }) => {
                  sources.set({ ...sources(), [lang]: value });
                  log(`onChange: ${value.length} characters`);
                }}
                language={lang}
                diagnostics={PROBLEMS[lang]}
                accessibilityLabel="Code"
                onSelectionChange={({ selections }) => {
                  const head = selections[selections.length - 1].head;
                  caret.set(`${head.line + 1}:${head.column + 1}`);
                }}
                onFocus={() => log("onFocus")}
                onBlur={() => log("onBlur")}
                style={{ flex: 1 }}
              />
            );
          }}
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Find and replace" axis="block">
          <Text style={{ color: ui().muted }}>
            `search` names what the editor finds and highlights; the bar edits that same object
            through `onSearchChange`, steps the matches with `editor.run("findNext")`, and reads how
            many a Replace all rewrote. Return in the query finds the next match.
          </Text>
          <View style={{ height: wide() ? 220 : 250, overflow: "hidden" }}>
            <Editor
              value={searched()}
              onChange={({ value }) => searched.set(value)}
              language="typescript"
              accessibilityLabel="Searched code"
              search={finding() ? search() : null}
              onSearchChange={({ result }) => found.set(result)}
              ref={(editor) => findEditor.set(editor)}
              style={{ flex: 1 }}
            />
            {() => {
              const editor = findEditor();
              return editor ? (
                <EditorFindBar
                  editor={editor}
                  search={search()}
                  onSearchChange={(next) => search.set(next)}
                  result={found()}
                  onClose={() => finding.set(false)}
                  style={{ position: "absolute", top: 8, end: 8, width: wide() ? 400 : 300 }}
                />
              ) : null;
            }}
          </View>
        </DemoSection>

        <DemoSection title="Hover and quick fixes" axis="block">
          <Text style={{ color: ui().muted }}>
            The pointer rests over a marked word: `onHover` hands the app the word's box on the page
            and the diagnostics there, and the app answers with a card — an `Overlay` anchored to
            that box, so it follows the word as the text scrolls. The card stays while the pointer
            is over it, so its fixes can be pressed; a fix rewrites the file, which the app owns.
          </Text>
          <View style={{ height: wide() ? 200 : 170, overflow: "hidden" }}>
            <Editor
              value={linted()}
              onChange={({ value }) => linted.set(value)}
              language="typescript"
              diagnostics={LINT}
              accessibilityLabel="Linted code"
              onHover={(event) => {
                clearTimeout(closeTimer);
                if (event.diagnostics.length === 0) {
                  if (!overCard) card.set(null);
                  return;
                }
                card.set({ anchor: event.pageBounds, diagnostics: event.diagnostics });
              }}
              onHoverEnd={closeSoon}
              style={{ flex: 1 }}
            />
          </View>
        </DemoSection>
      </DemoCard>

      {card() ? (
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
                    color: diagnostic.severity === "warning" ? ui().warn : ui().danger,
                  }}
                >
                  {`${diagnostic.severity ?? "error"}: ${diagnostic.message}`}
                </Text>
                {fixesFor(diagnostic.message).map((fix) => (
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ alignSelf: "flex-start" }}
                    onPress={() => {
                      linted.set(fix.apply(linted()));
                      card.set(null);
                    }}
                  >
                    {fix.title}
                  </Button>
                ))}
              </View>
            ))}
          </View>
        </Overlay>
      ) : null}
    </DemoPage>
  );
}

mount(App);
