/**
 * Verify that `nsh-gallery` preserves color parity with upstream `references/nsh/examples/nsh-gallery-ui/theme.json`
 * for every retained role in Theme v5 (`ADR 0020`).
 */
import { readFileSync } from "node:fs";

import { resolveColour, sameColour, varsOf } from "./css-colour";
import { css } from "./oklch";

const UPSTREAM = "references/nsh/examples/nsh-gallery-ui/theme.json";
const AUTHORED = "packages/theme/themes/nsh-gallery/theme.json";

interface Exemption {
  key: string;
  appearance?: "theme" | "light" | "dark";
  reason: string;
}

const EXEMPT: Exemption[] = [
  // Upstream-only chrome / app keys not in Theme v5
  { key: "code", reason: "upstream's code-view ground" },
  { key: "down", reason: "upstream's negative trend; `destructive` carries it" },
  { key: "down-tint", reason: "upstream's negative trend tint" },
  { key: "scrollbar-thumb", reason: "shell owns scrollbar styling" },
  { key: "scrollbar-thumb-hover", reason: "shell owns scrollbar styling" },
  { key: "violet", reason: "upstream chart accent; not a core role" },
  { key: "window-control-off", reason: "gallery window chrome" },
  { key: "brand-fill", reason: "`primary` carries it" },
  { key: "on-brand", reason: "`primary-foreground` carries it" },
  { key: "window-close", reason: "gallery window chrome" },
  { key: "window-minimize", reason: "gallery window chrome" },
  { key: "window-zoom", reason: "gallery window chrome" },
  { key: "window-control-ink", reason: "gallery window chrome" },
  { key: "window-control-edge", reason: "gallery window chrome" },
  { key: "media", reason: "v5 C-layer media ground" },
  { key: "on-media", reason: "v5 C-layer media ink" },
  { key: "radius-card", reason: "upstream card radius" },
  { key: "radius-container", reason: "v5 layer radius scale" },
  { key: "radius-modal", reason: "v5 layer radius scale" },
  // Keys removed/internalized from theme.json in Theme v5 (`ADR 0020`)
  { key: "sidebar", reason: "removed in ADR 0020; sidebar reads `background`" },
  { key: "sidebar-foreground", reason: "removed in ADR 0020" },
  { key: "sidebar-primary", reason: "removed in ADR 0020" },
  { key: "sidebar-primary-foreground", reason: "removed in ADR 0020" },
  { key: "sidebar-accent", reason: "removed in ADR 0020" },
  { key: "sidebar-accent-foreground", reason: "removed in ADR 0020" },
  { key: "sidebar-border", reason: "removed in ADR 0020" },
  { key: "sidebar-ring", reason: "removed in ADR 0020" },
  { key: "card-foreground", reason: "removed in ADR 0020; inherits `foreground`" },
  { key: "popover-foreground", reason: "removed in ADR 0020; inherits `foreground`" },
  { key: "secondary-foreground", reason: "removed in ADR 0020; inherits `foreground`" },
  { key: "accent-foreground", reason: "removed in ADR 0020; inherits `foreground`" },
  { key: "brand-tint", reason: "computed reactively in runtime `tints.brand` (ADR 0020)" },
  { key: "info-tint", reason: "computed reactively in runtime `tints.info` (ADR 0020)" },
  { key: "warn-tint", reason: "computed reactively in runtime `tints.warning` (ADR 0020)" },
  {
    key: "destructive-tint",
    reason: "computed reactively in runtime `tints.destructive` (ADR 0020)",
  },
  { key: "up-tint", reason: "computed reactively in runtime `tints.success` (ADR 0020)" },
  { key: "chart-1", reason: "optional in v5 `tokens.chart` (ADR 0020)" },
  { key: "chart-2", reason: "optional in v5 `tokens.chart` (ADR 0020)" },
  { key: "chart-3", reason: "optional in v5 `tokens.chart` (ADR 0020)" },
  { key: "chart-4", reason: "optional in v5 `tokens.chart` (ADR 0020)" },
  { key: "chart-5", reason: "optional in v5 `tokens.chart` (ADR 0020)" },
  { key: "inset", reason: "moved into `surfaces.inset` (ADR 0020)" },
  { key: "field", reason: "moved into `controls.field.ground` (ADR 0020)" },
  { key: "track", reason: "moved into `controls.slider.face` (ADR 0020)" },
  { key: "knob", reason: "moved into `controls.{switch,slider}.knob` (ADR 0020)" },
  { key: "hover", reason: "moved into `feedback.hover.fill` (ADR 0020)" },
  { key: "raised", reason: "renamed to `surface` in v5 `theme.json` (ADR 0020)" },
  { key: "surface", reason: "renamed from `raised` in v5 `theme.json` (checked below)" },
  { key: "up", reason: "standardized to `success` in ADR 0020 (checked below)" },
  { key: "success", reason: "standardized from `up` in ADR 0020 (checked below)" },
  { key: "warn", reason: "standardized to `warning` in ADR 0020 (checked below)" },
  { key: "warning", reason: "standardized from `warn` in ADR 0020 (checked below)" },
];

