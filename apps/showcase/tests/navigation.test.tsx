// The Navigation demos' behavior, one test per demo: each opens from the sidebar (a phone pushes
// it onto its stack), its scenes work as the official gallery's do — built with this library's
// parts — and its themed colors answer the scheme and the palette. The app itself is the fixture
// (`../App.tsx`); the gallery's own tests (its `navigation`, `split-view`, `accordion`,
// `pagination`, `controls`, `carousel` and `tree` ones) are the pattern these follow.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700, clock: {} } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", clock: {} } as const;

test("NavStack: a pushed page shows its rows, and back returns to the demo", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:NavStack");
  await app.waitFor("text:Native stack");
  await app.press("label:Large title");
  await app.waitFor("text:Row 1");
  await app.press("label:Back");
  await app.waitFor("text:Native stack");
});

test("NavStack: unsaved changes ask before back pops", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:NavStack");
  await app.press("label:Unsaved changes");
  await app.waitFor("text:Nothing to lose: back pops");
  await app.type("label:A draft", "Notes");
  await app.waitFor("text:5 characters would be lost: back asks first");
  await app.press("label:Back");
  expect(app.dialogs()[0]!.title).toBe("Discard your changes?");
  app.onDialog(() => "Discard");
  await app.back();
  await app.waitFor("text:Native stack");
});

test("SplitView: a message shows in the detail, and the sidebar hides and shows", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("label:SplitView");
  // The window leaves no room for three columns, so the mail starts at two of
  // them: the messages beside the detail, the mailboxes one toggle away.
  await app.waitFor("text:Design review on Thursday");
  await app.press("label:Aiko Tanaka, Lunch next week?");
  await app.waitFor("text:To me · Yesterday");
  await app.press("label:Show the mailboxes");
  await app.waitFor("text:Archive");
  await app.press("label:Hide the mailboxes");
  await app.waitFor("text:Archive", { state: "gone" });
});

test("Tabs: a tab shows its rows, and a disabled one takes no press", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Tabs");
  await app.waitFor("text:Visitors");
  await app.press("role:tab[Activity]");
  await app.waitFor("text:Deployed to production");
  expect(app.texts()).not.toContain("Visitors");
  expect(app.enabled("role:tab[Billing]")).toBe(false);
});

test("Pagination: the results page, a chapter, and the archive's last page", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Pagination");
  await app.waitFor("text:Showing 1–10 of 238");
  expect(app.enabled("label:Previous")).toBe(false);
  await app.press("label:Next");
  await app.waitFor("text:Showing 11–20 of 238");
  // A tall window: every card, down to the archive, is in view.
  await app.setViewport(1024, 2400);
  await app.press("label:Next chapter");
  await app.waitFor("text:The Harbor");
  await app.press("text:Last page");
  await app.waitFor("text:Page 10,000 of 10,000");
  expect(app.enabled("label:Next archive page")).toBe(false);
  await app.press("label:Offline");
  await app.waitFor("text:Offline: no presses, no focus, dimmed for screen readers");
  expect(app.enabled("label:Previous archive page")).toBe(false);
});

test("Accordion: the FAQ opens one answer, and the settings open together", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Accordion");
  await app.waitFor("text:When will my order ship?");
  expect(app.texts()).toContain("1 open");
  await app.press("role:button[How do I return an item?]");
  await app.waitFor("text:Open the order, choose Return and print the label.");
  await app.waitFor("text:Reading: How do I return an item?");
  expect(app.enabled("role:button[Can I add gift wrapping?]")).toBe(false);
  // A tall window: the settings card below is in view.
  await app.setViewport(1024, 2400);
  await app.press("role:button[/^Privacy/]");
  await app.waitFor("text:Last event: Settings: notifications, privacy");
  await app.press("role:radio[/^Nobody/]");
  await app.waitFor("text:Profile visible to nobody");
});

test("Collapsible: the storage details show, and the switch inside works", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Collapsible");
  await app.waitFor("text:212 GB of 256 GB used");
  await app.press("label:Storage >> nth=1");
  await app.waitFor("text:120 GB");
  await app.press("label:Advanced");
  await app.waitFor("text:Keep originals");
  await app.press("role:switch[/^Keep originals/]");
  await app.waitFor("text:Last event: Keep originals: on");
});

test("Carousel: the onboarding steps, and the photos' arrows", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Carousel");
  await app.waitFor("text:Step 1 of 4");
  await app.press("label:Getting started >> role:button[Next]");
  await app.waitFor("text:Step 2 of 4");
  expect(app.shows("text:Import what you have")).toBe(true);
  await app.press("role:button[Next photo]");
  await app.waitFor("text:2 / 6");
  expect(app.enabled("role:button[Previous photo]")).toBe(true);
});

test("Tree: a press opens a folder, Reveal finds a file, and the outline unlocks", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Tree");
  await app.waitFor("text:Selected: app/src/router.rs");
  await app.press("role:treeitem[assets]");
  await app.waitFor("text:Last event: Expanded app/assets");
  expect(app.enabled("role:treeitem[target]")).toBe(false);
  await app.press("text:Reveal compose.rs");
  await app.waitFor("role:treeitem[compose.rs]");
  // A tall window: the read-only outline below is in view.
  await app.setViewport(1024, 2400);
  await app.press("label:Lock");
  await app.press("role:treeitem[Budget]");
  await app.waitFor("text:Last event: Outline q4/budget");
});

test("the shadcn palette redraws a Navigation demo's themed color", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Tabs");
  await app.waitFor("text:Visitors");
  const ink = app.spanStyle("text:Visitors").color;
  // The palette choices of `palettes.ts`, from the select in the sidebar's footer.
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  expect(app.spanStyle("text:Visitors").color).not.toBe(ink);
  expect(app.storage()["palette"]).toBe("shadcn");
});

test("a phone pushes the demos onto its stack, and back returns to the index", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  await app.press("label:Carousel");
  await app.waitFor("text:Step 1 of 4");
  await app.press("label:Getting started >> role:button[Next]");
  await app.waitFor("text:Step 2 of 4");
  await app.back();
  await app.waitFor("text:NAVIGATION");
  await app.press("label:Tree");
  await app.waitFor("text:Selected: app/src/router.rs");
  await app.press("role:treeitem[assets]");
  await app.waitFor("text:Last event: Expanded app/assets");
  await app.back();
  await app.waitFor("text:NAVIGATION");
});
