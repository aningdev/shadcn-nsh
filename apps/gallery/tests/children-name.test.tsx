import { expect, open, test } from "nsh/test";

// A control with a string child and no `accessibilityLabel` is named by its texts: NSH reads the
// texts inside a view as its name, so `role:<role>[<text>]` finds it by what it draws. No control
// derives a label from its children.
test("a control with a string child is found and pressed by its role and text", async () => {
  const app = await open("./children-name.fixture.tsx");
  await app.press("role:button[Save]");
  await app.press("role:checkbox[Accept the terms]");
  await app.press("role:link[Follow the docs]");
  await app.press("role:button[Open the menu]");
  await app.press("role:menuitem[Archive it]");
  await app.press("role:tab[Profile]");
  await app.press("role:tab[Account]");
  await app.press("role:button[What it is called]");
  await app.wait(100);
  expect(app.shows("text:saved agreed followed archived account answered")).toBe(true);
});

test("a string child alone still names an accordion trigger", async () => {
  const app = await open("./children-name.fixture.tsx");
  expect(app.shows("text:The name screen readers say")).toBe(false);
  await app.press("role:button[What it is called]");
  await app.waitFor("text:The name screen readers say");
});
