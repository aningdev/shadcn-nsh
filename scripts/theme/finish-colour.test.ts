import { describe, expect, test } from "bun:test";

import { readColour } from "./finish-colour";
import type { TokenKind } from "./tokens";

/**
 * The rules of `docs/specs/theme-roles.md` §5 and §7 and `docs/specs/design-semantics.md`, asked
 * the other way round: what a finish may write, and what is said when it writes something else.
 */
const known = new Map<string, TokenKind>([
  ["card", "color"],
  ["border", "color"],
  ["radius-container", "dimension"],
]);
const pending = new Set(["default light oklch(0.5 0 0)", "default light oklch(0.4 0 0)"]);

const judge = (value: string, key = "default light") => readColour(value, known, pending, key);

describe("a finish's colour field", () => {
  test("a `{token}`, ink and transparent are what the theme states", () => {
    expect(judge("{card}")).toEqual({ problems: [], pending: [] });
    expect(judge("oklch(1 0 0 / 6%)")).toEqual({ problems: [], pending: [] });
    expect(judge("transparent")).toEqual({ problems: [], pending: [] });
  });

  test("a token at another alpha is the one relative colour it may write", () => {
    expect(judge("oklch(from {card} l c h / 0.78)")).toEqual({ problems: [], pending: [] });
    expect(judge("oklch(from {border} l c h / 1)")).toEqual({ problems: [], pending: [] });
  });

  test("a relative colour names a colour token the theme has, or reports unknown/wrong kind", () => {
    expect(judge("oklch(from {glass-edge} l c h / 0.5)").problems).toEqual([
      { kind: "unknown-token", name: "glass-edge" },
    ]);
    expect(judge("oklch(from {radius-container} l c h / 0.5)").problems).toEqual([
      { kind: "wrong-kind", name: "radius-container", expected: "color", actual: "dimension" },
    ]);
  });

  test("every other relative colour is still a colour with no token", () => {
    for (const value of [
      "oklch(from {card} l c h)",
      "oklch(from {card} l c h / {scrim})",
      "oklch(from {card} calc(l + 0.1) c h / 0.5)",
    ])
      expect(judge(value).problems.map((problem) => problem.kind)).toContain("literal");
  });

  test("a `{token}` of the wrong DTCG $type is rejected", () => {
    expect(judge("{radius-container}").problems).toEqual([
      { kind: "wrong-kind", name: "radius-container", expected: "color", actual: "dimension" },
    ]);
    expect(judge("linear-gradient(180deg, {radius-container} 0%, {card} 100%)").problems).toEqual([
      { kind: "wrong-kind", name: "radius-container", expected: "color", actual: "dimension" },
    ]);
  });

  test("legacy var(--token) syntax is rejected", () => {
    expect(judge("var(--card)").problems).toEqual([{ kind: "literal", literal: "var(--card)" }]);
  });

  test("a literal the spec still lists is a row, not a problem", () => {
    expect(judge("oklch(0.5 0 0)")).toEqual({
      problems: [],
      pending: ["default light oklch(0.5 0 0)"],
    });
  });

  test("a gradient writes its stops, and fills the row of each", () => {
    expect(judge("linear-gradient(180deg, oklch(0.5 0 0) 0%, oklch(0.4 0 0) 100%)")).toEqual({
      problems: [],
      pending: ["default light oklch(0.5 0 0)", "default light oklch(0.4 0 0)"],
    });
  });

  test("a literal the spec does not list is a problem; a token it does not have, another", () => {
    expect(judge("oklch(0.5 0.1 200)").problems).toEqual([
      { kind: "literal", literal: "oklch(0.5 0.1 200)" },
    ]);
    expect(judge("{nope}").problems).toEqual([{ kind: "unknown-token", name: "nope" }]);
  });
});
