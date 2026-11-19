import { expect, open, test } from "nsh/test";

test("a button's text that reads a signal follows it", async () => {
  const app = await open("./reactive-children.fixture.tsx");
  expect(app.shows("text:Not pressed")).toBe(true);
  await app.press("text:Bump");
  await app.wait(100);
  expect(app.shows("text:Pressed once")).toBe(true);
});

test("a button's element child that switches on a signal follows it", async () => {
  const app = await open("./reactive-children.fixture.tsx");
  expect(app.shows("text:Off")).toBe(true);
  await app.press("text:Switch");
  await app.wait(100);
  expect(app.shows("text:On")).toBe(true);
});

test("a menu item and a popover trigger follow a signal too", async () => {
  const app = await open("./reactive-children.fixture.tsx");
  await app.press("text:Open");
  await app.waitFor("text:Item idle");
  await app.press("text:Item idle");
  await app.wait(100);
  expect(app.shows("text:Item pressed")).toBe(true);
  expect(app.shows("text:Tip pressed")).toBe(true);
});

test("a submenu's string label follows a signal too", async () => {
  const app = await open("./reactive-children.fixture.tsx");
  await app.waitFor("text:Sub idle");
  await app.press("text:Bump");
  await app.wait(100);
  expect(app.shows("text:Sub pressed")).toBe(true);
});
