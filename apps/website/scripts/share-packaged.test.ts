import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { WebPackage } from "./package-web";
import { sharePackaged, SHARED_ROOT } from "./share-packaged";

/** A site with the given apps packaged under `demos/`, each from `{ <path>: <bytes> }`. */
function site(apps: Record<string, Record<string, string>>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "share-packaged-"));
  const packages: WebPackage[] = Object.entries(apps).map(([name, files]) => {
    const outDir = path.join(root, "demos", name);
    for (const [rel, bytes] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(outDir, rel)), { recursive: true });
      fs.writeFileSync(path.join(outDir, rel), bytes);
    }
    return { name, entry: `${name}.tsx`, cwd: root, outDir };
  });
  return {
    root,
    packages,
    read: (app: string, rel: string) => fs.readFileSync(path.join(root, "demos", app, rel), "utf8"),
  };
}

/** A page naming the files the way `nsh package` names them. */
const page = (...files: string[]) =>
  [
    "<!doctype html><html><head>",
    ...files.map((rel) => `<link rel="modulepreload" href="./${rel}">`),
    `<script type="application/json" id="nsh-fetch">[${files.map((rel) => `"${rel}"`).join(",")}]</script>`,
    "</head><body></body></html>",
  ].join("\n");

describe("sharePackaged", () => {
  test("keeps one copy of a file two apps share, and points both pages at it", () => {
    const { root, packages, read } = site({
      button: {
        "index.html": page("nsh.f7bcf3ed35.js", "nsh.f7172ac639.wasm"),
        "nsh.f7bcf3ed35.js": "runtime",
        "nsh.f7172ac639.wasm": "wasm",
        "app.0cdef77941.js": "button",
      },
      card: {
        "index.html": page("nsh.f7bcf3ed35.js", "nsh.f7172ac639.wasm"),
        "nsh.f7bcf3ed35.js": "runtime",
        "nsh.f7172ac639.wasm": "wasm",
        "app.11def77941.js": "card",
      },
    });

    const sharing = sharePackaged(packages, root);

    expect(sharing.files).toBe(2);
    expect(fs.readdirSync(path.join(root, SHARED_ROOT)).sort()).toEqual([
      "nsh.f7172ac639.wasm",
      "nsh.f7bcf3ed35.js",
    ]);
    // The app's own bundle stays with the app.
    expect(read("button", "app.0cdef77941.js")).toBe("button");
    expect(fs.existsSync(path.join(root, "demos/button/nsh.f7bcf3ed35.js"))).toBe(false);
    // The page names the shared copy, in both the href and the JSON forms.
    expect(read("button", "index.html")).toContain('href="../../_nsh/nsh.f7bcf3ed35.js"');
    expect(read("card", "index.html")).toContain('["../../_nsh/nsh.f7bcf3ed35.js"');
    expect(read("button", "index.html")).not.toContain('"./nsh');
  });

  test("leaves the page, its bundle, its facades and its manifest with the app", () => {
    const own = {
      "index.html": page(),
      "app.0cdef77941.js": "same",
      "facades/nsh.ts": "same",
      "manifest.webmanifest": "same",
    };
    const { root, packages } = site({ button: { ...own }, card: { ...own } });

    sharePackaged(packages, root);

    expect(fs.existsSync(path.join(root, SHARED_ROOT))).toBe(false);
    expect(fs.existsSync(path.join(root, "demos/card/app.0cdef77941.js"))).toBe(true);
  });

  test("keeps a name whose bytes differ, and names it", () => {
    const { root, packages, read } = site({
      button: { "index.html": page(), "nsh.5201d07cd0.wasm": "one feature set" },
      card: { "index.html": page(), "nsh.5201d07cd0.wasm": "another" },
    });

    const sharing = sharePackaged(packages, root);

    expect(sharing.differing).toEqual(["nsh.5201d07cd0.wasm"]);
    expect(read("card", "nsh.5201d07cd0.wasm")).toBe("another");
  });

  test("drops the precompressed siblings, which no page requests", () => {
    const { root, packages } = site({
      button: {
        "index.html": page("nsh.f7bcf3ed35.js"),
        "nsh.f7bcf3ed35.js": "0123456789",
        "nsh.f7bcf3ed35.js.gz": "0123456789",
        "nsh.f7bcf3ed35.js.br": "0123456789",
      },
    });

    const sharing = sharePackaged(packages, root);

    expect(sharing.dropped).toBe(20);
    expect(fs.readdirSync(path.join(root, "demos/button")).sort()).toEqual([
      "index.html",
      "nsh.f7bcf3ed35.js",
    ]);
  });

  test("throws when a page names a shared file in a form it cannot rewrite", () => {
    const { root, packages } = site({
      button: { "index.html": page("a.js"), "a.js": "a" },
      card: { "index.html": page("a.js"), "a.js": "a" },
    });
    // A reference the page builds from a bare name, not `./<rel>` or `"<rel>"`.
    fs.writeFileSync(
      path.join(root, "demos/card/index.html"),
      page("a.js").replace('"./a.js"', '"/a.js"'),
    );

    expect(() => sharePackaged(packages, root)).toThrow("sharePackaged does not rewrite");
  });
});
