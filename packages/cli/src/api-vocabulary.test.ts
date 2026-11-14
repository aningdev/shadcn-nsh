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
 * `tile` is a radio drawn as a card (`Radio`; its union is batch 2's), `line` an underlined tab
 * track.
 */
const OWN_VARIANTS: Record<string, string> = { tile: "radio-group", line: "tabs" };

/** Every `size` value: the three of a scale, and the icon-only ones a shadcn button takes. */
const SIZES = ["sm", "default", "lg", "xs", "icon", "icon-xs", "icon-sm", "icon-lg"];

/**
 * Batch 2: the unions the first batch of the unification does not reach yet. A switch and a
 * segmented control are two-step in shadcn as well, so `sm` / `default` is what they will take.
 * They leave this list with that batch; an entry here that no longer exists is a failure, so the
 * next stray value cannot hide under a stale name.
 */
const BATCH_TWO: Record<string, string> = {
  SegmentedSize: "batch 2: `small` / `regular` → `sm` / `default`",
  SwitchSize: "batch 2: `small` / `regular` → `sm` / `default`",
};

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

describe("the API's vocabulary", () => {
  const checked = (suffix: string) =>
    [...unions.keys()].filter((name) => name.endsWith(suffix) && !BATCH_TWO[name]);

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

  test("the batch 2 unions are still there, so the list cannot hide a stray value", () => {
    for (const name of Object.keys(BATCH_TWO)) expect(unions.has(name), name).toBe(true);
  });
});
