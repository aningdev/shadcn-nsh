/**
 * The right-to-left rule for `packages/ui`: a side that is not the same on both sides belongs to
 * the reading direction, so it is written with NSH's start/end form (`paddingStart`, `end`,
 * `borderStartWidth`, `borderTopStartRadius`, ...); `left` / `right` keep their physical side and
 * do not mirror.
 *
 * Allowed without a marker:
 *   - a symmetric pair in one object literal: `left` and `right` (or `paddingLeft` /
 *     `paddingRight`, ...) written with the same source text, a stretch or a centred inset;
 *   - anything in an object literal that carries `// physical: <why>` in it or just above it:
 *     anchored to the screen rather than the reading direction.
 *
 * Type members (`left: number` in an interface) are positions in a struct, not styles, and are
 * ignored.
 */
import { parseSync } from "oxc-parser";

/** A side property that keeps its physical side, and the one it balances when symmetric. */
const OPPOSITE: Record<string, string> = {
  left: "right",
  right: "left",
  paddingLeft: "paddingRight",
  paddingRight: "paddingLeft",
  marginLeft: "marginRight",
  marginRight: "marginLeft",
  borderLeftWidth: "borderRightWidth",
  borderRightWidth: "borderLeftWidth",
  borderTopLeftRadius: "borderTopRightRadius",
  borderTopRightRadius: "borderTopLeftRadius",
  borderBottomLeftRadius: "borderBottomRightRadius",
  borderBottomRightRadius: "borderBottomLeftRadius",
};

const SIDES = new Set(Object.keys(OPPOSITE));

type Node = {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
};

type Comment = { type: "Line" | "Block"; value: string; start: number; end: number };

/** One property the rule rejects: the file, its line, the property, and what to write instead. */
export interface Violation {
  file: string;
  line: number;
  column: number;
  property: string;
  /** The object literal's own line, where the `// physical:` marker would go. */
  objectLine: number;
  /** `paddingLeft` → `paddingStart`, `left` → `start`; a radius keeps its corner. */
  suggestion: string;
}

/** The start/end form of a physical side property. */
export function logicalName(name: string): string {
  if (name === "left") return "start";
  if (name === "right") return "end";
  return name.replace("Left", "Start").replace("Right", "End");
}

const lineAt = (source: string, offset: number) => {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i += 1) if (source[i] === "\n") line += 1;
  return line;
};

const columnAt = (source: string, offset: number) => {
  const start = source.lastIndexOf("\n", offset - 1) + 1;
  return offset - start + 1;
};

/** Whether a comment asks for a physical side. */
const isPhysical = (comment: Comment) => /^\s*\*?\s*physical:/m.test(comment.value);

/** The name of an object property (`left`, `"right"`), or `undefined` for a spread or a computed key. */
function propertyName(node: Node): string | undefined {
  if (node.type !== "Property" || node.computed === true) return undefined;
  const key = node.key as Node;
  if (key?.type === "Identifier") return key.name as string;
  if (key?.type === "StringLiteral") return key.value as string;
  return undefined;
}

/** The text of a property's value, as the author wrote it. */
const valueText = (source: string, node: Node) => source.slice(node.start, node.end).trim();

/**
 * Every physical side property in `source` that is neither symmetric nor marked physical.
 *
 * `file` is only for the message; the source is what is read. Parsing follows oxc-parser's AST:
 * an object literal's `properties`, each a `Property` with an `Identifier` or `StringLiteral` key.
 */
export function violations(source: string, file: string): Violation[] {
  const parsed = parseSync(file, source);
  const error = parsed.errors[0];
  if (error) throw new Error(`${file}: ${error.message}`);
  const comments = parsed.comments as Comment[];
  const found: Violation[] = [];

  const markedPhysical = (objects: Node[]) =>
    objects.some((object) =>
      comments.some(
        (comment) =>
          isPhysical(comment) &&
          ((comment.start >= object.start && comment.end <= object.end) ||
            (comment.end <= object.start &&
              lineAt(source, object.start) - lineAt(source, comment.end) <= 1)),
      ),
    );

  const walk = (node: unknown, objects: Node[]) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, objects);
      return;
    }
    const current = node as Node;
    if (current.type === "ObjectExpression") {
      const object = current;
      const properties = (object.properties as Node[] | undefined) ?? [];
      const values = new Map<string, string>();
      for (const property of properties) {
        const name = propertyName(property);
        if (name) values.set(name, valueText(source, property.value as Node));
      }
      const chain = [...objects, object];
      if (!markedPhysical(chain)) {
        for (const property of properties) {
          const name = propertyName(property);
          if (!name || !SIDES.has(name)) continue;
          const opposite = values.get(OPPOSITE[name]);
          if (opposite === valueText(source, property.value as Node)) continue;
          found.push({
            file,
            line: lineAt(source, property.start),
            column: columnAt(source, property.start),
            property: name,
            objectLine: lineAt(source, object.start),
            suggestion: logicalName(name),
          });
        }
      }
      for (const property of properties) walk(property.value, chain);
      return;
    }
    for (const [key, value] of Object.entries(current)) {
      if (key === "type" || key === "start" || key === "end") continue;
      walk(value, objects);
    }
  };

  walk(parsed.program, []);
  return found;
}
