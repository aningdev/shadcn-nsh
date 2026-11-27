import { readFileSync } from "node:fs";
import { constants as zlibConstants, createBrotliCompress, createGzip } from "node:zlib";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin, runnerImport } from "vite";

import { PALETTES } from "./demos/palettes";
import { PACKAGE_MANAGER_GROUP, PACKAGE_MANAGERS } from "./src/lib/package-managers";

/**
 * The path the site is served under, from `DOCS_BASE`; both Vite (assets) and the router
 * (basepath) read it, and `import.meta.env.BASE_URL` carries it to the code. The deploy workflow
 * sets it to `/` for a `v*` tag (the release docs at the root) and `/dev/` for `main`.
 */
function normalizeBase(value: string): string {
  const path = value.trim().replace(/^\/+|\/+$/g, "");
  return path === "" ? "/" : `/${path}/`;
}

const BASE = normalizeBase(process.env.DOCS_BASE ?? "/");

/** Which of the two docs sites this build is; the label next to the name and its link follow it. */
const CHANNEL = BASE.endsWith("/dev/") ? "dev" : "release";

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
 * The version the site documents, read once at build time so nothing is fetched at run time and the
 * changelog never ships: the CLI's version, which the library shares (`docs/toolchain.md`, 发版), and
 * whether `CHANGELOG.md`'s `Unreleased` has entries. The `/dev/` build comes from `main`, so with
 * entries it documents changes the release does not have yet, and its label says so; a tag build
 * has none.
 */
const DOCS_VERSION: string = JSON.parse(
  readFileSync(new URL("../../packages/cli/package.json", import.meta.url), "utf8"),
).version;
const changelog = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");
const DOCS_UNRELEASED = /^## Unreleased\n([\s\S]*?)(?=^## )/m.exec(changelog)?.[1]?.trim() !== "";

const COMPRESSIBLE = /^(text\/|application\/(javascript|json|wasm|xml)|image\/svg\+xml)(\s*;|$)/i;

const IMMUTABLE_ASSET = /\.[0-9a-f]{8,}\.(wasm|js|css)(\?.*)?$/i;

