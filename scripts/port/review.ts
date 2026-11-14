/**
 * Marks upstream as reviewed: moves `port-map.json`'s `upstream.reviewed` to the baseline
 * (`upstream.commit`) once every change `port:check` lists has been looked at.
 *
 *   bun scripts/port/review.ts
 *
 * It prints each change with the file of ours it lands in, so they are confirmed one by one. The
 * map has to account for upstream first (no gaps): a new declaration needs a destination, a
 * dropped one must lose its route, before there is anything to review. Reviewing does not change
 * any code — the components are ours, so adopting a change upstream made is an edit of ours
 * (`docs/port.md`).
 */
import fs from "node:fs";
import path from "node:path";

import { auditMap, upstreamChanges, upstreamHead } from "./changes";
import { readMap, repo } from "./lib";

const die = (message: string): never => {
  console.error(`port:review: ${message}`);
  process.exit(1);
};

const map = readMap();
const head = upstreamHead();
if (head !== map.upstream.commit) {
  die(
    `references/nsh is at ${head.slice(0, 8)}, the map pins ${map.upstream.commit.slice(0, 8)}: \`bun run port:bump\` moves the baseline`,
  );
}

const { gaps } = auditMap(map);
if (gaps.length > 0) {
  for (const gap of gaps) console.error(`port:review: ${gap}`);
  die(
    `port-map.json does not account for upstream ${map.upstream.commit.slice(0, 8)}: fix the map first (a new declaration needs a destination, a dropped one loses its route)`,
  );
}

const changes = upstreamChanges(map);
if (changes.items.length > 0) {
  console.log(
    `port:review: ${changes.items.length} upstream change(s) since ${changes.reviewed.slice(0, 8)}:`,
  );
  for (const item of changes.items) {
    console.log(`  ${item.kind.padEnd(7)} ${item.file}: ${item.name} → ${item.target}`);
  }
} else {
  console.log(
    `port:review: no declaration of ours changed upstream since ${changes.reviewed.slice(0, 8)}`,
  );
}
for (const file of changes.addedFiles) console.log(`  added file    ${file}`);
for (const file of changes.removedFiles) console.log(`  removed file  ${file}`);

if (changes.reviewed === changes.commit) {
  console.log(`port:review: already reviewed through ${changes.commit.slice(0, 8)}`);
  process.exit(0);
}

// The hash is replaced in place, not the JSON rewritten, so the file keeps its formatting and the
// commit shows the one line that moved.
const mapFile = path.join(repo, "port-map.json");
const mapText = fs.readFileSync(mapFile, "utf8");
const pinned = `"reviewed": "${changes.reviewed}"`;
if (mapText.split(pinned).length !== 2) {
  die(`port-map.json does not have exactly one ${pinned}`);
}
fs.writeFileSync(mapFile, mapText.replace(pinned, `"reviewed": "${changes.commit}"`));
console.log(
  `port:review: reviewed through ${changes.commit.slice(0, 8)}; commit port-map.json with what you changed`,
);
