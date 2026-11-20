import { alpha, colors, mono, radius, rounded } from "@shadcn-nsh/theme";
// RichEditor: the official gallery's scene
// (`references/nsh/examples/gallery/demos/RichEditorDemo.tsx`, with its link menu, toolbar and
// node views). The document is this library's session API (`nsh/base`'s, re-exported beside the
// view), and the view is this library's `RichEditor`. The shell gives the screen a flex view, so
// the document and the node views split it as upstream's do.
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Bold,
  ChartCandlestick,
  Check,
  Code,
  Columns3,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Maximize2,
  Minimize2,
  Minus,
  PanelTop,
  Pencil,
  Pilcrow,
  Plus,
  Redo2,
  RefreshCw,
  Rows3,
  SquareCode,
  Strikethrough,
  Table,
  TableCellsMerge,
  TableCellsSplit,
  TextQuote,
  Trash2,
  Undo2,
  Unlink,
  X,
  type IconNode,
} from "lucide";
import { openUrl, Overlay, signal, Text, View } from "nsh";

import { IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { popupSurface } from "@/packages/ui/lib/popup";
import {
  chain,
  command,
  createRichEditor,
  defineExtension,
  extendMarkRange,
  insertContent,
  redo,
  RichEditor,
  RichEditorPlugin,
  richEditorClasses,
  type RichCommand,
  type RichEditorSession,
  type RichNodeJSON,
  type RichNodeViewProps,
  StarterKit,
  TableKit,
  undo,
} from "@/packages/ui/rich-editor";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Separator } from "@/packages/ui/separator";
import { Toggle, ToggleGroup } from "@/packages/ui/toggle";

const DOC = `# Release notes

Type **Markdown** as you go: \`#\` and a space makes a heading, \`-\` a list, \`1.\` a numbered one, \`>\` a quote.

- Lists split on Enter
- Tab indents an item, Shift-Tab outdents it
  - The list buttons change every level at once
  - And take the selected items out of every level

Links open a menu under the caret: read the [NSH documentation](https://github.com/longbridge/nsh), edit it, or remove it. Select text and press Mod-K to link it.

> Select text and use the toolbar, or Mod-B and Mod-I.

## Details

Drag to select past the editor's edge and the document scrolls along. The zoom button in the toolbar gives the editor the whole screen.

1. Undo and redo keep every step
2. The document is Markdown when you switch to it below
3. Code, quotes and rules are blocks of their own

| Key | In a table |
| --- | --- |
| Tab | The next cell, a new row after the last |
| Shift-Tab | The previous cell |

---

\`\`\`
const editor = createRichEditor({ extensions: [StarterKit] });
\`\`\`
`;

type Block = "paragraph" | "h1" | "h2" | "h3" | "code";
type Mark = "bold" | "italic" | "strike" | "code" | "link";
type Wrap = "bullet" | "ordered" | "task" | "quote";

const BLOCKS: { value: Block; icon: IconNode; label: string }[] = [
  { value: "paragraph", icon: Pilcrow, label: "Text" },
  { value: "h1", icon: Heading1, label: "Heading 1" },
  { value: "h2", icon: Heading2, label: "Heading 2" },
  { value: "h3", icon: Heading3, label: "Heading 3" },
  { value: "code", icon: SquareCode, label: "Code block" },
];

const MARKS: { value: Mark; icon: IconNode; label: string }[] = [
  { value: "bold", icon: Bold, label: "Bold" },
  { value: "italic", icon: Italic, label: "Italic" },
  { value: "strike", icon: Strikethrough, label: "Strikethrough" },
  { value: "code", icon: Code, label: "Inline code" },
  { value: "link", icon: Link2, label: "Link" },
];

const WRAPS: { value: Wrap; icon: IconNode; label: string }[] = [
  { value: "bullet", icon: List, label: "Bulleted list" },
  { value: "ordered", icon: ListOrdered, label: "Numbered list" },
  { value: "task", icon: ListTodo, label: "Task list" },
  { value: "quote", icon: TextQuote, label: "Quote" },
];

