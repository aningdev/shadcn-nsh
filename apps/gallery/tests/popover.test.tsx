import { expect, open, test } from "nsh/test";

test("string trigger opens the popover and reports one change", async () => {
  const app = await open("./popover.fixture.tsx");
  await app.press("text:Open A");
  await app.waitFor("text:Body A");
  expect(app.texts()).toContain("changes 1");
});

test("an element trigger is the button itself and keeps its own press", async () => {
  const app = await open("./popover.fixture.tsx");
  // No view in between: one button carries the label the element gave.
  expect(app.count("role:button[Open B]")).toBe(1);
  await app.press("text:Open B");
  await app.waitFor("text:Body B");
  await app.waitFor("text:custom pressed 1");
});

test("trigger follows a disabled that changes after mount", async () => {
  const app = await open("./popover.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open C")).toBe(false);
});

test("a disabled trigger does not open, string or custom", async () => {
  const app = await open("./popover.fixture.tsx");
  await app.press("text:Flip");
  await app.wait(100);
  await app.press("text:Open C").catch(() => {});
  await app.press("text:Open D").catch(() => {});
  await app.wait(100);
  expect(app.shows("Body C")).toBe(false);
  expect(app.shows("Body D")).toBe(false);
});
