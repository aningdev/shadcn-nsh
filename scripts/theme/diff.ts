/**
 * What a theme change does to the values the themes resolve to: every colour role and every finish
 * field of every theme, in light and in dark, resolved through its aliases (`var(--x)`, `{x}`,
 * `oklch(from {x} l c h / a)`) and compared between `<ref>` and the working tree.
 *
 *   bun scripts/theme/diff.ts [<ref>] [--same] [--gate [--freeze]] [--json]
 *
 * The base is the merge base of `<ref>` (`origin/main` by default) and `HEAD`, as `--changed`
 * reads it (`scripts/port/affected.ts`), so a branch behind `main` does not report `main`'s
 * newer themes as its own. It prints, per theme and appearance, the keys removed, added and
 * changed, each classified: a `colour` (a colour role, or a finish field that paints one), a
 * `value` (a dimension, a type ramp, a shadow, a material, a state, a motion, an opacity) or a
 * `contract` (a key added or removed, or a source outside the theme values that moves every theme:
 * the base tokens, the reader, the build). For each removed colour role, the keys (roles or finish
 * fields) that resolve to the same value wherever it existed: where its readers can go without a
 * visible change.
 *
 * `--json` prints the same classification as machine-readable JSON, which `affected.ts` narrows
 * the render checks with. `--same` makes it a gate for a refactor that must not change a pixel: it
 * exits 1 when any key that exists on both sides resolves to a different value. Removed and added
 * keys pass: whether the components read the new key is `port:render:theme --against`'s question.
 *
 * `--gate` is the freeze's gate (docs/decisions/0004-theme-contract-freeze.md): the contract is
 * closed, so a change that adds or removes a key, or moves a source outside the values, is a
 * breaking change and fails unless the same branch adds a `docs/decisions/` record. A look the
 * contract cannot express is a value inside it plus a row in `docs/specs/native-themes.md`.
 * `--freeze` is the door for the four changes 0004 itself authorizes (#340, #293 P6, #357,
 * #358): CI passes it for a pull request labeled `theme-contract-freeze`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { colourFields } from "./finish-colour";
import { BUILD_ROOT_THEME, tokenKind } from "./tokens";

type Json = Record<string, unknown>;
export type Mode = "light" | "dark";
export const modes: Mode[] = ["light", "dark"];
/** One theme in one appearance: `color.<role>` and `<group>.<path>` to the value it resolves to. */
export type Flat = Map<string, string>;

/** What a changed key costs the render checks. */
export type ChangeKind = "colour" | "value" | "contract";
export type KeyChange = { key: string; kind: ChangeKind; before?: string; after?: string };
export type ThemeChange = {
  id: string;
  /** Every kind seen in this theme, either appearance. */
  kinds: ChangeKind[];
  modes: Record<Mode, KeyChange[]>;
};
/** A changed source outside the theme values that moves every theme. */
export type ContractSource = { file: string; why: string };
export type ThemeDiff = {
  ref: string;
  base: string;
  files: string[];
  contract: ContractSource[];
  themes: Record<string, ThemeChange>;
};

const themesDir = "packages/theme/themes";

const git = (...argv: string[]) => spawnSync("git", argv, { cwd: repo, encoding: "utf8" });

/** The merge base of `<ref>` and `HEAD`, or an error naming which side is missing. */
function mergeBase(ref: string): string {
  const valid = git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
  if (valid.status !== 0) throw new Error(`no such ref: ${ref}`);
  const base = git("merge-base", ref, "HEAD");
  if (base.status !== 0) {
    throw new Error(`no merge base with ${ref}: ${base.stderr.trim()}`);
  }
  return base.stdout.trim();
}

/** The files changed since `<ref>`'s merge base, repo-relative: committed, uncommitted, new. */
export function changedFiles(ref: string, base = mergeBase(ref)): string[] {
  const files = [
    ...git("diff", "--name-only", base).stdout.split("\n"),
    ...git("ls-files", "--others", "--exclude-standard").stdout.split("\n"),
  ]
    .map((file) => file.trim())
    .filter(Boolean);
  return [...new Set(files)].sort();
}

/**
 * Why a changed file is the theme contract: a source outside the compiled values that moves every
 * theme. A compiled value's file name says nothing — one theme file holds colours and dimensions —
 * so those are classified key by key below.
 */
function contractWhy(file: string): string | undefined {
  if (file.startsWith("packages/theme/tokens/base/"))
    return "the base tokens every theme builds from";
  if (/^packages\/theme\/[^/]+\.tsx?$/.test(file)) return "the theme package's code";
  if (file === "scripts/theme/material.ts") return "the material allow-lists";
  if (file.startsWith("scripts/tokens/")) return "the token build";
  if (file === "scripts/theme/dtcg.ts" || file === "scripts/theme/tokens.ts")
    return "the token compiler";
  return undefined;
}

