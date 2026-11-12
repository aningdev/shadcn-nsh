/** Docs nav / index: one entry per component page, generated from the registry and the pages. */
import { components } from "./components.generated";
import type { ComponentDoc } from "./components.types";

export { components };
export type { ComponentDoc };

export function getComponentBySlug(slug: string): ComponentDoc | undefined {
  return components.find((c) => c.slug === slug);
}

export function nshElementHref(nshElement: string): string {
  return `https://nsh.dev/elements/${nshElement}`;
}
