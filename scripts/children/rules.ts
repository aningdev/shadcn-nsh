/**
 * Children read once, for the leaf controls: every read of `props.children` builds the children
 * again (new native views — `references/nsh/website/docs/jsx-and-components.md`, "each read of
 * `props.children` builds the children again"), so a control reads them once, and when it uses
 * them for more than one thing (its name, whether it holds a string, what it draws) it asks
 * `childrenOf` (`packages/ui/lib/children.ts`), whose one read they all share.
 *
 * `FILES` is part 1 of #55, the leaf controls; part 2 adds the overlays and containers to it. In a
 * listed file:
 *   - a component reads `props.children` at most once, or calls `childrenOf` at most once — one
 *     read in all;
 *   - the read sits in the component's own body, or in a function that runs where it is written
 *     (`(() => …)()`): a read inside a function kept for later (a thunk, a getter, a callback)
 *     reads the children again on every call, which is two reads.
 * A control that draws `{props.children}` once and asks nothing else of them is fine as it is;
 * so is `const { text, content, label } = childrenOf(props)`.
 */
import { parseSync } from "oxc-parser";

/** The leaf controls part 1 covers (part 2 extends this list). */
export const FILES = [
  "packages/ui/alert.tsx",
  "packages/ui/attachment.tsx",
  "packages/ui/breadcrumb.tsx",
  "packages/ui/bubble.tsx",
  "packages/ui/button-group.tsx",
  "packages/ui/button.tsx",
  "packages/ui/card.tsx",
  "packages/ui/checkbox.tsx",
  "packages/ui/empty.tsx",
  "packages/ui/field.tsx",
  "packages/ui/input-group.tsx",
  "packages/ui/item.tsx",
  "packages/ui/kbd.tsx",
  "packages/ui/label.tsx",
  "packages/ui/link.tsx",
  "packages/ui/marker.tsx",
  "packages/ui/message.tsx",
  "packages/ui/pressable.tsx",
  "packages/ui/radio-group.tsx",
  "packages/ui/segmented.tsx",
  "packages/ui/tabs.tsx",
  "packages/ui/toggle.tsx",
];

type Node = {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
};

/** One file's finding: where, the component, and what is wrong with its read. */
export interface Violation {
  file: string;
  line: number;
  column: number;
  /** The component the read belongs to. */
  where: string;
  /** `count`: more than one read in the component; `nested`: a read inside a function kept for
   * later. */
  kind: "count" | "nested";
  /** How many reads (`count`). */
  reads: number;
}

const FUNCTIONS = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);

const lineAt = (source: string, offset: number) => {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i += 1) if (source[i] === "\n") line += 1;
  return line;
};

const columnAt = (source: string, offset: number) => {
  const start = source.lastIndexOf("\n", offset - 1) + 1;
  return offset - start + 1;
};

/** The name a function's first parameter gives its props (`props`), when it is a plain name. */
function propName(node: Node): string | undefined {
  const params = node.params as Node[] | undefined;
  const first = params?.[0];
  return first?.type === "Identifier" ? (first.name as string) : undefined;
}

/** The function's name, or `the component` for an arrow bound to nothing. */
function functionName(node: Node): string {
  const id = node.id as Node | null | undefined;
  return id?.type === "Identifier" ? (id.name as string) : "the component";
}

/** The name of a member's property: `children`, or `"children"` when it is computed. */
function memberName(node: Node): string | undefined {
  const property = node.property as Node | undefined;
  if (!property) return undefined;
  if (node.computed === true) {
    return property.type === "Literal" ? String(property.value) : undefined;
  }
  return property.type === "Identifier" ? (property.name as string) : undefined;
}

/** A callee without the parentheses around it: `(() => { … })()` calls the arrow. */
function unwrapParens(node: Node | undefined): Node | undefined {
  let current = node;
  while (current?.type === "ParenthesizedExpression")
    current = current.expression as Node | undefined;
  return current;
}

