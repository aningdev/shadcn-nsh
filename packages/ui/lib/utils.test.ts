import { describe, expect, test } from "bun:test";

import { mergeClasses, type PartMap } from "./utils";

// A shell's parts: strings, a part null (dropped), and a rich document's maps of node and mark
// classes. Every case below is one shape, so the app may name parts the look does not.
type Look = {
  root?: string;
  content?: string;
  caret?: string | null;
  nodes?: PartMap;
  marks?: PartMap;
};

const look: Look = {
  root: "flex",
  content: "gap-3 px-6 py-5",
  caret: "w-px",
  nodes: { paragraph: "leading-relaxed", "heading[level=2]": "text-2xl" },
  marks: { bold: "font-bold", italic: "italic" },
};

describe("mergeClasses", () => {
  test("keeps the look's classes when the app names none", () => {
    expect(mergeClasses(look)).toBe(look);
    expect(mergeClasses(look, null)).toBe(look);
  });

  test("puts the app's part after ours and keeps the parts it leaves out", () => {
    expect(mergeClasses(look, { root: "p-4" })).toEqual({
      ...look,
      root: "flex p-4",
    });
  });

  test("drops the part the app nulls, and keeps the one it leaves undefined", () => {
    expect(mergeClasses(look, { caret: null, content: undefined })).toEqual({
      root: "flex",
      content: "gap-3 px-6 py-5",
      nodes: look.nodes,
      marks: look.marks,
    });
  });

  test("merges a map of node and mark classes name by name", () => {
    expect(
      mergeClasses(look, {
        nodes: { paragraph: "text-xl", blockquote: "italic" },
        marks: { bold: null, link: "underline" },
      }),
    ).toEqual({
      root: "flex",
      content: "gap-3 px-6 py-5",
      caret: "w-px",
      nodes: {
        paragraph: "leading-relaxed text-xl",
        "heading[level=2]": "text-2xl",
        blockquote: "italic",
      },
      marks: { italic: "italic", link: "underline" },
    });
  });

  test("leaves the look's object as it was", () => {
    mergeClasses(look, { nodes: { paragraph: "text-xl" } });
    expect(look.nodes).toEqual({ paragraph: "leading-relaxed", "heading[level=2]": "text-2xl" });
  });
});
