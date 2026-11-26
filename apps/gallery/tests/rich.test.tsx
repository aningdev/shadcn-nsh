import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);
const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

test("a ColorPicker swatch, slider drag and plane change the color, and a disabled one does not", async () => {
  const app = await open("./rich.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(has(app.texts(), "color=none")).toBe(true);
  await app.press("label:#ff0000");
  await app.wait(50);
  const picked = find(app.texts(), "color=");
  expect(picked?.toLowerCase()).toContain("ff0000");
  await app.drag("label:Fill hue", { x: 80 });
  await app.wait(50);
  const dragged = find(app.texts(), "color=")?.toLowerCase();
  expect(dragged).not.toBe(picked?.toLowerCase());
  await app.press("label:Fill saturation and brightness");
  await app.wait(50);
  expect(find(app.texts(), "color=")?.toLowerCase()).not.toBe(dragged);
  expect(has(app.texts(), "blocked=none")).toBe(true);
});

test("a ColorField keeps the field transition, including under reduced motion", async () => {
  const normal = await open("./rich.fixture.tsx", { platform: "macos", reducedMotion: false });
  expect(find(normal.texts(), "motion=")).toBe("border-color, opacity|150");
  const reduced = await open("./rich.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(find(reduced.texts(), "motion=")).toBe("border-color, opacity|0");
});

test("a TextView reports a link press", async () => {
  const app = await open("./rich.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:guide");
  await app.wait(50);
  expect(has(app.texts(), "link=https://example.com/guide")).toBe(true);
});

test("a DiffView reports lines added and deleted", async () => {
  const app = await open("./rich.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.waitFor("text:stats=1:1");
  expect(app.texts().some((line) => line.includes("gamma"))).toBe(true);
  expect(app.texts().some((line) => line.includes("beta"))).toBe(true);
});
