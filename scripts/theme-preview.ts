/**
 * The shadcn theme experiment's preview: puts an alternative theme in the default theme's place,
 * photographs the components through the audit's own packaging and shooting, and puts the
 * default files back — on success or failure alike.
 *
 *   bun scripts/theme-preview.ts <name> [--only id,id] [--appearance light|dark]
 *
 * `<name>` is `default` (the files as they are: `<id>-default-…` pictures) or a directory under
 * `packages/theme/themes/` holding `theme.json` and `finishes.json` (e.g. `shadcn`).
 *
 * The theme is a build input (`nsh.json`'s `theme`), not a runtime switch, so each alternative is
 * a full package run: `scripts/audit/audit.ts build --force --only …` then `shots --only …`, once
 * per appearance. Screenshots land in `apps/docs/demos/shots-audit/theme/` as
 * `<id>-<name>-<kind>-<layout>-<appearance>.png`, out of the audit's own names.
 *
 * `docs/specs/theme-shadcn.md` is what this was run for; it is not part of the check pipeline.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { targetsFor, shotName, shotsDir } from "./audit/targets";
import { catalog } from "./catalog";
import { repo } from "./port/lib";

const args = process.argv.slice(2);
const valueOf = (flag: string) => {
  const at = args.indexOf(flag);
  return at >= 0 ? args[at + 1] : undefined;
};
const name = args.find((arg, at) => !arg.startsWith("--") && !args[at - 1]?.startsWith("--"));
if (!name) {
  console.error("usage: bun scripts/theme-preview.ts <default|themes/<name>> [--only id,id]");
  process.exit(1);
}
const appearances = (valueOf("--appearance") ?? "light,dark").split(",");
for (const appearance of appearances) {
  if (appearance !== "light" && appearance !== "dark") {
    console.error(`--appearance takes light, dark or both: ${appearance}`);
    process.exit(1);
  }
}

const theme = path.join(repo, "packages", "theme");
const source = path.join(theme, "themes", name);
if (name !== "default" && !fs.existsSync(path.join(source, "theme.json"))) {
  console.error(`no theme called ${name}: ${path.relative(repo, source)}/theme.json is missing`);
  process.exit(1);
}

const all = catalog().components.map((component) => component.id);
const only = valueOf("--only")?.split(",").filter(Boolean);
const unknown = (only ?? []).filter((id) => !all.includes(id));
if (unknown.length > 0) {
  console.error(`no component is called ${unknown.join(", ")}`);
  process.exit(1);
}
const ids = all.filter((id) => !only || only.includes(id));

const out = path.join(shotsDir, "theme");
fs.mkdirSync(out, { recursive: true });

/** The default files, kept byte for byte: put back whatever happens below. */
const FILES = ["theme.json", "finishes.json"] as const;
const saved = new Map(FILES.map((file) => [file, fs.readFileSync(path.join(theme, file))]));

const run = (args: string[]) => {
  const result = spawnSync("bun", args, { cwd: repo, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`bun ${args.join(" ")}: exit ${result.status}`);
};

/** `<id>-<kind>-<layout>[-<official>].png` → `<id>-<name>-<kind>-<layout>[-<official>]-<appearance>.png`. */
function moved(target: { id: string }, from: string, appearance: string) {
  const tail = from.slice(target.id.length + 1, -".png".length);
  return path.join(out, `${target.id}-${name}-${tail}-${appearance}.png`);
}

let failure: string | undefined;
try {
  if (name !== "default") {
    for (const file of FILES) fs.copyFileSync(path.join(source, file), path.join(theme, file));
  }
  console.log(`theme ${name}: ${ids.length} components, ${appearances.join(" + ")}`);
  run(["scripts/audit/audit.ts", "build", "--force", "--only", ids.join(",")]);
  for (const appearance of appearances) {
    run(["scripts/audit/audit.ts", "shots", "--only", ids.join(","), "--theme", appearance]);
    for (const id of ids) {
      for (const target of targetsFor(id)) {
        for (const layout of ["phone", "desktop"] as const) {
          const from = path.join(shotsDir, shotName(target, layout));
          if (!fs.existsSync(from)) {
            console.warn(`  no ${shotName(target, layout)}: ${target.slug} was not built`);
            continue;
          }
          const to = moved(target, shotName(target, layout), appearance);
          fs.renameSync(from, to);
        }
      }
    }
  }
  console.log(
    `${ids.length} components × ${appearances.length} appearances in ${path.relative(repo, out)}`,
  );
} catch (error) {
  failure = error instanceof Error ? error.message : "the preview failed";
} finally {
  for (const file of FILES) fs.writeFileSync(path.join(theme, file), saved.get(file)!);
  const changed = FILES.filter(
    (file) => !fs.readFileSync(path.join(theme, file)).equals(saved.get(file)!),
  );
  if (changed.length > 0) {
    console.error(`theme: ${changed.join(", ")} did not come back: check git status`);
    process.exitCode = 1;
  }
}
if (failure) {
  console.error(failure);
  process.exit(1);
}
