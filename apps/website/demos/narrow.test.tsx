// The narrow check: every demo opened on a 320-point phone (an iPhone SE's width), its first frame
// taken; `scripts/narrow-check.ts` then reads the page's right margin, which must be bare page.
//
//   bun run check:narrow [--only <id,...>]
//
// Only the page as it opens: a popup opened by a step may cover the margin by design.
import { open, test } from "nsh/test";

import { componentIds } from "./catalog.generated";

/** Demos that draw photographs and need a live network so the first frame can settle. */
const PHOTO_DEMOS = new Set(["avatar", "carousel", "image-viewer", "pressable", "text-view"]);

/**
 * Noon on 2026-11-12, local time: the calendar and the date picker mark "today" from the clock.
 * A local noon stays clear of a DST shift at midnight.
 */
const clock = { time: new Date(2026, 10, 12, 12, 0, 0) } as const;

/** Lets a 150–160 ms entrance finish on the manual clock before the screenshot. */
const settle = (app: { wait: (ms: number) => Promise<void> }) => app.wait(200);

/** What `open` takes for a page: a live network when it draws photographs. */
const networkOf = (photos: boolean) => (photos ? ({ network: "live" } as const) : {});

for (const id of componentIds) {
  test(`narrow id=${id}:`, async () => {
    const app = await open(`./${id}.tsx`, {
      platform: "macos",
      colorScheme: "light",
      reducedMotion: true,
      clock,
      ...networkOf(PHOTO_DEMOS.has(id)),
      width: 320,
      height: 2000,
    });
    await settle(app);
    await app.screenshot(`shots/narrow/${id}.png`);
  });
}
