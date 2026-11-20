import { expect, open, test } from "nsh/test";

test("a collapsible line opens onto its content and closes again", async () => {
  const app = await open("./trace.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("text:The tide is low at noon.")).toBe(false);
  await app.press("text:Thought for");
  await app.waitFor("text:The tide is low at noon.");
  await app.press("text:Thought for");
  await app.wait(300);
  expect(app.shows("text:The tide is low at noon.")).toBe(false);
});

test("a running line shows a spinner in its icon slot, and its icon once it is done", async () => {
  const app = await open("./trace.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("text:★")).toBe(false);
  expect(app.shows("text:◆")).toBe(true);
  await app.press("text:Finish");
  await app.waitFor("text:★");
});

test("a line with onPress is pressable", async () => {
  const app = await open("./trace.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("text:pressed 0")).toBe(true);
  await app.press("text:Queued call");
  await app.waitFor("text:pressed 1");
});
