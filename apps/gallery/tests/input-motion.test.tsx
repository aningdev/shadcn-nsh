import { expect, open, test } from "nsh/test";

test("a rejected field shakes, and comes back to rest", async () => {
  const app = await open("./input-motion.fixture.tsx");
  expect(app.texts()).toContain("plays=0 playing=no");
  await app.press("id:reject");
  // The press lands while the shake plays, and the shake can be over before a frame is looked at
  // (2 runs in 8 read `playing=no`), so the fixture counts the shakes it played: `waitFor` catches
  // that whenever the frame lands, and `playing` is back to `no` once the shake it played is done.
  await app.waitFor("text:/^plays=1/");
  await app.waitFor("text:/plays=1 playing=no/");
  expect(app.texts()).toContain("reject=1 amount=10");
});

test("less motion leaves a rejected field where it is", async () => {
  const app = await open("./input-motion.fixture.tsx", { reducedMotion: true });
  await app.press("id:reject");
  await app.waitFor("text:/reject=1 amount=10/");
  expect(app.texts()).toContain("plays=0 playing=no");
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
