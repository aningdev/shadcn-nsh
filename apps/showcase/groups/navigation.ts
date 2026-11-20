// The Navigation group: what moves the user between places — a stack, tabs, pages, trees.
import {
  ChevronsDownUp,
  ChevronsRight,
  FolderTree,
  GalleryHorizontal,
  Layers,
  PanelTop,
  UnfoldVertical,
} from "lucide";

import { notBuilt, type DemoEntry } from "./entry";

/** The Navigation demos, in the index's order (SplitView is out: this library has none). */
export const navigation: DemoEntry[] = [
  {
    name: "NavStack",
    detail: "Header options, modals, the back button, safe areas",
    icon: Layers,
    screen: notBuilt({
      name: "NavStack",
      detail: "Header options, modals, the back button, safe areas",
    }),
  },
  {
    name: "Tabs",
    detail: "A section switcher, a disabled tab",
    icon: PanelTop,
    screen: notBuilt({ name: "Tabs", detail: "A section switcher, a disabled tab" }),
  },
  {
    name: "Pagination",
    detail:
      "Search results with a count, a table footer with its page size, a compact pager, ten thousand pages with jump menus",
    icon: ChevronsRight,
    screen: notBuilt({
      name: "Pagination",
      detail:
        "Search results with a count, a table footer with its page size, a compact pager, ten thousand pages with jump menus",
    }),
  },
  {
    name: "Accordion",
    detail:
      "An FAQ one answer at a time, settings sections open together, controls and an accordion inside",
    icon: ChevronsDownUp,
    screen: notBuilt({
      name: "Accordion",
      detail:
        "An FAQ one answer at a time, settings sections open together, controls and an accordion inside",
    }),
  },
  {
    name: "Collapsible",
    detail: "Storage and advanced settings under their summaries",
    icon: UnfoldVertical,
    screen: notBuilt({
      name: "Collapsible",
      detail: "Storage and advanced settings under their summaries",
    }),
  },
  {
    name: "Carousel",
    detail:
      "An onboarding stepped by its buttons, a product's photos with thumbnails, banners that roll on, cards three to a view, a ticker",
    icon: GalleryHorizontal,
    screen: notBuilt({
      name: "Carousel",
      detail:
        "An onboarding stepped by its buttons, a product's photos with thumbnails, banners that roll on, cards three to a view, a ticker",
    }),
  },
  {
    name: "Tree",
    detail:
      "A project explorer, a settings sidebar, 10 100 items that stay fast, a read-only outline",
    icon: FolderTree,
    screen: notBuilt({
      name: "Tree",
      detail:
        "A project explorer, a settings sidebar, 10 100 items that stay fast, a read-only outline",
    }),
  },
];
