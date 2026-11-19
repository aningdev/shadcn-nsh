/**
 * Renames theme accessor call sites to the token they read (issue #52).
 *
 * Other branches run this after rebasing onto the rename: it is safe to run twice, and on files
 * that already use the new names. It does not rewrite itself — the map below is the old names, and
 * a second pass must leave them here. It does not drop `colors.mutedFill` (those sites read
 * `token("muted")` by hand) and it does not rename a `"danger"` that is not a `Tone`.
 *
 *   bun scripts/codemods/theme-accessors.ts
 *
 * Old → new:
 *   colors.surface → colors.card
 *   colors.fieldBorder → colors.input
 *   colors.text → colors.foreground
 *   colors.muted → colors.mutedForeground
 *   colors.accent → colors.brand
 *   colors.accentFill → colors.brandFill
 *   colors.onAccent → colors.onBrand
 *   colors.light → colors.primary
 *   colors.onLight → colors.primaryForeground
 *   colors.sidebarSelected → colors.sidebarAccent
 *   colors.danger → colors.destructive
 *   tints.accent → tints.brand
 *   tints.danger → tints.destructive
 *   chart.s1 … chart.s5 → chart.chart1 … chart.chart5
 *   Tone "danger" → "destructive"
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = join(import.meta.dir, "../..");
const self = resolve(import.meta.path);

/** Directories the rename covers. `references/` is not one of them. */
const roots = [
  "packages",
  "apps/website/demos",
  "apps/website/content",
  "apps/website/src",
  "apps/gallery",
  "scripts",
  "docs",
];

const extensions = new Set([".ts", ".tsx", ".md", ".mdx"]);

/** Generated pictures and dependencies: nothing in them is a call site. */
const skipDirs = new Set([
  "node_modules",
  ".git",
  "dist",
  "shots",
  "shots-audit",
  "shots-theme",
  "baseline",
]);

/** Records of earlier names: the 0.3 API migration and drafts written to upstream in its words. */
const skipPaths = new Set(["docs/specs/api-unify.md", "docs/drafts"]);

/**
 * Longer keys first, so a shorter old name cannot be read out of a longer one even without the
 * word boundary (`accent` out of `accentFill`). The boundary is what keeps `colors.muted` off
 * `colors.mutedForeground` and off `colors.mutedFill`.
 */
const colors: [string, string][] = [
  ["accentFill", "brandFill"],
  ["onAccent", "onBrand"],
  ["sidebarSelected", "sidebarAccent"],
  ["onLight", "primaryForeground"],
  ["fieldBorder", "input"],
  ["muted", "mutedForeground"],
  ["surface", "card"],
  ["text", "foreground"],
  ["accent", "brand"],
  ["light", "primary"],
  ["danger", "destructive"],
];

/** Tint keys follow the color they tint. `danger` reads `destructive-tint`, so it follows `Tone`. */
const tints: [string, string][] = [
  ["accent", "brand"],
  ["danger", "destructive"],
];

/** `chart-1` … `chart-5`, camelCased. */
const chart: [string, string][] = [
  ["s1", "chart1"],
  ["s2", "chart2"],
  ["s3", "chart3"],
  ["s4", "chart4"],
  ["s5", "chart5"],
];

/** A fresh global: a shared one would keep `lastIndex` across files. */
const memberPattern = (object: string, from: string) =>
  new RegExp(`\\b${object}\\.${from}\\b`, "g");

/** The seven tone names in backticks, with the same separator between each. */
const toneList = () => /`neutral`(\s*[,/|]*\s*)`accent`\1`info`\1`warn`\1`danger`\1`up`\1`down`/g;

/**
 * Rename accessor reads, then `Tone` `"danger"`. `"danger"` changes only as a tone: the `Tone`
 * alias, a `tone` prop or field, a list of the other tones, a ternary arm, or the seven names
 * written in backticks. `variant="danger"` and the English "danger tone" stay.
 */
