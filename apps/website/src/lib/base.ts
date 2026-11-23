/**
 * Where the site is served. `DOCS_BASE` (read by `vite.config.ts`) becomes Vite's `base`, so
 * `import.meta.env.BASE_URL` is the one source of truth at runtime — always with a trailing slash,
 * `/` at the root.
 */
const BASE = import.meta.env.BASE_URL;

/**
 * A site path as a URL under the base: `/docs/components` → `/dev/docs/components` when the site is
 * served under `/dev/`. External URLs, protocol-relative URLs, fragments and relative paths are
 * returned unchanged.
 */
export function sitePath(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  return `${BASE.replace(/\/$/, "")}${href}`;
}

/** The docs at the Pages root: the latest `v*` tag, what `shadcn-nsh` installs. */
export const RELEASE_DOCS_URL = BASE.replace(/dev\/$/, "");

/** The docs of `main`, one release ahead of the tag. */
export const DEV_DOCS_URL = `${RELEASE_DOCS_URL}dev/`;

/**
 * The other docs site: the `dev/` build links to the release it follows, the release to what is
 * coming. Fixed at build time from the same `DOCS_BASE` (`vite.config.ts`).
 */
export const OTHER_DOCS =
  import.meta.env.DOCS_CHANNEL === "dev"
    ? { href: RELEASE_DOCS_URL, label: "release docs", title: "Docs for the latest release" }
    : { href: DEV_DOCS_URL, label: "dev docs", title: "Docs for the main branch" };

/** A request path without the base it was served under, for the routes that serve files by path. */
export function sitePathname(pathname: string): string {
  const base = BASE.replace(/\/$/, "");
  return base && pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
}
