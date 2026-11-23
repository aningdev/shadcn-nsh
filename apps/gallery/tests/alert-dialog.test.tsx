import { expect, open, test } from "nsh/test";

test("AlertDialog shows its parts as the system's alert: title, message, buttons in order", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  // The cancel button is `AlertDialogCancel`: pressing it reports its `id`, `"cancel"`.
  app.onDialog((dialog) => (dialog.buttons.includes("Keep") ? "Keep" : null));
  await app.press("text:Open A");
  await app.waitFor("text:action cancel");
  expect(app.dialogs().length).toBe(1);
  expect(app.dialogs()[0]).toMatchObject({
    title: "Delete the photo?",
    message: "This cannot be undone.",
    buttons: ["Keep", "Delete"],
    sheet: false,
  });
});

test("the chosen button's id reaches onAction", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  app.onDialog((dialog) => (dialog.buttons.includes("Delete") ? "Delete" : null));
  await app.press("text:Open A");
  await app.waitFor("text:action delete");
});

test("closing without a button reports null and closes a controlled alert", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  app.onDialog(() => null);
  await app.press("text:Show B");
  await app.waitFor("text:action null");
  expect(app.texts()).toContain("open false");
});

test("a disabled AlertDialog trigger shows no alert", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  app.onDialog(() => null);
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Open C")).toBe(false);
  await app.press("text:Open C").catch(() => {});
  await app.wait(100);
  expect(app.dialogs().length).toBe(0);
});

test("a trigger hands its view props to the button it draws", async () => {
  const app = await open("./alert-dialog.fixture.tsx");
  app.onDialog((dialog) => (dialog.buttons.includes("Keep") ? "Keep" : null));
  await app.press("id:open-a");
  await app.waitFor("text:action cancel");
});
