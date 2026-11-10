import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);

test("a Tree expands from a press, skips a disabled row, and acts on a leaf", async () => {
  const app = await open("./tree.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(has(app.texts(), "expanded=")).toBe(true);
  await app.press("text:src");
  await app.waitFor("text:main.rs");
  expect(has(app.texts(), "expanded=src")).toBe(true);
  expect(has(app.texts(), "selected=src")).toBe(true);
  await app.keyboard.press("down");
  await app.wait(50);
  expect(has(app.texts(), "selected=main")).toBe(true);
  await app.keyboard.press("down");
  await app.wait(50);
  expect(has(app.texts(), "selected=lib")).toBe(true);
  await app.keyboard.press("enter");
  await app.wait(50);
  expect(has(app.texts(), "action=lib")).toBe(true);
});

test("Right expands a Tree folder, and a disabled Tree takes no press", async () => {
  const app = await open("./tree.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:notes.txt");
  await app.wait(50);
  expect(has(app.texts(), "selected=notes")).toBe(true);
  await app.keyboard.press("up");
  await app.keyboard.press("right");
  await app.wait(50);
  expect(has(app.texts(), "expanded=src")).toBe(true);
  expect(has(app.texts(), "selected=src")).toBe(true);
  await expect(app.press("text:Locked folder")).rejects.toMatchObject({
    code: "ERR_NSH_TEST_DISABLED",
  });
  expect(has(app.texts(), "selected=src")).toBe(true);
});
