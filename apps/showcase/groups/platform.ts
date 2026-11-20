// The Platform group: The platform's APIs, behind this library's controls.
import {
  AppWindow,
  Bell,
  Command,
  Cpu,
  Database,
  Download,
  Inbox,
  Keyboard,
  Link2,
  SquareTerminal,
} from "lucide";

import { notBuilt, type DemoEntry } from "./entry";

/** The Platform demos, in the official gallery's order. */
export const platform: DemoEntry[] = [
  {
    name: "System",
    detail: "Status bar, alerts, action sheets, environment, timers, fetch",
    icon: Cpu,
    screen: notBuilt({
      name: "System",
      detail: "Status bar, alerts, action sheets, environment, timers, fetch",
    }),
  },
  {
    name: "Storage",
    detail: "nsh/storage: a launch count, a note saved as you type, the stored keys",
    icon: Database,
    screen: notBuilt({
      name: "Storage",
      detail: "nsh/storage: a launch count, a note saved as you type, the stored keys",
    }),
  },
  {
    name: "Updater",
    detail: "nsh/updater: ask for a newer version, download it, replace the app",
    icon: Download,
    screen: notBuilt({
      name: "Updater",
      detail: "nsh/updater: ask for a newer version, download it, replace the app",
    }),
  },
  {
    name: "Notifications",
    detail:
      "Asking for the permission, a notification shown, replaced and pressed, the badge on the app's icon",
    icon: Bell,
    screen: notBuilt({
      name: "Notifications",
      detail:
        "Asking for the permission, a notification shown, replaced and pressed, the badge on the app's icon",
    }),
  },
  {
    name: "URL scheme",
    detail: "UrlScheme: nsh-gallery:// links that open the app",
    icon: Link2,
    screen: notBuilt({
      name: "URL scheme",
      detail: "UrlScheme: nsh-gallery:// links that open the app",
    }),
  },
  {
    name: "Windows",
    detail:
      "A writing app's windows: a floating inspector, preferences, a command palette, the document on its own",
    icon: AppWindow,
    screen: notBuilt({
      name: "Windows",
      detail:
        "A writing app's windows: a floating inspector, preferences, a command palette, the document on its own",
    }),
  },
  {
    name: "Tray",
    detail: "nsh/desktop: an icon in the system tray with its tooltip, click and menu",
    icon: Inbox,
    screen: notBuilt({
      name: "Tray",
      detail: "nsh/desktop: an icon in the system tray with its tooltip, click and menu",
    }),
  },
  {
    name: "Global shortcut",
    detail: "nsh/desktop: a keystroke heard whichever app has the keyboard",
    icon: Command,
    screen: notBuilt({
      name: "Global shortcut",
      detail: "nsh/desktop: a keystroke heard whichever app has the keyboard",
    }),
  },
  {
    name: "Keyboard",
    detail: "Held arrows, modifier chords, capture bubbling and native Input ownership",
    icon: Keyboard,
    screen: notBuilt({
      name: "Keyboard",
      detail: "Held arrows, modifier chords, capture bubbling and native Input ownership",
    }),
  },
  {
    name: "Standard APIs",
    detail: "Files, processes, TCP, WebSockets, buffers, crypto and utilities",
    icon: SquareTerminal,
    screen: notBuilt({
      name: "Standard APIs",
      detail: "Files, processes, TCP, WebSockets, buffers, crypto and utilities",
    }),
  },
];
