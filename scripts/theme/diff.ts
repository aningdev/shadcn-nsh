/**
 * What a theme change does to the values the themes resolve to: every colour role and every finish
 * field of every theme, in light and in dark, resolved through its aliases (`var(--x)`, `{x}`,
 * `oklch(from {x} l c h / a)`) and compared between `<ref>` and the working tree.
 *
 *   bun scripts/theme/diff.ts [<ref>] [--same]
 *
 * The base is the merge base of `<ref>` (`origin/main` by default) and `HEAD`, as `--changed`
 * reads it (`scripts/port/affected.ts`), so a branch behind `main` does not report `main`'s
 * newer themes as its own. It prints, per theme and appearance, the keys removed, added and
 * changed; for each removed colour role, the keys (roles or finish fields) that resolve to the same
 * value wherever it existed: where its readers can go without a visible change.
 *
 * `--same` makes it a gate for a refactor that must not change a pixel: it exits 1 when any key
 * that exists on both sides resolves to a different value. Removed and added keys pass: whether
 * the components read the new key is `port:render:theme --against`'s question.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";

type Json = Record<string, unknown>;
type Mode = "light" | "dark";
const modes: Mode[] = ["light", "dark"];
/** One theme in one appearance: `color.<role>` and `<group>.<path>` to the value it resolves to. */
type Flat = Map<string, string>;

const args = process.argv.slice(2);
const same = args.includes("--same");
const ref = args.find((arg) => !arg.startsWith("--")) ?? "origin/main";

const git = (...argv: string[]) => spawnSync("git", argv, { cwd: repo, encoding: "utf8" });
const mergeBase = git("merge-base", ref, "HEAD");
if (mergeBase.status !== 0) {
  console.error(`theme:diff: no merge base with ${ref}: ${mergeBase.stderr.trim()}`);
  process.exit(1);
}
const base = mergeBase.stdout.trim();

const themesDir = "packages/theme/themes";

/** A theme file at the base, or undefined when the theme did not exist there. */
function atBase(file: string): Json | undefined {
  const shown = git("show", `${base}:${file}`);
  return shown.status === 0 ? (JSON.parse(shown.stdout) as Json) : undefined;
}

function inTree(file: string): Json | undefined {
  const full = path.join(repo, file);
  return fs.existsSync(full) ? (JSON.parse(fs.readFileSync(full, "utf8")) as Json) : undefined;
}

function themeIds(): string[] {
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
function flatten(theme: Json | undefined, semantics: Json | undefined, mode: Mode): Flat {
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

type Side = { before: Flat; after: Flat };
const sides = new Map<string, Side>();
for (const id of themeIds()) {
  const dir = `${themesDir}/${id}`;
  for (const mode of modes) {
    sides.set(`${id} ${mode}`, {
      before: flatten(atBase(`${dir}/theme.json`), atBase(`${dir}/semantics.json`), mode),
      after: flatten(inTree(`${dir}/theme.json`), inTree(`${dir}/semantics.json`), mode),
    });
  }
}

let changed = 0;
const removedRoles = new Set<string>();
for (const [where, { before, after }] of sides) {
  const lines: string[] = [];
  for (const [key, value] of before) {
    if (!after.has(key)) {
      lines.push(`  - ${key}  ${value}`);
      if (key.startsWith("color.")) removedRoles.add(key);
    } else if (after.get(key) !== value) {
      lines.push(`  ~ ${key}  ${value} → ${after.get(key)}`);
      changed += 1;
    }
  }
  for (const [key, value] of after) if (!before.has(key)) lines.push(`  + ${key}  ${value}`);
  if (lines.length > 0) console.log(`${where}\n${lines.join("\n")}`);
}

// Where a removed role's readers can go: the keys equal to it wherever it existed.
for (const role of removedRoles) {
  let candidates: Set<string> | undefined;
  for (const { before, after } of sides.values()) {
    const value = before.get(role);
    if (value === undefined) continue;
    const equal = [...after].filter(([, v]) => v === value).map(([key]) => key);
    candidates = candidates ? new Set(equal.filter((key) => candidates!.has(key))) : new Set(equal);
  }
  const list = [...(candidates ?? [])].join(", ") || "none";
  console.log(`${role} removed; equal in every theme and appearance: ${list}`);
}

console.log(
  `theme:diff against ${ref} (${base.slice(0, 8)}): ${changed} value${changed === 1 ? "" : "s"} changed`,
);
if (same && changed > 0) process.exit(1);
