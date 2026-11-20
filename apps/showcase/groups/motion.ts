// The Motion group: Animation, gestures and physics.
import { Activity, Hand, Orbit, PanelTopClose } from "lucide";

import { notBuilt, type DemoEntry } from "./entry";

/** The Motion demos, in the official gallery's order. */
export const motion: DemoEntry[] = [
  {
    name: "Animations",
    detail: "Easing, sequence / parallel / stagger / loop, springs, interpolation",
    icon: Activity,
    screen: notBuilt({
      name: "Animations",
      detail: "Easing, sequence / parallel / stagger / loop, springs, interpolation",
    }),
  },
  {
    name: "Gestures",
    detail: "Pinch, rotate, press states, hit slop, pointer events",
    icon: Hand,
    screen: notBuilt({
      name: "Gestures",
      detail: "Pinch, rotate, press states, hit slop, pointer events",
    }),
  },
  {
    name: "Physics",
    detail: "Drags and springs on the UI thread",
    icon: Orbit,
    screen: notBuilt({ name: "Physics", detail: "Drags and springs on the UI thread" }),
  },
  {
    name: "Collapsing header",
    detail: "A header that shrinks to a bar as the page scrolls, headings sticking below it",
    icon: PanelTopClose,
    screen: notBuilt({
      name: "Collapsing header",
      detail: "A header that shrinks to a bar as the page scrolls, headings sticking below it",
    }),
  },
];
