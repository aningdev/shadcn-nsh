import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

/**
 * Guards over the component sources. Every color a component draws comes from the theme
 * (`colors.*`, `finish`, `alpha()`, `mix()`), so the appearance follows light and dark and a
 * theme change reaches every control. A color written out, or a token's value spliced into a
 * class string, would not. `"transparent"` is not a color (R5 allows it as a layout literal).
 *
 * No component is exempt: every one is on the reference look, so a rule broken by any source
 * fails.
 *
 * The recipe rules below (R3, R4, R7, the motion whitelist, the docs page and the test) are the
 * mechanical part of the migration checklist; `bun run check:recipes` runs this file.
 */

const root = new URL("../../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

/** The sources the guards read: the components and the theme's helpers. */
const sources = [
  ...readdirSync(new URL("packages/ui/", root))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => `packages/ui/${file}`),
  "packages/theme/theme.ts",
];

/** A source with its comments removed, so prose about a color is not a color. */
const code = (path: string) =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1");

const rules: Record<string, RegExp[]> = {
  "colour-literals": [
    /#[0-9a-fA-F]{3,8}\b/,
    /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/,
    /"(?:white|black|red|green|blue|gray|grey|yellow|orange|purple|pink)"/,
    /color-mix\([^)]*\b(?:black|white)\b/,
  ],
};

const breaks = (path: string, patterns: RegExp[]) => patterns.some((p) => p.test(code(path)));

/** Strip `// @port …` … `// @port end` regions: colour there is upstream's, not the shell's. */
const shellCode = (path: string) =>
  code(path).replace(/\/\/ @port [^\n]*\n[\s\S]*?\/\/ @port end/g, "");

/** Ported components under `next/ui` (one file each); lib helpers are vendor-only. */
const nextSources = readdirSync(new URL("next/ui/", root))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `next/ui/${file}`);

describe("component sources", () => {
  for (const [rule, patterns] of Object.entries(rules)) {
    test(`${rule}: no source breaks it`, () => {
      const offenders = sources.filter((path) => breaks(path, patterns));
      expect(offenders, `${rule} in ${offenders.join(", ")}`).toEqual([]);
    });
  }

  test("the guard catches a color literal", () => {
    const sample = 'const style = { backgroundColor: "#ffffff", color: "rgba(0, 0, 0, 0.5)" };';
    expect(rules["colour-literals"].some((p) => p.test(sample))).toBe(true);
    expect(rules["colour-literals"].some((p) => p.test('{ backgroundColor: "transparent" }'))).toBe(
      false,
    );
  });
});

describe("ported shells (next/ui)", () => {
  test("colour-literals: no shell outside a port region breaks it", () => {
    const offenders = nextSources.filter((path) =>
      rules["colour-literals"].some((p) => p.test(shellCode(path))),
    );
    expect(offenders, `colour-literals in ${offenders.join(", ")}`).toEqual([]);
  });

  test("the region strip leaves shell code for the guard to see", () => {
    const sample = `// @port look/x.ts\nconst a = "#fff";\n// @port end\nconst b = "#000";`;
    const stripped = sample.replace(/\/\/ @port [^\n]*\n[\s\S]*?\/\/ @port end/g, "");
    expect(rules["colour-literals"].some((p) => p.test(stripped))).toBe(true);
    expect(stripped.includes("#fff")).toBe(false);
  });
});

/** One component: its source, with and without comments, by registry id. */
type Component = { id: string; file: string; raw: string; code: string };

const components: Component[] = readdirSync(new URL("packages/ui/", root))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => ({
    id: file.replace(/\.tsx$/, ""),
    file,
    raw: read(`packages/ui/${file}`),
    code: code(`packages/ui/${file}`),
  }));

const pascal = (id: string) =>
  id
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");

/** What the gallery's tests say, in one string: a component is tested when its name is there. */
const galleryTests = readdirSync(new URL("apps/gallery/tests/", root))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => read(`apps/gallery/tests/${file}`))
  .join("\n");

/** The durations `nsh` documents (and the gallery uses): anything else is not a literal to write. */
const DURATIONS = new Set([100, 120, 150, 180, 200, 300]);

/** Exported types, functions and constants with no comment above them (R7). */
function undocumentedExports(raw: string): string[] {
  const lines = raw.split("\n");
  const names: string[] = [];
  lines.forEach((line, index) => {
    const match = /^export (?:type|function|const) (\w+)/.exec(line);
    if (!match) return;
    let above = index - 1;
    while (above >= 0 && lines[above].trim() === "") above -= 1;
    if (above < 0 || !lines[above].trim().endsWith("*/")) names.push(match[1]);
  });
  return names;
}

const docsPage = (id: string) => {
  try {
    return read(`apps/docs/src/pages/docs/components/${id}.md`);
  } catch {
    return "";
  }
};

const recipeRules: Record<string, (c: Component) => boolean> = {
  // R4: a consumer value is passed through; a merge is written only against a default.
  "merge-undefined": (c) => /merge(?:Class|Style)\(\s*undefined\b/.test(c.code),
  // R3: props are read where used, never destructured.
  "props-destructure": (c) =>
    /const\s*\{[^}]*\}\s*=\s*props\b/.test(c.code) || /export function \w+\(\s*\{/.test(c.code),
  // Motion whitelist: no duration outside the ones `nsh` documents.
  "duration-literal": (c) =>
    [...c.code.matchAll(/transitionDuration:\s*(\d+)|duration-(\d+)/g)].some(
      (m) => !DURATIONS.has(Number(m[1] ?? m[2])),
    ),
  // R7: every export has a doc comment.
  "doc-comments": (c) => undocumentedExports(c.raw).length > 0,
  // The docs page has its fixed sections.
  "docs-sections": (c) => {
    const page = docsPage(c.id);
    return !["## Install", "## Usage", "## API", "## Differences"].every((h) => page.includes(h));
  },
  // The gallery's tests exercise the component.
  "has-test": (c) => !galleryTests.includes(pascal(c.id)),
};

describe("component recipes", () => {
  for (const [rule, breaksRule] of Object.entries(recipeRules)) {
    test(`${rule}: no component breaks it`, () => {
      const offenders = components.filter((c) => breaksRule(c));
      expect(
        offenders.map((c) => c.file),
        `${rule} broken by`,
      ).toEqual([]);
    });
  }
});
