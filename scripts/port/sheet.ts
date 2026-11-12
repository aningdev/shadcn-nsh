/**
 * The contact sheet: one self-contained HTML page of every shot in `apps/docs/demos/shots/`,
 * a row per component with the pointer and touch passes, light and dark, each pair beside its
 * reference. A component's row is marked when its two shots differ or one is missing.
 *
 *   bun scripts/port/sheet.ts
 *
 * The page is `shots/index.html` (git-ignored, like the shots it shows) and names the images by
 * their file name only, so it opens from disk with no server and no network. Run
 * `port:render` and/or `port:render:touch` first; a pass that has not run shows its cells as
 * missing, which is the point: the sheet says what has not been looked at.
 *
 * The comparison is byte for byte, the one the render tests make; the sheet does not replace
 * them, it shows their evidence in one place.
 */
import fs from "node:fs";
import path from "node:path";

import { cases, schemes } from "../../apps/docs/demos/render-cases";
import { portPaths, readMap, repo } from "./lib";

/** One screenshot pair: the demo and its reference page (the reference is absent for a self-reference). */
type Pair = { pass: string; scheme: string; ours: string; reference: string; self?: string };

const demos = portPaths(readMap()).demos;
const shots = path.join(demos, "shots");
if (!fs.existsSync(shots)) {
  console.error(
    `port:sheet: no shots at ${path.relative(repo, shots)}; run \`bun run port:render\` first`,
  );
  process.exit(1);
}

const pairsOf = (id: string, self?: string): Pair[] => {
  const pairs: Pair[] = [];
  for (const scheme of schemes) {
    pairs.push({
      pass: "pointer",
      scheme,
      ours: `${id}-pointer-${scheme}.png`,
      reference: `${id}-pointer-${scheme}.ref.png`,
      self,
    });
  }
  for (const scheme of schemes) {
    pairs.push({
      pass: "touch",
      scheme,
      ours: `${id}-touch-${scheme}.png`,
      reference: `${id}-touch-${scheme}.ref.png`,
      self,
    });
  }
  return pairs;
};

const read = (name: string) => {
  const file = path.join(shots, name);
  return fs.existsSync(file) ? fs.readFileSync(file) : null;
};

const same = (a: Buffer, b: Buffer) => a.length === b.length && a.equals(b);

/**
 * A pair's state: present and identical, different, or incomplete. A self-reference has no
 * reference page, so its one shot only has to be there.
 */
function state(pair: Pair): "same" | "differs" | "missing" {
  const ours = read(pair.ours);
  if (pair.self) return ours ? "same" : "missing";
  const reference = read(pair.reference);
  if (!ours || !reference) return "missing";
  return same(ours, reference) ? "same" : "differs";
}

const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const cell = (pair: Pair, label: string) => {
  const ours = read(pair.ours);
  const reference = pair.self ? null : read(pair.reference);
  const status = state(pair);
  const image = (name: string, file: Buffer | null, side: string) =>
    file
      ? `<a href="${escape(name)}" target="_blank" rel="noreferrer"><img loading="lazy" src="${escape(name)}" alt="${escape(side)}"></a>`
      : `<span class="absent">${escape(side)} missing<br><code>${escape(name)}</code></span>`;
  if (pair.self) {
    return `<figure class="cell ${status} self">
  <figcaption>${escape(label)}<span class="tag">self</span></figcaption>
  <div class="pair self">${image(pair.ours, ours, "component")}<span class="selfnote">no reference page<br><span>${escape(pair.self)}</span></span></div>
 </figure>`;
  }
  return `<figure class="cell ${status}">
  <figcaption>${escape(label)}<span class="tag">${status}</span></figcaption>
  <div class="pair">${image(pair.ours, ours, "component")}${image(pair.reference, reference, "reference")}</div>
 </figure>`;
};

