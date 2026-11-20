import { expect, open, test } from "nsh/test";

test("a trigger with more than one child opens its content, chevron pointing down", async () => {
  const app = await open("./collapsible.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("text:★")).toBe(true);
  expect(app.shows("text:Nothing in it.")).toBe(false);
  await app.press("text:Trash");
  await app.waitFor("text:Nothing in it.");
});

test("chevron='along' keeps the right-pointing one in its lane", async () => {
  const app = await open("./collapsible.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:Along");
  await app.waitFor("text:Along body");
});

test("a disabled trigger takes no press and opens nothing", async () => {
  const app = await open("./collapsible.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.enabled("text:Locked")).toBe(false);
  await app.press("text:Locked").catch(() => {});
  await app.wait(100);
  expect(app.shows("text:Locked body")).toBe(false);
});
