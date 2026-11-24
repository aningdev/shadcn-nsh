// The reference of `editor.tsx`: the same page with `editorClasses` and `editorFrame()` on
// `nsh/base`'s Editor, the way the editor is written without a shell.
// It differs from the component page only in what it names.
import { colors } from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp, Replace, ReplaceAll, X } from "lucide";
import {
  type Bounds,
  cleanup,
  mount,
  Overlay,
  signal,
  Text,
  View,
  type InputRef,
  type ViewStyle,
} from "nsh";
import {
  Editor,
  type EditorDiagnostic,
  type EditorRange,
  type EditorRef,
  type EditorSearch,
  type EditorSearchResult,
} from "nsh/base";

import { Button, buttonGlyph } from "@/packages/ui/button";
import { editorClasses, editorFrame } from "@/packages/ui/editor";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/packages/ui/input-group";
import { Icon } from "@/packages/ui/lib/icons";
import { popupSurface } from "@/packages/ui/lib/popup";
import { popoverLook } from "@/packages/ui/popover";
import { Toggle } from "@/packages/ui/toggle";

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

/**
 * What the bar says about the search, from the result the editor handed the app.
 */
function countLabel(search: EditorSearch, result: EditorSearchResult | null): string {
  if (!search.query) return "";
  if (result?.error) return "Invalid pattern";
  const count = result?.count ?? 0;
  if (count === 0) return "No results";
  const current = result?.current;
  return current === undefined || current === null
    ? `${count} matches`
    : `${current + 1} of ${count}`;
}

/**
 * The find bar, drawn by hand: the query with its count, the three modes and the two steps, and
 * the line that replaces — the app's search edited back through `onSearchChange`, and the
 * editor's own commands behind the buttons.
 */
function FindBar(props: {
  editor: EditorRef | null;
  search: EditorSearch;
  onSearchChange: (search: EditorSearch) => void;
  result: EditorSearchResult | null;
  onClose: () => void;
  style: ViewStyle;
}) {
  const replacement = signal("");
  const replaced = signal<number | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => clearTimeout(timer));
  const set = (change: Partial<EditorSearch>) =>
    props.onSearchChange({ ...props.search, ...change });
  const replace = () => props.editor?.replace(replacement());
  const replaceAll = () => {
    void props.editor?.replaceAll(replacement()).then(({ count }) => {
      replaced.set(count);
      clearTimeout(timer);
      timer = setTimeout(() => replaced.set(null), 2000);
    });
  };
  const count = () => {
    const replaces = replaced();
    return replaces === null ? countLabel(props.search, props.result) : `Replaced ${replaces}`;
  };
  const glyph = buttonGlyph("ghost", { size: "sm" });
  return (
    <View style={[{ ...popupSurface(), gap: 4 }, props.style]}>
      <InputGroup invalid={!!props.result?.error}>
        <InputGroupInput
          ref={(node: InputRef) => {
            node.focus();
            if (props.search.query) node.setSelection(0, props.search.query.length);
          }}
          value={props.search.query}
          onChange={({ value }) => set({ query: value })}
          onSubmit={() => props.editor?.run("findNext")}
          submitBehavior="submit"
          placeholder="Find"
          accessibilityLabel="Find"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <InputGroupAddon align="inline-end">
          <Text
            style={{
              numberOfLines: 1,
              paddingHorizontal: 4,
              fontFamily: "monospace",
              fontSize: 11,
              color: colors.mutedForeground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {count()}
          </Text>
          <Toggle
            pressed={!!props.search.caseSensitive}
            onChange={() => set({ caseSensitive: !props.search.caseSensitive })}
            text
            size="sm"
            accessibilityLabel="Match case"
          >
            Aa
          </Toggle>
          <Toggle
            pressed={!!props.search.wholeWord}
            onChange={() => set({ wholeWord: !props.search.wholeWord })}
            text
            size="sm"
            accessibilityLabel="Whole word"
          >
            W
          </Toggle>
          <Toggle
            pressed={!!props.search.regex}
            onChange={() => set({ regex: !props.search.regex })}
            text
            size="sm"
            accessibilityLabel="Regular expression"
          >
            .*
          </Toggle>
          <InputGroupButton
            size="icon-xs"
            accessibilityLabel="Previous match"
            onPress={() => props.editor?.run("findPrevious")}
          >
            <Icon icon={ArrowUp} {...glyph} />
          </InputGroupButton>
          <InputGroupButton
            size="icon-xs"
            accessibilityLabel="Next match"
            onPress={() => props.editor?.run("findNext")}
          >
            <Icon icon={ArrowDown} {...glyph} />
          </InputGroupButton>
          <InputGroupButton
            size="icon-xs"
            accessibilityLabel="Close the find bar"
            onPress={() => props.onClose()}
          >
            <Icon icon={X} {...glyph} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput
          value={replacement()}
          onChange={({ value }) => replacement.set(value)}
          onSubmit={replace}
          submitBehavior="submit"
          placeholder="Replace"
          accessibilityLabel="Replace"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            accessibilityLabel="Replace this match"
            onPress={replace}
          >
            <Icon icon={Replace} {...glyph} />
          </InputGroupButton>
          <InputGroupButton
            size="icon-xs"
            accessibilityLabel="Replace all matches"
            onPress={replaceAll}
          >
            <Icon icon={ReplaceAll} {...glyph} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </View>
  );
}

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

  const findEditor = signal<EditorRef | null>(null);
  const finding = signal(true);
  const search = signal<EditorSearch>({ query: "circle" });
  const found = signal<EditorSearchResult | null>(null);
  const searched = signal<string>(SAMPLES.typescript);

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
                classes={editorClasses}
                onSelectionChange={({ selections }) => {
                  const head = selections[selections.length - 1].head;
                  caret.set(`${head.line + 1}:${head.column + 1}`);
                }}
                onFocus={() => log("onFocus")}
                onBlur={() => log("onBlur")}
                style={[editorFrame(), { flex: 1 }]}
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
              ref={(editor) => findEditor.set(editor)}
              value={searched()}
              onChange={({ value }) => searched.set(value)}
              language="typescript"
              accessibilityLabel="Searched code"
              search={finding() ? search() : null}
              onSearchChange={({ result }) => found.set(result)}
              classes={editorClasses}
              style={[editorFrame(), { flex: 1 }]}
            />
            {() => {
              const editor = findEditor();
              return editor ? (
                <FindBar
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
              classes={editorClasses}
              onHover={(event) => {
                clearTimeout(closeTimer);
                if (event.diagnostics.length === 0) {
                  if (!overCard) card.set(null);
                  return;
                }
                card.set({ anchor: event.pageBounds, diagnostics: event.diagnostics });
              }}
              onHoverEnd={closeSoon}
              style={[editorFrame(), { flex: 1 }]}
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
