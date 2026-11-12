import { afterEach, describe, expect, test } from "bun:test";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { runList } from "./list";

const fixture = (files?: Record<string, string>): Fixture =>
  makeFixture({ items: ["theme", "press", "spinner", "button"], files });

let current: Fixture | null = null;

afterEach(() => {
  current?.remove();
  current = null;
});

describe("list", () => {
  test("names every item with its type and description, marking none installed", async () => {
    current = fixture();
    const out = await captured(() => runList({ cwd: current!.app, registry: current!.url }));

    expect(out.result).toBe(0);
    expect(out.lines.some((line) => line.includes("button") && line.includes("registry:ui"))).toBe(
      true,
    );
    expect(out.text).toContain("A button, an icon button");
    expect(out.text).toContain("4 items, 0 installed");
    expect(out.lines.some((line) => line.startsWith("✓"))).toBe(false);
  });

  test("marks an item the app has a file of", async () => {
    current = fixture({ "lib/press.ts": "// the app's press\n" });
    const out = await captured(() => runList({ cwd: current!.app, registry: current!.url }));

    const press = out.lines.find((line) => line.includes("press") && line.includes("registry:lib"));
    expect(press?.startsWith("✓ press")).toBe(true);
    expect(out.text).toContain("1 installed");
  });

  test("--json carries the same rows", async () => {
    current = fixture({ "components/ui/button.tsx": "// the app's button\n" });
    const out = await captured(() =>
      runList({ cwd: current!.app, registry: current!.url, json: true }),
    );
    const catalog = JSON.parse(out.text) as {
      items: { name: string; type: string; installed: boolean }[];
    };

    expect(catalog.items.map((item) => item.name)).toEqual(["theme", "press", "spinner", "button"]);
    expect(catalog.items.find((item) => item.name === "button")?.installed).toBe(true);
    expect(catalog.items.find((item) => item.name === "spinner")?.installed).toBe(false);
  });
});
