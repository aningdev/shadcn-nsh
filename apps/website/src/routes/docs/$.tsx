import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from "fumadocs-ui/layouts/docs/page";
import { ArrowUpRight } from "lucide-react";
import { Suspense, use, type ReactNode } from "react";

import { DemoPanel } from "@/components/fd/demo-panel";
import { useMDXComponents } from "@/components/fd/mdx";
import { getComponentBySlug } from "@/lib/components";
import { CONTENT_PATHS } from "@/lib/content-paths";
import { baseOptions, EDIT_BASE, SITE_TITLE } from "@/lib/layout.shared";
import { nshElementUrl, shadcnUrl } from "@/lib/official";
import { docs, pageTree, source } from "@/lib/source";

/** What the page loader returns; `useLoaderData` does not carry it through `head` as an argument. */
type PageData = {
  path: string;
  title: string;
  description?: string;
  markdownUrl: string;
  pageTree: Awaited<ReturnType<typeof source.serializePageTree>>;
};

/**
 * The demo sources, for the panel's Source tab: the same files the demos are packaged from, read
 * when the tab opens (`?raw`, lazily — the page's script should not carry every demo).
 */
const DEMO_SOURCES = import.meta.glob("../../../demos/*.tsx", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

export const Route = createFileRoute("/docs/$")({
  component: Page,
  head: ({ loaderData }) => {
    const page = loaderData as PageData | undefined;
    return {
      meta: page
        ? [
            { title: `${page.title} — ${SITE_TITLE}` },
            { name: "description", content: page.description ?? "" },
          ]
        : [],
    };
  },
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];
    // An unknown path is the router's not-found here: a static build has no server function
    // answer for a page it did not prerender (`content-paths.ts`).
    if (!CONTENT_PATHS.has(slugs.length === 0 ? "index.md" : `${slugs.join("/")}.md`)) {
      throw notFound();
    }
    const data = await loader({ data: slugs });
    if (!data) throw notFound();
    await docs.getPage(data.path)?.preload();
    return data;
  },
});

const loader = createServerFn({ method: "GET" })
  .validator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }): Promise<PageData | null> => {
    const page = source.getPage(slugs);
    // `null`, not `throw notFound()`: a static server function answers with a value, and the
    // router is the one that turns the miss into its not-found route.
    if (!page) return null;

    return {
      path: page.path,
      title: page.data.title,
      description: page.data.description,
      markdownUrl: `${page.url}.md`,
      pageTree: await source.serializePageTree(pageTree()),
    };
  });

/**
 * What a page shows around its markdown, none of it written in the `.md`: the title and the
 * description with links to the NSH element and the shadcn/ui component it answers to, then
 * straight away the Preview panel (a component page is read by looking at it first), then the
 * page's own sections. Behavior and the unstyled API are NSH's, one badge away.
 */
function Content({ path, markdownUrl }: { path: string; markdownUrl: string }) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  const { toc } = use(page.load());
  const MDX = page.body;

  const slug = /^components\/([^/]+)\.md$/.exec(path)?.[1];
  const componentDoc = page.component === true && slug ? getComponentBySlug(slug) : undefined;
  const shadcnHref = componentDoc?.shadcn ? shadcnUrl(componentDoc.shadcn) : undefined;
  const nshHref =
    componentDoc?.nshElement != null ? nshElementUrl(componentDoc.nshElement) : undefined;
  const demo = page.demo;
  // The page's own file, in the content folder the site reads.
  const editPath = `apps/website/content/docs/${path}`;

  return (
    <DocsPage toc={toc}>
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <div className="flex flex-wrap items-center gap-2">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        {nshHref ? <DocLink href={nshHref}>NSH</DocLink> : null}
        {shadcnHref ? <DocLink href={shadcnHref}>shadcn/ui</DocLink> : null}
      </div>
      <DocsBody>
        {demo ? (
          <div id="preview">
            <DemoPanel name={demo} loadSource={DEMO_SOURCES[`../../../demos/${demo}.tsx`]} />
          </div>
        ) : null}
        <MDX components={useMDXComponents()} />
        {editPath ? (
          <p className="text-sm">
            <a href={`${EDIT_BASE}${editPath}`} target="_blank" rel="noopener noreferrer">
              Edit this page on GitHub
            </a>
          </p>
        ) : null}
      </DocsBody>
    </DocsPage>
  );
}

function Page() {
  const data = Route.useLoaderData() as PageData;
  const { pageTree: tree, path, markdownUrl } = useFumadocsLoader(data);

  return (
    <DocsLayout {...baseOptions()} tree={tree}>
      <Suspense>
        <Content path={path} markdownUrl={markdownUrl} />
      </Suspense>
    </DocsLayout>
  );
}

/** A link to the page a component answers to elsewhere, as shadcn's docs show Radix's: a small
 * badge beside the copy button. */
function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium no-underline"
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-3" />
    </a>
  );
}
