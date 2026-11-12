// The touch half of the render check: the same demos and reference pages on the iOS simulator,
// where the page measures a finger's idiom (on `--target web` it always measures a fine pointer).
// Each demo's `<id>.ref.tsx` draws the same look on the `nsh/base` control; both screenshots are
// compared.
//
//   bun run port:render:touch        (nsh test render-touch.test.tsx --target ios)
//
// Needs Xcode's iPhone simulator. The screenshots stay in `shots/` as `<id>-touch-<scheme>.png`.
// The simulator runs one development host at a time (a launch ends the one before), so a test
// takes the first page's picture, lets its host go, and only then opens the reference page.
import { expect, open, test } from "nsh/test";

import { cases, schemes, settle, same } from "./render-cases";

/** What the simulator needs to end the first host before the second one launches. */
const handOver = () => new Promise((resolve) => setTimeout(resolve, 300));

for (const { id, steps } of cases) {
  for (const colorScheme of schemes) {
    test(`${id}: touch, ${colorScheme}`, async () => {
      const options = { platform: "ios", colorScheme, reducedMotion: true, clock: {} } as const;
      const name = `shots/${id}-touch-${colorScheme}`;
      const ours = await open(`./${id}.tsx`, options);
      await steps?.(ours);
      await settle(ours);
      const a = await ours.screenshot(`${name}.png`);
      ours.dispose();
      await handOver();
      const reference = await open(`./${id}.ref.tsx`, options);
      await steps?.(reference);
      await settle(reference);
      const b = await reference.screenshot(`${name}.ref.png`);
      expect(same(a, b)).toBe(true);
    });
  }
}
