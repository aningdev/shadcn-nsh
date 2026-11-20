import { expect, open, test } from "nsh/test";

const phone = { platform: "ios" as const, reducedMotion: true };
const RANGE = 168 - 44;

// The collapse is animated styles off `scrollValue`: a headless run draws them but reports the
// values the app set (`viewStyle`), not the interpolated ones. So these cover what it can see —
// the parts mount inside the header, and the page scrolls under a header that stays put.

const offset = (texts: string[]) =>
  Number(texts.find((line) => line.startsWith("offset="))?.slice("offset=".length));

test("a header draws its parts, and the page scrolls under it", async () => {
  const app = await open("./collapsing-header.fixture.tsx", phone);
  expect(app.count("id:header")).toBe(1);
  expect(app.count("id:backdrop")).toBe(1);
  expect(app.count("id:bar")).toBe(1);
  expect(app.texts()).toContain("Recent");
  expect(app.texts()).toContain("18 entries");

  await app.scroll("label:Page", RANGE * 2);
  await app.wait(300);
  expect(offset(app.texts())).toBeGreaterThanOrEqual(RANGE);
  expect(app.count("id:header")).toBe(1);
  expect(app.count("id:title")).toBe(1);
  expect(app.texts()).toContain("Recent");
});

test("scrolling back leaves the header whole", async () => {
  const app = await open("./collapsing-header.fixture.tsx", phone);
  await app.scroll("label:Page", RANGE);
  await app.wait(200);
  await app.scroll("label:Page", -RANGE);
  await app.wait(200);
  expect(offset(app.texts())).toBe(0);
  expect(app.count("id:bar")).toBe(1);
  expect(app.texts()).toContain("18 entries");
});
