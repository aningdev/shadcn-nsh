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

/** A source with its comments removed, so prose about a color is not a color (its lines kept, so a line number is the file's). */
const code = (path: string) =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ""))
    .replace(/(^|\s)\/\/[^\n]*/g, "$1");

const rules: Record<string, RegExp> = {
  // Not after a word character: `nsh#810` is an issue reference, not a color.
  "hex color": /(?<!\w)#[0-9a-fA-F]{3,8}\b/,
  // A notation built from a computed color (`` `rgb(${…})` ``) names a format, not a color.
  "color function": /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\((?!\s*\$\{)/,
  "named color": /["'](?:white|black|red|green|blue|gray|grey|yellow|orange|purple|pink)["']/,
  "color-mix with black or white": /color-mix\([^)]*\b(?:black|white)\b/,
  // A class names a theme token (`bg-raised`), not a palette entry (`border-white`, `text-red-500`).
  "tailwind palette color":
    /\b(?:bg|text|border|ring|from|via|to|fill|stroke|outline|shadow|divide|placeholder|accent|caret|decoration)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/,
  // A class radius names one of the theme's tiers (`rounded-(--radius-control)`): Tailwind's fixed
  // steps (`rounded-md`) ignore `radius*`, so a control that wore one kept its corners through a
  // theme change (#53). A deliberate fixed geometry stays `rounded-full` or `rounded-[Npx]`, with a
  // comment saying why.
  "fixed-scale radius class":
    /\brounded-(?:t-|b-|l-|r-|s-|e-|tl-|tr-|bl-|br-)?(?:sm|md|lg|xl|2xl|3xl)\b/,
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
const adapter = ["apps/website/demos/kit.tsx", "apps/website/demos/stage.tsx"];
const demos = readdirSync(new URL("apps/website/demos/", root))
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
  .map((file) => `apps/website/demos/${file}`);

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
  "apps/website/demos/color-picker.tsx":
    "the palette is the demo's content: the colors the user picks, and the ink that reads on them",
  "apps/website/demos/color-picker.ref.tsx": "the same page, its look expanded onto `nsh/base`",
  "apps/website/demos/plot.tsx":
    "chart labels sit on a series' fill: black or white reads on any of them, the theme's ink does not",
  "apps/website/demos/plot.ref.tsx": "the same page, its look expanded onto `nsh/base`",
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
      'const corner = "rounded-lg";',
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

  test("the guard catches a fixed-scale radius class", () => {
    const sample = [
      'const row = "group rounded-md hover:bg-hover";',
      'const panel = "rounded-xl border border-border bg-card";',
      'const sheet = "rounded-t-2xl bg-card";',
    ].join("\n");
    const rule = rules["fixed-scale radius class"];
    for (const line of sample.split("\n")) {
      expect(rule.test(line), line).toBe(true);
    }
    // The theme's tiers, a pill and a written-out corner are all the radius a class may name.
    expect(rule.test('class="rounded-(--radius-control) rounded-(--radius-card)"')).toBe(false);
    expect(rule.test('class="rounded-t-(--radius-card)"')).toBe(false);
    expect(rule.test('class="rounded-full rounded-[4px]"')).toBe(false);
  });
});

/**
 * A finish (`finish.raised`, `finish.inset`, …) is one shared object whose properties are getters.
 * Passed as it is, a style reaches the engine converted once and keeps the appearance of the render
 * that converted it: otp-input's cells kept the light appearance's highlight in dark. A look hands a
 * finish out as a copy (`{ ...finish.x }`, or inside a spread `...(on ? finish.on : {})`), which
 * reads the getters where the look is applied. Reading one property (`finish.raised.boxShadow`)
 * is a value, not the object.
 */
function sharedFinishes(source: string): string[] {
  const found: string[] = [];
  for (const match of source.matchAll(/(?<![\w.$])finish(?:\.\w+|\[[^\]]+\])(?![\w.[$])/g)) {
    const at = match.index;
    let spread = /\.\.\.\s*$/.test(source.slice(0, at));
    // Walk out of the enclosing expression: a `(` opened by a spread makes the finish a spread too.
    for (let i = at - 1, depth = 0; !spread && i >= 0; i--) {
      const c = source[i];
      if (c === ")" || c === "]" || c === "}") depth++;
      else if (c === "(" || c === "[" || c === "{") {
        if (depth > 0) depth--;
        else if (c !== "(") break;
        else spread = /\.\.\.\s*$/.test(source.slice(0, i));
      } else if (depth === 0 && (c === ";" || c === ",")) break;
    }
    if (!spread) found.push(`line ${source.slice(0, at).split("\n").length}: ${match[0]}`);
  }
  return found;
}

describe("component sources (a finish is handed out as a copy)", () => {
  test("no look passes a shared finish object as a style", () => {
    const offenders = [...components, ...lib, ...adapter, ...demos].flatMap((path) =>
      sharedFinishes(code(path)).map((hit) => `${path}: ${hit}`),
    );
    expect(offenders, `shared finish objects:\n${offenders.join("\n")}`).toEqual([]);
  });

  test("the guard tells a shared finish from a copy", () => {
    expect(sharedFinishes("return tone ? { ...finish.inset } : finish.inset;")).toHaveLength(1);
    expect(sharedFinishes("hoverStyle: finish.hover,")).toHaveLength(1);
    expect(sharedFinishes("<View style={finish.raised} />")).toHaveLength(1);
    expect(sharedFinishes("return { ...finish.inset };")).toEqual([]);
    expect(sharedFinishes("...(flat || ghost ? {} : finish.field),")).toEqual([]);
    expect(sharedFinishes("...(on() ? finish.knobOn : finish.knob),")).toEqual([]);
    expect(sharedFinishes("boxShadow: finish.raised.boxShadow,")).toEqual([]);
  });
});
