// The Documents and workspaces demos' behavior, one test per demo: each opens from the sidebar
// (a phone pushes it onto its stack) and its main scene works as the official gallery's does.
// Timers stay real: the editor's language server and the terminal answer on their own clocks.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", width: 390, height: 760 } as const;

test("TextView: Markdown, then the HTML release", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:TextView");
  await app.waitFor("text:Native Shell");
  await app.press("role:tab[HTML]");
  await app.waitFor("text:NSH 0.1.0: native UI from TSX");
});

test("Editor: the language menu opens the Rust sample and its warning", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("label:Editor");
  await app.waitFor("label:Language");
  await app.press("label:Language");
  await app.press("Rust");
  await app.waitFor("fn main() {");
  expect(app.shows("1 warning")).toBe(true);
});

test("RichEditor: Markdown shows the document's source", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:RichEditor");
  await app.waitFor("text:/^Type Markdown as you go/");
  await app.press("role:tab[Markdown]");
  await app.waitFor("text:/^# Release notes/");
});

test("Terminal: a typed echo prints its text", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("label:Terminal");
  await app.waitFor("Welcome to the NSH terminal.");
  await app.type("label:Terminal", "echo hi");
  await app.keyboard.press("enter");
  await app.waitFor("text:hi");
});

test("Dock: hiding Files drops it from the docks that are showing", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Dock");
  await app.waitFor("text:Center: README.md, main.rs | Preview");
  await app.waitFor("text:Showing docks: Files, Terminal");
  await app.press("label:Toggle files");
  await app.waitFor("text:Showing docks: Terminal");
});

test("Resizable: the console hides and can be shown again", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("label:Resizable");
  await app.waitFor("text:220 pt wide");
  await app.press("label:Hide the console");
  await app.waitFor("label:Show the console");
  expect(app.shows("text:140 pt tall")).toBe(false);
});

test("the shadcn palette redraws a TextView heading", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:TextView");
  await app.waitFor("text:Native Shell");
  const ink = app.spanStyle("text:Native Shell").color;
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  expect(app.spanStyle("text:Native Shell").color).not.toBe(ink);
  expect(app.storage()["palette"]).toBe("shadcn");
});

test("a phone lays out TextView and Resizable", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  await app.press("label:TextView");
  await app.waitFor("text:Native Shell");
  await app.press("role:tab[HTML]");
  await app.waitFor("text:NSH 0.1.0: native UI from TSX");
  await app.back();
  await app.press("label:Resizable");
  await app.waitFor("text:130 pt wide");
  await app.press("label:Hide the console");
  await app.waitFor("label:Show the console");
});