const MARK_COMMANDS: Record<Exclude<Mark, "link">, string> = {
  bold: "toggleBold",
  italic: "toggleItalic",
  strike: "toggleStrike",
  code: "toggleCode",
};

const WRAP_COMMANDS: Record<Wrap, string> = {
  bullet: "toggleBulletList",
  ordered: "toggleOrderedList",
  task: "toggleTaskList",
  quote: "toggleBlockquote",
};

const WRAP_TYPES: Record<Wrap, string> = {
  bullet: "bulletList",
  ordered: "orderedList",
  task: "taskList",
  quote: "blockquote",
};

const TABLE_ACTIONS: { icon: IconNode; label: string; command: string }[] = [
  { icon: BetweenHorizontalStart, label: "Add row before", command: "addRowBefore" },
  { icon: BetweenHorizontalEnd, label: "Add row after", command: "addRowAfter" },
  { icon: BetweenVerticalEnd, label: "Add column before", command: "addColumnBefore" },
  { icon: BetweenVerticalStart, label: "Add column after", command: "addColumnAfter" },
  { icon: Rows3, label: "Delete row", command: "deleteRow" },
  { icon: Columns3, label: "Delete column", command: "deleteColumn" },
  { icon: TableCellsMerge, label: "Merge cells", command: "mergeCells" },
  { icon: TableCellsSplit, label: "Split cell", command: "splitCell" },
  { icon: PanelTop, label: "Toggle header row", command: "toggleHeaderRow" },
  { icon: Trash2, label: "Delete table", command: "deleteTable" },
];

const INSERT_TABLE = command("insertTable", { rows: 3, cols: 3, withHeaderRow: true });

function blockCommand(block: Block, pressed: boolean): RichCommand {
  if (!pressed || block === "paragraph") return command("setParagraph");
  if (block === "code") return command("toggleCodeBlock");
  return command("toggleHeading", { level: Number(block[1]) });
}

/** A square tool. The library's icon button; upstream draws the same square on a bare button. */
function ToolIcon(props: {
  icon: IconNode;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <IconButton accessibilityLabel={props.label} disabled={props.disabled} onPress={props.onPress}>
      <Icon icon={props.icon} {...iconButtonGlyph({ disabled: () => props.disabled })} />
    </IconButton>
  );
}

function ToolbarSeparator() {
  return (
    <Separator
      orientation="vertical"
      style={{ height: 20, alignSelf: "center", marginHorizontal: 4 }}
    />
  );
}

/** What the link menu shows: nothing, a link's actions, or the address field. */
type LinkMode = "closed" | "link" | "edit";

/** The link menu's state, shared by the toolbar's button and the bubble menu. */
function createLinkMenu(editor: RichEditorSession, revision: () => number) {
  const editing = signal(false);
  const draft = signal("");
  const href = () => {
    void revision();
    const value = (editor.getAttributes("link") as { href?: unknown }).href;
    return typeof value === "string" ? value : "";
  };
  const inLink = () => {
    void revision();
    return editor.isActive("link");
  };
  const mode = (): LinkMode => (editing() ? "edit" : inLink() ? "link" : "closed");
  const edit = () => {
    draft.set(href());
    editing.set(true);
  };
  const close = () => {
    editing.set(false);
    // After this key: on the web the Enter that submitted the field is still being handled.
    setTimeout(() => editor.focus(), 0);
  };
  const apply = () => {
    const url = draft().trim();
    if (!url) {
      editor.run(chain([extendMarkRange("link"), command("unsetLink")]));
    } else if (inLink() || !editor.selection.empty) {
      editor.run(chain([extendMarkRange("link"), command("setLink", { href: url })]));
    } else {
      editor.run(
        insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }),
      );
    }
    close();
  };
  const remove = () => {
    editor.run(chain([extendMarkRange("link"), command("unsetLink")]));
    editor.focus();
  };
  return { mode, href, draft, edit, close, apply, remove };
}