/** Stream-compresses text, JS, JSON, SVG, and WASM responses at max quality (`br` 11 / `gzip` 9) in `vite dev`, caching immutable hashed assets in memory. */
function devGzip(): Plugin {
  const cache = new Map<string, { type: string; body: Buffer }>();
  return {
    name: "dev-gzip",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const accept = String(req.headers["accept-encoding"] ?? "");
        const encodingMethod = /\bbr\b/i.test(accept)
          ? "br"
          : /\bgzip\b/i.test(accept)
            ? "gzip"
            : null;
        if (req.method === "HEAD" || !encodingMethod) {
          return next();
        }
        const url = req.url ?? "";
        const cacheKey = IMMUTABLE_ASSET.test(url) ? `${encodingMethod}:${url}` : null;
        if (cacheKey) {
          const hit = cache.get(cacheKey);
          if (hit) {
            res.statusCode = 200;
            res.setHeader("content-type", hit.type);
            res.setHeader("content-encoding", encodingMethod);
            res.setHeader("content-length", String(hit.body.length));
            res.setHeader("vary", "Accept-Encoding");
            return res.end(hit.body);
          }
        }
        const rawWriteHead = res.writeHead.bind(res);
        const rawWrite = res.write.bind(res);
        const rawEnd = res.end.bind(res);
        let compressor:
          | ReturnType<typeof createGzip>
          | ReturnType<typeof createBrotliCompress>
          | null = null;
        let decided = false;
        const chunks: Buffer[] | null = cacheKey ? [] : null;

        const init = (statusCode: number) => {
          if (decided) return;
          decided = true;
          const contentType = String(res.getHeader("content-type") ?? "");
          const encoding = res.getHeader("content-encoding");
          const length = Number(res.getHeader("content-length") ?? 0);
          if (
            statusCode !== 200 ||
            encoding ||
            !contentType ||
            contentType.includes("text/event-stream") ||
            (length > 0 && length < 1024) ||
            !COMPRESSIBLE.test(contentType)
          ) {
            return;
          }
          res.removeHeader("content-length");
          res.setHeader("content-encoding", encodingMethod);
          const vary = res.getHeader("vary");
          res.setHeader("vary", vary ? `${vary}, Accept-Encoding` : "Accept-Encoding");
          compressor =
            encodingMethod === "br"
              ? createBrotliCompress({
                  params: {
                    [zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY,
                  },
                })
              : createGzip({ level: zlibConstants.Z_BEST_COMPRESSION });
          compressor.on("data", (chunk: Buffer) => {
            if (chunks) chunks.push(chunk);
            rawWrite(chunk);
          });
          compressor.on("drain", () => res.emit("drain"));
          compressor.on("end", () => {
            if (cacheKey && chunks) {
              if (cache.size >= 64) {
                const oldest = cache.keys().next().value;
                if (oldest !== undefined) cache.delete(oldest);
              }
              cache.set(cacheKey, { type: contentType, body: Buffer.concat(chunks) });
            }
            rawEnd();
          });
        };

        res.writeHead = ((statusCode: number, ...args: unknown[]) => {
          const last = args.length > 0 ? args[args.length - 1] : undefined;
          if (Array.isArray(last)) {
            decided = true;
            return (rawWriteHead as (...a: unknown[]) => unknown)(statusCode, ...args);
          }
          if (last && typeof last === "object") {
            if (last instanceof Headers) {
              last.forEach((v, k) => res.setHeader(k, v));
            } else {
              for (const [k, v] of Object.entries(
                last as Record<string, string | number | readonly string[]>,
              )) {
                res.setHeader(k, v);
              }
            }
          }
          init(statusCode);
          return typeof args[0] === "string"
            ? (rawWriteHead as (s: number, m: string) => unknown)(statusCode, args[0])
            : rawWriteHead(statusCode);
        }) as typeof res.writeHead;

        res.write = ((...args: unknown[]) => {
          init(res.statusCode || 200);
          if (!compressor) return (rawWrite as (...a: unknown[]) => boolean)(...args);
          return (compressor.write as (...a: unknown[]) => boolean)(...args);
        }) as typeof res.write;

        res.end = ((...args: unknown[]) => {
          init(res.statusCode || 200);
          if (!compressor) return (rawEnd as (...a: unknown[]) => typeof res)(...args);
          (compressor.end as (...a: unknown[]) => unknown)(...args);
          return res;
        }) as typeof res.end;

        next();
      });
    },
  };
}

/**
 * Two docs sites, one build: the root holds the latest release (built from its `v*` tag), `/dev/`
 * holds `main`. `base` and `basepath` are wired to `DOCS_BASE`; `import.meta.env.BASE_URL`
 * prefixes the URLs written in code.
 */
export default defineConfig({
  base: BASE,
  define: {
    "import.meta.env.DOCS_VERSION": JSON.stringify(DOCS_VERSION),
    "import.meta.env.DOCS_UNRELEASED": JSON.stringify(DOCS_UNRELEASED),
    "import.meta.env.DOCS_CHANNEL": JSON.stringify(CHANNEL),
  },
  server: {
    port: 4321,
  },
  plugins: [
    devGzip(),
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
        // The demo panel links each packaged demo (`demos/<name>/index.html`) and the home page
        // the showcase app (`showcase/index.html`); the crawler would follow them and write the
        // page back without the script `player-options.ts` put in its head, so every preview
        // failed on `window.nshDemo`. Those pages are built, not rendered.
        filter: ({ path }) => !path.includes("/demos/") && !path.includes("/showcase/"),
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
    // The Markdown files for agents are served by routes that read a path, so Nitro prerenders
    // them with the same base the site is served under; it strips the base before writing them, so
    // they land beside the HTML.
    nitro({ baseURL: BASE, prerender: { routes: await docsLlms.files() } }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
});
