// The pages of the theme render check, shared by the two runs: `render-theme.test.tsx` draws each
// page and its reference page and compares them; `render-theme-components.test.tsx` draws the page
// alone, for `--against`, where the earlier run's pictures are the reference.
//
// Each page opens with the palette in its storage, exactly as the site's switch leaves it, and
// reads it before it mounts (`apply-palette.ts`): the theme arrives the way an app gets it, not
// through a copy of the demo with a `selectTheme` added. `default` is the build-time theme, whose
// check is `render.test.tsx`.
import { open, test } from "nsh/test";

import { PALETTES, PALETTE_DRAWN_KEY, PALETTE_KEY } from "./palettes";
import { cases, clock, networkOf, same, schemes, settle } from "./render-cases";

// A desktop platform starts the page in the desktop idiom at any width; without one the page
// measures itself, and at the test's 390 points it is a phone.
const platform = { platform: "macos" } as const;

/** The themes to check: the build-time one is `render.test.tsx`'s. */
const palettes = PALETTES.filter((palette) => palette.id !== "default");

/**
 * Register the theme check's tests. `reference: false` draws each page alone and takes only its
 * picture, the shape `--against` compares with an earlier run; the default draws the reference
 * page beside it and takes both, for the script to compare pairwise.
 */
export function renderThemePages({ reference = true }: { reference?: boolean } = {}) {
  for (const { id, steps, pointerSteps, selfReference, photos, tolerance, extraSettle } of cases) {
    for (const palette of palettes) {
      for (const colorScheme of schemes) {
        test(`id=${id}: ${palette.id}, ${colorScheme}`, async () => {
          // The same page conditions as `render.test.tsx`: the manual clock, reduced motion, and a
          // live network where the page draws photographs. The palette is the app's storage, as the
          // site's switch writes it before the panel loads again.
          const options = {
            ...platform,
            colorScheme,
            reducedMotion: true,
            clock,
            storage: { [PALETTE_KEY]: palette.id },
            ...networkOf(photos),
          };
          const ours = await open(`./${id}.tsx`, options);
          const theirs =
            reference && !selfReference ? await open(`./${id}.ref.tsx`, options) : null;
          // The palette arrives after the app has mounted (`apply-palette.ts`: `Storage` answers a
          // promise, and the theme file is imported on demand), so both pages wait until it is drawn
          // before a step puts a field in a state: a fixed wait loses that race on a slow machine.
          for (const page of theirs ? [ours, theirs] : [ours]) {
            await page.waitUntil(() => page.storage()[PALETTE_DRAWN_KEY] === palette.id, {
              timeout: 15_000,
            });
          }
          await steps?.(ours);
          await pointerSteps?.(ours);
          if (theirs) {
            await steps?.(theirs);
            await pointerSteps?.(theirs);
          }
          await settle(ours);
          if (theirs) await settle(theirs);
          if (extraSettle) {
            await ours.wait(extraSettle);
            if (theirs) await theirs.wait(extraSettle);
          }
          const name = `shots-theme/${id}-${palette.id}-${colorScheme}`;
          const a = await ours.screenshot(`${name}.png`);
          if (!theirs) {
            if (selfReference) console.log(`${id}: self-reference — ${selfReference}`);
            return;
          }
          const b = await theirs.screenshot(`${name}.ref.png`);
          if (!same(a, b)) {
            console.log(
              `${name}: not byte for byte — the gate compares it${tolerance ? ` within ${tolerance.pixels} pixels, ${tolerance.delta}/255 (${tolerance.why})` : " within the antialiasing budget"}`,
            );
          }
        });
      }
    }
  }
}
