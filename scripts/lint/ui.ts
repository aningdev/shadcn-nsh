/**
 * Unified UI static checks for `packages/ui` (`docs/ARCHITECTURE.md`):
 * - `rules`    (`scripts/lint/ui-rules.ts`): no theme name/preset, colour/state/font discipline, layered imports, documented exports
 * - `children` (`scripts/lint/children.ts`): each control reads `props.children` at most once in its body
 * - `rtl`      (`scripts/lint/rtl.ts`): asymmetric sides use logical `start`/`end` properties
 *
 *   bun scripts/lint/ui.ts
 *   bun scripts/lint/ui.ts --only rules|children|rtl
 */
import fs from "node:fs";
import path from "node:path";

import { files as childrenFiles, violations as childrenViolations } from "./children";
import { violations as rtlViolations } from "./rtl";
import { allowlist, violations as uiRuleViolations } from "./ui-rules";

type CheckKind = "rules" | "children" | "rtl";
const ALL_CHECKS: readonly CheckKind[] = ["rules", "children", "rtl"];

const repo = path.resolve(import.meta.dir, "../..");
const uiDir = path.join(repo, "packages/ui");

function parseOnly(argv: string[]): CheckKind[] {
  const at = argv.indexOf("--only");
  if (at === -1) return [...ALL_CHECKS];
  const raw = argv[at + 1];
  const selected = raw
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) as CheckKind[] | undefined;
  if (!selected || selected.length === 0) {
    throw new Error("--only requires one or more of: rules, children, rtl");
  }
  for (const item of selected) {
    if (!ALL_CHECKS.includes(item)) {
      throw new Error(`unknown --only target "${item}" (expected rules, children, or rtl)`);
    }
  }
  return selected;
}

function walkUiFiles(dir: string, includeTests: boolean): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".")) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkUiFiles(full, includeTests);
    if (!/\.(ts|tsx)$/.test(entry.name)) return [];
    if (!includeTests && /\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

const UI_ADVICE: Record<ReturnType<typeof uiRuleViolations>[number]["rule"], string> = {
  "theme-name":
    "read what the theme states (a dimension, a surface, a control slot), not which theme it is",
  colour: "read a theme role (`colors.*`, `surface()`), or mark the line `// color: <why>`",
  state:
    "use `feedback.hoverStyle` / `feedback.press` / `feedback.hovered()`, or mark the line `// state: <why>`",
  "font-literal":
    "read `font.mono` / `font.sans` from the theme entry, or a `font-mono` / `font-sans` class, or mark the line `// font: <why>`",
  "class-merge": "append with `joinClass(own, props.class)` so the caller's class comes last",
  layer:
    "import inside the layer: a relative path in `packages/ui` (never a component from `lib/`), " +
    "`nsh` / `nsh/base`, or the theme entry (`../theme` from a component, `../../theme` from `lib/`)",
  jsdoc: "say with a `/** … */` above it what the export is for",
};

function runUiRules(): string[] {
  const problems = walkUiFiles(uiDir, false).flatMap((file) =>
    uiRuleViolations(fs.readFileSync(file, "utf8"), path.relative(repo, file)),
  );
  const stale = allowlist.filter((entry) => {
    const file = path.join(repo, entry.file);
    if (!fs.existsSync(file)) return true;
    return !uiRuleViolations(fs.readFileSync(file, "utf8"), entry.file, []).some(
      (v) => v.rule === entry.rule && entry.match === (v.match ?? v.text),
    );
  });
  const errors = [
    ...problems.map(
      (p) => `${p.file}:${p.line}:${p.column}: ${p.rule}: \`${p.text}\` — ${UI_ADVICE[p.rule]}`,
    ),
    ...stale.map(
      (entry) =>
        `${entry.file}: allowlist entry \`${entry.match}\` (${entry.rule}) excuses nothing any more ` +
        `— it was for ${entry.reason}; drop it`,
    ),
  ];
  if (errors.length === 0) {
    console.log(
      "ui rules: OK — no theme preset or name in a component, colours from theme roles or marked " +
        "`// color:`, fonts from `font.sans` / `font.mono`, classes joined with `joinClass`, " +
        "imports inside their layer, every export documented",
    );
  }
  return errors;
}

function runChildrenCheck(): string[] {
  const files = childrenFiles(repo);
  const errors = files.flatMap((file) => {
    const full = path.join(repo, file);
    if (!fs.existsSync(full)) {
      return [`${file}: listed in scripts/lint/children.ts but missing`];
    }
    return childrenViolations(fs.readFileSync(full, "utf8"), file).map((problem) => {
      const place = `${problem.file}:${problem.line}:${problem.column}`;
      if (problem.kind === "nested") {
        return (
          `${place}: \`${problem.where}\` reads its children inside a function, so each call reads ` +
          `them again; read them once in the component's own body (a \`children-lint:\` comment ` +
          `sanctions the one place a read must sit there)`
        );
      }
      return (
        `${place}: \`${problem.where}\` reads its children ${problem.reads} times; read them once ` +
        `where they are drawn (docs/ARCHITECTURE.md)`
      );
    });
  });
  if (errors.length === 0) {
    console.log(`children: OK — ${files.length} controls read their children once`);
  }
  return errors;
}

function runRtlCheck(): string[] {
  const errors = walkUiFiles(uiDir, true).flatMap((file) =>
    rtlViolations(fs.readFileSync(file, "utf8"), path.relative(repo, file)).map((problem) => {
      const place = `${problem.file}:${problem.line}:${problem.column}`;
      return (
        `${place}: \`${problem.property}\` keeps its physical side; write \`${problem.suggestion}\` ` +
        `so it mirrors, or mark the object \`// physical: <why>\` (line ${problem.objectLine})`
      );
    }),
  );
  if (errors.length === 0) {
    console.log("rtl: OK — asymmetric sides use start/end, or say why they are physical");
  }
  return errors;
}

if (import.meta.main) {
  let checks: CheckKind[];
  try {
    checks = parseOnly(process.argv.slice(2));
  } catch (error) {
    console.error(`check:ui: ${(error as Error).message}`);
    process.exit(1);
  }

  const runners: Record<CheckKind, () => string[]> = {
    rules: runUiRules,
    children: runChildrenCheck,
    rtl: runRtlCheck,
  };

  const errors = checks.flatMap((check) => runners[check]());
  if (errors.length > 0) {
    for (const err of errors) console.error(err);
    console.error(`\ncheck:ui: ${errors.length} problem(s) in packages/ui (docs/ARCHITECTURE.md)`);
    process.exit(1);
  }
}
