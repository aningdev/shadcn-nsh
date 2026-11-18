/**
 * Setting one value in a JSON(C) file the app owns (`nsh.json`, `tsconfig.json`) and leaving
 * every other byte as it was: its comments, its key order, and its formatting — a short array
 * the app wrote on one line stays on one line.
 *
 * jsonc-parser's `modify` alone does not do that: given `formattingOptions` it formats the whole
 * object it inserts into (every `["…"]` in it spread over three lines), and without them it
 * inserts minified JSON. So a value that is already there is replaced in place (`modify` with no
 * formatting touches only that value), and a key that is not is written here, as the file
 * writes its own: on the next line at its siblings' indent, or inline in an object that is on
 * one line; arrays of plain values on one line, objects one key a line.
 */
import {
  applyEdits,
  findNodeAtLocation,
  modify,
  parseTree,
  type JSONPath,
  type Node,
} from "jsonc-parser";

/** The parse options the edits read with: JSONC, as tsconfig allows. */
const READ = { allowTrailingComma: true } as const;

/**
 * `text` with `value` at `jsonPath` (a path of object keys): replaced when it is there, inserted
 * — with whatever objects lead to it — when it is not. Returns `text` itself when it already
 * holds that value. Throws when the path runs through something that is not an object.
 */
export function setJsonValue(text: string, jsonPath: JSONPath, value: unknown): string {
  const root = parseTree(text, [], READ);
  if (!root || root.type !== "object") throw new Error("not a JSON object at the top");

  const existing = findNodeAtLocation(root, jsonPath);
  if (existing) {
    if (JSON.stringify(nodeValue(existing)) === JSON.stringify(value)) return text;
    return applyEdits(text, modify(text, jsonPath, value, {}));
  }

  // The deepest object on the path that is there; the rest of the path becomes nested objects.
  let parent = root;
  let depth = 0;
  for (; depth < jsonPath.length - 1; depth++) {
    const next = findNodeAtLocation(root, jsonPath.slice(0, depth + 1));
    if (!next) break;
    if (next.type !== "object") {
      throw new Error(`${jsonPath.slice(0, depth + 1).join(".")} is not an object`);
    }
    parent = next;
  }
  const [key, ...rest] = jsonPath.slice(depth);
  const nested = rest.reduceRight<unknown>((inner, k) => ({ [String(k)]: inner }), value);
  return insertProperty(text, parent, String(key), nested);
}

/** `object` gains `"key": value` after its last property, written the way the file writes. */
function insertProperty(text: string, object: Node, key: string, value: unknown): string {
  const unit = indentUnit(text);
  const objectIndent = lineIndent(text, object.offset);
  const end = object.offset + object.length - 1; // the closing brace
  const properties = object.children ?? [];
  const last = properties.at(-1);

  if (!last) {
    // `{}` (or `{ }`): the property on a line of its own, one level in.
    const inner = objectIndent + unit;
    const body = `\n${inner}${JSON.stringify(key)}: ${serialize(value, inner, unit)}\n${objectIndent}`;
    return text.slice(0, object.offset + 1) + body + text.slice(end);
  }

  const afterLast = last.offset + last.length;
  // A trailing comma after the last property is kept where it is, and the new one follows it.
  const comma = /^\s*,/.exec(text.slice(afterLast, end));
  const insertAt = comma ? afterLast + comma[0].length : afterLast;
  // A file that ends its objects with a comma gets one after the new property too.
  const lead = comma ? "" : ",";
  const tail = comma ? "," : "";

  if (!text.slice(object.offset, end).includes("\n")) {
    // An object on one line stays on one line.
    const entry = `${lead} ${JSON.stringify(key)}: ${serialize(value, objectIndent, unit, true)}${tail}`;
    return text.slice(0, insertAt) + entry + text.slice(insertAt);
  }
  const indent = lineIndent(text, last.offset);
  const entry = `${lead}\n${indent}${JSON.stringify(key)}: ${serialize(value, indent, unit)}${tail}`;
  return text.slice(0, insertAt) + entry + text.slice(insertAt);
}

/** A value as text at `indent`: plain values and arrays of them on one line, objects a key a
 *  line (or all on one line, `inline`). */
function serialize(value: unknown, indent: string, unit: string, inline = false): string {
  if (Array.isArray(value)) {
    if (value.every((item) => item === null || typeof item !== "object")) {
      return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    }
    const inner = indent + unit;
    return `[\n${value.map((item) => inner + serialize(item, inner, unit)).join(",\n")}\n${indent}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    if (inline) {
      const body = entries.map(
        ([k, v]) => `${JSON.stringify(k)}: ${serialize(v, indent, unit, true)}`,
      );
      return `{ ${body.join(", ")} }`;
    }
    const inner = indent + unit;
    const body = entries.map(
      ([k, v]) => `${inner}${JSON.stringify(k)}: ${serialize(v, inner, unit)}`,
    );
    return `{\n${body.join(",\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

/** The whitespace a line starts with, for the line `offset` is on. */
function lineIndent(text: string, offset: number): string {
  const start = text.lastIndexOf("\n", offset - 1) + 1;
  return /^[ \t]*/.exec(text.slice(start))?.[0] ?? "";
}

/** One level of the file's indentation: its first indented line's, two spaces when it has none. */
function indentUnit(text: string): string {
  for (const line of text.split("\n")) {
    const indent = /^[ \t]+/.exec(line);
    if (indent && line.trim().length > 0) return indent[0].includes("\t") ? "\t" : indent[0];
  }
  return "  ";
}

/** A parsed node's value, for comparing with the one to set. */
function nodeValue(node: Node): unknown {
  switch (node.type) {
    case "object":
      return Object.fromEntries(
        (node.children ?? []).map((property) => [
          property.children?.[0]?.value,
          property.children?.[1] ? nodeValue(property.children[1]) : undefined,
        ]),
      );
    case "array":
      return (node.children ?? []).map(nodeValue);
    default:
      return node.value;
  }
}
