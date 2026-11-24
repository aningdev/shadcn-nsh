/**
 * The theme's shape, checked. Two stages:
 * 1. Source stage (for themes with a DTCG 2025.10 source under `packages/theme/tokens/`): official
 *    Format & Resolver schemas, no dangling/circular aliases, reference `$type`s, `$extensions`
 *    namespace `dev.aning.shadcn-nsh` schemas, `colorOp` evaluation accuracy, and `$description`s.
 * 2. Compiled stage (for all themes): one set of tokens and one set of semantics in every theme,
 *    each finish role resolving to the fields `packages/theme/finish-fields.ts` gives it (and to no
 *    others), every `{token}` naming a token of the right DTCG `$type`, no literal where a token
 *    exists, and nothing left unread by the code.
 *
 *   bun scripts/theme-lint.ts
 *
 * Run by `bun run check`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { finishFields, type FinishRole } from "../packages/theme/finish-fields";
import { colourSources, scaleCitationsOf } from "./theme/extensions";
import { colourFields, readColour } from "./theme/finish-colour";
import { checkMaterial, checkMaterialFill } from "./theme/material";
import { checkRecipeNumbers, lookNumbers } from "./theme/recipe-numbers";
import {
  specBlock,
  specControlDimensions,
  specEnums,
  specParts,
  specRecipes,
  specRows,
} from "./theme/spec";
import {
  checkScales,
  checkStyle,
  checkTiers,
  controlDimensionValues,
  keyMatches,
  leaves,
  styleOf,
  whitelists,
} from "./theme/style";
import {
  BUILD_ROOT_THEME,
  findTokenRefs,
  mergeFinishes,
  tokenKinds,
  type SplitFinishes,
  type ThemeCssVars,
} from "./theme/tokens";
import { checkWhitelist, type WhitelistSemantics } from "./theme/whitelist";
import { lintDtcgSources } from "./tokens/lint";
import { isRecord } from "./tokens/types";

const root = join(import.meta.dir, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const readJson = <T>(path: string): T => JSON.parse(read(path)) as T;

/** The theme data a theme carries: colours in light and dark, and the values both appearances share. */
interface ThemeFile {
  cssVars: ThemeCssVars;
}

/** One surface of the material: its fill, the gradient over it, its shadow and its edge. */
interface Finish {
  [key: string]: unknown;
  background?: string;
  gradient?: string;
  shadow?: string;
  foreground?: string;
  "border-color"?: string;
  "border-top-color"?: string;
  "border-bottom-color"?: string;
  "pressed-background"?: string;
  "pressed-foreground"?: string;
  "pressed-opacity"?: number;
  "checked-background"?: string;
  "checked-border-color"?: string;
  "checked-gradient"?: string;
  backdropFilter?: string;
  material?: unknown;
}

interface SemanticsFile {
  finishes: SplitFinishes<Finish>;
}

/** The two appearances a theme states. */
const appearances = ["light", "dark"] as const;

/** A clear value: unset (`null` included: the base set's neutrals), `transparent`, or a gradient
 * that is transparent at every stop. */
const clear = (value: string | null | undefined) =>
  value === undefined ||
  value === null ||
  value === "transparent" ||
  (value.startsWith("linear-gradient(") &&
    value
      .slice(value.indexOf(",") + 1, -1)
      .split(",")
      .every((stop) => stop.trim().startsWith("transparent")));

/** Whether a finish paints a fill: its colour or its gradient shows. */
const paints = (finish: Finish) => !clear(finish.background) || !clear(finish.gradient);

/** The themes: every folder under `themes/` except `native` (a platform chooser, not a theme). */
const themes = readdirSync(join(root, "packages/theme/themes"))
  .filter((name) => statSync(join(root, "packages/theme/themes", name)).isDirectory())
  .filter((name) => name !== "native")
  .sort();

const spec = read("docs/specs/theme-roles.md");
/** What the spec names: the A and C layers, and every finish's row. */
const specPartsOf = specParts(spec);

const failures: string[] = [];
const fail = (message: string) => failures.push(message);