type LinkMenu = ReturnType<typeof createLinkMenu>;

/** The bubble menu: a link's address and actions, or the address field. */
function LinkBubble(props: { menu: LinkMenu }) {
  const menu = props.menu;
  return (
    <View
      testID="link-menu"
      style={{ ...popupSurface(), flexDirection: "row", alignItems: "center", gap: 2 }}
    >
      <If
        when={menu.mode() === "edit"}
        else={
          <>
            <Text
              style={{
                numberOfLines: 1,
                maxWidth: 260,
                paddingHorizontal: 8,
                fontSize: 13,
                color: colors.info,
              }}
            >
              {menu.href()}
            </Text>
            <ToolIcon icon={Pencil} label="Edit link" onPress={menu.edit} />
            <ToolIcon
              icon={ExternalLink}
              label="Open link"
              onPress={() => void openUrl(menu.href())}
            />
            <ToolIcon icon={Unlink} label="Remove link" onPress={menu.remove} />
          </>
        }
      >
        <Input
          ref={(node: { focus(): void }) => node.focus()}
          value={menu.draft()}
          onChange={({ value }) => menu.draft.set(value)}
          onSubmit={menu.apply}
          submitBehavior="submit"
          placeholder="https://"
          accessibilityLabel="Link address"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={{ flex: 1, minWidth: 220 }}
        />
        <ToolIcon icon={Check} label="Apply link" onPress={menu.apply} />
        <ToolIcon icon={X} label="Cancel" onPress={menu.close} />
      </If>
    </View>
  );
}

