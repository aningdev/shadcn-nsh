import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

test("a rejected field shakes, and comes back to rest", async () => {
  const app = await open("./input-motion.fixture.tsx");
  expect(find(app.texts(), "playing=")).toBe("no");
  await app.press("id:reject");
  // The press lands while the shake plays: `wait` would run it out to its end.
  expect(find(app.texts(), "playing=")).toBe("yes");
  await app.wait(700);
  expect(find(app.texts(), "playing=")).toBe("no");
});

test("less motion leaves a rejected field where it is", async () => {
  const app = await open("./input-motion.fixture.tsx", { reducedMotion: true });
  await app.press("id:reject");
  expect(find(app.texts(), "playing=")).toBe("no");
  expect(find(app.texts(), "reject=")).toBe("1 amount=10");
});

test("a figure rolls to its next value, in place with less motion", async () => {
  const app = await open("./input-motion.fixture.tsx");
  expect(app.texts()).toContain("10 €");
  await app.press("id:grow");
  expect(app.texts()).toContain("20 €");
  const calm = await open("./input-motion.fixture.tsx", { reducedMotion: true });
  await calm.press("id:grow");
  expect(calm.texts()).toContain("20 €");
});
