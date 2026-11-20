// The Documents and workspaces group: what holds a document or a working surface.
import { Code, Columns2, FileText, MoveHorizontal, PenLine, Terminal } from "lucide";

import { lazy, type DemoEntry } from "./entry";

/** The Documents and workspaces demos, in the index's order. */
export const documents: DemoEntry[] = [
  {
    name: "TextView",
    detail: "Markdown and HTML documents, extensions, streaming replies",
    icon: FileText,
    screen: lazy(() => import("../demos/text-view").then((m) => m.TextViewDemo)),
  },
  {
    name: "Editor",
    detail:
      "Code with highlighting, several carets, folding, find and replace, a language server: diagnostics, hover, definitions, completion",
    icon: Code,
    screen: lazy(() => import("../demos/editor").then((m) => m.EditorDemo)),
  },
  {
    name: "RichEditor",
    detail:
      "A document editor on Tiptap's extensions: lists, links, tables, Markdown shortcuts, undo and redo, stock tags and cards as node views",
    icon: PenLine,
    screen: lazy(() => import("../demos/rich-editor").then((m) => m.RichEditorDemo)),
  },
  {
    name: "Terminal",
    detail: "A shell's colors, a progress bar redrawn in place, the keys typed sent back",
    icon: Terminal,
    screen: lazy(() => import("../demos/terminal").then((m) => m.TerminalDemo)),
  },
  {
    name: "Dock",
    detail:
      "A workspace of tabs dragged between groups and docks, split, closed, zoomed and resized",
    icon: Columns2,
    screen: lazy(() => import("../demos/dock").then((m) => m.DockDemo)),
  },
  {
    name: "Resizable",
    detail: "Panels resized by dragging the lines between them, within their ranges",
    icon: MoveHorizontal,
    screen: lazy(() => import("../demos/resizable").then((m) => m.ResizableDemo)),
  },
];