function Toolbar(props: {
  editor: RichEditorSession;
  revision: () => number;
  link: LinkMenu;
  zoomed: boolean;
  onZoom: () => void;
}) {
  const editor = props.editor;
  const on = (name: string, attrs?: Record<string, unknown>) => {
    void props.revision();
    return editor.isActive(name, attrs);
  };
  const can = (cmd: RichCommand) => {
    void props.revision();
    return editor.can(cmd);
  };
  const run = (cmd: RichCommand) => {
    editor.run(cmd);
    editor.focus();
  };
  const block = (): Block[] => {
    if (on("codeBlock")) return ["code"];
    for (const level of [1, 2, 3] as const) if (on("heading", { level })) return [`h${level}`];
    return on("paragraph") ? ["paragraph"] : [];
  };
  const marks = (): Mark[] => MARKS.map((item) => item.value).filter((item) => on(item));
  const wraps = (): Wrap[] => {
    void props.revision();
    const lists = (["bullet", "ordered", "task"] as const)
      .map((kind) => ({
        kind,
        found: editor.findParentNode(WRAP_TYPES[kind]) as { depth: number } | null,
      }))
      .filter((item) => item.found)
      .sort((a, b) => b.found!.depth - a.found!.depth);
    return [
      ...lists.slice(0, 1).map((item) => item.kind),
      ...(on("blockquote") ? (["quote"] as const) : []),
    ];
  };
  const indent = command("sinkListItem", { name: "listItem" });
  const outdent = command("liftListItem", { name: "listItem" });
  return (
    <View
      testID="toolbar"
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        rowGap: 6,
        columnGap: 2,
      }}
    >
      <ToolIcon icon={Undo2} label="Undo" disabled={!can(undo())} onPress={() => run(undo())} />
      <ToolIcon icon={Redo2} label="Redo" disabled={!can(redo())} onPress={() => run(redo())} />
      <ToolbarSeparator />
      <ToggleGroup inset={false}>
        <Each of={BLOCKS}>
          {(item) => (
            <Toggle
              pressed={block().includes(item().value)}
              disabled={!can(blockCommand(item().value, true))}
              accessibilityLabel={item().label}
              onChange={({ pressed }) => run(blockCommand(item().value, pressed))}
            >
              <Icon icon={item().icon} size={16} tint={colors.foreground} />
            </Toggle>
          )}
        </Each>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToggleGroup inset={false}>
        <Each of={MARKS}>
          {(item) => (
            <Toggle
              pressed={marks().includes(item().value)}
              disabled={
                item().value !== "link" &&
                !can(command(MARK_COMMANDS[item().value as Exclude<Mark, "link">]))
              }
              accessibilityLabel={item().label}
              onChange={() =>
                item().value === "link"
                  ? props.link.edit()
                  : run(command(MARK_COMMANDS[item().value as Exclude<Mark, "link">]))
              }
            >
              <Icon icon={item().icon} size={16} tint={colors.foreground} />
            </Toggle>
          )}
        </Each>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToggleGroup inset={false}>
        <Each of={WRAPS}>
          {(item) => (
            <Toggle
              pressed={wraps().includes(item().value)}
              disabled={!can(command(WRAP_COMMANDS[item().value]))}
              accessibilityLabel={item().label}
              onChange={() => run(command(WRAP_COMMANDS[item().value]))}
            >
              <Icon icon={item().icon} size={16} tint={colors.foreground} />
            </Toggle>
          )}
        </Each>
      </ToggleGroup>
      <ToolbarSeparator />
      <View style={{ flexDirection: "row", columnGap: 2 }}>
        <ToolIcon
          icon={IndentDecrease}
          label="Outdent"
          disabled={!can(outdent)}
          onPress={() => run(outdent)}
        />
        <ToolIcon
          icon={IndentIncrease}
          label="Indent"
          disabled={!can(indent)}
          onPress={() => run(indent)}
        />
      </View>
      <ToolIcon
        icon={Minus}
        label="Divider"
        disabled={!can(command("setHorizontalRule"))}
        onPress={() => run(command("setHorizontalRule"))}
      />
      <ToolbarSeparator />
      <ToolIcon
        icon={Table}
        label="Insert table"
        disabled={!can(INSERT_TABLE)}
        onPress={() => run(INSERT_TABLE)}
      />
      <If when={on("table")}>
        <Each of={TABLE_ACTIONS}>
          {(action) => (
            <ToolIcon
              icon={action().icon}
              label={action().label}
              disabled={!can(command(action().command))}
              onPress={() => run(command(action().command))}
            />
          )}
        </Each>
      </If>
      <View style={{ flex: 1 }} />
      <ToolIcon
        icon={props.zoomed ? Minimize2 : Maximize2}
        label={props.zoomed ? "Exit zoom" : "Zoom"}
        onPress={props.onZoom}
      />
    </View>
  );
}

function DocumentPanel(props: {
  editor: RichEditorSession;
  revision: () => number;
  source: () => string;
  text: () => string;
  link: LinkMenu;
  mode: () => "edit" | "markdown";
  setMode: (next: "edit" | "markdown") => void;
  zoomed: () => boolean;
  onZoom: () => void;
}) {
  const words = () => props.text().split(/\s+/).filter(Boolean).length;
  return (
    <View
      testID="document"
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        backgroundColor: colors.card,
        borderRadius: props.zoomed() ? 0 : radius.card,
        borderWidth: props.zoomed() ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inset,
        }}
      >
        <Toolbar
          editor={props.editor}
          revision={props.revision}
          link={props.link}
          zoomed={props.zoomed()}
          onZoom={props.onZoom}
        />
      </View>
      <If
        when={props.mode() === "edit"}
        else={
          <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 20 }}>
            <Text
              testID="markdown-source"
              style={{ fontFamily: mono(), fontSize: 13, lineHeight: 20, color: colors.foreground }}
            >
              {props.source()}
            </Text>
          </View>
        }
      >
        <RichEditor
          testID="markdown-editor"
          editor={props.editor}
          accessibilityLabel="Document"
          placeholder="Write something…"
          style={{ flex: 1 }}
          bubbleMenu={props.link.mode() === "closed" ? undefined : <LinkBubble menu={props.link} />}
          bubbleMenuPlacement="bottom"
        />
      </If>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            flexShrink: 1,
            fontSize: 12,
            color: colors.mutedForeground,
            fontVariant: ["tabular-nums"],
          }}
        >
          {`${words()}\u00a0words · ${props.text().length}\u00a0characters`}
        </Text>
        <Segmented
          value={props.mode()}
          onValueChange={(next) => props.setMode(next as "edit" | "markdown")}
        >
          <SegmentedList size="sm">
            <SegmentedItem value="edit">Edit</SegmentedItem>
            <SegmentedItem value="markdown">Markdown</SegmentedItem>
          </SegmentedList>
        </Segmented>
      </View>
    </View>
  );
}

