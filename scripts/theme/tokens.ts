/**
 * Shared token helper primitives for the theme diff.
 * Pure: no `node:fs`.
 */
export const BUILD_ROOT_THEME = "nsh-gallery";

export type TokenKind = "color" | "dimension";

export interface ThemeCssVars {
  theme: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export function tokenKind(value: string): TokenKind {
  if (/^\d+(?:\.\d+)?(?:px|rem)$/.test(value.trim())) return "dimension";
  return "color";
}

export function findTokenRefs(value: string): string[] {
  return [...value.matchAll(/\{([a-z0-9-]+)\}/g)].map((m) => m[1]!);
}
