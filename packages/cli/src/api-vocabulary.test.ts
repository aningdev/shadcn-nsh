import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

/**
 * The API's words (`docs/specs/api-unify.md` §4). Every axis hands the same vocabulary to every
 * control: `variant` takes shadcn's values, `size` takes the scale's. A control exports its own
 * union (`ButtonVariant`, `PickerVariant`, `ToggleSize`) so its type says which of them it takes;
 * this test holds every such union to the vocabulary, so a new value cannot slip in unnoticed —
 * adding one means adding it here, with the page that names it.
 *
 * Only the values shadcn has are allowed, plus the ones written down below (`line`, `tile`): this
 * library's own, documented on their component's page. A pixel size is not a `size` — a control's
 * exact geometry is a `side` / `width` / `height`.
 */

const root = new URL("../../../", import.meta.url);

/** Every `variant` value (the shadcn registry's `buttonVariants`). */
const VARIANTS = ["default", "secondary", "outline", "ghost", "destructive", "link"];

/**
 * The variant values shadcn does not have, each with the component page that names it:
 * `tile` is a radio drawn as a card (`Radio`), `line` an underlined tab track.
 */
const OWN_VARIANTS: Record<string, string> = { tile: "radio-group", line: "tabs" };

/** Every `size` value: the three of a scale, and the icon-only ones a shadcn button takes. */
const SIZES = ["sm", "default", "lg", "xs", "icon", "icon-xs", "icon-sm", "icon-lg"];

/** The exported type aliases of one module, by name, with their declared text. */
function unionsOf(source: string): Map<string, string> {
  const unions = new Map<string, string>();
  for (const match of source.matchAll(/^export type (\w+) =([^;]*);/gm)) {
    unions.set(match[1]!, match[2]!);
  }
  return unions;
}

/** The string literals of a union's text (`null` and other members have none). */
const valuesOf = (text: string) => [...text.matchAll(/"([^"]+)"/g)].map((match) => match[1]!);

const files = readdirSync(new URL("packages/ui/", root))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `packages/ui/${file}`);

/** The exported `*Variant` and `*Size` unions of `packages/ui`, with their declared values. */
const unions = new Map<string, { file: string; values: string[] }>();
for (const file of files) {
  const source = readFileSync(new URL(file, root), "utf8");
  for (const [name, text] of unionsOf(source)) {
    if (!/Variant$|Size$/.test(name)) continue;
    unions.set(name, { file, values: valuesOf(text) });
  }
}

/** The values of a union that are not in `allowed`. */
const stray = (name: string, allowed: string[]) => {
  const legal = new Set(allowed);
  return (unions.get(name)?.values ?? []).filter((value) => !legal.has(value));
};

const glossary = () => readFileSync(new URL("docs/GLOSSARY.md", root), "utf8");

/**
 * The components that take the theme's `Tone` (`docs/specs/api-unify.md` §4.3 R9): one type, one
 * writing on a prop, a value or a function read where the control draws (`Tone | (() => Tone)`).
 * A look's option keeps `Live<Tone | undefined>` (§4.4), and `otp-input` reads a verdict that may
 * be absent, so its function form may return `undefined` too.
 */
const TONE_WRITERS = ["badge", "meter", "stat", "status", "progress", "diff-view"];

/** The three ways a `tone` is written: a props', a look option's, and `otp-input`'s. */
const TONE_WRITINGS = [
  "tone?: Tone | (() => Tone);",
  "tone?: Live<Tone | undefined>;",
  "tone?: Tone | (() => Tone | undefined);",
];

/** The `tone` members a module declares, trimmed. */
const tonePropsOf = (file: string) =>
  readFileSync(new URL(file, root), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("tone?:"));

describe("the API's vocabulary", () => {
  const checked = (suffix: string) => [...unions.keys()].filter((name) => name.endsWith(suffix));

  test("a component declares the axis it takes", () => {
    expect(unions.size).toBeGreaterThan(0);
    expect(checked("Variant").length).toBeGreaterThan(0);
    expect(checked("Size").length).toBeGreaterThan(0);
  });

  test("every variant is one of shadcn's, or one this library names", () => {
    const allowed = [...VARIANTS, ...Object.keys(OWN_VARIANTS)];
    expect(
      checked("Variant").flatMap((name) => stray(name, allowed).map((v) => `${name}: ${v}`)),
    ).toEqual([]);
  });

  test("every size is one of the scale's, or an icon-only one", () => {
    expect(
      checked("Size").flatMap((name) => stray(name, SIZES).map((v) => `${name}: ${v}`)),
    ).toEqual([]);
  });

  test("every size has a value, and the middle of the scale is `default`", () => {
    for (const name of checked("Size")) {
      expect(unions.get(name)!.values, name).toContain("default");
    }
  });

  test("an own variant is a word the glossary names", () => {
    for (const [value, page] of Object.entries(OWN_VARIANTS)) {
      expect(glossary(), `${value}, on ${page}`).toContain(value);
    }
  });

  test("every component's `tone` is `Tone | (() => Tone)`, read where the control draws", () => {
    for (const id of TONE_WRITERS) {
      expect(tonePropsOf(`packages/ui/${id}.tsx`), id).toContain("tone?: Tone | (() => Tone);");
    }
  });

  test("no `tone` is written any other way", () => {
    const lines = files.flatMap((file) => tonePropsOf(file).map((line) => `${file}: ${line}`));
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      expect(
        TONE_WRITINGS.some((writing) => line.endsWith(writing)),
        line,
      ).toBe(true);
    }
  });
});
