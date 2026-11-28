import { describe, expect, test } from "bun:test";

import { distTag, runsStatus, servesVersion } from "./verify";

describe("release:verify", () => {
  test("a pre-release goes to next", () => {
    expect(distTag("0.12.1")).toBe("latest");
    expect(distTag("1.0.0-beta.1")).toBe("next");
  });

  test("the root serves a version when the header names it", () => {
    expect(servesVersion("<span>v0.12.1</span>", "v0.12.1")).toBe(true);
    expect(servesVersion("<span>v0.12.10</span>", "v0.12.1")).toBe(false);
  });

  test("runs: pending, failed, done", () => {
    const run = (status: string, conclusion: string) => ({
      name: "Deploy docs",
      status,
      conclusion,
      url: "u",
    });
    expect(runsStatus([], "v1.0.0").ok).toBe(false);
    expect(runsStatus([run("in_progress", "")], "v1.0.0").detail).toStartWith("running");
    expect(runsStatus([run("completed", "failure")], "v1.0.0").detail).toStartWith("failed");
    expect(runsStatus([run("completed", "success")], "v1.0.0").ok).toBe(true);
  });
});
