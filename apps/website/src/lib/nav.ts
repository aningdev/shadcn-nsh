import { components } from "./components";
import type { ComponentKindId } from "./kinds";

export type SidebarGroupId = "start" | "components";

export type SidebarPage = {
  /** Route, e.g. `/docs/components/button`. */
  route: string;
  title: string;
  group: SidebarGroupId;
  /** The kind a component page is listed under; the sidebar labels each run of them. */
  kind?: ComponentKindId;
  /** Route of the page this one is listed under. The sidebar folds those pages beneath it. */
  parent?: string;
};

/**
 * Flat docs pages in sidebar / pager order (NSH-style consecutive groups), one run per component
 * kind: the generated list is already in kind order, which is the index's order too.
 */
export const SIDEBAR_PAGES: SidebarPage[] = [
  {
    route: "/docs/getting-started",
    title: "Getting started",
    group: "start",
  },
  {
    route: "/docs/cli",
    title: "CLI",
    group: "start",
  },
  {
    route: "/docs/theme",
    title: "Theme",
    group: "start",
  },
  // The overview and each theme page are `.mdx`. A theme page's headings are markdown, so they
  // land in the table of contents; the rows are still drawn from the palette list.
  {
    route: "/docs/themes",
    title: "Themes",
    group: "start",
  },
  {
    route: "/docs/themes/default",
    title: "NSH Gallery",
    group: "start",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/shadcn",
    title: "shadcn",
    group: "start",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/solid-glass",
    title: "Solid Glass",
    group: "start",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/apple",
    title: "Apple",
    group: "start",
    parent: "/docs/themes",
  },
  {
    route: "/docs/customizing",
    title: "Customizing",
    group: "start",
  },
  {
    route: "/docs/icons",
    title: "Icons",
    group: "start",
  },
  {
    route: "/docs/components",
    title: "All components",
    group: "components",
  },
  {
    route: "/docs/components/coverage",
    title: "Coverage",
    group: "components",
  },
  ...components.map((c): SidebarPage => ({
    route: `/docs/components/${c.slug}`,
    title: c.title,
    group: "components",
    kind: c.kind,
  })),
];
