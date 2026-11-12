import { expect, open, test } from "nsh/test";

test("a static toast shows title and description", async () => {
  const app = await open("./toast.fixture.tsx");
  expect(app.texts()).toContain("Pinned");
  expect(app.texts()).toContain("Stays");
  expect(app.texts()).toContain("Hello");
  expect(app.texts()).toContain("There");
});

test("the close cross sinks, and stays still when motion is reduced", async () => {
  const move = await open("./toast.fixture.tsx", { reducedMotion: false });
  const still = await open("./toast.fixture.tsx", { reducedMotion: true });
  expect(move.texts().some((t) => t.startsWith("close="))).toBe(true);
  expect(move.texts()).toContain("close=sink");
  expect(still.texts()).toContain("close=still");
});
