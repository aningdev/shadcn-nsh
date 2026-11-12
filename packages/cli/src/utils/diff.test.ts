import { describe, expect, test } from "bun:test";

import { changeSummary, countChanges, diffLines, formatDiff } from "./diff";

describe("diffLines", () => {
  test("identical texts are all unchanged", () => {
    const lines = diffLines("a\nb\n", "a\nb\n");
    expect(lines.map((line) => line.kind)).toEqual(["same", "same", "same"]);
    expect(countChanges(lines)).toEqual({ added: 0, removed: 0 });
  });

  test("a changed line is a removal before the addition", () => {
    const lines = diffLines("a\nb\nc\n", "a\nB\nc\n");
    expect(lines).toEqual([
      { kind: "same", text: "a" },
      { kind: "del", text: "b" },
      { kind: "add", text: "B" },
      { kind: "same", text: "c" },
      { kind: "same", text: "" },
    ]);
    const counts = countChanges(lines);
    expect(changeSummary(counts.added, counts.removed)).toBe("(+1 -1)");
  });

  test("an added line costs nothing but an addition", () => {
    const lines = diffLines("a\nb\n", "a\nb\nc\n");
    expect(countChanges(lines)).toEqual({ added: 1, removed: 0 });
    expect(formatDiff(lines)).toBe("  a\n  b\n+ c\n  ");
  });
});
