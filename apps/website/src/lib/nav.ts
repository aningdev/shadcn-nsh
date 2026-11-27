import { components } from "./components";
import type { ComponentKindId } from "./kinds";

export type SidebarGroupId = "start" | "theming" | "components";

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
 * Flat docs pages in sidebar / pager order. Get started, then theming (the theme pages stay
 * immediately under Themes, in palette order), then the components one run per kind.
 */
export const SIDEBAR_PAGES: SidebarPage[] = [
  {
    route: "/docs/getting-started",
    title: "Getting started",
    group: "start",
  },
  {
    route: "/docs/architecture",
    title: "Architecture",
    group: "start",
  },
  {
    route: "/docs/cli",
    title: "CLI",
    group: "start",
  },
  {
    route: "/docs/icons",
    title: "Icons",
    group: "start",
  },
  // The overview and each theme page are `.mdx`. A theme page's headings are markdown, so they
  // land in the table of contents; the rows are still drawn from the palette list.
  {
    route: "/docs/themes",
    title: "Themes",
    group: "theming",
  },
  {
    route: "/docs/themes/nsh-gallery",
    title: "NSH Gallery",
    group: "theming",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/shadcn",
    title: "shadcn/ui",
    group: "theming",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/solid-glass",
    title: "Solid Glass",
    group: "theming",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/apple",
    title: "Apple",
    group: "theming",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/material",
    title: "Material",
    group: "theming",
    parent: "/docs/themes",
  },
  {
    route: "/docs/themes/winui",
    title: "WinUI 3",
    group: "theming",
    parent: "/docs/themes",
  },
  {
    route: "/docs/theme",
    title: "Theme specification",
    group: "theming",
  },
  {
    route: "/docs/customizing",
    title: "Customizing",
    group: "theming",
  },
  {
    route: "/docs/components",
    title: "All components",
    group: "components",
  },
  ...components.map((c): SidebarPage => ({
    route: `/docs/components/${c.slug}`,
    title: c.title,
    group: "components",
    kind: c.kind,
  })),
];
