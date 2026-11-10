import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

type Vars = Record<string, string>;
type Theme = { cssVars: { theme: Vars; light: Vars; dark: Vars } };

const read = (file: string) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8")) as Theme;

/** NSH's own default theme (shadcn `neutral`), the standard every theme is laid over. */
const official = read("../../../references/nsh/crates/nsh-base/src/default-theme.json");
const ours = read("../../theme/theme.json");

const sections = ["theme", "light", "dark"] as const;

describe("theme.json", () => {
  test("has every key of NSH's default theme, with the same value", () => {
    for (const section of sections) {
      for (const [key, value] of Object.entries(official.cssVars[section])) {
        expect(ours.cssVars[section][key], `${section}.${key}`).toBe(value);
      }
    }
  });

  test("marks what is ours with a custom- prefix, and nothing else", () => {
    for (const section of sections) {
      const extra = Object.keys(ours.cssVars[section]).filter(
        (key) => !(key in official.cssVars[section]),
      );
      for (const key of extra) expect(key.startsWith("custom-"), `${section}.${key}`).toBe(true);
    }
  });

  test("writes every color as oklch", () => {
    for (const section of ["light", "dark"] as const) {
      for (const [key, value] of Object.entries(ours.cssVars[section])) {
        if (key.startsWith("font-")) continue;
        expect(value.startsWith("oklch("), `${section}.${key}: ${value}`).toBe(true);
      }
    }
  });

  test("keeps the opaque bases of the shadow colors opaque", () => {
    for (const section of ["light", "dark"] as const) {
      for (const key of ["custom-shadow-ink", "custom-highlight"]) {
        expect(ours.cssVars[section][key], `${section}.${key}`).not.toContain("/");
      }
    }
  });
});
