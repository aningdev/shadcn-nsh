import { expect, open, test } from "nsh/test";

test("a pressable's string child is its name, and it takes the press", async () => {
  const app = await open("./pressable.fixture.tsx");
  await app.press("role:button[Retry]");
  await app.waitFor("text:pressed 1");
});

test("a pressable adds feedback and no appearance of its own", async () => {
  const app = await open("./pressable.fixture.tsx");
  // No fill, no padding, no height; the hover, the press's sink and the ring are all there.
  expect(app.texts()).toContain("fill=— padding=— height=— hover=yes sink=yes ring=yes");
});
