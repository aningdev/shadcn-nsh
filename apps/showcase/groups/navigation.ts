// The Navigation group: what moves the user between places — a stack, tabs, pages, trees.
import {
  ChevronsDownUp,
  ChevronsRight,
  FolderTree,
  GalleryHorizontal,
  Layers,
  PanelTop,
  UnfoldVertical,
  Columns3,
} from "lucide";

import { lazy, type DemoEntry } from "./entry";

/** The Navigation demos, in the index's order. */
export const navigation: DemoEntry[] = [
  {
    name: "NavStack",
    detail: "Header options, modals, the back button, safe areas",
    icon: Layers,
    screen: lazy(() => import("../demos/nav-stack").then((m) => m.NavStackDemo)),
  },
  {
    name: "SplitView",
    detail:
      "Mailboxes, messages and a message in columns: a sidebar that hides, one column at a time on a phone, each column's pages kept",
    icon: Columns3,
    screen: lazy(() => import("../demos/split-view").then((m) => m.SplitViewDemo)),
  },
  {
    name: "Tabs",
    detail: "A section switcher, a disabled tab",
    icon: PanelTop,
    screen: lazy(() => import("../demos/tabs").then((m) => m.TabsDemo)),
  },
  {
    name: "Pagination",
    detail:
      "Search results with a count, a table footer with its page size, a compact pager, ten thousand pages with jump menus",
    icon: ChevronsRight,
    screen: lazy(() => import("../demos/pagination").then((m) => m.PaginationDemo)),
  },
  {
    name: "Accordion",
    detail:
      "An FAQ one answer at a time, settings sections open together, controls and an accordion inside",
    icon: ChevronsDownUp,
    screen: lazy(() => import("../demos/accordion").then((m) => m.AccordionDemo)),
  },
  {
    name: "Collapsible",
    detail: "Storage and advanced settings under their summaries",
    icon: UnfoldVertical,
    screen: lazy(() => import("../demos/collapsible").then((m) => m.CollapsibleDemo)),
  },
  {
    name: "Carousel",
    detail:
      "An onboarding stepped by its buttons, a product's photos with thumbnails, banners that roll on, cards three to a view, a ticker",
    icon: GalleryHorizontal,
    screen: lazy(() => import("../demos/carousel").then((m) => m.CarouselDemo)),
  },
  {
    name: "Tree",
    detail:
      "A project explorer, a settings sidebar, 10 100 items that stay fast, a read-only outline",
    icon: FolderTree,
    screen: lazy(() => import("../demos/tree").then((m) => m.TreeDemo)),
  },
];
