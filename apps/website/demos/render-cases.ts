/**
 * What both render checks draw: the demos and their reference pages, and the appearances. The
 * pointer pass runs them in a headless browser (`render.test.tsx`); the touch pass on the iOS
 * simulator (`render-touch.test.tsx`), where the touch idiom can be measured.
 *
 * The ids come from the catalog (`catalog.generated.ts`); only a component's exceptions live
 * here, keyed by id.
 */
import { componentIds } from "./catalog.generated";

/**
 * What a step does to the page: the slice of `nsh/test`'s `App` the overrides use, structurally,
 * so this table stays plain TypeScript (the docs project and the catalog check import it, and
 * neither has NSH's types).
 */
type App = {
  press(selector: string): Promise<void>;
  /** The mouse's secondary button: a context menu's trigger. Rejects on a phone. */
  rightClick(selector: string): Promise<void>;
  /** A held finger: the same trigger on a touch screen. */
  longPress(selector: string): Promise<void>;
  /** The pointer over what `selector` names: a hover's fill or ink. Desktops and the web only,
   * so it rejects on a phone. */
  hover(selector: string): Promise<void>;
  /**
   * Answers the dialogs the page shows from now on (`AlertDialog.show`): `handler` returns the
   * text of the button to press, or `null` to close it without one. A shot cannot hold one: the
   * step that shows a dialog is also the one that answers it, so the alert-dialog page shows the
   * line it resolved with.
   */
  onDialog(handler: (dialog: { buttons: string[] }) => string | null): void;
  /** Resolves once a view matching `selector` is on screen (its timeout bounds the wait). */
  waitFor(selector: string, options?: { timeout?: number } | null): Promise<void>;
  /** The texts on screen now, in order. */
  texts(): string[];
  /** Keys, as a keyboard sends them ("shift+left"): the focused field takes them. */
  keyboard: { press(keys: string): Promise<void> };
  wait(ms: number): Promise<void>;
};

export type Case = {
  /** The demo's file name, without `.tsx`. */
  id: string;
  /**
   * The page draws photographs over the network: the check opens it with the live network
   * (`open`'s `network`) and waits for its `images-ready` cue before comparing.
   */
  photos?: boolean;
  /**
   * A wider budget than `antialiasing`, for a page that needs one: at most `pixels` pixels, a
   * channel of each within `delta` levels (0-255). Everything else — a moved edge, a color, a
   * missing row — fails as it always did; this only forgives a rounded clip's antialiasing, which
   * the web rasterizer draws a level apart between two page instances (the avatar's circular
   * photos). `scripts/port/render.ts` compares every pair; the test only takes the pictures.
   */
  tolerance?: { pixels: number; delta: number; why: string };
  /**
   * More of the manual clock after `settle`, before the screenshot: for a page whose entrance
   * lands a frame after the rest (a menu's popup and its shadow).
   */
  extraSettle?: number;
  /**
   * Steps taken in both pages before the screenshot (opening a dialog). Not a step that puts the
   * keys in a field — `type`, or a press on what focuses one: on the iOS simulator the host is gone
   * by the next step ("the host left"), so `render-touch` and `appearance-touch` fail on that page.
   * A field's focus appearance is the gallery's to hold apart: a class's report, not a picture.
   */
  steps?: (app: App) => Promise<void>;
  /**
   * Steps only the pointer pass takes, after `steps`: for a page whose browser shot wants a state
   * the touch pass cannot reach, or must not (see `select`). The touch pass takes `steps` alone.
   */
  pointerSteps?: (app: App) => Promise<void>;
  /**
   * The pointer pass's window, for a page whose desktop layout a phone's 390 × 844 never reaches
   * (the sidebar's column beside its page, and the folds it shows only when wide). The touch pass
   * fills the simulator's screen and ignores it: there the page keeps its phone layout.
   */
  viewport?: { width: number; height: number };
  /**
   * The reference page draws the component itself, because the component is upstream's own
   * (no shell): a comparison would prove nothing. The reason is printed by the render checks,
   * which then screenshot the demo alone. A component with a shell must not set this, and one
   * without a shell must: `port:coverage` checks both.
   */
  selfReference?: string;
};

/**
 * Waits for a photograph page's `images-ready` cue, then for the pictures' fade in (an image
 * draws at once behind a 300 ms opacity, and a page caught mid-fade would differ from its pair).
 */
export const photosReady = async (app: App) => {
  await app.waitFor("id:images-ready", { timeout: 20000 });
  await app.wait(500);
};

/**
 * What every pair may differ by and still be the same picture: a rounded edge's antialiasing is
 * drawn from a float, and two page instances land it a level (1/255) apart now and then. Measured
 * on this host: the menu's popup corner flipped one pixel by 1/255 in about one pair in thirty;
 * over eight full runs a page flaked about every third run, always a handful of pixels at a
 * handful of levels. The budget below (6 pixels, each channel within 6/255) covers that with room;
 * a changed color, a moved edge or a missing row moves hundreds of pixels and still fails.
 */
export const antialiasing = { pixels: 6, delta: 6 } as const;

