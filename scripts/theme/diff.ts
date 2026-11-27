/**
 * Compare Theme v5 compiled `theme.json` + TS `ThemeSpec` against `<ref>` (`origin/main` by default).
 *
 *   bun scripts/theme/diff.ts [<ref>] [--same] [--json]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { BUILD_ROOT_THEME, tokenKind } from "./tokens";

const repo = path.resolve(import.meta.dir, "../..");

type Json = Record<string, unknown>;
export type Mode = "light" | "dark";
export const modes: Mode[] = ["light", "dark"];
export type Flat = Map<string, string>;
export type ChangeKind = "colour" | "value" | "contract";
export type KeyChange = { key: string; kind: ChangeKind; before?: string; after?: string };
export type ThemeChange = { id: string; kinds: ChangeKind[]; modes: Record<Mode, KeyChange[]> };
export type ContractSource = { file: string; why: string };
export type ThemeDiff = {
  ref: string;
  base: string;
  files: string[];
  contract: ContractSource[];
  themes: Record<string, ThemeChange>;
};
export type ContractMove = { where: string; what: string };

const themesDir = "packages/theme/themes";
const git = (...argv: string[]) => spawnSync("git", argv, { cwd: repo, encoding: "utf8" });

function mergeBase(ref: string): string {
  const valid = git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
  if (valid.status !== 0) throw new Error(`no such ref: ${ref}`);
  const base = git("merge-base", ref, "HEAD");
  if (base.status !== 0) throw new Error(`no merge base with ${ref}: ${base.stderr.trim()}`);
  return base.stdout.trim();
}

export function changedFiles(ref: string, base = mergeBase(ref)): string[] {
  const files = [
    ...git("diff", "--name-only", base).stdout.split("\n"),
    ...git("ls-files", "--others", "--exclude-standard").stdout.split("\n"),
  ]
    .map((file) => file.trim())
    .filter(Boolean);
  return [...new Set(files)].sort();
}

function contractWhy(file: string): string | undefined {
  if (
    file === "packages/theme/schema.ts" ||
    file === "packages/theme/theme.ts" ||
    file === "packages/theme/materials.ts"
  ) {
    return "the theme package's contract or reader";
  }
  if (file === "packages/theme/themes/nsh-gallery/index.ts") {
    return "the base theme spec";
  }
  if (file.startsWith("scripts/tokens/")) return "the token exporter";
  if (file === "scripts/theme/tokens.ts") return "the token helper";
  return undefined;
}

export function contractSources(files: string[]): ContractSource[] {
  return files.flatMap((file) => {
    const why = contractWhy(file);
    return why ? [{ file, why }] : [];
  });
}

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

const baseFiles = new Map<string, Json | undefined>();
const treeFiles = new Map<string, Json | undefined>();

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
  const now = fs
    .readdirSync(path.join(repo, themesDir))
    .filter((name) => !name.endsWith(".ts") && name !== "native");
  const then = git("ls-tree", "--name-only", `${base}:${themesDir}`).stdout.split("\n");
  return [...new Set([...now, ...then])]
    .filter((n) => n && n !== "native" && !n.endsWith(".ts"))
    .sort();
}

function leaves(value: unknown, prefix: string, out: [string, unknown][]) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) leaves(child, `${prefix}.${key}`, out);
  } else out.push([prefix, value]);
}

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
          .replace(/\{([a-z0-9-]+)\}/g, (whole, name: string) =>
            name in vars ? resolve(vars[name]!, depth + 1) : whole,
          );
  for (const [name, value] of Object.entries(vars)) flat.set(`color.${name}`, resolve(value));
  if (semantics) {
    const out: [string, unknown][] = [];
    for (const [group, value] of Object.entries(semantics)) leaves(value, group, out);
    for (const [key, value] of out) {
      flat.set(key, typeof value === "string" ? resolve(value) : JSON.stringify(value));
    }
  }
  return flat;
}

export function keyKind(key: string, theme: Json | undefined): "colour" | "value" {
  if (key.startsWith("color.")) {
    const name = key.slice("color.".length);
    const vars = (theme?.cssVars as { theme?: Record<string, string> } | undefined)?.theme;
    const raw = vars?.[name];
    if (raw !== undefined) return tokenKind(raw) === "color" ? "colour" : "value";
    return "colour";
  }
  if (/\.background$|\.foreground$|\.border(?:Top|Bottom)?$/.test(key)) return "colour";
  return "value";
}

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

function filesFor(id: string): string[] {
  const files = [`${themesDir}/${id}/theme.json`];
  if (id === BUILD_ROOT_THEME) files.push("packages/theme/theme.json");
  return files;
}

function evaluate(ref: string): ThemeDiff {
  const base = mergeBase(ref);
  const files = changedFiles(ref, base);
  const contract = contractSources(files);
  const themes: Record<string, ThemeChange> = {};
  for (const id of themeIds(base)) {
    const changes: Record<Mode, KeyChange[]> = { light: [], dark: [] };
    for (const mode of modes) {
      const byKey = new Map<string, KeyChange>();
      for (const themeFile of filesFor(id)) {
        const beforeTheme = atBase(base, themeFile);
        const afterTheme = inTree(themeFile);
        const before = flatten(beforeTheme, undefined, mode);
        const after = flatten(afterTheme, undefined, mode);
        for (const change of classifyChanges(before, after, afterTheme ?? beforeTheme)) {
          const kind: ChangeKind = contract.length > 0 ? "contract" : change.kind;
          const seen = byKey.get(change.key);
          if (!seen || kind === "contract") byKey.set(change.key, { ...change, kind });
        }
      }
      changes[mode] = [...byKey.values()];
    }
    const kinds = [
      ...new Set([...changes.light, ...changes.dark].map((c) => c.kind)),
    ].sort() as ChangeKind[];
    themes[id] = { id, kinds, modes: changes };
  }
  return { ref, base, files, contract, themes };
}

export function classifyDiff(ref = "origin/main"): ThemeDiff {
  return evaluate(ref);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const same = args.includes("--same");
  const json = args.includes("--json");
  const ref = args.find((arg) => !arg.startsWith("--")) ?? "origin/main";
  const diff = evaluate(ref);

  if (json) {
    console.log(JSON.stringify(diff, null, 2));
  } else {
    let changed = 0;
    let contracted = 0;
    for (const theme of Object.values(diff.themes)) {
      for (const mode of modes) {
        const lines: string[] = [];
        for (const c of theme.modes[mode]) {
          if (c.after === undefined) {
            lines.push(`  - ${c.key}  ${c.before}  (${c.kind})`);
            contracted += 1;
          } else if (c.before === undefined) {
            lines.push(`  + ${c.key}  ${c.after}  (${c.kind})`);
            contracted += 1;
          } else {
            lines.push(`  ~ ${c.key}  ${c.before} → ${c.after}  (${c.kind})`);
            changed += 1;
          }
        }
        if (lines.length > 0) console.log(`${theme.id} ${mode}\n${lines.join("\n")}`);
      }
    }
    console.log(
      `theme:diff against ${diff.ref} (${diff.base.slice(0, 8)}): ${changed} value(s) changed, ${contracted} key(s) added or removed`,
    );
    if (same && changed > 0) process.exit(1);
  }
}
