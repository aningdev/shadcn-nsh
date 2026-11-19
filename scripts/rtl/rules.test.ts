import { describe, expect, test } from "bun:test";

import { logicalName, violations } from "./rules";

const scan = (source: string) => violations(source, "probe.tsx");

describe("rtl rules", () => {
  test("an asymmetric side is reported with its start/end form", () => {
    const found = scan(`const s = { paddingLeft: 16, paddingRight: 4 };`);
    expect(found.map((v) => [v.property, v.suggestion])).toEqual([
      ["paddingLeft", "paddingStart"],
      ["paddingRight", "paddingEnd"],
    ]);
  });

  test("a symmetric pair passes, even when it is computed", () => {
    expect(scan(`const s = { left: 0, right: 0 };`)).toEqual([]);
    expect(scan(`const s = { left: BLEED, right: BLEED };`)).toEqual([]);
  });

  test("a pair with different values is reported", () => {
    expect(scan(`const s = { left: 0, right: 8 };`)).toHaveLength(2);
  });

  test("a physical marker in the object, or just above it, passes", () => {
    expect(
      scan(`const s = {\n  // physical: measured from the screen\n  left: 8,\n  right: 0,\n};`),
    ).toEqual([]);
    expect(
      scan(`// physical: the track is drawn from the left\nconst s = {\n  left: 8,\n};`),
    ).toEqual([]);
  });

  test("a marker on one object covers the objects nested in it", () => {
    const source = `
const s = {
  // physical: the window's edge
  ...(side === "left" ? { borderRightWidth: 1 } : { borderLeftWidth: 1 }),
};
`;
    expect(scan(source)).toEqual([]);
  });

  test("a marker in a different object does not reach a sibling", () => {
    const source = `
const a = {
  // physical: something else
  left: 8,
};
const b = { right: 4 };
`;
    expect(scan(source).map((v) => v.property)).toEqual(["right"]);
  });

  test("interface members are not styles", () => {
    expect(scan(`interface Slop { left: number; right: number }`)).toEqual([]);
  });

  test("a border radius keeps its corner", () => {
    expect(logicalName("borderTopLeftRadius")).toBe("borderTopStartRadius");
    expect(logicalName("borderBottomRightRadius")).toBe("borderBottomEndRadius");
    expect(logicalName("left")).toBe("start");
  });
});
