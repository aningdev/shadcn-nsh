import { afterEach, describe, expect, test } from "bun:test";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { runAdd } from "./add";
import { runDiff } from "./diff";

const fixture = (): Fixture => makeFixture({ items: ["theme", "press", "spinner", "button"] });

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

  test("asks for init when the app has no nsh-ui.json", async () => {
    current = fixture();
    const out = await captured(() => runDiff([], { cwd: current!.app, registry: current!.url }));

    expect(out.result).toBe(1);
    expect(out.text).toBe("No nsh-ui.json — run init first.");
  });
});
