/**
 * Where a component can come from, and where each official one went here: shadcn/ui's
 * `registry/new-york-v4/ui/<id>.tsx` and NSH's `website/elements/<id>.md`.
 *
 * One row per official component, named by the page's file name. `ours` lists the pages here that
 * serve it (first closest, a renamed one shows the rename), and a row with nothing serving it
 * says why in `status` and `note`. The components index, each page's header links and
 * `/docs/components/coverage` read these tables; nothing there is written by hand.
 *
 * `bun run check:pages` fails when `references/` has an official component with no row, when a row
 * names a page that does not exist, and when a row serves nothing without saying why. A `planned`
 * row starts linking the day its page lands.
 */
export type OfficialStatus = "planned" | "missing" | "not-doing" | "primitive";

export type OfficialEntry = {
  /** The official page: `ui/<id>.tsx` in shadcn/ui, `elements/<id>.md` in NSH. */
  id: string;
  /** The pages here that serve it, closest first; empty when nothing does. */
  ours: readonly string[];
  /** Why nothing serves it; absent when `ours` is not empty. */
  status?: OfficialStatus;
  /** One line on the coverage page; required when `ours` is empty. */
  note?: string;
};

/** An NSH row, with the group its element is filed under. */
export type NshEntry = OfficialEntry & { group: "base" | "primitives" };

export const shadcnUrl = (id: string): string => `https://ui.shadcn.com/docs/components/${id}`;

export const nshElementUrl = (id: string): string => `https://nsh.dev/elements/${id}`;

/**
 * shadcn/ui's components. Every file of `references/shadcn-ui/apps/v4/registry/new-york-v4/ui` is
 * one row, in file order.
 */
export const SHADCN_UI: readonly OfficialEntry[] = [
  { id: "accordion", ours: ["accordion"] },
  { id: "alert-dialog", ours: ["alert-dialog"] },
  { id: "alert", ours: ["alert"] },
  { id: "aspect-ratio", ours: ["aspect-ratio"] },
  { id: "attachment", ours: ["attachment"] },
  { id: "avatar", ours: ["avatar"] },
  { id: "badge", ours: ["badge"] },
  { id: "breadcrumb", ours: ["breadcrumb"] },
  { id: "bubble", ours: ["bubble"] },
  { id: "button-group", ours: ["button-group"] },
  { id: "button", ours: ["button"] },
  { id: "calendar", ours: ["calendar"] },
  { id: "card", ours: ["card"] },
  { id: "carousel", ours: ["carousel"] },
  { id: "chart", ours: ["plot"] },
  { id: "checkbox", ours: ["checkbox"] },
  { id: "collapsible", ours: ["collapsible"] },
  { id: "combobox", ours: ["combobox"] },
  { id: "command", ours: ["command"] },
  { id: "context-menu", ours: ["context-menu"] },
  { id: "dialog", ours: ["dialog"] },
  {
    id: "direction",
    ours: [],
    status: "not-doing",
    note: "Waits for RTL in NSH; it would then be a provider, not a control.",
  },
  { id: "drawer", ours: ["drawer"] },
  { id: "dropdown-menu", ours: ["menu"] },
  { id: "empty", ours: ["empty"] },
  { id: "field", ours: ["field"] },
  {
    id: "form",
    ours: [],
    status: "not-doing",
    note: "React Hook Form is the app's; field already lays the form out.",
  },
  { id: "hover-card", ours: ["hover-card"] },
  { id: "input-group", ours: ["input-group"] },
  { id: "input-otp", ours: ["otp-input"] },
  { id: "input", ours: ["input"] },
  { id: "item", ours: ["item"] },
  { id: "kbd", ours: ["kbd"] },
  { id: "label", ours: ["label"] },
  { id: "marker", ours: ["marker"] },
  { id: "menubar", ours: ["menubar"] },
  { id: "message-scroller", ours: ["message-scroller"] },
  { id: "message", ours: ["message"] },
  {
    id: "native-select",
    ours: [],
    status: "not-doing",
    note: "NSH has no native dropdown; select is the listbox.",
  },
  { id: "navigation-menu", ours: ["navigation-menu"] },
  { id: "pagination", ours: ["pagination"] },
  { id: "popover", ours: ["popover"] },
  { id: "progress", ours: ["progress"] },
  { id: "radio-group", ours: ["radio-group"] },
  { id: "resizable", ours: ["resizable"] },
  { id: "scroll-area", ours: ["scrollbar"] },
  { id: "select", ours: ["select"] },
  { id: "separator", ours: ["separator"] },
  { id: "sheet", ours: ["sheet"] },
  { id: "sidebar", ours: ["sidebar"] },
  { id: "skeleton", ours: ["skeleton"] },
  { id: "slider", ours: ["slider"] },
  { id: "sonner", ours: ["toast"] },
  { id: "spinner", ours: ["spinner"] },
  { id: "switch", ours: ["switch"] },
  { id: "table", ours: ["table"] },
  { id: "tabs", ours: ["tabs"] },
  { id: "textarea", ours: ["textarea"] },
  { id: "toggle-group", ours: ["toggle-group"] },
  { id: "toggle", ours: ["toggle"] },
  { id: "tooltip", ours: ["tooltip"] },
];

/**
 * NSH's elements, base and primitives, in name order: what each of our pages is built on. The
 * primitives have no wrapper — an app uses `nsh` directly — so their rows only say so.
 *
 * An element with several `ours` is one `nsh/base` control the library gives more than one look.
 */
