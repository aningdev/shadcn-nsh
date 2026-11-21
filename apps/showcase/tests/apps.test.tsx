// The Apps group: the two scenes that are whole apps, opened from the sidebar, a text only they draw
// waited for, and each one's main interaction exercised — a market that ticks and a scripted chat
// that streams. The last tests open them as a phone does, and in the other appearance and palette,
// so a scene that only works on a desktop or only in the light is caught here.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", width: 390, height: 844 } as const;

type App = Awaited<ReturnType<typeof open>>;

/** Every demo of the group with a text only it draws: the sidebar name and its first mark. */
const TOURS: [name: string, marker: string][] = [
  ["Stocks", "Composite"],
  ["AI Chat", "How can I help?"],
];

/** Opens a demo by its sidebar entry and waits for `marker`, a text only that demo draws. */
async function show(app: App, name: string, marker: string) {
  await app.press(`label:${name}`);
  await app.waitFor(`text:${marker}`);
}

test("Stocks: the market ticks, filters, opens breadth and pauses", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Stocks", "Composite");
  // A tick every 50 ms: half a second later the same screen says something else.
  const before = app.texts().join("|");
  await app.wait(600);
  expect(app.texts().join("|")).not.toBe(before);
  // Breadth opens under the strip, with the sectors the issues are in, and closes again.
  await app.press("label:Show breadth");
  await app.waitFor("label:Hide breadth");
  await app.wait(300);
  expect(app.texts()).toContain("Technology");
  expect(app.texts()).toContain("Industrials");
  await app.press("label:Hide breadth");
  // The filters re-sort the list: a gainer and a loser are counted, and the active ones are ten.
  await app.press("text:Gainers");
  await app.wait(400);
  expect(app.texts()).toContain("Active");
  // Pausing stops the market, and both of its round buttons then offer to resume it (the strip's
  // and the stock's).
  await app.press("label:Pause the market >> nth=0");
  await app.waitFor("label:Resume the market");
});

test("Stocks: a stock opens, and its ticket places an order", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Stocks", "Composite");
  // The active row wears the neutral accent fill; inactive rows are transparent.
  const activeFill = app.viewStyle("label:Orbex Freight")?.backgroundColor;
  expect(activeFill).toBeTruthy();
  expect(app.viewStyle("label:Halo Robotics")?.backgroundColor).toBeUndefined();
  // Pressing a watchlist row shows that stock beside the list: its code heads the page now.
  await app.press("label:Halo Robotics");
  await app.waitUntil(() => app.texts().filter((text) => text === "HLRB").length >= 2);
  await app.waitFor("text:Order book");
  expect(app.viewStyle("label:Halo Robotics")?.backgroundColor).toBe(activeFill);
  expect(app.viewStyle("label:Orbex Freight")?.backgroundColor).toBeUndefined();
  // The trade bar opens the ticket; a limit order is placed, and the banner says so.
  await app.press("text:Buy");
  await app.waitFor("text:Limit price");
  await app.press("text:Review buy");
  await app.waitFor("text:Place buy order");
  await app.press("text:Place buy order");
  await app.waitFor("text:Buy order placed", { timeout: 8000 });
});

test("AI Chat: a scripted scene streams a tool card and its sources", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "AI Chat", "How can I help?");
  // A desktop conversation row uses the neutral accent fill and normal foreground ink when chosen.
  const unselectedInk = app.spanStyle("label:Open Think it through >> text:Think it through").color;
  await app.press("label:Open Search the web");
  await app.waitFor("text:What changed in the latest release of the Harbor runtime?", {
    timeout: 8000,
  });
  expect(app.viewStyle("label:Open Search the web")?.backgroundColor).toBeTruthy();
  expect(app.spanStyle("label:Open Search the web >> text:Search the web").color).toBe(
    unselectedInk,
  );
  await app.waitFor("text:Web search", { timeout: 12000 });
  // Its sources come with it, and the reply is written under them.
  await app.waitFor("text:Harbor 4.2 release notes", { timeout: 20000 });
  await app.waitFor("text:harbor.dev", { timeout: 20000 });
});

test("AI Chat: typing in the composer sends a message", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "AI Chat", "How can I help?");
  await app.type("text:Message Swift", "Hello from composer");
  await app.press("label:Send");
  await app.waitFor("text:Hello from composer", { timeout: 8000 });
});

test("AI Chat: a reasoning line counts, then reads what it took and opens onto its text", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "AI Chat", "How can I help?");
  await app.press("label:Think it through");
  // The line counts while the model thinks.
  await app.waitFor("text:Thinking… 0 s", { timeout: 12000 });
  const reads = () => app.texts().some((text) => text.includes("Call the ball"));
  // Once the reply is done the line reads what it took, closed; a press opens it and a press closes it.
  await app.waitFor("label:Regenerate", { timeout: 40000 });
  expect(app.texts().some((text) => text.startsWith("Thought for"))).toBe(true);
  const wasOpen = reads();
  await app.press("label:Reasoning");
  await app.wait(400);
  expect(reads()).toBe(!wasOpen);
  await app.press("label:Reasoning");
  await app.wait(400);
  expect(reads()).toBe(wasOpen);
});

test("AI Chat: a code tool shows its code and, once done, the output in a footer", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "AI Chat", "How can I help?");
  await app.press("text:Run some code >> nth=1");
  await app.waitFor("text:Run code", { timeout: 12000 });
  await app.waitFor("text:Output", { timeout: 20000 });
  await app.waitFor("text:1229", { timeout: 20000 });
});

test("AI Chat: going offline says so, and a long conversation loads at once", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "AI Chat", "How can I help?");
  // The connection drops: the banner holds the message until it returns.
  await app.press("label:Suggest Go offline");
  await app.waitFor("text:You're offline", { timeout: 8000 });
  await app.waitFor("text:Back online", { timeout: 12000 });
  // Weeks of messages arrive in one go, each day under its own date, and the view keeps its place
  // at the newest one — the list serves the turns in view, which is far more than the two above.
  await app.press("label:Open Load a long conversation");
  await app.waitUntil(() => app.texts().length > 100, { timeout: 12000 });
});

test("a phone pushes both apps onto its stack", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  await show(app, "Stocks", "Composite");
  // A stock opens over the watchlist, and its first row leads back to it.
  await app.press("label:Halo Robotics");
  await app.waitFor("label:Back to the watchlist");
  await app.waitFor("text:Watchlist");
  await app.press("label:Back to the watchlist");
  await app.waitFor("text:Composite");
  await app.back();
  await app.waitFor("text:APPS");
  // The chat pushes too, and its composer sends.
  await show(app, "AI Chat", "How can I help?");
  await app.press("label:Search the web");
  await app.waitFor("text:Web search", { timeout: 12000 });
});

test("every App draws in the dark and the shadcn palette", async () => {
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
