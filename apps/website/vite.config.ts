import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig, runnerImport } from "vite";

import { PALETTES } from "./demos/palettes";
import { PACKAGE_MANAGER_GROUP, PACKAGE_MANAGERS } from "./src/lib/package-managers";

/** The path the site is served under; both Vite and the router read it. */
const BASE = "/";

/**
 * The one MDX setup: Fumadocs' plugin with the site's npm-tab options. A factory, because it is
 * used twice — once to read the page list before the config is built, once by the build itself —
 * and each Vite instance needs its own plugin.
 */
function docsMdx() {
  // A command fenced as `npm` becomes a Fumadocs `CodeBlockTabs` group whose tabs are this site's
  // three package managers; the shared `groupId` + `persist` keeps the choice across blocks and
  // pages. `remarkNpmOptions` is the only MDX option the site sets, so the default preset stays.
  return fumadocsMdx({
    globalOptions: {
      mdxOptions: {
        remarkNpmOptions: {
          persist: { id: PACKAGE_MANAGER_GROUP },
          packageManagers: PACKAGE_MANAGERS,
        },
      },
    },
  });
}

/**
 * The files `docsLlms` answers — `/llms.txt`, `/llms-full.txt` and a `.md` per page — read before
 * the config is built, because Nitro has to be told which routes to prerender. TanStack's own
 * prerender cannot fetch them: it requests every page with a trailing slash, which a route for a
 * file does not match. `runnerImport` loads `source.ts` through the same MDX plugin the build uses,
 * since Vite loads the config without the plugins it declares.
 */
const { docsLlms } = (
  await runnerImport<typeof import("./src/lib/source")>("./src/lib/source.ts", {
    plugins: [docsMdx()],
    resolve: { tsconfigPaths: true },
  })
).module;

/**
 * The site is served at the root of its own domain, `https://shadcn-nsh.aning.dev/` (GitHub Pages'
 * custom domain). `base` and `basepath` stay wired, so moving it under a path again is this one
 * constant: Vite's `base` prefixes the URLs it emits, TanStack Router's `basepath` the ones it
 * matches.
 */
export default defineConfig({
  base: BASE,
  server: {
    port: 4321,
  },
  plugins: [
    docsMdx(),
    tailwindcss(),
    tanstackStart({
      router: { basepath: BASE.replace(/\/+$/, "") },
      // The shell is prerendered as a page whose path is `maskPath`, and pages are deduplicated by
      // path: at the default `/` it takes the front page's place, and `/` is written as
      // `_shell.html` with no `index.html`. The query keeps the paths apart; it still renders `/`.
      spa: { enabled: true, maskPath: "/?shell" },
      prerender: {
        enabled: true,
        crawlLinks: true,
        // The demo panel links each packaged demo (`demos/<name>/index.html`) and the showcase
        // page its app (`showcase-app/index.html`); the crawler would follow them and write the
        // page back without the script `player-options.ts` put in its head, so every preview
        // failed on `window.nshDemo`. Those pages are built, not rendered. The route `/showcase`
        // itself prerenders: it is this site's page, not the packaged app.
        filter: ({ path }) => !path.includes("/demos/") && !path.includes("/showcase-app/"),
      },
      // The search index is a prerendered response (`/api/search`), the only server route the
      // static site keeps: `src/routes/api/search.ts` answers it with `staticGET`.
      // Theme pages are listed from the same palettes as the docs, so a new palette is prerendered
      // once its page exists. The crawl still walks every other link.
      pages: [
        { path: "/docs/getting-started" },
        { path: "/api/search" },
        { path: "/docs/themes" },
        ...PALETTES.map((palette) => ({ path: `/docs/themes/${palette.id}` })),
      ],
    }),
    react(),
    // The Markdown files for agents are static output too; Nitro prerenders exactly the paths
    // `docsLlms` serves, read above.
    nitro({ prerender: { routes: await docsLlms.files() } }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
});
