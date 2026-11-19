/** Docs nav / index: one entry per component page, generated from the registry and the pages. */
import { components } from "./components.generated";
import type { ComponentKindId } from "./kinds";

export { components };

/** One component with a docs page. @see components.generated.ts */
export type ComponentDoc = {
  /** The registry item's name, which is the page's file name. */
  slug: string;
  title: string;
  /** The kind it is grouped under, derived in `kinds.ts` from the rows in `official.ts`. */
  kind: ComponentKindId;
  /** The shadcn/ui page it stands in for, when one does (a rename, e.g. menu). */
  shadcn: string | null;
  /** Path under https://nsh.dev/elements/; null for a piece with no nsh/base element. */
  nshElement: string | null;
  description: string;
};

export function getComponentBySlug(slug: string): ComponentDoc | undefined {
  return components.find((c) => c.slug === slug);
}

export function nshElementHref(nshElement: string): string {
  return `https://nsh.dev/elements/${nshElement}`;
}
