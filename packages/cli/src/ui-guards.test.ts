import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";

/**
 * P3 over the component sources: every color a component draws comes from the theme
 * (`colors.*`, `token()`, `finish`, `alpha()`, `mix()`), so the appearance follows light and dark
 * and a theme change reaches every control. A color written out, or a palette color spliced into a
 * class string, would not.
 *
 * The whole source is read, **port regions included**: a region says where the code came from, not
 * whose colors it uses (`docs/ARCHITECTURE.md`). The look is this library's, so a color in it is
 * the theme's or one of the exemptions below.
 *
 * A color the *user* picks cannot be a theme role: an avatar's identity hue, the picker's swatch
 * chrome, the ink that reads on a chosen color, a chart label over a series' fill. Those are
 * listed with their reason and are the only ones.
 */

const root = new URL("../../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

/** A source with its comments removed, so prose about a color is not a color. */
const code = (path: string) =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1");

const rules: Record<string, RegExp> = {
  "hex color": /#[0-9a-fA-F]{3,8}\b/,
  // A notation built from a computed color (`` `rgb(${…})` ``) names a format, not a color.
  "color function": /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\((?!\s*\$\{)/,
  "named color": /["'](?:white|black|red|green|blue|gray|grey|yellow|orange|purple|pink)["']/,
  "color-mix with black or white": /color-mix\([^)]*\b(?:black|white)\b/,
  // A class names a theme token (`bg-raised`), not a palette entry (`border-white`, `text-red-500`).
  "tailwind palette color":
    /\b(?:bg|text|border|ring|from|via|to|fill|stroke|outline|shadow|divide|placeholder|accent|caret|decoration)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/,
};

const components = readdirSync(new URL("packages/ui/", root))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `packages/ui/${file}`);
/** The shared look helpers: no component owns them, so the same rule applies. */
const lib = readdirSync(new URL("packages/ui/lib/", root))
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => `packages/ui/lib/${file}`);
/** The theme's helpers read the roles; they write no color of their own either. */
const theme = ["packages/theme/theme.ts", "packages/theme/index.ts"];
/** The demo adapter is the demos' chrome; `stage.tsx` is where the official examples' parts live. */
const adapter = ["apps/docs/demos/kit.tsx", "apps/docs/demos/stage.tsx"];
const demos = readdirSync(new URL("apps/docs/demos/", root))
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
  .map((file) => `apps/docs/demos/${file}`);

const sources = [...components, ...lib, ...theme, ...adapter, ...demos];

/** Sources with a color of their own, and why the theme cannot name it. */
const exempt: Record<string, string> = {
  "packages/ui/avatar.tsx":
    "the identity ring: twelve hues computed from the name (gpui-component's avatar), each with its own background, ink and edge; no token can name a color derived from a name",
  "packages/ui/lib/icons.tsx":
    "the check mark's SVG carries #000 as template ink; `CheckMark` draws it in the caller's `tint` (`tintColor`), so the color shown is the theme's",
  "packages/ui/lib/color-format.ts":
    "spells out a color the user picked (rgb() / hsl() / oklch() built from its value) and picks black or white ink to read on it; the theme cannot name the user's color",
  "packages/ui/color-picker.tsx":
    'the swatch\'s white ring and black hairline read on the user\'s color in either appearance; "red" / "green" / "blue" here are RGB channel names',
  "apps/docs/demos/color-picker.tsx":
    "the palette is the demo's content: the colors the user picks, and the ink that reads on them",
  "apps/docs/demos/color-picker.ref.tsx": "the same page, its look expanded onto `nsh/base`",
  "apps/docs/demos/plot.tsx":
    "chart labels sit on a series' fill: black or white reads on any of them, the theme's ink does not",
  "apps/docs/demos/plot.ref.tsx": "the same page, its look expanded onto `nsh/base`",
};

const violations = (paths: string[]) =>
  paths.flatMap((path) =>
    Object.entries(rules)
      .filter(([, pattern]) => pattern.test(code(path)))
      .map(([rule]) => `${path}: ${rule}`),
  );

describe("component sources (P3: colors come from the theme)", () => {
  test("no source outside the list of exemptions writes a color", () => {
    const offenders = violations(sources.filter((path) => !(path in exempt)));
    expect(offenders, `colors written out:\n${offenders.join("\n")}`).toEqual([]);
  });

  test("every exemption exists and says why", () => {
    for (const [path, why] of Object.entries(exempt)) {
      expect(existsSync(new URL(path, root)), path).toBe(true);
      expect(why.length, path).toBeGreaterThan(40);
    }
  });

  test("a port region is read with the rest of the file", () => {
    // The region used to be stripped before the rules ran (`shellCode`); it is the look, so a
    // color in it is the theme's as well. Take a code line from inside one and check it is read.
    const path = "packages/ui/button.tsx";
    const text = read(path);
    const body = text.slice(text.indexOf("// @port look/button.ts"));
    const line = body
      .split("\n")
      .find((value) => /^(?:export|const|function|type|interface)\b/.test(value));
    expect(line, path).toBeDefined();
    expect(code(path)).toContain(line!);
  });

  test("the guard catches a color literal", () => {
    const sample = [
      'const style = { backgroundColor: "#ffffff", color: "rgba(0, 0, 0, 0.5)" };',
      'const className = "border-white text-red-500";',
      'const ink = "black";',
      'const mix = "color-mix(in srgb, black 10%, red)";',
    ].join("\n");
    for (const pattern of Object.values(rules)) {
      expect(pattern.test(sample), pattern.source).toBe(true);
    }
    expect(rules["named color"].test('{ backgroundColor: "transparent" }')).toBe(false);
    expect(rules["color function"].test("`oklch(${lightness}% ${chroma} ${hue})`")).toBe(false);
    expect(rules["tailwind palette color"].test('class="bg-raised text-muted-foreground"')).toBe(
      false,
    );
  });
});
