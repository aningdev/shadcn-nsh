/**
 * Structural invariants across all Theme v5 themes (`docs/theme.md`).
 */
import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

import type { SurfaceRole, TypeRole } from "../../packages/theme/schema";
import { ALL_THEMES, BUILD_ROOT_THEME, nshGallery } from "../../packages/theme/themes";

const root = path.join(import.meta.dir, "../..");
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const SURFACE_ROLES: readonly SurfaceRole[] = [
  "card",
  "raised",
  "inset",
  "channel",
  "plate",
  "overlay",
  "modal",
  "inverse",
  "glass",
  "accent",
  "fill",
];

const TYPE_ROLES: readonly TypeRole[] = [
  "caption",
  "detail",
  "body",
  "label",
  "title",
  "headline",
  "display",
];

const REMOVED_COLOR_PREFIXES = [
  "sidebar-",
  "card-foreground",
  "popover-foreground",
  "secondary-foreground",
  "accent-foreground",
];

describe("Theme v5 theme definitions & exported theme.json", () => {
  test("ships 6 themes with nsh-gallery as build root", () => {
    expect(ALL_THEMES.map((t) => t.id)).toEqual([
      "nsh-gallery",
      "shadcn",
      "solid-glass",
      "apple",
      "material",
      "winui",
    ]);
    expect(BUILD_ROOT_THEME).toBe("nsh-gallery");
    expect(readJson("packages/theme/theme.json")).toEqual(nshGallery.theme);
  });

  const expectedLightKeys = Object.keys(nshGallery.theme.cssVars.light).sort();
  const expectedDarkKeys = Object.keys(nshGallery.theme.cssVars.dark).sort();

  for (const entry of ALL_THEMES) {
    test(`${entry.id}: has identical 21 light/dark keys, no removed keys, and all 11 surfaces`, () => {
      const lightKeys = Object.keys(entry.theme.cssVars.light).sort();
      const darkKeys = Object.keys(entry.theme.cssVars.dark).sort();
      expect(lightKeys).toEqual(expectedLightKeys);
      expect(darkKeys).toEqual(expectedDarkKeys);
      expect(lightKeys).toHaveLength(21);

      for (const k of [...lightKeys, ...Object.keys(entry.theme.cssVars.theme)]) {
        for (const banned of REMOVED_COLOR_PREFIXES) {
          expect(k.startsWith(banned)).toBe(false);
        }
        expect(k.endsWith("-tint")).toBe(false);
        expect(k === "up" || k === "warn").toBe(false);
      }

      for (const role of SURFACE_ROLES) {
        expect(entry.spec.surfaces[role]).toBeDefined();
      }
      for (const typeRole of TYPE_ROLES) {
        expect(entry.spec.metrics.typography[typeRole]).toBeDefined();
      }

      expect(entry.spec.metrics.stroke.hairline).toBeGreaterThan(0);
      expect(entry.spec.feedback.press.scale).toBeGreaterThan(0);
      expect(entry.spec.motion.state.duration).toBeGreaterThanOrEqual(0);
    });
  }

  test("preserves documented sparse overrides across platform themes", () => {
    const byId = Object.fromEntries(ALL_THEMES.map((t) => [t.id, t]));
    // Material grows switch knob on checked; others degenerate to "same"
    expect(byId.material!.spec.controls.switch.knob.on).not.toBe("same");
    expect(byId.shadcn!.spec.controls.switch.knob.on).toBe("same");
    // WinUI slider carries tiered inner center dot diameter; others degenerate to 0
    expect(byId.winui!.spec.controls.slider.mark).toEqual({ pointer: 12, touch: 16 });
    expect(byId.shadcn!.spec.controls.slider.mark).toBe(0);
    // Double focus style uses innerColor only on WinUI
    expect(byId.winui!.spec.feedback.focus.style).toBe("double");
  });
});
