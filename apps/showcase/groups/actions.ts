// The Actions group: what starts work — a button, a link, a toggle, a bar of tools, a command.
// The details are the official gallery's; the screens are ours, built as this library's parts.
import { Command, Link, MousePointerClick, ToggleLeft, Wrench } from "lucide";

import { lazy, type DemoEntry } from "./entry";

/** The Actions demos, in the index's order. */
export const actions: DemoEntry[] = [
  {
    name: "Button",
    detail: "Kinds and sizes, icon buttons, work in progress, disabled with its reason",
    icon: MousePointerClick,
    screen: lazy(() => import("../demos/button").then((m) => m.ButtonDemo)),
  },
  {
    name: "Link",
    detail: "Links in a paragraph, a navigation the app routes, sites outside the app",
    icon: Link,
    screen: lazy(() => import("../demos/link").then((m) => m.LinkDemo)),
  },
  {
    name: "Toggle",
    detail: "A text toolbar, a segmented view switcher, a favorite star, a locked group",
    icon: ToggleLeft,
    screen: lazy(() => import("../demos/toggle").then((m) => m.ToggleDemo)),
  },
  {
    name: "Toolbar",
    detail:
      "A text editor's formatting bar, a media player's transport, a vertical tool palette, a locked review bar",
    icon: Wrench,
    screen: lazy(() => import("../demos/toolbar").then((m) => m.ToolbarDemo)),
  },
  {
    name: "Command",
    detail:
      "A mod+k palette in a dialog, an inline menu, 5 000 files that filter at every keystroke, a search the server answers",
    icon: Command,
    screen: lazy(() => import("../demos/command").then((m) => m.CommandDemo)),
  },
];