/** Whether the alert-dialog page shows what its destructive button resolves with. */
const answered = (app: App) => app.texts().includes('{ action: "delete" }');

/** What a component does that the others do not. Keys must be catalog ids. */
type Override = Omit<Case, "id">;

const overrides: Record<string, Override> = {
  // A row checked after the page opened: the box's mark and fill must follow the value (the
  // reference page computes them from it), which a first-frame screenshot never shows.
  checkbox: {
    steps: async (app) => {
      await app.press("text:Documents");
      await app.wait(300);
    },
  },
  // A checked context-menu row: its mark's color is the accent's, as the reference draws it.
  "context-menu": {
    steps: async (app) => {
      // The pointer pass has a mouse, the touch pass a finger (a phone has no secondary button).
      await app.rightClick("text:ContextMenu").catch(() => app.longPress("text:ContextMenu"));
      await app.press("text:Pin");
      await app.wait(300);
    },
  },
  dialog: { steps: (app) => app.press("Open a card") },
  // The pointer rests on the trail's first step: its ink goes from the muted one to the page's
  // text color, the one state a still can show (the keyboard's ring needs the keyboard). A phone
  // has no pointer, so the touch pass keeps the resting look.
  breadcrumb: {
    steps: async (app) => {
      // The trail's first step (the page has three `Home`s, one per section).
      await app.hover("text:Home >> nth=0").catch(() => {});
      await app.wait(160);
    },
  },
  "alert-dialog": {
    // No shot can hold the system's box: it is answered the moment it is shown, and a dialog a
    // step shows is a dialog that step also answers. What both pages then draw is the line
    // `AlertDialog.show` resolved with — the destructive button's `id`, which only reaches them
    // through the alert (the demo's `onAction`, the reference page's `show`). So the step checks
    // that line: it, not the picture, is what proves the box showed and resolved.
    steps: async (app) => {
      app.onDialog(() => "Delete");
      await app.press("Delete…");
      if (!answered(app)) throw new Error("the alert did not resolve with the destructive action");
    },
  },
  sheet: { steps: (app) => app.press('side="bottom"') },
  // The drawer over everything: a scrim hides the page, so the shot is the open drawer itself.
  drawer: { steps: (app) => app.press("Share…") },
  popover: { steps: (app) => app.press("Order 1024") },
  // The bar stays; the menu opens under its trigger, which wears the chosen fill.
  menubar: {
    steps: (app) => app.press("File"),
    extraSettle: 16,
  },
  menu: {
    steps: (app) => app.press("File ▾"),
    // Its popup's shadow lands a frame after the entrance: 16 ms more, on both pages.
    extraSettle: 16,
  },
  // The bar stays; the panel opens under its trigger, which wears the chosen fill and turns its
  // chevron up.
  "navigation-menu": { steps: (app) => app.press("Getting started") },
  // One page pushed: the shot is the second page, with the header's back button beside its title.
  // Three columns need the stage wider than the inspector leaves at the test's 390 points.
  // Below about 1360 the scene itself opens on two columns; this window shows all three.
  "split-view": {
    viewport: { width: 1400, height: 780 },
  },
  "nav-stack": {
    steps: async (app) => {
      await app.press("label:General");
      await app.wait(300);
    },
  },
  // The pointer pass opens a desktop window: the column stands beside its page, and the press — the
  // first "Toggle Sidebar" in the page, the rail down the column's inner edge — folds it to its
  // icons, over the variants and the collapsibles each in a frame of its own, two of them closed.
  // The touch pass keeps the phone's width, where the column is a sheet: there the first "Toggle
  // Sidebar" is the page's trigger, and it opens the sheet, so that shot is the column itself — its
  // rows, a sub menu, a badge and the footer — over the page it belongs to.
  sidebar: {
    viewport: { width: 1024, height: 1500 },
    // The column draws before the page does, so its rail is the first of the two names in the page.
    steps: (app) => app.press("Toggle Sidebar >> nth=0"),
  },
  // Once the toast is in, not only pushed: its `presented` line lands in the log a moment after the
  // press, so a picture taken before it differs from one taken after by that line alone.
  toast: {
    steps: async (app) => {
      await app.press("Copy the link");
      await app.waitFor("text:presented · toast-1");
    },
  },
  // The sectioned list (a search field, three group headers, a note per row, one row at
  // capacity, a clear button) rather than the plain language one: the headers are what a
  // `SelectGroup`/`SelectLabel`/`SelectItem` list draws, and a shot without them proved nothing
  // about the children form (an nsh web bug dropped their group, see `packages/ui/select.tsx`).
  select: {
    steps: (app) => app.press("label:Region"),
    // The popup's search field takes the focus when it opens (`listbox.rs`'s
    // `auto_focus(!sheet)`), and a field's caret blinks on the browser's clock, which the manual
    // one does not hold: one still caught it drawn, its pair's not — 17 pixels, one column of the
    // caret's height, the whole way from the text to the field's color. A type does not settle it
    // (the still lands a blink later), so the pointer pass types a letter and selects it: a
    // selection draws no caret, and the pair is byte for byte. The touch pass has none to settle,
    // as the simulator draws the list as a sheet, which takes no focus.
    pointerSteps: async (app) => {
      await app.keyboard.press("a");
      await app.keyboard.press("shift+left");
    },
  },
  // Its list open: the field's own trigger, pressed. A press on the input opens the list on a
  // phone (a tap's focus) and on a native desktop, but not in a browser, where the field takes the
  // click; the trigger opens it in every idiom.
  combobox: {
    steps: (app) => app.press("id:assignee-toggle"),
    // Opening from the trigger focuses the field on a desktop (`combobox.rs`'s `press`), and a
    // focused field's caret blinks on the browser's clock, which the manual one does not hold: the
    // pointer pass types a letter and selects it, as `select` does, so the still draws no caret.
    // The letter is one every person matches (Ada, Grace, Linus Torvalds, Margaret Hamilton), so
    // no row drops out of the list.
    pointerSteps: async (app) => {
      await app.keyboard.press("a");
      await app.keyboard.press("shift+left");
    },
  },
  "date-picker": { steps: (app) => app.press("No due date") },
  // The pages whose photos come over the network mark themselves once every image is there.
  carousel: {
    photos: true,
    steps: photosReady,
    // Measured: 2 pairs in 26 differed, always the same 57 pixels, the worst channel 11/255, every
    // one of them on the card's four rounded corners where its clip cuts the photo (x 21-29 and
    // 332-337, y 126-134 and 266-273): the rasterizer's rounded clip, a level apart between two page
    // instances, as the avatar's edge is. The photo's middle, the dots and the labels never moved,
    // and a layout change moves far more than 60 pixels, so it still fails.
    tolerance: {
      pixels: 60,
      delta: 32,
      why: "a rounded card's clip over its photo is antialiased a little apart between two page instances",
    },
  },
  // The picture it holds comes over the network, as the carousel's do.
  pressable: { photos: true, steps: photosReady },
  "image-viewer": { photos: true, steps: photosReady },
  "text-view": { photos: true, steps: photosReady },
  spinner: { selfReference: "upstream's own Spinner, with no shell to compare against" },
  badge: { selfReference: "upstream's own Badge, with no shell to compare against" },
  status: { selfReference: "upstream's own Status, with no shell to compare against" },
  stat: { selfReference: "upstream's own Stat, with no shell to compare against" },
  "emoji-picker": {
    selfReference: "the static chrome and EmojiPanel are upstream's own components",
  },
  plot: {
    selfReference:
      "the demo and the reference draw the same nsh/base/plot through upstream's re-export and look helpers",
  },
  avatar: {
    photos: true,
    steps: photosReady,
    // Measured: before the page prefetched its portraits, one pair in three differed — at most 20
    // pixels, the worst channel 29/255 (the antialiased edge of a circular photo). After the
    // prefetch, 12 pairs in a row were identical. The allowance stays for the flake's return; a
    // layout change moves far more than 30 pixels, so it still fails.
    tolerance: {
      pixels: 30,
      delta: 32,
      why: "a circular photo's edge is antialiased a pixel apart between two page instances",
    },
  },
  "color-picker": {
    selfReference: "the panel and the popover are upstream's own composition, with no shell",
    photos: true,
    steps: photosReady,
  },
};

