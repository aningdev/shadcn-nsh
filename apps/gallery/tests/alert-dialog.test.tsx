import { expect, open, test } from "nsh/test";

test("AlertDialog reports the destructive action id and closes", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Delete");
  await app.waitFor("action delete");
  await app.wait(100);
  expect(app.shows("Body A")).toBe(false);
});

test("AlertDialog cancel reports its own id", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Keep");
  await app.waitFor("action cancel");
});

test("Escape reports a null action when the alert allows it", async () => {
  const app = await open("./alert-dialog.fixture.tsx", { platform: "macos" });
  await app.press("text:Open B");
  await app.waitFor("text:Body B");
  await app.keyboard.press("escape");
  await app.waitFor("action null");
  await app.wait(100);
  expect(app.shows("Body B")).toBe(false);
});

test("a disabled AlertDialog trigger does not open", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open C")).toBe(false);
  await app.press("text:Open C").catch(() => {});
  await app.wait(100);
  expect(app.shows("Body C")).toBe(false);
});
