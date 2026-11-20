import { expect, open, test } from "nsh/test";

test("a string child names the button", async () => {
  const app = await open("./button-label.fixture.tsx");
  await app.press("role:button[Retry]");
  await app.waitFor("text:pressed 1");
});

test("a button drawn as given is named by the texts inside it", async () => {
  const app = await open("./button-label.fixture.tsx");
  await app.press("role:button[Drawn as given]");
  await app.waitFor("text:pressed 1");
});

test("a string beside an icon is drawn as the button's text", async () => {
  const app = await open("./button-label.fixture.tsx");
  expect(app.texts()).toContain("Upload 3 photos");
  await app.press("role:button[★ Upload 3 photos]");
  await app.waitFor("text:pressed 1");
});
