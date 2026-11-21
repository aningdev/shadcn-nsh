// The Actions and Styling demos' behavior, one test per demo: each opens from the sidebar (a phone
// pushes it onto its stack) and its scenes work as the official gallery's do, built with this
// library's parts. The app itself is the fixture (`../App.tsx`); the gallery's own tests are the
// pattern these follow.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700, clock: {} } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", clock: {} } as const;

test("Button: a press reports itself, the split button merges, and a disabled button shows its reason", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Button");
  await app.waitFor("text:One main action; the others quieter");
  await app.press("text:Duplicate");
  await app.waitFor("text:pressed Duplicate");
  // The menu picks the strategy; the main half merges with it and turns the pair done.
  await app.press("label:Merge options");
  await app.press("text:Rebase and merge");
  await app.waitFor("text:chose Rebase and merge");
  await app.press("label:Rebase and merge");
  await app.waitFor("text:Rebase and merge: started");
  await app.wait(1300);
  await app.waitFor("text:Rebase and merge: done");
  await app.waitFor("text:Reopen");
  await app.press("text:Reopen");
  await app.waitFor("text:reopened");
  // Publish stays off until both asks are answered, and says what is missing.
  expect(app.enabled("text:Publish")).toBe(false);
  await app.waitFor("text:Add a title first");
  await app.press("label:The post has a title");
  await app.waitFor("text:Accept the terms to publish");
  await app.press("label:I accept the terms");
  expect(app.enabled("text:Publish")).toBe(true);
  await app.press("label:Disable all");
  expect(app.enabled("text:Publish")).toBe(false);
  expect(app.enabled("text:Archive")).toBe(false);
});

test("Link: a paragraph's link reports what it opened; a nav link routes its page", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Link");
  await app.waitFor("text:In a paragraph");
  await app.press("id:release-notes");
  await app.waitFor("text:onOpen /docs/release-notes");
  await app.press("id:nav-pricing");
  await app.waitFor("text:Free while in preview; a seat a month after.");
  // The footer's Careers link is closed until the app opens it.
  expect(app.enabled("id:footer-careers")).toBe(false);
  await app.press("label:Hiring");
  expect(app.enabled("id:footer-careers")).toBe(true);
  await app.waitFor("text:Careers is open");
  // A link the app does not route goes to the system instead of the app's pages.
  await app.press("id:external");
  await app.waitFor("text:onOpen https://example.com/ → the system");
});

test("Toggle: a mark turns on and an alignment is one of its group", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Toggle");
  await app.waitFor("text:Text formatting");
  await app.press("label:Italic");
  await app.waitFor("text:Italic: on");
  await app.press("label:Align center");
  await app.waitFor("text:Align: center");
  // A star counts itself into the item and reports the change.
  await app.press("label:Star Q3 report");
  await app.waitFor("text:Q3 report: starred");
  // A locked group takes no presses; the app's switch is what unlocks it.
  await app.press("label:Lock toolbar");
  expect(app.enabled("label:Notify")).toBe(false);
  await app.press("label:Lock toolbar");
  expect(app.enabled("label:Notify")).toBe(true);
  await app.press("label:Notify");
  await app.waitFor("text:Notify: on");
});

test("Toolbar: a mark and an alignment edit the preview; the player plays and pauses", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Toolbar");
  await app.waitFor("text:Text formatting");
  await app.press("label:Italic");
  await app.waitFor("text:Italic: on");
  await app.press("label:Align center");
  await app.waitFor("text:Align: center");
  // History: undo takes the alignment back, and the bar reports it.
  await app.press("label:Undo");
  await app.waitFor("text:Undo");
  expect(app.texts()).toContain("2 marks, left aligned");
  await app.press("label:Play");
  await app.waitFor("text:Play: Night Drive");
  await app.press("label:Pause");
  await app.waitFor("text:Pause");
  expect(app.texts()).toContain("Pause");
  // The vertical palette moves its selection one tool at a time.
  await app.press("label:Hand");
  await app.waitFor("text:Tool: Hand");
});