export function rewrite(source: string): string {
  let out = source;
  for (const [object, pairs] of [
    ["colors", colors],
    ["tints", tints],
    ["chart", chart],
  ] as const)
    for (const [from, to] of pairs)
      out = out.replace(memberPattern(object, from), `${object}.${to}`);
  out = out.replace(/type\s+Tone\b[^;]*/g, (statement) =>
    statement.replace(/(["'])danger\1/g, "$1destructive$1"),
  );
  out = out.replace(/\btone(\s*=\s*(?:\{\s*)?)(["'])danger\2/g, "tone$1$2destructive$2");
  out = out.replace(/\btone(\s*:\s*)(["'])danger\2/g, "tone$1$2destructive$2");
  out = out.replace(/\[[^[\]]*\]/g, (group) => {
    if (!/(["'])(?:neutral|accent|info|warn|up|down)\1/.test(group)) return group;
    return group.replace(/(["'])danger\1/g, "$1destructive$1");
  });
  out = out.replace(/(\?\s*)(["'])danger\2(?=\s*:)/g, "$1$2destructive$2");
  out = out.replace(toneList(), (list) => list.replace("`danger`", "`destructive`"));
  return out;
}

/** The renames the word boundary has to get right, checked before any file is written. */
function selfTest(): void {
  const once = rewrite(`
    colors.muted colors.mutedForeground colors.mutedFill
    colors.accent colors.accentFill colors.onAccent
    colors.light colors.onLight finish.light finish.accent
    colors.text colors.surface colors.fieldBorder colors.danger colors.sidebarSelected
    tints.accent tints.danger tints.brand
    chart.s1 chart.s10 chart.chart1
    type Tone = "neutral" | "accent" | "info" | "warn" | "danger" | "up" | "down";
    tone="danger" tone={"danger"} tone: "danger" variant="danger"
    ["neutral", "accent", "info", "warn", "danger", "up", "down"]
    status() === "wrong" ? "danger" : "up"
    \`neutral\`, \`accent\`, \`info\`, \`warn\`, \`danger\`, \`up\`, \`down\`
    class="text-muted text-muted-foreground" ui().danger
  `);
  const expect = `
    colors.mutedForeground colors.mutedForeground colors.mutedFill
    colors.brand colors.brandFill colors.onBrand
    colors.primary colors.primaryForeground finish.light finish.accent
    colors.foreground colors.card colors.input colors.destructive colors.sidebarAccent
    tints.brand tints.destructive tints.brand
    chart.chart1 chart.s10 chart.chart1
    type Tone = "neutral" | "accent" | "info" | "warn" | "destructive" | "up" | "down";
    tone="destructive" tone={"destructive"} tone: "destructive" variant="danger"
    ["neutral", "accent", "info", "warn", "destructive", "up", "down"]
    status() === "wrong" ? "destructive" : "up"
    \`neutral\`, \`accent\`, \`info\`, \`warn\`, \`destructive\`, \`up\`, \`down\`
    class="text-muted text-muted-foreground" ui().danger
  `;
  if (once !== expect) {
    console.error("theme-accessors: self-test failed");
    console.error(once);
    process.exit(1);
  }
  if (rewrite(once) !== once) {
    console.error("theme-accessors: a second pass changed the self-test output");
    process.exit(1);
  }
}

const filesUnder = (dir: string): string[] => {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (skipDirs.has(entry) || skipPaths.has(relative(root, path))) continue;
    const stat = statSync(path);
    if (stat.isDirectory()) found.push(...filesUnder(path));
    else if (extensions.has(entry.slice(entry.lastIndexOf(".")))) found.push(path);
  }
  return found;
};

selfTest();

let changed = 0;
for (const dir of roots) {
  for (const path of filesUnder(join(root, dir))) {
    if (resolve(path) === self) continue;
    const source = readFileSync(path, "utf8");
    const next = rewrite(source);
    if (next === source) continue;
    writeFileSync(path, next);
    changed += 1;
    console.log(relative(root, path));
  }
}
console.log(`theme-accessors: ${changed} file${changed === 1 ? "" : "s"}`);
