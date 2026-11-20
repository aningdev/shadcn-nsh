import { expect, open, test } from "nsh/test";

test("a trigger lays out more than one child, and opens its panel", async () => {
  const app = await open("./accordion.fixture.tsx", { platform: "macos", reducedMotion: true });
  // An icon, the app's own label part, and the shell's chevron share the trigger's row.
  expect(app.shows("text:★")).toBe(true);
  expect(app.shows("text:Rich row")).toBe(true);
  expect(app.shows("text:Rich body")).toBe(false);
  await app.press("text:Rich row");
  await app.waitFor("text:Rich body");
});

test("a string child is the label, in the room the chevron leaves", async () => {
  const app = await open("./accordion.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:Plain row");
  await app.waitFor("text:Plain body");
});

test("a disabled trigger takes no press and opens nothing", async () => {
  const app = await open("./accordion.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.enabled("text:Broken row")).toBe(false);
  await app.press("text:Broken row").catch(() => {});
  await app.wait(100);
  expect(app.shows("text:Broken body")).toBe(false);
});

test("a disabled item takes no press, as it did before the trigger could be disabled", async () => {
  const app = await open("./accordion.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.enabled("text:Item off")).toBe(false);
  await app.press("text:Item off").catch(() => {});
  await app.wait(100);
  expect(app.shows("text:Item off body")).toBe(false);
});
