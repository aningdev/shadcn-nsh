// The render check: a component draws the same pixels as its look spread on the `nsh/base`
// control, which is how upstream writes it. Each demo has a reference page (`<id>.ref.tsx`); both
// are opened with a pointer, light and dark, and their screenshots compared.
//
//   bun run port:render        (nsh test render.test.tsx --target web)
//
// A headless browser always measures a fine pointer, so this pass cannot render the touch idiom:
// that half runs on the iOS simulator, `bun run port:render:touch`.
//
// The screenshots stay in `shots/` (ignored by git) for a look by eye.
import { expect, open, test } from "nsh/test";

import { cases, schemes, settle, same } from "./render-cases";

// A desktop platform starts the page in the desktop idiom at any width; without one the page
// measures itself, and at the test's 390 points it is a phone.
const platform = { platform: "macos" } as const;

for (const { id, steps, selfReference } of cases) {
  for (const colorScheme of schemes) {
    test(`${id}: pointer, ${colorScheme}`, async () => {
      // A manual clock: animations land at once and a spinner stands still.
      const options = { ...platform, colorScheme, reducedMotion: true, clock: {} };
      const ours = await open(`./${id}.tsx`, options);
      // No shell: the reference page draws the same component, so there is nothing to compare.
      const reference = selfReference ? null : await open(`./${id}.ref.tsx`, options);
      await steps?.(ours);
      if (reference) await steps?.(reference);
      await settle(ours);
      if (reference) await settle(reference);
      const name = `shots/${id}-pointer-${colorScheme}`;
      const a = await ours.screenshot(`${name}.png`);
      if (!reference) {
        console.log(`${id}: self-reference — ${selfReference}`);
        return;
      }
      const b = await reference.screenshot(`${name}.ref.png`);
      expect(same(a, b)).toBe(true);
    });
  }
}