/** The changed files that are the theme contract, each with why. */
export function contractSources(files: string[]): ContractSource[] {
  return files.flatMap((file) => {
    const why = contractWhy(file);
    return why ? [{ file, why }] : [];
  });
}

/** Something the freeze gates: a key added or removed, or a shared source that moved. */
export type ContractMove = { where: string; what: string };

/** Everything this branch moves in the contract, as the gate lists it. */
export function contractMoves(diff: ThemeDiff): ContractMove[] {
  const moves: ContractMove[] = diff.contract.map(({ file, why }) => ({ where: file, what: why }));
  for (const theme of Object.values(diff.themes)) {
    for (const mode of modes) {
      for (const change of theme.modes[mode]) {
        if (change.kind !== "contract") continue;
        moves.push({
          where: `${theme.id} ${mode}`,
          what: `${change.after === undefined ? "-" : "+"} ${change.key}`,
        });
      }
    }
  }
  return moves;
}

/** The decision records among the files a branch adds: `docs/decisions/<NNNN>-<slug>.md`. */
export function decisionRecords(added: string[]): string[] {
  return added.filter((file) => /^docs\/decisions\/\d{4}-[^/]+\.md$/.test(file));
}

/** Whether the branch may move the contract: it did not, or it recorded why. */
export function gateVerdict(
  diff: ThemeDiff,
  added: string[],
): { passed: boolean; moves: ContractMove[]; records: string[] } {
  const moves = contractMoves(diff);
  const records = decisionRecords(added);
  return { passed: moves.length === 0 || records.length > 0, moves, records };
}

/** The files `<base>...HEAD` adds, plus the ones the working tree has not committed yet. */
function addedFiles(base: string): string[] {
  return [
    ...git("diff", "--name-only", "--diff-filter=A", `${base}...HEAD`).stdout.split("\n"),
    ...git("ls-files", "--others", "--exclude-standard").stdout.split("\n"),
  ]
    .map((file) => file.trim())
    .filter(Boolean);
}

const baseFiles = new Map<string, Json | undefined>();
const treeFiles = new Map<string, Json | undefined>();

/** A theme file at the base, or undefined when it did not exist there. */
function atBase(base: string, file: string): Json | undefined {
  const key = `${base}:${file}`;
  if (baseFiles.has(key)) return baseFiles.get(key);
  const shown = git("show", `${base}:${file}`);
  const value = shown.status === 0 ? (JSON.parse(shown.stdout) as Json) : undefined;
  baseFiles.set(key, value);
  return value;
}

function inTree(file: string): Json | undefined {
  if (treeFiles.has(file)) return treeFiles.get(file);
  const full = path.join(repo, file);
  const value = fs.existsSync(full)
    ? (JSON.parse(fs.readFileSync(full, "utf8")) as Json)
    : undefined;
  treeFiles.set(file, value);
  return value;
}

function themeIds(base: string): string[] {
  const now = fs.readdirSync(path.join(repo, themesDir));
  const then = git("ls-tree", "--name-only", `${base}:${themesDir}`).stdout.split("\n");
  return [...new Set([...now, ...then])].filter(Boolean).sort();
}

/** Every leaf of a JSON value, keyed by its dotted path; arrays and nulls are leaves. */
function leaves(value: unknown, prefix: string, out: [string, unknown][]) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) leaves(child, `${prefix}.${key}`, out);
  } else out.push([prefix, value]);
}

/** One theme in one appearance, with every alias resolved to the value it draws. */
export function flatten(theme: Json | undefined, semantics: Json | undefined, mode: Mode): Flat {
  const flat: Flat = new Map();
  if (!theme) return flat;
  const css = (theme.cssVars ?? {}) as Record<string, Record<string, string>>;
  const vars: Record<string, string> = { ...css.theme, ...css[mode] };
  const resolve = (value: string, depth = 0): string =>
    depth > 8
      ? value
      : value
          .replace(/var\(--([a-z0-9-]+)\)/g, (whole, name: string) =>
            name in vars ? resolve(vars[name]!, depth + 1) : whole,
          )
          .replace(
            /oklch\(from \{([a-z0-9-]+)\} l c h \/ ([\d.]+)\)/g,
            (whole, name: string, a: string) =>
              name in vars ? `alpha(${resolve(vars[name]!, depth + 1)}, ${a})` : whole,
          )
          .replace(/\{([a-z0-9-]+)\}/g, (whole, name: string) =>
            name in vars ? resolve(vars[name]!, depth + 1) : whole,
          );
  for (const [name, value] of Object.entries(vars)) flat.set(`color.${name}`, resolve(value));
  if (!semantics) return flat;
  const { finishes, ...groups } = semantics as { finishes?: Record<string, Json> } & Json;
  const shared = (finishes?.shared ?? {}) as Record<string, Json>;
  const sparse = (finishes?.[mode] ?? {}) as Record<string, Json>;
  for (const role of new Set([...Object.keys(shared), ...Object.keys(sparse)])) {
    const out: [string, unknown][] = [];
    leaves({ ...shared[role], ...sparse[role] }, `finish.${role}`, out);
    for (const [key, value] of out)
      flat.set(key, typeof value === "string" ? resolve(value) : JSON.stringify(value));
  }
  const out: [string, unknown][] = [];
  for (const [group, value] of Object.entries(groups)) leaves(value, group, out);
  for (const [key, value] of out)
    flat.set(key, typeof value === "string" ? resolve(value) : JSON.stringify(value));
  return flat;
}

