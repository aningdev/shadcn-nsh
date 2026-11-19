import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

import { PACKAGE_MANAGER_GROUP, PACKAGE_MANAGERS } from "./src/lib/package-managers";

/** The path the site is served under; `src/lib/site.ts` reads it back from Vite. */
const BASE = "/";

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
    // A command fenced as `npm` becomes a Fumadocs `CodeBlockTabs` group whose tabs are this site's
    // three package managers; the shared `groupId` + `persist` keeps the choice across blocks and
    // pages. `remarkNpmOptions` is the only MDX option the site sets, so the default preset stays.
    fumadocsMdx({
      globalOptions: {
        mdxOptions: {
          remarkNpmOptions: {
            persist: { id: PACKAGE_MANAGER_GROUP },
            packageManagers: PACKAGE_MANAGERS,
          },
        },
      },
    }),
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
        // The demo panel links each packaged demo (`demos/<name>/index.html`); the crawler would
        // follow it and write the page back without the script `player-options.ts` put in its
        // head, so every preview failed on `window.nshDemo`. Those pages are built, not rendered.
        filter: ({ path }) => !path.includes("/demos/"),
      },
      // The search index is a prerendered response (`/api/search`), the only server route the
      // static site keeps: `src/routes/api/search.ts` answers it with `staticGET`.
      pages: [{ path: "/docs/getting-started" }, { path: "/api/search" }],
    }),
    react(),
    nitro(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
});
