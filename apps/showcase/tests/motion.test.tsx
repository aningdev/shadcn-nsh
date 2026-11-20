// The Motion demos' behavior, one test per demo: each opens from the sidebar (a phone pushes it
// onto its stack) and its scenes work as the official gallery's do, built with this library's
// parts. The app itself is the fixture (`../App.tsx`); the gallery's `animations` and `gestures`
// tests are the pattern these follow.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700, clock: {} } as const;
/** A phone: the index, demos pushed onto its stack. */
const phone = { platform: "ios", clock: {} } as const;

test("Animations: presets play, an exit returns, and the bounded drag stays in range", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Animations");
  await app.waitFor("text:Motion presets");
  expect(app.shows("text:shake")).toBe(true);
  await app.press("role:button[shake]");
  await app.press("text:Exit");
  await app.waitFor("text:fadeOut");
  expect(app.shows("text:shake")).toBe(false);
  // An exit comes back after it plays.
  await app.press("role:button[fadeOut]");
  await app.wait(1200);
  expect(app.shows("text:fadeOut")).toBe(true);
  await app.drag("id:bounded-knob", { x: 200, y: 0 });
  await app.press("role:tab[Narrow]");
  await app.drag("id:bounded-knob", { x: -40, y: 0 });
  expect(app.shows("text:drag.diffClamp(0, max)")).toBe(true);
  await app.setColorScheme("dark");
  await app.waitFor("text:Native motion");
});

test("Gestures: a drag moves the photo and the ball, and the hit slop counts a tap", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Gestures");
  await app.waitFor("id:photo");
  const drag = () => app.texts()[app.texts().indexOf("Drag") + 1];
  expect(drag()).toBe("0 pt");
  await app.drag("id:photo", { x: 60, y: 80 });
  await app.waitUntil(() => parseInt(drag()) >= 80);
  await app.drag("id:ball", { x: 50, y: 0 });
  await app.waitFor("text:50, 0");
  await app.press("label:Tiny dot");
  await app.waitFor("text:1 taps");
  await app.setColorScheme("dark");
  await app.waitFor("text:PanResponder");
});

test("Physics: snap and firm change the release, and a drag counts", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Physics");
  await app.waitFor("text:Drag and release");
  expect(app.shows("text:180 / 11")).toBe(true);
  await app.press("role:tab[Firm]");
  await app.waitFor("text:420 / 32");
  await app.press("role:tab[Snap]");
  await app.waitFor("text:Springs to the corner the fling points at");
  await app.drag("label:Draggable card", { x: 80, y: -40 });
  await app.waitUntil(() =>
    app.texts().some((t) => t.startsWith("top ") || t.startsWith("bottom ")),
  );
  await app.setColorScheme("dark");
  await app.waitFor("text:UI thread");
});

test("Collapsing header: the list scrolls to its footer under the shrinking header", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Collapsing header");
  await app.waitFor("text:Recent");
  await app.waitFor("text:Entry 1.1");
  await app.scroll("id:page", 8000);
  await app.waitFor("text:That's all 160 entries");
  await app.setColorScheme("dark");
  await app.waitFor("text:That's all 160 entries");
});

test("Animations and Collapsing header open on a phone too, in the dark", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("dark");
  await app.press("label:Animations");
  await app.waitFor("text:Native motion");
  await app.press("text:Exit");
  await app.waitFor("text:fadeOut");
  await app.back();
  await app.press("label:Collapsing header");
  await app.waitFor("text:160 entries, by week");
  await app.scroll("id:page", 4000);
  await app.waitFor("text:WEEK 8");
});

test("the shadcn palette redraws an Animations caption", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Animations");
  await app.waitFor("text:Orbits, one turn in 3.2 s");
  const ink = app.spanStyle("text:Orbits, one turn in 3.2 s").color;
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  expect(app.storage()["palette"]).toBe("shadcn");
  expect(app.shows("text:Native motion")).toBe(true);
  expect(app.spanStyle("text:Orbits, one turn in 3.2 s").color).not.toBe(ink);
});
