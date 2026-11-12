/**
 * What both render checks draw: the demos and their reference pages, and the appearances. The
 * pointer pass runs them in a headless browser (`render.test.tsx`); the touch pass on the iOS
 * simulator (`render-touch.test.tsx`), where the touch idiom can be measured.
 */
import type { App } from "nsh/test";

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

export const cases: Case[] = [
  { id: "button" },
  { id: "switch" },
  { id: "dialog", steps: (app) => app.press("Delete item…") },
  { id: "toggle" },
  { id: "checkbox" },
  { id: "radio-group" },
  { id: "toggle-group" },
  { id: "toolbar" },
  { id: "input" },
  { id: "number-input" },
  { id: "otp-input" },
  { id: "time-field" },
  { id: "tooltip" },
  { id: "popover" },
  { id: "hover-card" },
  { id: "sheet" },
  { id: "toast" },
  { id: "alert-dialog", steps: (app) => app.press("Delete file…") },
  { id: "menu" },
  { id: "context-menu" },
  { id: "select" },
  { id: "combobox" },
  { id: "calendar" },
  { id: "date-picker" },
  { id: "tabs" },
  { id: "segmented" },
  { id: "accordion" },
  { id: "collapsible" },
  { id: "carousel" },
  { id: "link" },
  { id: "pagination" },
  { id: "progress" },
  { id: "slider" },
  { id: "avatar" },
  { id: "badge", selfReference: "upstream's own Badge, with no shell to compare against" },
  { id: "status", selfReference: "upstream's own Status, with no shell to compare against" },
  { id: "stat", selfReference: "upstream's own Stat, with no shell to compare against" },
  { id: "meter", selfReference: "upstream's own Meter, with no shell to compare against" },
  {
    id: "emoji-picker",
    selfReference: "the static chrome and EmojiPanel are upstream's own components",
  },
  { id: "data-table" },
  { id: "table" },
  { id: "tree" },
  { id: "command" },
  { id: "scrollbar" },
  {
    id: "plot",
    selfReference:
      "the demo and the reference draw the same nsh/base/plot through upstream's re-export and look helpers",
  },
  { id: "resizable" },
  { id: "dock-area" },
  { id: "diff-view" },
  { id: "text-view" },
  { id: "editor" },
  {
    id: "color-picker",
    selfReference: "the panel and the popover are upstream's own composition, with no shell",
  },
];

export const schemes = ["light", "dark"] as const;

export const same = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Lets every entrance transition (a popup's or a dialog's 150 ms, a color's 160 ms) finish on
 * the manual clock before the screenshot, so a page caught mid-transition cannot differ from the
 * other one. Deterministic: the clock moves the same 200 ms on both pages.
 */
export const settle = (app: App) => app.wait(200);
