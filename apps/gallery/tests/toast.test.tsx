import { expect, open, test } from "nsh/test";

test("toast() shows a title and dismisses it", async () => {
  const app = await open("./toast.fixture.tsx");
  expect(app.texts()).toContain("Pinned");
  await app.press("text:Show");
  await app.waitFor("text:Hello");
  expect(app.shows("There")).toBe(true);
  await app.press("text:Dismiss");
  await app.wait(300);
  expect(app.shows("Hello")).toBe(false);
});

test("the close cross sinks, and stays still when motion is reduced", async () => {
  const move = await open("./toast.fixture.tsx", { reducedMotion: false });
  const still = await open("./toast.fixture.tsx", { reducedMotion: true });
  expect(move.texts().some((t) => t.startsWith("close="))).toBe(true);
  expect(move.texts()).toContain("close=sink");
  expect(still.texts()).toContain("close=still");
});
