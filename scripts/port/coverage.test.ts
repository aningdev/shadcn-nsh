import { describe, expect, test } from "bun:test";

import { exportedLookHelpers, selfReferenceProblems } from "./coverage";

const rebuild =
  "badge: its reference page draws only what it can rebuild, so it compares; remove selfReference";
const missing =
  "badge: its reference page draws <Badge>; declare selfReference with the reason it cannot rebuild it";

describe("exported look helpers", () => {
  test("a camelCase Look value counts, a Look type does not", () => {
    expect(
      exportedLookHelpers(`
        export type ButtonLook = { height: number };
        export interface ChoiceTileLook { style: string }
        export function buttonLook() { return {}; }
        export const choiceTileLook = () => ({});
      `),
    ).toEqual(["buttonLook", "choiceTileLook"]);
  });

  test("a type-only re-export is not a helper; a value re-export is", () => {
    expect(
      exportedLookHelpers(`
        export type { ButtonLook } from "./button";
        export { inputLook } from "./input";
      `),
    ).toEqual(["inputLook"]);
  });

  test("a file with no Look value exports none", () => {
    expect(exportedLookHelpers(`export function Badge() { return null; }\n`)).toEqual([]);
  });
});

describe("selfReference", () => {
  const base = {
    id: "badge",
    componentName: "Badge",
    drawsComponent: true,
    ours: true,
    upstreams: false,
  };

  test("a public Look cannot hide behind selfReference", () => {
    expect(
      selfReferenceProblems({ ...base, selfReference: true, lookHelpers: ["buttonLook"] }),
    ).toEqual([rebuild]);
  });

  test("no public Look may declare selfReference", () => {
    expect(selfReferenceProblems({ ...base, selfReference: true, lookHelpers: [] })).toEqual([]);
  });

  test("drawing the component without selfReference still fails", () => {
    expect(selfReferenceProblems({ ...base, selfReference: false, lookHelpers: [] })).toEqual([
      missing,
    ]);
  });

  test("an upstream component on the page may declare selfReference even with a Look", () => {
    expect(
      selfReferenceProblems({
        ...base,
        selfReference: true,
        upstreams: true,
        lookHelpers: ["buttonLook"],
      }),
    ).toEqual([]);
  });
});
