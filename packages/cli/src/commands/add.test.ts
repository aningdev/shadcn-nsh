import { afterEach, describe, expect, test } from "bun:test";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { runAdd } from "./add";

const fixture = (): Fixture => makeFixture({ items: ["theme", "press", "spinner", "button"] });

let current: Fixture | null = null;

afterEach(() => {
  current?.remove();
  current = null;
});

describe("add", () => {
  test("writes the item and its dependencies, imports rewritten", async () => {
    current = fixture();
    const out = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.result).toBe(0);
    expect(current.exists("nsh-ui.json")).toBe(true);
    expect(current.exists("components/ui/button.tsx")).toBe(true);
    expect(current.exists("components/ui/spinner.tsx")).toBe(true);
    expect(current.exists("lib/press.ts")).toBe(true);
    expect(current.exists("lib/theme.ts")).toBe(true);
    expect(current.exists("theme.json")).toBe(true);
    expect(current.read("components/ui/button.tsx")).toContain('from "../../lib/theme"');
    expect(out.lines).toContain("write components/ui/button.tsx");
  });

  test("skips a file that is identical", async () => {
    current = fixture();
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: current!.url }));

    const again = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url }),
    );
    expect(again.lines).toContain("skip components/ui/button.tsx (identical)");
  });

  test("keeps a file the app changed, and says how to see it", async () => {
    current = fixture();
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: current!.url }));
    const changed = `${current.read("components/ui/button.tsx")}// mine\n`;
    current.write("components/ui/button.tsx", changed);

    const again = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url }),
    );

    expect(again.lines).toContain("kept components/ui/button.tsx, differs (run diff)");
    expect(current.read("components/ui/button.tsx")).toBe(changed);
  });

  test("--overwrite replaces it and summarises what that changes", async () => {
    current = fixture();
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: current!.url }));
    const original = current.read("components/ui/button.tsx");
    current.write("components/ui/button.tsx", `${original}// mine\n`);

    const again = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url, overwrite: true }),
    );

    expect(again.lines).toContain("overwrite components/ui/button.tsx (+0 -1)");
    expect(current.read("components/ui/button.tsx")).toBe(original);
  });

  test("--dry-run prints what would happen and writes nothing", async () => {
    current = fixture();
    const out = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url, dryRun: true }),
    );

    expect(out.result).toBe(0);
    expect(out.lines).toContain("would write components/ui/button.tsx");
    expect(out.lines).toContain("would write theme.json");
    expect(out.text).toContain("Dry run: nothing written.");
    expect(current.exists("components/ui/button.tsx")).toBe(false);
    expect(current.exists("theme.json")).toBe(false);
    expect(current.exists("nsh-ui.json")).toBe(false);
  });

  test("--dry-run --overwrite reports the diff it would apply", async () => {
    current = fixture();
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: current!.url }));
    const changed = `${current.read("components/ui/button.tsx")}// mine\n`;
    current.write("components/ui/button.tsx", changed);

    const out = await captured(() =>
      runAdd(["button"], {
        cwd: current!.app,
        registry: current!.url,
        dryRun: true,
        overwrite: true,
      }),
    );

    expect(out.lines).toContain("would overwrite components/ui/button.tsx (+0 -1)");
    expect(current.read("components/ui/button.tsx")).toBe(changed);
  });

  test("--all adds every registry:ui item", async () => {
    current = fixture();
    const out = await captured(() =>
      runAdd([], { cwd: current!.app, registry: current!.url, all: true }),
    );

    expect(out.result).toBe(0);
    expect(current.exists("components/ui/button.tsx")).toBe(true);
    expect(current.exists("components/ui/spinner.tsx")).toBe(true);
    // The theme is a dependency of both, not a ui item itself.
    expect(current.exists("theme.json")).toBe(true);
    expect(out.text).toContain("Added: all 2 registry:ui items");
  });

  test("keeps a recolored theme without sending the reader to diff", async () => {
    current = fixture();
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: current!.url }));
    const theme = JSON.parse(current.read("theme.json")) as {
      cssVars: { light: Record<string, string> };
    };
    theme.cssVars.light.primary = "#123456";
    current.write("theme.json", `${JSON.stringify(theme, null, 2)}\n`);

    const again = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url }),
    );

    expect(again.lines).toContain("kept theme.json (the app's colors stay)");
    const kept = JSON.parse(current.read("theme.json")) as {
      cssVars: { light: Record<string, string> };
    };
    expect(kept.cssVars.light.primary).toBe("#123456");
  });

  test("merges a theme.json that only lacks keys", async () => {
    current = fixture();
    await captured(() => runAdd(["button"], { cwd: current!.app, registry: current!.url }));
    const theme = JSON.parse(current.read("theme.json")) as {
      cssVars: { light: Record<string, string> };
    };
    delete theme.cssVars.light.primary;
    current.write("theme.json", `${JSON.stringify(theme, null, 2)}\n`);

    const again = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url }),
    );

    expect(again.lines.some((line) => line.startsWith("merge theme.json (added 1 key"))).toBe(true);
    const merged = JSON.parse(current.read("theme.json")) as {
      cssVars: { light: Record<string, string> };
    };
    expect(typeof merged.cssVars.light.primary).toBe("string");
  });

  test("asks for a name when neither components nor --all are given", async () => {
    current = fixture();
    let error: unknown;
    try {
      await runAdd([], { cwd: current.app, registry: current.url });
    } catch (caught) {
      error = caught;
    }
    expect(String(error)).toContain("Name at least one component, or pass --all.");
    expect(current.exists("nsh-ui.json")).toBe(false);
  });
});
