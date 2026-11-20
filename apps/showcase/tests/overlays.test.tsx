// The Overlays, Avatar and Progress demos: each opens from the sidebar, its main scene works, and
// its colors follow the scheme and the palette. The app is the fixture (`../App.tsx`).
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700, clock: {} } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", clock: {} } as const;

test("Popover: Share opens the document's people", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Popover");
  await app.waitFor("text:Share a document");
  await app.press("label:Share");
  await app.waitFor("text:Can edit");
  expect(app.texts()).toContain("Anyone with the link");
});

test("HoverCard: resting on a mention opens the person", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("label:HoverCard");
  await app.waitFor("text:Mentions in a thread");
  await app.hover("id:mention-mira");
  await app.wait(700);
  await app.waitFor("text:Design lead · Platform");
});

test("Menu: File then Save records the command", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Menu");
  await app.waitFor("text:Menu bar");
  await app.press("label:File");
  await app.waitFor("text:New document");
  await app.press("text:Save");
  await app.waitFor("text:Done: Save");
});

test("Tooltip: pinning shows the tip without a hover", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("label:Tooltip");
  await app.waitFor("text:On a toolbar");
  await app.press("text:Pin the tooltip");
  await app.waitFor("text:Shown while pinned or hovered");
  expect(app.texts()).toContain("Unpin the tooltip");
});

test("Sheet: a filter draft applies and shows on the page", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Sheet");
  await app.waitFor("text:Filter the results");
  await app.press("label:Filters");
  await app.waitFor("text:Under $50");
  await app.press("text:Under $50");
  await app.press("text:Show 45 results");
  await app.waitFor("text:Under $50");
  expect(app.texts()).toContain("applied Under $50");
});

test("Toast: saving shows a success note", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("label:Toast");
  await app.waitFor("text:Kinds");
  await app.press("text:Save changes");
  await app.waitFor("text:Changes saved");
  expect(app.texts()).toContain("Q3 roadmap.md · just now");
  await app.press("text:Send a message");
  await app.waitFor("text:Couldn't send the message");
  await app.press("text:Retry");
  await app.waitFor("text:Sending…");
  await app.waitFor("text:Message sent");
  await app.press("text:Upload 3 photos");
  await app.waitFor("text:Uploading 3 photos");
  await app.waitFor("text:3 photos uploaded");
});

test("Avatar: pressing a member changes their presence", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Avatar");
  await app.waitFor("text:Presence dots; press one to change theirs");
  await app.press("label:Jason Lee, online");
  await app.waitFor("text:Jason Lee: away");
});

test("Progress: Send starts the upload, and the next step advances", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Progress");
  await app.waitFor("text:24 photos to send");
  await app.press("text:Send");
  await app.waitFor("text:Last event: Upload: started");
  await app.wait(400);
  await app.waitFor("text:Pause");
  await app.press("text:Next step");
  await app.waitFor("text:Step 3 of 4");
  await app.waitFor("label:Profile, done");
  await app.waitFor("label:Team, current");
});

test("the shadcn palette redraws an overlay demo's themed color", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Popover");
  await app.waitFor("text:Share a document");
  const ink = app.spanStyle("text:Share a document").color;
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  expect(app.spanStyle("text:Share a document").color).not.toBe(ink);
  expect(app.storage()["palette"]).toBe("shadcn");
});

test("a phone pushes Sheet and Menu, and their sheets still work", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("dark");
  await app.press("label:Sheet");
  await app.waitFor("text:Filter the results");
  await app.press("label:Filters");
  await app.waitFor("text:Sort by");
  await app.press("text:Newest");
  await app.back();
  await app.waitFor("text:Filter the results");
  await app.back();
  await app.waitFor("text:OVERLAYS");
  await app.press("label:Menu");
  await app.waitFor("text:Menu bar");
  await app.press("label:File");
  await app.waitFor("text:New document");
  await app.press("text:Save");
  await app.waitFor("text:Done: Save");
});
