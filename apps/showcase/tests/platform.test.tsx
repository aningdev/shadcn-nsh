// The Platform demos' behavior, one test per demo: each opens from the sidebar (a phone pushes it
// onto its stack), what only it draws is waited for, and each scene that works without a host
// capability is exercised once. Host-dependent scenes (the tray icon, a global shortcut, a
// notification, an update check) are only drawn: registering one would touch this machine.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700, clock: {} } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", clock: {} } as const;

type App = Awaited<ReturnType<typeof open>>;

/** Every demo of the group with a text only it draws: the sidebar name and the page's first mark. */
const TOURS: [name: string, marker: string][] = [
  ["System", "Environment"],
  ["Storage", "Stored keys"],
  ["Updater", "App update"],
  ["Notifications", "Allow notifications"],
  ["URL scheme", "Open a link"],
  ["Tray", "Tray icon"],
  ["Global shortcut", "Ctrl+Alt+K"],
  ["Standard APIs", "Utilities"],
];

/** Opens a demo by its sidebar entry and waits for `marker`, a text only that demo draws. */
async function show(app: App, name: string, marker: string) {
  await app.press(`label:${name}`);
  await app.waitFor(`text:${marker}`);
}

test("Platform: every demo draws its scenes", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  for (const [name, marker] of TOURS) {
    await show(app, name, marker);
  }
});

test("Platform: System's shortcuts count and reset", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "System", "Environment");
  // The environment reads the window it is in.
  expect(app.texts().some((text) => text.startsWith("1024 × 700"))).toBe(true);
  // The demo's own bindings: they fire while the page shows.
  await app.keyboard.press("mod+k");
  await app.waitFor("text:Counted 1");
  await app.keyboard.press("mod+k");
  await app.waitFor("text:Counted 2");
  await app.keyboard.press("mod+backspace");
  await app.waitFor("text:Counted 0");
});

test("Platform: Storage counts a launch and saves the note", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Storage", "Stored keys");
  // The demo has opened once, and wrote its count where the host keeps it.
  expect(app.texts()).toContain('setItem("launches", "1")');
  expect(app.texts()).toContain("launches");
  await app.type("label:Note", "Hello");
  await app.waitFor("text:Saved");
});

test("Platform: Standard APIs' utilities run", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Standard APIs", "Utilities");
  // This host gives the app no data directory, so Utilities says so; the
  // environment reads the host's os and process modules without one.
  await app.press("text:Run Utilities");
  await app.wait(500);
  expect(app.texts()).toContain("Error: The host has no data directory configured");
  await app.press("text:Run Environment");
  await app.wait(500);
  const result = app.texts().find((text) => text.includes("EOL:"));
  expect(result).toBeDefined();
  expect(result).toContain("Process: ");
  expect(result).toContain("Module: ");
});

test("Platform: a phone pushes the demos onto its stack", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  // The group's heading in the index, then the demo and back.
  for (const [name, marker] of TOURS.slice(0, 2)) {
    await show(app, name, marker);
    await app.back();
    await app.waitFor("text:PLATFORM");
  }
});

test("Platform: every demo draws in the dark and the shadcn palette", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  for (const [name, marker] of TOURS) {
    await app.press(`label:${name}`);
    await app.waitFor(`text:${marker}`);
  }
});
