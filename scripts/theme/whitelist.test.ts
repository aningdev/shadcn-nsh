import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { colourSources } from "./extensions";
import type { ColourProvenance } from "./sources";
import { checkWhitelist, type WhitelistSemantics, type WhitelistTheme } from "./whitelist";

const themes = join(import.meta.dir, "../../packages/theme");
const read = <T>(file: string) => JSON.parse(readFileSync(join(themes, file), "utf8")) as T;

const semantics = read<WhitelistSemantics>("semantics.json");
const noProvenance: ColourProvenance = { theme: {}, light: {}, dark: {} };
const fixture = (): {
  theme: WhitelistTheme;
  semantics: WhitelistSemantics;
  provenance: ColourProvenance;
} => ({
  theme: structuredClone(read<WhitelistTheme>("themes/shadcn/theme.json")),
  semantics: structuredClone(read<WhitelistSemantics>("themes/shadcn/semantics.json")),
  // A theme's colours carry the sources their own theme states (ADR 0012 §4).
  provenance: structuredClone(colourSources("shadcn")),
});
/** Drop the source a key would have had, so the test can state a value without one. */
const unsourced = (
  f: { provenance: ColourProvenance },
  section: keyof ColourProvenance,
  key: string,
) => {
  const copy = structuredClone(f.provenance);
  delete copy[section][key];
  return copy;
};
const lint = (f: {
  theme: WhitelistTheme;
  semantics: WhitelistSemantics;
  provenance?: ColourProvenance;
}) => checkWhitelist("fixture", f.theme, f.semantics, semantics, f.provenance ?? noProvenance);

describe("the whitelist", () => {
  test("the shipped themes pass", () => {
    for (const id of ["nsh-gallery", "shadcn", "solid-glass", "apple", "material", "winui"])
      expect(
        checkWhitelist(
          id,
          read<WhitelistTheme>(id === "nsh-gallery" ? "theme.json" : `themes/${id}/theme.json`),
          read<WhitelistSemantics>(
            id === "nsh-gallery" ? "semantics.json" : `themes/${id}/semantics.json`,
          ),
          semantics,
          colourSources(id),
        ),
      ).toEqual([]);
  });

  test("a theme with an extra colour key fails", () => {
    const f = fixture();
    f.theme.cssVars.light["violet"] = "oklch(0.7 0.13 294)";
    expect(lint(f).join("\n")).toContain("light.violet is no source or reference colour");
  });

  test("a literal tint fails", () => {
    const f = fixture();
    f.theme.cssVars.light["info-tint"] = "oklch(0.27 0 0)";
    f.provenance = unsourced(f, "light", "info-tint");
    const text = lint(f).join("\n");
    expect(text).toContain("light.info-tint is `oklch(0.27 0 0)`");
    expect(text).toContain("states no source for it");
  });

  test("a literal on a reference-only key fails", () => {
    const f = fixture();
    f.theme.cssVars.light["popover"] = "oklch(0.2 0 0)";
    f.provenance = unsourced(f, "light", "popover");
    expect(lint(f).join("\n")).toContain("light.popover writes");
  });

  test("a reference that states its source passes (ADR 0012 §4)", () => {
    const f = fixture();
    f.theme.cssVars.light["popover"] = "oklch(0.2 0 0)";
    expect(lint(f)).toEqual([]);
  });

  test("a tint at the spec's own strength passes, and sets no shared number (ADR 0012 §5)", () => {
    const f = fixture();
    const tints = [
      "brand-tint",
      "info-tint",
      "warn-tint",
      "destructive-tint",
      "up-tint",
      "down-tint",
    ];
    for (const key of tints) f.provenance.light[key] = `some spec: ${key}`;
    f.theme.cssVars.light["info-tint"] = "color-mix(in srgb, var(--info) 30%, transparent)";
    expect(lint(f)).toEqual([]);
  });

  test("a source nothing uses fails", () => {
    const f = fixture();
    f.provenance = {
      ...structuredClone(colourSources("shadcn")),
      dark: { ...colourSources("shadcn").dark, "brand-edge": "shadcn/ui default theme: --border" },
    };
    expect(lint(f).join("\n")).toContain(
      "dark.brand-edge states a source nothing uses (the colour points at a source)",
    );
  });

  test("tints with different strengths fail", () => {
    const f = fixture();
    f.theme.cssVars.light["warn-tint"] = "color-mix(in srgb, var(--warn) 30%, transparent)";
    f.provenance = structuredClone(colourSources("shadcn"));
    for (const key of [
      "brand-tint",
      "info-tint",
      "warn-tint",
      "destructive-tint",
      "up-tint",
      "down-tint",
    ])
      delete f.provenance.light[key];
    expect(lint(f).join("\n")).toContain("one number per theme");
  });

  test("a control dimension outside field, choice, track, handle fails", () => {
    const f = fixture();
    f.semantics.dimension.control["selection"] = "bar";
    expect(lint(f).join("\n")).toContain("dimension.control.selection");
  });

  test("a font family or a per-theme size fails", () => {
    const f = fixture();
    f.theme.cssVars.theme["font-sans"] = "Inter";
    f.semantics.typography["body"]!.fontSize = { pointer: 15, touch: 15 };
    const text = lint(f).join("\n");
    expect(text).toContain("font-sans");
    expect(text).toContain("typography.body.fontSize differs");
  });
});
