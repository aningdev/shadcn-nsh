// The Platform group's Windows and Keyboard demos and the Apps group's Block editor draw and answer:
// each is opened from the sidebar, a text only it draws is waited for, and its main interaction is
// exercised once. The last tests open them as a phone does, and in the dark and the shadcn palette.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", width: 390, height: 844 } as const;

type App = Awaited<ReturnType<typeof open>>;

/** Opens a demo by its sidebar entry and waits for `marker`, a text only that demo draws. */
async function show(app: App, name: string, marker: string) {
  await app.press(`label:${name}`);
  await app.waitFor(`text:${marker}`);
}

test("Windows: the draft opens its document in a window of its own", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Windows", "Written in a window of its own");
  expect(app.texts()).toContain("Release notes 2.4");
  await app.press("text:Open document");
  await app.waitUntil(() => app.window("document").state() !== null);
  expect(app.window("document").state()?.focused).not.toBe(false);
  // Nothing is left open: the driver plays the platform, so the window closes as its button does.
  await app.window("document").pressClose();
  await app.waitUntil(() => app.window("document").state() === null);
});

test("Keyboard: a chord is captured and its transition read", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Keyboard", "Held arrows");
  await app.press("label:Key inspector");
  await app.waitFor("text:listening");
  expect(app.texts()).toContain("0 captured");
  // The playfield takes the focus, so the arrows are its own.
  await app.press("text:Start");
  await app.waitFor("text:focused");
  expect(app.texts()).toContain("Held");
});

test("Block editor: the document is there and its handle layer answers the pointer", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Block editor", "Q4 launch plan");
  await app.waitFor("id:block-document");
  await app.hover("text:Q4 launch plan");
  await app.waitFor("id:block-handle", { timeout: 2000 });
  await app.press("label:Drag to move, press for the menu");
  await app.waitFor("id:block-menu");
  expect(app.texts()).toContain("TURN INTO");
});

test("a phone pushes the demos onto its stack, where Windows has no windows", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  await show(app, "Block editor", "Q4 launch plan");
  await app.waitFor("id:block-bar");
  await app.back();
  await app.waitFor("text:APPS");
  await show(app, "Keyboard", "Held arrows");
  await app.back();
  await app.waitFor("text:PLATFORM");
  await show(app, "Windows", "Desktop windows");
  await app.back();
});

test("the three demos draw in the dark and the shadcn palette", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  for (const [name, marker] of [
    ["Windows", "Written in a window of its own"],
    ["Keyboard", "Held arrows"],
    ["Block editor", "Q4 launch plan"],
  ] as const) {
    await app.press(`label:${name}`);
    await app.waitFor(`text:${marker}`);
    expect(app.texts()).not.toContain("Not built yet");
  }
});
