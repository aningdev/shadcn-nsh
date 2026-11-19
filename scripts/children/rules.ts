/**
 * Children read once, for every control: each read of `props.children` builds the children again
 * (new native views — `references/nsh/website/docs/jsx-and-components.md`, "each read of
 * `props.children` builds the children again"), so a control reads them once, in the place where
 * the children go: the JSX that draws them, or the element it hands to the host that draws them.
 * What the control wants of them besides drawing — a string is its text, drawn in a `Text` — is
 * asked of that one read, through `AsText` (`packages/ui/lib/as-text.tsx`) where a `Text` is the
 * difference — a forward in the child position, `<AsText …>{props.children}</AsText>`, whose own
 * read is where it draws them — or a plain branch on the kind, which never changes (a child that
 * changes arrives as a function, drawn as given).
 *
 * The rule covers every `.tsx` under `packages/ui` and `packages/ui/lib` (#55). In one:
 *   - a component reads `props.children` at most once;
 *   - the read sits in the component's own body, or in a function that runs where it is written
 *     (`(() => …)()`): a read inside a function kept for later (a thunk, a getter, a callback)
 *     reads the children again on every call, which is two reads.
 *
 * One read may sit in a function kept for later when the place it runs is the only place the
 * children may be built: a portal's content builder, which `nsh/base` makes on each opening
 * (`Popover`'s `#[prop(lazy)] children`), so building them while it is closed would build views
 * nobody shows. That read — and only that one — carries a `children-lint: <why>` comment on its
 * line or the line before; it still counts as the component's one read, so a second read stays a
 * violation. The comment is required: it is how the next reader learns why the read is there.
 */
import fs from "node:fs";
import path from "node:path";

import { parseSync } from "oxc-parser";

/** The directories whose every component is checked: the controls, and the parts they share. */
export const DIRS = ["packages/ui", "packages/ui/lib"] as const;

/** Every `.tsx` under `dirs` (`root` prefixes the paths), sorted: a new component is checked
 * without anyone listing it. */
export function files(root: string): string[] {
  return DIRS.flatMap((dir) =>
    fs
      .readdirSync(path.join(root, dir), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
      .map((entry) => `${dir}/${entry.name}`),
  ).sort();
}

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

const SANCTIONED = "children-lint:";

/** Whether a comment on `line`, or the line before, sanctions a read kept for later (`line` is 1-based). */
function sanctioned(lines: string[], line: number): boolean {
  return (
    (lines[line - 1] ?? "").includes(SANCTIONED) || (lines[line - 2] ?? "").includes(SANCTIONED)
  );
}

/** Every read of `props.children` in `source` that is more than one, or that sits in a function
 * kept for later. */
export function violations(source: string, file: string): Violation[] {
  const parsed = parseSync(file, source);
  const error = parsed.errors[0];
  if (error) throw new Error(`${file}: ${error.message}`);
  const lines = source.split("\n");
  const found: Violation[] = [];
  // The reads of each component, and where its first one is (the position reported).
  const reads = new Map<Node, { where: string; count: number; first: Node }>();
  const stack: Node[] = [];
  // The functions that run where they are written (`(() => …)()`): a read inside one is a read now.
  const inline = new Set<Node>();

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
          if (!runsHere(index)) {
            if (sanctioned(lines, lineAt(source, current.start))) count(current, index);
            else report(current, index, "nested");
          } else count(current, index);
        }
      }
    }

    if (current.type === "CallExpression") {
      const callee = unwrapParens(current.callee as Node | undefined);
      if (callee && FUNCTIONS.has(callee.type)) inline.add(callee);
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
