import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

import { controlHeights, controlSpacing } from "../../packages/theme/terminal-metrics";

const repo = path.join(import.meta.dir, "../..");

describe("terminal control metrics", () => {
  const heights = { sm: 24, md: 32, lg: 40 };
  const spacing = { padding: 10, gap: 6 };

  test("a non-terminal idiom keeps the tier object", () => {
    expect(controlHeights(false, heights, 16)).toBe(heights);
    expect(controlSpacing(false, spacing, 8)).toBe(spacing);
  });

  test("the terminal uses one row for every height and one column for padding and gap", () => {
    expect(controlHeights(true, heights, 16)).toEqual({ sm: 16, md: 16, lg: 16 });
    expect(controlSpacing(true, spacing, 8)).toEqual({ padding: 8, gap: 8 });
  });

  test("controlHeight and metrics read those helpers", () => {
    const source = fs.readFileSync(path.join(repo, "packages/theme/theme.ts"), "utf8");
    expect(source).toContain(
      "controlHeights(terminal, activeSpec().metrics.height[tier], TERMINAL_ROW)",
    );
    expect(source).toContain(
      "controlSpacing(terminal, activeSpec().metrics.control[tier], TERMINAL_COLUMN)",
    );
  });
});
