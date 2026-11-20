import { expect, open, test } from "nsh/test";

// A pointer is what opens a panel by rest, so these open the page as a desktop (the web target
// measures a mouse anyway).
const desktop = { platform: "macos" } as const;

test("a press opens a trigger's panel and reports one change", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1 · a · triggerPress");
});

test("a second press on the same trigger closes it", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Open A");
  await app.wait(400);
  expect(app.shows("Body A")).toBe(false);
  expect(app.texts()).toContain("changes 2 · closed · triggerPress");
});

test("one panel at a time: opening B closes A", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Open B");
  await app.waitFor("text:Body B");
  await app.wait(450);
  expect(app.shows("Body A")).toBe(false);
  expect(app.shows("Body B")).toBe(true);
  expect(app.texts()).toContain("changes 2 · b · triggerPress");
});

test("Escape closes the open panel", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.keyboard.press("escape");
  await app.wait(400);
  expect(app.shows("Body A")).toBe(false);
  expect(app.texts()).toContain("changes 2 · closed · cancel");
});

test("a press outside closes the open panel, and the press lands", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Docs");
  await app.wait(400);
  expect(app.shows("Body A")).toBe(false);
  expect(app.texts()).toContain("changes 2 · closed · pressOutside");
  expect(app.texts()).toContain("picked Docs");
});

test("the pointer's rest opens a panel, the panel holds it, and leaving it closes", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.hover("text:Open A");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1 · a · hover");
  // Moving from the trigger onto the panel keeps it: time to cross, not to browse.
  await app.hover("text:Body A");
  await app.wait(450);
  expect(app.shows("Body A")).toBe(true);
  // Off both, it closes after a pause.
  await app.hover("text:Docs");
  await app.wait(450);
  expect(app.shows("Body A")).toBe(false);
});

test("the keyboard opens the trigger it is on", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.keyboard.press("tab");
  await app.keyboard.press("enter");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1 · a · triggerPress");
});

test("a disabled trigger opens nothing, by press or by rest", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.press("text:Off").catch(() => {});
  await app.hover("text:Off");
  await app.wait(400);
  expect(app.shows("Body Off")).toBe(false);
  expect(app.texts()).toContain("changes 0 · —");
});

test("a link reports its press and opens nothing", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.press("text:Docs");
  await app.wait(100);
  expect(app.texts()).toContain("picked Docs");
  expect(app.texts()).toContain("changes 0 · —");
});

test("the bar is a navigation landmark holding a list", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  expect(app.count("role:navigation[Navigation]")).toBe(1);
  expect(app.count("role:list")).toBe(1);
  expect(app.count("role:button[Open A]")).toBe(1);
});

test("an open trigger wears the chosen fill, and the fill leaves with it", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  const resting = app.viewStyle("role:button[Open A]")?.backgroundColor ?? null;
  // The keyboard opens it, so no pointer rests on the trigger (hover has a fill of its own).
  await app.keyboard.press("tab");
  await app.keyboard.press("enter");
  await app.waitFor("text:Body A");
  const chosen = app.viewStyle("role:button[Open A]")?.backgroundColor ?? null;
  expect(chosen).not.toBe(null);
  expect(chosen).not.toBe(resting);
  await app.keyboard.press("escape");
  await app.wait(400);
  expect(app.viewStyle("role:button[Open A]")?.backgroundColor ?? null).toBe(resting);
});

test("the pointer over an open trigger shows the full fill, above the chosen one", async () => {
  const app = await open("./navigation-menu.fixture.tsx", desktop);
  await app.keyboard.press("tab");
  await app.keyboard.press("enter");
  await app.waitFor("text:Body A");
  await app.wait(400);
  const chosen = app.viewStyle("role:button[Open A]")?.backgroundColor ?? null;
  await app.hover("role:button[Open A]");
  await app.wait(400);
  expect(app.count("text:Body A")).toBe(1);
  const hovered = app.viewStyle("role:button[Open A]")?.backgroundColor ?? null;
  expect(hovered).not.toBe(null);
  expect(hovered).not.toBe(chosen);
});
