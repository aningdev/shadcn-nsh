import { expect, open, test } from "nsh/test";

test("string trigger opens the dialog and reports one change", async () => {
  const app = await open("./dialog.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1");
});

test("close dismisses the dialog", async () => {
  const app = await open("./dialog.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Close A");
  await app.wait(100);
  expect(app.shows("Body A")).toBe(false);
  expect(app.texts()).toContain("changes 2");
});

test("custom trigger is a button that opens", async () => {
  const app = await open("./dialog.fixture.tsx");
  expect(app.count("role:button[Open B]")).toBeGreaterThan(0);
  await app.press("text:Open B");
  await app.waitFor("text:Body B");
});

test("a disabled trigger does not open, and follows a later change", async () => {
  const app = await open("./dialog.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open C")).toBe(false);
  await app.press("text:Open C").catch(() => {});
  await app.wait(100);
  expect(app.shows("Body C")).toBe(false);
});
