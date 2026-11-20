import { expect, open, test } from "nsh/test";

const touch = { platform: "ios" as const, reducedMotion: true };

// A headless run has no pull (nothing feeds `pullValue`), so these cover what the app drives: the
// indicator mounts over the scroll view, takes no presses, and follows `refreshing` through a reload.

test("the indicator is mounted over the scroll view and a reload runs refreshing then done", async () => {
  const app = await open("./refresh-indicator.fixture.tsx", touch);
  expect(app.count("id:indicator")).toBe(1);
  expect(app.texts()).toContain("refreshing false");
  await app.press("text:Reload");
  await app.waitFor("text:refreshing true");
  await app.waitFor("text:refreshed 1");
  expect(app.texts()).toContain("refreshing false");
  expect(app.count("id:indicator")).toBe(1);
});

test("a second reload while one runs is ignored by the app, and the indicator survives it", async () => {
  const app = await open("./refresh-indicator.fixture.tsx", touch);
  await app.press("text:Reload");
  await app.press("text:Reload");
  await app.waitFor("text:refreshed 1");
  await app.wait(400);
  expect(app.texts()).toContain("refreshed 1");
  expect(app.count("id:indicator")).toBe(1);
});