// 0a. The spec's per-role field table is `finishFields`, written out: one source, two readers.
{
  const stated = new Map(
    specRows(specBlock(spec, "finish-fields")).map(([role, fields]) => [
      role,
      (fields ?? "").split(/\s+/).filter((field) => field !== ""),
    ]),
  );
  for (const role of Object.keys(finishFields) as FinishRole[]) {
    const want: string[] = [...finishFields[role]];
    const have = stated.get(role);
    const name = "docs/specs/theme-roles.md: the finish-fields table";
    if (have === undefined) {
      fail(`${name} states no \`${role}\` (packages/theme/finish-fields.ts lists it)`);
      continue;
    }
    const missing = want.filter((field) => !have.includes(field));
    const extra = have.filter((field) => !want.includes(field));
    if (missing.length > 0) {
      fail(`${name} gives \`${role}\` no ${missing.map((field) => `\`${field}\``).join(", ")}`);
    }
    if (extra.length > 0) {
      fail(
        `${name} gives \`${role}\` ${extra.map((field) => `\`${field}\``).join(", ")}, which it does not have`,
      );
    }
  }
  for (const role of stated.keys()) {
    if (!(role in finishFields)) {
      fail(
        `docs/specs/theme-roles.md: the finish-fields table states \`${role}\`, which is not a finish role`,
      );
    }
  }
}

// 0. Source stage: DTCG 2025.10 schemas, alias resolution, reference types, and extensions.
const dtcg = lintDtcgSources(root);
for (const problem of dtcg.problems) fail(problem);

/** The colours a finish may still write out: theme, appearance and the literal itself. */
const pending = new Set(
  specRows(specBlock(spec, "pending")).map(
    ([theme, appearance, value]) => `${theme} ${appearance} ${value}`,
  ),
);

/** The pending rows a finish really writes: a row no theme writes any more has been decided. */
const written = new Set<string>();

/** What the library writes but does not read: finish roles and tokens, by name. */
const unread = new Set(
  [...specBlock(spec, "unread").matchAll(/`([A-Za-z0-9-]+)`/g)].map((match) => match[1]),
);

/** The shadcn slots NSH itself resolves (`references/nsh/crates/nsh-base/src/theme.rs`). */
function shadcnSlots(): string[] {
  const rust = read("references/nsh/crates/nsh-base/src/theme.rs");
  const start = rust.indexOf("theme! {");
  const end = rust.indexOf("\n}", start);
  if (start === -1 || end === -1) throw new Error("theme.rs states no `theme! {` block");
  return [...rust.slice(start, end).matchAll(/^\s*\w+ = "([A-Za-z0-9-]+)",$/gm)].map((m) => m[1]);
}

/** Every file under `dir`, by extension. */
function files(dir: string, extensions: string[]): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return files(path, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
}

/** The code that reads a theme: the components and the demos. */
const code = [
  ...files("packages/ui", [".ts", ".tsx"]),
  ...files("apps/website/demos", [".ts", ".tsx"]),
]
  .map((path) => read(path))
  .join("\n");

/** The theme module, where a token's name is written once and mapped to its role. */
const themeModule = read("packages/theme/theme.ts");

/** The default semantics file, where `{token}` references name base tokens. */
const semanticsRaw = read("packages/theme/semantics.json");

const escape = (text: string) => text.replace(/[\\.+*?^$()|[\]{}]/g, "\\$&");

/** Whether the code or semantics reads a token, through `token()`, `{name}`, a class, or `theme.ts`. */
function readsToken(name: string): boolean {
  const literal = escape(name);
  return (
    [
      new RegExp(`token\\(\\s*["'\`]${literal}["'\`]`),
      new RegExp(`var\\(--${literal}\\)`),
      // A class naming the token as a custom property: `rounded-(--radius-control)`.
      new RegExp(`\\(--${literal}\\)`),
      new RegExp(
        `\\b(?:bg|text|border|ring|fill|stroke|outline|decoration|caret|accent|shadow|from|via|to|divide|placeholder)-${literal}(?![a-z0-9-])`,
      ),
    ].some((pattern) => pattern.test(code)) ||
    new RegExp(`["'\`]${literal}["'\`]`).test(themeModule) ||
    new RegExp(`\\{${literal}\\}`).test(semanticsRaw)
  );
}

