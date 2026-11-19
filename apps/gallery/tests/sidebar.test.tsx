import { expect, open, test } from "nsh/test";

// A column rather than a sheet needs a window wider than 600 points: a narrower page (or a touch
// screen) gives the window's sidebar as a sheet instead.
const wide = { platform: "macos", width: 1024, height: 700 } as const;
const narrow = { platform: "macos" } as const;

test("the trigger folds the column to its icons and back", async () => {
  const app = await open("./sidebar.fixture.tsx", wide);
  expect(app.texts()).toContain("state expanded · sheet false");
  await app.press("label:Toggle Sidebar");
  await app.wait(300);
  expect(app.texts()).toContain("state collapsed · sheet false");
  expect(app.texts()).toContain("changes 1 · closed · triggerPress");
  await app.press("label:Toggle Sidebar");
  await app.wait(300);
  expect(app.texts()).toContain("state expanded · sheet false");
});

test("⌘B folds it, and the change says the shortcut", async () => {
  const app = await open("./sidebar.fixture.tsx", wide);
  await app.keyboard.press("mod+b");
  await app.wait(300);
  expect(app.texts()).toContain("state collapsed · sheet false");
  expect(app.texts()).toContain("changes 1 · closed · shortcut");
});

test("the rail folds it, and the change says the rail", async () => {
  const app = await open("./sidebar.fixture.tsx", wide);
  await app.press("label:Toggle rail");
  await app.wait(300);
  expect(app.texts()).toContain("state collapsed · sheet false");
  expect(app.texts()).toContain("changes 1 · closed · railPress");
});

test("a column mounted closed is folded from the first frame", async () => {
  const app = await open("./sidebar-closed.fixture.tsx", wide);
  expect(app.texts()).toContain("state collapsed · sheet false");
  // Folded, a row draws its icon alone: the name stays for the tooltip, not for the page.
  expect(app.texts()).not.toContain("Row A");
  await app.press("label:Toggle Sidebar");
  await app.wait(300);
  expect(app.texts()).toContain("state expanded · sheet false");
  expect(app.texts()).toContain("Row A");
});

test("a folded row shows its name in a tooltip", async () => {
  const app = await open("./sidebar.fixture.tsx", wide);
  await app.press("label:Toggle Sidebar");
  await app.wait(300);
  await app.hover("role:button[Row A]");
  await app.waitFor("text:Tip A");
  expect(app.shows("Tip A")).toBe(true);
});

test("a row takes a press", async () => {
  const app = await open("./sidebar.fixture.tsx", wide);
  await app.press("role:button[Row A]");
  await app.wait(200);
  expect(app.texts()).toContain("presses 1");
});

test("a narrow window opens the column as a sheet", async () => {
  const app = await open("./sidebar.fixture.tsx", narrow);
  expect(app.texts()).toContain("state expanded · sheet false");
  await app.press("label:Toggle Sidebar");
  await app.waitFor("text:Rows");
  expect(app.texts()).toContain("state expanded · sheet true");
});
