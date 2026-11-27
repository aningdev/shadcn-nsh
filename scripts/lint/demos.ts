/**
 * The demos' coverage of each component's axes: every value of a `variant`, `size` or `tone`
 * union that a component declares must appear in `apps/website/demos/<id>.tsx`.
 *
 *   bun run check:demos [--verbose]
 *
 * Unions are read from the TypeScript, not from regular expressions. A component's own unions
 * are the ones declared in its module — exported union aliases (`ButtonVariant`, `ButtonSize`) and
 * literal unions written inline on one of those three props — followed through local aliases and
 * interfaces (`ColorPanelProps extends ColorFieldsProps`). A union imported from another module
 * is that module's axis and is covered by that module's demo: a menu trigger's `variant` is the
 * button's `ButtonVariant`. The theme's `Tone` is the exception, because it is shared rather than a
 * component's own palette: a props member that names it (`tone?: Live<Tone>`, `Live<Tone | undefined>`)
 * must show every one of its values, read from `packages/theme/theme.ts`, and each of its demos
 * shows the same tones. A numeric axis (a round button's `size`) has no values to cover.
 *
 * A component whose demo is missing fails when it has values to cover; one with no axis at all
 * (a spinner) has nothing to check.
 */
import fs from "node:fs";
import path from "node:path";

import { parseSync } from "oxc-parser";

import { catalog } from "../registry/catalog";

const repo = path.resolve(import.meta.dir, "../..");

type Node = { type: string; start?: number; end?: number; [key: string]: unknown };

/**
 * The prop names that are axes of a component's look. `variant` carries what a `kind` used to
 * (`docs/ARCHITECTURE.md`): a trigger's field-or-outline is a variant too.
 */
const AXES = new Set(["variant", "size", "tone"]);

/** A union value, and the axis it was found on (for the report). */
type Value = { axis: string; value: string };

type Module = {
  file: string;
  source: string;
  /** Exported type aliases and interfaces, by name. */
  types: Map<string, Node>;
  /** Every local type alias and interface, by name (a props type may extend a private one). */
  localTypes: Map<string, Node>;
  /** Imported bindings, by local name, and the module they come from. */
  imports: Map<string, string>;
  /** Exported functions and exported constants holding functions. */
  functions: Node[];
};

const parse = (file: string) => {
  const result = parseSync(file, fs.readFileSync(file, "utf8"));
  if (result.errors.length > 0) throw new Error(`${file}: ${result.errors[0].message}`);
  return result.program as unknown as Node;
};

function moduleAt(file: string): Module {
  const source = fs.readFileSync(file, "utf8");
  const program = parseSync(file, source).program as unknown as Node;
  const types = new Map<string, Node>();
  const localTypes = new Map<string, Node>();
  const imports = new Map<string, string>();
  const functions: Node[] = [];
  for (const statement of program.body as Node[]) {
    if (statement.type === "ImportDeclaration") {
      const sourceName = (statement.source as Node).value as string;
      for (const specifier of (statement.specifiers as Node[] | undefined) ?? []) {
        const local = (specifier.local as Node | undefined)?.name as string | undefined;
        if (local) imports.set(local, sourceName);
      }
      continue;
    }
    const exported =
      statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration";
    const node =
      statement.type === "ExportNamedDeclaration"
        ? (statement.declaration as Node | null)
        : statement;
    if (!node) continue;
    if (node.type === "TSTypeAliasDeclaration" || node.type === "TSInterfaceDeclaration") {
      const name = (node.id as Node).name as string;
      localTypes.set(name, node);
      if (exported) types.set(name, node);
    }
    if (exported && (node.type === "FunctionDeclaration" || node.type === "VariableDeclaration")) {
      functions.push(node);
    }
  }
  return { file, source, types, localTypes, imports, functions };
}

/** The type a type alias declares; an interface is its own (its members are read directly). */
const typeOf = (node: Node): Node =>
  node.type === "TSTypeAliasDeclaration" ? (node.typeAnnotation as Node) : node;

/** Adds every property signature of `node` named like an axis. */
function axisMembers(node: Node, module: Module, out: { axis: string; type: Node }[], depth = 0) {
  if (!node || depth > 8) return;
  switch (node.type) {
    case "TSInterfaceDeclaration": {
      for (const member of (node.body as Node).body as Node[]) {
        if (member.type === "TSPropertySignature") addAxis(member, out);
      }
      for (const parent of (node.extends as Node[] | undefined) ?? []) {
        const name = (parent.expression as Node | undefined)?.name as string | undefined;
        const found = name ? module.localTypes.get(name) : undefined;
        if (found) axisMembers(typeOf(found), module, out, depth + 1);
      }
      break;
    }
    case "TSInterfaceBody":
      for (const member of node.body as Node[]) {
        if (member.type === "TSPropertySignature") addAxis(member, out);
      }
      break;
    case "TSTypeAliasDeclaration":
      axisMembers(node.typeAnnotation as Node, module, out, depth + 1);
      break;
    case "TSTypeLiteral":
      for (const member of node.members as Node[]) {
        if (member.type === "TSPropertySignature") addAxis(member, out);
      }
      break;
    case "TSIntersectionType":
      for (const type of node.types as Node[]) axisMembers(type, module, out, depth + 1);
      break;
    case "TSParenthesizedType":
      axisMembers(node.typeAnnotation as Node, module, out, depth + 1);
      break;
    case "TSTypeReference": {
      const name = (node.typeName as Node).name as string | undefined;
      const found = name ? module.localTypes.get(name) : undefined;
      if (found) axisMembers(typeOf(found), module, out, depth + 1);
      break;
    }
    default:
      break;
  }
}

