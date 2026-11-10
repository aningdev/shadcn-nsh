import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);

test("a Command filters as the user types and Return chooses the highlighted row", async () => {
  const app = await open("./command.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.type("Search commands", "tog");
  await app.waitFor("text:Toggle Theme");
  expect(app.texts().some((line) => line.includes("New File"))).toBe(false);
  expect(has(app.texts(), "query=tog")).toBe(true);
  await app.keyboard.press("enter");
  await app.wait(50);
  expect(has(app.texts(), "chosen=theme")).toBe(true);
});

test("a Command skips a disabled row with the keyboard", async () => {
  const app = await open("./command.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.waitFor("text:hi=new");
  await app.keyboard.press("tab");
  await app.keyboard.press("down");
  await app.wait(50);
  expect(has(app.texts(), "hi=theme")).toBe(true);
  await app.keyboard.press("enter");
  await app.wait(50);
  expect(has(app.texts(), "chosen=theme")).toBe(true);
});

test("Escape clears a Command query, then cancels", async () => {
  const app = await open("./command.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.type("Search commands", "x");
  await app.waitFor("text:query=x");
  await app.keyboard.press("escape");
  await app.wait(50);
  expect(has(app.texts(), "query=")).toBe(true);
  await app.keyboard.press("escape");
  await app.wait(50);
  expect(has(app.texts(), "cancel=1")).toBe(true);
});
