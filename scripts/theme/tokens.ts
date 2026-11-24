/**
 * Design token kinds (named after DTCG `$type`) and `{token}` references shared by `theme-lint`,
 * the theme generators and the unit tests.
 *
 * Pure: no `node:fs`.
 */

/**
 * The theme the runtime artifacts at the top of `packages/theme` are compiled from. `default` is a
 * theme like the others and also the build-time root an app installs, so its pair is written twice
 * (under `themes/default/` and at `packages/theme/`). Nothing else about it is privileged: no rule
 * reads a theme's id, and this constant is the one name a build says out loud.
 */
export const BUILD_ROOT_THEME = "default";

/** Token kinds named after W3C Design Tokens Format Module 2025.10 (`$type`). */
export type TokenKind = "color" | "dimension";

/** A theme file's `cssVars` block, as `theme.json` writes it. */
export interface ThemeCssVars {
  theme: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

/** The `finishes` section of `semantics.json`: shared fields plus sparse per-appearance overrides. */
export interface SplitFinishes<F = Record<string, unknown>> {
  shared: Record<string, F>;
  light: Record<string, Partial<F>>;
  dark: Record<string, Partial<F>>;
}

/** The DTCG `$type` of one token in `cssVars.theme`. */
export function tokenKind(value: string): TokenKind {
  if (/^\d+(?:\.\d+)?(?:px|rem)$/.test(value.trim())) return "dimension";
  return "color";
}

/** Every token declared in a `theme.json`, mapped to its DTCG `$type`. */
export function tokenKinds(cssVars: ThemeCssVars): Map<string, TokenKind> {
  const out = new Map<string, TokenKind>();
  for (const [name, value] of Object.entries(cssVars.theme)) out.set(name, tokenKind(value));
  for (const name of Object.keys(cssVars.light)) out.set(name, "color");
  for (const name of Object.keys(cssVars.dark)) out.set(name, "color");
  return out;
}

/** A whole-string `{token}` reference: returns the token name, or `null` if not a bare reference. */
export function parseTokenRef(value: string): string | null {
  return /^\{([a-z0-9-]+)\}$/.exec(value)?.[1] ?? null;
}

/** Every `{token}` reference appearing anywhere inside a string, in order. */
export function findTokenRefs(value: string): string[] {
  return [...value.matchAll(/\{([a-z0-9-]+)\}/g)].map((m) => m[1]!);
}

/** Deep structural equality for JSON values (primitives, arrays, plain objects). */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key) =>
      key in (b as Record<string, unknown>) &&
      deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

/**
 * Split full `light` and `dark` finish maps into `{ shared, light, dark }`: fields equal in both
 * appearances live once in `shared`; only fields that differ live in the sparse `light` / `dark`
 * override objects. Role and field order follow `light`.
 */
export function splitFinishes<F extends Record<string, unknown>>(
  light: Record<string, F>,
  dark: Record<string, F>,
): SplitFinishes<Record<string, unknown>> {
  const shared: Record<string, Record<string, unknown>> = {};
  const lightDiff: Record<string, Record<string, unknown>> = {};
  const darkDiff: Record<string, Record<string, unknown>> = {};

  for (const [role, lightFinish] of Object.entries(light)) {
    const darkFinish = dark[role] ?? ({} as F);
    const common: Record<string, unknown> = {};
    const onlyLight: Record<string, unknown> = {};
    const onlyDark: Record<string, unknown> = {};

    const keys = [...new Set([...Object.keys(lightFinish), ...Object.keys(darkFinish)])];
    for (const key of keys) {
      const inLight = key in lightFinish;
      const inDark = key in darkFinish;
      if (inLight && inDark && deepEqual(lightFinish[key], darkFinish[key])) {
        common[key] = lightFinish[key];
      } else {
        if (inLight) onlyLight[key] = lightFinish[key];
        if (inDark) onlyDark[key] = darkFinish[key];
      }
    }

    shared[role] = common;
    if (Object.keys(onlyLight).length > 0) lightDiff[role] = onlyLight;
    if (Object.keys(onlyDark).length > 0) darkDiff[role] = onlyDark;
  }

  return { shared, light: lightDiff, dark: darkDiff };
}

/** Merge `shared` with one appearance's sparse overrides into a complete finish map. */
export function mergeFinishes<F extends Record<string, unknown>>(
  finishes: SplitFinishes<F>,
  appearance: "light" | "dark",
): Record<string, F> {
  const overrides = finishes[appearance] ?? {};
  const roles = [...new Set([...Object.keys(finishes.shared), ...Object.keys(overrides)])];
  return Object.fromEntries(
    roles.map((role) => [
      role,
      { ...(finishes.shared[role] ?? {}), ...(overrides[role] ?? {}) } as F,
    ]),
  );
}
