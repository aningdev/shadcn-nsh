// How a rail reads a theme's groove slots (`trackLook`): one place that turns a track's groove and
// edge into the face and the `boxShadow` both draw with, so a bar and a slider never read the
// slots apart.

import { finish, insetEdge } from "@shadcn-nsh/theme";

import { type TrackLook, edged, painted } from "./look";

/** What a rail's groove paints, as a color, and `transparent` where the theme draws no groove. */
export function railFace(look: TrackLook): string {
  return look.groove === null ? "transparent" : painted(look.groove.fill);
}

/**
 * A rail's edge and shade, as `boxShadow`: the edge in the color of its own fill inside the shade
 * the groove hangs off, whichever of the two the theme gives, and `undefined` where it draws
 * neither.
 */
export function railShadow(look: TrackLook): string | undefined {
  const { edge, groove } = look;
  const shade = groove?.shade ?? null;
  if (edge === null && shade === null) return undefined;
  const line = edge === null ? undefined : edged(edge.fill);
  const width = edge?.width;
  const shadow = shade === null ? undefined : finish[shade].boxShadow;
  return insetEdge(line, shadow, width);
}
