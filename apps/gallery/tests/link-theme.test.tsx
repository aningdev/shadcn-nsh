import { expect, open, test } from "nsh/test";

test("a link's ink follows a theme switch, and comes back", async () => {
  const app = await open("./link-theme.fixture.tsx");
  const before = app.spanStyle("text:Ink").color;
  const dimmed = app.spanStyle("text:Dimmed").color;
  await app.press("text:Shadcn");
  await app.wait(100);
  const switched = app.spanStyle("text:Ink").color;
  expect(switched).not.toBe(before);
  // The disabled link's ink is a token of its own, and follows the same switch.
  expect(app.spanStyle("text:Dimmed").color).not.toBe(dimmed);
  await app.press("text:Build-time");
  await app.wait(100);
  expect(app.spanStyle("text:Ink").color).toBe(before);
  expect(app.spanStyle("text:Dimmed").color).toBe(dimmed);
});
