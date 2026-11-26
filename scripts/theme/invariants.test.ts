import { describe, expect, test } from "bun:test";

import { defineTheme, type ThemePatch } from "../../packages/theme/schema";
import { ALL_THEMES } from "../../packages/theme/themes";
import { base } from "../../packages/theme/themes/nsh-gallery";
import { validateThemeInvariants } from "./invariants";

const patch = (override: Omit<ThemePatch, "id" | "label" | "extends">) =>
  defineTheme({ id: "test-invalid", label: "Test Invalid", extends: base, ...override });

describe("validateThemeInvariants", () => {
  test("all 6 built-in themes pass every pointer/touch, geometry, and motion invariant", () => {
    for (const entry of ALL_THEMES) {
      expect(validateThemeInvariants(entry), entry.id).toEqual([]);
    }
  });

  test("rejects undersized touch hit targets or pointer hit slop", () => {
    expect(validateThemeInvariants(patch({ metrics: { hit: { touch: 36 } } }))).toContainEqual(
      expect.stringContaining("metrics.hit.touch=36 must be >= 44"),
    );
    expect(validateThemeInvariants(patch({ metrics: { hit: { pointer: 4 } } }))).toContainEqual(
      expect.stringContaining("metrics.hit.pointer=4 must be 0"),
    );
  });

  test("rejects inverted or out-of-range pointer/touch control heights and gaps", () => {
    const invertedHeight = patch({
      metrics: {
        height: { pointer: { sm: 24, md: 36, lg: 40 }, touch: { sm: 32, md: 32, lg: 48 } },
      },
    });
    const out = validateThemeInvariants(invertedHeight);
    expect(out.some((m) => m.includes("height.touch.md=32 outside [40, 52]"))).toBe(true);
    expect(out.some((m) => m.includes("height.touch.md=32 < height.pointer.md=36"))).toBe(true);

    const tightTouchGap = patch({ metrics: { control: { touch: { padding: 8, gap: 4 } } } });
    expect(validateThemeInvariants(tightTouchGap)).toContainEqual(
      expect.stringContaining("metrics.control.touch.gap=4 must be >= 8"),
    );

    const crampedFullBleed = patch({
      metrics: { item: { pointer: { inset: 4, pad: 8 }, touch: { inset: 0, pad: 8 } } },
    });
    expect(validateThemeInvariants(crampedFullBleed)).toContainEqual(
      expect.stringContaining("metrics.item.touch total reach"),
    );

    const validFullBleed = patch({
      metrics: { item: { pointer: { inset: 4, pad: 8 }, touch: { inset: 0, pad: 16 } } },
    });
    expect(validateThemeInvariants(validFullBleed)).toEqual([]);
  });

  test("rejects invalid switch knob overflow, slider touch band, and choice touch size", () => {
    const overflowingKnob = patch({
      controls: {
        switch: {
          track: { pointer: [36, 20], touch: [44, 24] },
          edge: { off: 2, on: 1, color: "border" },
          knob: { size: { pointer: 18, touch: 20 } },
        },
      },
    });
    expect(validateThemeInvariants(overflowingKnob)).toContainEqual(
      expect.stringContaining("overflows pointer track height"),
    );

    const tinyBand = patch({ controls: { slider: { band: { pointer: 20, touch: 24 } } } });
    expect(validateThemeInvariants(tinyBand)).toContainEqual(
      expect.stringContaining("controls.slider.band.touch=24 must be >= 32"),
    );

    const tinyChoice = patch({ controls: { choice: { size: { pointer: 16, touch: 16 } } } });
    expect(validateThemeInvariants(tinyChoice)).toContainEqual(
      expect.stringContaining("controls.choice.size.touch=16 must be >= 20"),
    );

    const flatChoice = patch({
      controls: {
        choice: {
          size: { pointer: 20, touch: 20 },
          box: { pointer: 20, touch: 20 },
          mark: { pointer: 10, touch: 10 },
        },
        switch: { track: { pointer: [40, 22], touch: [40, 22] } },
      },
    });
    const flatOut = validateThemeInvariants(flatChoice);
    expect(
      flatOut.some((m) => m.includes("controls.choice.size.touch (20) must be > pointer")),
    ).toBe(true);
    expect(
      flatOut.some((m) => m.includes("controls.choice.box.touch (20) must be > pointer")),
    ).toBe(true);
    expect(
      flatOut.some((m) => m.includes("controls.choice.mark.touch (10) must be > pointer")),
    ).toBe(true);
    expect(
      flatOut.some((m) =>
        m.includes("controls.switch.track.touch must be strictly > pointer on both"),
      ),
    ).toBe(true);
  });

  test("rejects unstable physics springs, non-monotonic timings, and extreme press/fade feedback", () => {
    const wildSpring = patch({ motion: { spring: { stiffness: 600, damping: 10, mass: 1 } } });
    expect(validateThemeInvariants(wildSpring)).toContainEqual(
      expect.stringContaining("damping ratio zeta="),
    );

    const sluggishSpring = patch({ motion: { spring: { stiffness: 100, damping: 80, mass: 1 } } });
    expect(validateThemeInvariants(sluggishSpring)).toContainEqual(
      expect.stringContaining("damping ratio zeta="),
    );

    const invertedDurations = patch({
      motion: {
        fast: { duration: 250, easing: "out-cubic" },
        default: { duration: 150, easing: "out-cubic" },
      },
    });
    expect(validateThemeInvariants(invertedDurations)).toContainEqual(
      expect.stringContaining("motion durations must satisfy"),
    );

    const extremeFeedback = patch({
      feedback: {
        press: { scale: 0.7 },
        disabled: { contentOpacity: 0.1 },
      },
    });
    const fbOut = validateThemeInvariants(extremeFeedback);
    expect(fbOut.some((m) => m.includes("feedback.press.scale=0.7"))).toBe(true);
    expect(fbOut.some((m) => m.includes("feedback.disabled.contentOpacity=0.1"))).toBe(true);
  });

  test("rejects material blur, minOpacity and effect intensity outside their bounds", () => {
    const wideBlur = patch({
      surfaces: {
        glass: { material: { kind: "blur", blur: 80, minOpacity: 0.7 } },
      },
    });
    expect(validateThemeInvariants(wideBlur)).toContainEqual(
      expect.stringContaining("blur=80 outside [4, 60]"),
    );

    const thin = patch({
      surfaces: {
        glass: { material: { kind: "blur", minOpacity: 0.4 } },
      },
    });
    expect(validateThemeInvariants(thin)).toContainEqual(
      expect.stringContaining("minOpacity=0.4 outside [0.55, 1]"),
    );

    const hot = patch({
      surfaces: {
        glass: { effect: { kind: "paper-grain", intensity: 1.5 } },
      },
    });
    expect(validateThemeInvariants(hot)).toContainEqual(
      expect.stringContaining("effect paper-grain intensity=1.5 outside (0, 1]"),
    );
  });
});
