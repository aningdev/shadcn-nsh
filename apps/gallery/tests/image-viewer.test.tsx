import { expect, open, test } from "nsh/test";

const desktop = { platform: "macos" as const, reducedMotion: true };

test("an image opens the viewer, and its alt text is the caption", async () => {
  const app = await open("./image-viewer.fixture.tsx", desktop);
  expect(app.shows("text:A sunrise over the pad")).toBe(false);
  await app.press("text:Open photo");
  await app.waitFor("text:A sunrise over the pad");
  expect(app.count("label:Close")).toBe(1);
});

test("the close button closes it", async () => {
  const app = await open("./image-viewer.fixture.tsx", desktop);
  await app.press("text:Open photo");
  await app.waitFor("text:A sunrise over the pad");
  await app.press("label:Close");
  await app.wait(100);
  expect(app.shows("text:A sunrise over the pad")).toBe(false);
  expect(app.texts()).toContain("closes 1");
});

test("Escape closes it", async () => {
  const app = await open("./image-viewer.fixture.tsx", desktop);
  await app.press("text:Open photo");
  await app.waitFor("text:A sunrise over the pad");
  await app.keyboard.press("escape");
  await app.wait(250);
  expect(app.shows("text:A sunrise over the pad")).toBe(false);
  expect(app.texts()).toContain("closes 1");
});