/** Whether the code reads a finish role, through `finish.<role>` or `finish["<role>"]`. */
function readsRole(role: string): boolean {
  const literal = escape(role);
  return [new RegExp(`finish[?.\\[]\\s*["'\`]?${literal}(?![a-z0-9-])`)].some((pattern) =>
    pattern.test(code),
  );
}

// 1. The build-root theme is the one under `themes/<build root>/`, byte for byte.
for (const name of ["theme.json", "semantics.json"]) {
  const shipped = read(`packages/theme/${name}`);
  const copy = read(`packages/theme/themes/${BUILD_ROOT_THEME}/${name}`);
  if (shipped !== copy)
    fail(
      `packages/theme/themes/${BUILD_ROOT_THEME}/${name} is not packages/theme/${name}: cp packages/theme/${name} over it`,
    );
}

// 2. Every theme states the same tokens, in light and dark, and every shadcn slot among them.
const slots = shadcnSlots();
if (slots.length !== 31) fail(`theme.rs states ${slots.length} shadcn slots, not 31`);

for (const name of slots)
  if (!specPartsOf.slots.includes(name))
    fail(`docs/specs/theme-roles.md: the A layer states no \`${name}\`, a slot NSH resolves`);
for (const name of specPartsOf.slots)
  if (!slots.includes(name))
    fail(`docs/specs/theme-roles.md: the A layer states \`${name}\`, which is no slot of theme.rs`);

const tokensOf = new Map<string, ThemeFile>();
for (const theme of themes) {
  const path = `packages/theme/themes/${theme}/theme.json`;
  const file = readJson<ThemeFile>(path);
  tokensOf.set(theme, file);
  const light = new Set(Object.keys(file.cssVars.light));
  const dark = new Set(Object.keys(file.cssVars.dark));
  for (const name of light) if (!dark.has(name)) fail(`${path}: \`${name}\` is in light, not dark`);
  for (const name of dark) if (!light.has(name)) fail(`${path}: \`${name}\` is in dark, not light`);
  for (const name of slots)
    if (!light.has(name))
      fail(`${path}: light states no \`${name}\`, a slot NSH resolves (theme.rs)`);
  for (const name of slots)
    if (!dark.has(name))
      fail(`${path}: dark states no \`${name}\`, a slot NSH resolves (theme.rs)`);
}

const [first, ...rest] = themes;
const names = Object.keys(tokensOf.get(first)?.cssVars.light ?? {}).sort();
for (const theme of rest) {
  const path = `packages/theme/themes/${theme}/theme.json`;
  const other = new Set(Object.keys(tokensOf.get(theme)?.cssVars.light ?? {}));
  for (const name of names)
    if (!other.has(name)) fail(`${path}: no token \`${name}\`, which ${first} states`);
  for (const name of other)
    if (!names.includes(name)) fail(`${path}: token \`${name}\`, which ${first} does not state`);
}

// 3. Every theme states the same merged finish roles, each with the same fields in all of them.
const defaultSemantics = readJson<SemanticsFile>("packages/theme/semantics.json");
const defaultMerged = {
  light: mergeFinishes(defaultSemantics.finishes, "light"),
  dark: mergeFinishes(defaultSemantics.finishes, "dark"),
};
const defaultRoles = Object.keys(defaultMerged.light).sort();

for (const role of defaultRoles)
  if (!specPartsOf.finishes.some((finish) => finish.role === role))
    fail(`docs/specs/theme-roles.md: states no finish \`${role}\`, which semantics.json has`);
for (const { role } of specPartsOf.finishes)
  if (!defaultRoles.includes(role))
    fail(`docs/specs/theme-roles.md: states finish \`${role}\`, which semantics.json has not`);

// The C layer is `cssVars.theme` .
const sharedKeys = Object.keys(tokensOf.get(first)?.cssVars.theme ?? {});
for (const name of sharedKeys)
  if (!specPartsOf.shared.includes(name))
    fail(`docs/specs/theme-roles.md: the C layer states no \`${name}\`, which cssVars.theme has`);
for (const name of specPartsOf.shared)
  if (!sharedKeys.includes(name))
    fail(`docs/specs/theme-roles.md: the C layer states \`${name}\`, which cssVars.theme has not`);

