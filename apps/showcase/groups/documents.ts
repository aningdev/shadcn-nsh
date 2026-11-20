// The Documents and workspaces group: what holds a document or a working surface.
import { Code, Columns2, FileText, MoveHorizontal, Terminal } from "lucide";

import { notBuilt, type DemoEntry } from "./entry";

/** The Documents and workspaces demos, in the index's order (RichEditor is out: this library has
 * none). */
export const documents: DemoEntry[] = [
  {
    name: "TextView",
    detail: "Markdown and HTML documents, extensions, streaming replies",
    icon: FileText,
    screen: notBuilt({
      name: "TextView",
      detail: "Markdown and HTML documents, extensions, streaming replies",
    }),
  },
  {
    name: "Editor",
    detail:
      "Code with highlighting, several carets, folding, find and replace, a language server: diagnostics, hover, definitions, completion",
    icon: Code,
    screen: notBuilt({
      name: "Editor",
      detail:
        "Code with highlighting, several carets, folding, find and replace, a language server: diagnostics, hover, definitions, completion",
    }),
  },
  {
    name: "Terminal",
    detail: "A shell's colors, a progress bar redrawn in place, the keys typed sent back",
    icon: Terminal,
    screen: notBuilt({
      name: "Terminal",
      detail: "A shell's colors, a progress bar redrawn in place, the keys typed sent back",
    }),
  },
  {
    name: "Dock",
    detail:
      "A workspace of tabs dragged between groups and docks, split, closed, zoomed and resized",
    icon: Columns2,
    screen: notBuilt({
      name: "Dock",
      detail:
        "A workspace of tabs dragged between groups and docks, split, closed, zoomed and resized",
    }),
  },
  {
    name: "Resizable",
    detail: "Panels resized by dragging the lines between them, within their ranges",
    icon: MoveHorizontal,
    screen: notBuilt({
      name: "Resizable",
      detail: "Panels resized by dragging the lines between them, within their ranges",
    }),
  },
];
