// How a rail reads `trackLook` (`progressRail`, a slider's groove): one place that turns a track's
// groove and edge into the face and the `boxShadow` both draw with, so a bar and a slider never read
// the recipe apart.

import { colors, finish, insetEdge, stroke, tints } from "@shadcn-nsh/theme";

import type { Fill, TrackLook } from "./look";

/**
 * What a rail's groove paints, as a color: a finish's own face, a palette role, or a tint, and
 * `transparent` where the form draws no groove.
 */
export function railFace(look: TrackLook): string {
  if (look.groove === null) return "transparent";
  return painted(look.groove.fill);
}

/**
 * A rail's edge and shade, as `boxShadow`: the edge in the color of its own fill inside the shade
 * the groove hangs off, whichever of the two the form gives, and `undefined` where it draws
 * neither. A form names a width in the look's scales; an edge draws the control stroke, or the
 * number it states.
 */
export function railShadow(look: TrackLook): string | undefined {
  const { edge, groove } = look;
  const shade = groove?.shade ?? null;
  if (edge === null && shade === null) return undefined;
  const line = edge === null ? undefined : edgeColour(edge.fill);
  const width = edge !== null && typeof edge.width === "number" ? edge.width : stroke.control;
  const shadow = shade === null ? undefined : finish[shade].boxShadow;
  return insetEdge(line, shadow, width);
}

/** What a fill paints, as a color: a finish's own face, a palette role, or a tint. */
function painted(fill: Fill): string {
  switch (fill.kind) {
    case "finish":
      return finish[fill.role].backgroundColor ?? "transparent";
    case "colour":
      return colors[fill.role];
    case "tint":
      return tints[fill.role];
  }
}

/** What an edge painted by a fill takes as its color: a finish's own border, a palette role, or a tint. */
function edgeColour(fill: Fill): string {
  switch (fill.kind) {
    case "finish":
      return finish[fill.role].borderColor ?? colors.border;
    case "colour":
      return colors[fill.role];
    case "tint":
      return tints[fill.role];
  }
}