// Every `radius*` token in `cssVars.theme` must be the exact 4-slot set and a non-negative `px` length.
const expectedRadiusTokens = ["radius", "radius-control", "radius-container", "radius-modal"];
for (const theme of themes) {
  const path = `packages/theme/themes/${theme}/theme.json`;
  const shared = tokensOf.get(theme)?.cssVars.theme ?? {};
  const radiusKeys = Object.keys(shared).filter((k) => k === "radius" || k.startsWith("radius-"));
  for (const req of expectedRadiusTokens) {
    if (!radiusKeys.includes(req)) fail(`${path}: missing \`${req}\``);
  }
  for (const [name, value] of Object.entries(shared)) {
    if (name !== "radius" && !name.startsWith("radius-")) continue;
    if (!expectedRadiusTokens.includes(name)) {
      fail(`${path}: unexpected radius token \`${name}\``);
      continue;
    }
    const match = value.match(/^(\d+(?:\.\d+)?)px$/);
    if (!match || !(Number(match[1]) >= 0))
      fail(`${path}: \`${name}\` is \`${value}\`, not a non-negative px length`);
  }
}

/** A finish role carries the fields `packages/theme/finish-fields.ts` gives it and no others: a
 * flat look has no gradient, an opaque one no backdrop blur and no material, a layer that never
 * floats above the page no elevation. The neutral of each field a role has is written once in
 * `tokens/base/style.shared.tokens.json`, so a theme that does not use it states nothing. */
/** Fields a finish states only where a theme differs from the unchecked value: a knob's checked state. */
const optionalFields = new Set(["checked-background", "checked-border-color", "checked-gradient"]);

for (const theme of themes) {
  const path = `packages/theme/themes/${theme}/semantics.json`;
  const file = readJson<SemanticsFile>(path);
  const theme_ = tokensOf.get(theme)!;
  const kinds = tokenKinds(theme_.cssVars);

  for (const appearance of appearances) {
    const merged = mergeFinishes(file.finishes, appearance);
    const roles = Object.keys(merged).sort();
    const wanted = Object.keys(defaultMerged[appearance]).sort();
    for (const role of wanted)
      if (!roles.includes(role))
        fail(
          `${path}: ${appearance} states no finish \`${role}\`, which the build-time theme does`,
        );
    for (const role of roles)
      if (!wanted.includes(role))
        fail(`${path}: ${appearance} states \`${role}\`, which the build-time theme does not`);

    for (const [role, finish] of Object.entries(merged)) {
      const fields: readonly string[] = finishFields[role as keyof typeof finishFields] ?? [];
      const have = Object.keys(finish).sort();
      for (const field of fields)
        if (!optionalFields.has(field) && !have.includes(field))
          fail(
            `${path}: ${role}.${field} is missing, and \`${role}\` has it (write its neutral in tokens/base/style.shared.tokens.json)`,
          );
      for (const field of have)
        if (!fields.includes(field))
          fail(
            `${path}: ${role}.${field} is not a field \`${role}\` has (packages/theme/finish-fields.ts lists them)`,
          );

      // A press dims the accent to a visible opacity, or not at all (1).
      const dim = finish["pressed-opacity"];
      if (dim !== undefined && (typeof dim !== "number" || dim <= 0 || dim > 1))
        fail(`${path}: ${role}.pressed-opacity is ${String(dim)}, not a number in (0, 1]`);

      const base = defaultMerged[appearance][role];
      if (base !== undefined && paints(finish) !== paints(base))
        fail(
          paints(base)
            ? `${path}: ${role} paints no fill (background and gradient both clear), and the build-time theme's does`
            : `${path}: ${role} paints a fill, and the build-time theme's is clear`,
        );

      // 4. A finish's colours are `{token}` references of DTCG `$type` `"color"`, ink, or pending;
      // `null` is the neutral state the base set writes (no pressed fill, no pressed ink).
      for (const field of colourFields) {
        const value = finish[field];
        if (value === undefined || value === null) continue;
        const verdict = readColour(value, kinds, pending, `${theme} ${appearance}`);
        for (const row of verdict.pending) written.add(row);
        for (const problem of verdict.problems)
          fail(
            problem.kind === "unknown-token"
              ? `${path}: ${role}.${field} names token \`${problem.name}\`, which ${theme} does not have`
              : problem.kind === "wrong-kind"
                ? `${path}: ${role}.${field} names token \`${problem.name}\`, which is a ${problem.actual}, not a ${problem.expected}`
                : `${path}: ${role}.${field} writes ${problem.literal}, which is no token of the theme, no ink, and not in the spec's pending table`,
          );
      }

      // The platform material: stated on every finish, one of the recipes, over a fill the recipe's
      // fallback can stand in for where the platform draws none.
      for (const problem of checkMaterial(
        path,
        `${role}.${appearance}`,
        finish,
        role as FinishRole,
      ))
        fail(problem);
      for (const problem of checkMaterialFill(path, `${role}.${appearance}`, finish)) fail(problem);

      // `shadow` is ink, except any `{token}` it names must exist and be a `"color"` token.
      for (const name of findTokenRefs(finish.shadow ?? "")) {
        const kind = kinds.get(name);
        if (kind === undefined)
          fail(`${path}: ${role}.shadow names token \`${name}\`, which ${theme} does not have`);
        else if (kind !== "color")
          fail(`${path}: ${role}.shadow names token \`${name}\`, which is a ${kind}, not a color`);
      }
      for (const [legacy] of (finish.shadow ?? "").matchAll(/var\(--[A-Za-z0-9-]+\)/g))
        fail(`${path}: ${role}.shadow writes ${legacy}; use \`{token}\` syntax`);
    }
  }
}

