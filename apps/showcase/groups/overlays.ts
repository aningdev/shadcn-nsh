// The Overlays group: what stands over the page for a moment — popovers, menus, tips, toasts.
import { AppWindow, Bell, Info, Menu, MousePointer2, PanelRight } from "lucide";

import { notBuilt, type DemoEntry } from "./entry";

/** The Overlays demos, in the index's order. */
export const overlays: DemoEntry[] = [
  {
    name: "Popover",
    detail: "A panel anchored to its trigger; a press outside, Escape or back closes it",
    icon: AppWindow,
    screen: notBuilt({
      name: "Popover",
      detail: "A panel anchored to its trigger; a press outside, Escape or back closes it",
    }),
  },
  {
    name: "HoverCard",
    detail:
      "People behind mentions, a link preview, a live stock quote, the delays tried, a card pinned open",
    icon: MousePointer2,
    screen: notBuilt({
      name: "HoverCard",
      detail:
        "People behind mentions, a link preview, a live stock quote, the delays tried, a card pinned open",
    }),
  },
  {
    name: "Menu",
    detail: "A menu bar, submenus, checkable items, context menus on rows, a scrolling menu",
    icon: Menu,
    screen: notBuilt({
      name: "Menu",
      detail: "A menu bar, submenus, checkable items, context menus on rows, a scrolling menu",
    }),
  },
  {
    name: "Tooltip",
    detail: "A label while the pointer rests on an element, or pinned by the app",
    icon: Info,
    screen: notBuilt({
      name: "Tooltip",
      detail: "A label while the pointer rests on an element, or pinned by the app",
    }),
  },
  {
    name: "Sheet",
    detail: "A panel at an edge, over a backdrop; a swipe, the backdrop, Escape or back closes it",
    icon: PanelRight,
    screen: notBuilt({
      name: "Sheet",
      detail:
        "A panel at an edge, over a backdrop; a swipe, the backdrop, Escape or back closes it",
    }),
  },
  {
    name: "Toast",
    detail: "Notes that close by themselves, by their action, back or a swipe",
    icon: Bell,
    screen: notBuilt({
      name: "Toast",
      detail: "Notes that close by themselves, by their action, back or a swipe",
    }),
  },
];
