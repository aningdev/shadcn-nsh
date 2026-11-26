import { describe, expect, test } from "bun:test";

import { expandParadigm, type ThemeParadigm } from "../../packages/theme/paradigm";
import { defineTheme } from "../../packages/theme/schema";
import { baseSpec } from "../../packages/theme/themes/nsh-gallery";
import { validateThemeInvariants } from "./invariants";

const base = baseSpec;

const themed = (id: string, paradigm: ThemeParadigm) =>
  defineTheme({
    id,
    label: id,
    extends: base,
    paradigm,
  });

const DEPTHS = ["flat", "hairline", "soft-shadow", "glass", "acrylic"] as const;
const SHAPES = ["sharp", "rounded", "soft", "pill"] as const;
const STROKES = ["crisp", "hairline", "translucent"] as const;
const MOTIONS = ["snappy", "fluid", "springy", "instant"] as const;
const FEEDBACKS = ["tint", "underline", "lift", "ring"] as const;
const DENSITIES = ["compact", "balanced", "airy"] as const;

describe("expandParadigm", () => {
  test("every single axis value passes the theme invariants", () => {
    const cases: ThemeParadigm[] = [
      ...DEPTHS.map((depth) => ({ depth })),
      ...SHAPES.map((shape) => ({ shape })),
      ...STROKES.map((stroke) => ({ stroke })),
      ...MOTIONS.map((motion) => ({ motion })),
      ...FEEDBACKS.map((feedback) => ({ feedback })),
      ...DENSITIES.map((density) => ({ density })),
    ];
    for (const paradigm of cases) {
      const theme = themed(`axis-${Object.values(paradigm)[0]}`, paradigm);
      expect(validateThemeInvariants(theme), JSON.stringify(paradigm)).toEqual([]);
      expect("paradigm" in theme.spec).toBe(false);
    }
  });

  test("mixed axes pass the theme invariants", () => {
    const mixes: ThemeParadigm[] = [
      {
        depth: "glass",
        shape: "pill",
        stroke: "translucent",
        motion: "springy",
        feedback: "lift",
        density: "airy",
      },
      {
        depth: "flat",
        shape: "sharp",
        stroke: "crisp",
        motion: "instant",
        feedback: "underline",
        density: "compact",
      },
      {
        depth: "acrylic",
        shape: "rounded",
        stroke: "hairline",
        motion: "fluid",
        feedback: "ring",
        density: "balanced",
      },
    ];
    for (const paradigm of mixes) {
      const theme = themed(`mix-${paradigm.depth}`, paradigm);
      expect(validateThemeInvariants(theme), JSON.stringify(paradigm)).toEqual([]);
    }
  });

  test("maps glass and acrylic onto preset materials and built-in effects", () => {
    const glass = themed("depth-glass", { depth: "glass" });
    expect(glass.spec.surfaces.glass.material).toBe("glass");
    expect(glass.spec.surfaces.glass.effect).toEqual({ kind: "liquid-glass", intensity: 0.35 });
    expect(glass.spec.surfaces.overlay.effect).toEqual({ kind: "specular-rim", intensity: 0.4 });
    expect(glass.spec.surfaces.glass.light?.background).toEqual({ color: "popover", alpha: 0.78 });

    const acrylic = themed("depth-acrylic", { depth: "acrylic" });
    expect(acrylic.spec.surfaces.glass.material).toBe("acrylic");
    expect(acrylic.spec.surfaces.overlay.material).toBe("acrylic");
    expect(acrylic.spec.surfaces.glass.effect).toEqual({ kind: "acrylic-noise", intensity: 0.035 });
    expect(acrylic.spec.surfaces.glass.light?.background).toEqual({ color: "popover", alpha: 0.9 });
  });

  test("maps the other axes onto the L2 fields they own", () => {
    expect(themed("sharp", { shape: "sharp" }).spec.tokens.radius).toEqual({
      control: 4,
      container: 4,
      modal: 6,
      curve: "circular",
    });
    expect(themed("pill", { shape: "pill" }).spec.controls.button.corner.md).toBe("full");
    expect(themed("pill", { shape: "pill" }).spec.tokens.radius).toEqual(base.tokens.radius);

    const instant = themed("instant", { motion: "instant" });
    expect(instant.spec.motion.state.duration).toBe(40);
    expect(instant.spec.motion.presets.themeSwitch).toEqual({ kind: "none", duration: 0 });
    expect(themed("fluid", { motion: "fluid" }).spec.motion.presets.themeSwitch.kind).toBe(
      "dissolve",
    );
    expect(themed("springy", { motion: "springy" }).spec.motion.spring).toEqual({
      stiffness: 420,
      damping: 34,
      mass: 1,
    });

    expect(themed("underline", { feedback: "underline" }).spec.controls.field.focus.line).toBe(
      true,
    );
    expect(themed("airy", { density: "airy" }).spec.metrics.height.touch.md).toBe(52);
    expect(themed("compact", { density: "compact" }).spec.metrics.hit).toEqual({
      pointer: 0,
      touch: 44,
    });
  });

  test("explicit L2 fields win over the paradigm", () => {
    const theme = defineTheme({
      id: "override",
      label: "Override",
      extends: base,
      paradigm: { shape: "soft", motion: "springy" },
      tokens: { radius: { control: 4 } },
      motion: { fast: { duration: 99, easing: "out-cubic" } },
    });
    expect(theme.spec.tokens.radius.control).toBe(4);
    expect(theme.spec.tokens.radius.container).toBe(16);
    expect(theme.spec.motion.fast).toEqual({ duration: 99, easing: "out-cubic" });
    expect(theme.spec.motion.spring).toEqual({ stiffness: 420, damping: 34, mass: 1 });
    expect(validateThemeInvariants(theme)).toEqual([]);
    expect("paradigm" in theme.spec).toBe(false);
  });

  test("omitting paradigm keeps the previous merge", () => {
    const full = defineTheme(base);
    expect(full.spec).toBe(base);

    const copy = defineTheme({ id: "copy", label: "Copy", extends: base });
    expect(copy.spec.tokens).toBe(base.tokens);
    expect(copy.spec.metrics).toBe(base.metrics);
    expect(copy.spec.elevation).toBe(base.elevation);
    expect(copy.spec.surfaces).toBe(base.surfaces);
    expect(copy.spec.feedback).toBe(base.feedback);
    expect(copy.spec.motion).toBe(base.motion);
    expect(copy.spec.controls).toBe(base.controls);
    expect(copy.spec.meta).toBeUndefined();
    expect("paradigm" in copy.spec).toBe(false);

    const empty = defineTheme({ id: "empty", label: "Empty", extends: base, paradigm: {} });
    expect(empty.spec.tokens).toEqual(base.tokens);
    expect(empty.spec.metrics).toEqual(base.metrics);
    expect(empty.spec.surfaces).toEqual(base.surfaces);
    expect(empty.spec.motion).toEqual(base.motion);
    expect(expandParadigm({})).toEqual({});
  });

  test("Editorial Paper keeps paper grain on top of the hairline paradigm", () => {
    const editorial = defineTheme({
      id: "editorial-paper",
      label: "Editorial Paper",
      extends: base,
      paradigm: {
        depth: "hairline",
        shape: "sharp",
        stroke: "crisp",
        motion: "fluid",
        feedback: "underline",
        density: "airy",
      },
      surfaces: {
        card: { effect: { kind: "paper-grain" } },
        plate: { effect: { kind: "paper-grain" } },
      },
    });
    expect(validateThemeInvariants(editorial)).toEqual([]);
    expect(editorial.spec.surfaces.card.effect).toEqual({ kind: "paper-grain" });
    expect(editorial.spec.surfaces.plate.effect).toEqual({ kind: "paper-grain" });
    expect(editorial.spec.tokens.radius.control).toBe(4);
    expect(editorial.spec.motion.presets.themeSwitch).toEqual({ kind: "dissolve", duration: 280 });
    expect(editorial.spec.metrics.height.touch.md).toBe(52);
    expect(editorial.spec.controls.field.focus.line).toBe(true);
    expect("paradigm" in editorial.spec).toBe(false);
  });
});