/** The ids the exceptions name: `bun run catalog --check` fails on one the catalog does not list. */
export const overrideIds = Object.keys(overrides).sort();

export const cases: Case[] = componentIds.map((id) => ({ id, ...overrides[id] }));

export const schemes = ["light", "dark"] as const;

/**
 * A test's name: `id=<id>: <pass>, <scheme>`. The marker keeps `nsh test`'s substring `--filter`
 * exact — `--filter "id=table:"` never picks up `data-table` — which is what `--only` runs by.
 */
export const testName = (id: string, pass: "pointer" | "touch", scheme: string) =>
  `id=${id}: ${pass}, ${scheme}`;

/**
 * The wall time every render check starts its pages on: noon on 2026-11-12, the day the pointer
 * baseline was recorded. The calendar and the date picker mark "today" from the clock, so a run
 * on another day would draw the mark on another day and differ from the baseline every day. It is
 * a local noon, and the page reads "today" in the same host's zone, so the date holds on any
 * machine; noon keeps it clear of a DST shift at midnight.
 */
export const clock = { time: new Date(2026, 10, 12, 12, 0, 0) } as const;

export const same = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Lets every entrance transition (a popup's or a dialog's 150 ms, a color's 160 ms) finish on
 * the manual clock before the screenshot, so a page caught mid-transition cannot differ from the
 * other one. Deterministic: the clock moves the same 200 ms on both pages. A page whose last
 * pixel lands a frame later adds its own `extraSettle`; a rounded clip's antialiasing is the
 * case's `tolerance`, never a re-take.
 */
export const settle = (app: App) => app.wait(200);

/** What `open` takes for a page: a live network when it draws photographs. */
export const networkOf = (photos: boolean | undefined) =>
  photos ? ({ network: "live" } as const) : {};
