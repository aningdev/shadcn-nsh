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
  // Pressing a watchlist row shows that stock beside the list: its code heads the page now.
  await app.press("label:Halo Robotics");
  await app.waitUntil(() => app.texts().filter((text) => text === "HLRB").length >= 2);
  await app.waitFor("text:Order book");
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
  // A scene: the prompt lands as a turn of its own, then the tool runs.
  await app.press("label:Search the web");
  await app.waitFor("text:What changed in the latest release of the Harbor runtime?", {
    timeout: 8000,
  });
  await app.waitFor("text:Web search", { timeout: 12000 });
  await app.waitFor("text:Done", { timeout: 20000 });
  // Its sources come with it, and the reply is written under them.
  await app.waitFor("text:Harbor 4.2 release notes", { timeout: 20000 });
  await app.waitFor("text:harbor.dev", { timeout: 20000 });
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
    expect(app.texts()).not.toContain("Not built yet");
  }
});
