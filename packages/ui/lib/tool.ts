// The inset track a toolbar and a toggle group share.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors, rounded, terminal, TERMINAL_GAP, shape, stroke } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

/** Options of `toolbarTrack`. */
export interface ToolbarTrackOptions {
  /** A column of tools (a `Toolbar`'s `axis="vertical"`). */
  vertical?: boolean;
}

/**
 * The inset track a toolbar or a `ToggleGroup` sits in: its tools in a row
 * (a column when `vertical`) 2 points apart, 3 points inside its edge, on
 * the inset with a hairline edge. A terminal sets each tool as its label
 * two columns apart and wraps a row too narrow for them.
 */
export function toolbarTrack(o?: ToolbarTrackOptions): ViewStyle {
  return {
    flexDirection: o?.vertical ? "column" : "row",
    alignItems: o?.vertical && terminal ? "flex-start" : "center",
    gap: terminal ? TERMINAL_GAP : 2,
    flexWrap: terminal && !o?.vertical ? "wrap" : undefined,
    padding: 3,
    ...rounded(shape.control),
    borderWidth: stroke.control,
    borderColor: colors.line,
    backgroundColor: colors.inset,
  };
}
