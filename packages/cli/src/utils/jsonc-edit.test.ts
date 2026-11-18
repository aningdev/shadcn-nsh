import { describe, expect, test } from "bun:test";

import { setJsonValue } from "./jsonc-edit";

describe("setJsonValue", () => {
  test("replaces a value and nothing else", () => {
    const text = `{\n  "conditions": ["node"],\n  "theme": "./old.json"\n}\n`;
    expect(setJsonValue(text, ["theme"], "./theme.json")).toBe(
      `{\n  "conditions": ["node"],\n  "theme": "./theme.json"\n}\n`,
    );
  });

  test("writes a replacing object the way the file writes, not minified", () => {
    expect(setJsonValue(`{\n  "paths": {}\n}`, ["paths"], { a: ["x"], b: ["y"] })).toBe(
      `{\n  "paths": {\n    "a": ["x"],\n    "b": ["y"]\n  }\n}`,
    );
  });

  test("returns the text itself when the value is already there", () => {
    const text = `{ "theme": "./theme.json" }`;
    expect(setJsonValue(text, ["theme"], "./theme.json")).toBe(text);
  });

  test("inserts a key after its siblings, short arrays on one line", () => {
    const text = `{\n  "compilerOptions": {\n    "paths": {\n      "nsh": ["./.nsh/a"]\n    }\n  }\n}\n`;
    expect(setJsonValue(text, ["compilerOptions", "paths", "@/*"], ["./*"])).toBe(
      `{\n  "compilerOptions": {\n    "paths": {\n      "nsh": ["./.nsh/a"],\n      "@/*": ["./*"]\n    }\n  }\n}\n`,
    );
  });

  test("builds the objects that lead to a new key, at the file's indent", () => {
    const text = `{\n    "conditions": ["node"]\n}\n`;
    expect(setJsonValue(text, ["resolve", "alias", "@"], "./")).toBe(
      `{\n    "conditions": ["node"],\n    "resolve": {\n        "alias": {\n            "@": "./"\n        }\n    }\n}\n`,
    );
  });

  test("keeps a one-line object on one line", () => {
    expect(
      setJsonValue(`{ "resolve": { "conditions": ["node"] } }`, ["resolve", "alias"], {
        "@": "./",
      }),
    ).toBe(`{ "resolve": { "conditions": ["node"], "alias": { "@": "./" } } }`);
  });

  test("opens an empty object", () => {
    expect(setJsonValue(`{\n  "paths": {}\n}`, ["paths", "@/*"], ["./*"])).toBe(
      `{\n  "paths": {\n    "@/*": ["./*"]\n  }\n}`,
    );
  });

  test("keeps comments, tabs and a trailing comma", () => {
    const text = `{\n\t// the app's\n\t"a": [1, 2],\n}\n`;
    expect(setJsonValue(text, ["b"], true)).toBe(
      `{\n\t// the app's\n\t"a": [1, 2],\n\t"b": true,\n}\n`,
    );
  });

  test("throws when the path runs through a non-object", () => {
    expect(() => setJsonValue(`{ "resolve": [] }`, ["resolve", "alias"], {})).toThrow();
  });
});
