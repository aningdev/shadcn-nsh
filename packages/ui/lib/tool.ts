// The inset track a toolbar and a toggle group share.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, radius, rounded, terminal, TERMINAL_GAP } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

// @port look/tool.ts
/** Options of `toolbarTrack`. */
export interface ToolbarTrackOptions {
  /** A column of tools (a `Toolbar`'s `axis="vertical"`). */
  vertical?: boolean;
}

/**
 * The inset track a toolbar or a `ToggleGroup` sits in: its tools in a row
 * (a column when `vertical`) 2 points apart, 3 points inside its edge, on
 * the inset with the border's edge. A terminal sets each tool as its label
 * two columns apart and wraps a row too narrow for them.
 */
export function toolbarTrack(o?: ToolbarTrackOptions): ViewStyle {
  return {
    flexDirection: o?.vertical ? "column" : "row",
    alignItems: o?.vertical && terminal ? "flex-start" : "center",
    gap: terminal ? TERMINAL_GAP : 2,
    flexWrap: terminal && !o?.vertical ? "wrap" : undefined,
    padding: 3,
    ...rounded(radius.inset),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inset,
  };
}
// @port end
