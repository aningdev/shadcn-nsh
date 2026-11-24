import { expect, open, test } from "nsh/test";

const mac = { platform: "macos" as const, reducedMotion: true };
const phone = { platform: "ios" as const, reducedMotion: true };

// A palette row with a detail line is the taller of its content (40 on a pointer) and the theme's
// tallest control height (`row-min`), so only `row-min` shows the theme on a desktop.
test("a palette row, an item tile, kbd and a drawer's grabber redraw on a theme switch", async () => {
  const app = await open("./theme-reads.fixture.tsx", mac);
  await app.waitFor("text:row-min=32");
  expect(app.texts()).toContain("tile=28");
  expect(app.texts()).toContain("kbd-curve=continuous");
  expect(app.texts()).toContain("grabber-curve=continuous");

  await app.press("text:Apply Material");
  await app.waitFor("text:row-min=40");
  // Material's desktop icons are the base scale again (ADR 0003), so the tile (icon + 12) matches the build-time theme's.
  expect(app.texts()).toContain("tile=28");
  expect(app.texts()).toContain("kbd-curve=circular");
  expect(app.texts()).toContain("grabber-curve=circular");

  await app.press("text:Apply WinUI");
  await app.waitFor("text:row-min=40");
  expect(app.texts()).toContain("title-weight=400");

  await app.press("text:Apply NSH Gallery");
  await app.waitFor("text:row-min=32");
  expect(app.texts()).toContain("tile=28");
  expect(app.texts()).toContain("kbd-curve=continuous");
  expect(app.texts()).toContain("title-weight=500");
});

test("a refresh indicator's chip takes a touch theme's mid control height", async () => {
  const app = await open("./theme-reads.fixture.tsx", phone);
  await app.waitFor("text:chip=40");
  await app.waitFor("text:row-min=48");

  await app.press("text:Apply Apple");
  await app.waitFor("text:chip=44");
  expect(app.texts()).toContain("row-min=56");
  expect(app.texts()).toContain("row=56");

  await app.press("text:Apply NSH Gallery");
  await app.waitFor("text:chip=40");
  expect(app.texts()).toContain("row-min=48");
});
