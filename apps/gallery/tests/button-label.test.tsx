import { open, test } from "nsh/test";

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
