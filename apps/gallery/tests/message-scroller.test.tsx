import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

const offset = (app: Awaited<ReturnType<typeof open>>) => Number(find(app.texts(), "offset="));

test("a message scroller opens at its newest message", async () => {
  const app = await open("./message-scroller.fixture.tsx");
  await app.wait(50);
  expect(offset(app)).toBeGreaterThan(0);
  expect(app.texts()).toContain("Turn 8");
});

test("a new message follows the end while the reader is there", async () => {
  const app = await open("./message-scroller.fixture.tsx");
  await app.wait(50);
  await app.press("role:button[Send]");
  await app.waitFor("text:turns=9");
  await app.wait(80);
  expect(app.texts()).toContain("Turn 9");
});

test("a new message leaves a reader who scrolled up where they were", async () => {
  const app = await open("./message-scroller.fixture.tsx");
  await app.wait(50);
  await app.scroll("label:Conversation", -240);
  await app.wait(50);
  const before = offset(app);
  expect(before).toBeLessThan(240);
  await app.press("role:button[Send]");
  await app.waitFor("text:turns=9");
  await app.wait(80);
  expect(offset(app)).toBe(before);
  expect(app.texts()).not.toContain("Turn 9");
});

test("the button takes a reader back to the end", async () => {
  const app = await open("./message-scroller.fixture.tsx");
  await app.wait(50);
  await app.scroll("label:Conversation", -240);
  await app.wait(50);
  const up = offset(app);
  await app.press("label:Scroll to end");
  await app.wait(150);
  expect(offset(app)).toBeGreaterThan(up);
  expect(app.texts()).toContain("Turn 8");
});

test("a command scrolls to a message by its key", async () => {
  const app = await open("./message-scroller.fixture.tsx");
  await app.wait(50);
  expect(offset(app)).toBeGreaterThan(240);
  await app.press("role:button[Jump to 2]");
  await app.wait(150);
  expect(offset(app)).toBeLessThan(240);
  expect(app.texts()).toContain("Turn 1");
});
