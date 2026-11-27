/**
 * Tests for Theme v5 compilation, one-way DTCG 2025.10 export, DESIGN.md export, and build parity.
 */
import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { lint } from "@google/design.md/linter";

import { compileNshTheme, defineTheme } from "../../packages/theme/schema";
import { ALL_THEMES, nshGallery, shadcn } from "../../packages/theme/themes";
import { buildAllTokens, buildThemeTargets, checkAllTokens } from "./build";
import { exportDesignMd, exportDtcgTokens } from "./export";

const root = path.join(import.meta.dir, "..", "..");
const readText = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");
const readJson = (rel: string) => JSON.parse(readText(rel));

describe("Theme v5 schema & compilation", () => {
  test("compiles shared theme keys and writes default fonts", () => {
    expect(Object.keys(nshGallery.theme.cssVars.light)).toHaveLength(21);
    expect(Object.keys(nshGallery.theme.cssVars.dark)).toHaveLength(21);
    expect(nshGallery.theme.cssVars.theme["font-sans"]).toBe("system-ui");
    expect(nshGallery.theme.cssVars.theme["font-mono"]).toBe("monospace");
    expect(nshGallery.theme.cssVars.theme.radius).toBe(nshGallery.theme.cssVars.theme["radius-md"]);
    expect(nshGallery.theme.cssVars.theme["radius-lg"]).toBeTruthy();
    expect(nshGallery.theme.cssVars.theme["radius-xl"]).toBeTruthy();
  });

  test("emits configured font-sans / font-mono into cssVars.theme", () => {
    const custom = defineTheme({
      id: "font-fixture",
      label: "Font Fixture",
      extends: nshGallery.spec,
      tokens: {
        font: {
          sans: "Inter, sans-serif",
          mono: "JetBrains Mono, monospace",
        },
      },
    });
    expect(custom.theme.cssVars.theme["font-sans"]).toBe("Inter, sans-serif");
    expect(custom.theme.cssVars.theme["font-mono"]).toBe("JetBrains Mono, monospace");
  });

  test("palette override resets omitted brand/tints/chart instead of inheriting base citrus colors", () => {
    expect(shadcn.spec.tokens.light.brand).toBeUndefined();
    expect(shadcn.theme.cssVars.light.brand).toBe("var(--primary)");
    expect(shadcn.spec.tokens.tints).toBeUndefined();

    const custom = defineTheme({
      id: "palette-fixture",
      label: "Palette Fixture",
      extends: nshGallery.spec,
      tokens: {
        light: { ...shadcn.spec.tokens.light, brand: undefined },
        dark: { ...shadcn.spec.tokens.dark, brand: undefined },
      },
    });
    expect(custom.theme.cssVars.light.brand).toBe("var(--primary)");
    expect(custom.spec.tokens.tints).toBeUndefined();
    expect(custom.spec.tokens.chart).toBeUndefined();
  });

  test("preserves scalar fields in controls patches that declare `color`", () => {
    expect(shadcn.spec.controls.field.focus.line).toBe(false);
    expect(shadcn.spec.controls.field.focus.width).toBe(3);
    expect(shadcn.spec.controls.field.focus.color).toBe("ring");
  });
});

describe("Theme v5 one-way DTCG & DESIGN.md exports", () => {
  for (const entry of ALL_THEMES) {
    test(`${entry.id}: emits valid DTCG light/dark files and DESIGN.md passing linter`, () => {
      const lightDtcg = exportDtcgTokens(entry, "light") as Record<string, any>;
      const darkDtcg = exportDtcgTokens(entry, "dark") as Record<string, any>;
      expect(lightDtcg.$schema).toContain("2025.10");
      expect(darkDtcg.$schema).toContain("2025.10");
      expect(lightDtcg.color.$type).toBe("color");
      expect(lightDtcg.typography.body.$value.fontSize.value).toBe(13);

      const md = exportDesignMd(entry);
      const lintResult = lint(md);
      expect(lintResult.summary.errors, `${entry.id} DESIGN.md linter errors`).toBe(0);
      expect(lintResult.findings.filter((f) => f.severity === "error")).toEqual([]);
      expect(lintResult.designSystem.components.size).toBeGreaterThan(0);

      // Exported files on disk match generators
      expect(readText(`packages/theme/themes/${entry.id}/DESIGN.md`)).toBe(md);
      expect(readJson(`packages/theme/themes/${entry.id}/theme.json`)).toEqual(
        compileNshTheme(entry.spec),
      );
    });
  }
});

describe("buildAllTokens & checkAllTokens", () => {
  test("repo build artifacts are up to date", () => {
    const check = checkAllTokens();
    expect(check.problems).toEqual([]);
    expect(check.themes).toHaveLength(6);
  });

  test("buildAllTokens writes clean targets into a fresh directory and passes checkAllTokens", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "theme-v5-build-"));
    try {
      const res = buildAllTokens(tmp);
      expect(res.themes).toHaveLength(6);
      expect(res.written.length).toBeGreaterThanOrEqual(24);
      expect(checkAllTokens(tmp).problems).toEqual([]);
      expect(buildThemeTargets(nshGallery).map((t) => t.relPath)).toContain(
        "packages/theme/DESIGN.md",
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