export const NSH_ELEMENTS: readonly NshEntry[] = [
  { id: "accordion", group: "base", ours: ["accordion"] },
  { id: "alert-dialog", group: "base", ours: ["alert-dialog"] },
  { id: "avatar", group: "base", ours: ["avatar"] },
  { id: "button", group: "base", ours: ["button", "pressable"] },
  { id: "calendar", group: "base", ours: ["calendar"] },
  { id: "carousel", group: "base", ours: ["carousel"] },
  { id: "checkbox", group: "base", ours: ["checkbox"] },
  { id: "collapsible", group: "base", ours: ["collapsible"] },
  { id: "color-picker", group: "base", ours: ["color-picker"] },
  { id: "combobox", group: "base", ours: ["combobox"] },
  { id: "command", group: "base", ours: ["command"] },
  { id: "data-table", group: "base", ours: ["data-table"] },
  { id: "date-picker", group: "base", ours: ["date-picker"] },
  { id: "dialog", group: "base", ours: ["dialog"] },
  { id: "diff-view", group: "base", ours: ["diff-view"] },
  { id: "dock", group: "base", ours: ["dock-area"] },
  { id: "editor", group: "base", ours: ["code-editor"] },
  { id: "emoji-picker", group: "base", ours: ["emoji-picker"] },
  { id: "hover-card", group: "base", ours: ["hover-card"] },
  { id: "input", group: "base", ours: ["input", "textarea"] },
  { id: "link", group: "base", ours: ["link"] },
  { id: "menu", group: "base", ours: ["menu", "context-menu"] },
  { id: "nav-stack", group: "base", ours: ["nav-stack"] },
  { id: "number-input", group: "base", ours: ["number-input"] },
  { id: "otp-input", group: "base", ours: ["otp-input"] },
  { id: "pagination", group: "base", ours: ["pagination"] },
  { id: "plot", group: "base", ours: ["plot"] },
  { id: "popover", group: "base", ours: ["popover"] },
  { id: "progress", group: "base", ours: ["progress"] },
  { id: "radio", group: "base", ours: ["radio-group"] },
  { id: "resizable", group: "base", ours: ["resizable"] },
  { id: "rich-editor", group: "base", ours: ["editor"] },
  { id: "scrollbar", group: "base", ours: ["scrollbar"] },
  { id: "select", group: "base", ours: ["select"] },
  { id: "sheet", group: "base", ours: ["sheet"] },
  { id: "slider", group: "base", ours: ["slider"] },
  {
    id: "split-view",
    group: "base",
    ours: [],
    status: "not-doing",
    note: "The app's navigation scaffold (2-3 NavStack columns); the app composes it, no look to wrap.",
  },
  { id: "switch", group: "base", ours: ["switch"] },
  { id: "table", group: "base", ours: ["table"] },
  { id: "tabs", group: "base", ours: ["tabs", "segmented"] },
  { id: "terminal", group: "base", ours: ["terminal"] },
  { id: "text-view", group: "base", ours: ["text-view"] },
  { id: "time-field", group: "base", ours: ["time-field"] },
  { id: "toast", group: "base", ours: ["toast"] },
  { id: "toggle", group: "base", ours: ["toggle", "toggle-group"] },
  { id: "toolbar", group: "base", ours: ["toolbar"] },
  { id: "tooltip", group: "base", ours: ["tooltip"] },
  { id: "tree", group: "base", ours: ["tree"] },

  {
    id: "canvas",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: an app draws on `nsh` Canvas.",
  },
  {
    id: "control-flow",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `If` and `Each` are control flow, not a control.",
  },
  {
    id: "image",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `nsh` Image.",
  },
  {
    id: "keyboard",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: the keyboard inset and `Keyboard.dismiss`.",
  },
  {
    id: "list",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `nsh` List is the recycled one; the components use Scroll.",
  },
  {
    id: "overlay",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: the dialogs, sheets, menus and hints are built on it.",
  },
  {
    id: "safe-area",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `env(safe-area-inset-*)` on the app's own views.",
  },
  {
    id: "scroll",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `nsh` Scroll; message-scroller and scrollbar wear it.",
  },
  {
    id: "shader",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: an app writes its own WGSL.",
  },
  {
    id: "text-selection",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `selectable` on a view.",
  },
  {
    id: "text",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: every component draws its type on `nsh` Text.",
  },
  {
    id: "video",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `nsh` Video.",
  },
  {
    id: "view",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: every component is laid out with `nsh` View.",
  },
  {
    id: "web-view",
    group: "primitives",
    ours: [],
    status: "primitive",
    note: "No wrapper: `nsh` WebView.",
  },
];

/** What a row is on the coverage page: its status, or covered once a page serves it. */
export type OfficialState = "covered" | OfficialStatus;

export function stateOf(entry: OfficialEntry, pages: ReadonlySet<string>): OfficialState {
  if (entry.ours.some((slug) => pages.has(slug))) return "covered";
  return entry.status ?? "missing";
}

/** The shadcn/ui component a page stands in for, when one does. */
export function shadcnOf(slug: string): string | undefined {
  return SHADCN_UI.find((entry) => entry.ours.includes(slug))?.id;
}

/** The `nsh/base` element a page is built on, when it is built on one. */
export function nshElementOf(slug: string): string | undefined {
  return NSH_ELEMENTS.find((entry) => entry.ours.includes(slug))?.id;
}
