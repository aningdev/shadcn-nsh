import { expect, open, test } from "nsh/test";

test("string trigger opens the menu and reports one change", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Open M");
  await app.waitFor("text:Item A");
  expect(app.texts()).toContain("changes 1");
});

test("selecting an item runs onSelect and closes the menu", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Open M");
  await app.press("text:Item A");
  await app.wait(100);
  expect(app.texts()).toContain("selected 1");
  expect(app.shows("text:Item A")).toBe(false);
});

test("custom trigger is a button that opens", async () => {
  const app = await open("./menu.fixture.tsx");
  expect(app.count("role:button[Open N]")).toBeGreaterThan(0);
  await app.press("text:Open N");
  await app.waitFor("text:Item N");
});

test("submenu opens from its trigger", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Open M");
  await app.press("text:More");
  await app.waitFor("text:Sub item");
});

test("a disabled item is skipped and does not select", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Open K");
  await app.waitFor("text:Key B");
  expect(app.enabled("text:Key B")).toBe(false);
  await expect(app.press("text:Key B")).rejects.toMatchObject({ code: "ERR_NSH_TEST_DISABLED" });
  expect(app.texts()).toContain("picked none");
});

test("checkbox and radio items flip and stay open", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Open K");
  await app.press("text:Sidebar");
  await app.wait(50);
  expect(app.texts()).toContain("sidebar off");
  expect(app.shows("text:Sidebar")).toBe(true);
  await app.press("text:By date");
  await app.wait(50);
  expect(app.texts()).toContain("sort Date");
  expect(app.shows("text:By name")).toBe(true);
  await app.press("text:By name");
  await app.wait(50);
  expect(app.texts()).toContain("sort Name");
});

test("arrow keys move the highlight and skip a disabled item", async () => {
  const app = await open("./menu.fixture.tsx", { platform: "macos" });
  // Open K is the first tab stop. Space opens it; Up and Down then move the
  // highlight and must not choose the disabled row.
  await app.keyboard.press("tab");
  await app.keyboard.press("space");
  await app.waitFor("text:Key A");
  await app.keyboard.press("down");
  await app.keyboard.press("down");
  await app.keyboard.press("up");
  expect(app.shows("text:Key A")).toBe(true);
  expect(app.shows("text:Key C")).toBe(true);
  expect(app.enabled("text:Key B")).toBe(false);
  expect(app.texts()).toContain("picked none");
});

test("disabled follows a signal on trigger and item", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open O")).toBe(false);
  await app.press("text:Open M");
  await app.waitFor("text:Item B");
  expect(app.enabled("text:Item B")).toBe(false);
});
