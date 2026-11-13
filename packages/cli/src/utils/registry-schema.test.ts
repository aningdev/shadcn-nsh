import { describe, expect, test } from "bun:test";

import {
  isNotFound,
  parseRegistry,
  parseRegistryItem,
  RegistryShapeError,
} from "./registry-schema";

const item = {
  name: "button",
  type: "registry:ui",
  title: "Button",
  registryDependencies: ["theme"],
  files: [
    { path: "packages/ui/button.tsx", type: "registry:ui", target: "components/ui/button.tsx" },
  ],
};

describe("parseRegistryItem", () => {
  test("keeps the fields in the order they were written", () => {
    const parsed = parseRegistryItem(item, "item");
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(item));
  });

  test("names the place that has the wrong shape", () => {
    expect(() => parseRegistryItem({ ...item, files: [] }, "registry.json: items[0]")).toThrow(
      "registry.json: items[0]: no files",
    );
    expect(() =>
      parseRegistryItem({ ...item, files: [{ path: 1, type: "registry:ui" }] }, "item"),
    ).toThrow(RegistryShapeError);
    expect(() => parseRegistryItem({ ...item, type: "module" }, "item")).toThrow(
      'type "module" is not a registry: type',
    );
    expect(() => parseRegistryItem({ name: "package", private: true }, "item")).toThrow(
      RegistryShapeError,
    );
  });
});

describe("parseRegistry", () => {
  test("checks the name, the homepage and every item", () => {
    const registry = { name: "r", homepage: "https://example.com", items: [item] };
    expect(parseRegistry(registry, "registry.json")).toEqual(registry);
    expect(() => parseRegistry({ items: [item] }, "registry.json")).toThrow(
      "registry.json: name: expected a string",
    );
    expect(() => parseRegistry({ ...registry, items: [{}] }, "registry.json")).toThrow(
      "registry.json: items[0]",
    );
  });
});

describe("isNotFound", () => {
  test("is true for ENOENT only", () => {
    expect(isNotFound(Object.assign(new Error("gone"), { code: "ENOENT" }))).toBe(true);
    expect(isNotFound(Object.assign(new Error("denied"), { code: "EACCES" }))).toBe(false);
    expect(isNotFound("ENOENT")).toBe(false);
  });
});