/**
 * Whether a key that exists on both sides is a colour or another value. The file it came from
 * says nothing: `color.<name>` is a colour role unless it is one of the theme's dimension
 * tokens (they share the `color.` prefix the diff gives every CSS variable), and a finish field is
 * a colour only when it paints one (`finish-colour.ts`).
 */
export function keyKind(key: string, theme: Json | undefined): "colour" | "value" {
  if (key.startsWith("color.")) {
    const name = key.slice("color.".length);
    const vars = (theme?.cssVars as { theme?: Record<string, string> } | undefined)?.theme;
    const raw = vars?.[name];
    if (raw !== undefined) return tokenKind(name, raw) === "color" ? "colour" : "value";
    return "colour";
  }
  if (key.startsWith("finish.")) {
    const field = key.slice(key.lastIndexOf(".") + 1);
    return (colourFields as readonly string[]).includes(field) ? "colour" : "value";
  }
  return "value";
}

/** Every key that differs, each with its kind: a key on one side alone is the contract. */
export function classifyChanges(before: Flat, after: Flat, theme: Json | undefined): KeyChange[] {
  const changes: KeyChange[] = [];
  for (const [key, value] of before) {
    if (!after.has(key)) changes.push({ key, kind: "contract", before: value });
    else if (after.get(key) !== value) {
      changes.push({ key, kind: keyKind(key, theme), before: value, after: after.get(key) });
    }
  }
  for (const [key, value] of after) {
    if (!before.has(key)) changes.push({ key, kind: "contract", after: value });
  }
  return changes;
}

/** A theme's compiled files: always its own, and for the build root also the pair it copies. */
function pairsFor(id: string): { themeFile: string; semanticsFile: string }[] {
  const dir = `${themesDir}/${id}`;
  const pairs = [{ themeFile: `${dir}/theme.json`, semanticsFile: `${dir}/semantics.json` }];
  if (id === BUILD_ROOT_THEME) {
    pairs.push({
      themeFile: "packages/theme/theme.json",
      semanticsFile: "packages/theme/semantics.json",
    });
  }
  return pairs;
}

type Side = { before: Flat; after: Flat };

/** The diff and the resolved sides it was read from, so one pass answers both. */
function evaluate(ref: string): { diff: ThemeDiff; sides: Map<string, Side> } {
  const base = mergeBase(ref);
  const files = changedFiles(ref, base);
  const contract = contractSources(files);
  const sides = new Map<string, Side>();
  const themes: Record<string, ThemeChange> = {};
  for (const id of themeIds(base)) {
    const changes: Record<Mode, KeyChange[]> = { light: [], dark: [] };
    for (const mode of modes) {
      const byKey = new Map<string, KeyChange>();
      for (const { themeFile, semanticsFile } of pairsFor(id)) {
        const beforeTheme = atBase(base, themeFile);
        const afterTheme = inTree(themeFile);
        const before = flatten(beforeTheme, atBase(base, semanticsFile), mode);
        const after = flatten(afterTheme, inTree(semanticsFile), mode);
        const where = `${id} ${mode}`;
        let side = sides.get(where);
        if (!side) sides.set(where, (side = { before: new Map(), after: new Map() }));
        for (const [key, value] of before) if (!side.before.has(key)) side.before.set(key, value);
        for (const [key, value] of after) if (!side.after.has(key)) side.after.set(key, value);
        for (const change of classifyChanges(before, after, afterTheme ?? beforeTheme)) {
          // A changed source outside the values (the base tokens, the reader, the build) moves
          // every theme: what it produces is contract, even when a key exists on both sides.
          const kind: ChangeKind = contract.length > 0 ? "contract" : change.kind;
          const seen = byKey.get(change.key);
          if (!seen || kind === "contract") byKey.set(change.key, { ...change, kind });
        }
      }
      changes[mode] = [...byKey.values()];
    }
    const kinds = [
      ...new Set([...changes.light, ...changes.dark].map((change) => change.kind)),
    ].sort() as ChangeKind[];
    themes[id] = { id, kinds, modes: changes };
  }
  return { diff: { ref, base, files, contract, themes }, sides };
}