// 4b. Every theme states the same style (typography, dimension, shape, state, transition, motion,
// controls), with `{token}` references typed by DTCG `$type` and sizes on the scales — the values a
// theme's platform states itself being excused by the citations in its own `$extensions`.
for (const theme of themes) {
  const path = `packages/theme/themes/${theme}/semantics.json`;
  const file = readJson<Record<string, unknown>>(path);
  const kinds = tokenKinds(tokensOf.get(theme)!.cssVars);
  for (const problem of checkStyle(
    path,
    file,
    defaultSemantics as unknown as Record<string, unknown>,
    kinds,
  ))
    fail(problem);
  for (const problem of checkScales(path, file, scaleCitationsOf(theme))) fail(problem);
  // Both tiers are compiled, and they state the same keys: a theme writes tiers only where its
  // platform is input-specific, and one it leaves out comes from the base set.
  for (const problem of checkTiers(path, file)) fail(problem);
}

// 4c. The spec's tables are the one list of enumerated values: `style.ts` reads its whitelists from
// the enum table, so every listed key must appear in every theme; and each of the four control
// dimensions reads from every theme's `semantics.json` as the spec's control table says, the
// theme-to-column mapping coming from the table's own header.
const enumKeys = specEnums(spec).map((row) => row.key);
const styleKeys = [
  ...leaves(styleOf(defaultSemantics as unknown as Record<string, unknown>)).keys(),
];
for (const key of enumKeys)
  if (!styleKeys.some((styleKey) => keyMatches(key, styleKey)))
    fail(
      `docs/specs/theme-roles.md: the enum table lists \`${key}\`, which no theme's style states`,
    );
for (const key of Object.keys(whitelists))
  if (!enumKeys.includes(key))
    fail(`scripts/theme/style.ts: whitelist \`${key}\` is not in the spec's enum table`);

const controlRows = specControlDimensions(spec);
for (const key of Object.keys(controlDimensionValues))
  if (!controlRows.some((row) => row.dimension === key))
    fail(`docs/specs/theme-roles.md: the control table states no row for \`${key}\``);
