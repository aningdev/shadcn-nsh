// The appearance check: a page follows the system switching from light to dark while it runs.
// Each demo is opened in light, switched to dark, and compared with the same demo opened in
// dark. A color read once when a component or page is made, instead of where it is used, stays
// light and shows up here.
//
// It runs on the iOS simulator (`bun run port:render:touch`, after `render-touch.test.tsx`): in a
// browser the theme's colors are CSS variables that follow the scheme by themselves, so a
// stale read draws right there and only a native platform shows it.
//
// The screenshots stay in `shots/` as `<id>-switched.png` and `<id>-switched.ref.png`.
import { expect, open, test } from "nsh/test";

import { cases, same, settle } from "./render-cases";

const touch = { platform: "ios", reducedMotion: true, clock: {} } as const;

/** What the simulator needs to end one development host before the next one launches. */
const handOver = () => new Promise((resolve) => setTimeout(resolve, 300));

/** Leaves the simulator in `scheme` before a test's first page (see render-touch.test.tsx). */
async function startIn(scheme: "light" | "dark") {
  const app = await open("./App.tsx", { ...touch, colorScheme: scheme });
  app.dispose();
  await handOver();
}

for (const { id, steps } of cases) {
  test(`${id}: light, then dark at run time`, async () => {
    await startIn("light");
    const switched = await open(`./${id}.tsx`, { ...touch, colorScheme: "light" });
    await steps?.(switched);
    await settle(switched);
    await switched.setColorScheme("dark");
    await settle(switched);
    const a = await switched.screenshot(`shots/${id}-switched.png`);
    switched.dispose();
    await handOver();

    await startIn("dark");
    const fresh = await open(`./${id}.tsx`, { ...touch, colorScheme: "dark" });
    await steps?.(fresh);
    await settle(fresh);
    const b = await fresh.screenshot(`shots/${id}-switched.ref.png`);
    expect(same(a, b)).toBe(true);
  });
}
