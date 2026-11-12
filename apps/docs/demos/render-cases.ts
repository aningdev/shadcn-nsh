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
  { id: "badge" },
  { id: "status" },
  { id: "stat" },
  { id: "meter" },
  { id: "emoji-picker" },
  { id: "data-table" },
  { id: "table" },
  { id: "tree" },
  { id: "command" },
  { id: "scrollbar" },
  { id: "plot" },
  { id: "resizable" },
  { id: "dock-area" },
  { id: "diff-view" },
  { id: "text-view" },
  { id: "editor" },
  { id: "color-picker" },
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
