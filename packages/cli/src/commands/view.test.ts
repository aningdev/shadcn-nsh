import { afterEach, describe, expect, test } from "bun:test";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { runView } from "./view";

const fixture = (): Fixture => makeFixture({ items: ["theme", "press", "spinner", "button"] });

let current: Fixture | null = null;

afterEach(() => {
  current?.remove();
  current = null;
});

describe("view", () => {
  test("prints each file at its target, dependencies first, imports rewritten", async () => {
    current = fixture();
    const out = await captured(() =>
      runView(["button"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.result).toBe(0);
    expect(out.text).toContain("button (registry:ui)");
    expect(out.text).toContain("  depends on: press, spinner, theme");
    expect(out.text).toContain("file components/ui/button.tsx");
    expect(out.text).toContain("file lib/press.ts");
    expect(out.text).toContain("file lib/theme.ts");
    // The app's layout decides the import: `@shadcn-nsh/theme` → `lib/theme` two levels up.
    expect(out.text).not.toContain('"@shadcn-nsh/theme"');
    expect(out.text).toContain('from "../../lib/theme"');
  });

  test("writes nothing", async () => {
    current = fixture();
    await captured(() => runView(["button"], { cwd: current!.app, registry: current!.url }));

    expect(current.exists("components/ui/button.tsx")).toBe(false);
    expect(current.exists("nsh-ui.json")).toBe(false);
  });
});
