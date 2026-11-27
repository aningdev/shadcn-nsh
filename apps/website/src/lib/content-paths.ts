/**
 * The pages under `content/docs`, as the routes they answer at, known before anything loads:
 * `import.meta.glob` records the files at build time, and this module only reads their names.
 *
 * A route uses it to answer an unknown path with the router's not-found *without* asking a server
 * function for it — a static build has no answer cached for a page it never prerendered, and the
 * host would hand back `404.html` where JSON was expected.
 *
 * The keys end in `.md`, because that is what `src/routes/docs/$.tsx` asks for (`<slugs>.md`). A
 * page that embeds components is an `.mdx` file with the same route, so it is registered under both
 * its own name and that alias: `themes.mdx` answers `/docs/themes`.
 */
const FILES = import.meta.glob("../../content/docs/**/*.{md,mdx}");

/** `components/button.md`, `getting-started.md`, `themes.mdx` — every page the build has. */
export const CONTENT_PATHS: ReadonlySet<string> = new Set(
  Object.keys(FILES).flatMap((file) => {
    const path = file.replace("../../content/docs/", "");
    return path.endsWith(".mdx") ? [path, path.replace(/\.mdx$/, ".md")] : [path];
  }),
);
