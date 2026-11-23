import { expect, open, test } from "nsh/test";

// A pointer is what a bar's triggers are for, so these open the page as a desktop.
const desktop = { platform: "macos" } as const;

test("an open trigger wears the expanded fill, and the fill leaves with it", async () => {
  const app = await open("./menubar.fixture.tsx", desktop);
  const trigger = "role:menuitem[File]";
  const resting = app.viewStyle(trigger)?.backgroundColor ?? null;
  await app.press("text:File");
  await app.waitFor("text:New");
  // Off the trigger, so only the open state's fill is left on it (the pointer's fill is the same
  // neutral `accent`, which is why it has to be moved away to see the state).
  await app.hover("text:after");
  await app.wait(100);
  const expanded = app.viewStyle(trigger)?.backgroundColor ?? null;
  expect(expanded).not.toBe(null);
  expect(expanded).not.toBe(resting);
  await app.keyboard.press("escape");
  await app.wait(400);
  expect(app.shows("New")).toBe(false);
  expect(app.viewStyle(trigger)?.backgroundColor ?? null).toBe(resting);
});

test("a disabled trigger stays dimmed through its disabled state", async () => {
  const app = await open("./menubar.fixture.tsx", desktop);
  expect(app.viewStyle("role:menuitem[Off]")?.opacity ?? null).toBe(0.5);
});

test("the bar and its triggers take the app's own view props", async () => {
  const app = await open("./menubar.fixture.tsx", desktop);
  expect(app.count("id:bar")).toBe(1);
  expect(app.count("id:help")).toBe(1);
  expect(app.count("label:Main")).toBe(1);
  expect(app.count("label:Help")).toBe(1);
});

test("the app's hover style reaches the trigger, with the trigger's own", async () => {
  const app = await open("./menubar.fixture.tsx", desktop);
  const away = app.viewStyle("id:help")?.effectiveOpacity ?? 1;
  await app.hover("id:help");
  // The app's `hoverStyle` merges with the look's: the opacity it set is the one on screen.
  expect(app.viewStyle("id:help")?.opacity).toBe(0.5);
  expect(app.viewStyle("id:help")?.effectiveOpacity ?? 1).toBeLessThan(away);
});

test("a row, its label and its note take the app's view props too", async () => {
  const app = await open("./menubar.fixture.tsx", desktop);
  await app.press("text:Help");
  await app.waitFor("id:label");
  expect(app.count("id:label")).toBe(1);
  expect(app.count("label:This file")).toBe(1);
  expect(app.count("id:new")).toBe(1);
  expect(app.count("id:note")).toBe(1);
  await expect(app.press("id:gone")).rejects.toMatchObject({ code: "ERR_NSH_TEST_DISABLED" });
});
