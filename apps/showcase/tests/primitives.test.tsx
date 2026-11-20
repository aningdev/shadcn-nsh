// Every Primitives demo draws and answers: each is opened from the sidebar, a text only it draws
// is waited for, and its main interaction is exercised once — so a demo that throws or a control
// that stopped reporting fails here rather than in a screenshot. The
// last tests open demos as a phone does, and in the other appearance and palette.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", width: 390, height: 844 } as const;

type App = Awaited<ReturnType<typeof open>>;

/** Every demo of the group with a text only it draws: the sidebar name and the page's first mark. */
const TOURS: [name: string, marker: string][] = [
  ["Text", "Spans and links"],
  ["Image", "Resize modes"],
  ["Scroll", "Paging"],
  ["List", "Viewable items (at least half shown)"],
  ["WebView", "Web views"],
  ["Video", "AVPlayer / MediaPlayer"],
];

/** Opens a demo by its sidebar entry and waits for `marker`, a text only that demo draws. */
async function show(app: App, name: string, marker: string) {
  await app.press(`label:${name}`);
  await app.waitFor(`text:${marker}`);
}

test("Text: a link reports a press and the like pill counts", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Text", "Spans and links");
  await app.press("text:Terms of service");
  await app.waitFor("text:Pressed: Terms of service");
  await app.press("label:Like");
  await app.waitFor("text:♥ 4");
});

test("Image: Reload loads the scene again and Show toggles the image", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Image", "Resize modes");
  await app.press("text:Reload");
  await app.waitFor("text:Loads: 2");
  await app.press("text:Show");
  await app.waitFor("text:Hide");
  await app.press("text:Hide");
  await app.waitFor("text:Show");
});

test("Scroll: new posts arrive on top and the counter follows", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Scroll", "Paging");
  await app.press("text:Add 3 posts on top");
  await app.waitFor("text:33 posts");
});

test("List: the sections stick and the chat opens", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "List", "Viewable items (at least half shown)");
  await app.press("text:Sections");
  await app.waitFor("text:Smalltalk");
  await app.press("text:Chat");
  await app.waitFor("text:Release room");
});

test("List: the empty state fills and clears in More", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "List", "Viewable items (at least half shown)");
  await app.press("text:More");
  await app.waitFor("text:Nothing here yet: click Add");
  await app.press("text:Add");
  await app.waitFor("text:Item 1");
  await app.press("text:Clear");
  await app.waitFor("text:Nothing here yet: click Add");
});

test("WebView: the page is posted to and the site tab opens", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "WebView", "Web views");
  await app.press("text:Post to the page");
  await app.wait(300);
  expect(app.texts().some((text) => text.startsWith("To the page: hi #"))).toBe(true);
  await app.press("role:tab[Web site]");
  await app.waitFor("text:Reload");
  await app.press("text:Reload");
});

test("Video: play, restart and the system controls", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Video", "AVPlayer / MediaPlayer");
  await app.press("label:Play");
  await app.waitFor("label:Pause");
  await app.press("text:Restart");
  await app.press("role:tab[System controls]");
  expect(app.texts()).not.toContain("Restart");
});

test("a phone pushes the Primitives demos onto its stack", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  for (const [name, marker] of [TOURS[0], TOURS[3]] as [string, string][]) {
    await show(app, name, marker);
    await app.back();
    await app.waitFor("text:PRIMITIVES");
  }
});

test("every Primitives demo draws in the dark and the shadcn palette", async () => {
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
