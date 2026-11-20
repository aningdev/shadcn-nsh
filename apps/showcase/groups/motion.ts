// The Motion group: Animation, gestures and physics.
import { Activity, Hand, Orbit, PanelTopClose } from "lucide";

import { lazy, type DemoEntry } from "./entry";

/** The Motion demos, in the official gallery's order. */
export const motion: DemoEntry[] = [
  {
    name: "Animations",
    detail: "Easing, sequence / parallel / stagger / loop, springs, interpolation",
    icon: Activity,
    screen: lazy(() => import("../demos/animations").then((m) => m.AnimationsDemo)),
  },
  {
    name: "Gestures",
    detail: "Pinch, rotate, press states, hit slop, pointer events",
    icon: Hand,
    screen: lazy(() => import("../demos/gestures").then((m) => m.GesturesDemo)),
  },
  {
    name: "Physics",
    detail: "Drags and springs on the UI thread",
    icon: Orbit,
    screen: lazy(() => import("../demos/physics").then((m) => m.PhysicsDemo)),
  },
  {
    name: "Collapsing header",
    detail: "A header that shrinks to a bar as the page scrolls, headings sticking below it",
    icon: PanelTopClose,
    screen: lazy(() => import("../demos/collapsing-header").then((m) => m.CollapsingHeaderDemo)),
  },
];
