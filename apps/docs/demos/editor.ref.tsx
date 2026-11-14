// The reference of `editor.tsx`: the same scenes on `nsh/base`'s Editor and RichEditor, the way
// the official examples (`references/nsh/website/demos/el-editor.tsx`, `el-rich-editor.tsx`)
// write them: the code editor as is, the rich one with `richEditorClasses` spread on it. It
// differs from the component page only in the parts it names.
import { mono } from "@shadcn-nsh/theme";
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import {
  command,
  createRichEditor,
  Editor,
  type EditorDiagnostic,
  type EditorRef,
  type EditorSearchResult,
  type RichCommand,
  redo,
  RichEditor,
  StarterKit,
  ToggleGroup,
  undo,
} from "nsh/base";

import { Button, buttonGlyph } from "@/packages/ui/button";
import { richEditorClasses } from "@/packages/ui/editor";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Toggle } from "@/packages/ui/toggle";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/packages/ui/toolbar";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, wide } from "./stage";

const SAMPLES = {
  rust: `/// The n-th Fibonacci number.
fn fib(n: u64) -> u64 {
    match n {
        0 | 1 => n,
        _ => fib(n - 1) + fib(n - 2),
    }
}

fn main() {
    let unused = 0;
    for n in 0..10 {
        println!("fib({n}) = {}", fib(n));
    }
}
`,
  typescript: `type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.r ** 2;
    case "square":
      return shape.side ** 2;
  }
}

console.log(area({ kind: "circle", r: 2 }));
`,
  json: `{
  "name": "my-app",
  "entry": "App.tsx",
  "capabilities": ["network"]
}
`,
} as const;

type Language = keyof typeof SAMPLES;

// A problem to mark in each file, as a linter would report it.
const PROBLEMS: Record<Language, EditorDiagnostic[]> = {
  rust: [
    {
      range: { start: { line: 9, column: 8 }, end: { line: 9, column: 14 } },
      severity: "warning",
      message: "unused variable",
    },
  ],
  typescript: [],
  json: [],
};

const CONTENT = `# A document

Type **Markdown** as you go: \`#\` makes a heading, \`-\` a list, \`[ ]\` a task, each followed by a space.

- Select text and press Bold
- Undo and redo keep every step
`;