const RENAMED_UPSTREAM: Record<string, string> = {
  surface: "raised",
  success: "up",
  warning: "warn",
};

interface ThemeFile {
  name: string;
  cssVars: Record<string, Record<string, string> | undefined>;
}

const scope = (theme: ThemeFile, appearance: string): Record<string, string> => ({
  ...theme.cssVars.theme,
  ...(theme.cssVars[appearance] ?? {}),
});

const read = (path: string) => JSON.parse(readFileSync(path, "utf8")) as ThemeFile;
const authored = read(AUTHORED);
const upstream = read(UPSTREAM);
const exempt = new Set(EXEMPT.map((e) => `${e.appearance ?? "every"} ${e.key}`));
const missing = new Set<string>();
const differences: { appearance: string; key: string; authored?: string; upstream?: string }[] = [];
let compared = 0;

for (const appearance of ["theme", "light", "dark"] as const) {
  const ours = scope(authored, appearance);
  const theirs = scope(upstream, appearance);
  const [ourVars, theirVars] = [varsOf(ours), varsOf(theirs)];
  const colour = (value: string | undefined, vars: Record<string, string>) => {
    if (value === undefined) return undefined;
    try {
      return resolveColour(value, vars, (name) => missing.add(name));
    } catch {
      return undefined;
    }
  };
  for (const key of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
    if (exempt.has(`every ${key}`) || exempt.has(`${appearance} ${key}`)) continue;
    const [a, b] = [colour(ours[key], ourVars), colour(theirs[key], theirVars)];
    if (!a && !b) continue;
    compared += 1;
    if (a && b && sameColour(a, b)) continue;
    differences.push({
      appearance,
      key,
      ...(ours[key] === undefined ? {} : { authored: `${ours[key]}${a ? ` (${css(a)})` : ""}` }),
      ...(theirs[key] === undefined
        ? {}
        : { upstream: `${theirs[key]}${b ? ` (${css(b)})` : ""}` }),
    });
  }
  for (const [ourKey, theirKey] of Object.entries(RENAMED_UPSTREAM)) {
    const [a, b] = [colour(ours[ourKey], ourVars), colour(theirs[theirKey], theirVars)];
    if (!a || !b) continue;
    compared += 1;
    if (!sameColour(a, b)) {
      differences.push({
        appearance,
        key: `${ourKey} (upstream:${theirKey})`,
        authored: `${ours[ourKey]} (${css(a)})`,
        upstream: `${theirs[theirKey]} (${css(b)})`,
      });
    }
  }
}

if (missing.size > 0) {
  console.error(`theme:parity: ${UPSTREAM} names missing vars: ${[...missing].join(", ")}`);
  process.exitCode = 1;
}
for (const d of differences) {
  console.error(
    `theme:parity: ${d.appearance} ${d.key}: nsh-gallery ${d.authored ?? "(missing)"}, upstream ${d.upstream ?? "(missing)"}`,
  );
}
if (differences.length > 0) {
  process.exitCode = 1;
} else {
  console.log(`theme:parity: nsh-gallery matches ${UPSTREAM} on ${compared} colours — ok`);
}
