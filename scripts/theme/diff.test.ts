/**
 * Unit tests for the Theme v5 diff classifier (`scripts/theme/diff.ts`).
 */
import { describe, expect, test } from "bun:test";

import {
  classifyChanges,
  contractMoves,
  contractSources,
  flatten,
  keyKind,
  type ThemeDiff,
} from "./diff";

const sampleTheme = (
  overrides: { light?: Record<string, string>; theme?: Record<string, string> } = {},
) => ({
  name: "sample",
  cssVars: {
    theme: {
      "font-sans": "system-ui",
      "font-mono": "monospace",
      radius: "8px",
      "radius-md": "8px",
      "radius-lg": "12px",
      "radius-xl": "16px",
      scrim: "oklch(0 0 0 / 0.45)",
      media: "oklch(0.1 0 0)",
      "on-media": "oklch(0.98 0 0)",
      ...overrides.theme,
    },
    light: {
      background: "oklch(1 0 0)",
      primary: "oklch(0.5 0.2 150)",
      brand: "var(--primary)",
      ...overrides.light,
    },
    dark: {
      background: "oklch(0.15 0 0)",
      primary: "oklch(0.7 0.2 150)",
      brand: "var(--primary)",
    },
  },
});

describe("flatten", () => {
  test("resolves var() and {token} references in both theme.json and semantics", () => {
    const flat = flatten(
      sampleTheme(),
      {
        surfaces: { card: { background: "{primary}" } },
        metrics: { height: { md: 32 } },
      },
      "light",
    );
    expect(flat.get("color.background")).toBe("oklch(1 0 0)");
    expect(flat.get("color.brand")).toBe("oklch(0.5 0.2 150)");
    expect(flat.get("color.radius")).toBe("8px");
    expect(flat.get("surfaces.card.background")).toBe("oklch(0.5 0.2 150)");
    expect(flat.get("metrics.height.md")).toBe("32");
  });
});

describe("keyKind and classifyChanges", () => {
  test("distinguishes colours vs radii/metric values", () => {
    const theme = sampleTheme();
    expect(keyKind("color.background", theme)).toBe("colour");
    expect(keyKind("color.scrim", theme)).toBe("colour");
    expect(keyKind("color.radius", theme)).toBe("value");
    expect(keyKind("surfaces.card.background", theme)).toBe("colour");
    expect(keyKind("surfaces.card.borderTop", theme)).toBe("colour");
    expect(keyKind("metrics.height.md", theme)).toBe("value");
  });

  test("marks added or removed keys as contract changes", () => {
    const t = sampleTheme();
    const a = flatten(t, undefined, "light");
    const b = flatten(
      sampleTheme({ light: { background: "oklch(0.98 0 0)", extra: "oklch(0.6 0 0)" } }),
      undefined,
      "light",
    );
    const changes = classifyChanges(a, b, t);
    expect(changes.find((c) => c.key === "color.background")?.kind).toBe("colour");
    expect(changes.find((c) => c.key === "color.extra")?.kind).toBe("contract");
  });
});

describe("contractSources and contractMoves", () => {
  test("flags core Theme v5 contract files and token exporter", () => {
    const hits = contractSources([
      "packages/theme/schema.ts",
      "packages/theme/theme.ts",
      "packages/theme/materials.ts",
      "packages/theme/themes/nsh-gallery/index.ts",
      "scripts/theme/export.ts",
      "packages/theme/themes/apple/index.ts",
    ]);
    expect(hits.map((h) => h.file)).toEqual([
      "packages/theme/schema.ts",
      "packages/theme/theme.ts",
      "packages/theme/materials.ts",
      "packages/theme/themes/nsh-gallery/index.ts",
      "scripts/theme/export.ts",
    ]);
  });

  test("lists contract file moves without an ADR", () => {
    const diff: ThemeDiff = {
      ref: "origin/main",
      base: "abc",
      files: ["packages/theme/schema.ts"],
      contract: [
        { file: "packages/theme/schema.ts", why: "the theme package's contract or reader" },
      ],
      themes: {},
    };
    expect(contractMoves(diff)).toEqual([
      {
        where: "packages/theme/schema.ts",
        what: "the theme package's contract or reader",
      },
    ]);
  });
});
