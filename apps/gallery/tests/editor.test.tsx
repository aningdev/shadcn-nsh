import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

test("an Editor reports typing, and its accessible name finds it", async () => {
  const app = await open("./editor.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("label:Code sample")).toBe(true);
  await app.type("id:code", "Z");
  await app.wait(50);
  expect(find(app.texts(), "focus=")).toBe("typescript");
  expect(find(app.texts(), "typescript=")).toContain("Z");
  expect(find(app.texts(), "value=")).toContain("Z");
});

test("a read-only Editor takes no text", async () => {
  const app = await open("./editor.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("label:Locked source")).toBe(true);
  await app.type("id:locked", "NO").catch(() => {});
  await app.wait(50);
  expect(find(app.texts(), "locked=")).toBe("keep");
});

test("a controlled Editor shows a new value the app sets", async () => {
  const app = await open("./editor.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("label:Load a file");
  await app.wait(50);
  expect(find(app.texts(), "typescript=")).toContain("43");
  await app.type("id:code", "Y");
  await app.wait(50);
  // The text after the new value, not the one it replaced.
  expect(find(app.texts(), "typescript=")).toContain("43");
  expect(find(app.texts(), "typescript=")).toContain("Y");
});

test("an Editor keeps each file's text when the language switches", async () => {
  const app = await open("./editor.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.type("id:code", "X");
  await app.wait(50);
  await app.press("label:Switch language");
  await app.wait(50);
  expect(find(app.texts(), "value=")).toContain('"answer"');
  await app.type("id:code", "Y");
  await app.wait(50);
  expect(find(app.texts(), "json=")).toContain("Y");
  expect(find(app.texts(), "typescript=")).toContain("X");
  await app.press("label:Switch language");
  await app.wait(50);
  expect(find(app.texts(), "typescript=")).toContain("X");
});

test("an EditorFindBar finds what is typed, and steps the matches", async () => {
  const app = await open("./editor.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("label:Find")).toBe(true);
  await app.type("label:Find", "const");
  await app.wait(100);
  // The editor finds it (it owns the search) and the bar says how many there are.
  expect(find(app.texts(), "count=")).toBe("2");
  expect(app.texts()).toContain("2 matches");
  await app.press("label:Next match");
  await app.wait(100);
  expect(app.texts()).toContain("1 of 2");
});

test("an EditorFindBar replaces every match, and its close button hides it", async () => {
  const app = await open("./editor.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.type("label:Find", "const");
  await app.wait(100);
  await app.type("label:Replace", "let");
  await app.press("label:Replace all matches");
  await app.wait(100);
  expect(find(app.texts(), "found=")).toContain("let a = 1;");
  expect(find(app.texts(), "found=")).toContain("let b = 2;");
  expect(app.texts()).toContain("Replaced 2");
  await app.press("label:Close the find bar");
  await app.wait(50);
  expect(find(app.texts(), "finding=")).toBe("no");
});
