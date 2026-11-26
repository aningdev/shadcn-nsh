import { describe, expect, test } from "bun:test";

import { knobOffset, knobTravel, switchSlop, type SwitchGeometry } from "./switch-geometry";

interface GeometryCase {
  name: string;
  width: number;
  height: number;
  border: number;
  knob: number;
  knobHeight: number;
}

const cases: GeometryCase[] = [
  { name: "default pointer", width: 36, height: 20, border: 1, knob: 16, knobHeight: 16 },
  { name: "shadcn pointer", width: 32, height: 18, border: 0, knob: 16, knobHeight: 16 },
  { name: "material pointer", width: 40, height: 24, border: 1, knob: 16, knobHeight: 16 },
  { name: "material sm pointer", width: 32, height: 20, border: 1, knob: 12, knobHeight: 12 },
  { name: "material sm touch", width: 40, height: 24, border: 2, knob: 12, knobHeight: 12 },
  { name: "winui pointer", width: 40, height: 20, border: 1, knob: 12, knobHeight: 12 },
  { name: "winui touch", width: 44, height: 22, border: 1, knob: 14, knobHeight: 14 },
  { name: "winui sm pointer", width: 32, height: 16, border: 1, knob: 10, knobHeight: 10 },
  { name: "winui sm touch", width: 36, height: 18, border: 1, knob: 12, knobHeight: 12 },
  { name: "apple default pointer", width: 54, height: 24, border: 0, knob: 31, knobHeight: 20 },
  { name: "apple default touch", width: 63, height: 28, border: 0, knob: 37, knobHeight: 24 },
  { name: "apple sm pointer", width: 40, height: 18, border: 0, knob: 23, knobHeight: 14 },
];

describe("switch-geometry", () => {
  test("oval and circular knobs align symmetrically at both ends without overflowing", () => {
    for (const c of cases) {
      const inset = Math.max(0, (c.height - c.knobHeight) / 2 - c.border);
      const g: SwitchGeometry = {
        width: c.width,
        height: c.height,
        border: c.border,
        inset,
        knob: c.knob,
        knobHeight: c.knobHeight,
      };
      const pad = knobOffset(g);
      const travel = knobTravel(g);

      expect(pad).toBeGreaterThanOrEqual(0);
      expect(travel).toBeGreaterThan(0);
      // Off left edge matches on right edge inside the track border.
      expect(pad + travel + g.knob).toBe(g.width - 2 * g.border - pad);
    }
  });

  test("switchSlop expands standalone switches to the touch target", () => {
    const slop = switchSlop({ width: 36, height: 20, border: 1, inset: 1, knob: 16 }, 44);
    expect(slop).toEqual({ top: 12, bottom: 12, left: 4, right: 4 });
  });
});
