"use client";

import { components } from "@/lib/components";
/**
 * A run of `/docs/components` in the page: the pages of one kind — Base (aligned with an NSH
 * element) or Enhanced — one row per page, with the line its description gives. The list is
 * `components.generated.ts`, so a page that lands appears here without anyone writing it down
 * twice (`apps/website/src/pages/docs/components/index.astro` did the same in the Astro site).
 *
 * The headings of the runs are the page's own markdown (`## Base`, `## Enhanced`), so they reach
 * the table of contents and carry the anchor button every other docs page's headings do; the kind
 * decides which rows this renders.
 */
import type { ComponentDoc } from "@/lib/components";

export function ComponentsIndex({ kind }: { kind: ComponentDoc["kind"] }) {
  const items = components.filter((component) => component.kind === kind);

  return (
    <ul>
      {items.map((component) => (
        <li key={component.slug}>
          <a href={`/docs/components/${component.slug}`}>{component.title}</a>
          <span className="text-fd-muted-foreground"> — {component.description}</span>
        </li>
      ))}
    </ul>
  );
}
