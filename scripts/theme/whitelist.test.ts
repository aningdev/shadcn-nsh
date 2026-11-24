import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { checkWhitelist, type WhitelistSemantics, type WhitelistTheme } from "./whitelist";

const themes = join(import.meta.dir, "../../packages/theme");
const read = <T>(file: string) => JSON.parse(readFileSync(join(themes, file), "utf8")) as T;

const semantics = read<WhitelistSemantics>("semantics.json");
const fixture = (): { theme: WhitelistTheme; semantics: WhitelistSemantics } => ({
  theme: structuredClone(read<WhitelistTheme>("themes/shadcn/theme.json")),
  semantics: structuredClone(read<WhitelistSemantics>("themes/shadcn/semantics.json")),
});
const lint = (f: { theme: WhitelistTheme; semantics: WhitelistSemantics }) =>
  checkWhitelist("fixture", f.theme, f.semantics, semantics);

describe("the ADR 0007 whitelist", () => {
  test("the shipped themes pass", () => {
    for (const id of ["default", "shadcn", "solid-glass", "apple", "material", "winui"])
      expect(
        checkWhitelist(
          id,
          read<WhitelistTheme>(id === "default" ? "theme.json" : `themes/${id}/theme.json`),
          read<WhitelistSemantics>(
            id === "default" ? "semantics.json" : `themes/${id}/semantics.json`,
          ),
          semantics,
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
    expect(lint(f).join("\n")).toContain("light.info-tint");
  });

  test("a literal on a reference-only key fails", () => {
    const f = fixture();
    f.theme.cssVars.dark["inset"] = "oklch(0.2 0 0)";
    expect(lint(f).join("\n")).toContain("dark.inset writes");
  });

  test("tints with different strengths fail", () => {
    const f = fixture();
    f.theme.cssVars.light["warn-tint"] = "color-mix(in srgb, var(--warn) 30%, transparent)";
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
