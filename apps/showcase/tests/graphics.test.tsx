// Canvas, Shader and Photos: each official gallery scene opens from the sidebar, draws its first
// card and answers its main interaction. The last tests check the phone push, both appearances and
// the shadcn palette, so a scene that only works in one layout or theme is caught here.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", width: 390, height: 844 } as const;

type App = Awaited<ReturnType<typeof open>>;

/** Opens a demo by its sidebar entry and waits for a text only that demo draws. */
async function show(app: App, name: string, marker: string) {
  await app.press(`label:${name}`);
  await app.waitFor(`text:${marker}`);
}

test("Canvas: the dial, chart and drawing scenes render and answer", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Canvas", "Turbine 3 load");
  expect(app.texts()).toContain("Relay throughput");
  expect(app.texts()).toContain("Ridgeline, one curve a day");
  expect(app.texts()).toContain("Beacon uptime");
  expect(app.texts()).toContain("Compositing");
  const before = app.texts().join("|");
  await app.press("text:New");
  expect(app.texts().join("|")).not.toBe(before);
});

test("Shader: the GPU scenes render, transition and push pages", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Shader", "Glow");
  expect(app.texts()).toContain("Code rain");
  expect(app.texts()).toContain("Shader transition");
  expect(app.texts()).toContain("Pages and dialogs");
  await app.waitFor("text:Morning");
  await app.press("text:Next");
  await app.waitFor("text:Noon");
  await app.press("text:Open a dialog");
  await app.waitFor("text:Presented through the iris");
  await app.press("text:Close");
  await app.wait(300);
  // The iris page plays inside the scene's own stack: push it, then leave it.
  await app.press("text:Push a page");
  await app.waitFor("text:Leave the page");
  await app.press("text:Leave the page");
  await app.waitFor("text:Push a page");
});

test("Photos: the stream loads, refreshes and pages", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Photos", "Photo stream");
  expect(app.texts()).toContain("1,000 photos");
  expect(app.texts()).toContain("Ridge 0001");
  await app.press("label:Refresh");
  await app.waitFor("text:Refreshing…");
  await app.waitFor("text:Refresh", { timeout: 4000 });
  expect(app.texts()).toContain("1");
});

test("Canvas and Photos push onto a phone's stack", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  await show(app, "Canvas", "Turbine 3 load");
  expect(app.texts()).toContain("Relay throughput");
  await app.back();
  await app.waitFor("text:ACTIONS");
  await show(app, "Photos", "Photo stream");
  expect(app.texts()).toContain("Ridge 0001");
});

test("every graphics scene draws in the dark and the shadcn palette", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  for (const [name, marker] of [
    ["Canvas", "Turbine 3 load"],
    ["Shader", "Glow"],
    ["Photos", "Photo stream"],
  ]) {
    await app.press(`label:${name}`);
    await app.waitFor(`text:${marker}`);
  }
});
