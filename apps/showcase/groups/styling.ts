// The Styling group: Styles, Tailwind classes and patterns, in this library's theme.
import { Component, Palette, Wind } from "lucide";

import { notBuilt, type DemoEntry } from "./entry";

/** The Styling demos, in the official gallery's order. */
export const styling: DemoEntry[] = [
  {
    name: "Styles",
    detail: "Corners, borders, shadows, clipping, 3D transforms",
    icon: Palette,
    screen: notBuilt({
      name: "Styles",
      detail: "Corners, borders, shadows, clipping, 3D transforms",
    }),
  },
  {
    name: "Tailwind",
    detail: 'class="…" resolved natively: variants, grid, shadows, motion',
    icon: Wind,
    screen: notBuilt({
      name: "Tailwind",
      detail: 'class="…" resolved natively: variants, grid, shadows, motion',
    }),
  },
  {
    name: "Patterns",
    detail: "Press feedback, a sheet, layout animation, input accessory, dialog options",
    icon: Component,
    screen: notBuilt({
      name: "Patterns",
      detail: "Press feedback, a sheet, layout animation, input accessory, dialog options",
    }),
  },
];
