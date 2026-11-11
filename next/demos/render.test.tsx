// The render check: a component draws the same pixels as its look spread on the `nsh/base`
// control, which is how upstream writes it. Each demo has a reference page (`<id>.ref.tsx`); both are
// opened with a pointer and on a touch screen, light and dark, and their screenshots compared.
//
//   bun run port:render        (nsh test next/demos/render.test.tsx --target web)
//
// The screenshots stay in `shots/` (ignored by git) for a look by eye.
import { type App, expect, open, test } from "nsh/test";

type Case = {
  /** The demo's file name, without `.tsx`. */
  id: string;
  /** Steps taken in both pages before the screenshot (opening a dialog). */
  steps?: (app: App) => Promise<void>;
};

const cases: Case[] = [
  { id: "button" },
  { id: "switch" },
  { id: "dialog", steps: (app) => app.press("Delete item…") },
  { id: "toggle" },
];

// A desktop platform starts the page in the desktop idiom at any width; without one the page
// measures itself, and at the test's 390 points it is a phone.
const idioms = { pointer: { platform: "macos" }, touch: {} } as const;
const schemes = ["light", "dark"] as const;

const same = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

for (const { id, steps } of cases) {
  for (const [idiom, platform] of Object.entries(idioms)) {
    for (const colorScheme of schemes) {
      test(`${id}: ${idiom}, ${colorScheme}`, async () => {
        // A manual clock: animations land at once and a spinner stands still.
        const options = { ...platform, colorScheme, reducedMotion: true, clock: {} };
        const ours = await open(`./${id}.tsx`, options);
        const reference = await open(`./${id}.ref.tsx`, options);
        await steps?.(ours);
        await steps?.(reference);
        const name = `shots/${id}-${idiom}-${colorScheme}`;
        const a = await ours.screenshot(`${name}.png`);
        const b = await reference.screenshot(`${name}.ref.png`);
        expect(same(a, b)).toBe(true);
      });
    }
  }
}