for (const row of controlRows) {
  const values = controlDimensionValues[row.dimension as keyof typeof controlDimensionValues];
  if (values === undefined) {
    fail(
      `docs/specs/theme-roles.md: the control table names \`${row.dimension}\`, not one of the four control dimensions`,
    );
    continue;
  }
  for (const column of row.columns)
    if (!values.includes(column.value))
      fail(
        `docs/specs/theme-roles.md: \`${row.dimension}\` takes \`${column.value}\`, not in the enum table`,
      );
  for (const theme of themes) {
    const column = row.columns.find((entry) => entry.themes.includes(theme));
    if (column === undefined) {
      fail(
        `docs/specs/theme-roles.md: the control table's header names no column for \`${theme}\``,
      );
      continue;
    }
    const path = `packages/theme/themes/${theme}/semantics.json`;
    const dimension = readJson<Record<string, unknown>>(path).dimension;
    const control = isRecord(dimension) && isRecord(dimension.control) ? dimension.control : {};
    const actual = control[row.dimension];
    if (actual !== column.value)
      fail(
        `${path}: dimension.control.${row.dimension} is ${JSON.stringify(actual)}, the spec states \`${column.value}\``,
      );
  }
}
for (const row of specRecipes(spec)) {
  const values = controlDimensionValues[row.dimension as keyof typeof controlDimensionValues];
  if (values === undefined)
    fail(
      `docs/specs/theme-roles.md: the recipe table names \`${row.dimension}\`, not one of the four control dimensions`,
    );
  else if (!values.includes(row.value as never))
    fail(
      `docs/specs/theme-roles.md: the recipe table measures \`${row.value}\`, which \`${row.dimension}\` does not take`,
    );
}
for (const problem of checkRecipeNumbers(specRecipes(spec), lookNumbers())) fail(problem);

// 5. Nothing in the files is written and never read.
// `radius` needs no reader of this library's: it is the A layer's base slot an app's own Tailwind
// utilities take (`rounded-lg`, `rounded-(--radius)`).
const platformTokens = new Set(["radius"]);
const shared = new Set(Object.keys(tokensOf.get(first)?.cssVars.theme ?? {}));
const shadcn = new Set(slots);
for (const name of names)
  if (
    !shadcn.has(name) &&
    !shared.has(name) &&
    !platformTokens.has(name) &&
    !readsToken(name) &&
    !unread.has(name)
  )
    fail(`packages/theme/theme.json: token \`${name}\` is read nowhere and not left to the app`);
for (const role of defaultRoles)
  if (!readsRole(role) && !unread.has(role))
    fail(
      `packages/theme/semantics.json: finish \`${role}\` is read nowhere and not left to the app`,
    );

const themeBlock = tokensOf.get(first)?.cssVars.theme ?? {};
for (const name of Object.keys(themeBlock)) {
  if (!platformTokens.has(name) && !readsToken(name) && !unread.has(name))
    fail(`packages/theme/theme.json: token \`${name}\` is read nowhere and not left to the app`);
}

// 5b. The scope of a theme's customization (ADR 0007, ADR 0012, ADR 0009): colour keys are sources
// and references, a reference that states a value rather than pointing at a source carries its
// provenance, the tints share one strength, the control dimensions are four, and no theme owns a
// font family or a type size.
for (const theme of themes) {
  const own = readJson<WhitelistSemantics>(`packages/theme/themes/${theme}/semantics.json`);
  for (const problem of checkWhitelist(
    `packages/theme/themes/${theme}`,
    tokensOf.get(theme)!,
    own,
    defaultSemantics as unknown as WhitelistSemantics,
    colourSources(theme),
  ))
    fail(problem);
}

// 6. The spec's pending table holds only colours its themes still write.
for (const entry of pending)
  if (!written.has(entry))
    fail(
      `docs/specs/theme-roles.md: the pending table lists ${entry}, which no theme writes any more`,
    );

// Report.
if (failures.length > 0) {
  for (const message of failures) console.error(`theme-lint: ${message}`);
  console.error(`theme-lint: ${failures.length} problem${failures.length === 1 ? "" : "s"}`);
  process.exit(1);
}

const count = new Map<string, number>();
for (const theme of themes) {
  const file = readJson<SemanticsFile>(`packages/theme/themes/${theme}/semantics.json`);
  for (const appearance of appearances)
    for (const finish of Object.values(mergeFinishes(file.finishes, appearance)))
      for (const field of colourFields)
        count.set(theme, (count.get(theme) ?? 0) + findTokenRefs(finish[field] ?? "").length);
}
console.log(
  `theme-lint: ${dtcg.themes.length} DTCG source (${dtcg.themes.join(", ")}, ${dtcg.tokenFiles} files) + ${themes.length} compiled themes × ${names.length} tokens, ${defaultRoles.length} finishes each — ok`,
);
for (const [theme, aliases] of count)
  console.log(`  ${theme}: ${aliases} colours named by a token`);
