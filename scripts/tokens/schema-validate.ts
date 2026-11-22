/**
 * Minimal strict JSON Schema Draft-07 validator tailored for the official W3C DTCG 2025.10
 * `format.json` and `resolver.json` schemas (including bundled `$id` sub-schemas, `if`/`then`/`else`,
 * `allOf`/`anyOf`/`oneOf`/`not`, `patternProperties`, `additionalProperties`, tuple `items`,
 * numeric bounds, and `format` checks).
 */
import fs from "node:fs";
import path from "node:path";

export interface JsonSchema {
  $id?: string;
  $schema?: string;
  $ref?: string;
  $comment?: string;
  title?: string;
  description?: string;
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  pattern?: string;
  format?: string;
  minItems?: number;
  maxItems?: number;
  items?: JsonSchema | JsonSchema[];
  additionalItems?: boolean | JsonSchema;
  minProperties?: number;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  patternProperties?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  definitions?: Record<string, JsonSchema>;
  [key: string]: unknown;
}

export interface ValidationError {
  path: string;
  message: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    return Array.isArray(b) && a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (isRecord(a) && isRecord(b)) {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
};

const jsonType = (value: unknown): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number";
  return typeof value;
};

const matchesType = (value: unknown, expected: string | string[]): boolean => {
  const actual = jsonType(value);
  const list = Array.isArray(expected) ? expected : [expected];
  return list.some((t) => t === actual || (t === "number" && actual === "integer"));
};

const decodePointerToken = (token: string): string => token.replace(/~1/g, "/").replace(/~0/g, "~");

