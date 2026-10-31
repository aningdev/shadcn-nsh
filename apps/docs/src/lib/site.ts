/** Site constants for the shadcn-nsh docs (NSH website shell, local content). */

export const SITE_URL = "https://aningdev.github.io/shadcn-nsh";

export const SITE_TITLE = "shadcn-nsh";

export const SITE_DESCRIPTION =
  "Styled component layer for Native Shell: copy-into-app components on nsh/base, same idea as shadcn/ui on Radix.";

export const REPO_URL = "https://github.com/aningdev/shadcn-nsh";

export const NSH_SITE_URL = "https://nsh.dev";

export const EDIT_BASE = `${REPO_URL}/edit/main/`;

export type Lang = "en" | "zh-CN";

/** `BASE_URL` with exactly one trailing slash. */
export const BASE = `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/`;

/** A site path (`docs/x`, `/docs/x`) below the base. */
export function url(path = ""): string {
  const joined = `${BASE}${path.replace(/^\/+/, "")}`;
  return joined.length > 1 ? joined.replace(/\/+$/, "") : joined;
}