// --- Stock tags and cards, the app's own node views ---------------------------------------------

type Quote = { name: string; price: number; change: number };

const QUOTES: Record<string, Quote> = {
  AAPL: { name: "Apple", price: 228.52, change: 1.24 },
  NVDA: { name: "NVIDIA", price: 141.98, change: 3.87 },
  TSLA: { name: "Tesla", price: 352.56, change: -2.13 },
  MSFT: { name: "Microsoft", price: 415.49, change: -0.42 },
};

const percent = (change: number) => `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
const tone = (change: number) => (change >= 0 ? colors.up : colors.down);

function StockTag(props: RichNodeViewProps) {
  const quote = () => QUOTES[props.node.attrs.symbol as string];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 5,
        borderRadius: 5,
        backgroundColor: alpha(colors.brand, 0.1),
        borderWidth: 1,
        borderColor: props.selected ? colors.brand : "transparent",
      }}
    >
      <Text
        style={{ fontWeight: "600", color: colors.brand }}
      >{`$${props.node.attrs.symbol}`}</Text>
      <Text
        style={{ fontSize: 12, color: tone(quote()?.change ?? 0), fontVariant: ["tabular-nums"] }}
      >
        {quote() ? percent(quote().change) : "—"}
      </Text>
    </View>
  );
}

function StockCard(props: RichNodeViewProps) {
  const symbol = () => props.node.attrs.symbol as string;
  const price = () => Number(props.node.attrs.price ?? QUOTES[symbol()]?.price ?? 0);
  const change = () => QUOTES[symbol()]?.change ?? 0;
  const refresh = () =>
    props.updateAttributes({
      price: Math.round(price() * (1 + (Math.random() - 0.5) / 50) * 100) / 100,
    });
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        padding: 16,
        ...rounded(radius.card),
        borderWidth: 1,
        borderColor: props.selected ? colors.brand : colors.border,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          {QUOTES[symbol()]?.name ?? symbol()}
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            fontVariant: ["tabular-nums"],
            color: colors.foreground,
          }}
        >
          {price().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 13, color: tone(change()), fontVariant: ["tabular-nums"] }}>
          {`${symbol()} ${percent(change())}`}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 2 }}>
        <ToolIcon icon={RefreshCw} label="Refresh the price" onPress={refresh} />
        <ToolIcon icon={Trash2} label="Remove the card" onPress={() => props.deleteNode()} />
      </View>
    </View>
  );
}

const Stock = defineExtension({
  name: "stock",
  node: { group: "inline", inline: true, atom: true, attrs: { symbol: { default: "AAPL" } } },
  addNodeView: () => StockTag,
});

const StockCardNode = defineExtension({
  name: "stockCard",
  node: {
    group: "block",
    atom: true,
    attrs: { symbol: { default: "NVDA" }, price: { default: null } },
  },
  addNodeView: () => StockCard,
});

// `RichEditor` merges `classes` shallowly, so a partial `nodes` would drop the document's looks.
const stockClasses = {
  ...richEditorClasses,
  nodes: { ...richEditorClasses.nodes, stock: "align-middle" },
};

const tag = (symbol: string): RichNodeJSON => ({ type: "stock", attrs: { symbol } });
const textNode = (value: string): RichNodeJSON => ({ type: "text", text: value });

const STOCKS = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [textNode("Morning notes")] },
    {
      type: "paragraph",
      content: [
        textNode("Chips led the open: "),
        tag("NVDA"),
        textNode(" and "),
        tag("AAPL"),
        textNode(" both gained, while "),
        tag("TSLA"),
        textNode(" gave back yesterday's rally."),
      ],
    },
    { type: "stockCard", attrs: { symbol: "NVDA", price: 141.98 } },
    {
      type: "paragraph",
      content: [
        textNode("Watching "),
        tag("MSFT"),
        textNode(" into the close. Type around the tags, select one and press Backspace, or undo."),
      ],
    },
  ],
};

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function NodeViews() {
  const editor = createRichEditor({ extensions: [StarterKit, Stock, StockCardNode], doc: STOCKS });
  const count = () => {
    const json = JSON.stringify(editor.getJSON());
    return {
      tags: json.split('"type":"stock"').length - 1,
      cards: json.split('"type":"stockCard"').length - 1,
    };
  };
  const counts = signal(count());
  editor.on("transaction", () => counts.set(count()));
  const insert = (content: RichNodeJSON) => {
    editor.insertContent(content);
    editor.focus();
  };
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
          ...rounded(radius.card),
          backgroundColor: colors.card,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            padding: 8,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ToolIcon icon={Undo2} label="Undo" onPress={() => editor.run(undo())} />
          <ToolIcon icon={Redo2} label="Redo" onPress={() => editor.run(redo())} />
          <ToolbarSeparator />
          <ToolIcon
            icon={ChartCandlestick}
            label="Insert a $TSLA tag"
            onPress={() => insert(tag("TSLA"))}
          />
          <ToolIcon
            icon={Plus}
            label="Insert an AAPL card"
            onPress={() => insert({ type: "stockCard", attrs: { symbol: "AAPL" } })}
          />
        </View>
        <RichEditor
          editor={editor}
          testID="node-view-editor"
          classes={stockClasses}
          style={{ flex: 1 }}
        />
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              fontFamily: mono(),
              fontVariant: ["tabular-nums"],
            }}
          >
            {`${plural(counts().tags, "tag")} · ${plural(counts().cards, "card")}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** The document editor, and under it the stock tags and cards. */