function resolveJsonPointer(root: unknown, pointer: string): unknown {
  if (pointer === "" || pointer === "#") return root;
  const rel = pointer.startsWith("#/") ? pointer.slice(2) : pointer.slice(1);
  let cur: unknown = root;
  for (const rawSeg of rel.split("/")) {
    const seg = decodePointerToken(rawSeg);
    if (isRecord(cur) && Object.hasOwn(cur, seg)) {
      cur = cur[seg];
    } else if (Array.isArray(cur)) {
      const idx = Number(seg);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cur.length) return undefined;
      cur = cur[idx];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** Index every embedded sub-schema with an `$id` so cross-document `$ref` resolves locally. */
class SchemaRegistry {
  private readonly docs = new Map<string, JsonSchema>();

  register(schema: JsonSchema): void {
    if (schema.$id) this.docs.set(schema.$id, schema);
    if (schema.definitions) {
      for (const [key, def] of Object.entries(schema.definitions)) {
        if (key.startsWith("https://") || key.startsWith("http://")) {
          this.docs.set(key, def);
        }
        this.register(def);
      }
    }
  }

  resolve(
    ref: string,
    baseSchema: JsonSchema,
    rootSchema: JsonSchema,
  ): { schema: JsonSchema; base: JsonSchema } {
    if (ref.startsWith("#")) {
      const target = resolveJsonPointer(baseSchema, ref) ?? resolveJsonPointer(rootSchema, ref);
      if (isRecord(target)) return { schema: target as JsonSchema, base: baseSchema };
      throw new Error(`Unresolved JSON Pointer $ref: ${ref} (base=${baseSchema.$id ?? "root"})`);
    }
    const hashIdx = ref.indexOf("#");
    const docUri = hashIdx === -1 ? ref : ref.slice(0, hashIdx);
    const fragment = hashIdx === -1 ? "" : ref.slice(hashIdx);
    const doc = this.docs.get(docUri);
    if (!doc) throw new Error(`Unknown schema URI in $ref: ${ref}`);
    if (!fragment || fragment === "#") return { schema: doc, base: doc };
    const target = resolveJsonPointer(doc, fragment);
    if (isRecord(target)) return { schema: target as JsonSchema, base: doc };
    throw new Error(`Unresolved fragment $ref: ${ref}`);
  }
}

function checkFormat(format: string, value: string): boolean {
  if (format === "json-pointer-uri-fragment") {
    if (!value.startsWith("#")) return false;
    if (value === "#") return true;
    if (!value.startsWith("#/")) return false;
    // RFC 6901 escaping: `~` must only precede `0` or `1`.
    return !/~(?![01])/.test(value.slice(2));
  }
  if (format === "uri-reference") {
    // Reject whitespace and control chars; allow relative paths, fragments, and URIs.
    if (value.length === 0) return false;
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      if (code < 0x20 || /\s/.test(value[i]!)) return false;
    }
    return true;
  }
  return true;
}

export function validateAgainstSchema(
  data: unknown,
  rootSchema: JsonSchema,
  registry: SchemaRegistry,
): ValidationError[] {
  function validateNode(
    value: unknown,
    schema: JsonSchema | boolean,
    base: JsonSchema,
    instancePath: string,
  ): ValidationError[] {
    if (typeof schema === "boolean") {
      return schema ? [] : [{ path: instancePath, message: "value disallowed by false schema" }];
    }

    if (schema.$ref) {
      const resolved = registry.resolve(schema.$ref, base, rootSchema);
      return validateNode(value, resolved.schema, resolved.base, instancePath);
    }

    const errors: ValidationError[] = [];

    if (schema.type !== undefined && !matchesType(value, schema.type)) {
      errors.push({
        path: instancePath,
        message: `expected type ${JSON.stringify(schema.type)}, got ${jsonType(value)}`,
      });
      return errors;
    }

    if (schema.const !== undefined && !deepEqual(value, schema.const)) {
      errors.push({
        path: instancePath,
        message: `expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`,
      });
    }

    if (schema.enum !== undefined && !schema.enum.some((item) => deepEqual(value, item))) {
      errors.push({
        path: instancePath,
        message: `value ${JSON.stringify(value)} is not in enum ${JSON.stringify(schema.enum)}`,
      });
    }

    if (typeof value === "number") {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({ path: instancePath, message: `${value} < minimum ${schema.minimum}` });
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({ path: instancePath, message: `${value} > maximum ${schema.maximum}` });
      }
      if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
        errors.push({
          path: instancePath,
          message: `${value} >= exclusiveMaximum ${schema.exclusiveMaximum}`,
        });
      }
    }

    if (typeof value === "string") {
      if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) {
        errors.push({
          path: instancePath,
          message: `${JSON.stringify(value)} does not match pattern /${schema.pattern}/`,
        });
      }
      if (schema.format !== undefined && !checkFormat(schema.format, value)) {
        errors.push({
          path: instancePath,
          message: `${JSON.stringify(value)} is not a valid ${schema.format}`,
        });
      }
    }

    if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors.push({
          path: instancePath,
          message: `array length ${value.length} < minItems ${schema.minItems}`,
        });
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push({
          path: instancePath,
          message: `array length ${value.length} > maxItems ${schema.maxItems}`,
        });
      }
      if (schema.items !== undefined) {
        if (Array.isArray(schema.items)) {
          for (let i = 0; i < Math.min(value.length, schema.items.length); i++) {
            errors.push(...validateNode(value[i], schema.items[i]!, base, `${instancePath}/${i}`));
          }
          if (value.length > schema.items.length && schema.additionalItems !== undefined) {
            for (let i = schema.items.length; i < value.length; i++) {
              errors.push(
                ...validateNode(value[i], schema.additionalItems, base, `${instancePath}/${i}`),
              );
            }
          }
        } else {
          for (let i = 0; i < value.length; i++) {
            errors.push(...validateNode(value[i], schema.items, base, `${instancePath}/${i}`));
          }
        }
      }
    }

    if (isRecord(value)) {
      const keys = Object.keys(value);
      if (schema.minProperties !== undefined && keys.length < schema.minProperties) {
        errors.push({
          path: instancePath,
          message: `object has ${keys.length} properties, minProperties is ${schema.minProperties}`,
        });
      }
      if (schema.required !== undefined) {
        for (const req of schema.required) {
          if (!Object.hasOwn(value, req)) {
            errors.push({ path: instancePath, message: `missing required property "${req}"` });
          }
        }
      }
      const compiledPatterns = schema.patternProperties
        ? Object.entries(schema.patternProperties).map(
            ([pat, sub]) => [new RegExp(pat), sub] as const,
          )
        : [];
      for (const key of keys) {
        let matched = false;
        if (schema.properties && Object.hasOwn(schema.properties, key)) {
          matched = true;
          errors.push(
            ...validateNode(value[key], schema.properties[key]!, base, `${instancePath}/${key}`),
          );
        }
        for (const [regex, sub] of compiledPatterns) {
          if (regex.test(key)) {
            matched = true;
            errors.push(...validateNode(value[key], sub, base, `${instancePath}/${key}`));
          }
        }
        if (!matched && schema.additionalProperties !== undefined) {
          errors.push(
            ...validateNode(
              value[key],
              schema.additionalProperties,
              base,
              `${instancePath}/${key}`,
            ),
          );
        }
      }
    }

    if (schema.allOf) {
      for (const sub of schema.allOf) {
        errors.push(...validateNode(value, sub, base, instancePath));
      }
    }

    if (schema.anyOf) {
      const branches = schema.anyOf.map((sub) => validateNode(value, sub, base, instancePath));
      if (!branches.some((b) => b.length === 0)) {
        errors.push({
          path: instancePath,
          message: `value failed all branches of anyOf (${branches[0]?.[0]?.message ?? ""})`,
        });
      }
    }

    if (schema.oneOf) {
      const branches = schema.oneOf.map((sub) => validateNode(value, sub, base, instancePath));
      const passing = branches.filter((b) => b.length === 0).length;
      if (passing !== 1) {
        errors.push({
          path: instancePath,
          message: `value matched ${passing} branches of oneOf (expected 1): ${branches[0]?.[0]?.message ?? ""}`,
        });
      }
    }

    if (schema.not !== undefined) {
      const inner = validateNode(value, schema.not, base, instancePath);
      if (inner.length === 0) {
        errors.push({ path: instancePath, message: "value matched disallowed `not` schema" });
      }
    }

    if (schema.if !== undefined) {
      const cond = validateNode(value, schema.if, base, instancePath);
      if (cond.length === 0 && schema.then !== undefined) {
        errors.push(...validateNode(value, schema.then, base, instancePath));
      } else if (cond.length > 0 && schema.else !== undefined) {
        errors.push(...validateNode(value, schema.else, base, instancePath));
      }
    }

    return errors;
  }

  return validateNode(data, rootSchema, rootSchema, "#");
}