test("Command: a shortcut opens the palette, and a command runs into Recent", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Command");
  await app.waitFor("text:Command palette");
  await app.keyboard.press("mod+k");
  await app.waitFor("text:Type a command or search…");
  await app.press("text:Go to Inbox >> nth=1");
  await app.waitFor("text:Ran Go to Inbox");
  // Recent comes first now: the run command is at the head of the list.
  await app.keyboard.press("mod+k");
  await app.waitFor("text:Recent: Go to Inbox, New Message");
  // The folders' menu checks the one in effect and disables the one the server holds.
  await app.press("text:Projects / NSH");
  await app.waitFor("text:Moved to Projects / NSH");
  expect(app.enabled("label:Spam")).toBe(false);
});

test("Command: 5 000 files filter as the test types, and the server's answer ranks people", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Command");
  await app.waitFor("text:5 000 files");
  await app.type("text:Search files by name or extension…", "42");
  await app.waitFor("text:297 of 5 000 files");
  // The server answers after its 450 ms, ranking the names that start with it first.
  await app.type("text:Search people…", "gra");
  await app.waitFor("text:Grace Hopper");
});

test("Styles: a card flips, the opacity row follows, and the clip tile shows its circle", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Styles");
  await app.waitFor("text:Corners");
  // The clipping and 3D cards are past a screen: the page comes to them first.
  await app.scroll("id:page", 1600);
  // A clipped tile at first, its circle cut by the box; the switch lets it out.
  expect(app.texts()).toContain("Clipped");
  expect(app.texts()).toContain("overflow: hidden");
  await app.press("label:Clip");
  expect(app.texts()).toContain("Visible");
  expect(app.texts()).toContain("overflow: visible");
  await app.press("label:Flip the card");
  await app.wait(400);
  expect(app.texts()).toContain("Click to flip");
});

test("Tailwind: a button built from classes counts presses, and `disabled:` takes the next", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Tailwind");
  await app.waitFor("text:Resolved natively");
  await app.press("text:Pressed 0×");
  await app.waitFor("text:Pressed 1×");
  await app.press("text:Disable me");
  await app.waitFor("text:Disabled");
  expect(app.enabled("text:Disabled")).toBe(false);
  await app.press("text:Enable again");
  await app.waitFor("text:Disable me");
});

test("Patterns: a pressed tile reports itself, a sheet opens, and the platform is read", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Patterns");
  await app.waitFor("text:Press feedback");
  await app.press("text:Fades while pressed");
  await app.waitFor("text:Fading tile");
  await app.press("label:Open a sheet");
  await app.waitFor("text:A sheet");
  await app.press("text:Close");
  await app.waitFor("text:A sheet", { state: "gone" });
  // The platform's own values, and the one-pixel line the app draws from them.
  await app.waitFor("text:macos");
  expect(app.texts()).toContain("platform.os");
  expect(app.texts()).toContain("1.000 pt");
});

test("Toggle and Patterns open on a phone too, in the other appearance", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("dark");
  await app.press("label:Toggle");
  await app.waitFor("text:Text formatting");
  await app.press("label:Bold");
  await app.waitFor("text:Bold: off");
  await app.back();
  await app.press("label:Patterns");
  await app.waitFor("text:Press feedback");
  await app.press("label:Open a sheet");
  await app.waitFor("text:A sheet");
});

test("a demo redraws in the shadcn palette, its colors from the theme's roles", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Styles");
  await app.waitFor("text:Corners");
  const ink = app.spanStyle("text:borderRadius · borderCurve · per corner").color;
  // The palette choices of `palettes.ts`, from the select in the sidebar's footer.
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  expect(app.storage()["palette"]).toBe("shadcn");
  expect(app.texts()).toContain("Corners");
  expect(app.spanStyle("text:borderRadius · borderCurve · per corner").color).not.toBe(ink);
});
