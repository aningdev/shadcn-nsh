import { expect, open, test } from "nsh/test";

test("secondary click opens the menu and reports one change", async () => {
  const app = await open("./context-menu.fixture.tsx", { platform: "macos" });
  await app.rightClick("text:Area");
  await app.waitFor("text:Copy");
  expect(app.texts()).toContain("changes 1");
});

test("disabled follows a signal that changes after mount", async () => {
  const app = await open("./context-menu.fixture.tsx", { platform: "macos" });
  await app.press("text:Flip");
  await app.wait(100);
  await app.rightClick("text:Area").catch(() => {});
  await app.wait(200);
  expect(app.shows("Copy")).toBe(false);
});

test("an item that becomes checkable while the menu is open says so in its role", async () => {
  const app = await open("./context-menu.fixture.tsx", { platform: "macos" });
  await app.rightClick("text:Area");
  await app.waitFor("text:Pin");
  expect(app.shows("role:menuitemcheckbox[Pin]")).toBe(false);
  // `closeOnSelect={false}`: the menu stays open, and the next item can still change.
  await app.press("text:Arm");
  await app.wait(100);
  expect(app.shows("role:menuitemcheckbox[Pin]")).toBe(true);
  await app.press("text:Pin");
  await app.wait(100);
  expect(app.shows("role:menuitemcheckbox[Pin]")).toBe(true);
  expect(app.shows("text:Copy")).toBe(true);
});

test("a long press opens the menu on a phone, and the release leaves it open", async () => {
  const app = await open("./context-menu.fixture.tsx", { platform: "ios" });
  await app.longPress("text:Area");
  await app.wait(300);
  expect(app.shows("text:Copy")).toBe(true);
});