const schemaDir = path.join(import.meta.dir, "schema");

function loadOfficialSchemas() {
  const formatSchema = JSON.parse(
    fs.readFileSync(path.join(schemaDir, "format.json"), "utf8"),
  ) as JsonSchema;
  const resolverSchema = JSON.parse(
    fs.readFileSync(path.join(schemaDir, "resolver.json"), "utf8"),
  ) as JsonSchema;
  const registry = new SchemaRegistry();
  registry.register(formatSchema);
  registry.register(resolverSchema);
  return { formatSchema, resolverSchema, registry };
}

const schemas = loadOfficialSchemas();

export function validateTokensDocument(doc: unknown): ValidationError[] {
  return validateAgainstSchema(doc, schemas.formatSchema, schemas.registry);
}

export function validateResolverDocument(doc: unknown): ValidationError[] {
  const errors = validateAgainstSchema(doc, schemas.resolverSchema, schemas.registry);
  if (isRecord(doc) && isRecord(doc.modifiers)) {
    for (const [name, mod] of Object.entries(doc.modifiers)) {
      if (isRecord(mod) && typeof mod.default === "string" && isRecord(mod.contexts)) {
        if (!Object.hasOwn(mod.contexts, mod.default)) {
          errors.push({
            path: `#/modifiers/${name}/default`,
            message: `default context "${mod.default}" does not exist in contexts`,
          });
        }
      }
    }
  }
  return errors;
}