const rows: string[] = [];
let sameRows = 0;
let differingRows = 0;
let missingRows = 0;
let selfRows = 0;
for (const { id, selfReference } of cases) {
  const pairs = pairsOf(id, selfReference);
  const states = pairs.map(state);
  const differs = pairs.filter((_, i) => states[i] === "differs");
  const missing = pairs.filter((_, i) => states[i] === "missing");
  const status = differs.length > 0 ? "differs" : missing.length > 0 ? "missing" : "same";
  if (status === "same") sameRows += 1;
  else if (status === "differs") differingRows += 1;
  else missingRows += 1;
  if (selfReference) selfRows += 1;
  const note = selfReference
    ? `self-reference — ${selfReference}`
    : status === "same"
      ? "four pairs, byte for byte"
      : [
          ...differs.map((p) => `${p.pass} · ${p.scheme} differs`),
          ...missing.map((p) => `${p.pass} · ${p.scheme} missing`),
        ].join(" · ");
  // The appearance check (`port:render:touch`) writes these for the demo only; show them when
  // the pass has run, as a fifth cell.
  const switched = `${id}-switched.png`;
  const switchedReference = `${id}-switched.ref.png`;
  const hasSwitched = fs.existsSync(path.join(shots, switched));
  rows.push(`<section class="row ${status}" id="${escape(id)}">
  <header><h2><a href="#${escape(id)}">${escape(id)}</a></h2><span class="status">${status}</span><p class="note">${escape(note)}</p></header>
  <div class="cells">
   ${cell(pairs[0], "pointer · light")}
   ${cell(pairs[1], "pointer · dark")}
   ${cell(pairs[2], "touch · light")}
   ${cell(pairs[3], "touch · dark")}
   ${hasSwitched ? cell({ pass: "appearance", scheme: "light→dark", ours: switched, reference: switchedReference }, "appearance · light→dark") : ""}
  </div>
 </section>`);
}

const total = cases.length;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Render shots · ${total} components</title>
<style>
  :root { color-scheme: light dark; --ink: #17171a; --muted: #6b6b73; --line: #d9d9de; --page: #fbfbfc; --card: #fff; --ok: #1a7f4b; --warn: #a35a00; --bad: #b3261e; }
  @media (prefers-color-scheme: dark) { :root { --ink: #ececf0; --muted: #9a9aa4; --line: #34343a; --page: #121215; --card: #1b1b20; --ok: #5ad18e; --warn: #f0a94a; --bad: #ff8a80; } }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: var(--page); color: var(--ink); font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  .lede { margin: 0 0 8px; color: var(--muted); }
  .summary { display: flex; gap: 16px; margin: 0 0 24px; padding: 0; list-style: none; color: var(--muted); }
  .summary b { color: var(--ink); }
  .row { margin: 0 0 18px; padding: 12px 14px 14px; background: var(--card); border: 1px solid var(--line); border-radius: 10px; }
  .row.differs { border-color: var(--bad); }
  .row.missing { border-color: var(--warn); }
  .row > header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
  h2 { margin: 0; font-size: 15px; }
  h2 a { color: inherit; text-decoration: none; }
  .status { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; border: 1px solid currentColor; }
  .same .status { color: var(--ok); }
  .differs .status { color: var(--bad); }
  .missing .status { color: var(--warn); }
  .note { margin: 0; color: var(--muted); font-size: 12px; }
  .cells { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .cell { margin: 0; padding: 8px; border: 1px solid var(--line); border-radius: 8px; min-width: 0; }
  .cell.differs { border-color: var(--bad); }
  .cell.missing { border-color: var(--warn); }
  figcaption { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 6px; color: var(--muted); font-size: 11px; }
  .tag { text-transform: uppercase; letter-spacing: .04em; }
  .cell.same .tag { color: var(--ok); }
  .cell.differs .tag { color: var(--bad); }
  .cell.missing .tag { color: var(--warn); }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-items: start; }
  .pair.self { grid-template-columns: 1fr; }
  .pair.self a { min-width: 0; }
  .selfnote { display: flex; flex-direction: column; gap: 2px; color: var(--muted); font-size: 11px; }
  .selfnote span { font-style: italic; }
  .cell.self .tag { color: var(--muted); }
  .pair img { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 4px; background: #fff; }
  .absent { display: flex; min-height: 90px; align-items: center; justify-content: center; text-align: center; padding: 6px; color: var(--muted); font-size: 11px; border: 1px dashed var(--line); border-radius: 4px; }
  code { font-size: 10px; overflow-wrap: anywhere; }
  @media (max-width: 1100px) { .cells { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .cells { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<h1>Render shots</h1>
<p class="lede">Each component's demo and its reference page, side by side. Images are the PNGs in this folder; a row is marked when a pair differs byte for byte or a shot is missing.</p>
<ul class="summary">
 <li><b>${total}</b> components</li>
 <li><b>${sameRows}</b> same</li>
 <li><b>${differingRows}</b> differ</li>
 <li><b>${missingRows}</b> incomplete</li>
 <li><b>${selfRows}</b> self-reference</li>
</ul>
${rows.join("\n")}
</body>
</html>
`;

const file = path.join(shots, "index.html");
fs.writeFileSync(file, html);
console.log(`sheet: ${path.relative(repo, file)}`);
console.log(`open: ${file}`);
