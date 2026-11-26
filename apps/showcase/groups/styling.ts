// The Styling group: Styles, Tailwind classes and patterns, in this library's theme.
import { Component, Palette, SwatchBook, Wind } from "lucide";

import { lazy, type DemoEntry } from "./entry";

/** The Styling demos, in the official gallery's order. */
export const styling: DemoEntry[] = [
  {
    name: "Styles",
    detail: "Corners, borders, shadows, clipping, 3D transforms",
    icon: Palette,
    screen: lazy(() => import("../demos/styles").then((m) => m.StylesDemo)),
  },
  {
    name: "Tailwind",
    detail: 'class="…" resolved natively: variants, grid, shadows, motion',
    icon: Wind,
    screen: lazy(() => import("../demos/tailwind").then((m) => m.TailwindDemo)),
  },
  {
    name: "Patterns",
    detail: "Press feedback, a sheet, layout animation, input accessory, dialog options",
    icon: Component,
    screen: lazy(() => import("../demos/patterns").then((m) => m.PatternsDemo)),
  },
  {
    name: "Theme Specimen",
    detail: "L1 paradigm, materials, and the theme-switch shader",
    icon: SwatchBook,
    screen: lazy(() => import("../demos/specimen").then((m) => m.SpecimenDemo)),
  },
];
