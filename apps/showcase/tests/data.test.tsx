// Every Data demo draws and answers: each is opened from the sidebar, a text only it draws is
// waited for, and its main interaction is exercised once — so a demo that throws or a control
// that stopped reporting fails here rather than in a screenshot. The last
// two tests open the demos as a phone does, and in the other appearance and palette.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", width: 390, height: 844 } as const;

type App = Awaited<ReturnType<typeof open>>;

/** Every demo of the group with a text only it draws: the sidebar name and the page's first mark. */
const TOURS: [name: string, marker: string][] = [
  ["DataTable", "Row 500,000"],
  ["Plot", "Live price"],
  ["DiffView", "Long lines"],
];

/** Opens a demo by its sidebar entry and waits for `marker`, a text only that demo draws. */
async function show(app: App, name: string, marker: string) {
  await app.press(`label:${name}`);
  await app.waitFor(`text:${marker}`);
}

test("DataTable: a million rows scroll, tick and pause", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "DataTable", "Row 500,000");
  // The table serves the rows in view: the first page starts at the top.
  expect(app.texts().some((text) => text.startsWith("Rows 1–"))).toBe(true);
  // A press on a tool jumps the table a million rows down.
  await app.press("label:Go to row 500000");
  await app.wait(200);
  expect(app.texts().some((text) => text.startsWith("Rows 500000–"))).toBe(true);
  // Live updates pause from the toggle, and the line says so.
  await app.press("label:Toggle live updates");
  await app.waitFor("text:Paused");
  expect(app.texts()).toContain("Nothing selected");
});

test("Plot: 21 charts turn, switch and read their bands", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Plot", "Live price");
  // The revenue donut becomes a pie, and its button offers the way back.
  await app.press("text:Show as pie");
  await app.waitFor("text:Show as donut");
  // The bridge's quarter switches the statement it bridges.
  await app.press("text:3Q26");
  await app.waitFor("text:$131.2M");
  // The last charts of the page draw too, past the window.
  await app.wait(200);
  expect(app.texts()).toContain("Watchlist");
});

test("DiffView: changes navigate, and the patch shows its hunks", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "DiffView", "Long lines");
  // The diff counts its changes and lands on the first.
  await app.wait(200);
  expect(app.texts().some((text) => text.includes("Change 1 of"))).toBe(true);
  await app.press("label:Next change");
  await app.wait(200);
  expect(app.texts().some((text) => text.includes("Change 2 of"))).toBe(true);
  // A git patch is shown hunk by hunk, each with its own header.
  await app.press("text:Patch");
  await app.waitFor("text:Unified");
});

test("a phone pushes the Data demos onto its stack", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  for (const [name, marker] of TOURS) {
    await show(app, name, marker);
    await app.back();
    await app.waitFor("text:ACTIONS");
  }
});

test("every Data demo draws in the dark and the shadcn palette", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  for (const [name, marker] of TOURS) {
    await app.press(`label:${name}`);
    await app.waitFor(`text:${marker}`);
  }
});
