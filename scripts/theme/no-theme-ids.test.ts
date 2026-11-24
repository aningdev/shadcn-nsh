/**
 * No script decides a rule by a theme's id.
 *
 * A theme differs from another by what it states (its tokens, its `$extensions`, its DTCG source),
 * never by a list of names in code: a rule that holds for `apple` and not for `winui` is a value the
 * theme writes, and a branch on the id would make a seventh theme need a code change. Stating an id
 * is fine — a generator names the theme it emits (`id: "apple",`), and paths are built from it — but
 * comparing one (`theme === "winui"`, `case "apple":`, `ids.includes("material")`) is not.
 *
 * `scripts/ui-rules/rules.ts` states the same rule for `packages/ui` (and `bun run check` runs it);
 * this one covers the scripts that compile and lint the themes, which `test:unit` runs.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");

/** Every theme's id, read from the source tree so a new theme is covered without this file changing. */
const THEME_IDS = readdirSync(join(root, "packages/theme/tokens/themes"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => entry.name !== "native")
  .map((entry) => entry.name);

/** The scripts this rule covers: everything that reads tokens or compiles them. */
const SOURCES = ["scripts/theme", "scripts/tokens", "scripts/theme-lint.ts"];

/** A line that compares, switches on, or asks a collection about a value. */
const COMPARISON = /(===|!==|==|!=|\bcase\b|\.includes\(|\.startsWith\(|\.endsWith\(|\bswitch\b)/;

/** The lines of `source` that branch on a theme's id, as `<line>: <text>`. */
export function themeIdBranches(source: string, ids: readonly string[]): string[] {
  const out: string[] = [];
  source.split("\n").forEach((line, index) => {
    if (!COMPARISON.test(line)) return;
    const named = ids.find((id) => line.includes(`"${id}"`) || line.includes(`'${id}'`));
    if (named !== undefined) out.push(`${index + 1}: ${line.trim()}`);
  });
  return out;
}

function filesUnder(target: string): string[] {
  if (target.endsWith(".ts")) return [target];
  return readdirSync(join(root, target), { withFileTypes: true }).flatMap((entry) => {
    const child = `${target}/${entry.name}`;
    if (entry.isDirectory()) return filesUnder(child);
    if (!entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) return [];
    return [child];
  });
}

describe("no script branches on a theme id", () => {
  test("every theme is a test subject, so a new one is covered", () => {
    expect(THEME_IDS.length).toBeGreaterThan(1);
    expect(THEME_IDS).toContain("nsh-gallery");
  });

  test("no compiler, linter or generator compares one", () => {
    const found = SOURCES.flatMap(filesUnder).flatMap((file) =>
      themeIdBranches(readFileSync(join(root, file), "utf8"), THEME_IDS).map(
        (line) => `${file}:${line}`,
      ),
    );
    expect(found).toEqual([]);
  });

  test("the detector sees one when there is one", () => {
    const source = [
      'if (theme === "winui") return;',
      'switch (id) { case "apple": break; }',
      'const glass = ids.includes("material");',
      "if (name !== 'shadcn') use(name);",
      'id: "apple",',
      "const file = `themes/${theme}/theme.json`;",
    ].join("\n");
    expect(themeIdBranches(source, THEME_IDS)).toEqual([
      '1: if (theme === "winui") return;',
      '2: switch (id) { case "apple": break; }',
      '3: const glass = ids.includes("material");',
      "4: if (name !== 'shadcn') use(name);",
    ]);
  });
});