/** The local names `childrenOf` is imported under (an alias counts as the same helper). */
function helperNames(program: { body?: unknown }): Set<string> {
  const names = new Set<string>();
  for (const statement of (program.body as Node[] | undefined) ?? []) {
    if (statement.type !== "ImportDeclaration") continue;
    for (const specifier of (statement.specifiers as Node[] | undefined) ?? []) {
      if (specifier.type !== "ImportSpecifier") continue;
      const imported = specifier.imported as Node | undefined;
      const local = specifier.local as Node | undefined;
      if (imported?.type !== "Identifier" || imported.name !== "childrenOf") continue;
      if (local?.type === "Identifier") names.add(local.name as string);
    }
  }
  return names;
}

/** Every read of `props.children` (or a `childrenOf` call) in `source` that is more than one. */
export function violations(source: string, file: string): Violation[] {
  const parsed = parseSync(file, source);
  const error = parsed.errors[0];
  if (error) throw new Error(`${file}: ${error.message}`);
  const helpers = helperNames(parsed.program);
  const found: Violation[] = [];
  // The reads of each component, and where its first one is (the position reported).
  const reads = new Map<Node, { where: string; count: number; first: Node }>();
  const stack: Node[] = [];
  // The functions that run where they are written (`(() => …)()`): a read inside one is a read now.
  const inline = new Set<Node>();

  const isHelperCall = (node: Node | undefined) => {
    if (node?.type !== "CallExpression") return false;
    const callee = node.callee as Node | undefined;
    return callee?.type === "Identifier" && helpers.has(callee.name as string);
  };

  const report = (node: Node, index: number, kind: Violation["kind"]) => {
    found.push({
      file,
      line: lineAt(source, node.start),
      column: columnAt(source, node.start),
      where: functionName(stack[index]),
      kind,
      reads: 1,
    });
  };

  const count = (node: Node, index: number) => {
    const fn = stack[index];
    const seen = reads.get(fn);
    if (seen) seen.count += 1;
    else reads.set(fn, { where: functionName(fn), count: 1, first: node });
  };

  /** Whether every function between `index` and the innermost one runs where it is written. */
  const runsHere = (index: number) => stack.slice(index + 1).every((fn) => inline.has(fn));

  /** The innermost function whose first parameter is `name`: the one that reads it. */
  const owner = (name: string) => {
    for (let i = stack.length - 1; i >= 0; i -= 1) if (propName(stack[i]) === name) return i;
    return -1;
  };

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    const current = node as Node;
    if (typeof current.type !== "string") return;

    const isFunction = FUNCTIONS.has(current.type);
    if (isFunction) stack.push(current);

    if (current.type === "MemberExpression") {
      const object = current.object as Node | undefined;
      if (object?.type === "Identifier" && memberName(current) === "children") {
        const index = owner(object.name as string);
        if (index >= 0) {
          // A function kept between the read and the component it reads for runs on every call.
          if (!runsHere(index)) report(current, index, "nested");
          else count(current, index);
        }
      }
    }

    if (current.type === "CallExpression") {
      const callee = unwrapParens(current.callee as Node | undefined);
      if (callee && FUNCTIONS.has(callee.type)) inline.add(callee);
    }

    if (isHelperCall(current) && stack.length > 0) {
      // The component is the file's outermost function; a call inside one of its own functions
      // reads the children again each time that function runs.
      if (!runsHere(0)) report(current, 0, "nested");
      else count(current, 0);
    }

    for (const [key, value] of Object.entries(current)) {
      if (key === "type" || key === "start" || key === "end") continue;
      walk(value);
    }

    if (isFunction) stack.pop();
  };

  walk(parsed.program);

  for (const { where, count: times, first } of reads.values()) {
    if (times < 2) continue;
    found.push({
      file,
      line: lineAt(source, first.start),
      column: columnAt(source, first.start),
      where,
      kind: "count",
      reads: times,
    });
  }
  return found;
}
