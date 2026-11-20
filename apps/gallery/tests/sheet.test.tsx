import { expect, open, test } from "nsh/test";

test("string trigger opens the sheet and reports one change", async () => {
  const app = await open("./sheet.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1");
});

test("close dismisses the sheet", async () => {
  const app = await open("./sheet.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Close A");
  await app.wait(100);
  expect(app.shows("Body A")).toBe(false);
});

test("a right-edge sheet opens from a custom trigger", async () => {
  const app = await open("./sheet.fixture.tsx");
  expect(app.count("role:button[Open B]")).toBeGreaterThan(0);
  await app.press("text:Open B");
  await app.waitFor("text:Body B");
});

test("a disabled trigger does not open, and follows a later change", async () => {
  const app = await open("./sheet.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open C")).toBe(false);
  await app.press("text:Open C").catch(() => {});
  await app.wait(100);
  expect(app.shows("Body C")).toBe(false);
});

test("a bottom sheet's grabber is the one that drags, and it is labelled", async () => {
  const app = await open("./sheet.fixture.tsx", { platform: "ios", reducedMotion: true });
  await app.press("text:Open Grabber");
  await app.waitFor("text:detent unset");
  // One handle, not two: the shell styles `nsh/base`'s own adjustable grabber instead of drawing a
  // second, decorative one above it. A press moves it to the next larger detent.
  expect(app.count("label:Resize")).toBe(1);
  await app.press("label:Resize");
  await app.wait(150);
  expect(app.texts()).toContain("detent large");
});
