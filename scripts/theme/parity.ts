/**
 * nsh-gallery is the gallery's own look, so the colours it resolves to have to be the colours the
 * upstream gallery paints (`references/nsh/examples/nsh-gallery-ui/theme.json`) — key by key
 * (ADR 0012 §7). A value may step off upstream deliberately, but only from the exemption table
 * below, with a reason: a difference nobody wrote down is a drift nobody decided on.
 *
 *   bun scripts/theme/parity.ts          # report the differences
 *   bun run check                        # runs it, and a difference fails the build
 *
 * Both sides are resolved the way a renderer resolves them (`./css-colour`). Channels are compared
 * with one 8-bit step of slack, because each side rounds its own text.
 */

import { readFileSync } from "node:fs";

import { resolveColour, sameColour, varsOf } from "./css-colour";
import { css } from "./oklch";

const UPSTREAM = "references/nsh/examples/nsh-gallery-ui/theme.json";
const AUTHORED = "packages/theme/themes/nsh-gallery/theme.json";

/** One key the two sides are allowed to disagree on, or to state alone. */
interface Exemption {
  key: string;
  /** The appearance it is exempt in; absent means every section. */
  appearance?: "theme" | "light" | "dark";
  reason: string;
}

/**
 * The keys that are not a role of this library, and the colours that deliberately differ.
 * An entry says which side states the key it exempts when only one does.
 */
const EXEMPT: Exemption[] = [
  // Upstream keys this library has no role for.
  { key: "code", reason: "upstream's code-view ground; no library role names it" },
  { key: "down", reason: "upstream's negative trend; `destructive` carries it here" },
  {
    key: "down-tint",
    reason: "upstream's negative trend tint; `destructive-tint` carries it here",
  },
  { key: "scrollbar-thumb", reason: "the shell paints its own scrollbar" },
  { key: "scrollbar-thumb-hover", reason: "the shell paints its own scrollbar" },
  { key: "violet", reason: "upstream's chart accent for one panel; not a role" },
  { key: "window-control-off", reason: "the traffic-light trio is the gallery chrome's" },
  // Theme-level keys one side states on its own.
  { key: "brand-fill", reason: "the gallery's filled brand surface; `primary` carries it here" },
  { key: "on-brand", reason: "ink on `brand-fill`; `primary-foreground` carries it here" },
  { key: "window-close", reason: "the gallery's window chrome" },
  { key: "window-minimize", reason: "the gallery's window chrome" },
  { key: "window-zoom", reason: "the gallery's window chrome" },
  { key: "window-control-ink", reason: "the gallery's window chrome" },
  { key: "window-control-edge", reason: "the gallery's window chrome" },
  { key: "media", reason: "the media surface's own ground; upstream draws it in the app" },
  { key: "on-media", reason: "ink on the media surface; upstream draws it in the app" },
  { key: "radius-card", reason: "a radius, not a colour: upstream's card radius" },
  { key: "radius-container", reason: "a radius, not a colour: this library's scale" },
  { key: "radius-modal", reason: "a radius, not a colour: this library's scale" },
  // Roles this library states that upstream has no key for.
  { key: "brand-edge", reason: "a hairline on brand fills; upstream draws it inside the fill" },
  { key: "focus-inner", reason: "the line inside a focus ring; upstream draws one ring only" },
  { key: "inverse", reason: "the inverted surface a toast sits on; upstream reuses `card`" },
  { key: "inverse-foreground", reason: "ink on the inverted surface" },
  { key: "inverse-brand", reason: "brand ink on the inverted surface" },
];

interface ThemeFile {
  name: string;
  cssVars: Record<string, Record<string, string> | undefined>;
}

/** One appearance's declarations: the theme block under the appearance's own. */
function scope(theme: ThemeFile, appearance: string): Record<string, string> {
  return { ...theme.cssVars.theme, ...(theme.cssVars[appearance] ?? {}) };
}

const read = (path: string) => JSON.parse(readFileSync(path, "utf8")) as ThemeFile;

const authored = read(AUTHORED);
const upstream = read(UPSTREAM);

const exempt = new Set(EXEMPT.map((entry) => `${entry.appearance ?? "every"} ${entry.key}`));
const missing = new Set<string>();

interface Difference {
  appearance: string;
  key: string;
  authored?: string;
  upstream?: string;
}

const differences: Difference[] = [];
let compared = 0;

for (const appearance of ["theme", "light", "dark"] as const) {
  const ours = scope(authored, appearance);
  const theirs = scope(upstream, appearance);
  const [ourVars, theirVars] = [varsOf(ours), varsOf(theirs)];
  for (const key of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
    if (exempt.has(`every ${key}`) || exempt.has(`${appearance} ${key}`)) continue;
    const [mine, theirValue] = [ours[key], theirs[key]];
    const colour = (value: string | undefined, vars: Record<string, string>) => {
      if (value === undefined) return undefined;
      try {
        return resolveColour(value, vars, (name) => missing.add(name));
      } catch {
        return undefined; // a radius, a length, a font: not this check's business
      }
    };
    const [a, b] = [colour(mine, ourVars), colour(theirValue, theirVars)];
    if (!a && !b) continue;
    compared += 1;
    if (a && b && sameColour(a, b)) continue;
    differences.push({
      appearance,
      key,
      ...(mine === undefined ? {} : { authored: `${mine}${a ? ` (${css(a)})` : ""}` }),
      ...(theirValue === undefined ? {} : { upstream: `${theirValue}${b ? ` (${css(b)})` : ""}` }),
    });
  }
}

if (missing.size > 0) {
  console.error(
    `theme:parity: ${UPSTREAM} names ${[...missing].join(", ")}, which it does not define`,
  );
  process.exitCode = 1;
}

for (const difference of differences)
  console.error(
    `theme:parity: ${difference.appearance} ${difference.key}: nsh-gallery ${difference.authored ?? "(not stated)"}, upstream ${difference.upstream ?? "(not stated)"}`,
  );

if (differences.length > 0) {
  console.error(
    `theme:parity: ${differences.length} difference(s) from ${UPSTREAM}; adopt upstream's value, or list the deviation in scripts/theme/parity.ts with its reason (ADR 0012 §7)`,
  );
  process.exitCode = 1;
} else
  console.log(
    `theme:parity: nsh-gallery matches ${UPSTREAM} on ${compared} colours (${EXEMPT.length} exempt keys) — ok`,
  );
