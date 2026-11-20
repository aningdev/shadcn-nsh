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

import { lazy, type DemoEntry } from "./entry";

/** The Platform demos, in the official gallery's order. */
export const platform: DemoEntry[] = [
  {
    name: "System",
    detail: "Status bar, alerts, action sheets, environment, timers, fetch",
    icon: Cpu,
    screen: lazy(() => import("../demos/system").then((m) => m.SystemDemo)),
  },
  {
    name: "Storage",
    detail: "nsh/storage: a launch count, a note saved as you type, the stored keys",
    icon: Database,
    screen: lazy(() => import("../demos/storage").then((m) => m.StorageDemo)),
  },
  {
    name: "Updater",
    detail: "nsh/updater: ask for a newer version, download it, replace the app",
    icon: Download,
    screen: lazy(() => import("../demos/updater").then((m) => m.UpdaterDemo)),
  },
  {
    name: "Notifications",
    detail:
      "Asking for the permission, a notification shown, replaced and pressed, the badge on the app's icon",
    icon: Bell,
    screen: lazy(() => import("../demos/notifications").then((m) => m.NotificationsDemo)),
  },
  {
    name: "URL scheme",
    detail: "UrlScheme: nsh-gallery:// links that open the app",
    icon: Link2,
    screen: lazy(() => import("../demos/url-scheme").then((m) => m.UrlSchemeDemo)),
  },
  {
    name: "Windows",
    detail:
      "A writing app's windows: a floating inspector, preferences, a command palette, the document on its own",
    icon: AppWindow,
    screen: lazy(() => import("../demos/windows").then((m) => m.WindowsDemo)),
  },
  {
    name: "Tray",
    detail: "nsh/desktop: an icon in the system tray with its tooltip, click and menu",
    icon: Inbox,
    screen: lazy(() => import("../demos/tray").then((m) => m.TrayDemo)),
  },
  {
    name: "Global shortcut",
    detail: "nsh/desktop: a keystroke heard whichever app has the keyboard",
    icon: Command,
    screen: lazy(() => import("../demos/global-shortcut").then((m) => m.GlobalShortcutDemo)),
  },
  {
    name: "Keyboard",
    detail: "Held arrows, modifier chords, capture bubbling and native Input ownership",
    icon: Keyboard,
    screen: lazy(() => import("../demos/keyboard").then((m) => m.KeyboardDemo)),
  },
  {
    name: "Standard APIs",
    detail: "Files, processes, TCP, WebSockets, buffers, crypto and utilities",
    icon: SquareTerminal,
    screen: lazy(() => import("../demos/standard-apis").then((m) => m.StandardApisDemo)),
  },
];
