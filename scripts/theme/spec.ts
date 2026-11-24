/**
 * `docs/specs/theme-roles.md` read as data: the layers of tokens it names and what each finish draws.
 *
 * The spec is the one list. `scripts/theme-lint.ts` holds the theme files to it — and it to
 * `references/nsh/crates/nsh-base/src/theme.rs`, whose slots it must name — and the docs site draws
 * its tables from it (`apps/website/src/lib/themes.ts`), the markdown read as text, so the page keeps
 * no second copy of a token or a finish. The spec marks those parts with `<!-- theme-lint: … -->`
 * blocks; this file is the reader both sides use.
 *
 * Pure: no `node:fs`, so the site can call it as it prerenders.
 */

/** A finish as the spec's table states it: its name, what it draws, and who reads it. */
export interface FinishRow {
  /** The name `semantics.json` spells it by: `knob`, `overlay`. */
  role: string;
  /** What it draws, in the spec's words. */
  draws: string;
  /** The same, in English: what the themes page shows (the page is in English). */
  drawsEn: string;
  /** Who reads it: the spec's cell, a dash when the library leaves it to the app. */
  reads: string;
}

/** What the spec says about the theme's shape. */
export interface SpecParts {
  /** The A layer: shadcn's slots, the names NSH resolves (`theme.rs`). */
  slots: string[];
  /** The C layer: the keys `cssVars.theme` states, the same in both appearances. */
  shared: string[];
  /** Every finish, in the spec's order. */
  finishes: FinishRow[];
}

/** The text between a pair of `theme-lint` markers: `<!-- theme-lint: name -->` … `<!-- /theme-lint: name -->`. */
export function specBlock(markdown: string, name: string): string {
  const open = `<!-- theme-lint: ${name} -->`;
  const close = `<!-- /theme-lint: ${name} -->`;
  const start = markdown.indexOf(open);
  const end = markdown.indexOf(close);
  if (start === -1 || end === -1) throw new Error(`the spec states no ${open} … ${close} block`);
  return markdown.slice(start + open.length, end);
}

/** A markdown table's body rows, cells trimmed and backticks stripped; the header row is dropped. */
export function specRows(text: string): string[][] {
  return specRowsRaw(text).map((cells) => cells.map((cell) => cell.replace(/`/g, "")));
}

/** A markdown table as written, backticks kept: the header row names what each column states. */
export function specTable(text: string): { header: string[]; rows: string[][] } {
  const table = text
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    )
    .filter((cells) => !cells.every((cell) => /^:?-+:?$/.test(cell)));
  const [header, ...rows] = table;
  if (header === undefined) throw new Error("a theme-lint block states no table");
  return { header, rows };
}

/** A markdown table's body rows as written, backticks kept: a cell names things in code spans. */
export function specRowsRaw(text: string): string[][] {
  return specTable(text).rows;
}

/** The names a cell writes in backticks, in order: `` `radius` / `radius-control` `` names two. */
const names = (cell: string): string[] => [...cell.matchAll(/`([a-zA-Z0-9-]+)`/g)].map((m) => m[1]);

/** The names a block writes in backticks, in order and once each. */
function backticked(text: string): string[] {
  return [...new Set([...text.matchAll(/`([a-zA-Z0-9-]+)`/g)].map((match) => match[1]))];
}

/** The spec's parts: the A and C layers, and every finish's row. */
export function specParts(markdown: string): SpecParts {
  const shared = specRowsRaw(specBlock(markdown, "tokens-c")).flatMap(([key]) => names(key));
  const finishes = specRowsRaw(specBlock(markdown, "finishes")).map(
    ([role, draws, drawsEn, reads]) => {
      if (role === undefined || draws === undefined || drawsEn === undefined || reads === undefined)
        throw new Error(`the spec's finish table writes a row with ${role ?? "no finish"}`);
      return { role: role.replace(/`/g, ""), draws, drawsEn, reads };
    },
  );
  return {
    slots: backticked(specBlock(markdown, "tokens-a")),
    shared,
    finishes,
  };
}

/** An enumerated value a theme may take: the style key and the values it allows, in the spec's order. */
export interface EnumRow {
  /** The style key the whitelist is under: `dimension.control.field`, `shape.curve`. */
  key: string;
  /** What it may be: `pill`, `underline`, `bar`. */
  values: string[];
}

/** The enums the spec registers (`<!-- theme-lint: enums -->`): the one list `style.ts` must match. */
export function specEnums(markdown: string): EnumRow[] {
  return specRowsRaw(specBlock(markdown, "enums")).map(([key, values]) => {
    if (key === undefined || values === undefined)
      throw new Error(`the spec's enum table writes a row with ${key ?? "no key"}`);
    return { key: key.replace(/`/g, ""), values: names(values) };
  });
}
