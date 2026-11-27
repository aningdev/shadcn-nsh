import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

type Vars = Record<string, string>;
type Theme = { cssVars: { theme: Vars; light: Vars; dark: Vars } };

const read = (file: string) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8")) as Theme;

/** Theme v5 shared contract: 9 `cssVars.theme` keys (`docs/theme.md`). */
const REQUIRED_THEME = [
  "font-sans",
  "font-mono",
  "radius",
  "radius-md",
  "radius-lg",
  "radius-xl",
  "scrim",
  "media",
  "on-media",
] as const;

const REQUIRED_MODE = [
  "background",
  "card",
  "popover",
  "muted",
  "surface",
  "foreground",
  "muted-foreground",
  "faint",
  "primary",
  "primary-foreground",
  "secondary",
  "accent",
  "brand",
  "border",
  "line",
  "input",
  "ring",
  "info",
  "success",
  "warning",
  "destructive",
] as const;

const REMOVED = [
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "card-foreground",
  "popover-foreground",
  "secondary-foreground",
  "accent-foreground",
  "up",
  "warn",
  "brand-tint",
  "chart-1",
] as const;

const ours = read("../theme.json");

describe("theme.json (Theme v5)", () => {
  test("declares all 9 shared theme keys and 21 light/dark core keys", () => {
    for (const key of REQUIRED_THEME) {
      expect(key in ours.cssVars.theme, `theme.${key}`).toBe(true);
    }
    expect(ours.cssVars.theme["font-sans"]).toBe("system-ui");
    expect(ours.cssVars.theme["font-mono"]).toBe("monospace");
    expect(ours.cssVars.theme.radius).toBe(ours.cssVars.theme["radius-md"]);
    expect(Object.keys(ours.cssVars.light).sort()).toEqual([...REQUIRED_MODE].sort());
    expect(Object.keys(ours.cssVars.dark).sort()).toEqual([...REQUIRED_MODE].sort());
  });

  test("omits removed legacy keys (sidebar-*, *-foreground, *-tint, chart-*)", () => {
    for (const key of REMOVED) {
      expect(key in ours.cssVars.light, `light has removed ${key}`).toBe(false);
      expect(key in ours.cssVars.dark, `dark has removed ${key}`).toBe(false);
    }
  });
});
