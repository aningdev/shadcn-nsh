/**
 * The pointer screenshots' baseline: the reviewed images a change should show up against.
 *
 *   bun scripts/port/baseline.ts --update [--only <id,...>]   # copy the latest shots into baseline/
 *   bun scripts/port/baseline.ts [--only <id,...>]            # compare the latest shots with baseline/
 *
 * `--update` replaces `apps/docs/demos/baseline/` with every `*-pointer-*.png` in `shots/`
 * (demo and reference alike) and prints how many; commit them after looking at the sheet.
 * Without it, every baseline image must be in `shots/` byte for byte, and a pointer shot the
 * baseline does not have is listed too. Any difference exits non-zero, so `port:render` fails
 * on a visual change until the change is reviewed and the baseline moved.
 *
 * The screenshots are stable byte for byte on the same machine without the GPU (Chrome draws
 * rounded corners a level off on one) and with reduced motion (an endless animation would
 * otherwise move between runs): two full `port:render` runs compared 192/192 identical
 * (2026-11-12, macOS). A different machine may still draw type and antialiasing differently;
 * then the comparison is a review aid, not a gate (docs/toolchain.md).
 */
import fs from "node:fs";
import path from "node:path";

import { antialiasing, cases } from "../../apps/docs/demos/render-cases";
import { catalog } from "../catalog";
import { repo } from "./lib";
import { compareWithinTolerance } from "./pixels";

const demos = catalog().paths.demos;
const shots = path.join(demos, "shots");
const baseline = path.join(demos, "baseline");

/** The pointer shots: `<id>-pointer-<scheme>.png` and their `.ref.png`. */
const pointerShot = (name: string) => /-pointer-[a-z]+(\.ref)?\.png$/.test(name);

/** The ids a `--only` names: a change to one family re-records its pictures, not all of them. */
const onlyAt = process.argv.indexOf("--only");
const only =
  onlyAt >= 0
    ? (process.argv[onlyAt + 1] ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : undefined;
if (onlyAt >= 0 && (!only || only.length === 0)) {
  console.error("baseline: --only takes a comma-separated list of ids (`--only select,combobox`)");
  process.exit(1);
}
const unknown = (only ?? []).filter((id) => !catalog().components.some((c) => c.id === id));
if (unknown.length > 0) {
  console.error(`baseline: no component is called ${unknown.join(", ")}`);
  process.exit(1);
}
const chosen = (name: string) => !only || only.some((id) => name.startsWith(`${id}-`));

/** What a page may differ by: its own tolerance, or the antialiasing budget all pages share. */
const allowed = (name: string) => {
  const id = name.replace(/-pointer-[a-z]+(\.ref)?\.png$/, "");
  return cases.find((c) => c.id === id)?.tolerance ?? antialiasing;
};

/** The pictures the baseline holds: a pointer shot, of the ids named (`--only`) or of all. */
const shotFiles = () =>
  fs.existsSync(shots) ? fs.readdirSync(shots).filter(pointerShot).filter(chosen).sort() : [];

if (process.argv.includes("--update")) {
  const files = shotFiles();
  if (files.length === 0) {
    console.error("baseline: no pointer shots in shots/; run `bun run port:render` first");
    process.exit(1);
  }
  // A full update replaces the baseline; `--only` rewrites the pictures of those ids and leaves
  // the rest of the folder as it is.
  if (!only) fs.rmSync(baseline, { recursive: true, force: true });
  fs.mkdirSync(baseline, { recursive: true });
  for (const name of files) fs.copyFileSync(path.join(shots, name), path.join(baseline, name));
  console.log(`baseline: wrote ${files.length} pointer shots to ${path.relative(repo, baseline)}`);
  process.exit(0);
}

if (!fs.existsSync(baseline)) {
  console.error(
    `baseline: no ${path.relative(repo, baseline)}; run \`bun run port:baseline --update\` after a reviewed render`,
  );
  process.exit(1);
}

const baselineFiles = fs.readdirSync(baseline).filter(pointerShot).filter(chosen).sort();
const latest = new Set(shotFiles());
const problems: string[] = [];
let same = 0;
for (const name of baselineFiles) {
  if (!latest.has(name)) {
    problems.push(`missing  ${name}`);
    continue;
  }
  const a = fs.readFileSync(path.join(baseline, name));
  const b = fs.readFileSync(path.join(shots, name));
  if (a.equals(b)) {
    same += 1;
    continue;
  }
  // A rounded edge's antialiasing lands a level apart between two renders of the same page: the
  // pair is the same picture within the case's budget, and the baseline keeps the older one.
  const { ok, report } = compareWithinTolerance(a, b, allowed(name));
  if (ok) {
    same += 1;
    console.log(`baseline: ${name}: within the antialiasing budget — ${report}`);
  } else problems.push(`changed  ${name}`);
}
for (const name of [...latest].sort()) {
  if (!baselineFiles.includes(name)) problems.push(`new      ${name}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`baseline: ${problem}`);
  console.error(
    `baseline: ${problems.length} of ${baselineFiles.length} differ (${same} same); look at \`bun run port:sheet\`, then \`bun run port:baseline --update\` if the change is right`,
  );
  process.exit(1);
}
console.log(`baseline: ${same} pointer shots match ${path.relative(repo, baseline)}`);
