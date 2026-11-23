import { expect, open, test } from "nsh/test";

const mac = { platform: "macos" as const, reducedMotion: true };
const phone = { platform: "ios" as const, reducedMotion: true };

test("a palette row, an item tile, kbd and a drawer's grabber redraw on a theme switch", async () => {
  const app = await open("./theme-reads.fixture.tsx", mac);
  await app.waitFor("text:row=32");
  expect(app.texts()).toContain("tile=28");
  expect(app.texts()).toContain("kbd-curve=continuous");
  expect(app.texts()).toContain("grabber-curve=continuous");

  await app.press("text:Apply Material");
  await app.waitFor("text:row=48");
  expect(app.texts()).toContain("tile=32");
  expect(app.texts()).toContain("kbd-curve=circular");
  expect(app.texts()).toContain("grabber-curve=circular");

  await app.press("text:Apply WinUI");
  await app.waitFor("text:row=40");
  expect(app.texts()).toContain("title-weight=400");

  await app.press("text:Apply Default");
  await app.waitFor("text:row=32");
  expect(app.texts()).toContain("tile=28");
  expect(app.texts()).toContain("kbd-curve=continuous");
  expect(app.texts()).toContain("title-weight=500");
});

test("a refresh indicator's chip takes a touch theme's mid control height", async () => {
  const app = await open("./theme-reads.fixture.tsx", phone);
  await app.waitFor("text:chip=40");
  await app.waitFor("text:row=48");

  await app.press("text:Apply Apple");
  await app.waitFor("text:chip=44");
  expect(app.texts()).toContain("row=56");

  await app.press("text:Apply Default");
  await app.waitFor("text:chip=40");
  expect(app.texts()).toContain("row=48");
});
