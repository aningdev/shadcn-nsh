import { colors, focusRing } from "@shadcn-nsh/theme";
// Editor: the official gallery's scene (`references/nsh/examples/gallery/demos/EditorDemo.tsx`)
// with this library's editor and dock. The session around it — find bar, problems, hover,
// code actions, the simulated language server — is the app's, as upstream's is. The shell gives
// the screen a flex view, so the editor fills it as upstream's does.
import { Code, Search, SlidersHorizontal } from "lucide";
import type { Bounds, Point, ViewRef } from "nsh";
import {
  cleanup,
  computed,
  context,
  keymap,
  List,
  Overlay,
  platform,
  signal,
  Text,
  token,
  untracked,
  View,
  windowSize,
} from "nsh";
import {
  isAvailable as hasMenus,
  Menu as NativeMenu,
  type MenuItem as NativeMenuItem,
} from "nsh/desktop";

import { IconButton } from "@/packages/ui/button";
import { DockArea, type DockAreaRef, type DockTabValue } from "@/packages/ui/dock-area";
import {
  Editor,
  EditorFindBar,
  type EditorDecoration,
  type EditorDiagnostic,
  type EditorPosition,
  type EditorRange,
  type EditorRef,
  type EditorSearchResult,
  type EditorSelection,
} from "@/packages/ui/editor";
import { Icon } from "@/packages/ui/lib/icons";
import { popupSurface } from "@/packages/ui/lib/popup";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuTrigger,
  MenuItem,
  MenuLabel,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  menuHighlight,
  menuItemLabel,
  menuItemNote,
  menuItemSize,
  menuPopup,
} from "@/packages/ui/menu";
import { TextView } from "@/packages/ui/text-view";
import { toggleGlyph, toggleLabel, toggleLook } from "@/packages/ui/toggle";

import { SAMPLE } from "./editor-sample";
import { LanguageServer, type CodeAction, type DocumentColor, type Problem } from "./editor-server";

type Language = "rust" | "typescript" | "python" | "json";

/** A sample file of each language, with a linter's problems in it. */
const SAMPLES: Record<Language, { text: string; diagnostics: EditorDiagnostic[] }> = {
  rust: {
    text: `use std::collections::HashMap;

/// Counts the words of a text, most frequent first.
fn word_counts(text: &str) -> Vec<(&str, usize)> {
    let mut counts: HashMap<&str, usize> = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }
    let mut sorted: Vec<_> = counts.into_iter().collect();
    sorted.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));
    sorted
}

fn main() {
    let unused = 42;
    for (word, count) in word_counts("the quick fox jumps over the lazy dog the end") {
        println!("{word}: {count}");
    }
}
`,
    diagnostics: [
      {
        range: { start: { line: 14, column: 8 }, end: { line: 14, column: 14 } },
        severity: "warning",
        message: "unused variable: `unused`",
        source: "rustc",
        code: "unused_variables",
      },
    ],
  },
  typescript: { text: SAMPLE, diagnostics: [] },
  python: {
    text: `from dataclasses import dataclass


@dataclass
class Point:
    x: float
    y: float

    def distance(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


def perimeter(points):
    total = 0
    for a, b in zip(points, points[1:] + points[:1]):
        total += a.distance(b)
    return total


print(perimeter([Point(0, 0), Point(3, 0), Point(3, 4)]))
`,
    diagnostics: [
      {
        range: { start: { line: 12, column: 14 }, end: { line: 12, column: 20 } },
        severity: "info",
        message: "Missing type annotation for `points`",
        source: "mypy",
      },
    ],
  },
  json: {
    text: `{
  "name": "gallery",
  "version": "0.1.0",
  "entry": "App.tsx",
  "tailwind": {
    "theme": "theme.json"
  },
  "capabilities": ["network", "storage"],
  "debug": tru
}
`,
    diagnostics: [
      {
        range: { start: { line: 8, column: 11 }, end: { line: 8, column: 14 } },
        severity: "error",
        message: "Value expected",
        source: "json",
      },
    ],
  },
};

const LANGUAGES = [
  { value: "typescript", label: "TypeScript", file: "orders.ts" },
  { value: "rust", label: "Rust", file: "main.rs" },
  { value: "python", label: "Python", file: "shapes.py" },
  { value: "json", label: "JSON", file: "nsh.json" },
] as const;

const fileOf = (language: Language) => LANGUAGES.find((item) => item.value === language)!.file;