function addAxis(member: Node, out: { axis: string; type: Node }[]) {
  const key = member.key as Node;
  const name = key.type === "Identifier" ? (key.name as string) : (key.value as string);
  if (!AXES.has(name)) return;
  const annotation = (member.typeAnnotation as Node | undefined)?.typeAnnotation as
    | Node
    | undefined;
  if (annotation) out.push({ axis: name, type: annotation });
}

/** A type's own string values. Numeric, function and imported types have none. */
function literalValues(node: Node, module: Module, depth = 0, seen = new Set<string>()): string[] {
  if (!node || depth > 10) return [];
  switch (node.type) {
    case "TSLiteralType": {
      const literal = node.literal as Node;
      return typeof literal.value === "string" ? [literal.value] : [];
    }
    case "TSUnionType":
      return (node.types as Node[]).flatMap((type) => literalValues(type, module, depth + 1, seen));
    case "TSParenthesizedType":
      return literalValues(node.typeAnnotation as Node, module, depth + 1, seen);
    case "TSTypeReference": {
      const name = (node.typeName as Node).name as string | undefined;
      const found = name ? module.localTypes.get(name) : undefined;
      if (!found || seen.has(name!)) return [];
      seen.add(name!);
      return literalValues(typeOf(found), module, depth + 1, seen);
    }
    default:
      return [];
  }
}

/** The exported functions of a subtree (a component declared as a function or a const). */
function functionsIn(node: Node, out: Node[] = []): Node[] {
  if (!node || typeof node !== "object") return out;
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    out.push(node);
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "start" || key === "end" || key === "type") continue;
    if (Array.isArray(value)) for (const item of value) functionsIn(item as Node, out);
    else if (value && typeof value === "object" && "type" in value) functionsIn(value as Node, out);
  }
  return out;
}

/** Modules the shared `Tone` comes from: the relative theme entry, or the package name. */
const THEME_MODULES = new Set(["../theme", "../../theme", "@shadcn-nsh/theme"]);

/** Whether a type names the theme's shared `Tone`, imported into this module (`Tone`, `Live<Tone>`). */
function namesTone(node: Node, module: Module): boolean {
  if (!node || typeof node !== "object") return false;
  if (node.type === "TSTypeReference") {
    const name = (node.typeName as Node).name as string | undefined;
    return !!name && name === "Tone" && THEME_MODULES.has(module.imports.get(name) ?? "");
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "start" || key === "end" || key === "type") continue;
    if (Array.isArray(value)) {
      if (value.some((item) => namesTone(item as Node, module))) return true;
    } else if (value && typeof value === "object" && "type" in value) {
      if (namesTone(value as Node, module)) return true;
    }
  }
  return false;
}

/** The values of the theme's `Tone`, from `packages/theme/theme.ts`. */
function toneValues(): string[] {
  const theme = moduleAt(path.join(repo, "packages/theme/theme.ts"));
  const tone = theme.types.get("Tone");
  const values = tone ? literalValues(typeOf(tone), theme) : [];
  if (values.length === 0) throw new Error("check:demos: no Tone union in packages/theme/theme.ts");
  return values;
}

const TONES = toneValues();

/** The axis values a module declares: on its exported props types and its exported components. */
function moduleAxes(module: Module): Value[] {
  const members: { axis: string; type: Node }[] = [];
  for (const [name, node] of module.types) {
    if (!/Props$/.test(name)) continue;
    axisMembers(typeOf(node), module, members);
  }
  for (const exported of module.functions) {
    for (const fn of functionsIn(exported)) {
      const param = (fn.params as Node[])[0];
      if (param?.type !== "Identifier") continue;
      const annotation = (param.typeAnnotation as Node | undefined)?.typeAnnotation as
        | Node
        | undefined;
      if (annotation) axisMembers(annotation, module, members);
    }
  }
  const values: Value[] = [];
  for (const { axis, type } of members) {
    for (const value of literalValues(type, module)) values.push({ axis, value });
    if (axis === "tone" && namesTone(type, module)) {
      for (const value of TONES) values.push({ axis, value });
    }
  }
  return values;
}

function demoLiterals(file: string): Set<string> {
  const values = new Set<string>();
  const visit = (node: Node) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "Literal" && typeof node.value === "string") values.add(node.value);
    for (const [key, value] of Object.entries(node)) {
      if (key === "start" || key === "end" || key === "type") continue;
      if (Array.isArray(value)) for (const item of value) visit(item as Node);
      else if (value && typeof value === "object" && "type" in value) visit(value as Node);
    }
  };
  visit(parse(file));
  return values;
}

function main(): void {
  const problems: string[] = [];
  let checked = 0;
  for (const component of catalog().components) {
    const values = moduleAxes(moduleAt(component.uiFile));
    const unique = [...new Map(values.map((v) => [`${v.axis}\0${v.value}`, v])).values()];
    if (unique.length === 0) continue;
    if (!fs.existsSync(component.demo)) {
      problems.push(`${component.id}: no demo, but ${unique.length} axis values to show`);
      continue;
    }
    const shown = demoLiterals(component.demo);
    checked += 1;
    for (const { axis, value } of unique) {
      if (!shown.has(value)) {
        problems.push(
          `${component.id}: ${axis} "${value}" never appears in ${path.relative(repo, component.demo)}`,
        );
      }
    }
    if (process.argv.includes("--verbose")) {
      const covered = unique.filter((v) => shown.has(v.value)).length;
      console.log(
        `${component.id}: ${covered}/${unique.length} (${unique.map((v) => `${v.axis}=${v.value}`).join(", ")})`,
      );
    }
  }

  console.log(`check:demos: ${checked} components with axes checked against their demos`);
  if (problems.length > 0) {
    for (const problem of problems) console.error(`check:demos: ${problem}`);
    process.exit(1);
  }
}

if (import.meta.main) main();
