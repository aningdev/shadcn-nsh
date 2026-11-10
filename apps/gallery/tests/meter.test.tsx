import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);
const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

test("a Progress follows a value set after mount, then an indeterminate flag", async () => {
  const app = await open("./meter.fixture.tsx");
  expect(has(app.texts(), "sent=10")).toBe(true);
  expect(has(app.texts(), "at=-90% 0")).toBe(true);
  expect(find(app.texts(), "glide=")?.startsWith("w-full")).toBe(true);
  await app.press("text:Add");
  await app.wait(50);
  expect(has(app.texts(), "sent=35")).toBe(true);
  expect(has(app.texts(), "at=-65% 0")).toBe(true);
  await app.press("text:Busy");
  await app.wait(50);
  expect(has(app.texts(), "glide=w-1/3")).toBe(true);
  expect(has(app.texts(), "at=sweep")).toBe(true);
});

test("a Slider reports a drag of its thumb, and disabled follows a signal", async () => {
  const app = await open("./meter.fixture.tsx");
  expect(has(app.texts(), "level=10")).toBe(true);
  expect(app.enabled("label:Locked")).toBe(true);
  await app.drag("label:Level", { x: 40 });
  await app.wait(50);
  expect(has(app.texts(), "level=10")).toBe(false);
  await app.press("text:Lock");
  await app.wait(50);
  expect(app.enabled("label:Locked")).toBe(false);
});

test("an Avatar follows a name set after mount, and a group counts the rest", async () => {
  const app = await open("./meter.fixture.tsx");
  expect(has(app.texts(), "AL")).toBe(true);
  expect(has(app.texts(), "+4")).toBe(true);
  await app.press("text:Rename");
  await app.wait(50);
  expect(has(app.texts(), "who=Grace Hopper")).toBe(true);
  expect(has(app.texts(), "GH")).toBe(true);
});

test("a Table shows its cells, and a row's selected flag follows a signal", async () => {
  const app = await open("./meter.fixture.tsx");
  expect(has(app.texts(), "Paid")).toBe(true);
  expect(has(app.texts(), "picked=")).toBe(true);
  await app.press("text:Select");
  await app.wait(50);
  expect(has(app.texts(), "picked=INV1")).toBe(true);
});

test("the rail stays 6, and the thumb and avatar grow on a touch screen", async () => {
  const desktop = await open("./meter.fixture.tsx", { platform: "macos" });
  const touch = await open("./meter.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  expect(find(desktop.texts(), "rail=")).toBe("6");
  expect(find(touch.texts(), "rail=")).toBe("6");
  // Thumb 14, rail 6, band 20, vertical run 128. Touch: 20, 8, 32, 144.
  expect(find(desktop.texts(), "thumb=")).toBe("14|6|20|128");
  expect(find(touch.texts(), "thumb=")).toBe("20|8|32|144");
  // Avatar side 32, initials 11. Touch: 40 and 14.
  expect(find(desktop.texts(), "avatar=")).toBe("32|11");
  expect(find(touch.texts(), "avatar=")).toBe("40|14");
});

test("reduced motion drops the determinate glide and keeps the indeterminate sweep", async () => {
  const app = await open("./meter.fixture.tsx", { reducedMotion: true });
  expect(find(app.texts(), "motion=")).toBe("true");
  const glide = find(app.texts(), "glide=") ?? "";
  // The 180 ms translate opts out. The class is how `motion-reduce` reaches it.
  expect(glide.startsWith("w-full")).toBe(true);
  expect(glide.includes("motion-reduce:transition-none")).toBe(true);
  await app.press("text:Busy");
  await app.wait(50);
  // Still the sweeping third (`ignoreReduceMotion`), not a resting full-width bar.
  expect(has(app.texts(), "glide=w-1/3")).toBe(true);
  expect(has(app.texts(), "at=sweep")).toBe(true);
});