/** The classification `--changed` narrows with. */
export function classifyDiff(ref = "origin/main"): ThemeDiff {
  return evaluate(ref).diff;
}

function report(diff: ThemeDiff, sides: Map<string, Side>, same: boolean) {
  let changed = 0;
  let contracted = 0;
  const removedRoles = new Set<string>();
  for (const theme of Object.values(diff.themes)) {
    for (const mode of modes) {
      const lines: string[] = [];
      for (const change of theme.modes[mode]) {
        if (change.after === undefined) {
          lines.push(`  - ${change.key}  ${change.before}  (${change.kind})`);
          contracted += 1;
          if (change.key.startsWith("color.")) removedRoles.add(change.key);
        } else if (change.before === undefined) {
          lines.push(`  + ${change.key}  ${change.after}  (${change.kind})`);
          contracted += 1;
        } else {
          lines.push(`  ~ ${change.key}  ${change.before} → ${change.after}  (${change.kind})`);
          changed += 1;
        }
      }
      if (lines.length > 0) console.log(`${theme.id} ${mode}\n${lines.join("\n")}`);
    }
  }

  // Where a removed role's readers can go: the keys equal to it wherever it existed.
  for (const role of removedRoles) {
    let candidates: Set<string> | undefined;
    for (const { before, after } of sides.values()) {
      const value = before.get(role);
      if (value === undefined) continue;
      const equal = [...after].filter(([, v]) => v === value).map(([key]) => key);
      candidates = candidates
        ? new Set(equal.filter((key) => candidates!.has(key)))
        : new Set(equal);
    }
    const list = [...(candidates ?? [])].join(", ") || "none";
    console.log(`${role} removed; equal in every theme and appearance: ${list}`);
  }

  const kindSummary = (["colour", "value", "contract"] as ChangeKind[])
    .map((kind) => {
      const count = Object.values(diff.themes).reduce(
        (sum, theme) =>
          sum +
          modes.reduce(
            (n, mode) => n + theme.modes[mode].filter((change) => change.kind === kind).length,
            0,
          ),
        0,
      );
      return `${count} ${kind}`;
    })
    .join(", ");
  console.log(
    `theme:diff against ${diff.ref} (${diff.base.slice(0, 8)}): ${changed} value${changed === 1 ? "" : "s"} changed, ${contracted} key${contracted === 1 ? "" : "s"} added or removed (${kindSummary})`,
  );
  if (diff.contract.length > 0) {
    for (const source of diff.contract) {
      console.log(`theme:diff: ${source.file}: ${source.why}`);
    }
  }
  if (same && changed > 0) process.exit(1);
}

/** The freeze's gate: a contract move without a decision record fails, saying why and what to do. */
function gate(diff: ThemeDiff, json: boolean, freeze: boolean) {
  const say = json ? console.error : console.log;
  const { passed, moves, records } = gateVerdict(diff, addedFiles(diff.base));
  if (moves.length === 0) {
    say("theme:diff --gate: no contract change");
    return;
  }
  if (passed) {
    say(
      `theme:diff --gate: ${moves.length} contract change${moves.length === 1 ? "" : "s"} recorded in ${records.join(", ")}`,
    );
    return;
  }
  if (freeze) {
    say(
      `theme:diff --gate: ${moves.length} contract change${moves.length === 1 ? "" : "s"} under --freeze, which docs/decisions/0004-theme-contract-freeze.md authorizes`,
    );
    return;
  }
  console.error(
    "theme:diff --gate: this branch moves the theme contract and adds no decision record.",
  );
  for (const move of moves) console.error(`  ${move.where}: ${move.what}`);
  console.error(
    [
      "The contract is frozen between versions (docs/decisions/0004-theme-contract-freeze.md).",
      "A look it cannot express is a value inside it plus a row in docs/specs/native-themes.md's",
      "difference table, not a new key, layer or field. To change the contract, add",
      "docs/decisions/<NNNN>-<slug>.md saying why in this same pull request; it is a breaking",
      "change, and the maintainer writes CHANGELOG.md.",
    ].join(" "),
  );
  process.exit(1);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const same = args.includes("--same");
  const gated = args.includes("--gate");
  const freeze = args.includes("--freeze");
  const json = args.includes("--json");
  const ref = args.find((arg) => !arg.startsWith("--")) ?? "origin/main";
  let result: { diff: ThemeDiff; sides: Map<string, Side> };
  try {
    result = evaluate(ref);
  } catch (error) {
    console.error(`theme:diff: ${(error as Error).message}`);
    process.exit(1);
  }
  if (json) console.log(JSON.stringify(result.diff, null, 2));
  else report(result.diff, result.sides, same);
  if (gated) gate(result.diff, json, freeze);
}
