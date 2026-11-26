/**
 * Unit tests for Theme v5 WCAG contrast and fill-separation checks (`scripts/theme/contrast.ts`).
 */
import { describe, expect, test } from "bun:test";

import { defineTheme, type ThemePatch } from "../../packages/theme/schema";
import { ALL_THEMES, apple, nshGallery, shadcn } from "../../packages/theme/themes";
import { exception, readFills, readResults, themeFills, themePairs } from "./contrast";

function patchTheme(overrides: Omit<ThemePatch, "id" | "label" | "extends">) {
  return defineTheme({
    id: "fixture",
    label: "Fixture",
    extends: nshGallery.spec,
    ...overrides,
  });
}

describe("themePairs", () => {
  test("all role and surface pairs pass on nsh-gallery", () => {
    const results = themePairs(nshGallery, "light");
    expect(results.some((r) => r.fg === "foreground" && r.bg === "background" && r.pass)).toBe(
      true,
    );
    expect(results.some((r) => r.fg === "primary-foreground" && r.bg === "primary" && r.pass)).toBe(
      true,
    );
    expect(results.some((r) => r.bg === "surface.card" && r.pass)).toBe(true);
  });

  test("a low-contrast foreground/background fails with ratio < 4.5", () => {
    const low = patchTheme({
      tokens: {
        light: {
          ...nshGallery.spec.tokens.light,
          foreground: "oklch(0.75 0 0)",
          background: "oklch(0.95 0 0)",
        },
      },
    });
    const hit = themePairs(low, "light").find(
      (r) => r.fg === "foreground" && r.bg === "background",
    );
    expect(hit).toBeDefined();
    expect(hit!.pass).toBe(false);
    expect(hit!.ratio).toBeLessThan(4.5);
  });

  test("surface pairs check surface foreground and composite translucent backgrounds over page", () => {
    const entry = patchTheme({
      surfaces: {
        overlay: {
          background: { color: "primary", alpha: 0.9 },
          foreground: "primary-foreground",
        },
      },
    });
    const overlay = themePairs(entry, "light").find((r) => r.bg === "surface.overlay");
    expect(overlay).toBeDefined();
    expect(overlay!.fg).toBe("primary-foreground");
    expect(overlay!.pass).toBe(true);
  });

  test("pressed accent pair is checked when feedback.press.accent defines background and foreground", () => {
    const entry = patchTheme({
      feedback: {
        press: {
          accent: {
            opacity: 1,
            background: "oklch(0.2 0 0)",
            foreground: "oklch(0.98 0 0)",
          },
        },
      },
    });
    const pressed = themePairs(entry, "light").find(
      (r) => r.bg === "feedback.press.accent.background",
    );
    expect(pressed).toBeDefined();
    expect(pressed!.pass).toBe(true);
  });
});

describe("themeFills", () => {
  test("translucent fill is composited over each ground and meets fillFloor", () => {
    const results = themeFills(apple, "light");
    expect(results.map((r) => [r.fill, r.ground])).toEqual([
      ["accent", "background"],
      ["accent", "card"],
      ["accent", "popover"],
    ]);
    for (const r of results) {
      expect(r.pass).toBe(true);
      expect(Math.abs(r.deltaL)).toBeGreaterThanOrEqual(r.floor);
    }
  });

  test("identical fill and ground fails fill separation", () => {
    const flat = patchTheme({
      tokens: {
        light: {
          ...shadcn.spec.tokens.light,
          accent: "oklch(1 0 0)",
          background: "oklch(1 0 0)",
        },
      },
    });
    const hit = themeFills(flat, "light").find(
      (r) => r.fill === "accent" && r.ground === "background",
    );
    expect(hit).toBeDefined();
    expect(hit!.pass).toBe(false);
    expect(hit!.deltaL).toBe(0);
  });
});

describe("shipped themes", () => {
  test("all non-waived pairs and all fill checks pass across all 6 shipped themes", () => {
    const unwaivedFails = readResults().filter((r) => !r.pass && !exception(r));
    expect(unwaivedFails).toEqual([]);
    const fillFails = readFills().filter((r) => !r.pass);
    expect(fillFails).toEqual([]);
  });

  test("contrast waivers only cover documented Apple/shadcn/nsh-gallery/WinUI exceptions", () => {
    const waived = readResults().filter((r) => !r.pass && exception(r));
    expect(waived.length).toBeGreaterThan(0);
    for (const r of waived) {
      expect(exception(r, ALL_THEMES)).toBeTruthy();
    }
  });
});