function App() {
  const language = signal<Language>("rust");
  const wrap = signal<"Scroll" | "Wrap">("Scroll");
  const query = signal("");
  const caret = signal("1:1");
  const found = signal<EditorSearchResult>({ count: 0 });
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  let code: EditorRef | undefined;

  // The rich document: the session owns it, the view renders it, the toolbar runs its commands.
  const doc = createRichEditor({ extensions: [StarterKit], content: CONTENT, format: "markdown" });
  const markdown = signal(doc.getMarkdown());
  const revision = signal(0);
  const richEvents = signal<string[]>([]);
  const richLog = (line: string) => richEvents.set([line, ...richEvents()].slice(0, 4));
  doc.on("revision", ({ revision: r }) => {
    revision.set(r);
    markdown.set(doc.getMarkdown());
  });
  doc.on("focus", () => richLog("focus"));
  doc.on("blur", () => richLog("blur"));
  // Read again on every change of the session, the selection's included.
  const active = (name: string, attrs?: Record<string, unknown>) => (
    revision(),
    doc.isActive(name, attrs)
  );
  const can = (cmd: RichCommand) => (revision(), doc.can(cmd));
  const run = (cmd: RichCommand) => {
    doc.run(cmd);
    doc.focus();
  };

  /** A format that is on or off at the selection: a `Toggle`. */
  const format = (label: string, on: () => boolean, cmd: RichCommand) => (
    <Toggle size="sm" pressed={on()} onChange={() => run(cmd)}>
      {label}
    </Toggle>
  );
  /** An action (undo, redo): an icon button, named for screen readers, enabled while it can run. */
  const action = (label: string, cmd: () => RichCommand, mirrored?: boolean) => (
    <Button
      variant="ghost"
      size="small"
      accessibilityLabel={label}
      disabled={!can(cmd())}
      onPress={() => run(cmd())}
    >
      <View style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Icon
          name="undo"
          {...buttonGlyph("ghost", { size: "small", disabled: () => !can(cmd()) })}
        />
      </View>
    </Button>
  );

  return (
    <DemoPage title="Editor">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click into the code and type; Alt-click adds a caret, Cmd/Ctrl+D the next match"
          : "Tap into the code and type"}
      </Text>

      <Split
        width={640}
        gap={14}
        inspector={
          <>
            <Segmented
              label="language"
              options={["rust", "typescript", "json"] as const}
              value={language()}
              onChange={(value) => language.set(value)}
            />
            <Segmented
              label="long lines"
              options={["Scroll", "Wrap"] as const}
              value={wrap()}
              onChange={(value) => wrap.set(value)}
            />
            <Panel title="find">
              <Input
                value={query()}
                onChange={({ value }) => query.set(value)}
                onSubmit={() => code?.run("findNext")}
                submitBehavior="submit"
                placeholder="fib"
                accessibilityLabel="Find"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={{ fontSize: 13, fontVariant: ["tabular-nums"], color: colors.text }}>
                {query()
                  ? (found().error ??
                    `${found().current == null ? "–" : found().current! + 1} of ${found().count}`)
                  : "–"}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button variant="secondary" size="small" onPress={() => code?.run("findNext")}>
                  Next
                </Button>
                <Button variant="secondary" size="small" onPress={() => code?.run("undo")}>
                  Undo
                </Button>
              </View>
            </Panel>
            <Panel title="caret">
              <Text style={{ fontSize: 13, fontVariant: ["tabular-nums"], color: colors.text }}>
                {caret()}
              </Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={96} />
          </>
        }
      >
        <View style={{ height: wide() ? 380 : 300, ...sectionSurface(), overflow: "hidden" }}>
          {() => {
            const lang = language();
            return (
              <Editor
                ref={(r) => (code = r)}
                defaultValue={SAMPLES[lang]}
                language={lang}
                softWrap={wrap() === "Wrap"}
                search={{ query: query() }}
                diagnostics={PROBLEMS[lang]}
                accessibilityLabel="Code"
                onChange={({ value }) => log(`onChange: ${value.length} characters`)}
                onSelectionChange={({ selections }) => {
                  const head = selections[selections.length - 1].head;
                  caret.set(
                    `${head.line + 1}:${head.column + 1}${selections.length > 1 ? ` (${selections.length} carets)` : ""}`,
                  );
                }}
                onSearchChange={({ result }) => found.set(result)}
                onFocus={() => log("onFocus")}
                onBlur={() => log("onBlur")}
                onLineNumberPress={({ line }) => log(`onLineNumberPress: ${line + 1}`)}
                onContextMenu={(e) =>
                  log(`onContextMenu: ${e.position.line + 1}:${e.position.column + 1}`)
                }
                style={{ flex: 1 }}
              />
            );
          }}
        </View>
      </Split>

      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click into the document and type; Cmd/Ctrl+B makes bold"
          : "Tap into the document and type"}
      </Text>
      <Split
        width={640}
        gap={14}
        inspector={
          <>
            <Panel title="markdown">
              <Text style={{ fontSize: 12, fontFamily: mono, color: colors.text }}>
                {markdown()}
              </Text>
            </Panel>
            <Log title="events" lines={richEvents()} minHeight={72} />
          </>
        }
      >
        <Toolbar
          accessibilityLabel="Formatting"
          style={{ alignSelf: "flex-start", flexWrap: "wrap" }}
        >
          <ToolbarGroup style={{ flexDirection: "row", gap: 2 }}>
            {format("Bold", () => active("bold"), command("toggleBold"))}
            {format("Italic", () => active("italic"), command("toggleItalic"))}
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup style={{ flexDirection: "row", gap: 2 }}>
            {format(
              "Heading",
              () => active("heading", { level: 2 }),
              command("toggleHeading", { level: 2 }),
            )}
            {format("List", () => active("bulletList"), command("toggleBulletList"))}
            {format("Task", () => active("taskList"), command("toggleTaskList"))}
          </ToolbarGroup>
          <ToolbarSeparator />
          {action("Undo", undo)}
          {action("Redo", redo, true)}
        </Toolbar>
        <View style={{ height: wide() ? 360 : 300, ...sectionSurface(), overflow: "hidden" }}>
          <RichEditor
            editor={doc}
            accessibilityLabel="Document"
            placeholder="Write something"
            classes={richEditorClasses}
            style={{ flex: 1 }}
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
