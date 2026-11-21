// The shell's behavior: the sidebar opens a demo, switching the
// palette redraws a themed color at once, and a phone shows the index and pushes a demo onto its
// nav stack. The app itself is the fixture (`../App.tsx`).
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios" } as const;

test("the sidebar opens a demo", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  // The first group's first demo is what the desktop layout shows at first.
  await app.waitFor(
    "text:A live watchlist and a stock: candles, depth, the tape, a tick every 50 ms",
  );
  await app.press("label:Button");
  await app.waitFor("text:Pressed 0×");
  expect(app.texts()).toContain("Kinds");
});

test("switching the palette redraws a themed color without a reload", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  const ink = app.spanStyle("text:Showcase").color;
  // The palette choices of `palettes.ts`, from the select in the sidebar's footer.
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  expect(app.spanStyle("text:Showcase").color).not.toBe(ink);
  // The choice is kept in the app's storage; the switcher came back to it.
  expect(app.storage()["palette"]).toBe("shadcn");
});

test("the folded sidebar's footer opens theme controls in a popover", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.waitFor("text:NSH Gallery");
  // Fold to the icon rail: the inline controls give way to one palette button inside the rail.
  await app.press("label:Toggle Sidebar");
  await app.waitFor("label:Theme settings");
  expect(app.texts()).not.toContain("System");
  // Pressing the button opens the popover with both controls, and switching applies immediately.
  await app.press("label:Theme settings");
  await app.waitFor("text:Theme");
  await app.press("text:Dark");
  await app.wait(100);
  expect(app.storage()["appearance"]).toBe("dark");
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  expect(app.storage()["palette"]).toBe("shadcn");
  // Unfolding restores the inline controls in the footer.
  await app.press("label:Toggle Sidebar");
  await app.waitFor("text:System");
});

test("a phone shows the index and pushes a demo onto the stack", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  expect(app.texts()).toContain("ACTIONS");
  await app.press("label:Button");
  await app.waitFor("text:Pressed 0×");
  await app.back();
  await app.waitFor("text:ACTIONS");
});
