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
  wait(ms: number): Promise<void>;
};

export type Case = {
  /** The demo's file name, without `.tsx`. */
  id: string;
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

/** What a component does that the others do not. Keys must be catalog ids. */
type Override = Omit<Case, "id">;

const overrides: Record<string, Override> = {
  dialog: { steps: (app) => app.press("Open a card") },
  "alert-dialog": { steps: (app) => app.press("Delete…") },
  sheet: { steps: (app) => app.press('side="bottom"') },
  popover: { steps: (app) => app.press("Order 1024") },
  menu: { steps: (app) => app.press("File ▾") },
  toast: { steps: (app) => app.press("Copy the link") },
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
  "color-picker": {
    selfReference: "the panel and the popover are upstream's own composition, with no shell",
  },
};

/** The ids the exceptions name: `bun run catalog --check` fails on one the catalog does not list. */
export const overrideIds = Object.keys(overrides).sort();

export const cases: Case[] = componentIds.map((id) => ({ id, ...overrides[id] }));

export const schemes = ["light", "dark"] as const;

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
 * other one. Deterministic: the clock moves the same 200 ms on both pages.
 */
export const settle = (app: App) => app.wait(200);
