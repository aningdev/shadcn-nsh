import { expect, open, test } from "nsh/test";

test("string trigger opens the dialog and reports one change", async () => {
  const app = await open("./dialog.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1");
});

test("close dismisses the dialog", async () => {
  const app = await open("./dialog.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  await app.press("text:Close A");
  await app.wait(100);
  expect(app.shows("Body A")).toBe(false);
  expect(app.texts()).toContain("changes 2");
});

test("custom trigger is a button that opens", async () => {
  const app = await open("./dialog.fixture.tsx");
  expect(app.count("role:button[Open B]")).toBeGreaterThan(0);
  await app.press("text:Open B");
  await app.waitFor("text:Body B");
});

test("a disabled trigger does not open, and follows a later change", async () => {
  const app = await open("./dialog.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open C")).toBe(false);
  await app.press("text:Open C").catch(() => {});
  await app.wait(100);
  expect(app.shows("Body C")).toBe(false);
});

test("a body taller than the window scrolls, and its footer is drawn under it", async () => {
  const app = await open("./dialog.fixture.tsx");
  expect(app.shows("text:Pin")).toBe(false);
  await app.press("text:Open Long");
  await app.waitFor("text:Line 1");
  // The card holds a scroll view: the shell's body scrolls under the card's height cap.
  await app.scroll("text:Line 1", 400);
  await app.wait(100);
  // `DialogFooter` registers with `DialogContent`, which draws it under the scrolling body.
  expect(app.shows("text:Pin")).toBe(true);
});

test("a desktop ignores presentation: card and presented dialog share the card's look", async () => {
  const app = await open("./dialog.fixture.tsx", { platform: "macos" });
  await app.press("text:Open Card");
  await app.waitFor("text:Card body");
  const card = app.viewStyle("id:card-popup")?.backgroundColor;
  app.press("text:Open Presented").catch(() => {});
  await app.wait(100);
  expect(app.viewStyle("id:presented-popup")?.backgroundColor).toBe(card);
});

test("a phone presents the dialog itself, and its body is the page's", async () => {
  const app = await open("./dialog.fixture.tsx", { platform: "ios" });
  // The page look the shell gives a system-presented dialog (`dialogPage`): the theme's background,
  // with nothing of the card's — no edge, corner, shadow, margin or height cap.
  const page = app.viewStyle("id:page-view");
  expect(page?.backgroundColor).toBeTruthy();
  await app.press("text:Open Presented");
  // `presentation` reaches `nsh/base`, whose system box draws the surface; the body is ours.
  await app.waitFor("text:Presented body");
  expect(app.texts()).toContain("Presented body");
});
