import { expect, open, test } from "nsh/test";

const desktop = { platform: "macos" as const };

test("HoverCard opens after the pointer rests and closes on Escape", async () => {
  const app = await open("./hover-card.fixture.tsx", desktop);
  await app.hover("text:Open A");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1");
  await app.keyboard.press("escape");
  await app.wait(250);
  expect(app.shows("Body A")).toBe(false);
});

test("HoverCard custom trigger is a button that opens", async () => {
  const app = await open("./hover-card.fixture.tsx", desktop);
  expect(app.count("role:button[Open B]")).toBeGreaterThan(0);
  await app.hover("text:Open B");
  await app.waitFor("text:Body B");
});

test("a disabled HoverCard trigger does not open", async () => {
  const app = await open("./hover-card.fixture.tsx", desktop);
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open C")).toBe(false);
  await app.hover("text:Open C");
  await app.wait(200);
  expect(app.shows("Body C")).toBe(false);
});
