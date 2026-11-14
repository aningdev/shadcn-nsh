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
import { open, test, type OpenOptions } from "nsh/test";

import { cases, clock, networkOf, schemes, settle, same, testName } from "./render-cases";

/** What the simulator needs to end the first host before the next one launches. */
const handOver = () => new Promise((resolve) => setTimeout(resolve, 300));

/**
 * Leaves the simulator in `options.colorScheme`, by launching a page and throwing it away.
 *
 * The appearance is the simulator's, not the app's: `open` switches it (`simctl ui appearance`)
 * while the app it launched is already drawing. A page that reads the appearance once, when it is
 * built (a look's `color` argument, a `const` in the demo), keeps the one it was built with, while
 * the reads in its JSX follow the switch. `nsh test` puts the appearance back when a test ends, so
 * the first launch of every test is the cold one: it used to be the demo, while the reference page
 * (the second launch) started in the wanted appearance, and `link`, `avatar`, `scrollbar`, `plot`
 * and `dock-area` — the pages that build a color once — drew the light look beside the dark one.
 * After this launch the simulator is in `options.colorScheme` for the rest of the test, so both
 * pages start in it and read the same appearance.
 */
async function settleAppearance(options: OpenOptions) {
  const warmUp = await open("./App.tsx", options);
  warmUp.dispose();
  await handOver();
}

for (const { id, steps, selfReference, photos, tolerance, extraSettle } of cases) {
  for (const colorScheme of schemes) {
    test(testName(id, "touch", colorScheme), async () => {
      const options = {
        platform: "ios",
        colorScheme,
        reducedMotion: true,
        clock,
        ...networkOf(photos),
      } as const;
      const name = `shots/${id}-touch-${colorScheme}`;
      await settleAppearance(options);
      const ours = await open(`./${id}.tsx`, options);
      await steps?.(ours);
      await settle(ours);
      if (extraSettle) await ours.wait(extraSettle);
      const a = await ours.screenshot(`${name}.png`);
      ours.dispose();
      // No shell: the reference page draws the same component, so there is nothing to compare.
      if (selfReference) {
        console.log(`${id}: self-reference — ${selfReference}`);
        return;
      }
      await handOver();
      const reference = await open(`./${id}.ref.tsx`, options);
      await steps?.(reference);
      await settle(reference);
      if (extraSettle) await reference.wait(extraSettle);
      const b = await reference.screenshot(`${name}.ref.png`);
      if (!same(a, b)) {
        console.log(
          `${name}: not byte for byte — the gate compares it${tolerance ? ` within ${tolerance.pixels} pixels, ${tolerance.delta}/255 (${tolerance.why})` : " within the antialiasing budget"}`,
        );
      }
    });
  }
}