const same = (a: EditorRange, b: EditorRange) =>
  a.start.line === b.start.line &&
  a.start.column === b.start.column &&
  a.end.line === b.end.line &&
  a.end.column === b.end.column;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 || word === "info" ? "" : "s"}`;

const pointer = platform.desktop;

function severityColor(severity: EditorDiagnostic["severity"]) {
  switch (severity) {
    case "warning":
      return colors.warn;
    case "info":
      return colors.info;
    case "hint":
      return colors.mutedForeground;
    default:
      return colors.destructive;
  }
}

/** The hover card's docs: small type, the signature's code block without a box of its own. */
const HOVER_DOCS = {
  root: "gap-1.5 text-xs text-popover-foreground",
  paragraph: "text-xs",
  codeBlock: "bg-transparent border-0 rounded-none p-0",
  codeBlockScroll: "p-0",
  codeBlockCode: "p-0 text-xs",
};

interface HoverCard {
  anchor: Bounds;
  markdown: string | null;
  diagnostics: EditorDiagnostic[];
}

interface EditorModel {
  language: () => Language;
  setLanguage: (next: Language) => void;
  softWrap: () => boolean;
  setSoftWrap: (next: boolean) => void;
  lineNumbers: () => boolean;
  setLineNumbers: (next: boolean) => void;
  finding: () => boolean;
  setFinding: (next: boolean) => void;
  query: () => string;
  setQuery: (next: string) => void;
  caseSensitive: () => boolean;
  setCaseSensitive: (next: boolean) => void;
  wholeWord: () => boolean;
  setWholeWord: (next: boolean) => void;
  regex: () => boolean;
  setRegex: (next: boolean) => void;
  selections: () => EditorSelection[];
  setSelections: (next: EditorSelection[]) => void;
  result: () => EditorSearchResult;
  setResult: (next: EditorSearchResult) => void;
  last: () => string;
  setLast: (next: string) => void;
  problemsShown: () => boolean;
  setProblemsShown: (next: boolean) => void;
  analyzing: () => boolean;
  hover: () => HoverCard | null;
  setHover: (next: HoverCard | null) => void;
  quickFixes: () => { anchor: Point; actions: CodeAction[] } | null;
  setQuickFixes: (next: { anchor: Point; actions: CodeAction[] } | null) => void;
  menuOpen: () => "language" | "options" | null;
  setMenuOpen: (next: "language" | "options" | null) => void;
  editor: () => EditorRef | undefined;
  setEditor: (next: EditorRef | undefined) => void;
  area: () => DockAreaRef | undefined;
  setArea: (next: DockAreaRef | undefined) => void;
  toolbar: () => ViewRef | undefined;
  setToolbar: (next: ViewRef | undefined) => void;
  problems: () => Problem[];
  diagnostics: () => EditorDiagnostic[];
  decorations: () => EditorDecoration[];
  texts: () => Partial<Record<Language, string>>;
  noteText: (language: Language, value: string) => void;
  changed: (value: string) => void;
  typescript: () => boolean;
  caret: () => string;
  count: (severity: EditorDiagnostic["severity"]) => number;
  apply: (action: CodeAction) => void;
  openFind: () => void;
  closeFind: () => void;
  tips: () => string[];
  fixesFor: (diagnostic: EditorDiagnostic) => CodeAction[];
  showDefinition: (target: { name: string; range: EditorRange } | null) => void;
  contextMenu: (position: EditorPosition, x: number, y: number) => Promise<void>;
  onHover: (event: {
    position: EditorPosition;
    pageBounds: Bounds;
    diagnostics: EditorDiagnostic[];
  }) => Promise<void>;
  onHoverEnd: () => void;
  overCard: (next: boolean) => void;
  server: LanguageServer;
  bumpEdited: () => void;
}

const EditorContext = context<EditorModel | null>(null);

function useEditor(): EditorModel {
  const value = EditorContext();
  if (!value) throw new Error("Editor parts must be used within EditorDemo");
  return value;
}

function Dot(props: { severity: EditorDiagnostic["severity"] }) {
  return (
    <View
      style={{
        marginTop: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: severityColor(props.severity),
      }}
    />
  );
}

// The library's find bar over the editor: the search the app hands the editor is the object it
// edits, and its buttons run the editor's own commands.
function FindBar() {
  const m = useEditor();
  return (
    <Overlay
      anchor={m.toolbar()}
      placement="bottom"
      align="end"
      offset={4}
      margin={8}
      onCancel={m.closeFind}
    >
      <EditorFindBar
        editor={m.editor()}
        search={{
          query: m.query(),
          caseSensitive: m.caseSensitive(),
          wholeWord: m.wholeWord(),
          regex: m.regex(),
        }}
        onSearchChange={(next) => {
          m.setQuery(next.query);
          m.setCaseSensitive(!!next.caseSensitive);
          m.setWholeWord(!!next.wholeWord);
          m.setRegex(!!next.regex);
        }}
        result={m.result()}
        onClose={m.closeFind}
        style={{ width: Math.min(440, windowSize().width - 16) }}
      />
    </Overlay>
  );
}

function Source() {
  const m = useEditor();
  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {() => {
        const lang = m.language();
        const lsp = lang === "typescript";
        return (
          <Editor
            ref={(editor) => m.setEditor(editor)}
            defaultValue={m.texts()[lang] ?? SAMPLES[lang].text}
            language={lang}
            softWrap={m.softWrap()}
            lineNumbers={m.lineNumbers()}
            diagnostics={m.diagnostics()}
            decorations={m.decorations()}
            search={{
              query: m.finding() ? m.query() : "",
              caseSensitive: m.caseSensitive(),
              wholeWord: m.wholeWord(),
              regex: m.regex(),
            }}
            accessibilityLabel={`${lang} source`}
            completion={lsp}
            completionTriggerCharacters={["."]}
            inlineCompletionDelay={150}
            onChange={({ value }) => {
              m.noteText(lang, value);
              m.bumpEdited();
              if (lsp) m.changed(value);
            }}
            onSelectionChange={({ selections }) => m.setSelections(selections)}
            onSearchChange={({ result }) => m.setResult(result)}
            onFindWithSelection={({ query }) => {
              m.setQuery(query);
              m.setFinding(true);
            }}
            onLineNumberPress={({ line }) => m.setLast(`Line ${line + 1} pressed`)}
            onContextMenu={(event) => void m.contextMenu(event.position, event.x, event.y)}
            onHover={(event) => void m.onHover(event)}
            onHoverEnd={() => m.onHoverEnd()}
            onDefinitionRequest={async (event) => {
              const target = lsp ? await m.server.definition(event.position) : null;
              if (event.trigger === "hover") {
                if (target) m.editor()?.presentDefinitionLink(event.id, event.range);
              } else m.showDefinition(target);
            }}
            onCodeActionRequest={async (event) => {
              const actions = await m.server.codeActions(event.range, m.problems());
              const page = event.bounds?.pageBounds;
              if (!page) return;
              const anchor = { x: page.origin.x, y: page.origin.y + page.size.height };
              if (hasMenus) void NativeMenu.popup(menuItems(actions, m.apply), anchor);
              else m.setQuickFixes({ anchor, actions });
            }}
            onCompletionRequest={async (event) => {
              const answer = await m.server.completion(event);
              m.editor()?.presentCompletions(event.id, answer.items, answer.incomplete);
            }}
            onCompletionAccept={(event) => m.setLast(`Completed ${event.item.label}`)}
            onInlineCompletionRequest={async (event) => {
              const suggestion = await m.server.inlineCompletion(event.position);
              if (suggestion) m.editor()?.presentInlineCompletion(event.id, suggestion);
            }}
            style={{ flex: 1 }}
          />
        );
      }}
    </View>
  );
}

function menuItems(actions: CodeAction[], apply: (action: CodeAction) => void): NativeMenuItem[] {
  const fixes = actions.filter((action) => action.kind === "quickfix");
  const rest = actions.filter((action) => action.kind !== "quickfix");
  const item = (action: CodeAction): NativeMenuItem => ({
    label: action.title,
    onSelect: () => apply(action),
  });
  return [
    ...fixes.map(item),
    ...(fixes.length > 0 && rest.length > 0 ? [{ type: "separator" } as const] : []),
    ...rest.map(item),
  ];
}

function Problems() {
  const m = useEditor();
  return (
    <If
      when={m.problems().length > 0}
      else={
        <Text
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 12,
            color: colors.mutedForeground,
          }}
        >
          No problems
        </Text>
      }
    >
      <List each={m.problems()} estimatedItemSize={24} style={{ flex: 1 }}>
        {(problem) => (
          <View
            onPress={() => {
              const at = problem().diagnostic.range.start;
              m.editor()?.setSelections([{ anchor: at, head: at }]);
              m.editor()?.revealPosition(at, true);
              m.editor()?.focus();
            }}
            role="button"
            accessibilityLabel={problem().diagnostic.message}
            hoverStyle={{ backgroundColor: token("accent") }}
            activeStyle={{ opacity: 0.7 }}
            focusVisibleStyle={focusRing()}
            style={{ flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Dot severity={problem().diagnostic.severity} />
            <Text style={{ flex: 1, fontSize: 12, color: colors.foreground, numberOfLines: 1 }}>
              {problem().diagnostic.message}
            </Text>
            <Text
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: colors.mutedForeground,
                fontVariant: ["tabular-nums"],
              }}
            >
              {`${problem().diagnostic.range.start.line + 1}:${problem().diagnostic.range.start.column + 1}`}
            </Text>
          </View>
        )}
      </List>
    </If>
  );
}

function HoverCardView() {
  const m = useEditor();
  return (
    <If when={m.hover()}>
      {(card) => (
        <Overlay anchor={card().anchor} placement="top" align="start" offset={4} margin={8}>
          <View
            testID="hover-card"
            onMouseEnter={() => m.overCard(true)}
            onMouseLeave={() => m.overCard(false)}
            style={{
              ...popupSurface(),
              padding: 0,
              overflow: "hidden",
              maxWidth: Math.min(440, windowSize().width - 16),
            }}
          >
            <Each of={card().diagnostics}>
              {(diagnostic) => (
                <View style={{ gap: 2, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Dot severity={diagnostic().severity} />
                    <Text style={{ flexShrink: 1, fontSize: 12, color: colors.foreground }}>
                      {diagnostic().message}
                      <Text style={{ color: colors.mutedForeground }}>
                        {diagnostic().source ? `  ${diagnostic().source}` : ""}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      columnGap: 12,
                      paddingLeft: 14,
                    }}
                  >
                    <Each of={m.fixesFor(diagnostic())}>
                      {(fix) => (
                        <View
                          onPress={() => {
                            m.apply(fix());
                            m.setHover(null);
                          }}
                          role="button"
                          hoverStyle={{ opacity: 0.8 }}
                          activeStyle={{ opacity: 0.7 }}
                          focusVisibleStyle={focusRing()}
                          style={{ borderRadius: 2 }}
                        >
                          <Text style={{ fontSize: 12, color: colors.info }}>{fix().title}</Text>
                        </View>
                      )}
                    </Each>
                  </View>
                </View>
              )}
            </Each>
            <If when={card().markdown}>
              {(markdown) => (
                <TextView
                  markdown={markdown()}
                  selectable
                  classes={HOVER_DOCS}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    ...(card().diagnostics.length > 0
                      ? { borderTopWidth: 1, borderColor: colors.border }
                      : {}),
                  }}
                />
              )}
            </If>
          </View>
        </Overlay>
      )}
    </If>
  );
}

function QuickFixMenu() {
  const m = useEditor();
  return (
    <If when={m.quickFixes()}>
      {(menu) => (
        <Overlay
          anchor={menu().anchor}
          placement="bottom"
          align="start"
          margin={8}
          onPressOutside={() => m.setQuickFixes(null)}
          onCancel={() => m.setQuickFixes(null)}
        >
          <View role="menu" style={{ ...popupSurface(), minWidth: 224 }}>
            <Each of={menu().actions}>
              {(action) => (
                <View
                  onPress={() => {
                    m.setQuickFixes(null);
                    m.apply(action());
                  }}
                  role="button"
                  hoverStyle={menuHighlight()}
                  focusStyle={menuHighlight()}
                  style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                >
                  <Text style={menuItemLabel()}>{action().title}</Text>
                </View>
              )}
            </Each>
          </View>
        </Overlay>
      )}
    </If>
  );
}

function EditorToolbar() {
  const m = useEditor();
  return (
    <View
      ref={(node: ViewRef) => m.setToolbar(node)}
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        borderBottomWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 6,
      }}
    >
      <Menu onOpenChange={({ open }) => m.setMenuOpen(open ? "language" : null)}>
        <MenuTrigger>
          <View
            accessibilityLabel="Language"
            style={
              toggleLook({
                on: () => m.menuOpen() === "language",
                text: true,
                style: { paddingHorizontal: 6 },
              }).style
            }
          >
            <Icon icon={Code} {...toggleGlyph(false)} />
            <Text style={{ ...toggleLabel(true), fontSize: 12 }}>
              {LANGUAGES.find((item) => item.value === m.language())!.label}
            </Text>
          </View>
        </MenuTrigger>
        <MenuContent offset={4} margin={8} popupStyle={menuPopup({ minWidth: 220 }).popupStyle}>
          <Each of={LANGUAGES}>
            {(item) => (
              <MenuRadioItem
                checked={m.language() === item().value}
                onSelect={() => {
                  m.setHover(null);
                  m.setLanguage(item().value);
                }}
              >
                {item().label}
              </MenuRadioItem>
            )}
          </Each>
        </MenuContent>
      </Menu>
      <View style={{ flex: 1 }} />
      <IconButton
        accessibilityLabel="Find and replace"
        selected={m.finding()}
        onPress={() => (m.finding() ? m.closeFind() : m.openFind())}
        icon={Search}
      />
      <Menu onOpenChange={({ open }) => m.setMenuOpen(open ? "options" : null)}>
        <MenuTrigger>
          <View
            accessibilityLabel="Editor options"
            style={toggleLook({ on: () => m.menuOpen() === "options" }).style}
          >
            <Icon icon={SlidersHorizontal} {...toggleGlyph(() => m.menuOpen() === "options")} />
          </View>
        </MenuTrigger>
        <MenuContent
          align="end"
          offset={4}
          margin={8}
          popupStyle={menuPopup({ minWidth: 256 }).popupStyle}
        >
          <MenuCheckboxItem
            checked={m.softWrap()}
            closeOnSelect={false}
            onSelect={() => m.setSoftWrap(!m.softWrap())}
          >
            Soft wrap
          </MenuCheckboxItem>
          <MenuCheckboxItem
            checked={m.lineNumbers()}
            closeOnSelect={false}
            onSelect={() => m.setLineNumbers(!m.lineNumbers())}
          >
            Line numbers
          </MenuCheckboxItem>
          <MenuItem checked={m.problemsShown()} onSelect={() => m.area()?.toggleDock("bottom")}>
            Problems
          </MenuItem>
          <MenuItem onSelect={m.openFind}>
            Find and Replace
            <MenuShortcut>{keymap.label("mod+f")}</MenuShortcut>
          </MenuItem>
          <MenuSeparator />
          <MenuLabel inset>{m.typescript() ? "TypeScript language server" : "Keys"}</MenuLabel>
          <Each of={m.tips()}>
            {(tip) => (
              <Text
                style={{
                  ...menuItemNote(),
                  color: colors.mutedForeground,
                  paddingLeft: menuItemSize.icon + 16,
                  paddingRight: 8,
                  paddingVertical: 2,
                }}
              >
                {tip()}
              </Text>
            )}
          </Each>
        </MenuContent>
      </Menu>
    </View>
  );
}

function StatusBar() {
  const m = useEditor();
  return (
    <View
      style={{
        height: 28,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        overflow: "hidden",
        borderTopWidth: 1,
        borderColor: colors.border,
        paddingLeft: 10,
        paddingRight: 4,
      }}
    >
      <Text
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: colors.foreground,
          fontVariant: ["tabular-nums"],
          numberOfLines: 1,
        }}
      >
        {m.caret()}
      </Text>
      <Text
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: colors.destructive,
          numberOfLines: 1,
        }}
      >
        {plural(m.count("error"), "error")}
      </Text>
      <Text style={{ fontFamily: "monospace", fontSize: 11, color: colors.warn, numberOfLines: 1 }}>
        {plural(m.count("warning"), "warning")}
      </Text>
      <Text style={{ fontFamily: "monospace", fontSize: 11, color: colors.info, numberOfLines: 1 }}>
        {plural(m.count("info"), "info")}
      </Text>
      <If when={m.last() !== "—"}>
        <Text
          style={{
            flexShrink: 1,
            fontFamily: "monospace",
            fontSize: 11,
            color: colors.mutedForeground,
            numberOfLines: 1,
          }}
        >
          {m.last()}
        </Text>
      </If>
      <Text
        style={{
          marginLeft: "auto",
          flexShrink: 1,
          fontFamily: "monospace",
          fontSize: 11,
          color: colors.mutedForeground,
          numberOfLines: 1,
        }}
      >
        {m.typescript() && m.analyzing()
          ? "Analyzing…"
          : LANGUAGES.find((item) => item.value === m.language())!.label}
      </Text>
      <IconButton
        accessibilityLabel="Toggle problems"
        size="sm"
        selected={m.problemsShown()}
        onPress={() => m.area()?.toggleDock("bottom")}
        icon={SlidersHorizontal}
      />
    </View>
  );
}

function EditorScreen() {
  const m = useEditor();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <EditorToolbar />
      <If when={m.finding()}>
        <FindBar />
      </If>
      <View style={{ flex: 1 }}>
        <DockArea
          ref={(area) => m.setArea(area)}
          style={{ flex: 1 }}
          defaultLayout={{
            center: { type: "tabs", panels: ["editor"] },
            bottom: { layout: { type: "tabs", panels: ["problems"] }, size: 29 + 8 + 6 * 24 },
          }}
          panels={[
            { id: "editor", closable: false },
            { id: "problems", closable: false },
          ]}
          onDockOpenChange={({ placement, open }) => {
            if (placement === "bottom") m.setProblemsShown(open);
          }}
          handleAccessibilityLabel="Resize the problems"
          groupClass="bg-card"
          renderTab={(tab: DockTabValue) => (
            <View
              style={{
                height: 28,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: tab.active ? colors.foreground : colors.mutedForeground,
                  numberOfLines: 1,
                }}
              >
                {tab.panel === "editor" ? fileOf(m.language()) : `Problems ${m.problems().length}`}
              </Text>
              <If when={tab.active}>
                <View
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    bottom: 0,
                    left: 12,
                    right: 12,
                    height: 2,
                    borderRadius: 999,
                    backgroundColor: colors.brand,
                  }}
                />
              </If>
            </View>
          )}
          renderPanel={(panel) => (panel.id === "editor" ? <Source /> : <Problems />)}
        />
      </View>
      <HoverCardView />
      <QuickFixMenu />
      <StatusBar />
    </View>
  );
}

/** Code with highlighting, find and replace, and a simulated language server. */
export function EditorDemo() {
  const language = signal<Language>("typescript");
  const softWrap = signal(false);
  const lineNumbers = signal(true);
  const finding = signal(false);
  const query = signal("");
  const caseSensitive = signal(false);
  const wholeWord = signal(false);
  const regex = signal(false);
  const selections = signal<EditorSelection[]>([]);
  const result = signal<EditorSearchResult>({ count: 0 });
  const last = signal("—");
  // Each sample's text as last edited. A plain object, as upstream's: reading it must not
  // rebuild the editor on every keystroke. `edited` is what the gutter marks follow.
  const texts: Partial<Record<Language, string>> = {};
  const editor = signal<EditorRef | undefined>(undefined);
  const area = signal<DockAreaRef | undefined>(undefined);
  const toolbar = signal<ViewRef | undefined>(undefined);
  const problemsShown = signal(untracked(windowSize).width >= 600);
  const server = new LanguageServer();
  server.change(SAMPLE);
  const found = signal<Problem[]>([]);
  const literals = signal<DocumentColor[]>([]);
  const hover = signal<HoverCard | null>(null);
  const flash = signal<EditorRange | null>(null);
  const analyzing = signal(false);
  const quickFixes = signal<{ anchor: Point; actions: CodeAction[] } | null>(null);
  const menuOpen = signal<"language" | "options" | null>(null);
  const edited = signal(0);
  const lintTimer = signal<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = signal<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashTimer = signal<ReturnType<typeof setTimeout> | undefined>(undefined);
  const version = signal(0);
  const hoverAsked = signal(0);
  const pointerOverCard = signal(false);
  const typescript = () => language() === "typescript";

  const analyze = async () => {
    const asked = version() + 1;
    version.set(asked);
    analyzing.set(true);
    const [problems, colorsFound] = await Promise.all([server.diagnostics(), server.colors()]);
    if (asked !== version()) return;
    found.set(problems);
    literals.set(colorsFound);
    analyzing.set(false);
  };
  void analyze();

  const changed = (value: string) => {
    server.change(value);
    analyzing.set(true);
    const pending = lintTimer();
    if (pending) clearTimeout(pending);
    lintTimer.set(setTimeout(() => void analyze(), 300));
  };

  const problems = computed<Problem[]>(() =>
    typescript()
      ? found()
      : SAMPLES[language()].diagnostics.map((diagnostic) => ({ diagnostic, fixes: [] })),
  );
  const diagnostics = computed(() => problems().map((problem) => problem.diagnostic));
  const changes = computed<EditorDecoration[]>(() => {
    edited();
    const lang = language();
    const before = SAMPLES[lang].text.split("\n");
    const after = (texts[lang] ?? SAMPLES[lang].text).split("\n");
    let head = 0;
    while (head < before.length && head < after.length && before[head] === after[head]) head += 1;
    let tail = 0;
    while (
      tail < before.length - head &&
      tail < after.length - head &&
      before[before.length - 1 - tail] === after[after.length - 1 - tail]
    ) {
      tail += 1;
    }
    const removed = before.length - head - tail;
    const added = after.length - head - tail;
    const mark = (start: number, end: number, color: string): EditorDecoration => ({
      range: { start: { line: start, column: 0 }, end: { line: end, column: 0 } },
      gutter: { class: color },
      overviewRuler: { lane: "left", class: color },
    });
    const out: EditorDecoration[] = [];
    const modified = Math.min(removed, added);
    if (modified > 0) out.push(mark(head, head + modified, "bg-warn"));
    if (added > removed) out.push(mark(head + modified, head + added, "bg-up"));
    if (removed > added) {
      out.push({
        range: {
          start: { line: head + added, column: 0 },
          end: { line: head + added, column: 0 },
        },
        gutter: { class: "bg-destructive", placement: "before" },
        overviewRuler: { lane: "left", class: "bg-destructive" },
      });
    }
    return out;
  });
  const decorations = computed<EditorDecoration[]>(() => {
    const out: EditorDecoration[] = [
      ...changes(),
      ...diagnostics().map((diagnostic) => ({
        range: diagnostic.range,
        overviewRuler: {
          lane: "right" as const,
          class: (diagnostic.severity ?? "error") === "error" ? "bg-destructive" : "bg-warn",
        },
      })),
    ];
    if (!typescript()) return out;
    out.push(
      ...literals().map(({ range, color }) => ({
        range,
        // The file's own hex, tinted: a decoration color is data, not a theme role.
        style: { backgroundColor: `${color}40` },
      })),
    );
    const lit = flash();
    if (lit) out.push({ range: lit, class: "bg-brand/25", lineClass: "bg-brand/10" });
    return out;
  });

  const caret = () => {
    const primary = selections().at(-1);
    if (!primary) return "Ln 1, Col 1";
    const more = selections().length > 1 ? ` · ${selections().length} carets` : "";
    return `Ln ${primary.head.line + 1}, Col ${primary.head.column + 1}${more}`;
  };
  const apply = (action: CodeAction) => {
    const current = editor();
    if (!current) return;
    if (action.command) current.run(action.command);
    if (action.edits?.length) current.edit(action.edits);
    current.focus();
    last.set(action.title);
  };
  const showDefinition = (target: { name: string; range: EditorRange } | null) => {
    const current = editor();
    if (!target || !current) {
      last.set("No definition found");
      return;
    }
    const at = target.range.start;
    current.setSelections([{ anchor: at, head: at }]);
    current.revealPosition(at, true);
    flash.set(target.range);
    const pending = flashTimer();
    if (pending) clearTimeout(pending);
    flashTimer.set(setTimeout(() => flash() === target.range && flash.set(null), 900));
    last.set(`Definition of ${target.name} at ${at.line + 1}:${at.column + 1}`);
  };
  const closeSoon = () => {
    const pending = closeTimer();
    if (pending) clearTimeout(pending);
    closeTimer.set(
      setTimeout(() => {
        if (!pointerOverCard()) hover.set(null);
      }, 250),
    );
  };
  const contextMenu = async (position: EditorPosition, x: number, y: number) => {
    if (!hasMenus) return;
    const fixes = typescript()
      ? (await server.codeActions({ start: position, end: position }, problems())).filter(
          (action) => action.kind === "quickfix",
        )
      : [];
    const items: NativeMenuItem[] = [];
    if (typescript()) {
      items.push(
        {
          label: "Go to Definition",
          shortcut: "f12",
          onSelect: () => void server.definition(position).then(showDefinition),
        },
        { type: "separator" },
      );
    }
    if (fixes.length > 0) items.push(...menuItems(fixes, apply), { type: "separator" });
    items.push(
      { label: "Cut", onSelect: () => editor()?.run("cut") },
      { label: "Copy", onSelect: () => editor()?.run("copy") },
      { label: "Paste", onSelect: () => editor()?.run("paste") },
      { label: "Select All", onSelect: () => editor()?.run("selectAll") },
      { type: "separator" },
      { label: "Toggle Comment", onSelect: () => editor()?.run("toggleComment") },
      { label: "Fold All", onSelect: () => editor()?.run("foldAll") },
      { label: "Unfold All", onSelect: () => editor()?.run("unfoldAll") },
    );
    void NativeMenu.popup(items, { x, y });
  };
  const apple = keymap.label("mod+a").startsWith("⌘");
  const tips = () =>
    typescript()
      ? [
          `${keymap.label("ctrl+space")} completions (also as you type and after a dot)`,
          "Tab takes the gray suggestion",
          ...(pointer
            ? [
                "Hover for docs and problems",
                `Hold ${apple ? "⌘" : "Ctrl"} over a name to underline it`,
              ]
            : []),
          `${keymap.label("f12")} or ${apple ? "⌘" : "Ctrl"}-click: go to definition`,
          `${keymap.label("mod+.")} code actions`,
        ]
      : [
          `${keymap.label("mod+.")} code actions`,
          pointer ? "Right-click for commands" : "Long-press to select",
        ];
  const openFind = () => {
    const primary = selections().at(-1);
    if (
      primary &&
      (primary.anchor.line !== primary.head.line || primary.anchor.column !== primary.head.column)
    ) {
      editor()?.run("findWithSelection");
    }
    finding.set(true);
  };
  const closeFind = () => {
    finding.set(false);
    query.set("");
    editor()?.focus();
  };
  const fixesFor = (diagnostic: EditorDiagnostic) =>
    problems().find(
      (problem) =>
        problem.diagnostic.message === diagnostic.message &&
        same(problem.diagnostic.range, diagnostic.range),
    )?.fixes ?? [];

  keymap.bind("ctrl+space", () => editor()?.showCompletions());
  keymap.bind("mod+f", openFind);
  cleanup(() => {
    const lint = lintTimer();
    const closing = closeTimer();
    const flashing = flashTimer();
    if (lint) clearTimeout(lint);
    if (closing) clearTimeout(closing);
    if (flashing) clearTimeout(flashing);
  });

  const model: EditorModel = {
    language,
    setLanguage: (next) => language.set(next),
    softWrap,
    setSoftWrap: (next) => softWrap.set(next),
    lineNumbers,
    setLineNumbers: (next) => lineNumbers.set(next),
    finding,
    setFinding: (next) => finding.set(next),
    query,
    setQuery: (next) => query.set(next),
    caseSensitive,
    setCaseSensitive: (next) => caseSensitive.set(next),
    wholeWord,
    setWholeWord: (next) => wholeWord.set(next),
    regex,
    setRegex: (next) => regex.set(next),
    selections,
    setSelections: (next) => selections.set(next),
    result,
    setResult: (next) => result.set(next),
    last,
    setLast: (next) => last.set(next),
    problemsShown,
    setProblemsShown: (next) => problemsShown.set(next),
    analyzing,
    hover,
    setHover: (next) => hover.set(next),
    quickFixes,
    setQuickFixes: (next) => quickFixes.set(next),
    menuOpen,
    setMenuOpen: (next) => menuOpen.set(next),
    editor,
    setEditor: (next) => editor.set(next),
    area,
    setArea: (next) => area.set(next),
    toolbar,
    setToolbar: (next) => toolbar.set(next),
    problems,
    diagnostics,
    decorations,
    texts: () => texts,
    noteText: (lang, value) => {
      texts[lang] = value;
    },
    changed,
    typescript,
    caret,
    count: (severity) =>
      diagnostics().filter((item) => (item.severity ?? "error") === severity).length,
    apply,
    openFind,
    closeFind,
    tips,
    fixesFor,
    showDefinition,
    contextMenu,
    onHover: async (event) => {
      const pending = closeTimer();
      if (pending) clearTimeout(pending);
      const asked = hoverAsked() + 1;
      hoverAsked.set(asked);
      const answer = typescript() ? await server.hover(event.position) : null;
      if (asked !== hoverAsked()) return;
      hover.set(
        answer || event.diagnostics.length > 0
          ? {
              anchor: event.pageBounds,
              markdown: answer?.markdown ?? null,
              diagnostics: event.diagnostics,
            }
          : null,
      );
    },
    onHoverEnd: () => {
      hoverAsked.set(hoverAsked() + 1);
      closeSoon();
    },
    overCard: (next) => {
      pointerOverCard.set(next);
      if (next) {
        const pending = closeTimer();
        if (pending) clearTimeout(pending);
      } else closeSoon();
    },
    server,
    bumpEdited: () => edited.set(edited() + 1),
  };

  return (
    <EditorContext.Provider value={model}>
      <EditorScreen />
    </EditorContext.Provider>
  );
}
