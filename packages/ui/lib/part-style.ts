import type { StyleProp } from "nsh";

/**
 * Class and style merging for a themed part.
 * `null` drops the wrapper default; a string is appended; a style wins per key.
 * Shared by the document and color parts, which all have to treat `null` the same way.
 */

/** Wrapper default, then consumer: both set, both apply. */
export function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
export function mergeStyle<S>(
  base?: StyleProp<S> | null,
  consumer?: StyleProp<S> | null,
): StyleProp<S> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

function bag(value: object): Record<string, unknown> {
  return { ...(value as Record<string, unknown>) };
}

/** Part classes: `null` drops the default; a string is appended after it. */
export function mergePartClasses<T extends object>(base: T, consumer?: T | null): T {
  if (consumer == null) return base;
  const merged = bag(base);
  const extra = bag(consumer);
  for (const key of Object.keys(extra)) {
    const next = extra[key];
    if (next === undefined) continue;
    if (next === null) {
      delete merged[key];
      continue;
    }
    const prior = merged[key];
    merged[key] = typeof prior === "string" && typeof next === "string" ? `${prior} ${next}` : next;
  }
  return merged as T;
}

/** Part styles: `null` drops the default; otherwise the consumer wins per key. */
export function mergePartStyles<T extends object>(base: T, consumer?: T | null): T {
  if (consumer == null) return base;
  const merged = bag(base);
  const extra = bag(consumer);
  for (const key of Object.keys(extra)) {
    const next = extra[key];
    if (next === undefined) continue;
    if (next === null) {
      delete merged[key];
      continue;
    }
    const prior = merged[key];
    merged[key] = prior != null ? [prior, next] : next;
  }
  return merged as T;
}
