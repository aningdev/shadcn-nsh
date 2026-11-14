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
  /** Resolves once a view matching `selector` is on screen (its timeout bounds the wait). */
  waitFor(selector: string, options?: { timeout?: number } | null): Promise<void>;
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
  /** Steps taken in both pages before the screenshot (opening a dialog). */
  steps?: (app: App) => Promise<void>;
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
  dialog: { steps: (app) => app.press("Open a card") },
  "alert-dialog": { steps: (app) => app.press("Delete…") },
  sheet: { steps: (app) => app.press('side="bottom"') },
  popover: { steps: (app) => app.press("Order 1024") },
  menu: {
    steps: (app) => app.press("File ▾"),
    // Its popup's shadow lands a frame after the entrance: 16 ms more, on both pages.
    extraSettle: 16,
  },
  toast: { steps: (app) => app.press("Copy the link") },
  select: { steps: (app) => app.press("label:Language") },
  "date-picker": { steps: (app) => app.press("No due date") },
  // The pages whose photos come over the network mark themselves once every image is there.
  carousel: { photos: true, steps: photosReady },
  spinner: { selfReference: "upstream's own Spinner, with no shell to compare against" },
  badge: { selfReference: "upstream's own Badge, with no shell to compare against" },
  status: { selfReference: "upstream's own Status, with no shell to compare against" },
  stat: { selfReference: "upstream's own Stat, with no shell to compare against" },
  meter: { selfReference: "upstream's own Meter, with no shell to compare against" },
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