export function RichEditorDemo() {
  const keys = new RichEditorPlugin("linkKey");
  const editor = createRichEditor({
    extensions: [StarterKit, TableKit],
    plugins: [keys],
    content: DOC,
    format: "markdown",
  });
  const revision = signal(editor.revision);
  const source = signal(editor.getMarkdown());
  const text = signal(editor.getText());
  editor.on("revision", ({ revision: next }) => {
    revision.set(next);
    source.set(editor.getMarkdown());
    text.set(editor.getText());
  });
  const link = createLinkMenu(editor, revision);
  keys.captureKeys(["Mod-k"], () => link.edit());
  keys.capturing = true;
  const mode = signal<"edit" | "markdown">("edit");
  const zoomed = signal(false);
  const panel = (
    <DocumentPanel
      editor={editor}
      revision={revision}
      source={source}
      text={text}
      link={link}
      mode={mode}
      setMode={(next) => mode.set(next)}
      zoomed={zoomed}
      onZoom={() => zoomed.set(!zoomed())}
    />
  );
  return (
    <If
      when={zoomed()}
      else={
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 16, paddingBottom: 0 }}>{panel}</View>
          <NodeViews />
        </View>
      }
    >
      <Overlay style={{ top: 0, left: 0, right: 0, bottom: 0 }} onCancel={() => zoomed.set(false)}>
        {panel}
      </Overlay>
    </If>
  );
}
