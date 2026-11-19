import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

const offset = (app: Awaited<ReturnType<typeof open>>) => Number(find(app.texts(), "offset="));

test("a scroller opened at the oldest knows there is an end, and its button goes there", async () => {
  const app = await open("./message-scroller-start.fixture.tsx");
  await app.wait(100);
  expect(app.texts()).toContain("atStart=true");
  expect(app.texts()).toContain("atEnd=false");
  expect(offset(app)).toBe(0);
  await app.press("label:Scroll to end");
  await app.wait(200);
  expect(offset(app)).toBeGreaterThan(0);
  expect(app.texts()).toContain("atEnd=true");
});

test("a scroller whose turns all fit rests at both edges and keeps its button away", async () => {
  const app = await open("./message-scroller-short.fixture.tsx");
  await app.wait(100);
  expect(app.texts()).toContain("atStart=true");
  expect(app.texts()).toContain("atEnd=true");
  await expect(app.press("label:Scroll to end")).rejects.toThrow();
});
