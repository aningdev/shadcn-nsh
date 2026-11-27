import type { Folder, Item, Node, Root } from "fumadocs-core/page-tree";
import { loader, llms } from "fumadocs-core/source";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

import { sitePath } from "./base";
import { KIND_LABELS, KINDS } from "./kinds";
import { SIDEBAR_PAGES, type SidebarPage } from "./nav";

/**
 * A component page's frontmatter, declared once: Fumadocs' own fields plus the three the old
 * Astro pages carried — whether the page is a component's (`component`), the demo its Preview runs
 * (`demo`, a name in `apps/website/demos`), and `demoHeight`, kept because the pages still write it
 * (the panel sizes its frame itself, so it is read and unused, as in `DemoFrame.astro`).
 */
const componentPageSchema = pageSchema.extend({
  component: z.boolean().optional(),
  demo: z.string().optional(),
  demoHeight: z.union([z.number(), z.string()]).optional(),
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    async: true,
    schema: componentPageSchema,
    postprocess: { includeProcessedMarkdown: true },
  },
});

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/** One sidebar row. A page whose `parent` is also listed becomes a child of that page's folder,
 * so the theme pages sit under Themes and the pager walks the folder after its index. */
function nodes(pages: SidebarPage[]): Node[] {
  const routes = new Set(pages.map((page) => page.route));
  const item = (page: SidebarPage): Item => ({
    type: "page",
    name: page.title,
    url: page.route,
  });
  return pages.flatMap((page): Node[] => {
    if (page.parent !== undefined && routes.has(page.parent)) return [];
    const nested = pages.filter((child) => child.parent === page.route);
    if (nested.length === 0) return [item(page)];
    const folder: Folder = {
      type: "folder",
      name: page.title,
      index: item(page),
      defaultOpen: true,
      children: nested.map(item),
    };
    return [folder];
  });
}

/**
 * The sidebar, in the order `src/lib/nav.ts` keeps: Get started, Theming (Themes folds its
 * pages), then the component pages one run per kind ("Base", then "Enhanced"). Pages the content
 * does not have yet are left out: the tree is the pages that exist, ordered by the list.
 */
export function pageTree(): Root {
  const existing = new Set(source.getPages().map((page) => page.url));
  const listed = SIDEBAR_PAGES.filter((page) => existing.has(page.route));

  const start = listed.filter((page) => page.group === "start");
  const theming = listed.filter((page) => page.group === "theming");
  const components = listed.filter((page) => page.group === "components");

  const children: Node[] = [];
  if (start.length > 0) {
    children.push({ type: "separator", name: "Get started" });
    children.push(...nodes(start));
  }
  if (theming.length > 0) {
    children.push({ type: "separator", name: "Theming" });
    children.push(...nodes(theming));
  }
  // "All components" is the group's own page, above the two runs (it carries no kind: it lists
  // the set rather than belonging to one).
  const group = components.filter((page) => page.kind === undefined);
  if (components.length > 0) {
    children.push({ type: "separator", name: "Components" });
    children.push(...nodes(group));
  }
  const runs = KINDS.map((kind) => ({
    kind,
    pages: components.filter((page) => page.kind === kind),
  })).filter((run) => run.pages.length > 0);
  for (const run of runs) {
    children.push({ type: "separator", name: KIND_LABELS[run.kind] });
    children.push(...nodes(run.pages));
  }

  return { name: "Docs", children };
}

export const docsLlms = llms(source, {
  // The files are served under the base the site is built for, so the links inside them are too.
  renderUrl: (item) => sitePath(item.url),
  renderPage: async (page) => `# ${page.data.title} (${sitePath(page.url)})

${await page.data.getText("processed")}`,
});
