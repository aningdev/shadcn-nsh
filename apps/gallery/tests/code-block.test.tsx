import { expect, open, test } from "nsh/test";

test("copy writes the value to the clipboard, flips to Copied, and flips back after two seconds", async () => {
  const app = await open("./code-block.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.count("label:Copy")).toBe(1);
  expect(app.shows("label:Copied")).toBe(false);
  await app.press("label:Copy");
  await app.waitFor("label:Copied");
  expect(app.clipboardItem()?.text).toBe("const a = 1;\nconst b = 2;");
  expect(app.shows("label:Copy")).toBe(false);
  await app.wait(2200);
  expect(app.shows("label:Copy")).toBe(true);
  expect(app.shows("label:Copied")).toBe(false);
});

test("lines are numbered from startLine, and lines of your own count in the order they are drawn", async () => {
  const app = await open("./code-block.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("text:8")).toBe(true);
  expect(app.shows("text:9")).toBe(true);
  // One trailing newline does not make a third line.
  expect(app.shows("text:10")).toBe(false);
  expect(app.shows("text:1")).toBe(true);
  expect(app.shows("text:2")).toBe(true);
  expect(app.shows("text:second")).toBe(true);
});
