// A toggle group: `nsh/base`'s ToggleGroup in the inset track of `toolbarTrack`.
// The track look lives in `toolbar.tsx` (from look/tool.ts); this file is the shell only.
import { colors } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { split } from "nsh";
import {
  ToggleGroup as BaseToggleGroup,
  type ToggleGroupProps as BaseToggleGroupProps,
} from "nsh/base";

import { toolbarTrack } from "./toolbar";

/**
 * `nsh/base`'s ToggleGroup. Every base prop passes through; `style` goes over the look's.
 * Put `Toggle`s inside; they keep their own look. Default `inset` wears `toolbarTrack`; set
 * `inset={false}` inside a `Toolbar` that already has the track.
 */
export type ToggleGroupProps = BaseToggleGroupProps & {
  /** A column of toggles (default a row). */
  vertical?: boolean;
  /** Default true: the inset track. False inside a Toolbar that already has the track. */
  inset?: boolean;
};

/** Tools in a row (or column), matching `toolbarTrack`'s gap when not inset. */
function groupChrome(vertical?: boolean): ViewStyle {
  return {
    flexDirection: vertical ? "column" : "row",
    alignItems: "center",
    gap: 2,
  };
}

/**
 * `toolbarTrack` with live color reads. The ported helper snapshots `colors.*` into a plain
 * object; on ToggleGroup that snapshot stayed light under a dark scheme in port:render, so the
 * shell re-reads the tokens where the style is applied (as `switchLook`'s getters do).
 */
function insetTrack(vertical?: boolean): ViewStyle {
  const base = toolbarTrack({ vertical });
  return {
    ...base,
    get backgroundColor() {
      return colors.inset;
    },
    get borderColor() {
      return colors.border;
    },
  };
}

/** The track holding a row (or column) of toggles. */
export function ToggleGroup(props: ToggleGroupProps) {
  const [, rest] = split(props, ["style", "vertical", "inset"]);
  const look = props.inset === false ? groupChrome(props.vertical) : insetTrack(props.vertical);
  return <BaseToggleGroup {...rest} style={[look, props.style ?? null]} />;
}

export { Toggle, type ToggleProps, type ToggleSize } from "./toggle";
