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
