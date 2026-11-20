// The Overlays group: what stands over the page for a moment — popovers, menus, tips, toasts.
import { AppWindow, Bell, Info, Menu, MousePointer2, PanelRight } from "lucide";

import { lazy, type DemoEntry } from "./entry";

/** The Overlays demos, in the index's order. */
export const overlays: DemoEntry[] = [
  {
    name: "Popover",
    detail: "A panel anchored to its trigger; a press outside, Escape or back closes it",
    icon: AppWindow,
    screen: lazy(() => import("../demos/popover").then((m) => m.PopoverDemo)),
  },
  {
    name: "HoverCard",
    detail:
      "People behind mentions, a link preview, a live stock quote, the delays tried, a card pinned open",
    icon: MousePointer2,
    screen: lazy(() => import("../demos/hover-card").then((m) => m.HoverCardDemo)),
  },
  {
    name: "Menu",
    detail: "A menu bar, submenus, checkable items, context menus on rows, a scrolling menu",
    icon: Menu,
    screen: lazy(() => import("../demos/menu").then((m) => m.MenuDemo)),
  },
  {
    name: "Tooltip",
    detail: "A label while the pointer rests on an element, or pinned by the app",
    icon: Info,
    screen: lazy(() => import("../demos/tooltip").then((m) => m.TooltipDemo)),
  },
  {
    name: "Sheet",
    detail: "A panel at an edge, over a backdrop; a swipe, the backdrop, Escape or back closes it",
    icon: PanelRight,
    screen: lazy(() => import("../demos/sheet").then((m) => m.SheetDemo)),
  },
  {
    name: "Toast",
    detail: "Notes that close by themselves, by their action, back or a swipe",
    icon: Bell,
    screen: lazy(() => import("../demos/toast").then((m) => m.ToastDemo)),
  },
];
