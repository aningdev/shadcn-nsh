import { expect, open, test } from "nsh/test";

test("string trigger opens the menu and reports one change", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Open M");
  await app.waitFor("text:Item A");
  expect(app.texts()).toContain("changes 1");
});

test("selecting an item runs onSelect", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Open M");
  await app.press("text:Item A");
  await app.wait(100);
  expect(app.texts()).toContain("selected 1");
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

test("disabled follows a signal on trigger and item", async () => {
  const app = await open("./menu.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open O")).toBe(false);
  await app.press("text:Open M");
  await app.waitFor("text:Item B");
  expect(app.enabled("text:Item B")).toBe(false);
});
