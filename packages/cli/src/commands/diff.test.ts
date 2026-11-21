import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { runAdd } from "./add";
import { DIFF_SKIPPED, runDiff } from "./diff";

const fixture = (): Fixture =>
  makeFixture({
    items: ["theme", "switch-geometry", "press", "spinner", "as-text", "icons", "button", "utils"],
    installed: true,
  });

/** An app with `button` installed. */
async function installed(): Promise<Fixture> {
  const app = fixture();
  await captured(() => runAdd(["button"], { cwd: app.app, registry: app.url }));
  return app;
}

let current: Fixture | null = null;

afterEach(() => {
  current?.remove();
  current = null;
});

describe("diff", () => {
  test("reports no differences right after add", async () => {
    current = await installed();
    const out = await captured(() => runDiff([], { cwd: current!.app, registry: current!.url }));

    expect(out.result).toBe(0);
    expect(out.text).toBe("No differences.");
  });

  test("lists the items that differ, and exits 1", async () => {
    current = await installed();
    current.write(
      "components/ui/button.tsx",
      `${current.read("components/ui/button.tsx")}// mine\n`,
    );

    const out = await captured(() => runDiff([], { cwd: current!.app, registry: current!.url }));

    expect(out.result).toBe(1);
    expect(out.text).toContain("button (+0 -1)");
    expect(out.text).toContain("  components/ui/button.tsx");
    expect(out.text).toContain("Run shadcn-nsh diff <item> to see the changes.");
  });

  test("prints the changed lines for an item", async () => {
    current = await installed();
    const file = "components/ui/button.tsx";
    current.write(file, `${current.read(file)}// mine\n`);

    const out = await captured(() =>
      runDiff(["button"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.result).toBe(1);
    expect(out.text).toContain("components/ui/button.tsx (+0 -1)");
    expect(out.text).toContain("- // mine");
  });

  test("compares theme.json by key: a recolored theme is the app's own", async () => {
    current = await installed();
    const theme = JSON.parse(current.read("theme.json")) as {
      cssVars: { light: Record<string, string> };
    };
    theme.cssVars.light.primary = "#123456";
    current.write("theme.json", `${JSON.stringify(theme, null, 2)}\n`);

    const same = await captured(() => runDiff([], { cwd: current!.app, registry: current!.url }));
    expect(same.result).toBe(0);

    delete theme.cssVars.light.primary;
    current.write("theme.json", `${JSON.stringify(theme, null, 2)}\n`);
    const missing = await captured(() =>
      runDiff([], { cwd: current!.app, registry: current!.url }),
    );
    expect(missing.result).toBe(1);
    expect(missing.text).toContain("theme (+");
    expect(missing.text).toContain("  theme.json");
  });

  test("compares semantics.json by key: customized values stay, missing keys differ", async () => {
    current = await installed();
    const semantics = JSON.parse(current.read("lib/ui/semantics.json")) as {
      state: { pressScale: number };
      finishes: { shared: Record<string, Record<string, unknown>> };
    };
    semantics.state.pressScale = 1;
    current.write("lib/ui/semantics.json", `${JSON.stringify(semantics, null, 2)}\n`);

    const same = await captured(() => runDiff([], { cwd: current!.app, registry: current!.url }));
    expect(same.result).toBe(0);

    delete semantics.finishes.shared.dialog;
    current.write("lib/ui/semantics.json", `${JSON.stringify(semantics, null, 2)}\n`);
    const missing = await captured(() =>
      runDiff([], { cwd: current!.app, registry: current!.url }),
    );
    expect(missing.result).toBe(1);
    expect(missing.text).toContain("theme (+");
    expect(missing.text).toContain("  lib/ui/semantics.json");
  });

  test("asks for init when the app has no nsh-ui.json", async () => {
    current = fixture();
    const out = await captured(() => runDiff([], { cwd: current!.app, registry: current!.url }));

    expect(out.result).toBe(1);
    expect(out.text).toBe("No nsh-ui.json — run init first.");
  });
});

describe("diff offline", () => {
  let cacheDir: string;
  let previous: string | undefined;

  /** The fixture's registry over HTTP — only those URLs are cached — and the way to take it down. */
  function serve(app: Fixture) {
    const server = Bun.serve({
      port: 0,
      fetch: (req) => new Response(Bun.file(path.join(app.registry, new URL(req.url).pathname))),
    });
    return { url: `http://localhost:${server.port}/{name}.json`, stop: () => server.stop(true) };
  }

  const useCache = () => {
    previous = process.env.SHADCN_NSH_CACHE_DIR;
    cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-nsh-cache-"));
    process.env.SHADCN_NSH_CACHE_DIR = cacheDir;
  };

  afterEach(() => {
    if (previous === undefined) delete process.env.SHADCN_NSH_CACHE_DIR;
    else process.env.SHADCN_NSH_CACHE_DIR = previous;
    fs.rmSync(cacheDir, { recursive: true, force: true });
  });

  test("compares with what the last add cached, and says so", async () => {
    useCache();
    current = fixture();
    const registry = serve(current);
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: registry.url }));
    await registry.stop();

    current.write(
      "components/ui/button.tsx",
      `${current.read("components/ui/button.tsx")}// mine\n`,
    );
    const offline = await captured(() =>
      runDiff([], { cwd: current!.app, registry: registry.url }),
    );

    expect(offline.result).toBe(1);
    expect(offline.text).toContain("button (+0 -1)");
    expect(offline.errors.join("\n")).toMatch(
      /cannot reach localhost:\d+ — using the registry cached /,
    );
  });

  test("a named item needs only its own copies, not the catalog", async () => {
    useCache();
    current = fixture();
    const registry = serve(current);
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: registry.url }));
    await registry.stop();
    for (const file of fs.readdirSync(cacheDir)) {
      const { url } = JSON.parse(fs.readFileSync(path.join(cacheDir, file), "utf8")) as {
        url: string;
      };
      if (url.endsWith("/index.json")) fs.rmSync(path.join(cacheDir, file));
    }

    const out = await captured(() =>
      runDiff(["button"], { cwd: current!.app, registry: registry.url }),
    );

    expect(out.result).toBe(0);
    expect(out.text).toBe("No differences.");
  });

  test("with nothing cached, skips and exits with its own code", async () => {
    useCache();
    current = await installed();
    const registry = serve(current);
    await registry.stop();

    const out = await captured(() => runDiff([], { cwd: current!.app, registry: registry.url }));

    expect(out.result).toBe(DIFF_SKIPPED);
    expect(out.text).toBe("");
    expect(out.errors.join("\n")).toContain("no cached copy of it. diff skipped.");
  });
});
