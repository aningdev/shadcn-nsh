import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

type Vars = Record<string, string>;
type Theme = { cssVars: { theme: Vars; light: Vars; dark: Vars } };

const read = (file: string) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8")) as Theme;

/** NSH's own default theme: every key an app that uses `nsh/base` is entitled to. */
const official = read("../../../references/nsh/crates/nsh-base/src/default-theme.json");
/**
 * The ported gallery-ui theme (`packages/theme`). Values may differ from
 * the official defaults; the contract is the key set, not the palette.
 */
const ours = read("../../../packages/theme/theme.json");

const sections = ["theme", "light", "dark"] as const;

describe("theme.json", () => {
  test("has every key of NSH's default theme", () => {
    for (const section of sections) {
      for (const key of Object.keys(official.cssVars[section])) {
        expect(key in ours.cssVars[section], `${section}.${key}`).toBe(true);
      }
    }
  });

  test("declares light and dark for every color-like key it adds", () => {
    const light = new Set(Object.keys(ours.cssVars.light));
    const dark = new Set(Object.keys(ours.cssVars.dark));
    for (const key of light) expect(dark.has(key), `dark missing ${key}`).toBe(true);
    for (const key of dark) expect(light.has(key), `light missing ${key}`).toBe(true);
  });
});
